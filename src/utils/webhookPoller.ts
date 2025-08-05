// Sistema de polling para aguardar resposta completa do webhook - VERSÃO CORRIGIDA PARA WEBHOOKS LENTOS
import { WebhookStatusStore } from './webhookStatusStore';
import { parsePatentResponse } from './patentParser';

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
  forceRenderIn?: number;
}

export class WebhookPoller {
  private sessionId: string;
  private checkInterval: number;
  private onProgress?: (progress: PollingProgress) => void;
  private startTime: number;
  private isPolling: boolean = false;
  private maxAttempts: number = 600; // 100 minutos máximo (600 * 10s)
  private forceRenderTimeout: number = 300000; // 5 minutos (300 segundos)

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
    console.log(`⏰ Timeout forçado configurado para: ${this.forceRenderTimeout / 1000}s (${this.forceRenderTimeout / 60000} minutos)`);
    
    while (this.isPolling && attempt < this.maxAttempts) {
      attempt++;
      const timeElapsed = Date.now() - this.startTime;
      
      // TIMEOUT FORÇADO - Se passou de 5 minutos, força renderização
      if (timeElapsed >= this.forceRenderTimeout) {
        console.log(`🚨 TIMEOUT FORÇADO ATIVADO após ${Math.round(timeElapsed / 1000)}s (${Math.round(timeElapsed / 60000)} minutos)`);
        console.log(`🔍 Fazendo última tentativa de buscar dados...`);
        
        try {
          const finalResponse = await this.checkWebhookStatus();
          if (finalResponse.data && this.isValidPatentData(finalResponse.data)) {
            console.log(`✅ Dados válidos encontrados no timeout forçado, renderizando...`);
            this.isPolling = false;
            
            try {
              const parsedData = parsePatentResponse(finalResponse.data);
              console.log('✅ Dados parseados com sucesso no timeout forçado:', parsedData);
              return parsedData;
            } catch (parseError) {
              console.error('❌ Erro ao fazer parse no timeout forçado:', parseError);
              throw new Error(`Erro ao processar dados: ${parseError instanceof Error ? parseError.message : 'Erro desconhecido'}`);
            }
          } else {
            console.log(`❌ Nenhum dado válido encontrado após timeout forçado de ${Math.round(timeElapsed / 60000)} minutos`);
            this.isPolling = false;
            throw new Error(`Timeout: Webhook não respondeu completamente após ${Math.round(timeElapsed / 60000)} minutos. O processamento pode estar demorando mais que o esperado. Tente novamente em alguns minutos.`);
          }
        } catch (error) {
          this.isPolling = false;
          throw error;
        }
      }
      
      try {
        console.log(`🔍 Tentativa ${attempt}/${this.maxAttempts} - Verificando resposta do webhook (${Math.round(timeElapsed / 1000)}s decorridos)`);
        
        // Notificar progresso
        if (this.onProgress) {
          this.onProgress({
            attempt,
            timeElapsed,
            lastCheck: new Date().toISOString(),
            estimatedTimeRemaining: this.estimateTimeRemaining(timeElapsed),
            forceRenderIn: Math.max(0, this.forceRenderTimeout - timeElapsed)
          });
        }
        
        // Verificar se o webhook processou
        const response = await this.checkWebhookStatus();
        
        if (response.status === 'completed' && response.data && this.isValidPatentData(response.data)) {
          console.log(`✅ Webhook respondeu completamente após ${attempt} tentativas (${Math.round(timeElapsed / 1000)}s)`);
          this.isPolling = false;
          
          // Fazer parse dos dados antes de retornar
          try {
            const parsedData = parsePatentResponse(response.data);
            console.log('✅ Dados parseados com sucesso:', parsedData);
            return parsedData;
          } catch (parseError) {
            console.error('❌ Erro ao fazer parse dos dados:', parseError);
            throw new Error(`Erro ao processar dados do webhook: ${parseError instanceof Error ? parseError.message : 'Erro desconhecido'}`);
          }
        } else if (response.status === 'error') {
          console.error(`❌ Webhook retornou erro:`, response.error);
          this.isPolling = false;
          throw new Error(response.error || 'Erro no processamento do webhook');
        } else {
          console.log(`⏳ Webhook ainda processando... (status: ${response.status}, dados válidos: ${this.isValidPatentData(response.data)})`);
          
          // Log adicional para debug
          if (response.data) {
            console.log(`📊 Dados recebidos mas não válidos ainda:`, {
              hasData: !!response.data,
              dataType: typeof response.data,
              isArray: Array.isArray(response.data),
              dataKeys: typeof response.data === 'object' ? Object.keys(response.data) : 'N/A'
            });
          }
        }

      } catch (error) {
        console.warn(`⚠️ Erro na tentativa ${attempt}:`, error);
        
        // Se for erro crítico, parar o polling
        if (error instanceof Error && error.message.includes('Erro ao processar dados do webhook')) {
          this.isPolling = false;
          throw error;
        }
        
        // Para outros erros, continuar tentando
      }
      
      // Aguardar intervalo antes da próxima verificação
      if (this.isPolling) {
        await this.sleep(this.checkInterval);
      }
    }

    // Se chegou aqui, atingiu o máximo de tentativas
    this.isPolling = false;
    throw new Error(`Timeout: Webhook não respondeu após ${this.maxAttempts} tentativas (${Math.round((Date.now() - this.startTime) / 60000)} minutos). O processamento pode estar demorando mais que o esperado.`);
  }

  private async checkWebhookStatus(): Promise<WebhookResponse> {
    try {
      // Verificar status no Firestore
      const statusData = await WebhookStatusStore.getStatus(this.sessionId);
      
      if (!statusData) {
        console.log('⚠️ Nenhum status encontrado no Firestore');
        return {
          status: 'processing',
          sessionId: this.sessionId
        };
      }

      console.log(`🔍 Status verificado para ${this.sessionId}:`, {
        status: statusData.status,
        hasData: !!statusData.data,
        dataType: typeof statusData.data,
        dataSize: statusData.data ? JSON.stringify(statusData.data).length : 0
      });

      // Verificar se temos dados válidos de patente
      const hasValidData = statusData.data && this.isValidPatentData(statusData.data);

      if (statusData.status === 'completed' && hasValidData) {
        console.log('✅ Status completed detectado com dados válidos');
        return {
          status: 'completed',
          data: statusData.data,
          sessionId: this.sessionId
        };
      } else if (statusData.status === 'completed' && !hasValidData) {
        console.log('⚠️ Status completed mas sem dados válidos, continuando polling...');
        return {
          status: 'processing',
          sessionId: this.sessionId,
          data: statusData.data // Manter dados para debug
        };
      } else if (statusData.status === 'error') {
        return {
          status: 'error',
          error: statusData.error || 'Erro desconhecido no webhook',
          sessionId: this.sessionId
        };
      }
      
      return {
        status: 'processing',
        sessionId: this.sessionId,
        data: statusData.data // Incluir dados parciais se existirem
      };

    } catch (error) {
      console.warn('⚠️ Erro ao verificar status do webhook:', error);
      return {
        status: 'processing',
        sessionId: this.sessionId
      };
    }
  }

  private isValidPatentData(data: any): boolean {
    if (!data || typeof data !== 'object') {
      console.log('❌ Dados inválidos: não é objeto ou é null');
      return false;
    }

    // Verificar se é um array com dados
    if (Array.isArray(data) && data.length > 0) {
      const firstItem = data[0];
      if (firstItem && typeof firstItem === 'object') {
        // Verificar se tem estrutura de patente OU output válido
        const hasPatentStructure = !!(
          firstItem.patentes || 
          firstItem.quimica || 
          firstItem.ensaios_clinicos || 
          (firstItem.output && typeof firstItem.output === 'object')
        );
        console.log('🔍 Verificando array - tem estrutura de patente:', hasPatentStructure);
        return hasPatentStructure;
      }
    }

    // Verificar se tem estrutura direta de patente
    const hasDirectStructure = !!(data.patentes || data.quimica || data.ensaios_clinicos);
    console.log('🔍 Verificando objeto direto - tem estrutura de patente:', hasDirectStructure);
    
    // VALIDAÇÃO MAIS RIGOROSA - só aceitar dados realmente completos
    if (!hasDirectStructure) {
      // Verificar se tem pelo menos estrutura mínima de patente
      const hasMinimalPatentData = !!(
        (data.produto || data.substancia) && 
        (data.patente_vigente !== undefined || data.data_expiracao_patente_principal) &&
        (data.molecular_formula || data.iupac_name || data.patentes_por_pais)
      );
      console.log('🔍 Verificação mínima - tem dados básicos de patente:', hasMinimalPatentData);
      
      // Só aceitar se tem dados realmente substanciais
      if (!hasMinimalPatentData) {
        console.log('❌ Dados insuficientes para renderização');
        return false;
      }
      
      return hasMinimalPatentData;
    }
    
    return hasDirectStructure;
  }

  private estimateTimeRemaining(timeElapsed: number): number | undefined {
    // Estimativa baseada em dados históricos ATUALIZADOS
    const averageProcessingTime = 180000; // 3 minutos em média
    const maxProcessingTime = 300000; // 5 minutos máximo
    
    if (timeElapsed < averageProcessingTime) {
      return averageProcessingTime - timeElapsed;
    } else if (timeElapsed < maxProcessingTime) {
      return maxProcessingTime - timeElapsed;
    }
    
    // Após 5 minutos, não dar estimativa
    return undefined;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public stopPolling(): void {
    console.log('🛑 Parando polling manualmente');
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