import { PieChart, BarChart3, Database } from 'lucide-react';

interface Patent {
  fonte: string;
  nivel_ameaca: string | null;
  tipo_barreira: string | null;
}

interface DistributionMetricsProps {
  patents: Patent[];
  inpi: number;
  epo: number;
}

const DistributionMetrics = ({ patents, inpi, epo }: DistributionMetricsProps) => {
  const countByThreat = {
    alta: patents.filter(p => p.nivel_ameaca?.toLowerCase() === 'alta').length,
    média: patents.filter(p => p.nivel_ameaca?.toLowerCase() === 'média').length,
    baixa: patents.filter(p => p.nivel_ameaca?.toLowerCase() === 'baixa').length
  };

  const barrierCounts = patents.reduce((acc, patent) => {
    if (patent.tipo_barreira) {
      acc[patent.tipo_barreira] = (acc[patent.tipo_barreira] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topBarriers = Object.entries(barrierCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const total = inpi + epo;
  const inpiPercentage = (inpi / total) * 100;
  const epoPercentage = (epo / total) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="text-red-600" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Distribuição por Ameaça</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Alta</span>
            </div>
            <span className="text-lg font-bold text-red-600">{countByThreat.alta}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Média</span>
            </div>
            <span className="text-lg font-bold text-yellow-600">{countByThreat.média}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">Baixa</span>
            </div>
            <span className="text-lg font-bold text-green-600">{countByThreat.baixa}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Total: {countByThreat.alta + countByThreat.média + countByThreat.baixa} patentes classificadas
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Database className="text-purple-600" size={20} />
          <h3 className="text-lg font-bold text-gray-900">Tipos de Barreira</h3>
        </div>

        <div className="space-y-2">
          {topBarriers.length > 0 ? (
            topBarriers.map(([barrier, count], idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700 truncate flex-1 mr-2">{barrier}</span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-700">
                  {count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Nenhuma barreira classificada</p>
          )}
        </div>

        {topBarriers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Top 5 de {Object.keys(barrierCounts).length} tipos identificados
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="text-blue-600" size={20} />
          <h3 className="text-lg font-bold text-gray-900">INPI vs EPO</h3>
        </div>

        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#2563EB"
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={`${inpiPercentage * 3.51} 351.86`}
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#10B981"
                strokeWidth="16"
                fill="transparent"
                strokeDasharray={`${epoPercentage * 3.51} 351.86`}
                strokeDashoffset={`-${inpiPercentage * 3.51}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{total}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">INPI</span>
            </div>
            <span className="text-sm font-bold text-blue-700">{inpi} ({inpiPercentage.toFixed(1)}%)</span>
          </div>

          <div className="flex items-center justify-between p-2 bg-green-50 rounded">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">EPO</span>
            </div>
            <span className="text-sm font-bold text-green-700">{epo} ({epoPercentage.toFixed(1)}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributionMetrics;
