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
  Lightbulb,
  Users,
  Clock,
  Star,
  Zap,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import jsPDF from 'jspdf';
import Flag from 'react-world-flags';

interface PatentDashboardReportProps {
  data: any;
  onBack: () => void;
}

// Mapeamento de países para códigos de bandeiras
const countryCodeMap: { [key: string]: string } = {
  'Estados Unidos': 'US',
  'United States': 'US',
  'Brasil': 'BR',
  'Brazil': 'BR',
  'Japão': 'JP',
  'Japan': 'JP',
  'Argentina': 'AR',
  'Colômbia': 'CO',
  'Colombia': 'CO',
  'Chile': 'CL',
  'México': 'MX',
  'Mexico': 'MX',
  'União Europeia': 'EU',
  'European Union': 'EU',
  'China': 'CN',
  'Alemanha': 'DE',
  'Germany': 'DE',
  'França': 'FR',
  'France': 'FR',
  'Reino Unido': 'GB',
  'United Kingdom': 'GB'
};

const getCountryCode = (countryName: string): string => {
  return countryCodeMap[countryName] || 'UN';
};

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
      {size === 'normal' && (
        <div className="mt-4 text-center">
          <div className="text-lg font-semibold text-gray-900">{classification}</div>
          <div className="text-sm text-gray-600">Score de Oportunidade</div>
        </div>
      )}
    </div>
  );
};

// Componente para Timeline de Go-to-Market
const GoToMarketTimeline = ({ timeline }: { timeline: any[] }) => {
  if (!timeline) return null;
  
  // Verificar se é um objeto com propriedades de timeline
  let timelineData: any[] = [];
  if (Array.isArray(timeline)) {
    timelineData = timeline;
  } else if (typeof timeline === 'object') {
    // Converter objeto timeline em array
    timelineData = Object.entries(timeline).map(([key, value]) => ({
      fase: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      descricao: typeof value === 'string' ? value : JSON.stringify(value),
      duracao: typeof value === 'object' && value ? (value as any).duracao || 'Não especificado' : 'Não especificado'
    }));
  }
  
  if (timelineData.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Clock className="text-blue-600" size={24} />
        Linha do Tempo - Go to Market
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
        
        <div className="space-y-8">
          {timelineData.map((phase, index) => (
            <div key={index} className="relative flex items-start gap-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-blue-600 bg-white text-blue-600 font-bold text-lg z-10">
                {index + 1}
              </div>
              <div className="flex-1 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900">
                    {phase.fase || phase.etapa || phase.phase || `Fase ${index + 1}`}
                  </h4>
                  <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                    {phase.duracao || phase.tempo || phase.duration || 'Duração não especificada'}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {phase.descricao || phase.atividades || phase.description || 'Descrição não disponível'}
                </p>
                
                {phase.marcos && Array.isArray(phase.marcos) && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-600 mb-2">Marcos importantes:</h5>
                    <ul className="space-y-1">
                      {phase.marcos.map((marco: string, marcoIndex: number) => (
                        <li key={marcoIndex} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {marco}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente para Comparativo de Preços
const PriceComparisonChart = ({ comparativo }: { comparativo: any }) => {
  if (!comparativo || !comparativo.produtos) return null;

  const produtos = Array.isArray(comparativo.produtos) ? comparativo.produtos : [];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="text-green-600" size={24} />
        Comparativo de Preços
      </h3>
      
      <div className="space-y-4">
        {produtos.map((produto: any, index: number) => {
          // Fix: Add null checks and provide default values
          const nome = produto?.nome || produto?.produto || `Produto ${index + 1}`;
          const preco = produto?.preco || produto?.valor || produto?.price || 'Não informado';
          const mercado = produto?.mercado || produto?.pais || produto?.market || 'Não informado';
          
          // Fix: Ensure preco is a string before calling replace
          const precoFormatado = typeof preco === 'string' && preco !== 'Não informado' 
            ? preco.replace(/[^\d,.-]/g, '') 
            : preco;

          return (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{nome}</h4>
                <p className="text-sm text-gray-600">{mercado}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {precoFormatado}
                </div>
                {produto?.unidade && (
                  <div className="text-xs text-gray-500">{produto.unidade}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {comparativo.observacoes && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">{comparativo.observacoes}</p>
        </div>
      )}
    </div>
  );
};

// Componente para Produtos Similares
const SimilarProductsSection = ({ produtos }: { produtos: any[] }) => {
  if (!produtos || !Array.isArray(produtos)) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Pill className="text-purple-600" size={24} />
        Produtos Similares no Mercado
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {produtos.map((produto, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-lg text-gray-900">
                  {produto.nome || produto.produto || `Produto ${index + 1}`}
                </h4>
                {produto.fabricante && (
                  <p className="text-sm text-gray-600">{produto.fabricante}</p>
                )}
              </div>
              {produto.score && (
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium">{produto.score}</span>
                </div>
              )}
            </div>
            
            {produto.principio_ativo && (
              <div className="mb-2">
                <span className="text-xs text-gray-500">Princípio Ativo:</span>
                <p className="text-sm font-medium">{produto.principio_ativo}</p>
              </div>
            )}
            
            {produto.indicacoes && Array.isArray(produto.indicacoes) && (
              <div className="mb-3">
                <span className="text-xs text-gray-500">Indicações:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {produto.indicacoes.map((indicacao: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {indicacao}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {produto.preco && (
              <div className="text-right">
                <span className="text-lg font-bold text-green-600">{produto.preco}</span>
                {produto.unidade && (
                  <span className="text-xs text-gray-500 ml-1">/{produto.unidade}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para Análise de Riscos
const RiskAnalysisSection = ({ analise }: { analise: any }) => {
  if (!analise) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <AlertTriangle className="text-red-600" size={24} />
        Análise de Riscos
      </h3>
      
      <div className="space-y-6">
        {analise.riscos_regulatorios && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Riscos Regulatórios</h4>
            <div className="space-y-2">
              {Array.isArray(analise.riscos_regulatorios) ? (
                analise.riscos_regulatorios.map((risco: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-red-800">{risco}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <span className="text-red-800">{analise.riscos_regulatorios}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {analise.riscos_comerciais && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Riscos Comerciais</h4>
            <div className="space-y-2">
              {Array.isArray(analise.riscos_comerciais) ? (
                analise.riscos_comerciais.map((risco: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <DollarSign size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                    <span className="text-orange-800">{risco}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <span className="text-orange-800">{analise.riscos_comerciais}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {analise.comentario_visualizacao && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Resumo da Análise</h4>
            <p className="text-gray-700 leading-relaxed">{analise.comentario_visualizacao}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente para Recomendações
const RecommendationsSection = ({ recomendacoes }: { recomendacoes: any }) => {
  if (!recomendacoes) return null;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Lightbulb className="text-yellow-600" size={24} />
        Recomendações Estratégicas
      </h3>
      
      <div className="space-y-6">
        {recomendacoes.acoes_imediatas && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Ações Imediatas</h4>
            <div className="space-y-2">
              {Array.isArray(recomendacoes.acoes_imediatas) ? (
                recomendacoes.acoes_imediatas.map((acao: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-green-800">{acao}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-800">{recomendacoes.acoes_imediatas}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {recomendacoes.estrategias_longo_prazo && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Estratégias de Longo Prazo</h4>
            <div className="space-y-2">
              {Array.isArray(recomendacoes.estrategias_longo_prazo) ? (
                recomendacoes.estrategias_longo_prazo.map((estrategia: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Target size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-800">{estrategia}</span>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <span className="text-blue-800">{recomendacoes.estrategias_longo_prazo}</span>
                </div>
              )}
            </div>
          </div>
        )}
        
        {recomendacoes.comentario_visualizacao && (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">Resumo das Recomendações</h4>
            <p className="text-gray-700 leading-relaxed">{recomendacoes.comentario_visualizacao}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PatentDashboardReport = ({ data, onBack }: PatentDashboardReportProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  console.log('🎯 Dashboard data recebido:', data);

  // Extrair dados principais
  const produtoProposto = data?.produto_proposto || {};
  const resumoOportunidade = data?.resumo_oportunidade || {};
  const analiseRiscos = data?.analise_riscos || {};
  const recomendacoes = data?.recomendacoes || {};
  const comparativoTecnico = data?.comparativo_tecnico || {};
  const scoreOportunidade = data?.score_oportunidade || resumoOportunidade?.score_oportunidade || {};
  const metadados = data?.metadados || data?.consulta || {};
  const comparativoSimilares = data?.comparativo_similares || {};
  const produtosSimilares = data?.produtos_similares || [];

  // Dados do cliente e consulta
  const nomeCliente = metadados?.cliente || 'Cliente';
  const nomeProduto = produtoProposto?.nome_sugerido || produtoProposto?.nome_provisório || metadados?.nome_comercial || 'Produto Analisado';
  const nomeMolecula = metadados?.nome_molecula || 'Molécula';

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
      pdf.text(`Produto: ${nomeProduto} (${nomeMolecula})`, margin, yPosition);
      yPosition += 10;
      
      // Cliente
      pdf.setFontSize(12);
      pdf.text(`Cliente: ${nomeCliente}`, margin, yPosition);
      yPosition += 10;
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 15;
      
      // Score
      if (scoreOportunidade?.valor) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Score de Oportunidade: ${scoreOportunidade.valor}/100 (${scoreOportunidade.classificacao})`, margin, yPosition);
        yPosition += 10;
      }
      
      const fileName = `dashboard-${nomeProduto.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
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
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard Executivo</h1>
                  <p className="text-gray-600">Análise completa de oportunidade de mercado</p>
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
          {/* Card Principal - Produto Proposto */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações do Produto */}
              <div className="space-y-6">
                <div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-blue-200 text-lg">Produto Proposto:</span>
                      <h2 className="text-4xl text-white">{nomeProduto}</h2>
                    </div>
                    <div>
                      <span className="text-blue-200 text-lg">Molécula:</span>
                      <p className="text-2xl text-blue-100">{nomeMolecula}</p>
                    </div>
                    <div>
                      <span className="text-blue-200 text-lg">Cliente:</span>
                      <p className="text-xl text-blue-100">{nomeCliente}</p>
                    </div>
                  </div>
                </div>

                {produtoProposto.comentario_visualizacao && (
                  <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                    <h4 className="text-white font-semibold mb-2">Visão Geral</h4>
                    <p className="text-blue-100 leading-relaxed">{produtoProposto.comentario_visualizacao}</p>
                  </div>
                )}
              </div>

              {/* Score de Oportunidade */}
              <div className="space-y-6">
                {scoreOportunidade?.valor && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-center mb-6">
                      <h3 className="text-lg text-white mb-2">Score de Oportunidade</h3>
                    </div>
                    
                    <OpportunityGauge 
                      score={scoreOportunidade.valor} 
                      classification={scoreOportunidade.classificacao || 'Não classificado'} 
                      size="large"
                    />
                    
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold text-white">{scoreOportunidade.classificacao || 'Não classificado'}</div>
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
          </div>

          {/* Go to Market Timeline */}
          {(produtoProposto.go_to_market || produtoProposto.timeline_go_to_market) && (
            <GoToMarketTimeline timeline={produtoProposto.go_to_market || produtoProposto.timeline_go_to_market} />
          )}

          {/* Resumo de Oportunidade */}
          {resumoOportunidade.comentario_visualizacao && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-600" size={24} />
                Resumo de Oportunidade
              </h3>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">{resumoOportunidade.comentario_visualizacao}</p>
              </div>
            </div>
          )}

          {/* Comparativo de Preços */}
          {comparativoSimilares && (
            <PriceComparisonChart comparativo={comparativoSimilares} />
          )}

          {/* Produtos Similares */}
          {produtosSimilares.length > 0 && (
            <SimilarProductsSection produtos={produtosSimilares} />
          )}

          {/* Análise de Riscos */}
          {analiseRiscos && (
            <RiskAnalysisSection analise={analiseRiscos} />
          )}

          {/* Recomendações */}
          {recomendacoes && (
            <RecommendationsSection recomendacoes={recomendacoes} />
          )}

          {/* Comparativo Técnico */}
          {comparativoTecnico.comentario_visualizacao && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TestTube className="text-purple-600" size={24} />
                Comparativo Técnico
              </h3>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">{comparativoTecnico.comentario_visualizacao}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentDashboardReport;