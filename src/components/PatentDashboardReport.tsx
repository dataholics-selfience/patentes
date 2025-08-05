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
  Search,
  TestTube,
  Stethoscope,
  TrendingDown,
  Shield,
  Banknote,
  LineChart
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
    justificativa_detalhada: string;
    fatores_quantitativos: {
      patente_proxima_do_vencimento: boolean;
      quantidade_buscas_google: {
        [country: string]: number;
      };
      prescricoes_clinicas_identificadas: number;
      ensaios_clinicos_em_andamento: number;
      volume_shopping?: {
        [country: string]: {
          preco_medio: string;
          faixa_preco: string;
          principais_fabricantes: string[];
        };
      };
    };
    fatores_qualitativos: {
      tendencia_midiatica: string;
      receptividade_de_mercado: string;
      riscos: string;
      justificativa: string;
    };
  };
  comparativo_similares: Array<{
    nome_comercial: string;
    nome_molecula: string;
    status_patente: string;
    preco_medio: string;
    fabricante: string;
    registro_fda: boolean;
    registro_anvisa: boolean;
  }>;
  produto_proposto: {
    nome_sugerido: string;
    tipo: string;
    industria: string;
    setor: string;
    categoria: string;
    molecula_base: string;
    beneficio: string;
    doenca_alvo: string;
    justificativa: string;
    analise_de_riscos: string;
    go_to_market: {
      modelo: string;
      canais: string[];
      parcerias: string[];
      posicionamento: string;
      estrategia_preco: string;
      timeline_lancamento: string;
    };
    linha_do_tempo: {
      [phase: string]: string;
    };
    comparativos: {
      preco_proposto: {
        [country: string]: string;
      };
      market_share_estimado_ano_1: string;
      market_share_estimado_ano_2: string;
      economia_esperada_por_paciente_ano: {
        [country: string]: string;
      };
    };
    comentario_dashboard_bolt: {
      tipo_grafico_score: string;
      tipo_grafico_comparativo: string;
      tipo_grafico_timeline: string;
      observacoes: string;
    };
  };
}

interface PatentDashboardReportProps {
  data: DashboardData;
  onBack: () => void;
}

// Mapeamento de países para códigos de bandeiras
const countryCodeMap: { [key: string]: string } = {
  'Brasil': 'BR',
  'Estados Unidos': 'US',
  'EUA': 'US',
  'União Europeia': 'EU',
  'Japão': 'JP',
  'China': 'CN',
  'Canadá': 'CA',
  'Argentina': 'AR',
  'México': 'MX',
  'Alemanha': 'DE',
  'França': 'FR',
  'Reino Unido': 'GB'
};

const getCountryCode = (countryName: string): string => {
  return countryCodeMap[countryName] || 'UN';
};

// Componente Gauge para Score de Oportunidade - ATUALIZADO COM CORES BRANCAS
const OpportunityGauge = ({ 
  score, 
  size = 'large' 
}: { 
  score: number; 
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
      setAnimatedScore(Math.round(currentScore * 10) / 10);
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

  const getClassification = (score: number) => {
    if (score >= 8) return 'EXCELENTE';
    if (score >= 6) return 'BOA';
    if (score >= 4) return 'MODERADA';
    return 'BAIXA';
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
          <span className="text-5xl font-bold text-white">
            {animatedScore}
          </span>
          <span className="text-base text-white">
            de 10
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-white">{getClassification(animatedScore)}</div>
        <div className="text-sm text-white">Score de Oportunidade</div>
      </div>
    </div>
  );
};

// Componente para Timeline Melhorada
const EnhancedTimeline = ({ timeline }: { timeline: any }) => {
  const phases = Object.entries(timeline).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      .replace(/ProduçãO/g, 'Produção')
      .replace(/LançAmento/g, 'Lançamento'),
    duration: value as string
  }));

  return (
    <div className="relative">
      {/* Linha conectora */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
      
      <div className="space-y-6">
        {phases.map((phase, index) => (
          <div key={index} className="relative flex items-start gap-6 group">
            {/* Bolinha da timeline */}
            <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm shadow-lg">
              {index + 1}
            </div>
            
            {/* Conteúdo da fase */}
            <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{phase.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock size={16} className="text-blue-600" />
                    <span className="text-blue-600 font-medium">{phase.duration}</span>
                  </div>
                </div>
                <div className="text-2xl">
                  {index === 0 ? '🔬' : 
                   index === 1 ? '⚗️' : 
                   index === 2 ? '🧪' : 
                   index === 3 ? '📋' : 
                   index === 4 ? '🏭' : '🚀'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para Gráfico de Barras de Buscas Google
const GoogleSearchChart = ({ searchData }: { searchData: { [country: string]: number } }) => {
  const maxValue = Math.max(...Object.values(searchData));
  
  return (
    <div className="space-y-4">
      {Object.entries(searchData).map(([country, searches]) => {
        const percentage = (searches / maxValue) * 100;
        
        return (
          <div key={country} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag 
                  code={getCountryCode(country)} 
                  style={{ width: 20, height: 15 }}
                />
                <span className="font-medium text-gray-900">{country}</span>
              </div>
              <span className="font-bold text-blue-600">
                {searches.toLocaleString('pt-BR')} buscas
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Componente para Métricas Clínicas
const ClinicalMetrics = ({ 
  prescricoes, 
  ensaios 
}: { 
  prescricoes: number; 
  ensaios: number; 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
        <div className="flex items-center gap-3 mb-2">
          <Stethoscope size={24} className="text-green-600" />
          <span className="text-sm font-medium text-green-800">Prescrições Clínicas</span>
        </div>
        <div className="text-3xl font-bold text-green-900">{prescricoes.toLocaleString('pt-BR')}</div>
        <div className="text-sm text-green-700">Identificadas</div>
      </div>
      
      <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-xl border border-blue-200">
        <div className="flex items-center gap-3 mb-2">
          <TestTube size={24} className="text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Ensaios Clínicos</span>
        </div>
        <div className="text-3xl font-bold text-blue-900">{ensaios}</div>
        <div className="text-sm text-blue-700">Em Andamento</div>
      </div>
    </div>
  );
};

// Componente para Economia Esperada
const ExpectedSavings = ({ savings }: { savings: { [country: string]: string } }) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <Banknote size={24} className="text-green-600" />
        <h4 className="text-lg font-bold text-green-900">Economia Esperada por Paciente/Ano</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(savings).map(([country, amount]) => (
          <div key={country} className="bg-white p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Flag 
                code={getCountryCode(country)} 
                style={{ width: 24, height: 18 }}
              />
              <span className="font-medium text-gray-900">{country}</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{amount}</div>
            <div className="text-sm text-green-700">por paciente/ano</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Componente para Go-to-Market Strategy Melhorada
const GoToMarketStrategy = ({ strategy }: { strategy: any }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-100 p-6 rounded-xl border border-purple-200">
      <div className="flex items-center gap-3 mb-6">
        <Zap size={24} className="text-purple-600" />
        <h4 className="text-xl font-bold text-purple-900">Estratégia Go-to-Market</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Modelo e Posicionamento */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} className="text-purple-600" />
              <span className="font-semibold text-purple-900">Modelo de Negócio</span>
            </div>
            <p className="text-gray-800">{strategy.modelo}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-purple-600" />
              <span className="font-semibold text-purple-900">Posicionamento</span>
            </div>
            <p className="text-gray-800">{strategy.posicionamento}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-purple-600" />
              <span className="font-semibold text-purple-900">Estratégia de Preço</span>
            </div>
            <p className="text-gray-800">{strategy.estrategia_preco}</p>
          </div>
        </div>
        
        {/* Canais e Parcerias */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={20} className="text-purple-600" />
              <span className="font-semibold text-purple-900">Canais de Distribuição</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {strategy.canais?.map((canal: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {canal}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Users size={20} className="text-purple-600" />
              <span className="font-semibold text-purple-900">Parcerias Estratégicas</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {strategy.parcerias?.map((parceria: string, index: number) => (
                <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  {parceria}
                </span>
              ))}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} className="text-purple-600" />
              <span className="font-semibold text-purple-900">Timeline de Lançamento</span>
            </div>
            <p className="text-gray-800 font-medium">{strategy.timeline_lancamento}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para Gráfico de Comparativo de Preços
const PriceComparisonChart = ({ competitors }: { competitors: any[] }) => {
  const prices = competitors.map(comp => {
    const price = comp.preco_medio.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(price) || 0;
  });
  
  const maxPrice = Math.max(...prices);
  
  return (
    <div className="space-y-4">
      {competitors.map((competitor, index) => {
        const price = prices[index];
        const percentage = maxPrice > 0 ? (price / maxPrice) * 100 : 0;
        
        return (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <span className="font-medium text-gray-900">{competitor.nome_comercial}</span>
                <span className="text-sm text-gray-600">({competitor.fabricante})</span>
              </div>
              <span className="font-bold text-green-600">{competitor.preco_medio}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PatentDashboardReport = ({ data, onBack }: PatentDashboardReportProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Log dos dados recebidos para debug
  useEffect(() => {
    console.log('📊 PatentDashboardReport renderizando com dados:', data);
  }, [data]);

  // Verificação de segurança dos dados
  if (!data) {
    console.error('❌ PatentDashboardReport: dados não fornecidos');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Erro nos Dados</h2>
          <p className="text-gray-600 mb-6">Os dados do dashboard não foram carregados corretamente.</p>
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
      pdf.text(`Score de Oportunidade: ${data.score_oportunidade.valor}/10`, margin, yPosition);
      yPosition += 10;
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date(data.consulta.data_consulta).toLocaleDateString('pt-BR')}`, margin, yPosition);
      
      const fileName = `dashboard-${data.consulta.cliente.replace(/\s+/g, '-').toLowerCase()}-${data.consulta.nome_comercial.replace(/\s+/g, '-').toLowerCase()}-${data.consulta.data_consulta}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatCurrency = (value: string, country: string) => {
    if (country === 'Brasil') {
      return value.startsWith('R$') ? value : `R$ ${value}`;
    }
    return value.startsWith('$') ? value : `$ ${value}`;
  };

  // Verificações de segurança para evitar erros de renderização
  const consulta = data.consulta || {};
  const scoreOportunidade = data.score_oportunidade || data.resumo_oportunidade || {};
  const produtoProposto = data.produto_proposto || {};
  const comparativoSimilares = data.comparativo_similares || data.produtos_similares || [];
  const analiseRiscos = data.analise_riscos || {};
  const recomendacoes = data.recomendacoes || {};
  const comparativoTecnico = data.comparativo_tecnico || {};

  return (
    <>
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
        {/* 1. Dashboard Summary */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informações Principais */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Building2 size={24} className="text-blue-200" />
                  <span className="text-blue-200 text-lg">Cliente:</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">{consulta.cliente || 'Cliente não informado'}</h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Pill size={16} className="text-blue-300" />
                    <span className="text-blue-100 text-lg">{consulta.nome_comercial || 'Produto não informado'}</span>
                    <span className="text-blue-200">({consulta.nome_molecula || 'Molécula não informada'})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target size={16} className="text-blue-300" />
                    <span className="text-blue-100">{consulta.categoria || 'Categoria não informada'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity size={16} className="text-blue-300" />
                    <span className="text-blue-100">{consulta.doenca_alvo || 'Doença alvo não informada'}</span>
                  </div>
                </div>
              </div>

              {/* Países Alvo */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={20} className="text-blue-200" />
                  <span className="text-blue-200">Países Alvo:</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(consulta.pais_alvo || []).map((country, index) => (
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
                  {consulta.data_consulta ? new Date(consulta.data_consulta).toLocaleDateString('pt-BR') : 'Data não informada'}
                </span>
              </div>
            </div>

            {/* Score de Oportunidade */}
            <div className="flex flex-col items-center justify-center">
              <OpportunityGauge score={scoreOportunidade.valor || scoreOportunidade.score_oportunidade || 0} size="large" />
            </div>
          </div>
        </div>

        {/* 2. Análise Detalhada da Oportunidade - EXPANDIDA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={24} className="text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Análise Detalhada da Oportunidade</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Justificativa */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Justificativa do Score</h4>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-gray-700 leading-relaxed">
                  {scoreOportunidade.justificativa_detalhada || 
                   scoreOportunidade.justificativas_score?.beneficio_diferenciado || 
                   'Justificativa não disponível'}
                </p>
              </div>
            </div>

            {/* Status da Patente */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Status da Patente</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {(scoreOportunidade.fatores_quantitativos?.patente_proxima_do_vencimento || 
                    scoreOportunidade.justificativas_score?.expiracao_patente) ? (
                    <>
                      <CheckCircle size={24} className="text-green-600" />
                      <div>
                        <div className="font-semibold text-green-800">Próxima do Vencimento</div>
                        <div className="text-sm text-green-600">Oportunidade para entrada no mercado</div>
                        {scoreOportunidade.justificativas_score?.expiracao_patente && (
                          <div className="text-xs text-green-600 mt-1">
                            Expira em: {scoreOportunidade.justificativas_score.expiracao_patente}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <Shield size={24} className="text-red-600" />
                      <div>
                        <div className="font-semibold text-red-800">Patente Protegida</div>
                        <div className="text-sm text-red-600">Ainda em período de proteção</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Métricas Clínicas */}
          {(scoreOportunidade.fatores_quantitativos?.prescricoes_clinicas_identificadas || 
            scoreOportunidade.fatores_quantitativos?.ensaios_clinicos_em_andamento) && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Dados Clínicos</h4>
              <ClinicalMetrics 
                prescricoes={scoreOportunidade.fatores_quantitativos?.prescricoes_clinicas_identificadas || 0}
                ensaios={scoreOportunidade.fatores_quantitativos?.ensaios_clinicos_em_andamento || 0}
              />
            </div>
          )}

          {/* Volume de Buscas Google */}
          {scoreOportunidade.fatores_quantitativos?.quantidade_buscas_google && (
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Search size={20} className="text-blue-600" />
                Volume de Buscas no Google
              </h4>
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <GoogleSearchChart searchData={scoreOportunidade.fatores_quantitativos.quantidade_buscas_google} />
              </div>
            </div>
          )}

          {/* Dados de Mercado */}
          {scoreOportunidade.fatores_quantitativos?.volume_shopping && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Dados de Mercado</h4>
              {Object.entries(scoreOportunidade.fatores_quantitativos.volume_shopping).map(([country, marketData]: [string, any]) => (
                <div key={country} className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Flag 
                      code={getCountryCode(country)} 
                      style={{ width: 20, height: 15 }}
                    />
                    <span className="font-semibold">{country}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Preço Médio:</strong> {marketData.preco_medio || 'N/A'}</div>
                    <div><strong>Faixa:</strong> {marketData.faixa_preco || 'N/A'}</div>
                    <div><strong>Fabricantes:</strong> {marketData.principais_fabricantes?.join(', ') || 'N/A'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Análise Qualitativa Expandida */}
        {scoreOportunidade.fatores_qualitativos && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={24} className="text-orange-600" />
              <h3 className="text-xl font-bold text-gray-900">Análise Qualitativa</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {scoreOportunidade.fatores_qualitativos.tendencia_midiatica && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-2">Tendência Midiática</h5>
                  <p className="text-blue-800 text-sm">{scoreOportunidade.fatores_qualitativos.tendencia_midiatica}</p>
                </div>
              )}
              {scoreOportunidade.fatores_qualitativos.receptividade_de_mercado && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-900 mb-2">Receptividade de Mercado</h5>
                  <p className="text-green-800 text-sm">{scoreOportunidade.fatores_qualitativos.receptividade_de_mercado}</p>
                </div>
              )}
            </div>
            
            {/* Riscos com Justificativa */}
            {(scoreOportunidade.fatores_qualitativos.riscos || analiseRiscos.regulatorio) && (
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h5 className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                  <AlertTriangle size={20} />
                  Riscos Identificados
                </h5>
                <div className="space-y-3">
                  {scoreOportunidade.fatores_qualitativos.riscos && (
                    <div>
                      <h6 className="font-medium text-red-800 mb-1">Análise de Riscos:</h6>
                      <p className="text-red-700 text-sm leading-relaxed">{scoreOportunidade.fatores_qualitativos.riscos}</p>
                    </div>
                  )}
                  {analiseRiscos.regulatorio && (
                    <div>
                      <h6 className="font-medium text-red-800 mb-1">Risco Regulatório:</h6>
                      <p className="text-red-700 text-sm leading-relaxed">{analiseRiscos.regulatorio}</p>
                    </div>
                  )}
                  {analiseRiscos.comercial && (
                    <div>
                      <h6 className="font-medium text-red-800 mb-1">Risco Comercial:</h6>
                      <p className="text-red-700 text-sm leading-relaxed">{analiseRiscos.comercial}</p>
                    </div>
                  )}
                  {analiseRiscos.tecnologico && (
                    <div>
                      <h6 className="font-medium text-red-800 mb-1">Risco Tecnológico:</h6>
                      <p className="text-red-700 text-sm leading-relaxed">{analiseRiscos.tecnologico}</p>
                    </div>
                  )}
                  {scoreOportunidade.fatores_qualitativos.justificativa && (
                    <div>
                      <h6 className="font-medium text-red-800 mb-1">Justificativa:</h6>
                      <p className="text-red-700 text-sm leading-relaxed">{scoreOportunidade.fatores_qualitativos.justificativa}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. Análise Competitiva com Gráfico */}
        {comparativoSimilares.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <PieChart size={24} className="text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Análise Competitiva</h3>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfico de Preços */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Comparativo de Preços</h4>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <PriceComparisonChart competitors={comparativoSimilares} />
                </div>
              </div>
              
              {/* Tabela Detalhada */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Detalhes dos Concorrentes</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 font-semibold text-gray-700">Produto</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-2 font-semibold text-gray-700">Registros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparativoSimilares.map((product, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">
                            <div>
                              <div className="font-medium text-gray-900">{product.nome_comercial || 'N/A'}</div>
                              <div className="text-xs text-gray-600">{product.fabricante || 'N/A'}</div>
                            </div>
                          </td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              (product.status_patente || product.patente?.status || '').includes('ativa') || 
                              (product.status_patente || product.patente?.status || '').includes('2026') || 
                              (product.status_patente || product.patente?.status || '').includes('2027')
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {product.status_patente || product.patente?.status || 'N/A'}
                            </span>
                          </td>
                          <td className="py-2">
                            <div className="flex gap-1">
                              {product.registro_fda && (
                                <span className="px-1 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">FDA</span>
                              )}
                              {product.registro_anvisa && (
                                <span className="px-1 py-0.5 bg-green-100 text-green-800 rounded text-xs">ANVISA</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Produto Proposto - EXPANDIDO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb size={24} className="text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-900">Produto Proposto</h3>
          </div>
          
          <div className="mb-6">
            <h4 className="text-2xl font-bold text-yellow-600 mb-4">{data.produto_proposto.nome_sugerido}</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="bg-white p-3 rounded border border-yellow-200">
                <span className="text-xs font-medium text-gray-600">Tipo</span>
                <div className="font-semibold text-gray-900">{data.produto_proposto.tipo}</div>
              </div>
              <div className="bg-white p-3 rounded border border-yellow-200">
                <span className="text-xs font-medium text-gray-600">Indústria</span>
                <div className="font-semibold text-gray-900">{data.produto_proposto.industria}</div>
              </div>
              <div className="bg-white p-3 rounded border border-yellow-200">
                <span className="text-xs font-medium text-gray-600">Setor</span>
                <div className="font-semibold text-gray-900">{data.produto_proposto.setor}</div>
              </div>
              <div className="bg-white p-3 rounded border border-yellow-200">
                <span className="text-xs font-medium text-gray-600">Categoria</span>
                <div className="font-semibold text-gray-900">{data.produto_proposto.categoria}</div>
              </div>
              <div className="bg-white p-3 rounded border border-yellow-200">
                <span className="text-xs font-medium text-gray-600">Molécula Base</span>
                <div className="font-semibold text-gray-900">{data.produto_proposto.molecula_base}</div>
              </div>
              <div className="bg-white p-3 rounded border border-yellow-200">
                <span className="text-xs font-medium text-gray-600">Doença Alvo</span>
                <div className="font-semibold text-gray-900">{data.produto_proposto.doenca_alvo}</div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded border border-yellow-200">
              <span className="text-sm font-medium text-gray-600">Benefício Principal</span>
              <p className="text-gray-900 mt-1">{data.produto_proposto.beneficio}</p>
            </div>
            
            <div className="bg-white p-4 rounded border border-yellow-200 mt-4">
              <span className="text-sm font-medium text-gray-600">Justificativa</span>
              <p className="text-gray-900 mt-1 leading-relaxed">{data.produto_proposto.justificativa}</p>
            </div>
          </div>

          {/* Go-to-Market Strategy Melhorada */}
          <div className="mb-8">
            <GoToMarketStrategy strategy={data.produto_proposto.go_to_market} />
          </div>

          {/* Timeline Melhorada */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-blue-600" />
              Linha do Tempo de Desenvolvimento
            </h4>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <EnhancedTimeline timeline={data.produto_proposto.linha_do_tempo} />
            </div>
          </div>

          {/* Projeções Financeiras Expandidas */}
          {/* Projeções Financeiras Expandidas */}
          {data.produto_proposto.comparativos && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preços Propostos */}
              {data.produto_proposto.comparativos.preco_proposto && (
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <DollarSign size={20} />
                    Preços Propostos
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(data.produto_proposto.comparativos.preco_proposto || {}).map(([country, price]) => (
                      <div key={country} className="flex items-center justify-between bg-white p-3 rounded border border-purple-200">
                        <div className="flex items-center gap-2">
                          <Flag 
                            code={getCountryCode(country)} 
                            style={{ width: 20, height: 15 }}
                          />
                          <span className="font-medium">{country}</span>
                        </div>
                        <span className="font-bold text-purple-600">{formatCurrency(price as string, country)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Share e Economia */}
              <div className="space-y-6">
                {/* Market Share */}
                {(data.produto_proposto.comparativos.market_share_estimado_ano_1 || 
                  data.produto_proposto.comparativos.market_share_estimado_ano_2) && (
                  <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
                    <h4 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                      <PieChart size={20} />
                      Projeção de Market Share
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {data.produto_proposto.comparativos.market_share_estimado_ano_1 && (
                        <div className="text-center p-4 bg-white rounded border border-indigo-200">
                          <div className="text-3xl font-bold text-indigo-600">
                            {data.produto_proposto.comparativos.market_share_estimado_ano_1}
                          </div>
                          <div className="text-sm text-indigo-700">Ano 1</div>
                        </div>
                      )}
                      {data.produto_proposto.comparativos.market_share_estimado_ano_2 && (
                        <div className="text-center p-4 bg-white rounded border border-indigo-200">
                          <div className="text-3xl font-bold text-indigo-600">
                            {data.produto_proposto.comparativos.market_share_estimado_ano_2}
                          </div>
                          <div className="text-sm text-indigo-700">Ano 2</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Economia Esperada */}
                {data.produto_proposto.comparativos.economia_esperada_por_paciente_ano && (
                  <ExpectedSavings savings={data.produto_proposto.comparativos.economia_esperada_por_paciente_ano} />
                )}
              </div>
            </div>
          )}

          {/* Análise de Riscos */}
          <div className="mt-8 bg-red-50 p-6 rounded-lg border border-red-200">
            <h4 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} />
              Análise de Riscos
            </h4>
            <p className="text-red-800 leading-relaxed">{data.produto_proposto.analise_de_riscos}</p>
          </div>
        </div>
        </div>

        {/* 6. Insights do Dashboard (Comentários Bolt) */}
        {data.produto_proposto.comentario_dashboard_bolt && (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <LineChart size={24} className="text-gray-300" />
              <h3 className="text-xl font-bold">Insights do Dashboard</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {data.score_oportunidade.valor}/10
                </div>
                <div className="text-gray-300 text-sm">Score de Oportunidade</div>
                <div className="text-xs text-gray-400 mt-1">{data.produto_proposto.comentario_dashboard_bolt.tipo_grafico_score}</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {data.comparativo_similares.length}
                </div>
                <div className="text-gray-300 text-sm">Concorrentes</div>
                <div className="text-xs text-gray-400 mt-1">{data.produto_proposto.comentario_dashboard_bolt.tipo_grafico_comparativo}</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {Object.keys(data.produto_proposto.linha_do_tempo).length}
                </div>
                <div className="text-gray-300 text-sm">Fases do Projeto</div>
                <div className="text-xs text-gray-400 mt-1">{data.produto_proposto.comentario_dashboard_bolt.tipo_grafico_timeline}</div>
              </div>
            </div>
            
            <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
              <h4 className="font-semibold text-gray-200 mb-2">Observações Técnicas:</h4>
              <p className="text-gray-300 italic leading-relaxed">
                {data.produto_proposto.comentario_dashboard_bolt.observacoes}
              </p>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-gray-300 italic">
                "Análise gerada em {new Date(data.consulta.data_consulta).toLocaleDateString('pt-BR')} para {data.consulta.cliente}"
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PatentDashboardReport;