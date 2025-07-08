import { useState, useEffect } from 'react';
import { FlaskConical, Globe, Building2, MapPin, TrendingUp } from 'lucide-react';

interface PatentLoadingAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

const PatentLoadingAnimation = ({ isVisible, onComplete }: PatentLoadingAnimationProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  const stages = [
    {
      id: 0,
      title: "Pesquisando no Brasil por acesso ao INPI",
      subtitle: "Consultando Instituto Nacional da Propriedade Industrial",
      icon: Building2,
      color: "from-green-400 to-green-600",
      duration: 6000 // 6 seconds
    },
    {
      id: 1,
      title: "Pesquisando em centros de propriedade intelectual europeus",
      subtitle: "Acessando European Patent Office e União Europeia",
      icon: Globe,
      color: "from-blue-400 to-blue-600",
      duration: 6000 // 6 seconds
    },
    {
      id: 2,
      title: "Buscando nos Estados Unidos a patente",
      subtitle: "Consultando USPTO - United States Patent Office",
      icon: Building2,
      color: "from-red-400 to-red-600",
      duration: 6000 // 6 seconds
    },
    {
      id: 3,
      title: "Rastreando registros na América Latina",
      subtitle: "Verificando patentes em países latino-americanos",
      icon: MapPin,
      color: "from-yellow-400 to-orange-600",
      duration: 6000 // 6 seconds
    },
    {
      id: 4,
      title: "Pesquisando profundamente formas de exploração comercial",
      subtitle: "Analisando oportunidades de mercado e riscos regulatórios",
      icon: TrendingUp,
      color: "from-purple-400 to-purple-600",
      duration: 6000 // 6 seconds
    }
  ];

  const totalDuration = stages.reduce((sum, stage) => sum + stage.duration, 0); // 30 seconds total

  useEffect(() => {
    if (!isVisible) return;

    let progressInterval: number;
    let stageTimeout: number;
    let overallProgressInterval: number;
    let startTime = Date.now();

    // Overall progress tracker
    overallProgressInterval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const overallProg = Math.min((elapsed / totalDuration) * 100, 100);
      setOverallProgress(overallProg);
    }, 50);

    const startStage = (stageIndex: number) => {
      if (stageIndex >= stages.length) {
        // Animation completed, but don't call onComplete yet
        // The parent component will call onComplete when webhook responds
        return;
      }

      setCurrentStage(stageIndex);
      setProgress(0);

      const stageDuration = stages[stageIndex].duration;
      const progressIncrement = 100 / (stageDuration / 50);

      progressInterval = window.setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + progressIncrement;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 50);

      stageTimeout = window.setTimeout(() => {
        clearInterval(progressInterval);
        startStage(stageIndex + 1);
      }, stageDuration);
    };

    startStage(0);

    return () => {
      clearInterval(progressInterval);
      clearInterval(overallProgressInterval);
      clearTimeout(stageTimeout);
    };
  }, [isVisible, totalDuration]);

  if (!isVisible) return null;

  const currentStageData = stages[currentStage] || stages[stages.length - 1];
  const Icon = currentStageData?.icon || FlaskConical;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center z-50">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Animated Test Tube */}
        <div className="mb-12 relative">
          <div className="relative mx-auto w-32 h-48">
            {/* Test tube container */}
            <div className="absolute inset-x-0 top-8 bottom-0 w-16 mx-auto">
              <div className="w-full h-full bg-gradient-to-b from-transparent via-blue-200/30 to-blue-400/50 rounded-b-full border-4 border-white/40 relative overflow-hidden">
                {/* Liquid animation based on overall progress */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${currentStageData?.color || 'from-blue-400 to-blue-600'} transition-all duration-500 ease-out rounded-b-full`}
                  style={{ height: `${overallProgress}%` }}
                >
                  {/* Hollow bubbles with 20% opacity */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute border-2 border-white rounded-full animate-bounce"
                        style={{
                          width: `${8 + (i % 3) * 4}px`,
                          height: `${8 + (i % 3) * 4}px`,
                          left: `${15 + (i * 10)}%`,
                          bottom: `${5 + (i * 8)}%`,
                          opacity: 0.2,
                          backgroundColor: 'transparent',
                          animationDelay: `${i * 0.3}s`,
                          animationDuration: `${1.5 + (i % 2) * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Test tube top */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white/40 rounded-t-lg border-4 border-white/40" />
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

        {/* Current Stage Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200 text-sm">Progresso do Estágio</span>
            <span className="text-blue-200 text-sm">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className={`h-full bg-gradient-to-r ${currentStageData?.color || 'from-blue-400 to-blue-600'} rounded-full transition-all duration-100 ease-out shadow-lg`}
              style={{ width: `${progress}%` }}
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
              className="h-full bg-gradient-to-r from-blue-400 via-purple-500 to-green-500 rounded-full transition-all duration-200 ease-out shadow-lg"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-blue-200 text-xs">
            <span>Estágio {currentStage + 1} de {stages.length}</span>
            <span>{Math.round((overallProgress / 100) * 30)}s / 30s</span>
          </div>
        </div>

        {/* Stage Indicators */}
        <div className="flex justify-center space-x-4 mb-8">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
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
        <div className="text-blue-200">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-lg font-medium">
              {overallProgress >= 100 ? 'Aguardando resposta do servidor...' : 'Analisando propriedade intelectual'}
            </span>
          </div>
          
          {overallProgress >= 100 && (
            <div className="mt-4 text-yellow-300 animate-pulse">
              <p className="text-sm">A análise foi concluída. Aguardando processamento final dos dados...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentLoadingAnimation;