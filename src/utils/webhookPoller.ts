// Sistema de polling para aguardar resposta completa do webhook
import { WebhookStatusStore } from './webhookStatusStore';

export interface WebhookResponse {
  status: 'processing' | 'completed' | 'error';
  data?: any;
  error?: string;
  sessionId: string;
  completedAt?: string;
  progress?: number;
}

export interface PollingProgress {
  attempt: number;
  timeElapsed: number;
  estimatedTimeRemaining?: number;
  lastCheck: string;
}

export class WebhookPoller {
  private sessionId: string;
  private checkInterval: number;
  private onProgress?: (progress: PollingProgress) => void;
  private startTime: number;
  private isPolling: boolean = false;

  constructor(
    sessionId: string, 
    checkInterval: number = 10000, // 10 segundos
    onProgress?: (progress: PollingProgress) => void
  ) {
    this.sessionId = sessionId;
    this.checkInterval = checkInterval;
    this.onProgress = onProgress;
    this.startTime = Date.now();
  }

  async pollForResponse(): Promise<any> {
    this.isPolling = true;
    let attempt = 0;
    
    console.log(`🔄 Iniciando polling para sessionId: ${this.sessionId}`);
    
    while (this.isPolling) {
      attempt++;
      const timeElapsed = Date.now() - this.startTime;
      
      try {
        console.log(`🔍 Tentativa ${attempt} - Verificando resposta do webhook (${Math.round(timeElapsed / 1000)}s decorridos)`);
        
        // Notificar progresso
        if (this.onProgress) {
          this.onProgress({
            attempt,
            timeElapsed,
            lastCheck: new Date().toISOString(),
            estimatedTimeRemaining: this.estimateTimeRemaining(timeElapsed)
          });
        }
        
        // Verificar se o webhook processou
        const response = await this.checkWebhookStatus();
        
        if (response.status === 'completed' && response.data) {
          console.log(`✅ Webhook respondeu completamente após ${attempt} tentativas (${Math.round(timeElapsed / 1000)}s)`);
          this.isPolling = false;
          return response.data;
        } else if (response.status === 'error') {
          console.error(`❌ Webhook retornou erro:`, response.error);
          this.isPolling = false;
          throw new Error(response.error || 'Erro no processamento do webhook');
        } else {
          console.log(`⏳ Webhook ainda processando... (status: ${response.status})`);
        }

      } catch (error) {
        console.warn(`⚠️ Erro na tentativa ${attempt}:`, error);
        // Não parar o polling por erros de rede - continuar tentando
      }
      
      // Aguardar intervalo antes da próxima verificação
      await this.sleep(this.checkInterval);
    }

    throw new Error('Polling foi interrompido');
  }

  private async checkWebhookStatus(): Promise<WebhookResponse> {
    try {
      // Verificar status no Firestore
      const statusData = await WebhookStatusStore.getStatus(this.sessionId);
      
      console.log(`🔍 Status verificado para ${this.sessionId}:`, statusData);
      
      if (!statusData) {
        console.log('⚠️ Nenhum status encontrado no Firestore');
        return {
          status: 'processing',
          sessionId: this.sessionId
        };
      }

      if (statusData.status === 'completed' && statusData.data) {
        console.log('✅ Status completed detectado com dados:', statusData.data);
      }
      
      return {
        status: statusData.status,
        data: statusData.data,
        error: statusData.error,
        sessionId: this.sessionId
      };

    } catch (error) {
      // Para outros erros, também continuar polling
      console.warn('⚠️ Erro ao verificar status do webhook:', error);
      return {
        status: 'processing',
        sessionId: this.sessionId
      };
    }
  }

  private estimateTimeRemaining(timeElapsed: number): number | undefined {
    // Estimativa baseada em dados históricos
    const averageProcessingTime = 90000; // 1.5 minutos em média
    const maxProcessingTime = 150000; // 2.5 minutos máximo
    
    if (timeElapsed < averageProcessingTime) {
      return averageProcessingTime - timeElapsed;
    } else if (timeElapsed < maxProcessingTime) {
      return maxProcessingTime - timeElapsed;
    }
    
    // Após 2.5 minutos, não dar estimativa
    return undefined;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public stopPolling(): void {
    this.isPolling = false;
  }
}

// Função utilitária para usar o poller
export async function waitForWebhookResponse(
  sessionId: string,
  onProgress?: (progress: PollingProgress) => void
): Promise<any> {
  const poller = new WebhookPoller(sessionId, 10000, onProgress);
  
  try {
    return await poller.pollForResponse();
  } catch (error) {
    poller.stopPolling();
    throw error;
  }
}