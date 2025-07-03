import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, Globe, Calendar, Shield, Beaker, Clock } from 'lucide-react';
import { PatentResultType, TokenUsageType } from '../types';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation, getLanguageTag } from '../utils/i18n.tsx';
import { CountryFlagsFromText } from '../utils/countryFlags';

interface PatentConsultationProps {
  onConsultation: (produto: string, sessionId: string) => Promise<PatentResultType>;
  tokenUsage: TokenUsageType | null;
}

const PatentConsultation = ({ onConsultation, tokenUsage }: PatentConsultationProps) => {
  const { t, language } = useTranslation();
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
      
      // Add language tag to the product name for the webhook
      const languageTag = getLanguageTag(language);
      const productWithLanguage = `${produto.trim()} <${languageTag}>`;
      
      const resultado = await onConsultation(productWithLanguage, sessionId);
      setResult(resultado);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setIsLoading(false);
    }
  };

  const remainingTokens = tokenUsage ? tokenUsage.totalTokens - tokenUsage.usedTokens : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.newConsultation}</h2>
        <p className="text-gray-600">{t.consultationPlaceholder}</p>
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
                  {t.consulting}...
                </>
              ) : (
                <>
                  <Search size={20} />
                  {t.consultPatent}
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
                <h3 className="text-xl font-bold text-gray-900">{t.substanceAnalyzed}</h3>
              </div>
              <p className="text-2xl font-bold text-blue-600">{result.substancia}</p>
            </div>

            {/* Status da Patente */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">{t.patentStatus}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    {result.patente_vigente ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                    <span className="font-semibold text-gray-900">{t.patentVigent}</span>
                  </div>
                  <p className={`text-lg font-bold ${result.patente_vigente ? 'text-green-600' : 'text-red-600'}`}>
                    {result.patente_vigente ? t.yes : t.no}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={20} className="text-blue-600" />
                    <span className="font-semibold text-gray-900">{t.commercialExploration}</span>
                  </div>
                  <p className={`text-lg font-bold ${result.exploracao_comercial ? 'text-green-600' : 'text-red-600'}`}>
                    {result.exploracao_comercial ? t.permitted : t.restricted}
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
                    <span className="font-semibold text-gray-900">{t.mainPatentExpiration}</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {result.data_expiracao_patente_principal || 'Não informado'}
                  </p>
                </div>

                {result.data_vencimento_patente_novo_produto && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={20} className="text-orange-600" />
                      <span className="font-semibold text-gray-900">{t.newProductExpiration}</span>
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
                <h3 className="text-xl font-bold text-gray-900">{t.registeredCountries}</h3>
              </div>
              {result.paises_registrados && result.paises_registrados.length > 0 ? (
                <div className="bg-white p-4 rounded-lg border">
                  {/* Handle both array and string formats */}
                  {Array.isArray(result.paises_registrados) ? (
                    <CountryFlagsFromText 
                      countriesText={result.paises_registrados.join(', ')} 
                      size={24} 
                      showNames={true}
                    />
                  ) : (
                    <CountryFlagsFromText 
                      countriesText={result.paises_registrados} 
                      size={24} 
                      showNames={true}
                    />
                  )}
                </div>
              ) : (
                <div className="bg-white p-6 rounded-lg border text-center">
                  <Globe size={48} className="text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">{t.noCountriesRegistered}</p>
                </div>
              )}
            </div>

            {/* Riscos Regulatórios */}
            {result.riscos_regulatorios_eticos && result.riscos_regulatorios_eticos.length > 0 && (
              <div className="bg-red-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={24} className="text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">{t.regulatoryRisks}</h3>
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
                  <h3 className="text-xl font-bold text-gray-900">{t.alternativeCompounds}</h3>
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