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
  Target
} from 'lucide-react';
import { PatentResultType } from '../types';
import jsPDF from 'jspdf';
import Flag from 'react-world-flags';
import { useTranslation } from '../utils/translations';

interface PatentResultsPageProps {
  result: PatentResultType;
  searchTerm: string;
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

const PatentResultsPage = ({ result, searchTerm, onBack }: PatentResultsPageProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { t } = useTranslation();

  // Parse do JSON result
  const data = typeof result === 'string' ? JSON.parse(result) : result;
  
  const produto = data.substancia || searchTerm;
  const nomeComercial = data.nome_comercial || '';
  const patentes = data.patentes || [];
  const primeiraPatente = patentes[0]; // Patente principal
  const quimica = data.quimica || {};
  const ensaiosClinicosData = data.ensaios_clinicos || {};
  const orangeBook = data.orange_book || {};
  const registroRegulatorio = data.registro_regulatorio || {};
  const regulacaoPorPais = data.regulacao_por_pais || [];
  const evidenciaCientifica = data.evidencia_cientifica_recente || [];
  const estrategiasFormulacao = data.estrategias_de_formulacao || {};
  const dadosMercado = data.dados_de_mercado || {};
  const scoreOportunidade = data.score_de_oportunidade || {};

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
      pdf.text('RELATÓRIO DE ANÁLISE DE PATENTE FARMACÊUTICA', margin, yPosition);
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
      
      const fileName = `relatorio-patente-${produto.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
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
                <span>{t('back')}</span>
              </button>
              
              <div className="flex items-center gap-3">
                <img 
                  src="/logo_pharmyrus.png" 
                  alt="Pharmyrus" 
                  className="h-12 w-auto"
                />
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
                  <span>{t('exportPdf')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Card de Análise Completa no Topo */}
          {primeiraPatente && (
            <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Informações da Patente Principal */}
                <div className="space-y-6">
                  <div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-blue-200 text-lg">Nome da Molécula:</span>
                        <h2 className="text-4xl text-white">{produto || t('notInformed')}</h2>
                      </div>
                      {nomeComercial && (
                        <div>
                          <span className="text-blue-200 text-lg">{t('commercialName')}:</span>
                          <p className="text-2xl text-blue-100">{nomeComercial}</p>
                        </div>
                      )}
                    </div>
                    {quimica.molecular_formula && (
                      <p className="text-blue-200 text-xl font-mono">{quimica.molecular_formula}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    {/* Status da Patente */}
                    <div className="flex items-center gap-3 p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2">
                        {primeiraPatente.patente_vigente ? (
                          <CheckCircle size={20} className="text-white" />
                        ) : (
                          <XCircle size={20} className="text-white" />
                        )}
                        <span className="text-white">{t('patentStatus')}:</span>
                        <span className={`${primeiraPatente.patente_vigente ? 'text-green-300' : 'text-red-300'}`}>
                          {primeiraPatente.patente_vigente ? t('active') : t('expired')}
                        </span>
                      </div>
                      {primeiraPatente.numero_patente && (
                        <span className="text-blue-200 text-sm font-mono ml-auto">{primeiraPatente.numero_patente}</span>
                      )}
                    </div>

                    {/* Expiração Principal */}
                    <div className="flex items-center gap-3 p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-white" />
                        <span className="text-white">{t('primaryExpiration')}:</span>
                        <span className="text-orange-300">{primeiraPatente.data_expiracao_patente_principal}</span>
                      </div>
                      {primeiraPatente.data_expiracao_patente_secundaria && primeiraPatente.data_expiracao_patente_secundaria !== 'Não informado' && (
                        <span className="text-blue-200 text-sm ml-auto">Sec: {primeiraPatente.data_expiracao_patente_secundaria}</span>
                      )}
                    </div>

                    {/* Exploração Comercial */}
                    <div className="flex items-center gap-3 p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2">
                        <Globe size={20} className="text-white" />
                        <span className="text-white">{t('commercialExploration')}:</span>
                        <span className={`${primeiraPatente.exploracao_comercial ? 'text-green-300' : 'text-red-300'}`}>
                          {primeiraPatente.exploracao_comercial ? t('permitted') : t('restricted')}
                        </span>
                      </div>
                    </div>

                    {/* Data Vencimento Novo Produto */}
                    <div className="flex items-center gap-3 p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2">
                        <Target size={20} className="text-white" />
                        <span className="text-white">{t('availableForNewProduct')}:</span>
                        <span className="text-yellow-300">{primeiraPatente.data_vencimento_para_novo_produto}</span>
                      </div>
                    </div>

                    {/* Tipo de Proteção Detalhado */}
                    {primeiraPatente.tipo_protecao_detalhado && (
                      <div className="grid grid-cols-2 gap-3">
                          {primeiraPatente.tipo_protecao_detalhado.primaria && primeiraPatente.tipo_protecao_detalhado.primaria.length > 0 && (
                            <div className="p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                              <span className="text-white block mb-2">{t('primaryProtection')}</span>
                              <div className="flex flex-wrap gap-1">
                                {primeiraPatente.tipo_protecao_detalhado.primaria.map((tipo, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-green-600 text-white rounded text-sm">
                                    {tipo}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {primeiraPatente.tipo_protecao_detalhado.secundaria && primeiraPatente.tipo_protecao_detalhado.secundaria.length > 0 && (
                            <div className="p-3 bg-blue-800/50 rounded-lg border border-blue-600/50">
                              <span className="text-white block mb-2">{t('secondaryProtection')}</span>
                              <div className="flex flex-wrap gap-1">
                                {primeiraPatente.tipo_protecao_detalhado.secundaria.map((tipo, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-yellow-600 text-white rounded text-sm">
                                    {tipo}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Lado Direito */}
                <div className="space-y-6">
                  {/* Score de Oportunidade */}
                  {scoreOportunidade.valor && (
                    <div className="flex flex-col items-center justify-start">
                      <div className="text-center mb-6">
                        <h3 className="text-lg text-white mb-2">{t('opportunityScore')}</h3>
                      </div>
                      
                      <OpportunityGauge 
                        score={scoreOportunidade.valor} 
                        classification={scoreOportunidade.classificacao} 
                        size="large"
                      />
                      
                      <div className="mt-4 text-center">
                        <div className="text-2xl font-bold text-white">{scoreOportunidade.classificacao}</div>
                      </div>
                      
                      {/* Justificativa do Score */}
                      {scoreOportunidade.justificativa && (
                        <div className="mt-6 text-center max-w-md">
                          <p className="text-blue-200 italic leading-relaxed text-sm">
                            {scoreOportunidade.justificativa}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Objeto de Proteção */}
                  {primeiraPatente.objeto_protecao && (
                    <div className="p-4 bg-blue-800/50 rounded-lg border border-blue-600/50">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield size={20} className="text-white" />
                        <span className="text-white">{t('protectionObject')}</span>
                      </div>
                      <p className="text-blue-100 leading-relaxed">{primeiraPatente.objeto_protecao}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dados da Patente por País */}
          {primeiraPatente && primeiraPatente.patentes_por_pais && primeiraPatente.patentes_por_pais.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Globe size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('patentsByCountry')}</h3>
                  <p className="text-gray-600">{t('statusAndExpirationDates')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {primeiraPatente.patentes_por_pais.map((country, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <Flag 
                        code={getCountryCode(country.pais)} 
                        style={{ width: 24, height: 18 }}
                      />
                      <span className="font-medium text-gray-900">{country.pais}</span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {country.numero && (
                        <div>
                          <strong>{t('number')}:</strong> 
                          <span className="font-mono ml-1">{country.numero}</span>
                        </div>
                      )}
                      
                      <div>
                        <strong>{t('status')}:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded text-xs ${
                          country.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {country.status}
                        </span>
                      </div>
                      
                      <div>
                        <strong>{t('expiration')}:</strong> 
                        <span className="ml-1 font-medium">{country.data_expiracao}</span>
                      </div>
                      
                      {country.tipo && country.tipo.length > 0 && (
                        <div>
                          <strong>{t('types')}:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {country.tipo.map((tipo, i) => (
                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                {tipo}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {country.fonte && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <span className="text-xs text-gray-500">{t('source')}: {country.fonte}</span>
                        </div>
                      )}
                      
                      {country.link && (
                        <div className="mt-2">
                          <a 
                            href={country.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                          >
                            {t('viewPatent')}
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dados Químicos */}
          {quimica.molecular_formula && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Beaker size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('chemicalData')}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">{t('molecularFormula')}</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{quimica.molecular_formula}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">{t('molecularWeight')}</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{quimica.molecular_weight} g/mol</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">{t('inchiKey')}</span>
                  <p className="text-sm font-mono text-gray-900 mt-1 break-all">{quimica.inchi_key}</p>
                </div>

                {quimica.iupac_name && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100 md:col-span-2 lg:col-span-3">
                    <span className="text-sm font-medium text-gray-600">{t('iupacName')}</span>
                    <p className="text-sm text-gray-900 mt-1 break-words">{quimica.iupac_name}</p>
                  </div>
                )}

                {quimica.smiles && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100 md:col-span-2 lg:col-span-3">
                    <span className="text-sm font-medium text-gray-600">{t('smiles')}</span>
                    <p className="text-sm font-mono text-gray-900 mt-1 break-all">{quimica.smiles}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ensaios Clínicos */}
          {ensaiosClinicosData.estudos && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <TestTube size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('clinicalTrials')}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">{t('activeStudies')}</span>
                  <p className="text-2xl font-bold text-green-600 mt-1">{ensaiosClinicosData.ativos}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">{t('advancedPhase')}</span>
                  <p className={`text-lg font-bold mt-1 ${ensaiosClinicosData.fase_avancada ? 'text-green-600' : 'text-red-600'}`}>
                    {ensaiosClinicosData.fase_avancada ? t('yes') : t('no')}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">{t('studiesInBrazil')}</span>
                  <p className={`text-lg font-bold mt-1 ${ensaiosClinicosData.tem_no_brasil ? 'text-green-600' : 'text-red-600'}`}>
                    {ensaiosClinicosData.tem_no_brasil ? t('yes') : t('no')}
                  </p>
                </div>
              </div>

              {ensaiosClinicosData.principais_indicacoes_estudadas && (
                <div className="mb-6">
                  <span className="text-sm font-medium text-gray-600 mb-2 block">{t('mainIndications')}</span>
                  <div className="flex flex-wrap gap-2">
                    {ensaiosClinicosData.principais_indicacoes_estudadas.map((indicacao, i) => (
                      <span key={i} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {indicacao}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">{t('detailedStudies')}</h4>
                {ensaiosClinicosData.estudos.map((estudo, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-bold text-lg text-gray-900 mb-2">{estudo.titulo}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Award size={16} className="text-green-600" />
                            <span><strong>{t('phase')}:</strong> {estudo.fase}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Flag 
                              code={getCountryCode(estudo.pais)} 
                              style={{ width: 16, height: 12 }}
                            />
                            <span><strong>{t('country')}:</strong> {estudo.pais}</span>
                          </div>
                        </div>
                      </div>
                      {estudo.link && (
                        <a 
                          href={estudo.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-4 text-green-600 hover:text-green-800"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orange Book */}
          {orangeBook.nda_number && (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{t('orangeBook')}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-600">{t('ndaNumber')}</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{orangeBook.nda_number}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-600">{t('approvalDate')}</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{orangeBook.data_aprovacao}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-600">{t('exclusivityExpiration')}</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{orangeBook.data_expiracao_exclusividade}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-600">{t('hasGeneric')}</span>
                  <p className={`text-lg font-bold mt-1 ${orangeBook.tem_generico ? 'text-green-600' : 'text-red-600'}`}>
                    {orangeBook.tem_generico ? t('yes') : t('no')}
                  </p>
                </div>

                {orangeBook.exclusividades && orangeBook.exclusividades.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-orange-100 md:col-span-2">
                    <span className="text-sm font-medium text-gray-600 mb-2 block">{t('exclusivities')}</span>
                    <div className="flex flex-wrap gap-2">
                      {orangeBook.exclusividades.map((exclusividade, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                          {exclusividade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Regulação por País */}
          {regulacaoPorPais.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 size={24} className="text-red-600" />
                <h3 className="text-xl font-bold text-gray-900">{t('regulationByCountry')}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regulacaoPorPais.map((regulacao, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Flag 
                        code={getCountryCode(regulacao.pais)} 
                        style={{ width: 32, height: 24 }}
                      />
                      <div>
                        <h4 className="font-bold text-lg">{regulacao.pais}</h4>
                        <p className="text-sm text-gray-600">{regulacao.agencia}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">{t('classification')}</span>
                        <div className="mt-1">
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            {regulacao.classificacao}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">{t('genericRegistrationEase')}</span>
                        <div className="mt-1">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            regulacao.facilidade_registro_generico === 'Alta' ? 'bg-green-100 text-green-800' :
                            regulacao.facilidade_registro_generico === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {regulacao.facilidade_registro_generico}
                          </span>
                        </div>
                      </div>

                      {regulacao.numero_registro && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">{t('registrationNumber')}</span>
                          <div className="mt-1">
                            <span className="font-mono text-sm">{regulacao.numero_registro}</span>
                          </div>
                        </div>
                      )}

                      {regulacao.restricoes && regulacao.restricoes.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">{t('restrictions')}</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {regulacao.restricoes.map((restricao, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                {restricao}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {regulacao.fonte && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <span className="text-xs text-gray-500">{t('source')}: {regulacao.fonte}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidência Científica */}
          {evidenciaCientifica.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen size={24} className="text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">{t('scientificEvidence')}</h3>
              </div>
              
              <div className="space-y-4">
                {evidenciaCientifica.map((evidencia, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{evidencia.titulo}</h4>
                        <div className="text-sm text-gray-600 mb-2">
                          <span>{evidencia.autores.join(', ')} ({evidencia.ano})</span>
                        </div>
                        <p className="text-gray-700 mb-3">{evidencia.resumo}</p>
                        {evidencia.doi && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">{t('doi')}:</span>
                            <a 
                              href={`https://doi.org/${evidencia.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              {evidencia.doi}
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        )}
                      </div>
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

export default PatentResultsPage;