import { useState } from 'react';
import { 
  ArrowLeft, 
  Download,
  FlaskConical,
  TrendingUp,
  Target,
  Users,
  DollarSign,
  Calendar,
  Building2,
  Pill,
  TestTube,
  Globe,
  Award,
  Zap,
  Package,
  BarChart3,
  PieChart,
  Activity,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle
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
          <span className={`font-bold text-white ${size === 'large' ? 'text-5xl' : 'text-3xl'}`}>
            {score}
          </span>
          <span className={`text-blue-200 ${size === 'large' ? 'text-base' : 'text-sm'}`}>
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
      pdf.text('RELATÓRIO DE OPORTUNIDADE DE MERCADO', margin, yPosition);
      yPosition += 15;
      
      // Produto proposto
      if (data.produto_proposto?.nome_sugerido) {
        pdf.setFontSize(14);
        pdf.text(`Produto: ${data.produto_proposto.nome_sugerido}`, margin, yPosition);
        yPosition += 10;
      }
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 15;
      
      // Score
      if (data.score_oportunidade?.valor) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Score de Oportunidade: ${data.score_oportunidade.valor}/100 (${data.score_oportunidade.classificacao})`, margin, yPosition);
        yPosition += 10;
      }
      
      const fileName = `relatorio-oportunidade-${data.produto_proposto?.nome_sugerido?.replace(/\s+/g, '-').toLowerCase() || 'produto'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard de Oportunidade de Mercado</h1>
                  <p className="text-gray-600">Análise estratégica e proposta de produto</p>
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
          {/* Header Principal com Score */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações do Produto */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {data.produto_proposto?.nome_sugerido || 'Produto Proposto'}
                  </h2>
                  <p className="text-blue-200 text-xl">
                    {data.produto_proposto?.tipo || 'Produto farmacêutico'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={20} className="text-white" />
                      <span className="text-white font-medium">Benefício Principal</span>
                    </div>
                    <p className="text-blue-100 leading-relaxed">
                      {data.produto_proposto?.beneficio || 'Benefício não especificado'}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={20} className="text-white" />
                      <span className="text-white font-medium">Justificativa</span>
                    </div>
                    <p className="text-blue-100 leading-relaxed">
                      {data.produto_proposto?.justificativa || 'Justificativa não especificada'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Score de Oportunidade */}
              <div className="flex flex-col items-center justify-center">
                {data.score_oportunidade?.valor && (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-lg text-white mb-2">Score de Oportunidade</h3>
                    </div>
                    
                    <OpportunityGauge 
                      score={data.score_oportunidade.valor} 
                      classification={data.score_oportunidade.classificacao} 
                      size="large"
                    />
                    
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold text-white">{data.score_oportunidade.classificacao}</div>
                    </div>
                    
                    {data.score_oportunidade.justificativa && (
                      <div className="mt-6 text-center max-w-md">
                        <p className="text-blue-200 italic leading-relaxed text-sm">
                          {data.score_oportunidade.justificativa}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mercado Alvo */}
          {data.produto_proposto?.mercado_alvo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Target size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Mercado Alvo</h3>
                  <p className="text-gray-600">Análise do público e segmentação</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Público Destinado */}
                {data.produto_proposto.mercado_alvo.publico_destinado && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={20} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">Público Destinado</span>
                    </div>
                    <p className="text-lg font-bold text-green-900">
                      {data.produto_proposto.mercado_alvo.publico_destinado}
                    </p>
                  </div>
                )}

                {/* Tamanho do Público */}
                {data.produto_proposto.mercado_alvo.tamanho_do_publico_estimado && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 size={20} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Tamanho do Público</span>
                    </div>
                    <p className="text-lg font-bold text-blue-900">
                      {formatNumber(data.produto_proposto.mercado_alvo.tamanho_do_publico_estimado)} pessoas
                    </p>
                    <p className="text-sm text-blue-700">
                      {data.produto_proposto.mercado_alvo.tamanho_do_publico_estimado.toLocaleString('pt-BR')} indivíduos
                    </p>
                  </div>
                )}

                {/* Segmentos */}
                {data.produto_proposto.mercado_alvo.segmentos && data.produto_proposto.mercado_alvo.segmentos.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <PieChart size={20} className="text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Segmentos</span>
                    </div>
                    <div className="space-y-2">
                      {data.produto_proposto.mercado_alvo.segmentos.map((segmento: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="text-sm text-purple-900">{segmento}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Análise de Viabilidade */}
          {data.analise_viabilidade && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <Activity size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Análise de Viabilidade</h3>
                  <p className="text-gray-600">Avaliação técnica e comercial</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Viabilidade Técnica */}
                {data.analise_viabilidade.tecnica && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <TestTube size={20} className="text-blue-600" />
                      Viabilidade Técnica
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Complexidade:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          data.analise_viabilidade.tecnica.complexidade === 'Baixa' ? 'bg-green-100 text-green-800' :
                          data.analise_viabilidade.tecnica.complexidade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {data.analise_viabilidade.tecnica.complexidade}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Tempo estimado:</span>
                        <span className="text-sm text-gray-900">{data.analise_viabilidade.tecnica.tempo_desenvolvimento}</span>
                      </div>
                      
                      {data.analise_viabilidade.tecnica.desafios && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Principais desafios:</span>
                          <ul className="mt-2 space-y-1">
                            {data.analise_viabilidade.tecnica.desafios.map((desafio: string, index: number) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <AlertTriangle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                                {desafio}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Viabilidade Comercial */}
                {data.analise_viabilidade.comercial && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <DollarSign size={20} className="text-green-600" />
                      Viabilidade Comercial
                    </h4>
                    
                    <div className="space-y-3">
                      {data.analise_viabilidade.comercial.investimento_estimado && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Investimento estimado:</span>
                          <span className="text-lg font-bold text-green-600">
                            {formatCurrency(data.analise_viabilidade.comercial.investimento_estimado)}
                          </span>
                        </div>
                      )}
                      
                      {data.analise_viabilidade.comercial.retorno_estimado && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Retorno estimado:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(data.analise_viabilidade.comercial.retorno_estimado)}
                          </span>
                        </div>
                      )}
                      
                      {data.analise_viabilidade.comercial.tempo_retorno && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">Tempo para retorno:</span>
                          <span className="text-sm text-gray-900">{data.analise_viabilidade.comercial.tempo_retorno}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Estratégia de Entrada */}
          {data.estrategia_entrada && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Briefcase size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Estratégia de Entrada no Mercado</h3>
                  <p className="text-gray-600">Plano de lançamento e posicionamento</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fases de Lançamento */}
                {data.estrategia_entrada.fases && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar size={20} className="text-purple-600" />
                      Fases de Lançamento
                    </h4>
                    <div className="space-y-3">
                      {data.estrategia_entrada.fases.map((fase: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium text-gray-900">{fase.nome}</span>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">{fase.descricao}</p>
                          {fase.duracao && (
                            <div className="flex items-center gap-1 ml-8 mt-1">
                              <Clock size={12} className="text-gray-500" />
                              <span className="text-xs text-gray-500">{fase.duracao}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Canais de Distribuição */}
                {data.estrategia_entrada.canais_distribuicao && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <Globe size={20} className="text-indigo-600" />
                      Canais de Distribuição
                    </h4>
                    <div className="space-y-2">
                      {data.estrategia_entrada.canais_distribuicao.map((canal: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-indigo-50 rounded-lg">
                          <CheckCircle size={16} className="text-indigo-600" />
                          <span className="text-sm text-indigo-900">{canal}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Análise Competitiva */}
          {data.analise_competitiva && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <Award size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Análise Competitiva</h3>
                  <p className="text-gray-600">Concorrentes e posicionamento</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Principais Concorrentes */}
                {data.analise_competitiva.principais_concorrentes && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4">Principais Concorrentes</h4>
                    <div className="space-y-3">
                      {data.analise_competitiva.principais_concorrentes.map((concorrente: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Pill size={16} className="text-red-600" />
                            <span className="font-medium text-gray-900">{concorrente.nome}</span>
                          </div>
                          {concorrente.participacao_mercado && (
                            <div className="text-sm text-gray-600">
                              Participação: <span className="font-medium">{concorrente.participacao_mercado}</span>
                            </div>
                          )}
                          {concorrente.pontos_fortes && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Pontos fortes:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {concorrente.pontos_fortes.map((ponto: string, idx: number) => (
                                  <span key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                    {ponto}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vantagens Competitivas */}
                {data.analise_competitiva.vantagens_competitivas && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4">Nossas Vantagens</h4>
                    <div className="space-y-2">
                      {data.analise_competitiva.vantagens_competitivas.map((vantagem: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="text-sm text-green-900">{vantagem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Projeções Financeiras */}
          {data.projecoes_financeiras && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Projeções Financeiras</h3>
                  <p className="text-gray-600">Estimativas de receita e crescimento</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.projecoes_financeiras.receita_ano_1 && (
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={20} className="text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">Receita Ano 1</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-900">
                      {formatCurrency(data.projecoes_financeiras.receita_ano_1)}
                    </p>
                  </div>
                )}

                {data.projecoes_financeiras.receita_ano_3 && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={20} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Receita Ano 3</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(data.projecoes_financeiras.receita_ano_3)}
                    </p>
                  </div>
                )}

                {data.projecoes_financeiras.margem_lucro && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 size={20} className="text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Margem de Lucro</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {data.projecoes_financeiras.margem_lucro}%
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Riscos e Mitigações */}
          {data.riscos_mitigacoes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Riscos e Mitigações</h3>
                  <p className="text-gray-600">Identificação e planos de contingência</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {data.riscos_mitigacoes.map((risco: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle size={16} className="text-yellow-600" />
                          <span className="font-medium text-gray-900">Risco</span>
                        </div>
                        <p className="text-sm text-gray-700">{risco.risco}</p>
                        {risco.probabilidade && (
                          <div className="mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              risco.probabilidade === 'Alta' ? 'bg-red-100 text-red-800' :
                              risco.probabilidade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              Probabilidade: {risco.probabilidade}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle size={16} className="text-green-600" />
                          <span className="font-medium text-gray-900">Mitigação</span>
                        </div>
                        <p className="text-sm text-gray-700">{risco.mitigacao}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximos Passos */}
          {data.proximos_passos && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <MapPin size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Próximos Passos</h3>
                  <p className="text-gray-600">Roadmap de implementação</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {data.proximos_passos.map((passo: any, index: number) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-indigo-900 mb-1">{passo.acao}</h5>
                      <p className="text-sm text-indigo-700">{passo.descricao}</p>
                      {passo.prazo && (
                        <div className="flex items-center gap-1 mt-2">
                          <Clock size={12} className="text-indigo-600" />
                          <span className="text-xs text-indigo-600 font-medium">{passo.prazo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações da Consulta */}
          {data.consulta && (
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical size={20} className="text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900">Informações da Consulta</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Cliente:</span>
                  <p className="font-medium text-gray-900">{data.consulta.cliente}</p>
                </div>
                <div>
                  <span className="text-gray-600">Produto original:</span>
                  <p className="font-medium text-gray-900">{data.consulta.produto_original}</p>
                </div>
                <div>
                  <span className="text-gray-600">Categoria:</span>
                  <p className="font-medium text-gray-900">{data.consulta.categoria}</p>
                </div>
                <div>
                  <span className="text-gray-600">Países analisados:</span>
                  <p className="font-medium text-gray-900">{data.consulta.paises_analisados?.join(', ')}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentDashboardReport;