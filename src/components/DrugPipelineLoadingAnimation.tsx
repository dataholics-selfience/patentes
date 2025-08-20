import { useState, useEffect } from 'react';
import { FlaskConical, Globe, Building2, TestTube, FileText, TrendingUp, Microscope, Shield, DollarSign, BarChart3, X } from 'lucide-react';

interface DrugPipelineLoadingAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
  searchTerm?: string;
  onCancel?: () => void;
}

const DrugPipelineLoadingAnimation = ({ 
  isVisible, 
  onComplete, 
  searchTerm = "novo medicamento",
  onCancel
}: DrugPipelineLoadingAnimationProps) => {
  const [currentStage, setCurrentStage] = useState(0); 
  const [progress, setProgress] = useState(0);

  const stages = [
    {
      id: 0,
      title: "Analisando patentes globais",
      subtitle: "Verificando propriedade intelectual em INPI, USPTO, EPO, WIPO",
      icon: Shield,
      color: "from-red-400 to-red-600",
      duration: 8000
    },
    {
      id: 1,
      title: "Coletando dados de preços internacionais",
      subtitle: "Benchmarking de preços em mercados globais",
      icon: DollarSign,
      color: "from-green-400 to-green-600",
      duration: 6000
    },
    {
      id: 2,
      title: "Consultando agências regulatórias",
      subtitle: "FDA, EMA, ANVISA, Health Canada, TGA, PMDA",
      icon: Building2,
      color: "from-orange-400 to-orange-600",
      duration: 10000
    },
    {
      id: 3,
      title: "Analisando mercado e competidores",
      subtitle: "Calculando TAM SAM SOM e análise SWOT",
      icon: BarChart3,
      color: "from-purple-400 to-purple-600",
      duration: 7000
    },
    {
      id: 4,
      title: "Criando medicamento inovador",
      subtitle: "IA desenvolvendo nova formulação e estrutura química",
      icon: Microscope,
      color: "from-blue-400 to-blue-600",
      duration: 12000
    },
    {
      id: 5,
      title: "Gerando documentação regulatória",
      subtitle: "Preparando dossiês para registro de patente",
      icon: FileText,
      color: "from-indigo-400 to-indigo-600",
      duration: 8000
    },
    {
      id: 6,
      title: "Finalizando pipeline completo",
      subtitle: "Compilando análise estratégica e projeções financeiras",
      icon: TrendingUp,
      color: "from-pink-400 to-pink-600",
      duration: 5000
    }
  ];

  useEffect(() => {
    if (!isVisible) return;

    const intervals: NodeJS.Timeout[] = [];
    const timeouts: NodeJS.Timeout[] = [];

    const startStage = (stageIndex: number) => {
      if (stageIndex >= stages.length) {
        onComplete?.();
        return;
      }

      setCurrentStage(stageIndex);
      setProgress(0);

      const stageDuration = stages[stageIndex].duration;
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
    };

    startStage(0);

    return () => {
      intervals.forEach(interval => clearInterval(interval));
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  const currentStageData = stages[currentStage] || stages[0];
  const Icon = currentStageData?.icon || FlaskConical;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900 flex items-center justify-center z-50">
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        {/* Botão de cancelar */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-2 text-white hover:text-red-400 transition-colors"
            title="Cancelar criação de pipeline"
          >
            <X size={24} />
          </button>
        )}
        
        {/* Animated Laboratory Flask */}
        <div className="mb-12 relative">
          <div className="relative mx-auto w-32 h-48">
            {/* Flask container */}
            <div className="absolute inset-x-0 top-12 bottom-4 mx-auto" style={{ width: '5rem' }}>
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-100 ease-out shadow-lg"
                style={{
                  clipPath: 'polygon(20% 0%, 80% 0%, 95% 100%, 5% 100%)',
                  borderRadius: '0 0 2.5rem 2.5rem'
                }}
              >
                {/* Liquid with gradient based on current stage */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${currentStageData?.color || 'from-blue-400 to-blue-600'} transition-all duration-500 ease-out rounded-b-full`}
                  style={{ height: `${progress}%` }}
                >
                  {/* Bubbles animation */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute border-3 border-white rounded-full"
                        style={{
                          width: `${8 + (i % 3) * 4}px`,
                          height: `${8 + (i % 3) * 4}px`,
                          left: `${15 + (i * 10)}%`,
                          bottom: `${5 + (i * 12)}%`,
                          opacity: 0.3,
                          backgroundColor: 'transparent',
                          animation: `bubble-float-gentle ${6 + (i % 3) * 2}s ease-in-out infinite`,
                          animationDelay: `${i * 0.8}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rotating molecules around flask */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '15s' }}>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-white rounded-full opacity-60"
                  style={{
                    left: `${50 + 40 * Math.cos((i * 60) * Math.PI / 180)}%`,
                    top: `${50 + 40 * Math.sin((i * 60) * Math.PI / 180)}%`,
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
        <div className="mb-6">
          <p className="text-2xl font-bold text-blue-300">{searchTerm}</p>
          <p className="text-sm text-blue-200 mt-1">Pipeline em desenvolvimento</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-200 text-sm">Progresso da Fase</span>
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

        {/* Pipeline Information */}
        <div className="text-white">
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-lg font-medium">
              Criando pipeline farmacêutico completo
            </span>
          </div>
          
          <div className="mt-6 text-sm text-blue-200 max-w-md mx-auto text-center">
            Analisando patentes, preços, regulamentações e criando medicamento inovador com documentação completa para registro.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugPipelineLoadingAnimation;