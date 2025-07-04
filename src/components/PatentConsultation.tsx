import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, Globe, Calendar, Shield, Beaker, Clock, CreditCard, FileText, Building2 } from 'lucide-react';
import { PatentResultType, TokenUsageType, PatentByCountry, CommercialExplorationByCountry } from '../types';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Flag from 'react-world-flags';

interface PatentConsultationProps {
  onConsultation: (produto: string, sessionId: string) => Promise<PatentResultType>;
  tokenUsage: TokenUsageType | null;
}

// Mapeamento de países para códigos de bandeiras
const countryCodeMap: { [key: string]: string } = {
  // Principais países
  'Brasil': 'BR',
  'Brazil': 'BR',
  'Estados Unidos': 'US',
  'United States': 'US',
  'USA': 'US',
  'US': 'US',
  'Alemanha': 'DE',
  'Germany': 'DE',
  'França': 'FR',
  'France': 'FR',
  'Reino Unido': 'GB',
  'United Kingdom': 'GB',
  'UK': 'GB',
  'Japão': 'JP',
  'Japan': 'JP',
  'China': 'CN',
  'Coreia do Sul': 'KR',
  'South Korea': 'KR',
  'Canadá': 'CA',
  'Canada': 'CA',
  'Austrália': 'AU',
  'Australia': 'AU',
  'Índia': 'IN',
  'India': 'IN',
  'Itália': 'IT',
  'Italy': 'IT',
  'Espanha': 'ES',
  'Spain': 'ES',
  'Holanda': 'NL',
  'Netherlands': 'NL',
  'Suíça': 'CH',
  'Switzerland': 'CH',
  'Suécia': 'SE',
  'Sweden': 'SE',
  'Noruega': 'NO',
  'Norway': 'NO',
  'Dinamarca': 'DK',
  'Denmark': 'DK',
  'Finlândia': 'FI',
  'Finland': 'FI',
  'Bélgica': 'BE',
  'Belgium': 'BE',
  'Áustria': 'AT',
  'Austria': 'AT',
  'Portugal': 'PT',
  'México': 'MX',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'Chile': 'CL',
  'Colômbia': 'CO',
  'Colombia': 'CO',
  'Peru': 'PE',
  'Uruguai': 'UY',
  'Uruguay': 'UY',
  'Rússia': 'RU',
  'Russia': 'RU',
  'África do Sul': 'ZA',
  'South Africa': 'ZA',
  'Israel': 'IL',
  'Singapura': 'SG',
  'Singapore': 'SG',
  'Tailândia': 'TH',
  'Thailand': 'TH',
  'Malásia': 'MY',
  'Malaysia': 'MY',
  'Indonésia': 'ID',
  'Indonesia': 'ID',
  'Filipinas': 'PH',
  'Philippines': 'PH',
  'Vietnã': 'VN',
  'Vietnam': 'VN',
  'Taiwan': 'TW',
  'Hong Kong': 'HK',
  'Nova Zelândia': 'NZ',
  'New Zealand': 'NZ',
  
  // Organizações regionais
  'Europa': 'EU',
  'European Union': 'EU',
  'EU': 'EU',
  'EPO': 'EU',
  'European Patent Office': 'EU',
  'União Europeia': 'EU'
};

// Função para obter código do país
const getCountryCode = (countryName: string): string | null => {
  if (!countryName) return null;
  
  // Primeiro tenta correspondência exata
  const exactMatch = countryCodeMap[countryName];
  if (exactMatch) return exactMatch;
  
  // Tenta correspondência case-insensitive
  const lowerCountry = countryName.toLowerCase();
  const foundKey = Object.keys(countryCodeMap).find(key => 
    key.toLowerCase() === lowerCountry
  );
  
  if (foundKey) return countryCodeMap[foundKey];
  
  // Tenta correspondência parcial
  const partialMatch = Object.keys(countryCodeMap).find(key => 
    key.toLowerCase().includes(lowerCountry) || lowerCountry.includes(key.toLowerCase())
  );
  
  if (partialMatch) return countryCodeMap[partialMatch];
  
  return null;
};

// Componente para renderizar bandeira do país
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
    // Fallback para países desconhecidos
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

// Componente para exibir tipos de patente
const PatentTypes: React.FC<{ tipos: string[] }> = ({ tipos }) => {
  if (!tipos || tipos.length === 0) {
    return <span className="text-gray-500 text-sm">Nenhum tipo específico</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tipos.map((tipo, index) => (
        <span 
          key={index}
          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full border border-blue-200"
        >
          {tipo}
        </span>
      ))}
    </div>
  );
};

// Componente para exibir tipos liberados
const ReleasedTypes: React.FC<{ tipos: string[] }> = ({ tipos }) => {
  if (!tipos || tipos.length === 0) {
    return <span className="text-gray-500 text-sm">Nenhum tipo liberado</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {tipos.map((tipo, index) => (
        <span 
          key={index}
          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200"
        >
          {tipo}
        </span>
      ))}
    </div>
  );
};

// Componente para card de patente por país
const PatentByCountryCard: React.FC<{ patent: PatentByCountry }> = ({ patent }) => {
  const isExpired = patent.data_expiracao !== 'Desconhecida' && 
                   patent.data_expiracao !== 'Não informado' &&
                   new Date(patent.data_expiracao) < new Date();

  return (
    <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <CountryFlag
          countryName={patent.pais}
          size={32}
          showName={true}
          className="items-center font-medium"
        />
        {isExpired ? (
          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
            Expirada
          </span>
        ) : (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Vigente
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-sm">
            <strong>Expira:</strong> {patent.data_expiracao}
          </span>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700 block mb-1">Tipos de Patente:</span>
          <PatentTypes tipos={patent.tipos} />
        </div>
      </div>
    </div>
  );
};

// Componente para card de exploração comercial por país
const CommercialExplorationCard: React.FC<{ exploration: CommercialExplorationByCountry }> = ({ exploration }) => {
  const isAvailable = exploration.data_disponivel !== 'Desconhecida' && 
                     exploration.data_disponivel !== 'Não informado' &&
                     new Date(exploration.data_disponivel) <= new Date();

  return (
    <div className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <CountryFlag
          countryName={exploration.pais}
          size={32}
          showName={true}
          className="items-center font-medium"
        />
        {isAvailable ? (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Disponível
          </span>
        ) : (
          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
            Restrito
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-500" />
          <span className="text-sm">
            <strong>Disponível em:</strong> {exploration.data_disponivel}
          </span>
        </div>
        
        <div>
          <span className="text-sm font-medium text-gray-700 block mb-1">Tipos Liberados:</span>
          <ReleasedTypes tipos={exploration.tipos_liberados} />
        </div>
      </div>
    </div>
  );
};

const PatentConsultation = ({ onConsultation, tokenUsage }: PatentConsultationProps) => {
  const [produto, setProduto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PatentResultType | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produto.trim() || isLoading) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      // Generate a unique sessionId for this consultation
      const sessionId = uuidv4().replace(/-/g, '');
      
      const resultado = await onConsultation(produto.trim(), sessionId);
      setResult(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar patente');
    } finally {
      setIsLoading(false);
    }
  };

  const remainingTokens = tokenUsage ? tokenUsage.totalTokens - tokenUsage.usedTokens : 0;
  const isAccountExpired = remainingTokens <= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nova Consulta de Patente</h2>
        <p className="text-gray-600">Digite o nome do produto ou substância para verificar o status da patente</p>
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
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                placeholder="Ex: Minoxidil, Paracetamol, Ibuprofeno..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  isAccountExpired 
                    ? 'border-red-300 bg-red-50 text-red-500 placeholder-red-400 cursor-not-allowed'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                disabled={isLoading || isAccountExpired}
              />
            </div>
            <button
              type="submit"
              disabled={!produto.trim() || isLoading || isAccountExpired}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isAccountExpired
                  ? 'bg-red-400 text-white cursor-not-allowed opacity-50'
                  : !produto.trim() || isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Consultando...
                </>
              ) : isAccountExpired ? (
                <>
                  <XCircle size={20} />
                  Expirado
                </>
              ) : (
                <>
                  <Search size={20} />
                  Consultar
                </>
              )}
            </button>
          </div>
          
          {!isAccountExpired && (
            <div className="mt-2 flex items-center justify-between text-sm">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando informações de patentes</h3>
            <p className="text-gray-600">Analisando bases de dados internacionais...</p>
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {/* Substância Analisada */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Beaker size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Substância Analisada</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{result.substancia}</p>
            </div>

            {/* Status Geral da Patente */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Status Geral da Patente</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {result.patente_vigente ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                    <span className="font-semibold text-gray-900">Patente Vigente</span>
                  </div>
                  <p className={`text-lg font-bold ${result.patente_vigente ? 'text-green-600' : 'text-red-600'}`}>
                    {result.patente_vigente ? 'SIM' : 'NÃO'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-blue-600" />
                    <span className="font-semibold text-gray-900">Exploração Comercial</span>
                  </div>
                  <p className={`text-lg font-bold ${result.exploracao_comercial ? 'text-green-600' : 'text-red-600'}`}>
                    {result.exploracao_comercial ? 'PERMITIDA' : 'RESTRITA'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={20} className="text-orange-600" />
                    <span className="font-semibold text-gray-900">Expiração Principal</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {result.data_expiracao_patente_principal}
                  </p>
                </div>
              </div>
            </div>

            {/* Patentes por País */}
            {result.patentes_por_pais && result.patentes_por_pais.length > 0 && (
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe size={24} className="text-green-600" />
                  <h3 className="text-xl font-bold text-gray-900">Patentes por País</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.patentes_por_pais.map((patent, index) => (
                    <PatentByCountryCard key={index} patent={patent} />
                  ))}
                </div>
              </div>
            )}

            {/* Exploração Comercial por País */}
            {result.exploracao_comercial_por_pais && result.exploracao_comercial_por_pais.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 size={24} className="text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Exploração Comercial por País</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.exploracao_comercial_por_pais.map((exploration, index) => (
                    <CommercialExplorationCard key={index} exploration={exploration} />
                  ))}
                </div>
              </div>
            )}

            {/* Data de Vencimento para Novo Produto */}
            {result.data_vencimento_para_novo_produto && result.data_vencimento_para_novo_produto !== 'Não informado' && (
              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={24} className="text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-900">Oportunidade para Novo Produto</h3>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={20} className="text-orange-600" />
                    <span className="font-semibold text-gray-900">Data de Disponibilidade</span>
                  </div>
                  <p className="text-lg font-bold text-orange-600">
                    {result.data_vencimento_para_novo_produto}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    A partir desta data, será possível desenvolver produtos similares sem infringir patentes.
                  </p>
                </div>
              </div>
            )}

            {/* Riscos Regulatórios */}
            {result.riscos_regulatorios_ou_eticos && result.riscos_regulatorios_ou_eticos !== 'Não informado' && (
              <div className="bg-red-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={24} className="text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">Riscos Regulatórios e Éticos</h3>
                </div>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-gray-700 leading-relaxed">{result.riscos_regulatorios_ou_eticos}</p>
                </div>
              </div>
            )}

            {/* Alternativas de Compostos */}
            {result.alternativas_de_compostos_analogos && result.alternativas_de_compostos_analogos.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Beaker size={24} className="text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-900">Alternativas de Compostos Análogos</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.alternativas_de_compostos_analogos.map((alternativa, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{alternativa}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fontes da Estimativa */}
            {result.fonte_estimativa && result.fonte_estimativa.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText size={24} className="text-gray-600" />
                  <h3 className="text-xl font-bold text-gray-900">Fontes da Estimativa</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.fonte_estimativa.map((fonte, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-300"
                    >
                      {fonte}
                    </span>
                  ))}
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