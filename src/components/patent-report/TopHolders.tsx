import { Building2 } from 'lucide-react';

interface TopHolder {
  titular: string;
  quantidade: number;
}

interface TopHoldersProps {
  holders: TopHolder[];
  totalPatentes: number;
}

const TopHolders = ({ holders, totalPatentes }: TopHoldersProps) => {
  const top5 = holders.slice(0, 5);

  if (top5.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Principais Titulares</h3>
        <p className="text-gray-500 text-center py-8">Dados não disponíveis</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="text-orange-600" size={20} />
        <h3 className="text-lg font-bold text-gray-900">Principais Titulares</h3>
      </div>

      <div className="space-y-4">
        {top5.map((holder, index) => {
          const percentage = (holder.quantidade / totalPatentes) * 100;
          const colors = [
            'bg-blue-500',
            'bg-green-500',
            'bg-orange-500',
            'bg-purple-500',
            'bg-pink-500'
          ];

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-900 truncate flex-1 mr-2">
                  {holder.titular}
                </span>
                <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                  {holder.quantidade}
                </span>
              </div>
              <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`${colors[index]} h-full rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% do total</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopHolders;
