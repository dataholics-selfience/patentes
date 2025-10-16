// Componente para simular atualizações de status do webhook (para testes)
import { useState } from 'react';
import { WebhookStatusStore } from '../utils/webhookStatusStore';

interface WebhookStatusUpdaterProps {
  sessionId: string;
}

const WebhookStatusUpdater = ({ sessionId }: WebhookStatusUpdaterProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const simulateWebhookProgress = async () => {
    setIsUpdating(true);
    
    try {
      // Simular progresso
      await WebhookStatusStore.updateStatus(sessionId, 'processing', undefined, undefined, 25);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await WebhookStatusStore.updateStatus(sessionId, 'processing', undefined, undefined, 50);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await WebhookStatusStore.updateStatus(sessionId, 'processing', undefined, undefined, 75);
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Simular conclusão com dados
      const mockData = {
        patentes: [{
          patente_vigente: true,
          data_expiracao_patente_principal: "2026-07-01",
          exploracao_comercial: true
        }],
        quimica: {
          molecular_formula: "C187H291N45O59",
          molecular_weight: "4113.58"
        }
      };
      
      await WebhookStatusStore.updateStatus(sessionId, 'completed', mockData);
      
    } catch (error) {
      console.error('Erro ao simular progresso:', error);
      await WebhookStatusStore.updateStatus(sessionId, 'error', undefined, 'Erro na simulação');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg">
      <h3 className="font-bold mb-2">Webhook Simulator</h3>
      <p className="text-sm mb-2">SessionId: {sessionId}</p>
      <button
        onClick={simulateWebhookProgress}
        disabled={isUpdating}
        className={`px-4 py-2 rounded ${
          isUpdating 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isUpdating ? 'Simulando...' : 'Simular Webhook'}
      </button>
    </div>
  );
};

export default WebhookStatusUpdater;