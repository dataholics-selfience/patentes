// Sistema de polling simplificado para aguardar resposta do webhook - até 5 minutos
import { WebhookStatusStore } from './webhookStatusStore';
import { parsePatentResponse } from './patentParser';

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
}

export class WebhookPoller {
  private sessionId: string;
  private checkInterval: number;
  private onProgress?: (progress: PollingProgress) => void;
  private startTime: number;
  private isPolling: boolean = false;
  private maxDuration: number = 300000; // 5 minutos

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
    
    console.log(`🔄 Iniciando polling simples para sessionId: ${this.sessionId}`);
    console.log(`⏰ Aguardando até 5 minutos pela resposta do webhook`);
    
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
            lastCheck: new Date().toISOString()
          });
        }
        
        // Verificar se o webhook processou
        const response = await this.checkWebhookStatus();
        
        if (response.status === 'completed' && response.data && this.isValidPatentData(response.data)) {
          console.log(`✅ Webhook respondeu após ${Math.round(timeElapsed / 1000)}s`);
          this.isPolling = false;
          
          try {
            const parsedData = parsePatentResponse(response.data);
            console.log('✅ Dados parseados com sucesso:', parsedData);
            return parsedData;
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse dos dados:', parseError);
            throw new Error(`Erro ao processar dados: ${parseError instanceof Error ? parseError.message : 'Erro desconhecido'}`);
          }
        } else if (response.status === 'error') {
          console.error(`❌ Webhook retornou erro:`, response.error);
          this.isPolling = false;
          throw new Error(response.error || 'Erro no processamento');
        } else {
          console.log(`⏳ Webhook ainda processando... (${Math.round(timeElapsed / 1000)}s)`);
        }

      } catch (error) {
        console.warn(`⚠️ Erro na tentativa ${attempt}:`, error);
        
        // Se for erro crítico, parar o polling
        if (error instanceof Error && error.message.includes('Erro ao processar dados')) {
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
    throw new Error(`Timeout: Webhook não respondeu em 5 minutos.`);
  }

  private async checkWebhookStatus(): Promise<WebhookResponse> {
    try {
      const statusData = await WebhookStatusStore.getStatus(this.sessionId);
      
      if (!statusData) {
        return {
          status: 'processing',
          sessionId: this.sessionId
        };
      }

      const hasValidData = statusData.data && this.isValidPatentData(statusData.data);

      if (statusData.status === 'completed' && hasValidData) {
        return {
          status: 'completed',
          data: statusData.data,
          sessionId: this.sessionId
        };
      } else if (statusData.status === 'error') {
        return {
          status: 'error',
          error: statusData.error || 'Erro desconhecido',
          sessionId: this.sessionId
        };
      }
      
      return {
        status: 'processing',
        sessionId: this.sessionId
      };

    } catch (error) {
      console.warn('⚠️ Erro ao verificar status:', error);
      return {
        status: 'processing',
        sessionId: this.sessionId
      };
    }
  }

  private isValidPatentData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Verificar se é um array com dados
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem && typeof firstItem === 'object') {
        const hasPatentStructure = !!(
          firstItem.patentes || 
          firstItem.quimica || 
          firstItem.ensaios_clinicos || 
          (firstItem.output && typeof firstItem.output === 'object')
        );
        return hasPatentStructure;
      }
    }

    // Verificar se tem estrutura direta de patente
    const hasDirectStructure = !!(data.patentes || data.quimica || data.ensaios_clinicos);
    
    if (!hasDirectStructure) {
      // Verificar estrutura mínima
      const hasMinimalPatentData = !!(
        (data.produto || data.substancia) && 
        (data.patente_vigente !== undefined || data.data_expiracao_patente_principal) &&
        (data.molecular_formula || data.iupac_name || data.patentes_por_pais)
      );
      
      return hasMinimalPatentData;
    }
    
    return hasDirectStructure;
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