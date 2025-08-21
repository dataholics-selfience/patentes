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
  AlertTriangle,
  FileText,
  Shield,
  Microscope,
  Beaker,
  BookOpen,
  ExternalLink
} from 'lucide-react';
import jsPDF from 'jspdf';

interface DrugPipelineReportProps {
  data: any;
  onBack: () => void;
}

// Componente Gauge para Innovation Score
const InnovationGauge = ({ 
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
          <div className="text-sm text-gray-600">Score de Inovação</div>
        </div>
      )}
    </div>
  );
};

const DrugPipelineReport = ({ data, onBack }: DrugPipelineReportProps) => {
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
      pdf.text('PHARMYRUS - PIPELINE COMPLETO DE MEDICAMENTO', margin, yPosition);
      yPosition += 15;
      
      // Medicamento proposto
      if (data.proposed_drug?.name) {
        pdf.setFontSize(14);
        pdf.text(`Medicamento: ${data.proposed_drug.name}`, margin, yPosition);
        yPosition += 10;
      }
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 15;
      
      // Score
      if (data.innovation_score?.overall_score) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Score de Inovação: ${data.innovation_score.overall_score}/100 (${data.innovation_score.classification})`, margin, yPosition);
        yPosition += 10;
      }
      
      const fileName = `pharmyrus-pipeline-${data.proposed_drug?.name?.replace(/\s+/g, '-').toLowerCase() || 'medicamento'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`;
    } else if (num >= 1000000) {
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
                <img 
                  src="/logo-pharmyrus.jpg" 
                  alt="Pharmyrus" 
                  className="h-8 w-auto"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Pipeline Completo de Medicamento</h1>
                  <p className="text-gray-600">Análise estratégica e desenvolvimento farmacêutico</p>
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
                  <span>Exportar Pipeline</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Principal com Score de Inovação */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Informações do Medicamento Proposto */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    {data.proposed_drug?.name || 'Medicamento Inovador'}
                  </h2>
                  <p className="text-blue-200 text-xl">
                    {data.proposed_drug?.therapeutic_class || 'Classe terapêutica'}
                  </p>
                  <p className="text-blue-300 text-lg">
                    {data.proposed_drug?.chemical_name || 'Nome químico'}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={20} className="text-white" />
                      <span className="text-white font-medium">Indicação Principal</span>
                    </div>
                    <p className="text-blue-100 leading-relaxed">
                      {data.proposed_drug?.indication || 'Indicação não especificada'}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap size={20} className="text-white" />
                      <span className="text-white font-medium">Mecanismo de Ação</span>
                    </div>
                    <p className="text-blue-100 leading-relaxed">
                      {data.proposed_drug?.mechanism_of_action || 'Mecanismo não especificado'}
                    </p>
                  </div>

                  {data.proposed_drug?.competitive_advantages && (
                    <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Award size={20} className="text-white" />
                        <span className="text-white font-medium">Vantagens Competitivas</span>
                      </div>
                      <ul className="text-blue-100 space-y-1">
                        {data.proposed_drug.competitive_advantages.map((advantage: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle size={14} className="text-green-300 mt-0.5 flex-shrink-0" />
                            {advantage}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Score de Inovação */}
              <div className="flex flex-col items-center justify-center">
                {data.innovation_score?.overall_score && (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-lg text-white mb-2">Score de Inovação</h3>
                    </div>
                    
                    <InnovationGauge 
                      score={data.innovation_score.overall_score} 
                      classification={data.innovation_score.classification} 
                      size="large"
                    />
                    
                    <div className="mt-4 text-center">
                      <div className="text-2xl font-bold text-white">{data.innovation_score.classification}</div>
                    </div>
                    
                    {/* Fatores de Inovação */}
                    {data.innovation_score.innovation_factors && (
                      <div className="mt-6 w-full max-w-md">
                        <h4 className="text-white font-medium mb-3 text-center">Fatores de Inovação</h4>
                        <div className="space-y-2">
                          {data.innovation_score.innovation_factors.map((factor: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-blue-200">{factor.factor}</span>
                              <span className="text-white font-bold">{factor.score}/10</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Análise de Patentes */}
          {data.patent_landscape && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Análise de Patentes</h3>
                  <p className="text-gray-600">Landscape de propriedade intelectual</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Freedom to Operate */}
                {data.patent_landscape.freedom_to_operate && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-600" />
                      Liberdade para Operar
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">Risco Geral:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          data.patent_landscape.freedom_to_operate.overall_risk === 'low' ? 'bg-green-100 text-green-800' :
                          data.patent_landscape.freedom_to_operate.overall_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {data.patent_landscape.freedom_to_operate.overall_risk === 'low' ? 'Baixo' :
                           data.patent_landscape.freedom_to_operate.overall_risk === 'medium' ? 'Médio' : 'Alto'}
                        </span>
                      </div>
                      
                      {data.patent_landscape.freedom_to_operate.workaround_strategies && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Estratégias de Contorno:</span>
                          <ul className="mt-2 space-y-1">
                            {data.patent_landscape.freedom_to_operate.workaround_strategies.map((strategy: string, index: number) => (
                              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                                <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                                {strategy}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Estratégia de Patentes */}
                {data.patent_landscape.patent_strategy && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <FileText size={20} className="text-blue-600" />
                      Estratégia de Patentes
                    </h4>
                    
                    {data.patent_landscape.patent_strategy.filing_recommendations && (
                      <div>
                        <span className="text-sm font-medium text-gray-600">Recomendações de Depósito:</span>
                        <div className="mt-2 space-y-2">
                          {data.patent_landscape.patent_strategy.filing_recommendations.map((filing: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-3">
                              <div className="font-medium text-gray-900">{filing.title}</div>
                              <div className="text-sm text-gray-600">Tipo: {filing.type}</div>
                              <div className="text-sm text-gray-600">Custo estimado: {formatCurrency(filing.estimated_cost)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Análise de Mercado */}
          {data.market_analysis && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <BarChart3 size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Análise de Mercado</h3>
                  <p className="text-gray-600">TAM SAM SOM e análise competitiva</p>
                </div>
              </div>
              
              {/* TAM SAM SOM */}
              {data.market_analysis.market_size && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={20} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">TAM</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(data.market_analysis.market_size.tam)}
                    </p>
                    <p className="text-xs text-blue-700">Total Addressable Market</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={20} className="text-green-600" />
                      <span className="text-sm font-medium text-green-800">SAM</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(data.market_analysis.market_size.sam)}
                    </p>
                    <p className="text-xs text-green-700">Serviceable Available Market</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={20} className="text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">SOM</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-900">
                      {formatCurrency(data.market_analysis.market_size.som)}
                    </p>
                    <p className="text-xs text-purple-700">Serviceable Obtainable Market</p>
                  </div>
                </div>
              )}

              {/* SWOT Analysis */}
              {data.market_analysis.swot_analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                        <CheckCircle size={16} />
                        Forças (Strengths)
                      </h4>
                      <ul className="space-y-1">
                        {data.market_analysis.swot_analysis.strengths?.map((strength: string, idx: number) => (
                          <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                            <span className="text-green-600">•</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <TrendingUp size={16} />
                        Oportunidades (Opportunities)
                      </h4>
                      <ul className="space-y-1">
                        {data.market_analysis.swot_analysis.opportunities?.map((opportunity: string, idx: number) => (
                          <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <h4 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Fraquezas (Weaknesses)
                      </h4>
                      <ul className="space-y-1">
                        {data.market_analysis.swot_analysis.weaknesses?.map((weakness: string, idx: number) => (
                          <li key={idx} className="text-sm text-yellow-800 flex items-start gap-2">
                            <span className="text-yellow-600">•</span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                        <AlertTriangle size={16} />
                        Ameaças (Threats)
                      </h4>
                      <ul className="space-y-1">
                        {data.market_analysis.swot_analysis.threats?.map((threat: string, idx: number) => (
                          <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                            <span className="text-red-600">•</span>
                            {threat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Análise de Preços */}
          {data.market_analysis?.pricing_analysis && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                  <DollarSign size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Análise de Preços</h3>
                  <p className="text-gray-600">Estratégia de precificação e reembolso</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.market_analysis.pricing_analysis.recommended_price && (
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign size={20} className="text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-800">Preço Recomendado</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-900">
                      {formatCurrency(data.market_analysis.pricing_analysis.recommended_price.amount)}
                    </p>
                    <p className="text-xs text-emerald-700 mt-1">
                      {data.market_analysis.pricing_analysis.recommended_price.rationale}
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 size={20} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Sensibilidade ao Preço</span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {data.market_analysis.pricing_analysis.price_sensitivity === 'low' ? 'Baixa' :
                     data.market_analysis.pricing_analysis.price_sensitivity === 'medium' ? 'Média' : 'Alta'}
                  </p>
                </div>

                {data.market_analysis.pricing_analysis.reimbursement_potential && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 size={20} className="text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Reembolso</span>
                    </div>
                    <div className="space-y-1">
                      {data.market_analysis.pricing_analysis.reimbursement_potential.public_systems?.length > 0 && (
                        <div className="text-xs text-purple-700">
                          Sistemas públicos: {data.market_analysis.pricing_analysis.reimbursement_potential.public_systems.length}
                        </div>
                      )}
                      {data.market_analysis.pricing_analysis.reimbursement_potential.private_insurance?.length > 0 && (
                        <div className="text-xs text-purple-700">
                          Seguros privados: {data.market_analysis.pricing_analysis.reimbursement_potential.private_insurance.length}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Projeções de Receita */}
              {data.market_analysis.pricing_analysis.revenue_projections && (
                <div className="mt-6">
                  <h4 className="font-bold text-lg text-gray-900 mb-4">Projeções de Receita</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.market_analysis.pricing_analysis.revenue_projections.slice(0, 3).map((projection: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">Ano {projection.year}</div>
                          <div className="text-2xl font-bold text-green-600">{formatCurrency(projection.revenue)}</div>
                          <div className="text-sm text-gray-600">{formatNumber(projection.units_sold)} unidades</div>
                          <div className="text-xs text-gray-500">{projection.market_penetration}% penetração</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Estratégia Regulatória */}
          {data.regulatory_strategy && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <Building2 size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Estratégia Regulatória</h3>
                  <p className="text-gray-600">Aprovação em agências internacionais</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Caminhos Regulatórios */}
                {data.regulatory_strategy.regulatory_pathway && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin size={20} className="text-orange-600" />
                      Caminhos Regulatórios
                    </h4>
                    <div className="space-y-3">
                      {data.regulatory_strategy.regulatory_pathway.map((pathway: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Building2 size={16} className="text-orange-600" />
                            <span className="font-medium text-gray-900">{pathway.country} - {pathway.agency}</span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Tipo: {pathway.pathway_type}</div>
                            <div>Timeline: {pathway.timeline}</div>
                            <div>Probabilidade: {pathway.success_probability}%</div>
                            <div>Taxas: {formatCurrency(pathway.fees)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estudos Necessários */}
                {data.regulatory_strategy.required_studies && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <TestTube size={20} className="text-green-600" />
                      Estudos Necessários
                    </h4>
                    <div className="space-y-3">
                      {data.regulatory_strategy.required_studies.map((study: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="font-medium text-gray-900 mb-1">{study.study_type}</div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Fase: {study.phase}</div>
                            <div>Duração: {study.duration}</div>
                            <div>Pacientes: {study.patient_count}</div>
                            <div>Custo: {formatCurrency(study.estimated_cost)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Custos Regulatórios */}
              {data.regulatory_strategy.regulatory_costs && (
                <div className="mt-6 bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-3">Custos Regulatórios Estimados</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-900">
                        {formatCurrency(data.regulatory_strategy.regulatory_costs.preclinical_studies)}
                      </div>
                      <div className="text-orange-700">Pré-clínicos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-900">
                        {formatCurrency(data.regulatory_strategy.regulatory_costs.clinical_trials)}
                      </div>
                      <div className="text-orange-700">Ensaios Clínicos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-900">
                        {formatCurrency(data.regulatory_strategy.regulatory_costs.regulatory_fees)}
                      </div>
                      <div className="text-orange-700">Taxas Regulatórias</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-900">
                        {formatCurrency(data.regulatory_strategy.regulatory_costs.total_estimated)}
                      </div>
                      <div className="text-orange-700">Total Estimado</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline de Desenvolvimento */}
          {data.development_timeline && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Calendar size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Timeline de Desenvolvimento</h3>
                  <p className="text-gray-600">Fases e marcos do projeto</p>
                </div>
              </div>
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-purple-500 before:to-pink-500">
                {data.development_timeline.map((phase: any, index: number) => (
                  <div key={index} className="relative flex items-start gap-6 group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-600 bg-white text-blue-600 font-bold z-10">
                      {index + 1}
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{phase.phase}</h4>
                        <span className="text-sm text-blue-600 font-medium">{phase.duration}</span>
                      </div>
                      <p className="text-gray-600 mb-3">{phase.activities?.join(', ')}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Custo estimado:</span>
                          <div className="text-green-600 font-bold">{formatCurrency(phase.estimated_cost)}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Probabilidade de sucesso:</span>
                          <div className="text-blue-600 font-bold">{phase.success_probability}%</div>
                        </div>
                      </div>
                      {phase.key_milestones && (
                        <div className="mt-3">
                          <span className="text-xs font-medium text-gray-600">Marcos principais:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {phase.key_milestones.map((milestone: string, idx: number) => (
                              <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {milestone}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projeções Financeiras */}
          {data.financial_projections && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Projeções Financeiras</h3>
                  <p className="text-gray-600">ROI e análise de viabilidade</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Custos de Desenvolvimento */}
                {data.financial_projections.development_costs && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4">Custos de Desenvolvimento</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">P&D:</span>
                        <span className="font-medium">{formatCurrency(data.financial_projections.development_costs.research_and_development)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Ensaios Clínicos:</span>
                        <span className="font-medium">{formatCurrency(data.financial_projections.development_costs.clinical_trials)}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">Aprovação Regulatória:</span>
                        <span className="font-medium">{formatCurrency(data.financial_projections.development_costs.regulatory_approval)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-t-2 border-blue-500">
                        <span className="font-bold text-blue-900">Investimento Total:</span>
                        <span className="text-xl font-bold text-blue-900">{formatCurrency(data.financial_projections.development_costs.total_investment)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Análise de ROI */}
                {data.financial_projections.roi_analysis && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4">Análise de ROI</h4>
                    <div className="space-y-3">
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-900">{data.financial_projections.roi_analysis.npv > 0 ? '+' : ''}{formatCurrency(data.financial_projections.roi_analysis.npv)}</div>
                          <div className="text-sm text-green-700">NPV (Valor Presente Líquido)</div>
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-900">{data.financial_projections.roi_analysis.irr}%</div>
                          <div className="text-sm text-blue-700">IRR (Taxa Interna de Retorno)</div>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-900">{data.financial_projections.roi_analysis.payback_period} anos</div>
                          <div className="text-sm text-purple-700">Payback Period</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Avaliação de Riscos */}
          {data.risk_assessment && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Avaliação de Riscos</h3>
                  <p className="text-gray-600">Identificação e mitigação de riscos</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Riscos Técnicos */}
                {data.risk_assessment.technical_risks && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <TestTube size={20} className="text-blue-600" />
                      Riscos Técnicos
                    </h4>
                    <div className="space-y-3">
                      {data.risk_assessment.technical_risks.map((risk: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="font-medium text-gray-900 mb-1">{risk.risk_factor}</div>
                          <div className="text-sm text-gray-600 mb-2">{risk.description}</div>
                          <div className="flex justify-between text-xs">
                            <span>Probabilidade: {risk.probability}%</span>
                            <span className={`font-medium ${
                              risk.risk_score >= 7 ? 'text-red-600' :
                              risk.risk_score >= 4 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              Score: {risk.risk_score}/10
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Riscos Comerciais */}
                {data.risk_assessment.commercial_risks && (
                  <div>
                    <h4 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                      <DollarSign size={20} className="text-green-600" />
                      Riscos Comerciais
                    </h4>
                    <div className="space-y-3">
                      {data.risk_assessment.commercial_risks.map((risk: any, index: number) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="font-medium text-gray-900 mb-1">{risk.risk_factor}</div>
                          <div className="text-sm text-gray-600 mb-2">{risk.description}</div>
                          <div className="flex justify-between text-xs">
                            <span>Probabilidade: {risk.probability}%</span>
                            <span className={`font-medium ${
                              risk.risk_score >= 7 ? 'text-red-600' :
                              risk.risk_score >= 4 ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              Score: {risk.risk_score}/10
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Score Geral de Risco */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Score Geral de Risco:</span>
                  <span className={`text-2xl font-bold ${
                    data.risk_assessment.overall_risk_score >= 7 ? 'text-red-600' :
                    data.risk_assessment.overall_risk_score >= 4 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {data.risk_assessment.overall_risk_score}/10
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Dados Químicos do Medicamento Proposto */}
          {data.proposed_drug?.chemical_structure && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Beaker size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Estrutura Química</h3>
                  <p className="text-gray-600">Propriedades moleculares do medicamento proposto</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Fórmula Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{data.proposed_drug.molecular_formula}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Peso Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{data.proposed_drug.chemical_structure.molecular_weight} g/mol</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">LogP</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{data.proposed_drug.chemical_structure.logp}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Doadores H</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{data.proposed_drug.chemical_structure.hbd}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Aceptores H</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{data.proposed_drug.chemical_structure.hba}</p>
                </div>

                {data.proposed_drug.chemical_structure.smiles && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 md:col-span-2 lg:col-span-3">
                    <span className="text-sm font-medium text-gray-600">SMILES</span>
                    <p className="text-sm font-mono text-gray-900 mt-1 break-all">{data.proposed_drug.chemical_structure.smiles}</p>
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

export default DrugPipelineReport;