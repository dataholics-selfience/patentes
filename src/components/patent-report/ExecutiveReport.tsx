import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Building, AlertTriangle, Lightbulb, TrendingUp, Pill, Shield, Target } from 'lucide-react';

interface ExecutiveReportProps {
  relatorio: {
    panorama_geral: string;
    titular_dominante: string;
    barreiras_criticas: string;
    janelas_oportunidade: string;
    estrategia_extensao: string;
    formulacoes_avancadas: string;
    risco_infracao: string;
    recomendacoes: string;
  };
}

interface Section {
  key: keyof ExecutiveReportProps['relatorio'];
  title: string;
  icon: React.ReactNode;
  color: string;
}

const ExecutiveReport = ({ relatorio }: ExecutiveReportProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const sections: Section[] = [
    { key: 'panorama_geral', title: 'Panorama Geral', icon: <FileText size={18} />, color: 'text-blue-600' },
    { key: 'titular_dominante', title: 'Titular Dominante', icon: <Building size={18} />, color: 'text-orange-600' },
    { key: 'barreiras_criticas', title: 'Barreiras Críticas', icon: <AlertTriangle size={18} />, color: 'text-red-600' },
    { key: 'janelas_oportunidade', title: 'Janelas de Oportunidade', icon: <Lightbulb size={18} />, color: 'text-yellow-600' },
    { key: 'estrategia_extensao', title: 'Estratégia de Extensão', icon: <TrendingUp size={18} />, color: 'text-green-600' },
    { key: 'formulacoes_avancadas', title: 'Formulações Avançadas', icon: <Pill size={18} />, color: 'text-purple-600' },
    { key: 'risco_infracao', title: 'Risco de Infração', icon: <Shield size={18} />, color: 'text-pink-600' },
    { key: 'recomendacoes', title: 'Recomendações', icon: <Target size={18} />, color: 'text-teal-600' }
  ];

  const toggleSection = (key: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSections(newExpanded);
  };

  const getPreview = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.slice(0, 2).join(' ').substring(0, 150) + (text.length > 150 ? '...' : '');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Relatório Executivo</h2>

      <div className="space-y-3">
        {sections.map((section) => {
          const content = relatorio[section.key];
          const isExpanded = expandedSections.has(section.key);

          return (
            <div
              key={section.key}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
            >
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className={section.color}>{section.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">{section.title}</h3>
                    {!isExpanded && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {getPreview(content)}
                      </p>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="text-gray-400 flex-shrink-0" size={20} />
                ) : (
                  <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-0 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{content}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutiveReport;
