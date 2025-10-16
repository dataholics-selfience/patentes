import { FileText, Shield, AlertTriangle, Building } from 'lucide-react';

interface HeroCardsProps {
  totalPatentes: number;
  inpi: number;
  epo: number;
  anosProtecao: number;
  patentesAltaAmeaca: number;
  titularDominante: string;
  concentracaoTitular: number;
}

const HeroCards = ({
  totalPatentes,
  inpi,
  epo,
  anosProtecao,
  patentesAltaAmeaca,
  titularDominante,
  concentracaoTitular
}: HeroCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[120px] flex items-center">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
          <FileText className="text-blue-600" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-gray-900">{totalPatentes}</p>
          <p className="text-sm text-gray-600 font-medium">Total Patentes</p>
          <p className="text-xs text-gray-500 mt-1">INPI: {inpi} | EPO: {epo}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[120px] flex items-center">
        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
          <Shield className="text-green-600" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-2xl font-bold text-gray-900">{anosProtecao}</p>
          <p className="text-sm text-gray-600 font-medium">Anos de Proteção</p>
          <p className="text-xs text-gray-500 mt-1">Proteção média estimada</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[120px] flex items-center">
        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-gray-900">{patentesAltaAmeaca}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">
              ALTA
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium">Patentes Alta Ameaça</p>
          <p className="text-xs text-gray-500 mt-1">Requer atenção imediata</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-[120px] flex items-center">
        <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
          <Building className="text-orange-600" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">{titularDominante}</p>
          <p className="text-sm text-gray-600 font-medium">Titular Dominante</p>
          <p className="text-xs text-gray-500 mt-1">{concentracaoTitular}% do portfólio</p>
        </div>
      </div>
    </div>
  );
};

export default HeroCards;
