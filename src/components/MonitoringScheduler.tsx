import { useState, useEffect } from 'react';
import { ArrowLeft, Timer, Clock, Calendar, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { ConsultaCompleta } from '../types';
import { MonitoringManager } from '../utils/monitoringManager';
import { auth } from '../firebase';

interface MonitoringSchedulerProps {
  consulta: ConsultaCompleta;
  onClose: () => void;
  onScheduled: (consultaId: string, intervalHours: number) => void;
}

const INTERVAL_OPTIONS = [
  { hours: 0.1667, label: '10 minutos', description: 'Monitoramento ultra-intensivo' },
  { hours: 1, label: '1 hora', description: 'Monitoramento intensivo' },
  { hours: 6, label: '6 horas', description: 'Monitoramento frequente' },
  { hours: 12, label: '12 horas', description: 'Duas vezes por dia' },
  { hours: 24, label: '24 horas', description: 'Diário' },
  { hours: 72, label: '3 dias', description: 'Três vezes por semana' },
  { hours: 168, label: '7 dias', description: 'Semanal' },
  { hours: 720, label: '30 dias', description: 'Mensal' }
];

const MonitoringScheduler = ({ consulta, onClose, onScheduled }: MonitoringSchedulerProps) => {
  const [selectedInterval, setSelectedInterval] = useState(24); // 24 horas por padrão
  const [isTestMode, setIsTestMode] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleScheduleMonitoring = async () => {
    if (!auth.currentUser) {
      setError('Usuário não autenticado');
      return;
    }

    setIsScheduling(true);
    setError('');
    setSuccess('');

    try {
      await MonitoringManager.scheduleMonitoring(
        consulta.id,
        auth.currentUser.uid,
        selectedInterval,
        {
          nome_comercial: consulta.nome_comercial,
          nome_molecula: consulta.nome_molecula,
          categoria: consulta.categoria,
          beneficio: consulta.beneficio,
          doenca_alvo: consulta.doenca_alvo,
          pais_alvo: consulta.pais_alvo,
          userCompany: consulta.userCompany,
          sessionId: consulta.sessionId,
          environment: isTestMode ? 'test' : consulta.environment
        }
      );

      setSuccess('Monitoramento agendado com sucesso!');
      onScheduled(consulta.id, selectedInterval);
      
      // Fechar após 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error scheduling monitoring:', error);
      setError(error instanceof Error ? error.message : 'Erro ao agendar monitoramento');
    } finally {
      setIsScheduling(false);
    }
  };

  const getNextRunTime = () => {
    const now = new Date();
    const nextRun = new Date(now.getTime() + selectedInterval * 60 * 60 * 1000);
    return nextRun.toLocaleString('pt-BR');
  };

  const selectedOption = INTERVAL_OPTIONS.find(option => option.hours === selectedInterval);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <Timer size={32} className="text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Configurar Monitoramento Automático</h2>
                <p className="text-gray-600">Agende reconsultas periódicas para detectar mudanças</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informações da Consulta */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-bold text-blue-900 mb-3">Consulta a ser monitorada:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700 font-medium">Produto:</span>
              <p className="text-blue-900">{consulta.nome_comercial} ({consulta.nome_molecula})</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Categoria:</span>
              <p className="text-blue-900">{consulta.categoria}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Benefício:</span>
              <p className="text-blue-900">{consulta.beneficio}</p>
            </div>
            <div>
              <span className="text-blue-700 font-medium">Países:</span>
              <p className="text-blue-900">{consulta.pais_alvo.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Seleção de Intervalo */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-green-600" />
            Frequência de Monitoramento
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {INTERVAL_OPTIONS.map((option) => (
              <label
                key={option.hours}
                className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedInterval === option.hours
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="interval"
                  value={option.hours}
                  checked={selectedInterval === option.hours}
                  onChange={(e) => setSelectedInterval(parseInt(e.target.value))}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedInterval === option.hours
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedInterval === option.hours && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <span className="font-bold text-gray-900">{option.label}</span>
                </div>
                <span className="text-sm text-gray-600">{option.description}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Modo de Teste */}
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-yellow-900 mb-1">Modo de Teste</h4>
              <p className="text-sm text-yellow-800">
                Ativar para usar webhook de testes durante o monitoramento
              </p>
            </div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isTestMode}
                onChange={(e) => setIsTestMode(e.target.checked)}
                className="rounded text-yellow-600 focus:ring-yellow-500"
              />
              <span className="text-sm font-medium text-yellow-900">
                {isTestMode ? 'Modo Teste Ativo' : 'Modo Produção'}
              </span>
            </label>
          </div>
          {isTestMode && (
            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
              <strong>⚠️ Atenção:</strong> O monitoramento usará o webhook de testes: 
              <code className="ml-1 font-mono">webhook-test/patentesdev-monitor</code>
            </div>
          )}
        </div>

        {/* Informações do Agendamento */}
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-purple-600" />
            Detalhes do Agendamento
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Frequência:</span>
              <span className="font-medium">{selectedOption?.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Próxima execução:</span>
              <span className="font-medium">{getNextRunTime()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tipo:</span>
              <span className="font-medium">Reconsulta automática</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ambiente:</span>
              <span className={`font-medium ${isTestMode ? 'text-yellow-600' : 'text-green-600'}`}>
                {isTestMode ? 'Teste' : 'Produção'}
              </span>
            </div>
          </div>
        </div>

        {/* Mensagens de Status */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            <span className="text-red-600">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="text-green-600">{success}</span>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isScheduling}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <X size={16} />
            Cancelar
          </button>
          
          <button
            onClick={handleScheduleMonitoring}
            disabled={isScheduling}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isScheduling ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Agendando...
              </>
            ) : (
              <>
                <Save size={16} />
                Agendar Monitoramento
              </>
            )}
          </button>
        </div>

        {/* Informações Adicionais */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-bold text-yellow-900 mb-2">ℹ️ Como funciona o monitoramento automático:</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• A consulta será repetida automaticamente no intervalo selecionado</li>
            <li>• Cada reconsulta incluirá as últimas 5 consultas realizadas na íntegra</li>
            <li>• O sessionId do usuário será enviado para manter contexto</li>
            <li>• Você será notificado sobre mudanças significativas no status das patentes</li>
            <li>• O monitoramento pode ser pausado ou cancelado a qualquer momento</li>
            <li>• Cada reconsulta consome 1 token do seu plano</li>
            <li>• Há um intervalo mínimo de 1 minuto entre execuções para evitar spam</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MonitoringScheduler;