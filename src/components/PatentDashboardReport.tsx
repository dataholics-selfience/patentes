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
  ExternalLink
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
    fatores_quantitativos: any;
    fatores_qualitativos: any;
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
    justificativa: string;
    analise_de_riscos: string;
    go_to_market: any;
    linha_do_tempo: any;
    comparativos: any;
    comentario_dashboard_bolt: any;
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

// Componente Gauge para Score de Oportunidade
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
          <span className="text-5xl font-bold text-gray-900">
            {animatedScore}
          </span>
          <span className="text-base text-gray-600">
            de 10
          </span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-gray-900">{getClassification(animatedScore)}</div>
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
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
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
                  <span className="text-blue-200">Países Alvo:</span>
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
              <OpportunityGauge score={data.score_oportunidade.valor} size="large" />
            </div>
          </div>
        </div>

        {/* 2. Análise da Consulta Atual */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={24} className="text-purple-600" />
            <h3 className="text-xl font-bold text-gray-900">Análise Detalhada da Oportunidade</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Justificativa */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Justificativa do Score</h4>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-gray-700 leading-relaxed">{data.score_oportunidade.justificativa_detalhada}</p>
              </div>
            </div>

            {/* Fatores Quantitativos */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Dados de Mercado</h4>
              {data.score_oportunidade.fatores_quantitativos?.volume_shopping && (
                <div className="space-y-4">
                  {Object.entries(data.score_oportunidade.fatores_quantitativos.volume_shopping).map(([country, data]: [string, any]) => (
                    <div key={country} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Flag 
                          code={getCountryCode(country)} 
                          style={{ width: 20, height: 15 }}
                        />
                        <span className="font-semibold">{country}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div><strong>Preço Médio:</strong> {data.preco_medio}</div>
                        <div><strong>Faixa:</strong> {data.faixa_preco}</div>
                        <div><strong>Fabricantes:</strong> {data.principais_fabricantes?.join(', ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fatores Qualitativos */}
          {data.score_oportunidade.fatores_qualitativos && (
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Análise Qualitativa</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-2">Tendência Midiática</h5>
                  <p className="text-blue-800 text-sm">{data.score_oportunidade.fatores_qualitativos.tendencia_midiatica}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h5 className="font-semibold text-green-900 mb-2">Receptividade de Mercado</h5>
                  <p className="text-green-800 text-sm">{data.score_oportunidade.fatores_qualitativos.receptividade_de_mercado}</p>
                </div>
              </div>
              
              {data.score_oportunidade.fatores_qualitativos.riscos && (
                <div className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h5 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Riscos Identificados
                  </h5>
                  <p className="text-orange-800 text-sm">{data.score_oportunidade.fatores_qualitativos.riscos}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Comparativo com Produtos Similares */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart size={24} className="text-green-600" />
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Registros</th>
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
                        product.status_patente.includes('Ativa') || product.status_patente.includes('2026') || product.status_patente.includes('2027')
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.status_patente}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-600">{product.preco_medio}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {product.registro_fda && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">FDA</span>
                        )}
                        {product.registro_anvisa && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">ANVISA</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Produto Proposto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lightbulb size={24} className="text-yellow-600" />
            <h3 className="text-xl font-bold text-gray-900">Produto Proposto</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Proposta Técnica */}
            <div className="space-y-6">
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  <Award size={20} />
                  {data.produto_proposto.nome_sugerido}
                </h4>
                <div className="space-y-3 text-sm">
                  <div><strong>Tipo:</strong> {data.produto_proposto.tipo}</div>
                  <div><strong>Justificativa:</strong></div>
                  <p className="text-yellow-800 leading-relaxed">{data.produto_proposto.justificativa}</p>
                </div>
              </div>

              {/* Go-to-Market */}
              {data.produto_proposto.go_to_market && (
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Zap size={20} />
                    Estratégia Go-to-Market
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div><strong>Modelo:</strong> {data.produto_proposto.go_to_market.modelo}</div>
                    <div><strong>Canais:</strong> {data.produto_proposto.go_to_market.canais?.join(', ')}</div>
                    <div><strong>Parcerias:</strong> {data.produto_proposto.go_to_market.parcerias?.join(', ')}</div>
                    <div><strong>Posicionamento:</strong> {data.produto_proposto.go_to_market.posicionamento}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline e Comparativos */}
            <div className="space-y-6">
              {/* Timeline */}
              {data.produto_proposto.linha_do_tempo && (
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                    <Clock size={20} />
                    Linha do Tempo
                  </h4>
                  <Timeline timeline={data.produto_proposto.linha_do_tempo} />
                </div>
              )}

              {/* Comparativos Financeiros */}
              {data.produto_proposto.comparativos && (
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <h4 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                    <DollarSign size={20} />
                    Projeções Financeiras
                  </h4>
                  <div className="space-y-3 text-sm">
                    {data.produto_proposto.comparativos.preco_proposto && (
                      <div>
                        <strong>Preço Proposto:</strong>
                        <div className="mt-1 space-y-1">
                          {Object.entries(data.produto_proposto.comparativos.preco_proposto).map(([country, price]) => (
                            <div key={country} className="flex items-center gap-2">
                              <Flag 
                                code={getCountryCode(country)} 
                                style={{ width: 16, height: 12 }}
                              />
                              <span>{country}: {formatCurrency(price as string, country)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {data.produto_proposto.comparativos.market_share_estimado_ano_1 && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-2xl font-bold text-purple-600">
                            {data.produto_proposto.comparativos.market_share_estimado_ano_1}
                          </div>
                          <div className="text-xs text-gray-600">Market Share Ano 1</div>
                        </div>
                        <div className="text-center p-3 bg-white rounded border">
                          <div className="text-2xl font-bold text-purple-600">
                            {data.produto_proposto.comparativos.market_share_estimado_ano_2}
                          </div>
                          <div className="text-xs text-gray-600">Market Share Ano 2</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Análise de Riscos */}
          <div className="mt-8 bg-red-50 p-6 rounded-lg border border-red-200">
            <h4 className="text-lg font-semibold text-red-900 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} />
              Análise de Riscos
            </h4>
            <p className="text-red-800 leading-relaxed">{data.produto_proposto.analise_de_riscos}</p>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <FileText size={24} className="text-gray-300" />
            <h3 className="text-xl font-bold">Resumo Executivo</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {data.score_oportunidade.valor}/10
              </div>
              <div className="text-gray-300 text-sm">Score de Oportunidade</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {data.comparativo_similares.length}
              </div>
              <div className="text-gray-300 text-sm">Concorrentes Analisados</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {data.consulta.pais_alvo.length}
              </div>
              <div className="text-gray-300 text-sm">Mercados Alvo</div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-gray-300 italic">
              "Análise gerada em {new Date(data.consulta.data_consulta).toLocaleDateString('pt-BR')} para {data.consulta.cliente}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatentDashboardReport;