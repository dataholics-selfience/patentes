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
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../firebase';
import { ConsultaCompleta } from '../types';
import { getSerpKeyManager } from './serpKeyManager';

// Configuração da Evolution API para WhatsApp
const EVOLUTION_API_CONFIG = {
  baseUrl: 'https://evolution-api-production-f719.up.railway.app',
  instanceKey: '215D70C6CC83-4EE4-B55A-DE7D4146CBF1'
};

// Função para formatar telefone para Evolution API
const formatPhoneForEvolution = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.startsWith('55')) {
    return cleanPhone;
  } else if (cleanPhone.length === 11) {
    return '55' + cleanPhone;
  } else if (cleanPhone.length === 10) {
    return '55' + cleanPhone;
  }
  
  return cleanPhone;
};

// Função para enviar WhatsApp via Evolution API
const sendWhatsAppNotification = async (
  phone: string, 
  productName: string, 
  productProposal: any,
  consultaId: string
): Promise<boolean> => {
  try {
    const formattedPhone = formatPhoneForEvolution(phone);
    
    if (!formattedPhone || formattedPhone.length < 10) {
      console.error('Número de telefone inválido:', phone);
      return false;
    }

    // Extrair dados do mercado_alvo
    const mercadoAlvo = productProposal.mercado_alvo?.segmentos?.join(', ') || 'Não especificado';
    const beneficio = productProposal.beneficio || 'Não especificado';
    const tipo = productProposal.tipo || 'Produto';
    
    const message = `🔬 *Consulta de Patentes - Atualização de Monitoramento*

Olá! Detectamos uma atualização no monitoramento do produto *${productName}*.

📋 *Novo Produto Proposto:*
• Nome: ${productProposal.nome_sugerido || 'Não especificado'}
• Tipo: ${tipo}
• Benefício: ${beneficio}
• Mercado Alvo: ${mercadoAlvo}

🔗 *Ver análise completa:*
${window.location.origin}/dashboard

⚡ Esta é uma notificação automática do seu monitoramento de patentes.

---
*Consulta de Patentes - Monitoramento Inteligente*`;

    const evolutionPayload = {
      number: formattedPhone,
      text: message
    };

    console.log('📱 Enviando notificação WhatsApp:', {
      phone: formattedPhone,
      productName,
      consultaId
    });

    const response = await fetch(
      `${EVOLUTION_API_CONFIG.baseUrl}/message/sendText/${EVOLUTION_API_CONFIG.instanceKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': EVOLUTION_API_CONFIG.instanceKey
        },
        body: JSON.stringify(evolutionPayload)
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      console.log('✅ WhatsApp enviado com sucesso:', responseData);
      return true;
    } else {
      const errorText = await response.text();
      console.error('❌ Erro na Evolution API:', errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar WhatsApp:', error);
    return false;
  }
};

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
  private static lastExecutionTimes: Map<string, number> = new Map();

  // Agendar monitoramento para uma consulta
  static async scheduleMonitoring(
    consultaId: string,
    userId: string,
    intervalHours: number,
    originalConsulta: MonitoringConfig['originalConsulta']
  ): Promise<void> {
    try {
      const now = new Date();
      // Converter horas para milissegundos com precisão
      const intervalMs = Math.round(intervalHours * 60 * 60 * 1000);
      const finalIntervalMs = Math.max(intervalMs, 60000); // Mínimo 1 minuto
      const nextRun = new Date(now.getTime() + finalIntervalMs);

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
      this.scheduleNextRun(consultaId, Math.max(intervalHours, 0.0167)); // Mínimo 1 minuto

      console.log(`✅ Monitoramento agendado para consulta ${consultaId} a cada ${intervalHours}h (${finalIntervalMs}ms)`);
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
      // Verificar se já foi executado recentemente (evitar spam)
      const lastExecution = this.lastExecutionTimes.get(monitoringConfig.consultaId);
      const now = Date.now();
      const minInterval = 60000; // Mínimo 1 minuto entre execuções
      
      if (lastExecution && (now - lastExecution) < minInterval) {
        console.log(`⏳ Execução muito recente para ${monitoringConfig.consultaId}, aguardando...`);
        return;
      }
      
      // Registrar tempo de execução
      this.lastExecutionTimes.set(monitoringConfig.consultaId, now);
      
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
      
      // Buscar as últimas 5 consultas do usuário
      const lastConsultasQuery = query(
        collection(db, 'consultas'),
        where('userId', '==', monitoringConfig.userId),
        orderBy('consultedAt', 'desc'),
        limit(5)
      );
      
      const lastConsultasSnapshot = await getDocs(lastConsultasQuery);
      const lastConsultas = lastConsultasSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
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
        
        // SessionId do usuário
        userSessionId: monitoringConfig.originalConsulta.sessionId,
        
        // Últimas 5 consultas na íntegra
        ultimas_consultas: lastConsultas.map(consulta => ({
          id: consulta.id,
          consultedAt: consulta.consultedAt,
          resultado: consulta.resultado,
          isDashboard: consulta.isDashboard
        })),
        
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
      const webhookUrl = monitoringConfig.originalConsulta.environment === 'test' 
        ? 'https://primary-production-2e3b.up.railway.app/webhook-test/patentesdev-monitor'
        : 'https://primary-production-2e3b.up.railway.app/webhook/patentesdev-monitor';

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

      // Ler resposta como texto primeiro para verificar se está vazia
      const responseText = await response.text();
      
      if (!responseText || responseText.trim() === '') {
        throw new Error('Webhook retornou resposta vazia');
      }
      
      let webhookResponse: any;
      try {
        webhookResponse = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Webhook retornou JSON inválido: ${parseError instanceof Error ? parseError.message : 'Erro desconhecido'}`);
      }
      
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

      // Enviar notificação WhatsApp se há produto proposto
      try {
        const productProposal = this.extractProductProposal(webhookResponse);
        if (productProposal) {
          // Buscar telefone do usuário
          const userDoc = await getDoc(doc(db, 'users', monitoringConfig.userId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userPhone = userData.phone;
            
            if (userPhone) {
              const productName = `${monitoringConfig.originalConsulta.nome_comercial} (${monitoringConfig.originalConsulta.nome_molecula})`;
              
              const whatsappSent = await sendWhatsAppNotification(
                userPhone,
                productName,
                productProposal,
                monitoringConfig.consultaId
              );
              
              if (whatsappSent) {
                console.log('✅ Notificação WhatsApp enviada com sucesso');
              } else {
                console.warn('⚠️ Falha ao enviar notificação WhatsApp');
              }
            } else {
              console.warn('⚠️ Usuário não possui telefone cadastrado para notificação');
            }
          }
        }
      } catch (whatsappError) {
        console.error('❌ Erro ao enviar notificação WhatsApp:', whatsappError);
        // Não interromper o fluxo principal por erro no WhatsApp
      }

      // Atualizar configuração de monitoramento
      const currentTime = new Date();
      // Converter horas para milissegundos com precisão e respeitar intervalos específicos
      let intervalMs = Math.round(monitoringConfig.intervalHours * 60 * 60 * 1000);
      
      // Para intervalos de 10 minutos, garantir exatamente 10 minutos
      if (monitoringConfig.intervalHours === 0.1667) {
        intervalMs = 10 * 60 * 1000; // Exatamente 10 minutos
      }
      
      const finalIntervalMs = Math.max(intervalMs, 60000);
      const nextRun = new Date(currentTime.getTime() + finalIntervalMs);
      
      await updateDoc(doc(db, 'monitoringConfigs', monitoringConfig.consultaId), {
        lastRunAt: currentTime.toISOString(),
        nextRunAt: nextRun.toISOString(),
        runCount: monitoringConfig.runCount + 1
      });

      // Agendar próxima execução
      this.scheduleNextRun(monitoringConfig.consultaId, monitoringConfig.intervalHours);

      console.log(`✅ Monitoramento ${monitoringConfig.runCount + 1} executado e próximo agendado em ${Math.round(finalIntervalMs/60000)} minutos`);

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

    // Converter horas para milissegundos com precisão e garantir mínimo
    let intervalMs = Math.round(intervalHours * 60 * 60 * 1000);
    
    // Para intervalos de 10 minutos, garantir exatamente 10 minutos
    if (intervalHours === 0.1667) { // 10 minutos
      intervalMs = 10 * 60 * 1000; // Exatamente 10 minutos
    }
    
    // Garantir mínimo de 1 minuto para outros intervalos
    const finalIntervalMs = Math.max(intervalMs, 60000);

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
    }, finalIntervalMs);

    this.activeTimers.set(consultaId, timer);
    console.log(`⏰ Próxima execução agendada para ${consultaId} em ${intervalHours}h (${finalIntervalMs}ms = ${Math.round(finalIntervalMs/60000)} minutos)`);
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
          // Aguardar um pouco para evitar execuções simultâneas
          setTimeout(() => this.executeReconsulta(monitoring), Math.random() * 5000);
        } else {
          // Agendar para o horário correto
          const timeUntilNext = nextRunTime.getTime() - now.getTime();
          const hoursUntilNext = Math.max(timeUntilNext / (60 * 60 * 1000), 0.0167);
          
          console.log(`⏰ Reagendando monitoramento ${monitoring.consultaId} para ${hoursUntilNext.toFixed(4)}h`);
          this.scheduleNextRun(monitoring.consultaId, hoursUntilNext);
        }
      }

      console.log(`✅ ${activeMonitorings.length} monitoramentos inicializados`);
    } catch (error) {
      console.error('❌ Erro ao inicializar monitoramentos:', error);
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

  // Extrair produto proposto da resposta
  private static extractProductProposal(webhookResponse: any): any {
    try {
      let parsedData = webhookResponse;
      
      // Se for array, pegar o primeiro item
      if (Array.isArray(webhookResponse) && webhookResponse.length > 0) {
        if (webhookResponse[0].output) {
          if (typeof webhookResponse[0].output === 'string') {
            const cleanOutput = webhookResponse[0].output
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();
            try {
              parsedData = JSON.parse(cleanOutput);
            } catch {
              return null;
            }
          } else {
            parsedData = webhookResponse[0].output;
          }
        }
      } else if (typeof webhookResponse === 'string') {
        const cleanString = webhookResponse
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();
        try {
          parsedData = JSON.parse(cleanString);
        } catch {
          return null;
        }
      } else if (typeof webhookResponse === 'object' && webhookResponse !== null) {
        parsedData = webhookResponse;
      }
      
      return parsedData?.produto_proposto || null;
    } catch (error) {
      console.error('Erro ao extrair produto proposto:', error);
      return null;
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