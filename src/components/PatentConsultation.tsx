import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, Globe, Calendar, Shield, Beaker, Clock } from 'lucide-react';
import { PatentResultType, TokenUsageType } from '../types';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface PatentConsultationProps {
  onConsultation: (produto: string, sessionId: string) => Promise<PatentResultType>;
  tokenUsage: TokenUsageType | null;
}

// Mapeamento de países para bandeiras (emojis) e status
const countryFlags: { [key: string]: { flag: string; name: string } } = {
  // Principais países
  'Brasil': { flag: '🇧🇷', name: 'Brasil' },
  'Brazil': { flag: '🇧🇷', name: 'Brasil' },
  'Estados Unidos': { flag: '🇺🇸', name: 'Estados Unidos' },
  'United States': { flag: '🇺🇸', name: 'Estados Unidos' },
  'USA': { flag: '🇺🇸', name: 'Estados Unidos' },
  'US': { flag: '🇺🇸', name: 'Estados Unidos' },
  'Alemanha': { flag: '🇩🇪', name: 'Alemanha' },
  'Germany': { flag: '🇩🇪', name: 'Alemanha' },
  'França': { flag: '🇫🇷', name: 'França' },
  'France': { flag: '🇫🇷', name: 'França' },
  'Reino Unido': { flag: '🇬🇧', name: 'Reino Unido' },
  'United Kingdom': { flag: '🇬🇧', name: 'Reino Unido' },
  'UK': { flag: '🇬🇧', name: 'Reino Unido' },
  'Japão': { flag: '🇯🇵', name: 'Japão' },
  'Japan': { flag: '🇯🇵', name: 'Japão' },
  'China': { flag: '🇨🇳', name: 'China' },
  'Coreia do Sul': { flag: '🇰🇷', name: 'Coreia do Sul' },
  'South Korea': { flag: '🇰🇷', name: 'Coreia do Sul' },
  'Canadá': { flag: '🇨🇦', name: 'Canadá' },
  'Canada': { flag: '🇨🇦', name: 'Canadá' },
  'Austrália': { flag: '🇦🇺', name: 'Austrália' },
  'Australia': { flag: '🇦🇺', name: 'Austrália' },
  'Índia': { flag: '🇮🇳', name: 'Índia' },
  'India': { flag: '🇮🇳', name: 'Índia' },
  'Itália': { flag: '🇮🇹', name: 'Itália' },
  'Italy': { flag: '🇮🇹', name: 'Itália' },
  'Espanha': { flag: '🇪🇸', name: 'Espanha' },
  'Spain': { flag: '🇪🇸', name: 'Espanha' },
  'Holanda': { flag: '🇳🇱', name: 'Holanda' },
  'Netherlands': { flag: '🇳🇱', name: 'Holanda' },
  'Suíça': { flag: '🇨🇭', name: 'Suíça' },
  'Switzerland': { flag: '🇨🇭', name: 'Suíça' },
  'Suécia': { flag: '🇸🇪', name: 'Suécia' },
  'Sweden': { flag: '🇸🇪', name: 'Suécia' },
  'Noruega': { flag: '🇳🇴', name: 'Noruega' },
  'Norway': { flag: '🇳🇴', name: 'Noruega' },
  'Dinamarca': { flag: '🇩🇰', name: 'Dinamarca' },
  'Denmark': { flag: '🇩🇰', name: 'Dinamarca' },
  'Finlândia': { flag: '🇫🇮', name: 'Finlândia' },
  'Finland': { flag: '🇫🇮', name: 'Finlândia' },
  'Bélgica': { flag: '🇧🇪', name: 'Bélgica' },
  'Belgium': { flag: '🇧🇪', name: 'Bélgica' },
  'Áustria': { flag: '🇦🇹', name: 'Áustria' },
  'Austria': { flag: '🇦🇹', name: 'Áustria' },
  'Portugal': { flag: '🇵🇹', name: 'Portugal' },
  'México': { flag: '🇲🇽', name: 'México' },
  'Mexico': { flag: '🇲🇽', name: 'México' },
  'Argentina': { flag: '🇦🇷', name: 'Argentina' },
  'Chile': { flag: '🇨🇱', name: 'Chile' },
  'Colômbia': { flag: '🇨🇴', name: 'Colômbia' },
  'Colombia': { flag: '🇨🇴', name: 'Colômbia' },
  'Peru': { flag: '🇵🇪', name: 'Peru' },
  'Uruguai': { flag: '🇺🇾', name: 'Uruguai' },
  'Uruguay': { flag: '🇺🇾', name: 'Uruguai' },
  'Rússia': { flag: '🇷🇺', name: 'Rússia' },
  'Russia': { flag: '🇷🇺', name: 'Rússia' },
  'África do Sul': { flag: '🇿🇦', name: 'África do Sul' },
  'South Africa': { flag: '🇿🇦', name: 'África do Sul' },
  'Israel': { flag: '🇮🇱', name: 'Israel' },
  'Singapura': { flag: '🇸🇬', name: 'Singapura' },
  'Singapore': { flag: '🇸🇬', name: 'Singapura' },
  'Tailândia': { flag: '🇹🇭', name: 'Tailândia' },
  'Thailand': { flag: '🇹🇭', name: 'Tailândia' },
  'Malásia': { flag: '🇲🇾', name: 'Malásia' },
  'Malaysia': { flag: '🇲🇾', name: 'Malásia' },
  'Indonésia': { flag: '🇮🇩', name: 'Indonésia' },
  'Indonesia': { flag: '🇮🇩', name: 'Indonésia' },
  'Filipinas': { flag: '🇵🇭', name: 'Filipinas' },
  'Philippines': { flag: '🇵🇭', name: 'Filipinas' },
  'Vietnã': { flag: '🇻🇳', name: 'Vietnã' },
  'Vietnam': { flag: '🇻🇳', name: 'Vietnã' },
  'Taiwan': { flag: '🇹🇼', name: 'Taiwan' },
  'Hong Kong': { flag: '🇭🇰', name: 'Hong Kong' },
  'Nova Zelândia': { flag: '🇳🇿', name: 'Nova Zelândia' },
  'New Zealand': { flag: '🇳🇿', name: 'Nova Zelândia' },
  
  // Organizações regionais
  'Europa': { flag: '🇪🇺', name: 'União Europeia' },
  'European Union': { flag: '🇪🇺', name: 'União Europeia' },
  'EU': { flag: '🇪🇺', name: 'União Europeia' },
  'EPO': { flag: '🇪🇺', name: 'Escritório Europeu de Patentes' },
  'European Patent Office': { flag: '🇪🇺', name: 'Escritório Europeu de Patentes' },
  'WIPO': { flag: '🌍', name: 'Organização Mundial da Propriedade Intelectual' },
  'World Intellectual Property Organization': { flag: '🌍', name: 'OMPI' },
  'Internacional': { flag: '🌍', name: 'Internacional' },
  'International': { flag: '🌍', name: 'Internacional' },
  'Global': { flag: '🌍', name: 'Global' },
  'Worldwide': { flag: '🌍', name: 'Mundial' }
};

// Função para obter informações do país
const getCountryInfo = (country: string) => {
  // Primeiro, tenta encontrar uma correspondência exata
  const exactMatch = countryFlags[country];
  if (exactMatch) return exactMatch;
  
  // Se não encontrar, tenta encontrar uma correspondência parcial (case-insensitive)
  const lowerCountry = country.toLowerCase();
  const partialMatch = Object.keys(countryFlags).find(key => 
    key.toLowerCase().includes(lowerCountry) || lowerCountry.includes(key.toLowerCase())
  );
  
  if (partialMatch) return countryFlags[partialMatch];
  
  // Se não encontrar nenhuma correspondência, retorna um ícone genérico
  return { flag: '🏳️', name: country };
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Nova Consulta de Patente</h2>
        <p className="text-gray-600">Digite o nome do produto ou substância para verificar o status da patente</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                placeholder="Ex: Minoxidil, Paracetamol, Ibuprofeno..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || remainingTokens < 10}
              />
            </div>
            <button
              type="submit"
              disabled={!produto.trim() || isLoading || remainingTokens < 10}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Consultar
                </>
              )}
            </button>
          </div>
          {remainingTokens < 10 && (
            <div className="mt-2 text-sm text-orange-600">
              Tokens insuficientes para consulta. <Link to="/plans" className="text-blue-600 hover:underline">Adquirir mais tokens</Link>
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
                  {result.paises_registrados.map((pais, index) => {
                    const countryInfo = getCountryInfo(pais);
                    return (
                      <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl" role="img" aria-label={`Bandeira ${countryInfo.name}`}>
                            {countryInfo.flag}
                          </span>
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 block">{countryInfo.name}</span>
                            <span className="text-sm text-green-600 font-medium">✓ Registrado</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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