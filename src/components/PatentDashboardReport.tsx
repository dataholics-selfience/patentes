import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download,
  TrendingUp,
  Calendar,
  MapPin,
  Building2,
  Pill,
  Target,
  DollarSign,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Globe,
  Users,
  Zap,
  Award,
  Lightbulb,
  FileText,
  ExternalLink,
  Shield,
  Factory,
  Briefcase,
  TrendingDown,
  Star,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import Flag from 'react-world-flags';
import jsPDF from 'jspdf';

interface DashboardData {
  consulta: {
    cliente: string;
    termo_pesquisado: string;
    pais_alvo: string[];
    data_consulta: string;
    nome_comercial: string;
    nome_molecula: string;
    industria: string;
    setor: string;
    categoria: string;
    beneficio: string;
    doenca_alvo: string;
  };
  score_oportunidade: {
    valor: number;
    classificacao: string;
    justificativa_detalhada: string;
    criterios: {
      patente: {
        vigente: boolean;
        expiracao_proxima: boolean;
        risco_judicial: string;
        dados: Array<{
          pais: string;
          expiracao: string;
        }>;
      };
      regulacao: {
        facilidade_registro_generico: string;
        registro_anvisa_encontrado: boolean;
      };
      ensaios_clinicos: {
        ativos: number;
        fase_avancada: boolean;
        tem_no_brasil: boolean;
        principais_indicacoes_estudadas: string[];
        exemplo_estudo: {
          titulo: string;
          fase: string;
          pais: string;
          link: string;
        };
      };
    };
  };
  dados_tecnicos: {
    iupac_name: string;
    formula_molecular: string;
    peso_molecular: number;
    smiles: string;
    topological_polar_surface_area: number;
    rotatable_bonds: number;
    fonte: string;
  };
  dados_mercado_latam: {
    precos: {
      [country: string]: {
        preco_medio: number | string;
        moeda: string;
        faixa_preco: {
          min: number | string;
          max: number | string;
          moeda: string;
        };
        fonte: string;
      };
    };
    volume_buscas_mensais_google: {
      [country: string]: number;
    };
  };
  registro_regulatorio: {
    FDA?: {
      nda_number: string;
      data_aprovacao: string;
      genericos_aprovados: boolean;
    };
    EMA?: {
      registro: boolean;
      data_aprovacao: string;
    };
    ANVISA?: {
      registro_encontrado: boolean;
      numero_registro: string;
      data_registro: string;
    };
  };
  comparativo_similares: Array<{
    nome_comercial: string;
    nome_molecula: string;
    status_patente: string;
    preco_medio: {
      valor: number;
      moeda: string;
    };
    fabricante: string;
  }>;
  produto_proposto: {
    nome_sugerido: string;
    tipo: string;
    beneficio: string;
    justificativa: string;
    analise_de_riscos: {
      comercial: {
        riscos: string[];
        mitigacoes: string[];
      };
    };
    linha_do_tempo: {
      [phase: string]: string;
    };
    comparativo_precos: {
      proposto: {
        [country: string]: {
          valor: number;
          moeda: string;
        };
      };
    };
    roi_estimado: Array<{
      ano: number;
      market_share: number;
      roi: number;
    }>;
    estrategia_go_to_market: string;
    plano_lancamento: {
      midia_tradicional: string[];
      midia_alternativa: string[];
      budget_marketing_estimado: {
        valor: number;
        moeda: string;
        periodo: string;
      };
    };
    documentacao_patente_inpi: {
      titulo: string;
      resumo: string;
      itens_incluidos: string[];
    };
    mercado_alvo: {
      publico_destinado: string;
      tamanho_do_publico_estimado: number;
      TAM: { valor: number; moeda: string; };
      SAM: { valor: number; moeda: string; };
      SOM: { valor: number; moeda: string; observacao: string; };
    };
    justificativa_formacao_score: string;
    indicadores_financeiros_adicionais: {
      payback_estimado_anos: number;
      margem_bruta_estimada: number;
      investimento_total_estimado: {
        valor: number;
        moeda: string;
      };
    };
  };
  sugestao_estrategica: {
    recomendacao: string;
    campos_recomendados: string[];
  };
  analise_swot: {
    forcas: string[];
    fraquezas: string[];
    oportunidades: string[];
    ameacas: string[];
  };
  pipeline_concorrente: Array<{
    nome_molecula: string;
    empresa: string;
    fase_clinica: string;
    status: string;
    observacoes: string;
  }>;
  complexidade_de_fabricacao: {
    necessita_api_exclusiva: boolean;
    grau_dificuldade_formulacao: string;
    custo_estimado_por_lote: {
      valor: number;
      moeda: string;
    };
  };
  indicadores_go_to_market: {
    taxa_adocao_medica_esperada: number;
    distribuidores_alvo: string[];
    indicador_satisfacao_esperado: number;
  };
  metadados: {
    versao_relatorio: string;
    data_geracao: string;
    responsavel: string;
  };
}

interface PatentDashboardReportProps {
  data: DashboardData;
  onBack: () => void;
}

// Mapeamento de países para códigos de bandeiras
const countryCodeMap: { [key: string]: string } = {
  'Brasil': 'BR',
  'Brazil': 'BR',
  'Estados Unidos': 'US',
  'EUA': 'US',
  'United States': 'US',
  'México': 'MX',
  'Mexico': 'MX',
  'Chile': 'CL',
  'Argentina': 'AR',
  'União Europeia': 'EU',
  'European Union': 'EU',
  'Japão': 'JP',
  'Japan': 'JP',
  'China': 'CN',
  'Canadá': 'CA',
  'Canada': 'CA',
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
      setAnimatedScore(Math.round(currentScore));
      setStrokeDashoffset(circumference - (currentScore / 100) * circumference);

      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [score, circumference]);

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
          <span className="text-5xl font-bold text-gray-900">
            {animatedScore}
          </span>
          <span className="text-base text-gray-600">
            de 100
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-gray-900">{classification}</div>
        <div className="text-sm text-gray-600">Score de Oportunidade</div>
      </div>
    </div>
  );
};

// Componente para Timeline
const Timeline = ({ timeline }: { timeline: any }) => {
  const phases = Object.entries(timeline).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    duration: value as string
  }));

  return (
    <div className="space-y-4">
      {phases.map((phase, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900">{phase.name}</div>
            <div className="text-sm text-gray-600">{phase.duration}</div>
          </div>
          {index < phases.length - 1 && (
            <div className="w-px h-8 bg-gray-300 ml-4"></div>
          )}
        </div>
      ))}
    </div>
  );
};

// Componente SWOT Matrix
const SWOTMatrix = ({ swot }: { swot: DashboardData['analise_swot'] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Forças */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h4 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
          <ThumbsUp size={20} />
          Forças
        </h4>
        <ul className="space-y-2">
          {swot.forcas.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-green-800">
              <CheckCircle size={16} className="mt-1 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Fraquezas */}
      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
          <ThumbsDown size={20} />
          Fraquezas
        </h4>
        <ul className="space-y-2">
          {swot.fraquezas.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-red-800">
              <AlertTriangle size={16} className="mt-1 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Oportunidades */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
          <Star size={20} />
          Oportunidades
        </h4>
        <ul className="space-y-2">
          {swot.oportunidades.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-blue-800">
              <Target size={16} className="mt-1 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ameaças */}
      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
        <h4 className="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
          <Shield size={20} />
          Ameaças
        </h4>
        <ul className="space-y-2">
          {swot.ameacas.map((item, index) => (
            <li key={index} className="flex items-start gap-2 text-orange-800">
              <AlertTriangle size={16} className="mt-1 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Componente para gráfico de ROI
const ROIChart = ({ roiData }: { roiData: Array<{ ano: number; market_share: number; roi: number; }> }) => {
  const maxROI = Math.max(...roiData.map(d => d.roi));
  
  return (
    <div className="space-y-4">
      {roiData.map((data, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-16 text-center">
            <span className="text-lg font-bold text-gray-900">Ano {data.ano}</span>
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">ROI: {data.roi}x</span>
              <span className="text-sm text-gray-600">Market Share: {(data.market_share * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-1000"
                style={{ width: `${(data.roi / maxROI) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Componente para gráfico de preços
const PriceChart = ({ 
  originalPrices, 
  proposedPrices 
}: { 
  originalPrices: any; 
  proposedPrices: any; 
}) => {
  const countries = Object.keys(originalPrices);
  
  return (
    <div className="space-y-4">
      {countries.map((country) => {
        const original = originalPrices[country];
        const proposed = proposedPrices[country];
        
        if (!original || !proposed || original.preco_medio === 'Indisponível') {
          return null;
        }

        const originalPrice = typeof original.preco_medio === 'number' ? original.preco_medio : 0;
        const proposedPrice = proposed.valor;
        const savings = ((originalPrice - proposedPrice) / originalPrice * 100).toFixed(1);
        
        return (
          <div key={country} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Flag 
                code={getCountryCode(country)} 
                style={{ width: 24, height: 18 }}
              />
              <span className="font-semibold text-gray-900">{country}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-600">Preço Original</div>
                <div className="text-lg font-bold text-red-600">
                  {original.moeda} {originalPrice.toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600">Preço Proposto</div>
                <div className="text-lg font-bold text-green-600">
                  {proposed.moeda} {proposedPrice.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-600">Economia: </span>
              <span className="font-bold text-blue-600">{savings}%</span>
            </div>
          </div>
        );
      })}
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
      pdf.text('DASHBOARD EXECUTIVO - ANÁLISE DE OPORTUNIDADE', margin, yPosition);
      yPosition += 15;
      
      // Cliente e Produto
      pdf.setFontSize(14);
      pdf.text(`Cliente: ${data.consulta.cliente}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Produto: ${data.consulta.nome_comercial} (${data.consulta.nome_molecula})`, margin, yPosition);
      yPosition += 8;
      
      // Score
      pdf.setFontSize(12);
      pdf.text(`Score de Oportunidade: ${data.score_oportunidade.valor}/100`, margin, yPosition);
      yPosition += 10;
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date(data.consulta.data_consulta).toLocaleDateString('pt-BR')}`, margin, yPosition);
      
      const fileName = `dashboard-${data.consulta.cliente.replace(/\s+/g, '-').toLowerCase()}-${data.consulta.nome_comercial.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : currency === 'USD' ? 'USD' : 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  const isRecommended = data.sugestao_estrategica.recomendacao.toLowerCase().includes('sim');

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
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Executivo</h1>
                <p className="text-gray-600">Análise de Oportunidade de Mercado</p>
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

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* 1. Header Executivo */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações do Produto */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Building2 size={24} className="text-blue-200" />
                  <span className="text-blue-200 text-lg">Cliente:</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">{data.consulta.cliente}</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Pill size={16} className="text-blue-300" />
                    <span className="text-blue-100 text-lg">{data.consulta.nome_comercial}</span>
                    <span className="text-blue-200">({data.consulta.nome_molecula})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-blue-300" />
                    <span className="text-blue-100">{data.consulta.categoria}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-300" />
                    <span className="text-blue-100">{data.consulta.doenca_alvo}</span>
                  </div>
                </div>
              </div>

              {/* Países Alvo */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={20} className="text-blue-200" />
                  <span className="text-blue-200">Mercados Alvo:</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {data.consulta.pais_alvo.map((country, index) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-800/50 px-3 py-2 rounded-lg border border-blue-600/50">
                      <Flag 
                        code={getCountryCode(country)} 
                        style={{ width: 20, height: 15 }}
                      />
                      <span className="text-white text-sm font-medium">{country}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data da Consulta */}
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-blue-200" />
                <span className="text-blue-200">Data da Consulta:</span>
                <span className="text-white font-medium">
                  {new Date(data.consulta.data_consulta).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Score de Oportunidade */}
            <div className="flex flex-col items-center justify-center">
              <OpportunityGauge 
                score={data.score_oportunidade.valor} 
                classification={data.score_oportunidade.classificacao}
                size="large" 
              />
            </div>
          </div>
        </div>

        {/* 2. Recomendação Estratégica */}
        <div className={`rounded-xl p-6 border-2 ${
          isRecommended 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-green-500' 
            : 'bg-gradient-to-r from-red-600 to-red-700 border-red-500'
        }`}>
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              {isRecommended ? (
                <CheckCircle size={32} className="text-white" />
              ) : (
                <AlertTriangle size={32} className="text-white" />
              )}
              <h3 className="text-2xl font-bold text-white">
                Recomendação: {isRecommended ? 'PROSSEGUIR' : 'NÃO PROSSEGUIR'}
              </h3>
            </div>
            <p className="text-white text-lg leading-relaxed max-w-4xl mx-auto">
              {data.sugestao_estrategica.recomendacao}
            </p>
            
            {data.produto_proposto.indicadores_financeiros_adicionais && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">
                    {data.produto_proposto.indicadores_financeiros_adicionais.payback_estimado_anos} anos
                  </div>
                  <div className="text-white/80">Payback</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">
                    {(data.produto_proposto.indicadores_financeiros_adicionais.margem_bruta_estimada * 100).toFixed(0)}%
                  </div>
                  <div className="text-white/80">Margem Bruta</div>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(
                      data.produto_proposto.indicadores_financeiros_adicionais.investimento_total_estimado.valor,
                      data.produto_proposto.indicadores_financeiros_adicionais.investimento_total_estimado.moeda
                    )}
                  </div>
                  <div className="text-white/80">Investimento Total</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Análise de Mercado */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tamanho do Mercado */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 size={24} className="text-purple-600" />
              <h3 className="text-xl font-bold text-gray-900">Tamanho do Mercado</h3>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-900">
                    {formatLargeNumber(data.produto_proposto.mercado_alvo.TAM.valor)}
                  </div>
                  <div className="text-purple-700">TAM - Total Addressable Market</div>
                  <div className="text-sm text-purple-600 mt-1">{data.produto_proposto.mercado_alvo.TAM.moeda}</div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-900">
                    {formatLargeNumber(data.produto_proposto.mercado_alvo.SAM.valor)}
                  </div>
                  <div className="text-blue-700">SAM - Serviceable Addressable Market</div>
                  <div className="text-sm text-blue-600 mt-1">{data.produto_proposto.mercado_alvo.SAM.moeda}</div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-900">
                    {formatLargeNumber(data.produto_proposto.mercado_alvo.SOM.valor)}
                  </div>
                  <div className="text-green-700">SOM - Serviceable Obtainable Market</div>
                  <div className="text-sm text-green-600 mt-1">{data.produto_proposto.mercado_alvo.SOM.moeda}</div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {data.produto_proposto.mercado_alvo.tamanho_do_publico_estimado.toLocaleString()}
                  </div>
                  <div className="text-gray-700">Pacientes Alvo</div>
                  <div className="text-sm text-gray-600 mt-1">{data.produto_proposto.mercado_alvo.publico_destinado}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Volume de Buscas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Eye size={24} className="text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Volume de Buscas Mensais</h3>
            </div>
            
            <div className="space-y-4">
              {Object.entries(data.dados_mercado_latam.volume_buscas_mensais_google).map(([country, volume]) => (
                <div key={country} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Flag 
                      code={getCountryCode(country)} 
                      style={{ width: 20, height: 15 }}
                    />
                    <span className="font-medium">{country}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{volume.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">buscas/mês</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Análise de Preços */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <DollarSign size={24} className="text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">Comparativo de Preços</h3>
          </div>
          
          <PriceChart 
            originalPrices={data.dados_mercado_latam.precos}
            proposedPrices={data.produto_proposto.comparativo_precos.proposto}
          />
        </div>

        {/* 5. ROI e Projeções */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp size={24} className="text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Projeções de ROI</h3>
          </div>
          
          <ROIChart roiData={data.produto_proposto.roi_estimado} />
        </div>

        {/* 6. Análise SWOT */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Análise SWOT</h3>
          </div>
          
          <SWOTMatrix swot={data.analise_swot} />
        </div>

        {/* 7. Pipeline Concorrente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Users size={24} className="text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">Pipeline Concorrente</h3>
          </div>
          
          <div className="space-y-4">
            {data.pipeline_concorrente.map((competitor, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Molécula</span>
                    <div className="font-semibold text-gray-900">{competitor.nome_molecula}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Empresa</span>
                    <div className="font-semibold text-gray-900">{competitor.empresa}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fase</span>
                    <div className="font-semibold text-blue-600">{competitor.fase_clinica}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Status</span>
                    <div className={`font-semibold ${
                      competitor.status === 'Em andamento' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {competitor.status}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-700">
                  {competitor.observacoes}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Timeline de Desenvolvimento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock size={24} className="text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Timeline de Desenvolvimento</h3>
          </div>
          
          <Timeline timeline={data.produto_proposto.linha_do_tempo} />
        </div>

        {/* 9. Complexidade de Fabricação */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Factory size={24} className="text-red-600" />
            <h3 className="text-xl font-bold text-gray-900">Complexidade de Fabricação</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
              <div className="text-lg font-bold text-red-900">
                {data.complexidade_de_fabricacao.necessita_api_exclusiva ? 'SIM' : 'NÃO'}
              </div>
              <div className="text-red-700 text-sm">API Exclusiva</div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-center">
              <div className="text-lg font-bold text-orange-900">
                {data.complexidade_de_fabricacao.grau_dificuldade_formulacao}
              </div>
              <div className="text-orange-700 text-sm">Dificuldade</div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
              <div className="text-lg font-bold text-blue-900">
                {formatCurrency(
                  data.complexidade_de_fabricacao.custo_estimado_por_lote.valor,
                  data.complexidade_de_fabricacao.custo_estimado_por_lote.moeda
                )}
              </div>
              <div className="text-blue-700 text-sm">Custo por Lote</div>
            </div>
          </div>
        </div>

        {/* 10. Go-to-Market */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Briefcase size={24} className="text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Estratégia Go-to-Market</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Estratégia Principal</h4>
              <p className="text-gray-700 leading-relaxed bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                {data.produto_proposto.estrategia_go_to_market}
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center bg-green-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {(data.indicadores_go_to_market.taxa_adocao_medica_esperada * 100).toFixed(0)}%
                  </div>
                  <div className="text-green-700 text-sm">Taxa Adoção Médica</div>
                </div>
                
                <div className="text-center bg-blue-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.indicadores_go_to_market.indicador_satisfacao_esperado}%
                  </div>
                  <div className="text-blue-700 text-sm">Satisfação Esperada</div>
                </div>
                
                <div className="text-center bg-purple-50 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(
                      data.produto_proposto.plano_lancamento.budget_marketing_estimado.valor,
                      data.produto_proposto.plano_lancamento.budget_marketing_estimado.moeda
                    )}
                  </div>
                  <div className="text-purple-700 text-sm">Budget Marketing</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Canais de Marketing</h4>
              
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Mídia Tradicional</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {data.produto_proposto.plano_lancamento.midia_tradicional.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Mídia Digital</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {data.produto_proposto.plano_lancamento.midia_alternativa.map((item, index) => (
                      <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Distribuidores Alvo</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {data.indicadores_go_to_market.distribuidores_alvo.map((distributor, index) => (
                      <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {distributor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 11. Documentação INPI */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText size={24} className="text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Documentação para INPI</h3>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h4 className="text-lg font-bold text-blue-900 mb-3">
              {data.produto_proposto.documentacao_patente_inpi.titulo}
            </h4>
            <p className="text-blue-800 mb-4 leading-relaxed">
              {data.produto_proposto.documentacao_patente_inpi.resumo}
            </p>
            
            <div>
              <span className="text-sm font-medium text-blue-700 mb-2 block">Itens Incluídos:</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {data.produto_proposto.documentacao_patente_inpi.itens_incluidos.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white p-2 rounded border border-blue-200">
                    <CheckCircle size={16} className="text-blue-600" />
                    <span className="text-sm text-blue-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 12. Dados Técnicos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Pill size={24} className="text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Dados Técnicos - {data.consulta.nome_molecula}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <span className="text-sm font-medium text-purple-700">Fórmula Molecular</span>
              <div className="text-lg font-bold text-purple-900 font-mono mt-1">
                {data.dados_tecnicos.formula_molecular}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <span className="text-sm font-medium text-blue-700">Peso Molecular</span>
              <div className="text-lg font-bold text-blue-900 mt-1">
                {data.dados_tecnicos.peso_molecular} g/mol
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-green-700">Ligações Rotacionáveis</span>
              <div className="text-lg font-bold text-green-900 mt-1">
                {data.dados_tecnicos.rotatable_bonds}
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 md:col-span-2 lg:col-span-3">
              <span className="text-sm font-medium text-yellow-700">Nome IUPAC</span>
              <div className="text-sm text-yellow-900 mt-1 font-mono break-words">
                {data.dados_tecnicos.iupac_name}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3">
              <span className="text-sm font-medium text-gray-700">SMILES</span>
              <div className="text-sm text-gray-900 mt-1 font-mono break-all">
                {data.dados_tecnicos.smiles}
              </div>
            </div>
          </div>
        </div>

        {/* 13. Registros Regulatórios */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield size={24} className="text-red-600" />
            <h3 className="text-xl font-bold text-gray-900">Status Regulatório</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.registro_regulatorio.FDA && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Flag code="US" style={{ width: 24, height: 18 }} />
                  <span className="font-bold text-blue-900">FDA</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>NDA:</strong> {data.registro_regulatorio.FDA.nda_number}</div>
                  <div><strong>Aprovação:</strong> {data.registro_regulatorio.FDA.data_aprovacao}</div>
                  <div className="flex items-center gap-2">
                    <strong>Genéricos:</strong>
                    {data.registro_regulatorio.FDA.genericos_aprovados ? (
                      <CheckCircle size={16} className="text-green-600" />
                    ) : (
                      <AlertTriangle size={16} className="text-red-600" />
                    )}
                    <span>{data.registro_regulatorio.FDA.genericos_aprovados ? 'Aprovados' : 'Não Aprovados'}</span>
                  </div>
                </div>
              </div>
            )}
            
            {data.registro_regulatorio.ANVISA && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <Flag code="BR" style={{ width: 24, height: 18 }} />
                  <span className="font-bold text-green-900">ANVISA</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>Registro:</strong> {data.registro_regulatorio.ANVISA.numero_registro}</div>
                  <div><strong>Data:</strong> {data.registro_regulatorio.ANVISA.data_registro}</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Registrado</span>
                  </div>
                </div>
              </div>
            )}
            
            {data.registro_regulatorio.EMA && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Flag code="EU" style={{ width: 24, height: 18 }} />
                  <span className="font-bold text-purple-900">EMA</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>Aprovação:</strong> {data.registro_regulatorio.EMA.data_aprovacao}</div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span>Registrado</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 14. Análise Competitiva */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Award size={24} className="text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-900">Análise Competitiva</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Produto</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Molécula</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fabricante</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status Patente</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Preço Médio</th>
                </tr>
              </thead>
              <tbody>
                {data.comparativo_similares.map((product, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{product.nome_comercial}</td>
                    <td className="py-3 px-4 text-gray-700">{product.nome_molecula}</td>
                    <td className="py-3 px-4 text-gray-700">{product.fabricante}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.status_patente.includes('Ativa')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.status_patente}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      {formatCurrency(product.preco_medio.valor, product.preco_medio.moeda)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 15. Justificativa do Score */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb size={24} className="text-yellow-400" />
            <h3 className="text-xl font-bold">Justificativa do Score</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-200 mb-3">Análise Detalhada</h4>
              <p className="text-gray-300 leading-relaxed">
                {data.score_oportunidade.justificativa_detalhada}
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold text-gray-200 mb-3">Formação do Score</h4>
              <p className="text-gray-300 leading-relaxed">
                {data.produto_proposto.justificativa_formacao_score}
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">
                {data.score_oportunidade.valor}
              </div>
              <div className="text-gray-300 text-sm">Score Final</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {data.score_oportunidade.criterios.ensaios_clinicos.ativos}
              </div>
              <div className="text-gray-300 text-sm">Ensaios Ativos</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">
                {data.consulta.pais_alvo.length}
              </div>
              <div className="text-gray-300 text-sm">Mercados Alvo</div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 italic">
              "Análise gerada em {new Date(data.consulta.data_consulta).toLocaleDateString('pt-BR')} para {data.consulta.cliente}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatentDashboardReport;