import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface ConsultaData {
  id?: string;
  userId: string;
  userEmail: string;
  empresa: string;
  nome_comercial: string;
  nome_molecula: string;
  categoria: string;
  beneficio: string;
  doenca_alvo: string;
  pais_alvo: string[];
  sessionId: string;
  consultaNumero: number;
  isReconsulta: boolean;
  consultaOriginalId?: string;
  produto_proposto?: string;
  webhookResponse?: any;
  consultedAt: string;
  nextReconsultaAt?: string;
}

export class ConsultationMonitor {
  private static RECONSULTA_INTERVAL = 10 * 60 * 1000; // 10 minutos em ms
  private static timers: Map<string, NodeJS.Timeout> = new Map();

  // Salvar consulta na collection "consultas"
  static async saveConsulta(consultaData: Omit<ConsultaData, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, 'consultas'), consultaData);
      console.log('✅ Consulta salva:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao salvar consulta:', error);
      throw error;
    }
  }

  // Buscar consultas de um produto específico
  static async getConsultasByProduct(userId: string, nomeComercial: string, nomeMolecula: string): Promise<ConsultaData[]> {
    try {
      const q = query(
        collection(db, 'consultas'),
        where('userId', '==', userId),
        where('nome_comercial', '==', nomeComercial),
        where('nome_molecula', '==', nomeMolecula),
        orderBy('consultedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConsultaData[];
    } catch (error) {
      console.error('❌ Erro ao buscar consultas:', error);
      return [];
    }
  }

  // Agendar reconsulta automática
  static scheduleReconsulta(consultaId: string, consultaData: ConsultaData): void {
    // Limpar timer anterior se existir
    if (this.timers.has(consultaId)) {
      clearTimeout(this.timers.get(consultaId)!);
    }

    const timer = setTimeout(async () => {
      try {
        await this.executeReconsulta(consultaData);
        this.timers.delete(consultaId);
      } catch (error) {
        console.error('❌ Erro na reconsulta automática:', error);
      }
    }, this.RECONSULTA_INTERVAL);

    this.timers.set(consultaId, timer);
    console.log(`⏰ Reconsulta agendada para ${consultaId} em ${this.RECONSULTA_INTERVAL / 60000} minutos`);
  }

  // Executar reconsulta
  private static async executeReconsulta(originalConsulta: ConsultaData): Promise<void> {
    try {
      console.log('🔄 Executando reconsulta automática para:', originalConsulta.nome_comercial);

      // Buscar consultas anteriores para determinar o número da próxima consulta
      const consultasAnteriores = await this.getConsultasByProduct(
        originalConsulta.userId,
        originalConsulta.nome_comercial,
        originalConsulta.nome_molecula
      );

      const proximoNumero = consultasAnteriores.length + 1;

      // Preparar dados para reconsulta
      const reconsultaData = {
        cliente: originalConsulta.empresa,
        sessionId: originalConsulta.sessionId,
        nome_comercial: originalConsulta.nome_comercial,
        nome_molecula: originalConsulta.nome_molecula,
        industria: 'Farmacêutica',
        setor: 'Medicamentos',
        categoria: originalConsulta.categoria,
        beneficio: originalConsulta.beneficio,
        doenca_alvo: originalConsulta.doenca_alvo,
        pais_alvo: originalConsulta.pais_alvo,
        reconsulta: proximoNumero,
        produto_proposto: originalConsulta.produto_proposto || ''
      };

      console.log('📤 Enviando reconsulta:', reconsultaData);

      // Enviar para webhook
      const response = await fetch('https://primary-production-2e3b.up.railway.app/webhook/patentesdev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reconsultaData)
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status}`);
      }

      const webhookResponse = await response.json();

      // Salvar reconsulta
      const novaConsulta: Omit<ConsultaData, 'id'> = {
        userId: originalConsulta.userId,
        userEmail: originalConsulta.userEmail,
        empresa: originalConsulta.empresa,
        nome_comercial: originalConsulta.nome_comercial,
        nome_molecula: originalConsulta.nome_molecula,
        categoria: originalConsulta.categoria,
        beneficio: originalConsulta.beneficio,
        doenca_alvo: originalConsulta.doenca_alvo,
        pais_alvo: originalConsulta.pais_alvo,
        sessionId: originalConsulta.sessionId,
        consultaNumero: proximoNumero,
        isReconsulta: true,
        consultaOriginalId: originalConsulta.id,
        produto_proposto: originalConsulta.produto_proposto,
        webhookResponse,
        consultedAt: new Date().toISOString(),
        nextReconsultaAt: new Date(Date.now() + this.RECONSULTA_INTERVAL).toISOString()
      };

      const novaConsultaId = await this.saveConsulta(novaConsulta);
      
      // Agendar próxima reconsulta
      this.scheduleReconsulta(novaConsultaId, novaConsulta);

      console.log('✅ Reconsulta executada e próxima agendada');
    } catch (error) {
      console.error('❌ Erro na reconsulta automática:', error);
    }
  }

  // Cancelar reconsulta
  static cancelReconsulta(consultaId: string): void {
    if (this.timers.has(consultaId)) {
      clearTimeout(this.timers.get(consultaId)!);
      this.timers.delete(consultaId);
      console.log('🛑 Reconsulta cancelada para:', consultaId);
    }
  }

  // Alterar intervalo de reconsulta (para configuração futura)
  static setReconsultaInterval(minutes: number): void {
    this.RECONSULTA_INTERVAL = minutes * 60 * 1000;
    console.log(`⏰ Intervalo de reconsulta alterado para ${minutes} minutos`);
  }

  // Obter intervalo atual em minutos
  static getReconsultaIntervalMinutes(): number {
    return this.RECONSULTA_INTERVAL / 60000;
  }
}