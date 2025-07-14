import { useState, useRef } from 'react';
import { Search, Loader2, XCircle, CreditCard } from 'lucide-react';
import { PatentResultType, TokenUsageType } from '../types';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import PatentResultsPage from './PatentResultsPage';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { parsePatentResponse } from '../utils/patentParser';
import { getSerpKeyManager, initializeSerpKeyManager } from '../utils/serpKeyManager';
import { SERP_API_KEYS } from '../utils/serpKeyData';
import { useEffect } from 'react';

interface PatentConsultationProps {
  checkTokenUsage: () => boolean;
  tokenUsage: TokenUsageType | null;
}

const PatentConsultation = ({ checkTokenUsage, tokenUsage }: PatentConsultationProps) => {
  const [produto, setProduto] = useState('');
  const [nomeComercial, setNomeComercial] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResultsPage, setShowResultsPage] = useState(false);
  const [result, setResult] = useState<PatentResultType | null>(null);
  const [error, setError] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Inicializar o gerenciador de chaves SERP na primeira renderização
  useEffect(() => {
    initializeSerpKeyManager(SERP_API_KEYS);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!produto.trim() && !nomeComercial.trim()) || isLoading) return;

    // Cancelar qualquer operação anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const sessionId = uuidv4().replace(/-/g, '');
      
      // Obter chave SERP disponível
      const serpKeyManager = getSerpKeyManager();
      const serpKey = serpKeyManager?.getAvailableKey();
      
      if (!serpKey) {
        throw new Error('Nenhuma chave SERP API disponível com créditos suficientes (8 créditos necessários por consulta). Tente novamente mais tarde.');
      }
      
      console.log('🚀 Enviando consulta direta para webhook:', { produto, nomeComercial });
      
      // Enviar requisição direta para o webhook e aguardar resposta
      const response = await fetch('https://primary-production-2e3b.up.railway.app/webhook/patentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produto: produto.trim(),
          nome_comercial: nomeComercial.trim(),
          sessionId: sessionId,
          SERPkey: serpKey,
          query: produto.trim() || nomeComercial.trim(),
          userId: auth.currentUser?.uid,
          userEmail: auth.currentUser?.email
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ Resposta recebida do webhook:', responseData);
      
      // CRÍTICO: Registrar uso da chave SERP ANTES do parse (para garantir desconto)
      const serpKeyManager = getSerpKeyManager();
      if (serpKeyManager && serpKey) {
        console.log('🔄 Registrando uso de 8 créditos da chave SERP...');
        const usageRecorded = serpKeyManager.recordUsage(
          serpKey, 
          auth.currentUser?.uid, 
          produto.trim() || nomeComercial.trim()
        );
        
        if (!usageRecorded) {
          console.error('❌ Falha ao registrar uso da chave SERP API');
          throw new Error('Falha ao registrar uso da chave SERP API. Consulta não foi processada.');
        } else {
          console.log('✅ 8 créditos descontados com sucesso da chave SERP');
        }
      }
      
      // Parse da resposta usando o parser existente
      const parsedResult = parsePatentResponse(responseData);
      
      // Adicionar nome comercial ao resultado se foi fornecido
      if (nomeComercial.trim()) {
        parsedResult.nome_comercial = nomeComercial.trim();
      }
      
      // Atualizar tokens após sucesso
      if (auth.currentUser && tokenUsage) {
        await updateDoc(doc(db, 'tokenUsage', auth.currentUser.uid), {
          usedTokens: tokenUsage.usedTokens + 1
        });
      }
      
      setResult(parsedResult);
      setShowResultsPage(true);
      
    } catch (err) {
      console.error('❌ Erro na consulta:', err);
      
      // Se foi cancelado pelo usuário, não mostrar erro
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro inesperado ao consultar patente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const remainingTokens = tokenUsage ? tokenUsage.totalTokens - tokenUsage.usedTokens : 0;
  const isAccountExpired = remainingTokens <= 0;

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
            <p className="text-gray-600">Aguardando resposta do servidor...</p>
            <div className="mt-4 text-sm text-gray-500">
              Esta operação pode levar alguns minutos
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentConsultation;