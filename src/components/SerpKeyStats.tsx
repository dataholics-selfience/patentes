import { useState, useEffect } from 'react';
import { Key, TrendingUp, AlertCircle, CheckCircle, BarChart3, Activity } from 'lucide-react';
import { getSerpKeyManager, ConsultationStats } from '../utils/serpKeyManager';

const SerpKeyStats = () => {
  const [keyStats, setKeyStats] = useState<Array<{
    id: string;
    instance: string;
    usage: number;
    limit: number;
    remaining: number;
    percentage: number;
    isActive: boolean;
    isDev: boolean;
  }>>([]);
  const [consultationStats, setConsultationStats] = useState<ConsultationStats | null>(null);

  useEffect(() => {
    const updateStats = () => {
      const manager = getSerpKeyManager();
      if (manager) {
        const stats = manager.getKeyStats();
        setKeyStats(stats);
        setConsultationStats(manager.getConsultationStats());
        console.log('📊 Stats atualizadas:', { stats, consultationStats: manager.getConsultationStats() });
      }
    };

    updateStats();
    
    // Atualizar a cada 5 segundos para ver mudanças em tempo real
    const interval = setInterval(updateStats, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 90) return <AlertCircle size={16} />;
    if (percentage >= 70) return <TrendingUp size={16} />;
    return <CheckCircle size={16} />;
  };

  if (keyStats.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <Key size={24} className="text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Status das Chaves SERP API</h3>
      </div>

      {/* Estatísticas de Consultas */}
      {consultationStats && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={20} className="text-blue-600" />
            <h4 className="font-semibold text-blue-900">Consultas Realizadas</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{consultationStats.totalConsultations}</div>
              <div className="text-blue-700">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">{consultationStats.consultationsToday}</div>
              <div className="text-green-700">Hoje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{consultationStats.consultationsThisMonth}</div>
              <div className="text-purple-700">Este Mês</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900">{consultationStats.totalCreditsUsed}</div>
              <div className="text-orange-700">Créditos Usados</div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {keyStats.map((key) => (
          <div key={key.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-medium text-gray-900">{key.instance}</span>
                {key.isDev && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                    DEV
                  </span>
                )}
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getStatusColor(key.percentage)}`}>
                {getStatusIcon(key.percentage)}
                <span>{key.percentage}%</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Uso:</span>
                <span className="font-medium">{key.usage}/{key.limit} ({key.remaining} restantes)</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Consultas disponíveis:</span>
                <span className="font-medium text-blue-600">{Math.floor(key.remaining / 8)}</span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    key.percentage >= 90 ? 'bg-red-500' :
                    key.percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${key.percentage}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>💡 As chaves são rotacionadas automaticamente para distribuir o uso de forma equilibrada.</p>
        <p>🔄 Os contadores são resetados automaticamente todo mês.</p>
        <p>⚡ Cada consulta de patente consome exatamente 8 créditos da SERP API.</p>
      </div>
    </div>
  );
};

export default SerpKeyStats;