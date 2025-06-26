import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, Globe, Calendar, Shield } from 'lucide-react';
import { PatentResultType, TokenUsageType } from '../types';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

interface PatentConsultationProps {
  onConsultation: (produto: string, sessionId: string) => Promise<PatentResultType>;
  tokenUsage: TokenUsageType | null;
}

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
        
        {tokenUsage && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">Tokens disponíveis:</span>
              <span className="font-semibold text-blue-800">{remainingTokens} de {tokenUsage.totalTokens}</span>
            </div>
            <div className="mt-2 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(remainingTokens / tokenUsage.totalTokens) * 100}%` }}
              />
            </div>
            {remainingTokens < 10 && (
              <div className="mt-2 text-sm text-orange-600">
                Tokens insuficientes para consulta. <Link to="/plans" className="text-blue-600 hover:underline">Adquirir mais tokens</Link>
              </div>
            )}
          </div>
        )}
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
                    <Calendar size={20} className="text-blue-600" />
                    <span className="font-semibold text-gray-900">Expiração da Patente Principal</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{result.data_expiracao_patente_principal}</p>
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

                {result.data_vencimento_patente_novo_produto && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar size={20} className="text-orange-600" />
                      <span className="font-semibold text-gray-900">Vencimento Novo Produto</span>
                    </div>
                    <p className="text-lg font-bold text-orange-600">{result.data_vencimento_patente_novo_produto}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Países Registrados */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Globe size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Países com Registro</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {result.paises_registrados.map((pais, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border text-center">
                    <span className="text-sm font-medium text-gray-900">{pais}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Riscos Regulatórios */}
            {result.riscos_regulatorios_eticos.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={24} className="text-orange-600" />
                  <h3 className="text-xl font-bold text-gray-900">Riscos Regulatórios e Éticos</h3>
                </div>
                <ul className="space-y-3">
                  {result.riscos_regulatorios_eticos.map((risco, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700">{risco}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Substância */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Substância Analisada</h3>
              <p className="text-2xl font-bold text-blue-600">{result.substancia}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentConsultation;