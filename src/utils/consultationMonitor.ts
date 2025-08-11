import { collection, addDoc, query, where, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export interface ConsultaData {
  id: string;
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
  produto_proposto?: string; // Campo para evitar repetições
  webhookResponse: any;
  consultedAt: string;
  nextReconsultaAt: string;
}

// Intervalo de reconsulta em minutos
const RECONSULTA_INTERVAL = 10; // 10 minutos

export class ConsultationMonitor {
  // Salvar consulta na collection
  static async saveConsulta(consultaData: Omit<ConsultaData, 'id'>): Promise<string> {
    try {
      console.log('💾 Salvando consulta na collection "consultas":', consultaData);
      
      const docRef = await addDoc(collection(db, 'consultas'), consultaData);
      console.log(`✅ Consulta salva com ID: ${docRef.id}`);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao salvar consulta:', error);
      throw error;
    }
  }

  // Buscar consultas por produto específico
  static async getConsultasByProduct(
    userId: string, 
    nomeComercial: string, 
    nomeMolecula: string
  ): Promise<ConsultaData[]> {
    try {
      if (nomeComercial && nomeMolecula) {
        // Buscar produto específico sem orderBy para evitar índice composto
        const q = query(
          collection(db, 'consultas'),
          where('userId', '==', userId),
          where('nome_comercial', '==', nomeComercial),
          where('nome_molecula', '==', nomeMolecula)
        );
        
        const querySnapshot = await getDocs(q);
        const consultas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ConsultaData[];
        
        // Ordenar manualmente no cliente
        return consultas.sort((a, b) => new Date(b.consultedAt).getTime() - new Date(a.consultedAt).getTime());
      } else {
        // Buscar todas as consultas do usuário
        const q = query(
          collection(db, 'consultas'),
          where('userId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        const consultas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ConsultaData[];
        
        // Ordenar manualmente no cliente
        return consultas.sort((a, b) => new Date(b.consultedAt).getTime() - new Date(a.consultedAt).getTime());
      }
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
      return [];
    }
  }

  // Buscar TODOS os produtos propostos de um usuário
  static async getAllProposedProducts(userId: string): Promise<string[]> {
    try {
      console.log('🔍 Buscando TODOS os produtos propostos do usuário...');
      
      const q = query(
        collection(db, 'consultas'),
        where('userId', '==', userId),
        orderBy('consultedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const produtosPropostos: string[] = [];
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.produto_proposto && data.produto_proposto.trim()) {
          produtosPropostos.push(data.produto_proposto.trim());
        }
      });
      
      // Remover duplicatas mantendo a ordem (mais recentes primeiro)
      const uniqueProducts = [...new Set(produtosPropostos)];
      
      console.log(`📋 Total de produtos propostos únicos encontrados: ${uniqueProducts.length}`);
      console.log('📋 Lista de produtos:', uniqueProducts);
      
      return uniqueProducts;
    } catch (error) {
      console.error('❌ Erro ao buscar produtos propostos:', error);
      return [];
    }
  }

  // Agendar reconsulta automática
  static scheduleReconsulta(consultaId: string, consultaData: ConsultaData): void {
    console.log(`⏰ Agendando reconsulta para consulta ${consultaId} em ${RECONSULTA_INTERVAL} minutos`);
    
    setTimeout(async () => {
      try {
        await this.executeReconsulta(consultaId, consultaData);
      } catch (error) {
        console.error('❌ Erro na reconsulta agendada:', error);
      }
    }, RECONSULTA_INTERVAL * 60 * 1000); // Converter para milissegundos
  }

  // Executar reconsulta automática
  static async executeReconsulta(consultaId: string, originalConsulta: ConsultaData): Promise<void> {
    try {
      console.log(`🔄 Executando reconsulta automática para consulta ${consultaId}`);
      
      // Buscar TODOS os produtos propostos atualizados
      const produtosPropostos = await this.getAllProposedProducts(originalConsulta.userId);
      
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
        produtos_propostos: produtosPropostos, // Enviar TODOS os produtos propostos
        reconsulta: originalConsulta.consultaNumero + 1, // Número da reconsulta
        serpApiKey: 'auto' // Será selecionada automaticamente pelo webhook
      };

      console.log('🚀 Enviando reconsulta automática:', reconsultaData);

      // Enviar reconsulta
      const response = await fetch('https://primary-production-2e3b.up.railway.app/webhook/patentesdev', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reconsultaData)
      });

      if (!response.ok) {
        throw new Error(`Erro na reconsulta: ${response.status} ${response.statusText}`);
      }

      const webhookResponse = await response.json();
      console.log('✅ Resposta da reconsulta recebida:', webhookResponse);

      // Salvar nova consulta
      const novaConsultaData: Omit<ConsultaData, 'id'> = {
        ...originalConsulta,
        consultaNumero: originalConsulta.consultaNumero + 1,
        isReconsulta: true,
        webhookResponse,
        consultedAt: new Date().toISOString(),
        nextReconsultaAt: new Date(Date.now() + RECONSULTA_INTERVAL * 60 * 1000).toISOString()
      };

      // Extrair produto_proposto da resposta se for dashboard
      if (webhookResponse && typeof webhookResponse === 'object') {
        let parsedResponse = webhookResponse;
        
        // Se for array, pegar o primeiro item
        if (Array.isArray(webhookResponse) && webhookResponse.length > 0) {
          parsedResponse = webhookResponse[0].output || webhookResponse[0];
        }
        
        // Se for string, tentar fazer parse
        if (typeof parsedResponse === 'string') {
          try {
            parsedResponse = JSON.parse(parsedResponse);
          } catch (e) {
            console.warn('Não foi possível fazer parse da resposta como JSON');
          }
        }
        
        // Extrair produto_proposto
        if (parsedResponse && parsedResponse.produto_proposto) {
          novaConsultaData.produto_proposto = parsedResponse.produto_proposto;
          console.log(`📝 Produto proposto extraído da reconsulta: ${parsedResponse.produto_proposto}`);
        }
      }

      const novaConsultaId = await this.saveConsulta(novaConsultaData);
      
      // Agendar próxima reconsulta
      this.scheduleReconsulta(novaConsultaId, { ...novaConsultaData, id: novaConsultaId });
      
      console.log(`✅ Reconsulta ${originalConsulta.consultaNumero + 1} executada e próxima agendada`);
      
    } catch (error) {
      console.error('❌ Erro na execução da reconsulta:', error);
      
      // Reagendar para tentar novamente em 10 minutos
      console.log('🔄 Reagendando reconsulta devido ao erro...');
      setTimeout(() => {
        this.executeReconsulta(consultaId, originalConsulta);
      }, RECONSULTA_INTERVAL * 60 * 1000);
    }
  }

  // Obter intervalo de reconsulta em minutos (para exibição)
  static getReconsultaIntervalMinutes(): number {
    return RECONSULTA_INTERVAL;
  }

  // Buscar consultas pendentes de reconsulta (para inicialização do sistema)
  static async initializePendingReconsultas(): Promise<void> {
    try {
      console.log('🔄 Inicializando reconsultas pendentes...');
      
      const now = new Date();
      const q = query(
        collection(db, 'consultas'),
        where('nextReconsultaAt', '<=', now.toISOString()),
        orderBy('nextReconsultaAt', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      
      querySnapshot.docs.forEach(doc => {
        const consultaData = { id: doc.id, ...doc.data() } as ConsultaData;
        
        // Agendar reconsulta imediatamente para consultas em atraso
        console.log(`⚡ Agendando reconsulta imediata para consulta ${consultaData.id}`);
        this.scheduleReconsulta(consultaData.id, consultaData);
      });
      
      console.log(`✅ ${querySnapshot.docs.length} reconsultas pendentes inicializadas`);
      
    } catch (error) {
      console.error('❌ Erro ao inicializar reconsultas pendentes:', error);
    }
  }
}

// Inicializar reconsultas pendentes quando o módulo for carregado
if (typeof window !== 'undefined') {
  // Aguardar um pouco para garantir que o Firebase foi inicializado
  setTimeout(() => {
    ConsultationMonitor.initializePendingReconsultas();
  }, 5000);
}