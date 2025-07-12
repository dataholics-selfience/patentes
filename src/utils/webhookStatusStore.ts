// Store para gerenciar status de webhooks em Firestore
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export interface WebhookStatusData {
  sessionId: string;
  status: 'processing' | 'completed' | 'error';
  data?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
  progress?: number;
  userId?: string;
  userEmail?: string;
}

export class WebhookStatusStore {
  private static COLLECTION_NAME = 'webhookStatus';

  // Criar registro de status inicial
  static async createStatus(sessionId: string, userId?: string, userEmail?: string): Promise<void> {
    const statusData: WebhookStatusData = {
      sessionId,
      status: 'processing',
      createdAt: new Date().toISOString(),
      userId,
      userEmail
    };

    await setDoc(doc(db, this.COLLECTION_NAME, sessionId), statusData);
    console.log(`📝 Status criado para sessionId: ${sessionId}`);
  }

  // Atualizar status do webhook
  static async updateStatus(
    sessionId: string, 
    status: 'processing' | 'completed' | 'error',
    data?: any,
    error?: string,
    progress?: number
  ): Promise<void> {
    const updateData: Partial<WebhookStatusData> = {
      status,
      progress
    };

    if (status === 'completed') {
      updateData.data = data;
      updateData.completedAt = new Date().toISOString();
    } else if (status === 'error') {
      updateData.error = error;
      updateData.completedAt = new Date().toISOString();
    }

    await updateDoc(doc(db, this.COLLECTION_NAME, sessionId), updateData);
    console.log(`🔄 Status atualizado para sessionId: ${sessionId} - ${status}`);
  }

  // Verificar status do webhook
  static async getStatus(sessionId: string): Promise<WebhookStatusData | null> {
    try {
      console.log(`🔍 Buscando status para sessionId: ${sessionId}`);
      const statusDoc = await getDoc(doc(db, this.COLLECTION_NAME, sessionId));
      
      if (!statusDoc.exists()) {
        console.log(`❌ Documento não existe para sessionId: ${sessionId}`);
        return null;
      }

      const data = statusDoc.data() as WebhookStatusData;
      console.log(`📊 Status encontrado:`, data);
      return data;
    } catch (error) {
      console.error('Erro ao buscar status do webhook:', error);
      return null;
    }
  }

  // Limpar status antigos (opcional - para manutenção)
  static async cleanupOldStatuses(olderThanHours: number = 24): Promise<void> {
    // Esta função pode ser chamada periodicamente para limpar registros antigos
    const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
    
    // Implementação de limpeza seria feita aqui
    // Por simplicidade, não implementando agora
    console.log(`🧹 Limpeza de status antigos (mais de ${olderThanHours}h)`);
  }

  // Remover status específico
  static async removeStatus(sessionId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, sessionId));
      console.log(`🗑️ Status removido para sessionId: ${sessionId}`);
    } catch (error) {
      console.error('Erro ao remover status:', error);
    }
  }
}