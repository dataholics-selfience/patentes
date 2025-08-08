import { useState } from 'react';
import { 
  ArrowLeft, 
  Download,
  FlaskConical,
  Target,
  TrendingUp,
  Award,
  DollarSign,
  Building2,
  Users,
  Calendar,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lightbulb,
  BarChart3,
  Factory,
  Rocket
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
      pdf.text('RELATÓRIO EXECUTIVO - ANÁLISE DE OPORTUNIDADE', margin, yPosition);
      yPosition += 15;
      
      // Produto
      pdf.setFontSize(14);
      pdf.text(`Produto: ${data.produto_proposto?.nome || 'Produto analisado'}`, margin, yPosition);
      yPosition += 10;
      
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
      
      const fileName = `relatorio-dashboard-${data.produto_proposto?.nome?.replace(/\s+/g, '-').toLowerCase() || 'produto'}-${new Date().toISOString().split('T')[0]}.pdf`;
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
                  <h1 className="text-2xl font-bold text-gray-900">Relatório Executivo de Oportunidade</h1>
                  <p className="text-gray-600">Análise estratégica para desenvolvimento farmacêutico</p>
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
          {/* Score de Oportunidade - Card Principal */}
          {data.score_oportunidade && (
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h2 className="text-4xl font-bold text-white mb-2">
                      {data.produto_proposto?.nome || 'Produto Analisado'}
                    </h2>
                    <p className="text-blue-200 text-lg">
                      {data.produto_proposto?.descricao || 'Análise de oportunidade de mercado'}
                    </p>
                  </div>
                  
                  {data.score_oportunidade.justificativa && (
                    <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <h3 className="text-white font-semibold mb-2">Justificativa do Score</h3>
                      <p className="text-blue-100 leading-relaxed">
                        {data.score_oportunidade.justificativa}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center">
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
                </div>
              </div>
            </div>
          )}

          {/* Produto Proposto - Box Verde com novos componentes */}
          {data.produto_proposto && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Target size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Produto Proposto</h3>
                  <p className="text-gray-600">Análise estratégica completa</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <h4 className="font-bold text-gray-900 mb-2">Nome do Produto</h4>
                  <p className="text-lg text-green-700 font-semibold">{data.produto_proposto.nome}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <h4 className="font-bold text-gray-900 mb-2">Categoria</h4>
                  <p className="text-gray-700">{data.produto_proposto.categoria || 'Não especificada'}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-green-100 mb-6">
                <h4 className="font-bold text-gray-900 mb-2">Descrição</h4>
                <p className="text-gray-700 leading-relaxed">{data.produto_proposto.descricao}</p>
              </div>

              {/* Novos boxes dentro do Produto Proposto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Análise SWOT */}
                {data.produto_proposto.analise_swot && (
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 size={20} className="text-green-600" />
                      <h4 className="font-bold text-gray-900">Análise SWOT</h4>
                    </div>
                    <div className="space-y-3">
                      {data.produto_proposto.analise_swot.forcas && (
                        <div>
                          <span className="text-sm font-medium text-green-700">Forças:</span>
                          <ul className="mt-1 space-y-1">
                            {data.produto_proposto.analise_swot.forcas.map((forca: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-1">
                                <span className="text-green-500">+</span>
                                {forca}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {data.produto_proposto.analise_swot.fraquezas && (
                        <div>
                          <span className="text-sm font-medium text-red-700">Fraquezas:</span>
                          <ul className="mt-1 space-y-1">
                            {data.produto_proposto.analise_swot.fraquezas.map((fraqueza: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-1">
                                <span className="text-red-500">-</span>
                                {fraqueza}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {data.produto_proposto.analise_swot.oportunidades && (
                        <div>
                          <span className="text-sm font-medium text-blue-700">Oportunidades:</span>
                          <ul className="mt-1 space-y-1">
                            {data.produto_proposto.analise_swot.oportunidades.map((oportunidade: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-1">
                                <span className="text-blue-500">○</span>
                                {oportunidade}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {data.produto_proposto.analise_swot.ameacas && (
                        <div>
                          <span className="text-sm font-medium text-orange-700">Ameaças:</span>
                          <ul className="mt-1 space-y-1">
                            {data.produto_proposto.analise_swot.ameacas.map((ameaca: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-1">
                                <span className="text-orange-500">⚠</span>
                                {ameaca}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Pipeline Concorrente */}
                {data.produto_proposto.pipeline_concorrente && (
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Users size={20} className="text-green-600" />
                      <h4 className="font-bold text-gray-900">Pipeline Concorrente</h4>
                    </div>
                    <div className="space-y-3">
                      {data.produto_proposto.pipeline_concorrente.principais_concorrentes && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Principais Concorrentes:</span>
                          <ul className="mt-1 space-y-1">
                            {data.produto_proposto.pipeline_concorrente.principais_concorrentes.map((concorrente: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                <Building2 size={12} className="text-red-500" />
                                {concorrente}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {data.produto_proposto.pipeline_concorrente.produtos_similares && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Produtos Similares:</span>
                          <ul className="mt-1 space-y-1">
                            {data.produto_proposto.pipeline_concorrente.produtos_similares.map((produto: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                                <Pill size={12} className="text-blue-500" />
                                {produto}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {data.produto_proposto.pipeline_concorrente.vantagem_competitiva && (
                        <div>
                          <span className="text-sm font-medium text-green-700">Vantagem Competitiva:</span>
                          <p className="mt-1 text-sm text-gray-700">{data.produto_proposto.pipeline_concorrente.vantagem_competitiva}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Complexidade de Fabricação */}
                {data.produto_proposto.complexidade_fabricacao && (
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Factory size={20} className="text-green-600" />
                      <h4 className="font-bold text-gray-900">Complexidade de Fabricação</h4>
                    </div>
                    <div className="space-y-3">
                      {data.produto_proposto.complexidade_fabricacao.nivel && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Nível de Complexidade:</span>
                          <div className="mt-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              data.produto_proposto.complexidade_fabricacao.nivel === 'Baixa' ? 'bg-green-100 text-green-800' :
                              data.produto_proposto.complexidade_fabricacao.nivel === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {data.produto_proposto.complexidade_fabricacao.nivel}
                            </span>
                          </div>
                        </div>
                      )}
                      {data.produto_proposto.complexidade_fabricacao.desafios && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Principais Desafios:</span>
                          <ul className="mt-1 space-y-1">
                            {data.produto_proposto.complexidade_fabricacao.desafios.map((desafio: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-1">
                                <span className="text-orange-500">•</span>
                                {desafio}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {data.produto_proposto.complexidade_fabricacao.investimento_estimado && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Investimento Estimado:</span>
                          <p className="mt-1 text-sm text-gray-700 font-semibold">
                            {data.produto_proposto.complexidade_fabricacao.investimento_estimado}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Indicadores Go-to-Market */}
                {data.produto_proposto.indicadores_go_to_market && (
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Rocket size={20} className="text-green-600" />
                      <h4 className="font-bold text-gray-900">Indicadores Go-to-Market</h4>
                    </div>
                    <div className="space-y-3">
                      {data.produto_proposto.indicadores_go_to_market.tempo_desenvolvimento && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Tempo de Desenvolvimento:</span>
                          <p className="mt-1 text-sm text-gray-700 font-semibold">
                            {data.produto_proposto.indicadores_go_to_market.tempo_desenvolvimento}
                          </p>
                        </div>
                      )}
                      {data.produto_proposto.indicadores_go_to_market.custo_desenvolvimento && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Custo de Desenvolvimento:</span>
                          <p className="mt-1 text-sm text-gray-700 font-semibold">
                            {data.produto_proposto.indicadores_go_to_market.custo_desenvolvimento}
                          </p>
                        </div>
                      )}
                      {data.produto_proposto.indicadores_go_to_market.mercado_alvo && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Mercado Alvo:</span>
                          <p className="mt-1 text-sm text-gray-700">
                            {data.produto_proposto.indicadores_go_to_market.mercado_alvo}
                          </p>
                        </div>
                      )}
                      {data.produto_proposto.indicadores_go_to_market.estrategia_lancamento && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Estratégia de Lançamento:</span>
                          <ul className="mt-1 space-y-1">
                            {data.produto_proposto.indicadores_go_to_market.estrategia_lancamento.map((estrategia: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 flex items-start gap-1">
                                <span className="text-green-500">→</span>
                                {estrategia}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Análise de Mercado */}
          {data.analise_mercado && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Análise de Mercado</h3>
                  <p className="text-gray-600">Oportunidades e tendências identificadas</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.analise_mercado.tamanho_mercado && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="font-bold text-gray-900 mb-2">Tamanho do Mercado</h4>
                    <p className="text-2xl font-bold text-purple-600">{data.analise_mercado.tamanho_mercado}</p>
                  </div>
                )}
                
                {data.analise_mercado.crescimento_projetado && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="font-bold text-gray-900 mb-2">Crescimento Projetado</h4>
                    <p className="text-2xl font-bold text-purple-600">{data.analise_mercado.crescimento_projetado}</p>
                  </div>
                )}
              </div>

              {data.analise_mercado.principais_tendencias && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-3">Principais Tendências</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.analise_mercado.principais_tendencias.map((tendencia: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                        <TrendingUp size={16} className="text-purple-600" />
                        <span className="text-gray-700">{tendencia}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Análise Regulatória */}
          {data.analise_regulatoria && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Análise Regulatória</h3>
                  <p className="text-gray-600">Requisitos e barreiras regulamentares</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.analise_regulatoria.complexidade_aprovacao && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h4 className="font-bold text-gray-900 mb-2">Complexidade de Aprovação</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      data.analise_regulatoria.complexidade_aprovacao === 'Baixa' ? 'bg-green-100 text-green-800' :
                      data.analise_regulatoria.complexidade_aprovacao === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {data.analise_regulatoria.complexidade_aprovacao}
                    </span>
                  </div>
                )}
                
                {data.analise_regulatoria.tempo_estimado_aprovacao && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                    <h4 className="font-bold text-gray-900 mb-2">Tempo Estimado de Aprovação</h4>
                    <p className="text-lg font-bold text-red-600">{data.analise_regulatoria.tempo_estimado_aprovacao}</p>
                  </div>
                )}
              </div>

              {data.analise_regulatoria.principais_requisitos && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-3">Principais Requisitos</h4>
                  <div className="space-y-2">
                    {data.analise_regulatoria.principais_requisitos.map((requisito: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                        <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                        <span className="text-gray-700">{requisito}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Viabilidade Financeira */}
          {data.viabilidade_financeira && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <DollarSign size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Viabilidade Financeira</h3>
                  <p className="text-gray-600">Projeções de investimento e retorno</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.viabilidade_financeira.investimento_inicial && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h4 className="font-bold text-gray-900 mb-2">Investimento Inicial</h4>
                    <p className="text-2xl font-bold text-yellow-600">{data.viabilidade_financeira.investimento_inicial}</p>
                  </div>
                )}
                
                {data.viabilidade_financeira.roi_projetado && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h4 className="font-bold text-gray-900 mb-2">ROI Projetado</h4>
                    <p className="text-2xl font-bold text-yellow-600">{data.viabilidade_financeira.roi_projetado}</p>
                  </div>
                )}
                
                {data.viabilidade_financeira.payback && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h4 className="font-bold text-gray-900 mb-2">Payback</h4>
                    <p className="text-2xl font-bold text-yellow-600">{data.viabilidade_financeira.payback}</p>
                  </div>
                )}
              </div>

              {data.viabilidade_financeira.principais_custos && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-3">Principais Custos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.viabilidade_financeira.principais_custos.map((custo: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                        <DollarSign size={16} className="text-yellow-600" />
                        <span className="text-gray-700">{custo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Recomendações Estratégicas */}
          {data.recomendacoes_estrategicas && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Lightbulb size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Recomendações Estratégicas</h3>
                  <p className="text-gray-600">Próximos passos recomendados</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {data.recomendacoes_estrategicas.proximos_passos && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Próximos Passos</h4>
                    <div className="space-y-3">
                      {data.recomendacoes_estrategicas.proximos_passos.map((passo: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                          <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">{passo.acao}</h5>
                            <p className="text-sm text-gray-700 mb-2">{passo.descricao}</p>
                            {passo.prazo && (
                              <div className="flex items-center gap-1 text-xs text-indigo-600">
                                <Calendar size={12} />
                                <span>Prazo: {passo.prazo}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.recomendacoes_estrategicas.riscos_identificados && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Riscos Identificados</h4>
                    <div className="space-y-2">
                      {data.recomendacoes_estrategicas.riscos_identificados.map((risco: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                          <AlertTriangle size={16} className="text-red-600 mt-0.5" />
                          <span className="text-gray-700">{risco}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Consulta Realizada */}
          {data.consulta && (
            <div className="bg-gray-100 rounded-xl p-6 border border-gray-300">
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical size={24} className="text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">Dados da Consulta</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Cliente:</span>
                  <p className="text-gray-900">{data.consulta.cliente}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Data da Consulta:</span>
                  <p className="text-gray-900">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
                {data.consulta.sessionId && (
                  <div className="md:col-span-2">
                    <span className="font-medium text-gray-700">Session ID:</span>
                    <p className="text-gray-900 font-mono text-xs">{data.consulta.sessionId}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentDashboardReport;