import { useState, useEffect } from 'react';
import { FlaskConical, Globe, Building2, TestTube, FileText, TrendingUp, Hourglass, CheckCircle, Clock, X } from 'lucide-react';
import { PollingProgress } from '../utils/webhookPoller';

interface PatentLoadingAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  searchTerm?: string;
  pollingProgress?: PollingProgress;
  onCancel?: () => void;
}

const PatentLoadingAnimation = ({ 
  isVisible, 
  onComplete, 
  searchTerm = "medicamento",
  pollingProgress,
  onCancel
}: PatentLoadingAnimationProps) => {
  const [currentStage, setCurrentStage] = useState(0); 
  const [progress, setProgress] = useState(0);
  const [isWaitingForWebhook, setIsWaitingForWebhook] = useState(false);

  const stages = [
    {
      id: 0,
      title: "Enviando consulta para análise",
      subtitle: "Iniciando processamento da consulta de patente",
      icon: FlaskConical,
      color: "from-blue-400 to-blue-600",
      duration: 3000
    },
    {
      id: 1,
      title: "Consultando bases de patentes globais",
      subtitle: "Acessando INPI, USPTO, EPO e WIPO",
      icon: Building2,
      color: "from-green-400 to-green-600",
      duration: 5000
    },
    {
      id: 2,
      title: "Analisando propriedade intelectual",
      subtitle: "Verificando status de patentes em múltiplas jurisdições",
      icon: Globe,
      color: "from-purple-400 to-purple-600",
      duration: 7000
    },
    {
      id: 3,
      title: "Consultando ensaios clínicos",
      subtitle: "Buscando dados em ClinicalTrials.gov",
      icon: TestTube,
      color: "from-orange-400 to-orange-600",
      duration: 10000
    },
    {
      id: 4,
      title: "Verificando regulamentações",
      subtitle: "Analisando FDA Orange Book e regulações",
      icon: FileText,
      color: "from-pink-400 to-pink-600",
      duration: 12000
    },
    {
      id: 5,
      title: "Calculando score de oportunidade",
      subtitle: "Processando análise final e gerando relatório",
      icon: TrendingUp,
      color: "from-yellow-400 to-yellow-600",
      duration: 15000
    },
    {
      id: 6,
      title: "Aguardando processamento completo",
      subtitle: "Verificando se a análise foi finalizada...",
      icon: Hourglass,
      color: "from-indigo-400 to-indigo-600",
      duration: Infinity // Duração infinita - controlada pelo polling
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];

    const startStage = (stageIndex: number) => {
      if (stageIndex >= stages.length) return;

      setCurrentStage(stageIndex);
      setProgress(0);

      const stageDuration = stages[stageIndex].duration;
      const isLastStage = stageIndex === stages.length - 1;

      if (isLastStage) {
        // Último estágio - aguardando webhook
        setIsWaitingForWebhook(true);
        setProgress(10); // Começar com 10%
      } else {
        // Estágios normais com progresso automático
        const updateInterval = 100;
        const progressIncrement = 100 / (stageDuration / updateInterval);

        const progressInterval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + progressIncrement;
            if (newProgress >= 100) {
              clearInterval(progressInterval);
              return 100;
            }
            return newProgress;
          });
        }, updateInterval);
        intervals.push(progressInterval);

        const stageTimeout = setTimeout(() => {
          clearInterval(progressInterval);
          startStage(stageIndex + 1);
        }, stageDuration);
        timeouts.push(stageTimeout);
      }
    };

    startStage(0);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isVisible]);

  // Atualizar progresso baseado no polling real
  useEffect(() => {
    if (isWaitingForWebhook && pollingProgress) {
      const { attempt, timeElapsed } = pollingProgress;
      
      // Progresso baseado no tempo (10% a 90%)
      const timeProgress = Math.min((timeElapsed / 150000) * 80, 80); // 2.5 minutos = 80%
      
      // Progresso baseado nas tentativas (suavizar)
      const attemptProgress = Math.min(attempt * 2, 10); // Máximo 10% das tentativas
      
      const totalProgress = Math.min(10 + timeProgress + attemptProgress, 95);
      setProgress(totalProgress);
    }
  }, [pollingProgress, isWaitingForWebhook]);

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  const formatEstimatedTime = (ms?: number): string => {
    if (!ms) return '';
    return ` (estimativa: ${formatTime(ms)})`;
  };

  if (!isVisible) return null;

  const currentStageData = stages[currentStage] || stages[stages.length - 1];
  const Icon = currentStageData?.icon || FlaskConical;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center z-50">
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Botão de cancelar */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-white hover:text-red-400 transition-colors"
            title="Cancelar consulta"
          >
            <X size={24} />
          </button>
        )}
        
        {/* Animated Test Tube */}
        <div className="mb-12 relative">
          <div className="relative mx-auto w-32 h-48">
            <div className="absolute inset-x-0 top-12 bottom-4 mx-auto" style={{ width: '5rem' }}>
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-100 ease-out shadow-lg"
                style={{
                  clipPath: 'polygon(20% 0%, 80% 0%, 95% 100%, 5% 100%)',
                  borderRadius: '0 0 2.5rem 2.5rem'
                }}
              >
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${currentStageData?.color || 'from-blue-400 to-blue-600'} transition-all duration-500 ease-out rounded-b-full`}
                  style={{ height: `${progress}%` }}
                >
                  <div className="absolute inset-0">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute border-3 border-white rounded-full"
                        style={{
                          width: `${12 + (i % 3) * 6}px`,
                          height: `${12 + (i % 3) * 6}px`,
                          left: `${20 + (i * 12)}%`,
                          bottom: `${10 + (i * 15)}%`,
                          opacity: 0.15,
                          backgroundColor: 'transparent',
                          animation: `bubble-float-gentle ${8 + (i % 3) * 2}s ease-in-out infinite`,
                          animationDelay: `${i * 1.5}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '10s' }}>
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-40"
                  style={{
                    left: `${50 + 45 * Math.cos((i * 45) * Math.PI / 180)}%`,
                    top: `${50 + 45 * Math.sin((i * 45) * Math.PI / 180)}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stage Information */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentStageData?.color || 'from-blue-400 to-blue-600'} flex items-center justify-center shadow-2xl animate-glow`}>
              <Icon size={32} className="text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-3 animate-fade-in">
            {currentStageData?.title}
          </h2>
          
          <p className="text-blue-200 text-lg animate-fade-in">
            {currentStageData?.subtitle}
          </p>
        </div>

        {/* Search Term */}
        <div className="mb-4">
          <p className="text-3xl font-bold text-blue-600">{searchTerm}</p>
          <p className="text-sm text-gray-500 mt-1">Termo de busca utilizado na consulta</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200 text-sm">Progresso</span>
            <span className="text-blue-200 text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${currentStageData?.color || 'from-blue-400 to-blue-600'} rounded-full transition-all duration-300 ease-out shadow-lg`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-center space-x-3 mb-8">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index < currentStage 
                  ? 'bg-green-400 shadow-lg shadow-green-400/50' 
                  : index === currentStage 
                    ? `bg-gradient-to-r ${currentStageData?.color} shadow-lg animate-pulse` 
                    : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Status Information */}
        <div className="text-white">
          {isWaitingForWebhook && pollingProgress ? (
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center space-x-2">
                <Clock size={20} className="text-white animate-pulse" />
                <span className="text-lg font-medium text-white">
                  Aguardando processamento completo...
                </span>
              </div>
              
              <div className="bg-blue-800/50 rounded-lg p-4 max-w-md">
                <div className="text-sm text-blue-200 space-y-1">
                  <div className="flex justify-between">
                    <span>Verificação:</span>
                    <span>#{pollingProgress.attempt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tempo decorrido:</span>
                    <span>{formatTime(pollingProgress.timeElapsed)}</span>
                  </div>
                  {pollingProgress.estimatedTimeRemaining && (
                    <div className="flex justify-between">
                      <span>Tempo estimado:</span>
                      <span>{formatTime(pollingProgress.estimatedTimeRemaining)}</span>
                    </div>
                  )}
                  {pollingProgress.forceRenderIn !== undefined && pollingProgress.forceRenderIn > 0 && (
                    <div className="flex justify-between">
                      <span>Renderização forçada em:</span>
                      <span className="text-blue-300 font-medium">{formatTime(pollingProgress.forceRenderIn)}</span>
                    </div>
                  )}
                  {pollingProgress.forceRenderIn !== undefined && pollingProgress.forceRenderIn <= 0 && (
                    <div className="text-center">
                      <span className="text-yellow-300 font-bold animate-pulse">🚨 FORÇANDO RENDERIZAÇÃO...</span>
                    </div>
                  )}
                  <div className="text-xs text-blue-300 mt-2">
                    Última verificação: {new Date(pollingProgress.lastCheck).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-blue-300 max-w-md text-center">
                {pollingProgress.forceRenderIn !== undefined && pollingProgress.forceRenderIn > 0 ? (
                  <>
                    ⏱️ <strong>Webhook pode demorar até 5 minutos para processar completamente.</strong><br/>
                    O sistema verifica a cada 10 segundos. Renderização forçada em <strong>{formatTime(pollingProgress.forceRenderIn)}</strong> se necessário.
                  </>
                ) : (
                  <>
                    ⏱️ <strong>Aguardando processamento completo do webhook...</strong><br/>
                    O sistema verifica automaticamente a cada 10 segundos. Aguardaremos até 5 minutos para forçar a renderização se necessário.
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-lg font-medium">
                Analisando propriedade intelectual
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentLoadingAnimation;