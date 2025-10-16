import { useState, useEffect } from 'react';
import { Search, TestTube, Pill, Loader2, Settings, Clock, FileText } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { TokenUsageType } from '../types';

interface AdvancedPatentSearchProps {
  checkTokenUsage: () => boolean;
  tokenUsage: TokenUsageType | null;
  onResultReceived: (data: any, environment?: 'production' | 'test', searchData?: {nome_comercial: string, nome_molecula: string}) => void;
}

const AdvancedPatentSearch = ({ checkTokenUsage, tokenUsage, onResultReceived }: AdvancedPatentSearchProps) => {
  const [searchData, setSearchData] = useState({
    nome_comercial: '',
    nome_molecula: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [environment, setEnvironment] = useState<'production' | 'test'>('production');
  const [isEnvironmentSelectorOpen, setIsEnvironmentSelectorOpen] = useState(false);
  const [patentHistory, setPatentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const isAdminUser = auth.currentUser?.email === 'daniel.mendes@dataholics.io';

  useEffect(() => {
    loadPatentHistory();
  }, []);

  const loadPatentHistory = async () => {
    if (!auth.currentUser) return;

    setIsLoadingHistory(true);
    try {
      const q = query(
        collection(db, 'consultas'),
        where('userId', '==', auth.currentUser.uid),
        where('tipo', '==', 'busca_avancada_patentes'),
        orderBy('consultedAt', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          nome_comercial: data.nome_comercial,
          nome_molecula: data.nome_molecula,
          createdAt: data.consultedAt,
          ...data.resultado
        };
      });

      setPatentHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleHistoryClick = (historyItem: any) => {
    onResultReceived(historyItem);
  };

  const validateForm = (): boolean => {
    if (!searchData.nome_comercial.trim()) {
      setError('Por favor, informe o nome comercial do produto.');
      return false;
    }
    if (!searchData.nome_molecula.trim()) {
      setError('Por favor, informe o nome da molécula.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setError('Usuário não autenticado');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!checkTokenUsage()) {
      setError('Você não possui tokens suficientes para realizar esta consulta.');
      return;
    }

    setIsLoading(true);
    setError('');

    const startTime = Date.now();
    try {
      const webhookData = {
        nome_comercial: searchData.nome_comercial.trim(),
        nome_molecula: searchData.nome_molecula.trim()
      };

      console.log('🚀 Enviando busca avançada de patentes:', webhookData);

      const webhookUrl = environment === 'production'
        ? 'https://primary-production-2e3b.up.railway.app/webhook/analise-patentes'
        : 'https://primary-production-2e3b.up.railway.app/webhook-test/analise-patentes';

      console.log(`🌐 Usando ambiente: ${environment} - URL: ${webhookUrl}`);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status} ${response.statusText}`);
      }

      const webhookResponse = await response.json();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log('✅ Resposta da busca avançada recebida:', webhookResponse);
      console.log('✅ Tipo da resposta:', typeof webhookResponse);
      console.log('✅ Chaves da resposta:', Object.keys(webhookResponse || {}));
      console.log('✅ Estrutura completa:', JSON.stringify(webhookResponse, null, 2));

      const consultaCompleta = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || '',
        tipo: 'busca_avancada_patentes',
        nome_comercial: searchData.nome_comercial.trim(),
        nome_molecula: searchData.nome_molecula.trim(),
        resultado: webhookResponse,
        consultedAt: new Date().toISOString(),
        webhookResponseTime: responseTime,
        environment: environment
      };

      await addDoc(collection(db, 'consultas'), consultaCompleta);

      if (tokenUsage) {
        await updateDoc(doc(db, 'tokenUsage', auth.currentUser.uid), {
          usedTokens: tokenUsage.usedTokens + 1
        });
      }

      onResultReceived(webhookResponse, environment, {
        nome_comercial: searchData.nome_comercial.trim(),
        nome_molecula: searchData.nome_molecula.trim()
      });
      await loadPatentHistory();

    } catch (error) {
      console.error('❌ Erro na busca avançada de patentes:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido na consulta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Busca Avançada de Patentes</h2>
            <p className="text-gray-600">Realize uma análise completa de patentes relacionadas ao seu produto</p>
          </div>

          {isAdminUser && (
            <div className="relative">
              <button
                onClick={() => setIsEnvironmentSelectorOpen(!isEnvironmentSelectorOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                  environment === 'production'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-yellow-600 text-white border-yellow-600'
                }`}
              >
                <Settings size={16} />
                <span className="font-medium">
                  {environment === 'production' ? 'PRODUÇÃO' : 'TESTE'}
                </span>
              </button>

              {isEnvironmentSelectorOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                  <button
                    onClick={() => {
                      setEnvironment('production');
                      setIsEnvironmentSelectorOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      environment === 'production' ? 'bg-green-50 text-green-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Produção</div>
                      <div className="text-xs text-gray-500">Webhook principal</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setEnvironment('test');
                      setIsEnvironmentSelectorOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      environment === 'test' ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700'
                    }`}
                  >
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">Teste</div>
                      <div className="text-xs text-gray-500">Webhook de desenvolvimento</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Pill size={16} className="inline mr-2 text-blue-600" />
                Nome Comercial *
              </label>
              <input
                type="text"
                value={searchData.nome_comercial}
                onChange={(e) => handleInputChange('nome_comercial', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Verzenios"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TestTube size={16} className="inline mr-2 text-purple-600" />
                Nome da Molécula *
              </label>
              <input
                type="text"
                value={searchData.nome_molecula}
                onChange={(e) => handleInputChange('nome_molecula', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Abemaciclib"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tempo estimado:</strong> A análise completa leva aproximadamente 5 minutos.
              Você receberá um relatório detalhado com análise de patentes, níveis de ameaça e barreiras de entrada.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !searchData.nome_comercial.trim() || !searchData.nome_molecula.trim()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analisando Patentes...
              </>
            ) : (
              <>
                <Search size={20} />
                Iniciar Busca Avançada
              </>
            )}
          </button>
        </form>

        {tokenUsage && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Consultas restantes: <strong>{tokenUsage.totalTokens - tokenUsage.usedTokens}</strong> de {tokenUsage.totalTokens}
              </span>
              <span className="text-gray-600">
                Plano: <strong>{tokenUsage.plan}</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {patentHistory.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-blue-600" size={20} />
            <h3 className="text-lg font-bold text-gray-900">Histórico de Consultas</h3>
          </div>

          {isLoadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : (
            <div className="space-y-3">
              {patentHistory.map((item) => {
                const nomeComercial = item.nome_comercial || 'N/A';
                const nomeMolecula = item.nome_molecula || 'N/A';
                const totalPatentes = item.analises_patentes?.length || 0;
                const patentesAltaAmeaca = item.metricas_chave?.patentes_alta_ameaca || 0;
                const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleDateString('pt-BR') : 'N/A';

                return (
                  <button
                    key={item.id}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={16} className="text-blue-600" />
                          <span className="font-semibold text-gray-900">
                            {nomeComercial} ({nomeMolecula})
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{totalPatentes} patentes analisadas</span>
                          <span className="text-red-600 font-medium">
                            {patentesAltaAmeaca} alta ameaça
                          </span>
                          <span>{createdAt}</span>
                        </div>
                      </div>
                      <div className="text-blue-600 font-medium text-sm">
                        Ver Relatório →
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedPatentSearch;
