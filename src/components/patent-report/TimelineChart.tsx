import { TrendingUp } from 'lucide-react';

interface TimelineData {
  ano: string;
  quantidade: number;
}

interface TimelineChartProps {
  timeline: TimelineData[];
}

const TimelineChart = ({ timeline }: TimelineChartProps) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Evolução Temporal</h3>
        <p className="text-gray-500 text-center py-8">Dados não disponíveis</p>
      </div>
    );
  }

  const maxQuantidade = Math.max(...timeline.map(t => t.quantidade));
  const sortedTimeline = [...timeline].sort((a, b) => parseInt(a.ano) - parseInt(b.ano));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="text-blue-600" size={20} />
        <h3 className="text-lg font-bold text-gray-900">Evolução Temporal</h3>
      </div>

      <div className="space-y-3">
        {sortedTimeline.map((item) => {
          const percentage = (item.quantidade / maxQuantidade) * 100;

          return (
            <div key={item.ano} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 w-12">{item.ano}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                  style={{ width: `${Math.max(percentage, 8)}%` }}
                >
                  <span className="text-xs font-bold text-white">{item.quantidade}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Total: {sortedTimeline.reduce((sum, item) => sum + item.quantidade, 0)} patentes</span>
          <span>Período: {sortedTimeline[0]?.ano} - {sortedTimeline[sortedTimeline.length - 1]?.ano}</span>
        </div>
      </div>
    </div>
  );
};

export default TimelineChart;
