import { useState } from 'react';
import { 
  ArrowLeft, 
  Download,
  FlaskConical,
  Shield,
  Beaker,
  TestTube,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Globe,
  Building2,
  Calendar,
  ExternalLink,
  Award,
  DollarSign,
  BookOpen,
  Pill,
  MapPin,
  AlertTriangle,
  Target,
  Users,
  Factory,
  Rocket,
  FileCheck,
  Zap,
  TrendingDown,
  Minus,
  Plus
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
  
  const [animatedScore, setAnimatedScore] = useState(0);
  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useState(() => {
    const duration = 2000; // 2 segundos
    const steps = 60;
    const increment = score / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const currentScore = Math.min(increment * currentStep, score);
      setAnimatedScore(Math.round(currentScore));
      setStrokeDashoffset(circumference - (currentScore / 100) * circumference);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  });

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
            stroke={getColor(animatedScore)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-100 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold text-white ${size === 'large' ? 'text-5xl' : 'text-3xl'}`}>
            {animatedScore}
          </span>
          <span className={`text-blue-200 ${size === 'large' ? 'text-base' : 'text-sm'}`}>
            de 100
          </span>
        </div>
      </div>
    </div>
  );
};

const PatentDashboardReport = ({ data, onBack }: PatentDashboardReportProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const produto = data.produto_proposto || 'Produto Analisado';
  const scoreOportunidade = data.score_oportunidade || {};
  const analiseSwot = data.analise_swot || {};
  const pipelineConcorrente = data.pipeline_concorrente || {};
  const complexidadeFabricacao = data.complexidade_fabricacao || {};
  const indicadoresGoToMarket = data.indicadores_go_to_market || {};
  const documentacaoInpi = data.documentacao_inpi || {};

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
      pdf.text(`Produto: ${produto}`, margin, yPosition);
      yPosition += 10;
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 15;
      
      // Score
      if (scoreOportunidade.valor) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Score de Oportunidade: ${scoreOportunidade.valor}/100 (${scoreOportunidade.classificacao})`, margin, yPosition);
        yPosition += 10;
      }
      
      const fileName = `relatorio-oportunidade-${produto.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
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
                  <p className="text-gray-600">Análise estratégica completa do produto farmacêutico</p>
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
          {/* Card Principal com Score de Oportunidade */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações do Produto */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl text-white mb-2">{produto}</h2>
                  <p className="text-blue-200 text-lg">Produto Proposto para Desenvolvimento</p>
                </div>

                {/* Informações básicas do produto */}
                {data.consulta && (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 size={20} className="text-white" />
                        <span className="text-white">Cliente:</span>
                        <span className="text-blue-200">{data.consulta.cliente}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Pill size={20} className="text-white" />
                        <span className="text-white">Categoria:</span>
                        <span className="text-blue-200">{data.consulta.categoria}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Target size={20} className="text-white" />
                        <span className="text-white">Benefício:</span>
                        <span className="text-blue-200">{data.consulta.beneficio}</span>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={20} className="text-white" />
                        <span className="text-white">Países Alvo:</span>
                        <span className="text-blue-200">{data.consulta.pais_alvo?.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Score de Oportunidade */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                  <h3 className="text-2xl text-white mb-2">Score de Oportunidade</h3>
                </div>
                
                <OpportunityGauge 
                  score={scoreOportunidade.valor || 0} 
                  classification={scoreOportunidade.classificacao || 'Não avaliado'} 
                  size="large"
                />
                
                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold text-white mb-4">{scoreOportunidade.classificacao}</div>
                  
                  {/* Justificativa do Score */}
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-white mb-3">Justificativa do Score</h4>
                    {scoreOportunidade.justificativa && (
                      <div className="max-w-md">
                        <p className="text-blue-200 italic leading-relaxed text-sm">
                          {scoreOportunidade.justificativa}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Análise SWOT */}
          {analiseSwot && Object.keys(analiseSwot).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Target size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Análise SWOT</h3>
                  <p className="text-gray-600">Forças, Fraquezas, Oportunidades e Ameaças</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Forças */}
                {analiseSwot.forcas && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Plus size={20} className="text-green-600" />
                      <h4 className="font-bold text-green-800">Forças</h4>
                    </div>
                    <ul className="space-y-2">
                      {analiseSwot.forcas.map((forca: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-green-700">
                          <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{forca}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fraquezas */}
                {analiseSwot.fraquezas && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Minus size={20} className="text-red-600" />
                      <h4 className="font-bold text-red-800">Fraquezas</h4>
                    </div>
                    <ul className="space-y-2">
                      {analiseSwot.fraquezas.map((fraqueza: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-red-700">
                          <XCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{fraqueza}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Oportunidades */}
                {analiseSwot.oportunidades && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={20} className="text-blue-600" />
                      <h4 className="font-bold text-blue-800">Oportunidades</h4>
                    </div>
                    <ul className="space-y-2">
                      {analiseSwot.oportunidades.map((oportunidade: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-blue-700">
                          <Zap size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{oportunidade}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ameaças */}
                {analiseSwot.ameacas && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle size={20} className="text-orange-600" />
                      <h4 className="font-bold text-orange-800">Ameaças</h4>
                    </div>
                    <ul className="space-y-2">
                      {analiseSwot.ameacas.map((ameaca: string, index: number) => (
                        <li key={index} className="flex items-start gap-2 text-orange-700">
                          <AlertTriangle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{ameaca}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pipeline Concorrente */}
          {pipelineConcorrente && Object.keys(pipelineConcorrente).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Pipeline Concorrente</h3>
                  <p className="text-gray-600">Análise da concorrência e produtos similares</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Concorrentes Diretos */}
                {pipelineConcorrente.concorrentes_diretos && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Concorrentes Diretos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pipelineConcorrente.concorrentes_diretos.map((concorrente: any, index: number) => (
                        <div key={index} className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h5 className="font-semibold text-red-800 mb-2">{concorrente.nome}</h5>
                          <div className="space-y-1 text-sm">
                            <div><strong>Produto:</strong> {concorrente.produto}</div>
                            <div><strong>Status:</strong> {concorrente.status}</div>
                            <div><strong>Market Share:</strong> {concorrente.market_share}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Produtos em Desenvolvimento */}
                {pipelineConcorrente.produtos_em_desenvolvimento && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Produtos em Desenvolvimento</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pipelineConcorrente.produtos_em_desenvolvimento.map((produto: any, index: number) => (
                        <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h5 className="font-semibold text-yellow-800 mb-2">{produto.nome}</h5>
                          <div className="space-y-1 text-sm">
                            <div><strong>Empresa:</strong> {produto.empresa}</div>
                            <div><strong>Fase:</strong> {produto.fase}</div>
                            <div><strong>Previsão de Lançamento:</strong> {produto.previsao_lancamento}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Complexidade de Fabricação */}
          {complexidadeFabricacao && Object.keys(complexidadeFabricacao).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <Factory size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Complexidade de Fabricação</h3>
                  <p className="text-gray-600">Análise dos desafios de produção e manufatura</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nível de Complexidade */}
                {complexidadeFabricacao.nivel_complexidade && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-2">Nível de Complexidade</h4>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      complexidadeFabricacao.nivel_complexidade === 'Alta' ? 'bg-red-100 text-red-800' :
                      complexidadeFabricacao.nivel_complexidade === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {complexidadeFabricacao.nivel_complexidade}
                    </div>
                  </div>
                )}

                {/* Investimento Estimado */}
                {complexidadeFabricacao.investimento_estimado && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">Investimento Estimado</h4>
                    <div className="text-2xl font-bold text-green-900">
                      {complexidadeFabricacao.investimento_estimado}
                    </div>
                  </div>
                )}

                {/* Desafios Técnicos */}
                {complexidadeFabricacao.desafios_tecnicos && (
                  <div className="md:col-span-2">
                    <h4 className="font-bold text-gray-900 mb-3">Desafios Técnicos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {complexidadeFabricacao.desafios_tecnicos.map((desafio: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                          <AlertTriangle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{desafio}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tempo de Desenvolvimento */}
                {complexidadeFabricacao.tempo_desenvolvimento && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Tempo de Desenvolvimento</h4>
                    <div className="text-xl font-bold text-blue-900">
                      {complexidadeFabricacao.tempo_desenvolvimento}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Indicadores Go-to-Market */}
          {indicadoresGoToMarket && Object.keys(indicadoresGoToMarket).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <Rocket size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Indicadores Go-to-Market</h3>
                  <p className="text-gray-600">Métricas estratégicas para lançamento no mercado</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Tamanho do Mercado */}
                {indicadoresGoToMarket.tamanho_mercado && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">Tamanho do Mercado</h4>
                    <div className="text-xl font-bold text-green-900">
                      {indicadoresGoToMarket.tamanho_mercado}
                    </div>
                  </div>
                )}

                {/* Preço Estimado */}
                {indicadoresGoToMarket.preco_estimado && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Preço Estimado</h4>
                    <div className="text-xl font-bold text-blue-900">
                      {indicadoresGoToMarket.preco_estimado}
                    </div>
                  </div>
                )}

                {/* ROI Projetado */}
                {indicadoresGoToMarket.roi_projetado && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-800 mb-2">ROI Projetado</h4>
                    <div className="text-xl font-bold text-purple-900">
                      {indicadoresGoToMarket.roi_projetado}
                    </div>
                  </div>
                )}

                {/* Tempo para Break-even */}
                {indicadoresGoToMarket.tempo_break_even && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-orange-800 mb-2">Tempo para Break-even</h4>
                    <div className="text-xl font-bold text-orange-900">
                      {indicadoresGoToMarket.tempo_break_even}
                    </div>
                  </div>
                )}

                {/* Market Share Projetado */}
                {indicadoresGoToMarket.market_share_projetado && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-bold text-indigo-800 mb-2">Market Share Projetado</h4>
                    <div className="text-xl font-bold text-indigo-900">
                      {indicadoresGoToMarket.market_share_projetado}
                    </div>
                  </div>
                )}

                {/* Canais de Distribuição */}
                {indicadoresGoToMarket.canais_distribuicao && (
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <h4 className="font-bold text-teal-800 mb-2">Canais de Distribuição</h4>
                    <div className="space-y-1">
                      {indicadoresGoToMarket.canais_distribuicao.map((canal: string, index: number) => (
                        <div key={index} className="text-sm text-teal-700">• {canal}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Estratégias de Marketing */}
              {indicadoresGoToMarket.estrategias_marketing && (
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-3">Estratégias de Marketing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {indicadoresGoToMarket.estrategias_marketing.map((estrategia: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                        <Target size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{estrategia}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documentação para Registro no INPI */}
          {documentacaoInpi && Object.keys(documentacaoInpi).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <FileCheck size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Documentação para Registro no INPI</h3>
                  <p className="text-gray-600">Documentos necessários para proteção da propriedade intelectual</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Documentos Obrigatórios */}
                {documentacaoInpi.documentos_obrigatorios && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Documentos Obrigatórios</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {documentacaoInpi.documentos_obrigatorios.map((documento: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <FileText size={16} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-indigo-800">{documento}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custos Estimados */}
                {documentacaoInpi.custos_estimados && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-800 mb-2">Custos Estimados</h4>
                    <div className="text-2xl font-bold text-green-900">
                      {documentacaoInpi.custos_estimados}
                    </div>
                  </div>
                )}

                {/* Prazo de Análise */}
                {documentacaoInpi.prazo_analise && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-800 mb-2">Prazo de Análise</h4>
                    <div className="text-xl font-bold text-blue-900">
                      {documentacaoInpi.prazo_analise}
                    </div>
                  </div>
                )}

                {/* Recomendações */}
                {documentacaoInpi.recomendacoes && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">Recomendações</h4>
                    <div className="space-y-2">
                      {documentacaoInpi.recomendacoes.map((recomendacao: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                          <Award size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{recomendacao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Seções existentes do dashboard */}
          {data.patentes && data.patentes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Análise de Patentes</h3>
                  <p className="text-gray-600">Status de propriedade intelectual</p>
                </div>
              </div>
              
              {data.patentes.map((patente: any, index: number) => (
                <div key={index} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      {patente.patente_vigente ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <XCircle size={20} className="text-red-600" />
                      )}
                      <span className="text-gray-700">Status da Patente:</span>
                      <span className={`font-medium ${patente.patente_vigente ? 'text-green-600' : 'text-red-600'}`}>
                        {patente.patente_vigente ? 'VIGENTE' : 'EXPIRADA'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Calendar size={20} className="text-blue-600" />
                      <span className="text-gray-700">Expiração:</span>
                      <span className="font-medium">{patente.data_expiracao_patente_principal}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dados Químicos */}
          {data.quimica && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Beaker size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Dados Químicos</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.quimica.molecular_formula && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Fórmula Molecular</span>
                    <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{data.quimica.molecular_formula}</p>
                  </div>
                )}
                
                {data.quimica.molecular_weight && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Peso Molecular</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{data.quimica.molecular_weight} g/mol</p>
                  </div>
                )}

                {data.quimica.iupac_name && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100 md:col-span-2 lg:col-span-3">
                    <span className="text-sm font-medium text-gray-600">Nome IUPAC</span>
                    <p className="text-sm text-gray-900 mt-1 break-words">{data.quimica.iupac_name}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ensaios Clínicos */}
          {data.ensaios_clinicos && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <TestTube size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ensaios Clínicos</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.ensaios_clinicos.ativos && (
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <span className="text-sm font-medium text-gray-600">Estudos Ativos</span>
                    <p className="text-2xl font-bold text-green-600 mt-1">{data.ensaios_clinicos.ativos}</p>
                  </div>
                )}
                
                {data.ensaios_clinicos.fase_avancada !== undefined && (
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <span className="text-sm font-medium text-gray-600">Fase Avançada</span>
                    <p className={`text-lg font-bold mt-1 ${data.ensaios_clinicos.fase_avancada ? 'text-green-600' : 'text-red-600'}`}>
                      {data.ensaios_clinicos.fase_avancada ? 'SIM' : 'NÃO'}
                    </p>
                  </div>
                )}

                {data.ensaios_clinicos.tem_no_brasil !== undefined && (
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <span className="text-sm font-medium text-gray-600">Estudos no Brasil</span>
                    <p className={`text-lg font-bold mt-1 ${data.ensaios_clinicos.tem_no_brasil ? 'text-green-600' : 'text-red-600'}`}>
                      {data.ensaios_clinicos.tem_no_brasil ? 'SIM' : 'NÃO'}
                    </p>
                  </div>
                )}
              </div>

              {data.ensaios_clinicos.principais_indicacoes_estudadas && (
                <div className="mt-6">
                  <span className="text-sm font-medium text-gray-600 mb-2 block">Principais Indicações</span>
                  <div className="flex flex-wrap gap-2">
                    {data.ensaios_clinicos.principais_indicacoes_estudadas.map((indicacao: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {indicacao}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orange Book */}
          {data.orange_book && (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">FDA Orange Book</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.orange_book.nda_number && (
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <span className="text-sm font-medium text-gray-600">Número NDA</span>
                    <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{data.orange_book.nda_number}</p>
                  </div>
                )}
                
                {data.orange_book.tem_generico !== undefined && (
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <span className="text-sm font-medium text-gray-600">Possui Genérico</span>
                    <p className={`text-lg font-bold mt-1 ${data.orange_book.tem_generico ? 'text-green-600' : 'text-red-600'}`}>
                      {data.orange_book.tem_generico ? 'SIM' : 'NÃO'}
                    </p>
                  </div>
                )}

                {data.orange_book.data_ultimo_generico && (
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <span className="text-sm font-medium text-gray-600">Último Genérico</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{data.orange_book.data_ultimo_generico}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Regulação por País */}
          {data.regulacao_por_pais && data.regulacao_por_pais.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 size={24} className="text-red-600" />
                <h3 className="text-xl font-bold text-gray-900">Regulação por País</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.regulacao_por_pais.map((regulacao: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-2">{regulacao.pais}</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Agência:</strong> {regulacao.agencia}</div>
                      <div><strong>Classificação:</strong> {regulacao.classificacao}</div>
                      <div><strong>Facilidade Registro:</strong> {regulacao.facilidade_registro_generico}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatentDashboardReport;