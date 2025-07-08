import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Printer,
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
  Pill
} from 'lucide-react';
import { PatentResultType } from '../types';
import Flag from 'react-world-flags';

interface PatentResultsPageProps {
  result: PatentResultType;
  searchTerm: string;
  onBack: () => void;
}

// Mapeamento de países para códigos de bandeiras
const countryCodeMap: { [key: string]: string } = {
  'Brasil': 'BR', 'Brazil': 'BR', 'Estados Unidos': 'US', 'United States': 'US', 'USA': 'US', 'US': 'US',
  'Alemanha': 'DE', 'Germany': 'DE', 'França': 'FR', 'France': 'FR', 'Reino Unido': 'GB', 'United Kingdom': 'GB', 'UK': 'GB',
  'Japão': 'JP', 'Japan': 'JP', 'China': 'CN', 'Coreia do Sul': 'KR', 'South Korea': 'KR', 'Canadá': 'CA', 'Canada': 'CA',
  'Austrália': 'AU', 'Australia': 'AU', 'Índia': 'IN', 'India': 'IN', 'Itália': 'IT', 'Italy': 'IT',
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
          className="bg-gray-300 rounded-sm flex items-center justify-center text-gray-600 text-xs font-bold"
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
            borderRadius: '2px',
            display: 'block'
          }}
          alt={`${countryName} flag`}
        />
      </div>
      {showName && <span>{countryName}</span>}
    </div>
  );
};

const PatentResultsPage = ({ result, searchTerm, onBack }: PatentResultsPageProps) => {
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleSavePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a simple text content for download
      const content = `
RELATÓRIO DE ANÁLISE DE PATENTE
================================

Substância Analisada: ${searchTerm}
Data da Consulta: ${new Date().toLocaleDateString('pt-BR')}

RESUMO EXECUTIVO
================
${result.patentes?.[0] ? `
Status da Patente: ${result.patentes[0].patente_vigente ? 'VIGENTE' : 'EXPIRADA'}
Data de Expiração: ${result.patentes[0].data_expiracao_patente_principal}
Exploração Comercial: ${result.patentes[0].exploracao_comercial ? 'PERMITIDA' : 'RESTRITA'}
` : 'Dados de patente não disponíveis'}

DADOS QUÍMICOS
==============
Nome IUPAC: ${result.quimica?.iupac_name || 'Não informado'}
Fórmula Molecular: ${result.quimica?.molecular_formula || 'Não informado'}
Peso Molecular: ${result.quimica?.molecular_weight || 'Não informado'}

ENSAIOS CLÍNICOS
================
Ensaios Ativos: ${result.ensaios_clinicos?.ativos || 'Não informado'}
Fase Avançada: ${result.ensaios_clinicos?.fase_avancada ? 'SIM' : 'NÃO'}

REGULAÇÃO FARMACÊUTICA
======================
Possui Genérico: ${result.orange_book?.tem_generico ? 'SIM' : 'NÃO'}
Número NDA: ${result.orange_book?.nda_number || 'Não informado'}

---
Relatório gerado pela Plataforma de Consulta de Patentes
      `;

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-patente-${searchTerm.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Análise de Patente - ${searchTerm}`,
          text: `Confira a análise completa de patente para ${searchTerm}`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  const patent = result.patentes?.[0];

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
                  <h1 className="text-2xl font-bold text-gray-900">Relatório de Análise</h1>
                  <p className="text-gray-600">Análise completa de propriedade intelectual</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 border border-gray-300 rounded-lg hover:border-blue-300 transition-colors"
              >
                <Share2 size={16} />
                <span>Compartilhar</span>
              </button>
              
              <button
                onClick={handleSavePDF}
                disabled={isGeneratingPDF}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Salvar PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Substância Analisada */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Microscope size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Substância Analisada</h2>
            </div>
            <p className="text-3xl font-bold text-blue-600">{searchTerm}</p>
            <p className="text-gray-600 mt-2">Consulta realizada em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          </div>

          {/* Status da Patente */}
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

              {/* Patentes por País */}
              {patent.patentes_por_pais && patent.patentes_por_pais.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe size={20} className="text-blue-600" />
                    Patentes por País
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patent.patentes_por_pais.map((country, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                        <CountryFlag countryName={country.pais} size={24} className="mb-3 font-medium" />
                        <div className="space-y-2 text-sm">
                          <div><strong>Expiração Primária:</strong> {country.data_expiracao_primaria}</div>
                          <div><strong>Expiração Secundária:</strong> {country.data_expiracao_secundaria}</div>
                          <div><strong>Tipos:</strong> {country.tipos.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exploração Comercial por País */}
              {patent.exploracao_comercial_por_pais && patent.exploracao_comercial_por_pais.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 size={20} className="text-purple-600" />
                    Exploração Comercial por País
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {patent.exploracao_comercial_por_pais.map((exploration, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                        <CountryFlag countryName={exploration.pais} size={24} className="mb-3 font-medium" />
                        <div className="space-y-2 text-sm">
                          <div><strong>Disponível em:</strong> {exploration.data_disponivel}</div>
                          <div><strong>Tipos Liberados:</strong> {exploration.tipos_liberados.join(', ')}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dados Químicos */}
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
                  <span className="text-sm font-medium text-gray-600">Nome IUPAC</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 break-words">{result.quimica.iupac_name}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Fórmula Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{result.quimica.molecular_formula}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Peso Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.molecular_weight}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">SMILES</span>
                  <p className="text-sm font-mono text-gray-900 mt-1 break-all">{result.quimica.smiles}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">InChI Key</span>
                  <p className="text-sm font-mono text-gray-900 mt-1 break-all">{result.quimica.inchi_key}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Área Polar Topológica</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.topological_polar_surface_area}</p>
                </div>
              </div>
            </div>
          )}

          {/* Ensaios Clínicos */}
          {result.ensaios_clinicos && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <TestTube size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ensaios Clínicos</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">Status dos Ensaios</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{result.ensaios_clinicos.ativos}</p>
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
                  <div className="flex flex-wrap gap-2">
                    {result.ensaios_clinicos.paises.map((pais, idx) => (
                      <CountryFlag key={idx} countryName={pais} size={20} className="bg-white px-3 py-1 rounded-full border border-green-200" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orange Book */}
          {result.orange_book && (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Regulação Farmacêutica</h3>
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
        </div>
      </div>
    </div>
  );
};

export default PatentResultsPage;