import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, Globe, Calendar, Shield, Beaker, Clock } from 'lucide-react';
import { PatentResultType, TokenUsageType } from '../types';
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

// Função para obter informações do país
const getCountryInfo = (country: string) => {
  const countryCode = getCountryCode(country);
  return {
    code: countryCode,
    name: country,
    displayName: country
  };
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
  const countryInfo = getCountryInfo(countryName);
  
  if (!countryInfo.code) {
    // Fallback para países desconhecidos
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className="bg-gray-300 rounded-sm flex items-center justify-center text-gray-600 text-xs font-bold"
          style={{ width: size, height: size * 0.75 }}
        >
          ?
        </div>
        {showName && <span>{countryInfo.displayName}</span>}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div style={{ width: size, height: size * 0.75 }} className="flex-shrink-0">
        <Flag 
          code={countryInfo.code} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '2px',
            display: 'block'
          }}
          alt={`${countryInfo.displayName} flag`}
        />
      </div>
      {showName && <span>{countryInfo.displayName}</span>}
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
          <div className="space-y-6">
            {/* Substância Analisada */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Beaker size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Substância Analisada</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{result.substancia}</p>
            </div>

            {/* Status da Patente */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Status da Patente</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
            </div>

            {/* Datas de Expiração */}
            <div className="bg-orange-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar size={24} className="text-orange-600" />
                <h3 className="text-xl font-bold text-gray-900">Datas de Expiração</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={20} className="text-blue-600" />
                    <span className="font-semibold text-gray-900">Expiração da Patente Principal</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {result.data_expiracao_patente_principal || 'Não informado'}
                  </p>
                </div>

                {result.data_vencimento_patente_novo_produto && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={20} className="text-orange-600" />
                      <span className="font-semibold text-gray-900">Vencimento para Novo Produto</span>
                    </div>
                    <p className="text-lg font-bold text-orange-600">
                      {result.data_vencimento_patente_novo_produto}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Países com Registro */}
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Países com Registro</h3>
              </div>
              {result.paises_registrados && result.paises_registrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {result.paises_registrados.map((pais, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                      <CountryFlag
                        countryName={pais}
                        size={32}
                        showName={true}
                        className="items-center"
                      />
                      <div className="mt-2">
                        <span className="text-sm text-green-600 font-medium">✓ Registrado</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg border text-center">
                  <Globe size={48} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Nenhum país registrado informado</p>
                </div>
              )}
            </div>

            {/* Riscos Regulatórios */}
            {result.riscos_regulatorios_eticos && result.riscos_regulatorios_eticos.length > 0 && (
              <div className="bg-red-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={24} className="text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">Riscos Regulatórios e Éticos</h3>
                </div>
                <ul className="space-y-3">
                  {result.riscos_regulatorios_eticos.map((risco, index) => (
                    <li key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border">
                      <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{risco}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Alternativas de Compostos */}
            {result.alternativas_compostos && result.alternativas_compostos.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Beaker size={24} className="text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Alternativas de Compostos Análogos</h3>
                </div>
                <ul className="space-y-3">
                  {result.alternativas_compostos.map((alternativa, index) => (
                    <li key={index} className="flex items-start gap-3 bg-white p-4 rounded-lg border">
                      <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{alternativa}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentConsultation;