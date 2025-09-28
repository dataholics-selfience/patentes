import { useState } from 'react';
import { 
  ArrowLeft, 
  Download,
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Award,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart,
  Activity
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useTranslation } from '../utils/translations';
import { translateDashboardData, translateSectionTitle } from '../utils/dashboardTranslations';

interface PatentDashboardReportProps {
  data: any;
  onBack: () => void;
}

// Componente Gauge para Score de Oportunidade
const OpportunityGauge = ({ 
  score, 
  classification, 
  size = 'large' 
}: { 
  score: number; 
  classification: string; 
  size?: 'normal' | 'large';
}) => {
  const radius = size === 'large' ? 120 : 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Verde
    if (score >= 60) return '#F59E0B'; // Amarelo
    if (score >= 40) return '#F97316'; // Laranja
    return '#EF4444'; // Vermelho
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={getColor(score)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-white ${size === 'large' ? 'text-5xl' : 'text-3xl'}`}>
            {score}
          </span>
          <span className={`text-blue-200 ${size === 'large' ? 'text-base' : 'text-sm'}`}>
            de 100
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-white">{classification}</div>
      </div>
    </div>
  );
};

const PatentDashboardReport = ({ data, onBack }: PatentDashboardReportProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { language } = useTranslation();

  // Traduzir dados automaticamente baseado no idioma selecionado
  const translatedData = translateDashboardData(data, language);

  const handleSavePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;
      
      // Título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const title = language === 'en' 
        ? 'PHARMACEUTICAL PRODUCT PIPELINE REPORT'
        : 'RELATÓRIO DE PIPELINE DE PRODUTO FARMACÊUTICO';
      pdf.text(title, margin, yPosition);
      yPosition += 15;
      
      // Produto
      if (translatedData.produto_proposto) {
        pdf.setFontSize(14);
        const productLabel = language === 'en' ? 'Product:' : 'Produto:';
        pdf.text(`${productLabel} ${translatedData.produto_proposto}`, margin, yPosition);
        yPosition += 10;
      }
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const dateLabel = language === 'en' ? 'Date:' : 'Data:';
      pdf.text(`${dateLabel} ${new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'pt-BR')}`, margin, yPosition);
      yPosition += 15;
      
      // Score
      if (translatedData.score_oportunidade?.valor) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        const scoreLabel = language === 'en' ? 'Opportunity Score:' : 'Score de Oportunidade:';
        pdf.text(`${scoreLabel} ${translatedData.score_oportunidade.valor}/100 (${translatedData.score_oportunidade.classificacao})`, margin, yPosition);
        yPosition += 10;
      }
      
      const fileName = language === 'en' 
        ? `pharmaceutical-pipeline-report-${new Date().toISOString().split('T')[0]}.pdf`
        : `relatorio-pipeline-farmaceutico-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      const errorMsg = language === 'en' 
        ? 'Error generating PDF. Please try again.'
        : 'Erro ao gerar PDF. Tente novamente.';
      alert(errorMsg);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Função para renderizar seções dinamicamente
  const renderSection = (title: string, content: any, icon: React.ComponentType<any>) => {
    if (!content) return null;
    
    const IconComponent = icon;
    const translatedTitle = translateSectionTitle(title, language);
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <IconComponent size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{translatedTitle}</h3>
        </div>
        
        <div className="prose prose-gray max-w-none">
          {typeof content === 'string' ? (
            <p className="text-gray-700 leading-relaxed">{content}</p>
          ) : Array.isArray(content) ? (
            <ul className="space-y-2">
              {content.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          ) : typeof content === 'object' ? (
            <div className="space-y-3">
              {Object.entries(content).map(([key, value]) => (
                <div key={key} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-semibold text-gray-900 mb-1">{translateText(key, language)}</div>
                  <div className="text-gray-700">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">{String(content)}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>{language === 'en' ? 'Back' : 'Voltar'}</span>
              </button>
              
              <div className="flex items-center gap-3">
                <img 
                  src="/logo_pharmyrus.png" 
                  alt="Pharmyrus" 
                  className="h-12 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {language === 'en' ? 'Product Pipeline Report' : 'Relatório de Pipeline de Produto'}
                  </h1>
                </div>
              </div>
            </div>

            <button
              onClick={handleSavePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{language === 'en' ? 'Generating PDF...' : 'Gerando PDF...'}</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>{language === 'en' ? 'Export PDF' : 'Exportar PDF'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header do Dashboard com Score */}
        {translatedData.score_oportunidade && (
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações do Produto */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {translatedData.produto_proposto || (language === 'en' ? 'Product Analysis' : 'Análise de Produto')}
                  </h2>
                  {translatedData.consulta?.cliente && (
                    <p className="text-blue-200 text-lg">
                      {language === 'en' ? 'Client:' : 'Cliente:'} {translatedData.consulta.cliente}
                    </p>
                  )}
                </div>

                {/* Informações principais */}
                <div className="space-y-4">
                  {translatedData.categoria && (
                    <div className="flex items-center gap-3 p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <Building2 size={20} className="text-white" />
                      <span className="text-white">{language === 'en' ? 'Category:' : 'Categoria:'}</span>
                      <span className="text-blue-100">{translatedData.categoria}</span>
                    </div>
                  )}

                  {translatedData.mercado_alvo && (
                    <div className="flex items-center gap-3 p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <Target size={20} className="text-white" />
                      <span className="text-white">{language === 'en' ? 'Target Market:' : 'Mercado Alvo:'}</span>
                      <span className="text-blue-100">{translatedData.mercado_alvo}</span>
                    </div>
                  )}

                  {translatedData.investimento_estimado && (
                    <div className="flex items-center gap-3 p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <DollarSign size={20} className="text-white" />
                      <span className="text-white">{language === 'en' ? 'Estimated Investment:' : 'Investimento Estimado:'}</span>
                      <span className="text-green-300">{translatedData.investimento_estimado}</span>
                    </div>
                  )}

                  {translatedData.prazo_desenvolvimento && (
                    <div className="flex items-center gap-3 p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <Calendar size={20} className="text-white" />
                      <span className="text-white">{language === 'en' ? 'Development Timeline:' : 'Prazo de Desenvolvimento:'}</span>
                      <span className="text-yellow-300">{translatedData.prazo_desenvolvimento}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Score de Oportunidade */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                  <h3 className="text-lg text-white mb-2">
                    {language === 'en' ? 'Opportunity Score' : 'Score de Oportunidade'}
                  </h3>
                </div>
                
                <OpportunityGauge 
                  score={translatedData.score_oportunidade.valor || 0} 
                  classification={translatedData.score_oportunidade.classificacao || ''} 
                  size="large"
                />
                
                {/* Justificativa do Score */}
                {translatedData.score_oportunidade.justificativa && (
                  <div className="mt-6 text-center max-w-md">
                    <p className="text-blue-200 italic leading-relaxed text-sm">
                      {translatedData.score_oportunidade.justificativa}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Seções Dinâmicas do Dashboard */}
        <div className="space-y-6">
          {/* Resumo Executivo */}
          {translatedData.resumo_executivo && renderSection(
            'Resumo Executivo',
            translatedData.resumo_executivo,
            FileText
          )}

          {/* Análise de Mercado */}
          {translatedData.analise_mercado && renderSection(
            'Análise de Mercado',
            translatedData.analise_mercado,
            BarChart3
          )}

          {/* Estratégia de Entrada */}
          {translatedData.estrategia_entrada && renderSection(
            'Estratégia de Entrada',
            translatedData.estrategia_entrada,
            Target
          )}

          {/* Riscos Identificados */}
          {translatedData.riscos_identificados && renderSection(
            'Riscos Identificados',
            translatedData.riscos_identificados,
            AlertTriangle
          )}

          {/* Oportunidades */}
          {translatedData.oportunidades && renderSection(
            'Oportunidades',
            translatedData.oportunidades,
            Lightbulb
          )}

          {/* Recomendações */}
          {translatedData.recomendacoes && renderSection(
            'Recomendações',
            translatedData.recomendacoes,
            CheckCircle
          )}

          {/* Próximos Passos */}
          {translatedData.proximos_passos && renderSection(
            'Próximos Passos',
            translatedData.proximos_passos,
            Calendar
          )}

          {/* Análise Competitiva */}
          {translatedData.analise_competitiva && renderSection(
            'Análise Competitiva',
            translatedData.analise_competitiva,
            Users
          )}

          {/* Investimento e Retorno */}
          {translatedData.investimento_retorno && renderSection(
            'Investimento e Retorno',
            translatedData.investimento_retorno,
            DollarSign
          )}

          {/* Cronograma */}
          {translatedData.cronograma && renderSection(
            'Cronograma',
            translatedData.cronograma,
            Activity
          )}

          {/* Dados Adicionais - renderizar qualquer campo não mapeado */}
          {Object.entries(translatedData).map(([key, value]) => {
            // Pular campos já renderizados
            const renderedFields = [
              'produto_proposto', 'score_oportunidade', 'consulta', 'categoria',
              'mercado_alvo', 'investimento_estimado', 'prazo_desenvolvimento',
              'resumo_executivo', 'analise_mercado', 'estrategia_entrada',
              'riscos_identificados', 'oportunidades', 'recomendacoes',
              'proximos_passos', 'analise_competitiva', 'investimento_retorno',
              'cronograma'
            ];
            
            if (renderedFields.includes(key) || !value) return null;
            
            return renderSection(key, value, Building2);
          })}
        </div>
      </div>
    </div>
  );

  // Função auxiliar para renderizar seções (movida para dentro do componente)
  function renderSection(title: string, content: any, icon: React.ComponentType<any>) {
    if (!content) return null;
    
    const IconComponent = icon;
    const translatedTitle = translateSectionTitle(title, language);
    
    return (
      <div key={title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <IconComponent size={20} className="text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">{translatedTitle}</h3>
        </div>
        
        <div className="prose prose-gray max-w-none">
          {typeof content === 'string' ? (
            <p className="text-gray-700 leading-relaxed">{content}</p>
          ) : Array.isArray(content) ? (
            <ul className="space-y-2">
              {content.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-green-600 mt-1 flex-shrink-0" />
                  <span className="text-gray-700">{typeof item === 'string' ? item : JSON.stringify(item)}</span>
                </li>
              ))}
            </ul>
          ) : typeof content === 'object' ? (
            <div className="space-y-3">
              {Object.entries(content).map(([key, value]) => (
                <div key={key} className="border-l-4 border-blue-500 pl-4">
                  <div className="font-semibold text-gray-900 mb-1">{key}</div>
                  <div className="text-gray-700">
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700">{String(content)}</p>
          )}
        </div>
      </div>
    );
  }
};

export default PatentDashboardReport;