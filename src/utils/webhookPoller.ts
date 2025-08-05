// Sistema de polling robusto para aguardar resposta completa do webhook - até 5 minutos
import { WebhookStatusStore } from './webhookStatusStore';
import { parsePatentResponse, isDashboardData, parseDashboardData } from './patentParser';

export interface WebhookResponse {
  status: 'processing' | 'completed' | 'error';
  data?: any;
  error?: string;
  sessionId: string;
  completedAt?: string;
}

export interface PollingProgress {
  attempt: number;
  timeElapsed: number;
  lastCheck: string;
  stage: string;
}

export class WebhookPoller {
  private sessionId: string;
  private checkInterval: number;
  private onProgress?: (progress: PollingProgress) => void;
  private startTime: number;
  private isPolling: boolean = false;
  private maxDuration: number = 300000; // 5 minutos
  private webhookUrl: string;
  private webhookData: any;

  constructor(
    sessionId: string,
    webhookUrl: string,
    webhookData: any,
    checkInterval: number = 15000, // 15 segundos entre verificações
    onProgress?: (progress: PollingProgress) => void
  ) {
    this.sessionId = sessionId;
    this.webhookUrl = webhookUrl;
    this.webhookData = webhookData;
    this.checkInterval = checkInterval;
    this.onProgress = onProgress;
    this.startTime = Date.now();
  }

  async pollForResponse(): Promise<any> {
    this.isPolling = true;
    let attempt = 0;
    
    console.log(`🔄 Iniciando polling robusto para sessionId: ${this.sessionId}`);
    console.log(`⏰ Aguardando até 5 minutos pela resposta completa do webhook`);
    
    // Primeiro, enviar a requisição para o webhook
    try {
      console.log(`🚀 Enviando requisição inicial para webhook: ${this.webhookUrl}`);
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.webhookData)
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status} ${response.statusText}`);
      }

      // Verificar se a resposta já veio completa
      const initialResponse = await response.json();
      console.log('📦 Resposta inicial do webhook:', initialResponse);

      // Se a resposta já está completa, processar imediatamente
      if (this.isValidCompleteResponse(initialResponse)) {
        console.log('✅ Resposta completa recebida imediatamente');
        this.isPolling = false;
        return this.processResponse(initialResponse);
      }

      // Se não está completa, iniciar polling
      console.log('⏳ Resposta não está completa, iniciando polling...');
      
    } catch (error) {
      console.error('❌ Erro ao enviar requisição inicial:', error);
      this.isPolling = false;
      throw error;
    }
    
    // Loop de polling para aguardar resposta completa
    while (this.isPolling) {
      attempt++;
      const timeElapsed = Date.now() - this.startTime;
      
      // Timeout após 5 minutos
      if (timeElapsed >= this.maxDuration) {
        console.log(`🚨 Timeout após 5 minutos`);
        this.isPolling = false;
        throw new Error(`A consulta demorou mais de 5 minutos para ser processada. Consultas complexas podem demorar mais que o esperado. Tente novamente.`);
      }
      
      try {
        console.log(`🔍 Tentativa ${attempt} - Verificando resposta (${Math.round(timeElapsed / 1000)}s)`);
        
        // Notificar progresso
        if (this.onProgress) {
          this.onProgress({
            attempt,
            timeElapsed,
            lastCheck: new Date().toISOString(),
            stage: this.getStageFromTime(timeElapsed)
          });
        }
        
        // Verificar se o webhook processou completamente
        const response = await this.checkWebhookCompletion();
        
        if (response.status === 'completed' && response.data && this.isValidCompleteResponse(response.data)) {
          console.log(`✅ Webhook completou processamento após ${Math.round(timeElapsed / 1000)}s`);
          this.isPolling = false;
          return this.processResponse(response.data);
        } else if (response.status === 'error') {
          console.error(`❌ Webhook retornou erro:`, response.error);
          this.isPolling = false;
          throw new Error(response.error || 'Erro no processamento do webhook');
        } else {
          console.log(`⏳ Webhook ainda processando... (${Math.round(timeElapsed / 1000)}s)`);
        }

      } catch (error) {
        console.warn(`⚠️ Erro na tentativa ${attempt}:`, error);
        
        // Se for erro crítico, parar o polling
        if (error instanceof Error && (
          error.message.includes('Erro ao processar dados') ||
          error.message.includes('DASHBOARD_DATA_DETECTED')
        )) {
          this.isPolling = false;
          throw error;
        }
      }
      
      // Aguardar antes da próxima verificação
      if (this.isPolling) {
        await this.sleep(this.checkInterval);
      }
    }

    // Não deveria chegar aqui, mas por segurança
    this.isPolling = false;
    throw new Error(`Timeout: Webhook não respondeu completamente em 5 minutos.`);
  }

  private async checkWebhookCompletion(): Promise<WebhookResponse> {
    try {
      // Fazer nova requisição para verificar se o processamento foi concluído
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...this.webhookData,
          checkStatus: true // Flag para indicar que é verificação de status
        })
      });

      if (!response.ok) {
        return {
          status: 'processing',
          sessionId: this.sessionId
        };
      }

      const data = await response.json();
      
      if (this.isValidCompleteResponse(data)) {
        return {
          status: 'completed',
          data: data,
          sessionId: this.sessionId
        };
      }
      
      return {
        status: 'processing',
        sessionId: this.sessionId
      };

    } catch (error) {
      console.warn('⚠️ Erro ao verificar status do webhook:', error);
      return {
        status: 'processing',
        sessionId: this.sessionId
      };
    }
  }

  private isValidCompleteResponse(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Verificar se é um array com dados
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem && typeof firstItem === 'object' && firstItem.output) {
        // Verificar se o output contém dados estruturados completos
        try {
          let outputData;
          if (typeof firstItem.output === 'string') {
            // Limpar markdown e parsear
            const cleanOutput = firstItem.output
              .replace(/```json\n?/g, '')
              .replace(/```\n?/g, '')
              .trim();
            outputData = JSON.parse(cleanOutput);
          } else {
            outputData = firstItem.output;
          }

          // Verificar se tem estrutura completa de dashboard
          const hasCompleteStructure = !!(
            outputData?.consulta &&
            outputData?.resumo_oportunidade &&
            outputData?.produtos_similares &&
            outputData?.produto_proposto &&
            outputData?.analise_riscos &&
            outputData?.recomendacoes
          );

          console.log('🔍 Verificando estrutura completa:', {
            hasConsulta: !!outputData?.consulta,
            hasResumo: !!outputData?.resumo_oportunidade,
            hasProdutos: !!outputData?.produtos_similares,
            hasProdutoProposto: !!outputData?.produto_proposto,
            hasAnaliseRiscos: !!outputData?.analise_riscos,
            hasRecomendacoes: !!outputData?.recomendacoes,
            isComplete: hasCompleteStructure
          });

          return hasCompleteStructure;
        } catch (parseError) {
          console.log('❌ Erro ao verificar estrutura:', parseError);
          return false;
        }
      }
    }

    // Verificar estrutura direta
    const hasDirectStructure = !!(
      data?.consulta &&
      data?.resumo_oportunidade &&
      data?.produtos_similares &&
      data?.produto_proposto
    );
    
    return hasDirectStructure;
  }

  private processResponse(data: any): any {
    try {
      console.log('🔄 Processando resposta completa do webhook:', data);

      // Verificar se é dashboard data
      if (isDashboardData(data)) {
        console.log('📊 Processando como dashboard data');
        return {
          type: 'dashboard',
          data: parseDashboardData(data)
        };
      } else {
        console.log('📋 Processando como patent data');
        return {
          type: 'patent',
          data: parsePatentResponse(data)
        };
      }
    } catch (error) {
      console.error('❌ Erro ao processar resposta:', error);
      throw error;
    }
  }

  private getStageFromTime(timeElapsed: number): string {
    if (timeElapsed < 30000) return 'Enviando consulta para análise';
    if (timeElapsed < 60000) return 'Consultando bases de patentes globais';
    if (timeElapsed < 120000) return 'Analisando propriedade intelectual';
    if (timeElapsed < 180000) return 'Consultando ensaios clínicos';
    if (timeElapsed < 240000) return 'Verificando regulamentações';
    return 'Finalizando análise completa';
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public stopPolling(): void {
    console.log('🛑 Parando polling');
    this.isPolling = false;
  }
}

// Função utilitária para usar o poller
export async function waitForWebhookResponse(
  sessionId: string,
  webhookUrl: string,
  webhookData: any,
  onProgress?: (progress: PollingProgress) => void
): Promise<{ type: 'dashboard' | 'patent'; data: any }> {
  const poller = new WebhookPoller(sessionId, webhookUrl, webhookData, 15000, onProgress);
  
  try {
    return await poller.pollForResponse();
  } catch (error) {
    poller.stopPolling();
    throw error;
  }
}