// Sistema de polling para aguardar resposta completa do webhook
export interface WebhookResponse {
  status: 'processing' | 'completed' | 'error';
  data?: any;
  error?: string;
  sessionId: string;
}

export class WebhookPoller {
  private sessionId: string;
  private maxRetries: number;
  private retryInterval: number;
  private onProgress?: (attempt: number, maxRetries: number) => void;

  constructor(
    sessionId: string, 
    maxRetries: number = 60, // 60 tentativas = 10 minutos com intervalo de 10s
    retryInterval: number = 10000, // 10 segundos entre tentativas
    onProgress?: (attempt: number, maxRetries: number) => void
  ) {
    this.sessionId = sessionId;
    this.maxRetries = maxRetries;
    this.retryInterval = retryInterval;
    this.onProgress = onProgress;
  }

  async pollForResponse(): Promise<any> {
    let attempt = 0;
    
    while (attempt < this.maxRetries) {
      attempt++;
      
      try {
        console.log(`🔄 Tentativa ${attempt}/${this.maxRetries} - Verificando resposta do webhook para sessionId: ${this.sessionId}`);
        
        // Notificar progresso
        if (this.onProgress) {
          this.onProgress(attempt, this.maxRetries);
        }
        
        // Fazer requisição para verificar se o webhook processou
        const response = await fetch('https://primary-production-2e3b.up.railway.app/webhook/check-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: this.sessionId
          }),
          signal: AbortSignal.timeout(30000) // Timeout de 30s para cada verificação individual
        });

        if (!response.ok) {
          console.warn(`⚠️ Resposta não OK: ${response.status} - ${response.statusText}`);
          
          // Se for 404, significa que ainda não processou
          if (response.status === 404) {
            console.log(`📋 SessionId ${this.sessionId} ainda não processado, aguardando...`);
            await this.sleep(this.retryInterval);
            continue;
          }
          
          // Para outros erros, tentar novamente
          await this.sleep(this.retryInterval);
          continue;
        }

        const result = await response.json();
        console.log(`📥 Resposta recebida para sessionId ${this.sessionId}:`, result);

        // Verificar se a resposta está completa
        if (this.isResponseComplete(result)) {
          console.log(`✅ Resposta completa recebida após ${attempt} tentativas`);
          return result;
        } else {
          console.log(`⏳ Resposta incompleta, continuando polling...`);
          await this.sleep(this.retryInterval);
          continue;
        }

      } catch (error) {
        console.warn(`⚠️ Erro na tentativa ${attempt}:`, error);
        
        // Se for timeout, continuar tentando
        if (error instanceof Error && error.name === 'TimeoutError') {
          console.log(`⏰ Timeout na tentativa ${attempt}, continuando...`);
          await this.sleep(this.retryInterval);
          continue;
        }
        
        // Para outros erros, aguardar e tentar novamente
        await this.sleep(this.retryInterval);
        continue;
      }
    }

    // Se chegou aqui, esgotou todas as tentativas
    throw new Error(`Webhook não respondeu após ${this.maxRetries} tentativas (${(this.maxRetries * this.retryInterval) / 1000 / 60} minutos). O sistema pode estar sobrecarregado.`);
  }

  private isResponseComplete(response: any): boolean {
    // Verificar se a resposta tem a estrutura esperada
    if (!response || typeof response !== 'object') {
      return false;
    }

    // Se tem status, verificar se está completo
    if (response.status) {
      return response.status === 'completed' && response.data;
    }

    // Verificar se tem dados de patente essenciais
    if (response.patentes || response.quimica || response.ensaios_clinicos) {
      return true;
    }

    // Se é um array, verificar o primeiro elemento
    if (Array.isArray(response) && response.length > 0) {
      const firstItem = response[0];
      if (firstItem.output) {
        try {
          const parsed = typeof firstItem.output === 'string' ? JSON.parse(firstItem.output) : firstItem.output;
          return this.isResponseComplete(parsed);
        } catch {
          return false;
        }
      }
      return this.isResponseComplete(firstItem);
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Função utilitária para usar o poller
export async function waitForWebhookResponse(
  sessionId: string,
  onProgress?: (attempt: number, maxRetries: number, timeElapsed: number) => void
): Promise<any> {
  const startTime = Date.now();
  
  const poller = new WebhookPoller(
    sessionId,
    60, // 60 tentativas
    10000, // 10 segundos entre tentativas
    (attempt, maxRetries) => {
      const timeElapsed = Date.now() - startTime;
      if (onProgress) {
        onProgress(attempt, maxRetries, timeElapsed);
      }
    }
  );

  return await poller.pollForResponse();
}