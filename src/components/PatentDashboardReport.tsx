import { useState, useEffect } from 'react';
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
  Rocket
  Copy,
  Factory,
  Users,
  BarChart3,
  Zap,
  Clock,
  Star,
  Lightbulb,
  Briefcase,
  TrendingDown,
  Activity
} from 'lucide-react';
import Flag from 'react-world-flags';
import jsPDF from 'jspdf';

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
  'United Kingdom': 'GB',
  'Canadá': 'CA',
  'Canada': 'CA'
};

const getCountryCode = (countryName: string): string => {
  return countryCodeMap[countryName] || 'UN';
};

// Componente Gauge Animado para Score de Oportunidade
const OpportunityGauge = ({ 
  score, 
  classification 
}: { 
  score: number; 
  classification: string; 
}) => {
  const radius = 120;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  
  const [animatedScore, setAnimatedScore] = useState(0);
  const [strokeDashoffset, setStrokeDashoffset] = useState(circumference);

  useEffect(() => {
    const duration = 2000; // 2 segundos
    const steps = 60;
    const increment = score / steps;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const currentScore = Math.min(increment * currentStep, score);
      setAnimatedScore(Math.round(currentScore * 10) / 10); // Uma casa decimal
      setStrokeDashoffset(circumference - (currentScore / 10) * circumference);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [score, circumference]);

  const getColor = (score: number) => {
    if (score >= 8) return '#10B981'; // Verde
    if (score >= 6) return '#F59E0B'; // Amarelo
    if (score >= 4) return '#F97316'; // Laranja
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
            stroke="rgba(255,255,255,0.2)"
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
          <span className="font-bold text-white text-5xl">
            {animatedScore}
          </span>
          <span className="text-white text-base">
            de 10
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-white">{classification}</div>
      </div>
    </div>
  );
};

// Componente para critérios do score
const ScoreCriteria = ({ criterios }: { criterios: any }) => {
  const getCriteriaIcon = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />;
    }
    
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue.includes('alto') || lowerValue.includes('alta')) {
        return <AlertTriangle size={16} className="text-red-400" />;
      } else if (lowerValue.includes('moderado') || lowerValue.includes('média')) {
        return <AlertTriangle size={16} className="text-yellow-400" />;
      } else if (lowerValue.includes('baixo') || lowerValue.includes('baixa')) {
        return <CheckCircle size={16} className="text-green-400" />;
      }
    }
    
    return <AlertTriangle size={16} className="text-gray-400" />;
  };

  const getCriteriaColor = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? 'text-green-300' : 'text-red-300';
    }
    
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue.includes('alto') || lowerValue.includes('alta')) {
        return 'text-red-300';
      } else if (lowerValue.includes('moderado') || lowerValue.includes('média')) {
        return 'text-yellow-300';
      } else if (lowerValue.includes('baixo') || lowerValue.includes('baixa')) {
        return 'text-green-300';
      }
    }
    
    return 'text-gray-300';
  };

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-white mb-4">Critérios de Avaliação</h4>
      
      {/* Critérios de Patente */}
      {criterios.patente && (
        <div className="bg-blue-800/30 rounded-lg p-4 border border-blue-600/50">
          <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Shield size={18} className="text-blue-400" />
            Análise de Patentes
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              {getCriteriaIcon(criterios.patente.vigente)}
              <span className="text-white text-sm">Patente Vigente:</span>
              <span className={`text-sm font-medium ${getCriteriaColor(criterios.patente.vigente)}`}>
                {criterios.patente.vigente ? 'SIM' : 'NÃO'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getCriteriaIcon(criterios.patente.expiracao_proxima)}
              <span className="text-white text-sm">Expiração Próxima:</span>
              <span className={`text-sm font-medium ${getCriteriaColor(criterios.patente.expiracao_proxima)}`}>
                {criterios.patente.expiracao_proxima ? 'SIM' : 'NÃO'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getCriteriaIcon(criterios.patente.risco_judicial)}
              <span className="text-white text-sm">Risco Judicial:</span>
              <span className={`text-sm font-medium ${getCriteriaColor(criterios.patente.risco_judicial)}`}>
                {criterios.patente.risco_judicial}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Critérios de Regulação */}
      {criterios.regulacao && (
        <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600/50">
          <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Building2 size={18} className="text-purple-400" />
            Análise Regulatória
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              {getCriteriaIcon(criterios.regulacao.facilidade_registro_generico)}
              <span className="text-white text-sm">Facilidade Registro:</span>
              <span className={`text-sm font-medium ${getCriteriaColor(criterios.regulacao.facilidade_registro_generico)}`}>
                {criterios.regulacao.facilidade_registro_generico}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getCriteriaIcon(!criterios.regulacao.registro_anvisa_encontrado)}
              <span className="text-white text-sm">ANVISA:</span>
              <span className={`text-sm font-medium ${getCriteriaColor(!criterios.regulacao.registro_anvisa_encontrado)}`}>
                {criterios.regulacao.registro_anvisa_encontrado ? 'Registrado' : 'Não Registrado'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Critérios de Ensaios Clínicos */}
      {criterios.ensaios_clinicos && (
        <div className="bg-green-800/30 rounded-lg p-4 border border-green-600/50">
          <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
            <TestTube size={18} className="text-green-400" />
            Ensaios Clínicos
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-green-400" />
              <span className="text-white text-sm">Estudos Ativos:</span>
              <span className="text-green-300 text-sm font-medium">
                {criterios.ensaios_clinicos.ativos?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getCriteriaIcon(criterios.ensaios_clinicos.fase_avancada)}
              <span className="text-white text-sm">Fase Avançada:</span>
              <span className={`text-sm font-medium ${getCriteriaColor(criterios.ensaios_clinicos.fase_avancada)}`}>
                {criterios.ensaios_clinicos.fase_avancada ? 'SIM' : 'NÃO'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getCriteriaIcon(criterios.ensaios_clinicos.tem_no_brasil)}
              <span className="text-white text-sm">No Brasil:</span>
              <span className={`text-sm font-medium ${getCriteriaColor(criterios.ensaios_clinicos.tem_no_brasil)}`}>
                {criterios.ensaios_clinicos.tem_no_brasil ? 'SIM' : 'NÃO'}
              </span>
            </div>
          </div>
          
          {criterios.ensaios_clinicos.principais_indicacoes_estudadas && (
            <div className="mt-3">
              <span className="text-white text-sm block mb-2">Principais Indicações:</span>
              <div className="flex flex-wrap gap-2">
                {criterios.ensaios_clinicos.principais_indicacoes_estudadas.map((indicacao: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-green-600 text-white rounded text-xs">
                    {indicacao}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Componente para copiar texto
const CopyableText = ({ text, title }: { text: string; title: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-colors ${
            copied 
              ? 'bg-green-100 text-green-700' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <div className="bg-white p-3 rounded border border-gray-200 font-mono text-sm text-gray-800 whitespace-pre-wrap">
        {text}
      </div>
    </div>
  );
};

const PatentDashboardReport = ({ data, onBack }: PatentDashboardReportProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const consulta = data.consulta || {};
  const scoreOportunidade = data.score_oportunidade || {};
  const dadosTecnicos = data.dados_tecnicos || {};
  const dadosMercado = data.dados_mercado_latam || {};
  const registroRegulatorio = data.registro_regulatorio || {};
  const comparativoSimilares = data.comparativo_similares || [];
  const produtoProposto = data.produto_proposto || {};
  const analiseSwot = data.analise_swot || {};
  const pipelineConcorrente = data.pipeline_concorrente || [];
  const complexidadeFabricacao = data.complexidade_de_fabricacao || {};
  const indicadoresGoToMarket = data.indicadores_go_to_market || {};

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
      pdf.text('RELATÓRIO COMPLETO DE ANÁLISE FARMACÊUTICA', margin, yPosition);
      yPosition += 15;
      
      // Produto
      pdf.setFontSize(14);
      pdf.text(`Produto: ${consulta.nome_comercial} (${consulta.nome_molecula})`, margin, yPosition);
      yPosition += 10;
      
      // Score
      pdf.setFontSize(12);
      pdf.text(`Score de Oportunidade: ${scoreOportunidade.valor}/10 (${scoreOportunidade.classificacao})`, margin, yPosition);
      yPosition += 10;
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      
      const fileName = `relatorio-completo-${consulta.nome_comercial?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
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
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard de Análise Farmacêutica</h1>
                  <p className="text-gray-600">Relatório completo de oportunidade de mercado</p>
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
          {/* Header da Consulta */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-2">
                {consulta.nome_comercial} ({consulta.nome_molecula})
              </h2>
              <p className="text-blue-200 text-xl">
                Cliente: {consulta.cliente} | Categoria: {consulta.categoria}
              </p>
              <p className="text-blue-300 text-lg">
                {consulta.beneficio} para {consulta.doenca_alvo}
              </p>
            </div>

            {/* Score de Oportunidade */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-bold text-white mb-6">Score de Oportunidade</h3>
                <OpportunityGauge 
                  score={scoreOportunidade.valor || 0} 
                  classification={scoreOportunidade.classificacao || 'N/A'} 
                />
              </div>
              
              <div>
                <ScoreCriteria criterios={scoreOportunidade.criterios || {}} />
              </div>
            </div>
          </div>

          {/* Justificativa do Score */}
          {scoreOportunidade.justificativa_detalhada && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Lightbulb size={24} className="text-yellow-600" />
                Justificativa do Score
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed text-lg">
                  {scoreOportunidade.justificativa_detalhada}
                </p>
              </div>
            </div>
          )}

          {/* Vencimentos das Patentes por País */}
          {scoreOportunidade.criterios?.patente?.dados && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar size={24} className="text-blue-600" />
                Vencimentos das Patentes por País
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scoreOportunidade.criterios.patente.dados.map((item: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Flag 
                        code={getCountryCode(item.pais)} 
                        style={{ width: 24, height: 18 }}
                      />
                      <span className="font-medium text-gray-900">{item.pais}</span>
                    </div>
                    <div className="text-sm">
                      <strong>Expiração:</strong> 
                      <span className="ml-1 font-mono text-blue-600">{item.expiracao}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Regulatório */}
          {registroRegulatorio && Object.keys(registroRegulatorio).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Building2 size={24} className="text-red-600" />
                Status Regulatório
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {registroRegulatorio.FDA && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <Flag code="US" style={{ width: 20, height: 15 }} />
                      FDA (Estados Unidos)
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>NDA:</strong> 
                        <span className="ml-1 font-mono">{registroRegulatorio.FDA.nda_number}</span>
                      </div>
                      <div>
                        <strong>Aprovação:</strong> 
                        <span className="ml-1">{new Date(registroRegulatorio.FDA.data_aprovacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Genéricos:</strong>
                        {registroRegulatorio.FDA.genericos_aprovados ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-red-600" />
                        )}
                        <span>{registroRegulatorio.FDA.genericos_aprovados ? 'Aprovados' : 'Não Aprovados'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {registroRegulatorio.EMA && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                      <Flag code="EU" style={{ width: 20, height: 15 }} />
                      EMA (Europa)
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <strong>Registro:</strong>
                        {registroRegulatorio.EMA.registro ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-red-600" />
                        )}
                        <span>{registroRegulatorio.EMA.registro ? 'Aprovado' : 'Não Aprovado'}</span>
                      </div>
                      <div>
                        <strong>Aprovação:</strong> 
                        <span className="ml-1">{new Date(registroRegulatorio.EMA.data_aprovacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                )}

                {registroRegulatorio.ANVISA && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                      <Flag code="BR" style={{ width: 20, height: 15 }} />
                      ANVISA (Brasil)
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <strong>Registro:</strong>
                        {registroRegulatorio.ANVISA.registro_encontrado ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <XCircle size={16} className="text-red-600" />
                        )}
                        <span>{registroRegulatorio.ANVISA.registro_encontrado ? 'Encontrado' : 'Não Encontrado'}</span>
                      </div>
                      <div>
                        <strong>Número:</strong> 
                        <span className="ml-1">{registroRegulatorio.ANVISA.numero_registro}</span>
                      </div>
                      <div>
                        <strong>Data:</strong> 
                        <span className="ml-1">{registroRegulatorio.ANVISA.data_registro}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dados Técnicos */}
          {dadosTecnicos && Object.keys(dadosTecnicos).length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Beaker size={24} className="text-purple-600" />
                Dados Técnicos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Fórmula Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{dadosTecnicos.formula_molecular}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Peso Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{dadosTecnicos.peso_molecular} g/mol</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Área Polar Topológica</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{dadosTecnicos.topological_polar_surface_area} Ų</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Ligações Rotacionáveis</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{dadosTecnicos.rotatable_bonds}</p>
                </div>

                {dadosTecnicos.iupac_name && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100 md:col-span-2 lg:col-span-3">
                    <span className="text-sm font-medium text-gray-600">Nome IUPAC</span>
                    <p className="text-sm text-gray-900 mt-1 break-words font-mono">{dadosTecnicos.iupac_name}</p>
                  </div>
                )}

                {dadosTecnicos.smiles && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100 md:col-span-2 lg:col-span-3">
                    <span className="text-sm font-medium text-gray-600">SMILES</span>
                    <p className="text-sm font-mono text-gray-900 mt-1 break-all">{dadosTecnicos.smiles}</p>
                  </div>
                )}
              </div>
              
              {dadosTecnicos.fonte && (
                <div className="mt-4">
                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                    📊 {dadosTecnicos.fonte}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Ensaios Clínicos */}
          {scoreOportunidade.criterios?.ensaios_clinicos && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TestTube size={24} className="text-green-600" />
                Ensaios Clínicos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">Estudos Ativos</span>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {scoreOportunidade.criterios.ensaios_clinicos.ativos?.toLocaleString()}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">Fase Avançada</span>
                  <p className={`text-lg font-bold mt-1 ${scoreOportunidade.criterios.ensaios_clinicos.fase_avancada ? 'text-green-600' : 'text-red-600'}`}>
                    {scoreOportunidade.criterios.ensaios_clinicos.fase_avancada ? 'SIM' : 'NÃO'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">Estudos no Brasil</span>
                  <p className={`text-lg font-bold mt-1 ${scoreOportunidade.criterios.ensaios_clinicos.tem_no_brasil ? 'text-green-600' : 'text-red-600'}`}>
                    {scoreOportunidade.criterios.ensaios_clinicos.tem_no_brasil ? 'SIM' : 'NÃO'}
                  </p>
                </div>
              </div>

              {scoreOportunidade.criterios.ensaios_clinicos.principais_indicacoes_estudadas && (
                <div className="mb-6">
                  <span className="text-sm font-medium text-gray-600 mb-2 block">Principais Indicações</span>
                  <div className="flex flex-wrap gap-2">
                    {scoreOportunidade.criterios.ensaios_clinicos.principais_indicacoes_estudadas.map((indicacao: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {indicacao}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Exemplo de Estudo */}
              {scoreOportunidade.criterios.ensaios_clinicos.exemplo_estudo && (
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Estudo em Destaque</h4>
                  <div className="space-y-2">
                    <p className="text-gray-800">{scoreOportunidade.criterios.ensaios_clinicos.exemplo_estudo.titulo}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Award size={16} className="text-green-600" />
                        <span><strong>Fase:</strong> {scoreOportunidade.criterios.ensaios_clinicos.exemplo_estudo.fase}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flag 
                          code={getCountryCode(scoreOportunidade.criterios.ensaios_clinicos.exemplo_estudo.pais)} 
                          style={{ width: 16, height: 12 }}
                        />
                        <span><strong>País:</strong> {scoreOportunidade.criterios.ensaios_clinicos.exemplo_estudo.pais}</span>
                      </div>
                    </div>
                    {scoreOportunidade.criterios.ensaios_clinicos.exemplo_estudo.link && (
                      <a 
                        href={scoreOportunidade.criterios.ensaios_clinicos.exemplo_estudo.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                      >
                        Ver estudo completo
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dados de Mercado LATAM */}
          {dadosMercado.precos && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign size={24} className="text-green-600" />
                Análise de Mercado LATAM
              </h3>
              
              {/* Preços por País */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Preços por País</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(dadosMercado.precos).map(([pais, preco]: [string, any]) => (
                    <div key={pais} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <Flag 
                          code={getCountryCode(pais)} 
                          style={{ width: 24, height: 18 }}
                        />
                        <span className="font-medium text-gray-900">{pais}</span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Preço Médio:</strong> 
                          <span className="ml-1 text-green-600 font-bold">
                            {preco.preco_medio?.toLocaleString()} {preco.moeda}
                          </span>
                        </div>
                        
                        {preco.faixa_preco && (
                          <div>
                            <strong>Faixa:</strong> 
                            <span className="ml-1">
                              {preco.faixa_preco.min?.toLocaleString()} - {preco.faixa_preco.max?.toLocaleString()} {preco.faixa_preco.moeda}
                            </span>
                          </div>
                        )}
                        
                        {preco.fonte && (
                          <div className="mt-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                              📊 {preco.fonte}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volume de Buscas Google */}
              {dadosMercado.volume_buscas_mensais_google && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Volume de Buscas Mensais (Google)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(dadosMercado.volume_buscas_mensais_google).map(([pais, volume]: [string, any]) => (
                      <div key={pais} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag 
                            code={getCountryCode(pais)} 
                            style={{ width: 20, height: 15 }}
                          />
                          <span className="font-medium text-gray-900">{pais}</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {volume?.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">buscas/mês</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comparativo de Similares */}
          {comparativoSimilares.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-orange-600" />
                Comparativo de Produtos Similares
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {comparativoSimilares.map((produto: any, index: number) => (
                  <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-lg text-orange-900 mb-3">{produto.nome_comercial}</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <strong>Molécula:</strong> 
                        <span className="ml-1">{produto.nome_molecula}</span>
                      </div>
                      <div>
                        <strong>Status Patente:</strong> 
                        <span className="ml-1">{produto.status_patente}</span>
                      </div>
                      <div>
                        <strong>Preço Médio:</strong> 
                        <span className="ml-1 text-orange-600 font-bold">
                          {produto.preco_medio?.valor?.toLocaleString()} {produto.preco_medio?.moeda}
                        </span>
                      </div>
                      <div>
                        <strong>Fabricante:</strong> 
                        <span className="ml-1">{produto.fabricante}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUTO PROPOSTO - Seção Destacada */}
          {produtoProposto && Object.keys(produtoProposto).length > 0 && (
            <div className="bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 rounded-xl shadow-2xl border border-emerald-700 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-600 rounded-full mb-4">
                  <Lightbulb size={24} className="text-white" />
                  <span className="text-white text-xl font-bold">PRODUTO PROPOSTO</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  {produtoProposto.nome_sugerido}
                </h2>
                <p className="text-emerald-200 text-xl">
                  {produtoProposto.tipo} | {produtoProposto.beneficio}
                </p>
              </div>

              {/* Justificativa */}
              {produtoProposto.justificativa && (
                <div className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-600/50 mb-8">
                  <h4 className="text-lg font-bold text-white mb-3">Justificativa Estratégica</h4>
                  <p className="text-emerald-100 leading-relaxed text-lg">
                    {produtoProposto.justificativa}
                  </p>
                </div>
              )}

              {/* Linha do Tempo */}
              {produtoProposto.linha_do_tempo && (
                <div className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-600/50 mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-emerald-400" />
                    Cronograma de Desenvolvimento
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(produtoProposto.linha_do_tempo).map(([fase, tempo]: [string, any]) => (
                      <div key={fase} className="text-center">
                        <div className="bg-emerald-600 text-white px-3 py-2 rounded-lg font-bold">
                          {tempo}
                        </div>
                        <div className="text-emerald-200 text-sm mt-2 capitalize">
                          {fase.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ROI Estimado */}
              {produtoProposto.roi_estimado && (
                <div className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-600/50 mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-400" />
                    ROI Estimado
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {produtoProposto.roi_estimado.map((roi: any, index: number) => (
                      <div key={index} className="bg-white p-4 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">Ano {roi.ano}</div>
                          <div className="text-sm text-gray-600 mb-2">Market Share: {(roi.market_share * 100).toFixed(1)}%</div>
                          <div className="text-3xl font-bold text-green-600">{roi.roi}x</div>
                          <div className="text-sm text-gray-600">ROI</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparativo de Preços Proposto */}
              {produtoProposto.comparativo_precos?.proposto && (
                <div className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-600/50 mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <DollarSign size={20} className="text-emerald-400" />
                    Preços Propostos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(produtoProposto.comparativo_precos.proposto).map(([pais, preco]: [string, any]) => (
                      <div key={pais} className="bg-white p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag 
                            code={getCountryCode(pais)} 
                            style={{ width: 20, height: 15 }}
                          />
                          <span className="font-medium text-gray-900">{pais}</span>
                        </div>
                        <div className="text-xl font-bold text-emerald-600">
                          {preco.valor?.toLocaleString()} {preco.moeda}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estratégia Go-to-Market */}
              {produtoProposto.estrategia_go_to_market && (
                <div className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-600/50 mb-8">
                  <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                    <Target size={20} className="text-emerald-400" />
                    Estratégia Go-to-Market
                  </h4>
                  <p className="text-emerald-100 leading-relaxed">
                    {produtoProposto.estrategia_go_to_market}
                  </p>
                </div>
              )}

              {/* Plano de Lançamento */}
              {produtoProposto.plano_lancamento && (
                <div className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-600/50 mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Rocket size={20} className="text-emerald-400" />
                    Plano de Lançamento
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {produtoProposto.plano_lancamento.midia_tradicional && (
                      <div>
                        <h5 className="text-emerald-200 font-semibold mb-2">Mídia Tradicional</h5>
                        <ul className="space-y-1">
                          {produtoProposto.plano_lancamento.midia_tradicional.map((midia: string, idx: number) => (
                            <li key={idx} className="text-emerald-100 text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                              {midia}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {produtoProposto.plano_lancamento.midia_alternativa && (
                      <div>
                        <h5 className="text-emerald-200 font-semibold mb-2">Mídia Digital</h5>
                        <ul className="space-y-1">
                          {produtoProposto.plano_lancamento.midia_alternativa.map((midia: string, idx: number) => (
                            <li key={idx} className="text-emerald-100 text-sm flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                              {midia}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {produtoProposto.plano_lancamento.budget_marketing_estimado && (
                    <div className="mt-4 p-4 bg-emerald-700/50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                          {produtoProposto.plano_lancamento.budget_marketing_estimado.valor?.toLocaleString()} {produtoProposto.plano_lancamento.budget_marketing_estimado.moeda}
                        </div>
                        <div className="text-emerald-200">
                          Budget de Marketing ({produtoProposto.plano_lancamento.budget_marketing_estimado.periodo})
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mercado Alvo */}
              {produtoProposto.mercado_alvo && (
                <div className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-600/50 mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users size={20} className="text-emerald-400" />
                    Mercado Alvo
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-emerald-200 text-sm">Público Destinado:</span>
                      <p className="text-white font-medium">{produtoProposto.mercado_alvo.publico_destinado}</p>
                    </div>
                    
                    <div>
                      <span className="text-emerald-200 text-sm">Tamanho do Público:</span>
                      <p className="text-white font-bold text-xl">
                        {produtoProposto.mercado_alvo.tamanho_do_publico_estimado?.toLocaleString()} pessoas
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-blue-600">
                          ${produtoProposto.mercado_alvo.TAM?.valor?.toLocaleString()} {produtoProposto.mercado_alvo.TAM?.moeda}
                        </div>
                        <div className="text-sm text-gray-600">TAM (Total Addressable Market)</div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-purple-600">
                          ${produtoProposto.mercado_alvo.SAM?.valor?.toLocaleString()} {produtoProposto.mercado_alvo.SAM?.moeda}
                        </div>
                        <div className="text-sm text-gray-600">SAM (Serviceable Addressable Market)</div>
                      </div>
                      
                      <div className="bg-white p-3 rounded-lg text-center">
                        <div className="text-lg font-bold text-green-600">
                          ${produtoProposto.mercado_alvo.SOM?.valor?.toLocaleString()} {produtoProposto.mercado_alvo.SOM?.moeda}
                        </div>
                        <div className="text-sm text-gray-600">SOM (Serviceable Obtainable Market)</div>
                        {produtoProposto.mercado_alvo.SOM?.observacao && (
                          <div className="text-xs text-gray-500 mt-1">
                            {produtoProposto.mercado_alvo.SOM.observacao}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Análise de Riscos */}
              {produtoProposto.analise_de_riscos?.comercial && (
                <div className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-600/50 mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} className="text-emerald-400" />
                    Análise de Riscos Comerciais
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-emerald-200 font-semibold mb-3">Riscos Identificados</h5>
                      <ul className="space-y-2">
                        {produtoProposto.analise_de_riscos.comercial.riscos?.map((risco: string, idx: number) => (
                          <li key={idx} className="text-red-200 text-sm flex items-start gap-2">
                            <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                            {risco}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-emerald-200 font-semibold mb-3">Estratégias de Mitigação</h5>
                      <ul className="space-y-2">
                        {produtoProposto.analise_de_riscos.comercial.mitigacoes?.map((mitigacao: string, idx: number) => (
                          <li key={idx} className="text-green-200 text-sm flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                            {mitigacao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Indicadores Financeiros Adicionais */}
              {produtoProposto.indicadores_financeiros_adicionais && (
                <div className="bg-emerald-800/50 rounded-lg p-6 border border-emerald-600/50 mb-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <BarChart3 size={20} className="text-emerald-400" />
                    Indicadores Financeiros
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {produtoProposto.indicadores_financeiros_adicionais.payback_estimado_anos} anos
                      </div>
                      <div className="text-sm text-gray-600">Payback Estimado</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {(produtoProposto.indicadores_financeiros_adicionais.margem_bruta_estimada * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-gray-600">Margem Bruta Estimada</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {produtoProposto.indicadores_financeiros_adicionais.investimento_total_estimado?.valor?.toLocaleString()} {produtoProposto.indicadores_financeiros_adicionais.investimento_total_estimado?.moeda}
                      </div>
                      <div className="text-sm text-gray-600">Investimento Total</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Documentação para INPI */}
          {produtoProposto.documentacao_patente_inpi && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={24} className="text-indigo-600" />
                Documentação para Registro no INPI
              </h3>
              
              <div className="space-y-4">
                <CopyableText 
                  title="Título da Patente"
                  text={produtoProposto.documentacao_patente_inpi.titulo}
                />
                
                <CopyableText 
                  title="Resumo Técnico"
                  text={produtoProposto.documentacao_patente_inpi.resumo}
                />

                {produtoProposto.documentacao_patente_inpi.itens_incluidos && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Itens Incluídos na Documentação</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {produtoProposto.documentacao_patente_inpi.itens_incluidos.map((item: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-indigo-50 rounded">
                          <CheckCircle size={16} className="text-indigo-600" />
                          <span className="text-indigo-800 text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Análise SWOT */}
          {analiseSwot && Object.keys(analiseSwot).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target size={24} className="text-purple-600" />
                Análise SWOT
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Forças */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-600" />
                    Forças
                  </h4>
                  <ul className="space-y-2">
                    {analiseSwot.forcas?.map((forca: string, idx: number) => (
                      <li key={idx} className="text-green-800 text-sm flex items-start gap-2">
                        <CheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                        {forca}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fraquezas */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                    <TrendingDown size={18} className="text-red-600" />
                    Fraquezas
                  </h4>
                  <ul className="space-y-2">
                    {analiseSwot.fraquezas?.map((fraqueza: string, idx: number) => (
                      <li key={idx} className="text-red-800 text-sm flex items-start gap-2">
                        <XCircle size={14} className="text-red-600 mt-0.5 flex-shrink-0" />
                        {fraqueza}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Oportunidades */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <Star size={18} className="text-blue-600" />
                    Oportunidades
                  </h4>
                  <ul className="space-y-2">
                    {analiseSwot.oportunidades?.map((oportunidade: string, idx: number) => (
                      <li key={idx} className="text-blue-800 text-sm flex items-start gap-2">
                        <Star size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                        {oportunidade}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Ameaças */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-yellow-600" />
                    Ameaças
                  </h4>
                  <ul className="space-y-2">
                    {analiseSwot.ameacas?.map((ameaca: string, idx: number) => (
                      <li key={idx} className="text-yellow-800 text-sm flex items-start gap-2">
                        <AlertTriangle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        {ameaca}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Pipeline Concorrente */}
          {pipelineConcorrente.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Briefcase size={24} className="text-orange-600" />
                Pipeline Concorrente
              </h3>
              
              <div className="space-y-4">
                {pipelineConcorrente.map((concorrente: any, index: number) => (
                  <div key={index} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Molécula</span>
                        <p className="font-bold text-orange-900">{concorrente.nome_molecula}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Empresa</span>
                        <p className="font-medium text-gray-900">{concorrente.empresa}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Fase Clínica</span>
                        <p className="font-medium text-gray-900">{concorrente.fase_clinica}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Status</span>
                        <p className="font-medium text-gray-900">{concorrente.status}</p>
                      </div>
                    </div>
                    {concorrente.observacoes && (
                      <div className="mt-3 p-3 bg-orange-100 rounded border border-orange-200">
                        <p className="text-orange-800 text-sm">{concorrente.observacoes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complexidade de Fabricação */}
          {complexidadeFabricacao && Object.keys(complexidadeFabricacao).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Factory size={24} className="text-gray-600" />
                Complexidade de Fabricação
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">API Exclusiva Necessária</span>
                  <div className="mt-2 flex items-center gap-2">
                    {complexidadeFabricacao.necessita_api_exclusiva ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-red-600" />
                    )}
                    <span className="font-bold">
                      {complexidadeFabricacao.necessita_api_exclusiva ? 'SIM' : 'NÃO'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Dificuldade de Formulação</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {complexidadeFabricacao.grau_dificuldade_formulacao}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-600">Custo por Lote</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${complexidadeFabricacao.custo_estimado_por_lote?.valor?.toLocaleString()} {complexidadeFabricacao.custo_estimado_por_lote?.moeda}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Indicadores Go-to-Market */}
          {indicadoresGoToMarket && Object.keys(indicadoresGoToMarket).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Zap size={24} className="text-yellow-600" />
                Indicadores Go-to-Market
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {(indicadoresGoToMarket.taxa_adocao_medica_esperada * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Taxa de Adoção Médica</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {indicadoresGoToMarket.indicador_satisfacao_esperado}%
                  </div>
                  <div className="text-sm text-gray-600">Satisfação Esperada</div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <span className="text-sm font-medium text-gray-600 block mb-2">Distribuidores Alvo</span>
                  <div className="space-y-1">
                    {indicadoresGoToMarket.distribuidores_alvo?.map((distribuidor: string, idx: number) => (
                      <div key={idx} className="text-yellow-800 text-sm flex items-center gap-2">
                        <Building2 size={12} />
                        {distribuidor}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Justificativa de Formação do Score */}
          {produtoProposto.justificativa_formacao_score && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award size={24} className="text-indigo-600" />
                Justificativa de Formação do Score
              </h3>
              <div className="bg-white p-4 rounded-lg border border-indigo-200">
                <p className="text-gray-800 leading-relaxed text-lg">
                  {produtoProposto.justificativa_formacao_score}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatentDashboardReport;