import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download,
  FlaskConical,
  Shield,
  Globe,
  Building2,
  Beaker,
  TestTube,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Microscope,
  BookOpen,
  TrendingUp,
  Award,
  ExternalLink,
} from 'lucide-react';
import { PatentResultType } from '../types';
import Flag from 'react-world-flags';
import jsPDF from 'jspdf';

interface PatentResultsPageProps {
  result: PatentResultType;
  searchTerm: string;
  onBack: () => void;
}

const countryCodeMap: { [key: string]: string } = {
  'Brasil': 'BR', 'Brazil': 'BR', 'Estados Unidos': 'US', 'United States': 'US', 'USA': 'US', 'US': 'US',
  'Alemanha': 'DE', 'Germany': 'DE', 'França': 'FR', 'France': 'FR', 'Reino Unido': 'GB', 'United Kingdom': 'GB', 'UK': 'GB',
  'Japão': 'JP', 'Japan': 'JP', 'China': 'CN', 'Coreia do Sul': 'KR', 'South Korea': 'KR', 'Canadá': 'CA', 'Canada': 'CA',
  'Austrália': 'AU', 'Australia': 'AU', 'Índia': 'IN', 'India': 'IN', 'Itália': 'IT', 'Italy': 'IT',
  'México': 'MX', 'Mexico': 'MX', 'Argentina': 'AR', 'Colômbia': 'CO', 'Colombia': 'CO', 
  'Chile': 'CL', 'Peru': 'PE', 'Uruguai': 'UY', 'Uruguay': 'UY', 'Venezuela': 'VE',
  'Equador': 'EC', 'Ecuador': 'EC', 'Bolívia': 'BO', 'Bolivia': 'BO', 'Paraguai': 'PY', 'Paraguay': 'PY',
  'Costa Rica': 'CR', 'Panamá': 'PA', 'Panama': 'PA', 'Guatemala': 'GT', 'Honduras': 'HN',
  'El Salvador': 'SV', 'Nicarágua': 'NI', 'Nicaragua': 'NI', 'República Dominicana': 'DO', 'Dominican Republic': 'DO',
  'Espanha': 'ES', 'Spain': 'ES', 'Holanda': 'NL', 'Netherlands': 'NL', 'Suíça': 'CH', 'Switzerland': 'CH',
  'Europa': 'EU', 'European Union': 'EU', 'EU': 'EU', 'EPO': 'EU', 'European Patent Office': 'EU', 'União Europeia': 'EU'
};

const getCountryCode = (countryName: string): string | null => {
  if (!countryName) return null;
  const exactMatch = countryCodeMap[countryName];
  if (exactMatch) return exactMatch;
  const lowerCountry = countryName.toLowerCase();
  const foundKey = Object.keys(countryCodeMap).find(key => 
    key.toLowerCase() === lowerCountry
  );
  if (foundKey) return countryCodeMap[foundKey];
  const partialMatch = Object.keys(countryCodeMap).find(key => 
    key.toLowerCase().includes(lowerCountry) || lowerCountry.includes(key.toLowerCase())
  );
  if (partialMatch) return countryCodeMap[partialMatch];
  return null;
};

const CountryFlag: React.FC<{ countryName: string; size?: number; showName?: boolean; className?: string }> = ({ 
  countryName, 
  size = 24, 
  showName = true, 
  className = "" 
}) => {
  const countryCode = getCountryCode(countryName);
  
  if (!countryCode) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className="bg-gray-300 rounded-md flex items-center justify-center text-gray-600 text-xs font-bold"
          style={{ width: size, height: size * 0.75 }}
        >
          ?
        </div>
        {showName && <span>{countryName}</span>}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div style={{ width: size, height: size * 0.75 }} className="flex-shrink-0">
        <Flag 
          code={countryCode} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '4px',
            display: 'block'
          }}
          alt={`${countryName} flag`}
        />
      </div>
      {showName && <span>{countryName}</span>}
    </div>
  );
};

const OpportunityScoreGauge: React.FC<{ score: number; classification: string }> = ({ score, classification }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-200' };
    if (score >= 60) return { bg: 'bg-yellow-500', text: 'text-yellow-600', ring: 'ring-yellow-200' };
    if (score >= 40) return { bg: 'bg-orange-500', text: 'text-orange-600', ring: 'ring-orange-200' };
    return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-200' };
  };

  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`bg-white rounded-xl p-6 border-2 ${colors.ring} shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Score de Oportunidade</h3>
          <p className={`text-lg font-semibold ${colors.text}`}>{classification}</p>
        </div>
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className={colors.text}
              style={{
                transition: 'stroke-dashoffset 1s ease-in-out',
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-2xl font-bold ${colors.text}`}>{score}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Award size={16} className={colors.text} />
        <span className="text-sm text-gray-600">Baseado em critérios regulatórios e comerciais</span>
      </div>
    </div>
  );
};

const PatentResultsPage = ({ result, searchTerm, onBack }: PatentResultsPageProps) => {
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDFContent = (result: PatentResultType, searchTerm: string): string => {
    const patent = result.patentes?.[0];
    const currentDate = new Date().toLocaleDateString('pt-BR');
    const currentTime = new Date().toLocaleTimeString('pt-BR');
    
    let content = `RELATÓRIO DE ANÁLISE DE PATENTE FARMACÊUTICA

================================================================

Substância Analisada: ${searchTerm}
Data da Consulta: ${currentDate} às ${currentTime}

================================================================
RESUMO EXECUTIVO
================================================================

`;

    if (result.score_de_oportunidade) {
      content += `Score de Oportunidade: ${result.score_de_oportunidade.valor}/100 (${result.score_de_oportunidade.classificacao})

`;
    }

    if (patent) {
      content += `Status da Patente: ${patent.patente_vigente ? 'VIGENTE' : 'EXPIRADA'}
Data de Expiração Principal: ${patent.data_expiracao_patente_principal}
Exploração Comercial: ${patent.exploracao_comercial ? 'PERMITIDA' : 'RESTRITA'}

`;
    }

    if (result.quimica) {
      content += `================================================================
DADOS QUÍMICOS
================================================================

Nome IUPAC: ${result.quimica.iupac_name}
Fórmula Molecular: ${result.quimica.molecular_formula}
Peso Molecular: ${result.quimica.molecular_weight}
SMILES: ${result.quimica.smiles}
InChI Key: ${result.quimica.inchi_key}
Área Polar Topológica: ${result.quimica.topological_polar_surface_area}
Aceptores de Ligação H: ${result.quimica.hydrogen_bond_acceptors}
Doadores de Ligação H: ${result.quimica.hydrogen_bond_donors}
Ligações Rotacionáveis: ${result.quimica.rotatable_bonds}

`;
    }

    if (patent?.patentes_por_pais && patent.patentes_por_pais.length > 0) {
      content += `================================================================
PATENTES POR PAÍS
================================================================

`;
      patent.patentes_por_pais.forEach((country, index) => {
        content += `${index + 1}. ${country.pais}
   Expiração Primária: ${country.data_expiracao_primaria}
   Expiração Secundária: ${country.data_expiracao_secundaria}
   Tipos: ${country.tipos.join(', ')}

`;
      });
    }

    if (patent?.exploracao_comercial_por_pais && patent.exploracao_comercial_por_pais.length > 0) {
      content += `================================================================
EXPLORAÇÃO COMERCIAL POR PAÍS
================================================================

`;
      patent.exploracao_comercial_por_pais.forEach((exploration, index) => {
        content += `${index + 1}. ${exploration.pais}
   Disponível em: ${exploration.data_disponivel}
   Tipos Liberados: ${exploration.tipos_liberados.join(', ')}

`;
      });
    }

    if (result.ensaios_clinicos) {
      content += `================================================================
ENSAIOS CLÍNICOS
================================================================

Ensaios Ativos: ${result.ensaios_clinicos.ativos}
Fase Avançada: ${result.ensaios_clinicos.fase_avancada ? 'SIM' : 'NÃO'}
Países com Ensaios: ${result.ensaios_clinicos.paises.join(', ')}
Principais Indicações: ${result.ensaios_clinicos.principais_indicacoes_estudadas.join(', ')}

`;
    }

    if (result.orange_book) {
      content += `================================================================
FDA ORANGE BOOK
================================================================

Possui Genérico: ${result.orange_book.tem_generico ? 'SIM' : 'NÃO'}
Número NDA: ${result.orange_book.nda_number}
Genéricos Aprovados: ${result.orange_book.genericos_aprovados.join(', ')}
Data Último Genérico: ${result.orange_book.data_ultimo_generico}

`;
    }

    if (result.regulacao_por_pais && result.regulacao_por_pais.length > 0) {
      content += `================================================================
REGULAÇÃO POR PAÍS
================================================================

`;
      result.regulacao_por_pais.forEach((regulation, index) => {
        content += `${index + 1}. ${regulation.pais}
   Agência: ${regulation.agencia}
   Classificação: ${regulation.classificacao}
   Facilidade Registro Genérico: ${regulation.facilidade_registro_generico}

`;
      });
    }

    if (result.evidencia_cientifica_recente && result.evidencia_cientifica_recente.length > 0) {
      content += `================================================================
EVIDÊNCIA CIENTÍFICA RECENTE
================================================================

`;
      result.evidencia_cientifica_recente.forEach((evidence, index) => {
        content += `${index + 1}. ${evidence.titulo}
   Autores: ${evidence.autores ? evidence.autores.join(', ') : 'Não disponíveis'}
   Ano: ${evidence.ano}
   DOI: ${evidence.doi}
   Resumo: ${evidence.resumo}

`;
      });
    }

    if (result.estrategias_de_formulacao && result.estrategias_de_formulacao.length > 0) {
      content += `================================================================
ESTRATÉGIAS DE FORMULAÇÃO
================================================================

`;
      result.estrategias_de_formulacao.forEach((strategy, index) => {
        content += `${index + 1}. ${strategy}
`;
      });
    }

    if (result.score_de_oportunidade?.criterios && result.score_de_oportunidade.criterios.length > 0) {
      content += `================================================================
CRITÉRIOS DE AVALIAÇÃO DO SCORE
================================================================

`;
      result.score_de_oportunidade.criterios.forEach((criterio, index) => {
        content += `${index + 1}. ${criterio}
`;
      });
    }

    content += `
================================================================
RODAPÉ
================================================================

Relatório gerado pela Plataforma de Consulta de Patentes
Data: ${currentDate} às ${currentTime}
Substância: ${searchTerm}

IMPORTANTE: Este relatório é baseado em dados públicos e deve ser usado
apenas para fins informativos. Para decisões legais ou regulatórias,
consulte sempre as fontes oficiais e profissionais especializados.

© 2025 Consulta de Patentes - Todos os direitos reservados
`;

    return content;
  };

  const handleSavePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdfContent = generatePDFContent(result, searchTerm);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const lineHeight = 6;
      const maxWidth = pageWidth - (margin * 2);
      
      const lines = pdfContent.split('\n');
      let yPosition = margin;
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      
      lines.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        if (line.includes('RELATÓRIO DE ANÁLISE DE PATENTE')) {
          pdf.setFontSize(16);
          pdf.setFont('helvetica', 'bold');
          const textLines = pdf.splitTextToSize(line, maxWidth);
          textLines.forEach((textLine: string) => {
            pdf.text(textLine, margin, yPosition);
            yPosition += lineHeight + 2;
          });
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
        } else if (line.includes('================================================================')) {
          yPosition += 3;
        } else if (line.includes('RESUMO EXECUTIVO') || 
                   line.includes('DADOS QUÍMICOS') || 
                   line.includes('PATENTES POR PAÍS') ||
                   line.includes('EXPLORAÇÃO COMERCIAL') ||
                   line.includes('ENSAIOS CLÍNICOS') ||
                   line.includes('FDA ORANGE BOOK') ||
                   line.includes('REGULAÇÃO POR PAÍS') ||
                   line.includes('EVIDÊNCIA CIENTÍFICA') ||
                   line.includes('ESTRATÉGIAS DE FORMULAÇÃO') ||
                   line.includes('CRITÉRIOS DE AVALIAÇÃO') ||
                   line.includes('RODAPÉ')) {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          const textLines = pdf.splitTextToSize(line, maxWidth);
          textLines.forEach((textLine: string) => {
            pdf.text(textLine, margin, yPosition);
            yPosition += lineHeight + 1;
          });
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
        } else if (line.trim()) {
          const textLines = pdf.splitTextToSize(line, maxWidth);
          textLines.forEach((textLine: string) => {
            pdf.text(textLine, margin, yPosition);
            yPosition += lineHeight;
          });
        } else {
          yPosition += lineHeight / 2;
        }
      });
      
      const fileName = `relatorio-patente-${searchTerm.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const patent = result.patentes?.[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
                  <h1 className="text-2xl font-bold text-gray-900">Análise de Propriedade Intelectual</h1>
                  <p className="text-gray-600">Relatório completo para P&D farmacêutico</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Microscope size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Substância Analisada</h2>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">{searchTerm}</p>
              <p className="text-gray-600">Consulta realizada em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            </div>

            {result.score_de_oportunidade && (
              <OpportunityScoreGauge 
                score={result.score_de_oportunidade.valor} 
                classification={result.score_de_oportunidade.classificacao}
              />
            )}
          </div>

          {patent && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Status da Patente</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    {patent.patente_vigente ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                    <span className="font-semibold text-gray-900">Status da Patente</span>
                  </div>
                  <p className={`text-lg font-bold ${patent.patente_vigente ? 'text-green-600' : 'text-red-600'}`}>
                    {patent.patente_vigente ? 'VIGENTE' : 'EXPIRADA'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={20} className="text-orange-600" />
                    <span className="font-semibold text-gray-900">Expiração Principal</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{patent.data_expiracao_patente_principal}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={20} className="text-purple-600" />
                    <span className="font-semibold text-gray-900">Exploração Comercial</span>
                  </div>
                  <p className={`text-lg font-bold ${patent.exploracao_comercial ? 'text-green-600' : 'text-red-600'}`}>
                    {patent.exploracao_comercial ? 'PERMITIDA' : 'RESTRITA'}
                  </p>
                </div>
              </div>

              {patent.patentes_por_pais && patent.patentes_por_pais.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-600" />
                    Patentes por País
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patent.patentes_por_pais.map((country, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                        <CountryFlag countryName={country.pais} size={32} className="mb-3 font-medium text-lg" />
                        <div className="space-y-2 text-sm">
                          <div><strong>Expiração Primária:</strong> {country.data_expiracao_primaria}</div>
                          <div><strong>Tipos:</strong> {country.tipos.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result.quimica && (
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
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Fórmula Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{result.quimica.molecular_formula}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Peso Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.molecular_weight} g/mol</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Área Polar Topológica</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.topological_polar_surface_area} Ų</p>
                </div>
              </div>
            </div>
          )}

          {result.ensaios_clinicos && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <TestTube size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ensaios Clínicos</h3>
                  <p className="text-sm text-gray-600">Dados do ClinicalTrials.gov</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">Ensaios Ativos</span>
                  <p className="text-3xl font-bold text-green-600 mt-1">{result.ensaios_clinicos.ativos}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">Fase Avançada</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    result.ensaios_clinicos.fase_avancada ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className="text-lg font-bold">{result.ensaios_clinicos.fase_avancada ? '✓' : '✗'}</span>
                    <span className="font-semibold">{result.ensaios_clinicos.fase_avancada ? 'SIM' : 'NÃO'}</span>
                  </div>
                </div>
              </div>
              
              {result.ensaios_clinicos.paises && result.ensaios_clinicos.paises.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-600 mb-2 block">Países com Ensaios</span>
                  <div className="flex flex-wrap gap-3">
                    {result.ensaios_clinicos.paises.map((pais, idx) => (
                      <CountryFlag key={idx} countryName={pais} size={24} className="bg-white px-3 py-2 rounded-lg border border-green-200" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {result.orange_book && (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">FDA Orange Book</h3>
                  <p className="text-sm text-gray-600">Registro de medicamentos aprovados</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">Possui Genérico</span>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                    result.orange_book.tem_generico ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className="text-lg font-bold">{result.orange_book.tem_generico ? '✓' : '✗'}</span>
                    <span className="font-semibold">{result.orange_book.tem_generico ? 'SIM' : 'NÃO'}</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-600">Número NDA</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{result.orange_book.nda_number}</p>
                </div>
              </div>
            </div>
          )}

          {result.regulacao_por_pais && result.regulacao_por_pais.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="text-red-600" size={24} />
                Regulação por País
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.regulacao_por_pais.map((regulation, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <CountryFlag countryName={regulation.pais} size={32} showName={false} />
                      <div>
                        <h4 className="font-bold text-lg">{regulation.pais}</h4>
                        <p className="text-sm text-gray-600">{regulation.agencia}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Classificação</label>
                        <div className="mt-1">
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            {regulation.classificacao}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Facilidade Registro Genérico</label>
                        <div className="mt-1">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            regulation.facilidade_registro_generico === 'Alta' ? 'bg-green-100 text-green-800' :
                            regulation.facilidade_registro_generico === 'Moderada' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {regulation.facilidade_registro_generico}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.evidencia_cientifica_recente && result.evidencia_cientifica_recente.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="text-indigo-600" size={24} />
                Evidência Científica Recente
              </h3>
              
              <div className="space-y-4">
                {result.evidencia_cientifica_recente.map((evidence, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900">
                          {evidence.titulo}
                        </h4>
                        
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>
                            {evidence.autores && evidence.autores.length > 0 ? (
                              evidence.autores.join(', ')
                            ) : (
                              'Autores não disponíveis'
                            )}
                          </span>
                          
                          <span>({evidence.ano})</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-700 leading-relaxed">
                          {evidence.resumo}
                        </p>
                      </div>
                      
                      {evidence.doi !== 'Não informado' && (
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-600">DOI:</label>
                          <a 
                            href={`https://doi.org/${evidence.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                          >
                            {evidence.doi}
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.estrategias_de_formulacao && result.estrategias_de_formulacao.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="text-teal-600" size={24} />
                Estratégias de Formulação
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.estrategias_de_formulacao.map((strategy, index) => (
                  <div key={index} className="flex items-center gap-3 p-4 bg-teal-50 rounded-lg border border-teal-200">
                    <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="text-gray-800 font-medium">{strategy}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.score_de_oportunidade?.criterios && result.score_de_oportunidade.criterios.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-blue-600" size={24} />
                Critérios de Avaliação do Score
              </h3>
              
              <div className="space-y-3">
                {result.score_de_oportunidade.criterios.map((criterio, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <CheckCircle size={16} className="text-blue-600" />
                    <span className="text-gray-800 font-mono text-sm">{criterio}</span>
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