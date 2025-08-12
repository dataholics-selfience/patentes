import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  addDoc,
  orderBy 
} from 'firebase/firestore';
import { db } from '../firebase';
import { ConsultaCompleta } from '../types';
import { getSerpKeyManager } from './serpKeyManager';

export interface MonitoringConfig {
  id: string;
  consultaId: string;
  userId: string;
  intervalHours: number;
  isActive: boolean;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt: string;
  runCount: number;
  originalConsulta: {
    nome_comercial: string;
    nome_molecula: string;
    categoria: string;
    beneficio: string;
    doenca_alvo: string;
    pais_alvo: string[];
    userCompany: string;
    sessionId: string;
    environment: 'production' | 'test';
  };
}


export class MonitoringManager {
  private static activeTimers: Map<string, NodeJS.Timeout> = new Map();

  // Agendar monitoramento para uma consulta
  static async scheduleMonitoring(
    consultaId: string,
    userId: string,
    intervalHours: number,
    originalConsulta: MonitoringConfig['originalConsulta']
  ): Promise<void> {
    try {
      const now = new Date();
      const nextRun = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);

      const monitoringConfig: Omit<MonitoringConfig, 'id'> = {
        consultaId,
        userId,
        intervalHours,
        isActive: true,
        createdAt: now.toISOString(),
        nextRunAt: nextRun.toISOString(),
        runCount: 0,
        originalConsulta
      };

      // Salvar configuração no Firestore
      await setDoc(doc(db, 'monitoringConfigs', consultaId), monitoringConfig);

      // Agendar primeira execução
      this.scheduleNextRun(consultaId, intervalHours);

      console.log(`✅ Monitoramento agendado para consulta ${consultaId} a cada ${intervalHours}h`);
    } catch (error) {
      console.error('Erro ao agendar monitoramento:', error);
      throw error;
    }
  }

  // Parar monitoramento
  static async stopMonitoring(consultaId: string): Promise<void> {
    try {
      // Cancelar timer ativo
      const timer = this.activeTimers.get(consultaId);
      if (timer) {
        clearTimeout(timer);
        this.activeTimers.delete(consultaId);
      }

      // Atualizar configuração no Firestore
      await updateDoc(doc(db, 'monitoringConfigs', consultaId), {
        isActive: false,
        stoppedAt: new Date().toISOString()
      });

      console.log(`🛑 Monitoramento parado para consulta ${consultaId}`);
    } catch (error) {
      console.error('Erro ao parar monitoramento:', error);
      throw error;
    }
  }

  // Obter configuração de monitoramento
  static async getMonitoring(consultaId: string): Promise<MonitoringConfig | null> {
    try {
      const monitoringDoc = await getDoc(doc(db, 'monitoringConfigs', consultaId));
      if (monitoringDoc.exists()) {
        return { id: monitoringDoc.id, ...monitoringDoc.data() } as MonitoringConfig;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar configuração de monitoramento:', error);
      return null;
    }
  }

  // Obter todos os monitoramentos ativos de um usuário
  static async getActiveMonitorings(userId: string): Promise<MonitoringConfig[]> {
    try {
      const q = query(
        collection(db, 'monitoringConfigs'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MonitoringConfig[];
    } catch (error) {
      console.error('Erro ao buscar monitoramentos ativos:', error);
      return [];
    }
  }


  // Executar reconsulta
  static async executeReconsulta(monitoringConfig: MonitoringConfig): Promise<void> {
    try {
      console.log(`🔄 Executando reconsulta para ${monitoringConfig.consultaId}`);

      // Obter chave SERP disponível
      const manager = getSerpKeyManager();
      if (!manager || !manager.hasAvailableCredits()) {
        console.error('❌ Nenhuma chave SERP disponível para reconsulta');
        return;
      }

      const availableKey = manager.getAvailableKey();
      if (!availableKey) {
        console.error('❌ Falha ao obter chave SERP para reconsulta');
        return;
      }

      // Buscar dados completos da consulta original
      const originalConsultaDoc = await getDoc(doc(db, 'consultas', monitoringConfig.consultaId));
      if (!originalConsultaDoc.exists()) {
        console.error('❌ Consulta original não encontrada');
        return;
      }

      const originalConsultaData = originalConsultaDoc.data();
      
      // Preparar dados completos da consulta original para o webhook de monitoramento
      const monitoringData = {
        // Dados originais da consulta
        cliente: monitoringConfig.originalConsulta.userCompany,
        sessionId: monitoringConfig.originalConsulta.sessionId,
        nome_comercial: monitoringConfig.originalConsulta.nome_comercial,
        nome_molecula: monitoringConfig.originalConsulta.nome_molecula,
        categoria: monitoringConfig.originalConsulta.categoria,
        beneficio: monitoringConfig.originalConsulta.beneficio,
        doenca_alvo: monitoringConfig.originalConsulta.doenca_alvo,
        pais_alvo: monitoringConfig.originalConsulta.pais_alvo,
        
        // Dados completos da consulta original
        consulta_original: {
          id: monitoringConfig.consultaId,
          userId: originalConsultaData.userId,
          userEmail: originalConsultaData.userEmail,
          userName: originalConsultaData.userName,
          userCompany: originalConsultaData.userCompany,
          resultado: originalConsultaData.resultado,
          isDashboard: originalConsultaData.isDashboard,
          consultedAt: originalConsultaData.consultedAt,
          environment: originalConsultaData.environment,
          webhookResponseTime: originalConsultaData.webhookResponseTime
        },
        
        // Metadados do monitoramento
        monitoramento: {
          runCount: monitoringConfig.runCount + 1,
          intervalHours: monitoringConfig.intervalHours,
          lastRunAt: monitoringConfig.lastRunAt,
          createdAt: monitoringConfig.createdAt
        },
        
        // Chave SERP para a nova consulta
        serpApiKey: availableKey
      };

      console.log('🚀 Enviando dados completos para webhook de monitoramento:', monitoringData);

      // URL do webhook de monitoramento baseada no ambiente da consulta original
      const webhookUrl = monitoringConfig.originalConsulta.environment === 'production' 
        ? 'https://primary-production-2e3b.up.railway.app/webhook/patentesdev-monitor'
        : 'https://primary-production-2e3b.up.railway.app/webhook-test/patentesdev-monitor';

      console.log(`🌐 Usando webhook de monitoramento: ${webhookUrl}`);

      // Enviar dados para webhook de monitoramento
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(monitoringData)
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook de monitoramento: ${response.status} ${response.statusText}`);
      }

      const webhookResponse = await response.json();
      console.log('✅ Resposta do webhook de monitoramento recebida:', webhookResponse);

      // Registrar uso da chave SERP
      manager.recordUsage(
        availableKey,
        monitoringConfig.userId,
        `${monitoringConfig.originalConsulta.nome_comercial} (monitoramento automático)`
      );

      // Salvar nova consulta de monitoramento
      const novaConsultaData: Omit<ConsultaCompleta, 'id'> = {
        userId: monitoringConfig.userId,
        userEmail: originalConsultaData.userEmail || '',
        userName: originalConsultaData.userName || '',
        userCompany: monitoringConfig.originalConsulta.userCompany,
        
        // Dados de input
        nome_comercial: monitoringConfig.originalConsulta.nome_comercial,
        nome_molecula: monitoringConfig.originalConsulta.nome_molecula,
        categoria: monitoringConfig.originalConsulta.categoria,
        beneficio: monitoringConfig.originalConsulta.beneficio,
        doenca_alvo: monitoringConfig.originalConsulta.doenca_alvo,
        pais_alvo: monitoringConfig.originalConsulta.pais_alvo,
        
        // Metadados
        sessionId: monitoringConfig.originalConsulta.sessionId,
        environment: monitoringConfig.originalConsulta.environment,
        serpApiKey: availableKey.substring(0, 12) + '...',
        
        // Resultado
        resultado: webhookResponse,
        isDashboard: this.isDashboardData(webhookResponse),
        
        // Timestamps
        consultedAt: new Date().toISOString(),
        webhookResponseTime: 0 // Será calculado se necessário
      };

      await addDoc(collection(db, 'consultas'), novaConsultaData);

      // Atualizar configuração de monitoramento
      const now = new Date();
      const nextRun = new Date(now.getTime() + monitoringConfig.intervalHours * 60 * 60 * 1000);
      
      await updateDoc(doc(db, 'monitoringConfigs', monitoringConfig.consultaId), {
        lastRunAt: now.toISOString(),
        nextRunAt: nextRun.toISOString(),
        runCount: monitoringConfig.runCount + 1
      });

      // Agendar próxima execução
      this.scheduleNextRun(monitoringConfig.consultaId, monitoringConfig.intervalHours);

      console.log(`✅ Monitoramento ${monitoringConfig.runCount + 1} executado e próximo agendado`);

    } catch (error) {
      console.error('❌ Erro na execução do monitoramento:', error);
      
      // Reagendar para tentar novamente em 1 hora  
      console.log('🔄 Reagendando monitoramento devido ao erro...');
      this.scheduleNextRun(monitoringConfig.consultaId, 1);
    }
  }

  // Agendar próxima execução
  private static scheduleNextRun(consultaId: string, intervalHours: number): void {
    // Cancelar timer existente se houver
    const existingTimer = this.activeTimers.get(consultaId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Agendar nova execução
    const timer = setTimeout(async () => {
      try {
        const monitoringConfig = await this.getMonitoring(consultaId);
        if (monitoringConfig && monitoringConfig.isActive) {
          await this.executeReconsulta(monitoringConfig);
        }
      } catch (error) {
        console.error('Erro na execução agendada:', error);
      }
    }, intervalHours * 60 * 60 * 1000);

    this.activeTimers.set(consultaId, timer);
    console.log(`⏰ Próxima execução agendada para ${consultaId} em ${intervalHours}h`);
  }

  // Inicializar monitoramentos agendados (chamado na inicialização da app)
  static async initializeScheduledMonitorings(userId: string): Promise<void> {
    try {
      console.log('🔄 Inicializando monitoramentos agendados...');
      
      const activeMonitorings = await this.getActiveMonitorings(userId);
      const now = new Date();

      for (const monitoring of activeMonitorings) {
        const nextRunTime = new Date(monitoring.nextRunAt);
        
        if (nextRunTime <= now) {
          // Execução em atraso - executar imediatamente
          console.log(`⚡ Executando monitoramento em atraso: ${monitoring.consultaId}`);
          await this.executeReconsulta(monitoring);
        } else {
          // Agendar para o horário correto
          const timeUntilNext = nextRunTime.getTime() - now.getTime();
          const hoursUntilNext = Math.ceil(timeUntilNext / (60 * 60 * 1000));
          
          console.log(`⏰ Reagendando monitoramento ${monitoring.consultaId} para ${hoursUntilNext}h`);
          this.scheduleNextRun(monitoring.consultaId, hoursUntilNext);
        }
      }

      console.log(`✅ ${activeMonitorings.length} monitoramentos inicializados`);
    } catch (error) {
      console.error('❌ Erro ao inicializar monitoramentos:', error);
    }
  }

  // Verificar se dados são de dashboard
  private static isDashboardData(rawResponse: any): boolean {
    try {
      let parsedData: any = null;
      
      if (Array.isArray(rawResponse) && rawResponse.length > 0) {
        if (rawResponse[0].output) {
          if (typeof rawResponse[0].output === 'string') {
            const cleanOutput = rawResponse[0].output
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();
            
            try {
              parsedData = JSON.parse(cleanOutput);
            } catch {
              return false;
            }
          } else {
            parsedData = rawResponse[0].output;
          }
        }
      } else if (typeof rawResponse === 'string') {
        const cleanString = rawResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        
        try {
          parsedData = JSON.parse(cleanString);
        } catch {
          return false;
        }
      } else if (typeof rawResponse === 'object' && rawResponse !== null) {
        parsedData = rawResponse;
      }
      
      return !!(parsedData?.produto_proposto || parsedData?.score_oportunidade?.valor || parsedData?.consulta?.cliente);
    } catch {
      return false;
    }
  }

  // Limpar todos os timers (para cleanup)
  static clearAllTimers(): void {
    this.activeTimers.forEach((timer) => {
      clearTimeout(timer);
    });
    this.activeTimers.clear();
    console.log('🧹 Todos os timers de monitoramento foram limpos');
  }

  // Obter estatísticas de monitoramento
  static async getMonitoringStats(userId: string): Promise<{
    totalMonitorings: number;
    activeMonitorings: number;
    totalReconsultas: number;
    monitoringsToday: number;
  }> {
    try {
      const q = query(
        collection(db, 'monitoringConfigs'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const monitorings = querySnapshot.docs.map(doc => doc.data()) as MonitoringConfig[];
      
      const totalMonitorings = monitorings.length;
      const activeMonitorings = monitorings.filter(m => m.isActive).length;
      const totalReconsultas = monitorings.reduce((sum, m) => sum + m.runCount, 0);
      
      // Monitoramentos criados hoje
      const today = new Date().toDateString();
      const monitoringsToday = monitorings.filter(m => 
        new Date(m.createdAt).toDateString() === today
      ).length;
      
      return {
        totalMonitorings,
        activeMonitorings,
        totalReconsultas,
        monitoringsToday
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas de monitoramento:', error);
      return {
        totalMonitorings: 0,
        activeMonitorings: 0,
        totalReconsultas: 0,
        monitoringsToday: 0
      };
    }
  }
}

// Cleanup quando a página for fechada
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    MonitoringManager.clearAllTimers();
  });
}