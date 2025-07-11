import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, Globe, Calendar, Shield, Beaker, Clock, CreditCard, FileText, Building2, Microscope, FlaskConical, Pill, TestTube, BookOpen, Users, Zap, Target, Award, MessageCircle } from 'lucide-react';
import { PatentResultType, TokenUsageType, PatentByCountry, CommercialExplorationByCountry, PatentData, ChemicalData, ClinicalTrialsData, OrangeBookData, RegulationByCountry, ScientificEvidence } from '../types';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Flag from 'react-world-flags';
import PatentLoadingAnimation from './PatentLoadingAnimation';
import PatentResultsPage from './PatentResultsPage';
import { hasUnrestrictedAccess } from '../utils/unrestrictedEmails';
import { auth } from '../firebase';

interface PatentConsultationProps {
  onConsultation: (produto: string, sessionId: string) => Promise<PatentResultType>;
  tokenUsage: TokenUsageType | null;
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

interface CountryFlagProps {
  countryName: string;
  size?: number;
  showName?: boolean;
  className?: string;
}

const CountryFlag: React.FC<CountryFlagProps> = ({ 
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

// Componente para exibir dados de patente
const PatentDataCard: React.FC<{ patent: PatentData; index: number }> = ({ patent, index }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Análise de Patente {index + 1}</h3>
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
            <Target size={20} className="text-green-600" />
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

      {/* Riscos e Oportunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patent.riscos_regulatorios_ou_eticos !== 'Não informado' && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={20} className="text-red-600" />
              <span className="font-semibold text-red-900">Riscos Regulatórios</span>
            </div>
            <p className="text-red-800">{patent.riscos_regulatorios_ou_eticos}</p>
          </div>
        )}

        {patent.data_vencimento_para_novo_produto !== 'Não informado' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={20} className="text-green-600" />
              <span className="font-semibold text-green-900">Oportunidade para Novo Produto</span>
            </div>
            <p className="text-green-800">Disponível a partir de: {patent.data_vencimento_para_novo_produto}</p>
          </div>
        )}
      </div>

      {/* Alternativas de Compostos */}
      {patent.alternativas_de_compostos_analogos && patent.alternativas_de_compostos_analogos.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Beaker size={20} className="text-purple-600" />
            Alternativas de Compostos
          </h4>
          <div className="flex flex-wrap gap-2">
            {patent.alternativas_de_compostos_analogos.map((alt, idx) => (
              <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PatentConsultation = ({ onConsultation, tokenUsage }: PatentConsultationProps) => {
  const [produto, setProduto] = useState('');
  const [nomeComercial, setNomeComercial] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [showResultsPage, setShowResultsPage] = useState(false);
  const [result, setResult] = useState<PatentResultType | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!produto.trim() && !nomeComercial.trim()) || isLoading) return;

    setIsLoading(true);
    setShowLoadingAnimation(true);
    setError('');
    setResult(null);

    try {
      const sessionId = uuidv4().replace(/-/g, '');
      console.log('🚀 Iniciando consulta de patente:', { produto, nomeComercial }, 'SessionId:', sessionId);
      const resultado = await onConsultation(produto.trim(), nomeComercial.trim(), sessionId);
      console.log('📊 Resultado final recebido:', resultado);
      
      // Aguardar um pouco mais para garantir que a animação termine
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Webhook respondeu, mostrar resultados
      setResult(resultado);
      setShowLoadingAnimation(false);
      setShowResultsPage(true);
    } catch (err) {
      console.error('❌ Erro na consulta:', err);
      setShowLoadingAnimation(false);
      setError(err instanceof Error ? err.message : 'Erro ao consultar patente');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingTokens = tokenUsage ? tokenUsage.totalTokens - tokenUsage.usedTokens : 0;
  const isAccountExpired = remainingTokens <= 0;

  // Show loading animation
  if (showLoadingAnimation) {
    const searchTerm = produto.trim() || nomeComercial.trim() || "medicamento";
    return (
      <PatentLoadingAnimation isVisible={showLoadingAnimation} searchTerm={searchTerm} />
    );
  }

  // Show results page
  if (showResultsPage && result) {
    const searchTerm = produto.trim() || nomeComercial.trim() || "medicamento";
    return (
      <PatentResultsPage
        result={result}
        searchTerm={searchTerm}
        onBack={() => {
          setShowResultsPage(false);
          setResult(null);
          setProduto('');
          setNomeComercial('');
        }}
      />
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nova Consulta de Patente</h2>
        <p className="text-gray-600">Digite o nome da molécula ou nome comercial para análise completa de propriedade intelectual</p>
      </div>

      <div className="p-6">
        {/* Account Expired Warning */}
        {isAccountExpired && (
          <div className="mb-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-center gap-3 mb-4">
              <XCircle size={24} className="text-red-600" />
              <h3 className="text-lg font-bold text-red-800">Conta Expirada</h3>
            </div>
            <p className="text-red-700 mb-4">
              Suas consultas mensais foram esgotadas. Para continuar usando a plataforma, 
              você precisa adquirir um novo plano.
            </p>
            <Link
              to="/plans"
              className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <CreditCard size={20} />
              Ver Planos Disponíveis
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Molécula
                </label>
                <input
                  type="text"
                  value={produto}
                  onChange={(e) => setProduto(e.target.value)}
                  placeholder="Ex: Semaglutide, Paracetamol, Ibuprofeno..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    isAccountExpired 
                      ? 'border-red-300 bg-red-50 text-red-500 placeholder-red-400 cursor-not-allowed'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading || isAccountExpired}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Comercial
                </label>
                <input
                  type="text"
                  value={nomeComercial}
                  onChange={(e) => setNomeComercial(e.target.value)}
                  placeholder="Ex: Ozempic, Tylenol, Advil..."
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                    isAccountExpired 
                      ? 'border-red-300 bg-red-50 text-red-500 placeholder-red-400 cursor-not-allowed'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isLoading || isAccountExpired}
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={(!produto.trim() && !nomeComercial.trim()) || isLoading || isAccountExpired}
                className={`px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  isAccountExpired
                    ? 'bg-red-400 text-white cursor-not-allowed opacity-50'
                    : (!produto.trim() && !nomeComercial.trim()) || isLoading
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Analisando...
                  </>
                ) : isAccountExpired ? (
                  <>
                    <XCircle size={20} />
                    Expirado
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Analisar Patente
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Preencha pelo menos um dos campos acima para realizar a consulta
            </p>
            {!isAccountExpired && (
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-gray-600">
                  Consultas restantes: <span className="font-semibold text-blue-600">{remainingTokens}</span>
                </span>
                {remainingTokens <= 5 && remainingTokens > 0 && (
                  <Link to="/plans" className="text-orange-600 hover:text-orange-700 font-medium">
                    Adquirir mais consultas →
                  </Link>
                )}
              </div>
            )}
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle size={20} className="text-red-600" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analisando propriedade intelectual</h3>
            <p className="text-gray-600">Consultando múltiplas bases de dados especializadas...</p>
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {/* Substância Analisada */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Microscope size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Substância Analisada</h3>
              </div>
              <div className="space-y-2">
                {produto.trim() && (
                  <div>
                    <span className="text-sm text-gray-600">Nome da Molécula:</span>
                    <p className="text-2xl font-bold text-blue-600">{produto}</p>
                  </div>
                )}
                {nomeComercial.trim() && (
                  <div>
                    <span className="text-sm text-gray-600">Nome Comercial:</span>
                    <p className="text-2xl font-bold text-purple-600">{nomeComercial}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dados de Patente */}
            {result.patentes && result.patentes.length > 0 && (
              <div className="space-y-6">
                {result.patentes.map((patent, index) => (
                  <PatentDataCard key={index} patent={patent} index={index} />
                ))}
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
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Aceptores de Ligação H</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.hydrogen_bond_acceptors}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Doadores de Ligação H</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.hydrogen_bond_donors}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Ligações Rotacionáveis</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.rotatable_bonds}</p>
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
                
                {result.ensaios_clinicos.principais_indicacoes_estudadas && result.ensaios_clinicos.principais_indicacoes_estudadas.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Principais Indicações Estudadas</span>
                    <div className="flex flex-wrap gap-2">
                      {result.ensaios_clinicos.principais_indicacoes_estudadas.map((indicacao, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {indicacao}
                        </span>
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
                  
                  {result.orange_book.genericos_aprovados && result.orange_book.genericos_aprovados.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-orange-100 md:col-span-2">
                      <span className="text-sm font-medium text-gray-600 mb-2 block">Genéricos Aprovados</span>
                      <div className="flex flex-wrap gap-2">
                        {result.orange_book.genericos_aprovados.map((generico, idx) => (
                          <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {generico}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentConsultation;