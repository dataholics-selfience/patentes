import { useState, useEffect } from 'react';
import { FlaskConical, Globe, Building2, MapPin, TrendingUp, FileText, TestTube, Hourglass } from 'lucide-react';

interface PatentLoadingAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  searchTerm?: string;
}

const PatentLoadingAnimation = ({ isVisible, onComplete, searchTerm = "medicamento" }: PatentLoadingAnimationProps) => {
  const [currentStage, setCurrentStage] = useState(0); 
  const [progress, setProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const stages = [
    {
      id: 0,
      title: "Consultando bases de patentes globais",
      subtitle: "Acessando INPI, USPTO, EPO e WIPO",
      icon: Building2,
      color: "from-blue-400 to-blue-600",
      duration: 10000 // 10 seconds
    },
    {
      id: 1,
      title: "Analisando propriedade intelectual por país",
      subtitle: "Verificando status de patentes em múltiplas jurisdições",
      icon: Globe,
      color: "from-green-400 to-green-600",
      duration: 12000 // 12 seconds
    },
    {
      id: 2,
      title: "Consultando ClinicalTrials.gov",
      subtitle: "Buscando ensaios clínicos ativos e em fase avançada",
      icon: TestTube,
      color: "from-purple-400 to-purple-600",
      duration: 15000 // 15 seconds
    },
    {
      id: 3,
      title: "Verificando FDA Orange Book",
      subtitle: "Analisando registros de genéricos e NDA",
      icon: FileText,
      color: "from-orange-400 to-orange-600",
      duration: 18000 // 18 seconds
    },
    {
      id: 4,
      title: "Analisando dados químicos e moleculares",
      subtitle: "Processando estruturas químicas e propriedades",
      icon: FlaskConical,
      color: "from-pink-400 to-pink-600",
      duration: 20000 // 20 seconds
    },
    {
      id: 5,
      title: "Calculando score de oportunidade",
      subtitle: "Avaliando potencial comercial e riscos regulatórios",
      icon: TrendingUp,
      color: "from-yellow-400 to-yellow-600",
      duration: 25000 // 25 seconds
    },
    {
      id: 6,
      title: `Gerando relatório final de patente de ${searchTerm}`,
      subtitle: "Aguarde o carregamento...",
      icon: Hourglass,
      color: "from-indigo-400 to-indigo-600",
      duration: 80000 // 80 seconds - aguardando webhook
    }
  ];

  const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0); // 180 seconds total

  useEffect(() => {
    if (!isVisible) return;

    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];
    let startTime = Date.now();

    // Overall progress tracker
    const overallProgressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const overallProg = Math.min((elapsed / totalDuration) * 100, 100);
      setOverallProgress(overallProg);
    }, 50);
    intervals.push(overallProgressInterval);

    const startStage = (stageIndex: number) => {
      if (stageIndex >= stages.length) {
        return;
      }

      setCurrentStage(stageIndex);
      setProgress(0);

      const stageDuration = stages[stageIndex].duration;
      const isLastStage = stageIndex === stages.length - 1;

      if (isLastStage) {
        // Comportamento especial para o último estágio - aguardando webhook
        let currentProgress = 0;
        
        // Fase 1: Subir rapidamente até 10% e parar por 30 segundos
        const phase1Duration = 2000; // 2 segundos para chegar a 10%
        const phase1Interval = setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + (10 / (phase1Duration / 50));
            if (newProgress >= 10) {
              clearInterval(phase1Interval);
              currentProgress = 10;
              
              // Parar em 10% por 30 segundos
              setTimeout(() => {
                // Fase 2: Subir para 22% em 1 segundo
                const phase2Duration = 1000;
                const phase2Interval = setInterval(() => {
                  setProgress(prev => {
                    const newProgress = prev + (12 / (phase2Duration / 50));
                    if (newProgress >= 22) {
                      clearInterval(phase2Interval);
                      currentProgress = 22;
                      
                      // Parar em 22% por 2 segundos
                      setTimeout(() => {
                        // Fase 3: Subir para 33% rapidamente
                        const phase3Duration = 500;
                        const phase3Interval = setInterval(() => {
                          setProgress(prev => {
                            const newProgress = prev + (11 / (phase3Duration / 50));
                            if (newProgress >= 33) {
                              clearInterval(phase3Interval);
                              currentProgress = 33;
                              
                              // Fase 4: Subir lentamente até 100% no tempo restante
                              const remainingTime = stageDuration - phase1Duration - 30000 - phase2Duration - 2000 - phase3Duration;
                              const phase4Interval = setInterval(() => {
                                setProgress(prev => {
                                  const newProgress = prev + (67 / (remainingTime / 100));
                                  if (newProgress >= 100) {
                                    clearInterval(phase4Interval);
                                    return 100;
                                  }
                                  return newProgress;
                                });
                              }, 100);
                              intervals.push(phase4Interval);
                              
                              return 33;
                            }
                            return newProgress;
                          });
                        }, 50);
                        intervals.push(phase3Interval);
                      }, 2000); // Parar por 2 segundos
                      
                      return 22;
                    }
                    return newProgress;
                  });
                }, 50);
                intervals.push(phase2Interval);
              }, 30000); // Parar por 30 segundos
              
              return 10;
            }
            return newProgress;
          });
        }, 50);
        intervals.push(phase1Interval);

        // Timeout final para o estágio completo
        const stageTimeout = setTimeout(() => {
          if (onComplete) {
            onComplete();
          }
        }, stageDuration);
        timeouts.push(stageTimeout);
      } else {
        // Comportamento normal para outros estágios
        const updateInterval = 50;
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
      // Clear all intervals and timeouts
      intervals.forEach(interval => clearInterval(interval));
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isVisible, totalDuration, searchTerm]);

  if (!isVisible) return null;

  const currentStageData = stages[currentStage] || stages[stages.length - 1];
  const Icon = currentStageData?.icon || FlaskConical;
  const isLastStage = currentStage === stages.length - 1;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center z-50">
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Animated Test Tube */}
        <div className="mb-12 relative">
          <div className="relative mx-auto w-32 h-48">
            {/* Tubo de ensaio simplificado */}
            <div className="absolute inset-x-0 top-12 bottom-4 mx-auto" style={{ width: '5rem' }}>
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-100 ease-out shadow-lg"
                style={{
                  clipPath: 'polygon(20% 0%, 80% 0%, 95% 100%, 5% 100%)',
                  borderRadius: '0 0 2.5rem 2.5rem'
                }}
              >
                {/* Liquid animation based on overall progress */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${currentStageData?.color || 'from-blue-400 to-blue-600'} transition-all duration-500 ease-out rounded-b-full`}
                  style={{ height: `${overallProgress}%` }}
                >
                  {/* Bolhinhas animadas */}
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

            {/* Rotating molecules around test tube */}
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

        <div className="mb-4">
          <p className="text-3xl font-bold text-blue-600">{searchTerm}</p>
          <p className="text-sm text-gray-500 mt-1">Termo de busca utilizado na consulta</p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200 text-sm">Progresso do Estágio</span>
            <span className="text-blue-200 text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${currentStageData?.color || 'from-blue-400 to-blue-600'} rounded-full transition-all duration-100 ease-out shadow-lg`}
              style={{ 
                width: `${progress}%`,
                transition: 'width 0.05s linear'
              }}
            />
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200 text-sm">Progresso Total</span>
            <span className="text-blue-200 text-sm">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-blue-500 rounded-full shadow-lg"
              style={{ 
                width: `${overallProgress}%`,
                transition: 'width 0.05s linear'
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-blue-200 text-xs">
            <span>Estágio {currentStage + 1} de {stages.length}</span>
            <span>{Math.round((overallProgress / 100) * 180)}s / 180s</span>
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

        {/* Loading text */}
        <div className="text-white">
          <div className="flex items-center justify-center space-x-2">
            {isLastStage ? (
              <div className="flex items-center space-x-2">
                <Hourglass size={20} className="text-white animate-pulse" />
                <span className="text-lg font-medium text-white">
                  Processamento final em andamento...
                </span>
              </div>
            ) : (
              <>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-lg font-medium">
                  Analisando propriedade intelectual
                </span>
              </>
            )}
          </div>
          
          {overallProgress >= 100 && (
            <div className="mt-4 text-yellow-300 animate-pulse">
              <p className="text-sm text-white">A análise está sendo finalizada. O webhook está processando múltiplas consultas em tempo real. Aguarde...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentLoadingAnimation;