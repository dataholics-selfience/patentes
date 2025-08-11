import { useState } from 'react';
import { 
  ArrowLeft, 
  Download,
  FlaskConical,
  TrendingUp,
  Target,
  DollarSign,
  Calendar,
  Building2,
  Pill,
  TestTube,
  FileText,
  Globe,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Lightbulb,
  Zap,
  Shield
} from 'lucide-react';
import jsPDF from 'jspdf';

interface PatentDashboardReportProps {
  data: any;
  onBack: () => void;
}

// Componente Gauge para Score de Oportunidade
const OpportunityGauge = ({ 
  score, 
  classification, 
  size = 'normal' 
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
          <span className={`font-bold text-gray-900 ${size === 'large' ? 'text-5xl' : 'text-3xl'}`}>
            {score}
          </span>
          <span className={`text-gray-600 ${size === 'large' ? 'text-base' : 'text-sm'}`}>
            de 100
          </span>
        </div>
      </div>
      {size === 'normal' && (
        <div className="mt-4 text-center">
          <div className="text-lg font-semibold text-gray-900">{classification}</div>
          <div className="text-sm text-gray-600">Score de Oportunidade</div>
        </div>
      )}
    </div>
  );
};

const PatentDashboardReport = ({ data, onBack }: PatentDashboardReportProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  console.log('📊 Renderizando Dashboard com dados:', data);
  
  // Verificar se os dados são válidos
  if (!data || typeof data !== 'object') {
    console.error('❌ Dados do dashboard inválidos:', data);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro nos Dados</h2>
          <p className="text-gray-600 mb-4">Os dados do dashboard não puderam ser carregados.</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  // Extrair dados do dashboard
  const produtoProposto = typeof data.produto_proposto === 'object' && data.produto_proposto?.nome_sugerido 
    ? data.produto_proposto.nome_sugerido 
    : (typeof data.produto_proposto === 'string' ? data.produto_proposto : 'Produto não identificado');
  const scoreOportunidade = data.score_oportunidade || {};
  const consulta = data.consulta || {};
  const analiseComercial = data.analise_comercial || {};
  const recomendacoes = data.recomendacoes || {};
  const proximosPassos = data.proximos_passos || [];

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
      pdf.text('RELATÓRIO DE OPORTUNIDADE FARMACÊUTICA', margin, yPosition);
      yPosition += 15;
      
      // Produto
      pdf.setFontSize(14);
      pdf.text(`Produto Proposto: ${produtoProposto}`, margin, yPosition);
      yPosition += 10;
      
      // Score
      if (scoreOportunidade.valor) {
        pdf.setFontSize(12);
        pdf.text(`Score de Oportunidade: ${scoreOportunidade.valor}/100 (${scoreOportunidade.classificacao})`, margin, yPosition);
        yPosition += 10;
      }
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 15;
      
      const fileName = `dashboard-oportunidade-${produtoProposto.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
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
                <span>Voltar</span>
              </button>
              
              <div className="flex items-center gap-3">
                <FlaskConical size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard de Oportunidade Farmacêutica</h1>
                  <p className="text-gray-600">Análise estratégica e recomendações de mercado</p>
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
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Exportar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header do Produto */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl text-white font-bold mb-2">{produtoProposto}</h2>
                  <p className="text-blue-200 text-lg">Produto farmacêutico proposto para desenvolvimento</p>
                </div>

                {consulta.cliente && (
                  <div className="bg-blue-800/50 rounded-lg p-4 border border-blue-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 size={20} className="text-white" />
                      <span className="text-white font-medium">Cliente</span>
                    </div>
                    <p className="text-blue-100 text-lg">{consulta.cliente}</p>
                  </div>
                )}

                {consulta.data_consulta && (
                  <div className="bg-blue-800/50 rounded-lg p-4 border border-blue-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={20} className="text-white" />
                      <span className="text-white font-medium">Data da Consulta</span>
                    </div>
                    <p className="text-blue-100">{consulta.data_consulta}</p>
                  </div>
                )}
              </div>

              {/* Score de Oportunidade */}
              {scoreOportunidade.valor && (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-center mb-6">
                    <h3 className="text-lg text-white mb-2">Score de Oportunidade</h3>
                  </div>
                  
                  <OpportunityGauge 
                    score={scoreOportunidade.valor} 
                    classification={scoreOportunidade.classificacao} 
                    size="large"
                  />
                  
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-white">{scoreOportunidade.classificacao}</div>
                  </div>
                  
                  {scoreOportunidade.justificativa && (
                    <div className="mt-6 text-center max-w-md">
                      <p className="text-blue-200 italic leading-relaxed text-sm">
                        {scoreOportunidade.justificativa}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Análise Comercial */}
          {analiseComercial && Object.keys(analiseComercial).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Análise Comercial</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analiseComercial.mercado_potencial && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={20} className="text-green-600" />
                      <span className="font-medium text-gray-900">Mercado Potencial</span>
                    </div>
                    <p className="text-green-800 font-semibold">{analiseComercial.mercado_potencial}</p>
                  </div>
                )}

                {analiseComercial.competitividade && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={20} className="text-blue-600" />
                      <span className="font-medium text-gray-900">Competitividade</span>
                    </div>
                    <p className="text-blue-800 font-semibold">{analiseComercial.competitividade}</p>
                  </div>
                )}

                {analiseComercial.barreiras_entrada && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield size={20} className="text-orange-600" />
                      <span className="font-medium text-gray-900">Barreiras de Entrada</span>
                    </div>
                    <p className="text-orange-800 font-semibold">{analiseComercial.barreiras_entrada}</p>
                  </div>
                )}
              </div>

              {analiseComercial.detalhes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">Detalhes da Análise</h4>
                  <p className="text-gray-700 leading-relaxed">{analiseComercial.detalhes}</p>
                </div>
              )}
            </div>
          )}

          {/* Recomendações */}
          {recomendacoes && Object.keys(recomendacoes).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lightbulb size={24} className="text-yellow-600" />
                <h3 className="text-xl font-bold text-gray-900">Recomendações Estratégicas</h3>
              </div>
              
              <div className="space-y-6">
                {recomendacoes.estrategia_desenvolvimento && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                      <Zap size={20} />
                      Estratégia de Desenvolvimento
                    </h4>
                    <p className="text-yellow-800 leading-relaxed">{recomendacoes.estrategia_desenvolvimento}</p>
                  </div>
                )}

                {recomendacoes.timeline_sugerido && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Calendar size={20} />
                      Timeline Sugerido
                    </h4>
                    <p className="text-blue-800 leading-relaxed">{recomendacoes.timeline_sugerido}</p>
                  </div>
                )}

                {recomendacoes.investimento_estimado && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <DollarSign size={20} />
                      Investimento Estimado
                    </h4>
                    <p className="text-green-800 leading-relaxed">{recomendacoes.investimento_estimado}</p>
                  </div>
                )}

                {recomendacoes.riscos_principais && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      Principais Riscos
                    </h4>
                    <p className="text-red-800 leading-relaxed">{recomendacoes.riscos_principais}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Próximos Passos */}
          {proximosPassos && proximosPassos.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Target size={24} className="text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Próximos Passos Recomendados</h3>
              </div>
              
              <div className="space-y-4">
                {proximosPassos.map((passo: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-purple-900 mb-2">{passo.acao || passo.titulo}</h4>
                      <p className="text-purple-800 leading-relaxed">{passo.descricao || passo.detalhes}</p>
                      {passo.prazo && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-purple-700">
                          <Calendar size={14} />
                          <span>Prazo: {passo.prazo}</span>
                        </div>
                      )}
                      {passo.prioridade && (
                        <div className="mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            passo.prioridade === 'Alta' ? 'bg-red-100 text-red-800' :
                            passo.prioridade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Prioridade: {passo.prioridade}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações Adicionais */}
          {data.informacoes_adicionais && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText size={24} className="text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">Informações Adicionais</h3>
              </div>
              
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">{data.informacoes_adicionais}</p>
              </div>
            </div>
          )}

          {/* Dados Brutos (para debug) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Dados Brutos (Debug)</h3>
              <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-white p-4 rounded border">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentDashboardReport;