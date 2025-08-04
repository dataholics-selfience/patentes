import { useState, useEffect } from 'react';
import { 
  Search, 
  FlaskConical, 
  Sparkles, 
  Clock, 
  TrendingUp,
  Zap,
  Globe,
  Shield,
  Beaker,
  Microscope,
  TestTube,
  Pill,
  Target,
  ChevronRight,
  History,
  Lightbulb,
  Brain,
  Atom
} from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PatentConsultationType, TokenUsageType } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { waitForWebhookResponse, PollingProgress } from '../utils/webhookPoller';
import { WebhookStatusStore } from '../utils/webhookStatusStore';
import { parsePatentResponse } from '../utils/patentParser';
import { getSerpKeyManager } from '../utils/serpKeyManager';
import { initializeSerpKeyManager } from '../utils/serpKeyManager';
import { SERP_API_KEYS } from '../utils/serpKeyData';
import PatentLoadingAnimation from './PatentLoadingAnimation';
import PatentResultsPage from './PatentResultsPage';
import PatentHistory from './PatentHistory';
import { getLanguageTag } from '../utils/i18n';
import { useTranslation } from '../utils/i18n';

interface PatentConsultationProps {
  checkTokenUsage: () => boolean;
  tokenUsage: TokenUsageType | null;
}

const PatentConsultation = ({ checkTokenUsage, tokenUsage }: PatentConsultationProps) => {
  const { t, language } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [consultations, setConsultations] = useState<PatentConsultationType[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [pollingProgress, setPollingProgress] = useState<PollingProgress | undefined>();
  const [suggestions] = useState([
    'Ozempic',
    'Wegovy', 
    'Mounjaro',
    'Insulin',
    'Metformin',
    'Atorvastatin',
    'Lisinopril',
    'Amlodipine'
  ]);

  // Inicializar o gerenciador de chaves SERP
  useEffect(() => {
    initializeSerpKeyManager(SERP_API_KEYS);
  }, []);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    if (!auth.currentUser) return;
    
    try {
      const q = query(
        collection(db, 'patentConsultations'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const consultationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatentConsultationType[];
      
      consultationsList.sort((a, b) => new Date(b.consultedAt).getTime() - new Date(a.consultedAt).getTime());
      setConsultations(consultationsList);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const handleConsultationDeleted = (deletedId: string) => {
    setConsultations(prev => prev.filter(consultation => consultation.id !== deletedId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Por favor, digite o nome do produto ou substância');
      return;
    }

    if (!auth.currentUser) {
      setError('Usuário não autenticado');
      return;
    }

    if (!checkTokenUsage()) {
      setError(`Limite de tokens atingido para o plano ${tokenUsage?.plan}. Atualize seu plano para continuar.`);
      return;
    }

    // Verificar se há chaves SERP disponíveis
    const manager = getSerpKeyManager();
    if (!manager || !manager.hasAvailableCredits()) {
      setError('Sistema temporariamente indisponível. Todas as chaves de API atingiram o limite mensal. Tente novamente no próximo mês.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    setPollingProgress(undefined);

    try {
      const sessionId = uuidv4().replace(/-/g, '');
      
      // Criar status inicial no Firestore
      await WebhookStatusStore.createStatus(sessionId, auth.currentUser.uid, auth.currentUser.email);

      // Obter chave SERP disponível
      const serpKey = manager.getAvailableKey();
      if (!serpKey) {
        throw new Error('Nenhuma chave SERP API disponível no momento');
      }

      console.log(`🔑 Usando chave SERP para consulta: ${serpKey.substring(0, 12)}...`);

      // Preparar payload do webhook
      const webhookPayload = {
        message: searchTerm.trim(),
        sessionId,
        language: getLanguageTag(language),
        serpKey,
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email
      };

      console.log('🚀 Enviando consulta para webhook:', {
        sessionId,
        searchTerm: searchTerm.trim(),
        language: getLanguageTag(language),
        serpKeyPrefix: serpKey.substring(0, 12) + '...'
      });

      // Enviar para webhook
      const response = await fetch('https://primary-production-2e3b.up.railway.app/webhook/production', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook response error:', errorText);
        throw new Error(`Erro no webhook: ${response.status} - ${errorText}`);
      }

      console.log('✅ Webhook enviado com sucesso, iniciando polling...');

      // Registrar uso da chave SERP
      const usageRecorded = manager.recordUsage(serpKey, auth.currentUser.uid, searchTerm.trim());
      if (!usageRecorded) {
        console.warn('⚠️ Falha ao registrar uso da chave SERP');
      }

      // Aguardar resposta usando polling
      const patentData = await waitForWebhookResponse(sessionId, (progress) => {
        setPollingProgress(progress);
      });

      console.log('🎯 Dados de patente recebidos:', patentData);

      // Descontar token do usuário
      if (tokenUsage) {
        await updateDoc(doc(db, 'tokenUsage', auth.currentUser.uid), {
          usedTokens: tokenUsage.usedTokens + 1
        });
      }

      // Salvar consulta no histórico
      const consultationData: Omit<PatentConsultationType, 'id'> = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || '',
        produto: searchTerm.trim(),
        sessionId,
        resultado: patentData,
        consultedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'patentConsultations'), consultationData);

      setResult(patentData);
      await fetchConsultations();

    } catch (error) {
      console.error('Erro na consulta de patente:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido na consulta');
    } finally {
      setIsLoading(false);
      setPollingProgress(undefined);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
  };

  const handleCancelConsultation = () => {
    setIsLoading(false);
    setPollingProgress(undefined);
    setError('Consulta cancelada pelo usuário');
  };

  if (result) {
    return (
      <PatentResultsPage
        result={result}
        searchTerm={searchTerm}
        onBack={() => {
          setResult(null);
          setSearchTerm('');
          setError('');
        }}
      />
    );
  }

  return (
    <>
      <PatentLoadingAnimation
        isVisible={isLoading}
        searchTerm={searchTerm}
        pollingProgress={pollingProgress}
        onCancel={handleCancelConsultation}
      />

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <FlaskConical size={64} className="text-blue-600" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Consulta Inteligente de 
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Patentes</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Descubra o status de patentes farmacêuticas, identifique riscos regulatórios e 
            encontre oportunidades de mercado com nossa IA especializada
          </p>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Main Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Search size={24} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome do medicamento, substância ativa ou molécula..."
                className="w-full pl-16 pr-6 py-6 text-xl border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 placeholder-gray-400"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                <button
                  type="submit"
                  disabled={!searchTerm.trim() || isLoading}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Analisando...</span>
                    </>
                  ) : (
                    <>
                      <Brain size={20} />
                      <span>Analisar Patente</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-500" />
                <span className="text-gray-700 font-medium">Sugestões populares:</span>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 font-medium"
                  >
                    <Pill size={16} />
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Shield size={16} className="text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-800">Erro na Consulta</h4>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Globe size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cobertura Global</h3>
            </div>
            <p className="text-gray-600">
              Consulte patentes em múltiplas jurisdições: INPI, USPTO, EPO e WIPO
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Zap size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Análise Instantânea</h3>
            </div>
            <p className="text-gray-600">
              Resultados em segundos com dados químicos, clínicos e regulatórios
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Target size={24} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Score de Oportunidade</h3>
            </div>
            <p className="text-gray-600">
              Avaliação automatizada do potencial comercial e riscos
            </p>
          </div>
        </div>

        {/* Analysis Categories */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            O que nossa IA analisa para você
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Shield size={32} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Status de Patentes</h4>
              <p className="text-sm text-gray-600">Vigência e expiração por país</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Beaker size={32} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Dados Químicos</h4>
              <p className="text-sm text-gray-600">Fórmula, peso molecular e propriedades</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TestTube size={32} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Ensaios Clínicos</h4>
              <p className="text-sm text-gray-600">Estudos ativos e fases</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Microscope size={32} className="text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Regulação</h4>
              <p className="text-sm text-gray-600">FDA, ANVISA e agências globais</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">4+</div>
            <div className="text-sm text-gray-600">Agências Conectadas</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-1">95%</div>
            <div className="text-sm text-gray-600">Precisão</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">&lt;30s</div>
            <div className="text-sm text-gray-600">Tempo Médio</div>
          </div>
          
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Disponibilidade</div>
          </div>
        </div>

        {/* History Section */}
        {consultations.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <History size={24} className="text-gray-600" />
                <h3 className="text-xl font-bold text-gray-900">Consultas Recentes</h3>
              </div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <span>{showHistory ? 'Ocultar' : 'Ver Todas'}</span>
                <ChevronRight size={16} className={`transition-transform ${showHistory ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {showHistory ? (
              <PatentHistory
                consultations={consultations}
                onClose={() => setShowHistory(false)}
                onConsultationDeleted={handleConsultationDeleted}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {consultations.slice(0, 4).map((consultation) => (
                  <div
                    key={consultation.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setResult(consultation.resultado);
                      setSearchTerm(consultation.produto);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 truncate">
                        {consultation.produto}
                      </span>
                      <div className="flex items-center gap-1">
                        {consultation.resultado.patente_vigente ? (
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                        ) : (
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(consultation.consultedAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default PatentConsultation;