import { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Search, 
  Globe,
  Building2,
  Pill,
  Target,
  MapPin,
  Settings,
  TestTube,
  Zap,
  Loader2
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PatentResultType, TokenUsageType } from '../types';
import { parsePatentResponse, isDashboardData, parseDashboardData } from '../utils/patentParser';
import PatentResultsPage from './PatentResultsPage';
import PatentDashboardReport from './PatentDashboardReport';
import { getSerpKeyManager } from '../utils/serpKeyManager';
import { initializeSerpKeyManager } from '../utils/serpKeyManager';
import { SERP_API_KEYS } from '../utils/serpKeyData';
import { CountryFlagsFromText } from '../utils/countryFlags';

interface PatentConsultationProps {
  checkTokenUsage: () => boolean;
  tokenUsage: TokenUsageType | null;
}

// Países disponíveis para seleção
const AVAILABLE_COUNTRIES = [
  'Brasil',
  'Estados Unidos',
  'União Europeia',
  'Argentina',
  'México',
  'Canadá',
  'Japão',
  'China',
  'Alemanha',
  'França',
  'Reino Unido',
  'Austrália',
  'Índia'
];

// Categorias farmacêuticas
const PHARMACEUTICAL_CATEGORIES = [
  'Antidiabéticos e Antiobesidade',
  'Cardiovasculares',
  'Antibióticos',
  'Antivirais',
  'Oncológicos',
  'Neurológicos',
  'Imunológicos',
  'Respiratórios',
  'Gastrointestinais',
  'Dermatológicos',
  'Oftalmológicos',
  'Analgésicos',
  'Anti-inflamatórios',
  'Hormônios',
  'Vitaminas e Suplementos'
];

const PatentConsultation = ({ checkTokenUsage, tokenUsage }: PatentConsultationProps) => {
  // Estados principais
  const [searchData, setSearchData] = useState({
    nome_comercial: '',
    nome_molecula: '',
    categoria: '',
    beneficio: '',
    doenca_alvo: '',
    pais_alvo: ['Brasil', 'Estados Unidos']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PatentResultType | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState('');
  const [isEnvironmentSelectorOpen, setIsEnvironmentSelectorOpen] = useState(false);
  const [environment, setEnvironment] = useState<'production' | 'test'>('production');
  const [userCompany, setUserCompany] = useState('');
  const [userSessionId, setUserSessionId] = useState<string>('');

  // Verificar se o usuário é o admin que pode ver o seletor
  const isAdminUser = auth.currentUser?.email === 'innovagenoi@gmail.com';

  // Inicializar gerenciador de chaves SERP
  useEffect(() => {
    initializeSerpKeyManager(SERP_API_KEYS);
  }, []);

  // Gerar ou recuperar sessionId persistente para o usuário
  useEffect(() => {
    const getOrCreateUserSessionId = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.sessionId) {
            // Usar sessionId existente
            setUserSessionId(userData.sessionId);
          } else {
            // Gerar novo sessionId de 24 caracteres alfanuméricos
            const newSessionId = generateSessionId();
            
            // Salvar no documento do usuário
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              sessionId: newSessionId
            });
            
            setUserSessionId(newSessionId);
            console.log(`🆔 Novo sessionId gerado para usuário: ${newSessionId}`);
          }
        }
      } catch (error) {
        console.error('Error getting/creating sessionId:', error);
        // Fallback: gerar sessionId temporário
        setUserSessionId(generateSessionId());
      }
    };

    getOrCreateUserSessionId();
  }, []);

  // Função para gerar sessionId de 24 caracteres alfanuméricos
  const generateSessionId = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserCompany(userData.company || 'Empresa');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (field: string, value: string | string[]) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCountryToggle = (country: string) => {
    setSearchData(prev => ({
      ...prev,
      pais_alvo: prev.pais_alvo.includes(country)
        ? prev.pais_alvo.filter(c => c !== country)
        : [...prev.pais_alvo, country]
    }));
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
    if (searchData.pais_alvo.length === 0) {
      setError('Por favor, selecione pelo menos um país alvo.');
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

    // Verificar se há chaves SERP disponíveis
    const manager = getSerpKeyManager();
    if (!manager || !manager.hasAvailableCredits()) {
      setError('Sistema temporariamente indisponível. Todas as chaves de API atingiram o limite mensal. Tente novamente no próximo mês.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);
    setDashboardData(null);

    try {
      // Obter chave SERP disponível
      const availableKey = manager.getAvailableKey();
      if (!availableKey) {
        throw new Error('Nenhuma chave SERP API disponível no momento');
      }

      // Preparar dados para o webhook
      const webhookData = {
        cliente: userCompany,
        sessionId: userSessionId,
        nome_comercial: searchData.nome_comercial.trim(),
        nome_molecula: searchData.nome_molecula.trim(),
        industria: 'Farmacêutica',
        setor: 'Medicamentos',
        categoria: searchData.categoria || 'Medicamentos',
        beneficio: searchData.beneficio || 'Tratamento médico',
        doenca_alvo: searchData.doenca_alvo || 'Condição médica',
        pais_alvo: searchData.pais_alvo,
        serpApiKey: availableKey
      };

      console.log('🚀 Enviando consulta de patente:', webhookData);

      // URL do webhook baseada no ambiente
      const webhookUrl = environment === 'production' 
        ? 'https://primary-production-2e3b.up.railway.app/webhook/patentesdev'
        : 'https://primary-production-2e3b.up.railway.app/webhook-test/patentesdev';

      console.log(`🌐 Usando ambiente: ${environment} - URL: ${webhookUrl}`);

      // Enviar requisição e aguardar resposta diretamente
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
      console.log('✅ Resposta do webhook recebida:', webhookResponse);

      // Registrar uso da chave SERP
      const usageRecorded = manager.recordUsage(
        availableKey, 
        auth.currentUser.uid, 
        `${searchData.nome_comercial} (${searchData.nome_molecula})`
      );

      if (!usageRecorded) {
        console.warn('⚠️ Falha ao registrar uso da chave SERP');
      }

      // Verificar se é dashboard ou dados de patente normais
      if (isDashboardData(webhookResponse)) {
        console.log('📊 Detectado dados de dashboard, renderizando dashboard...');
        const dashboardInfo = parseDashboardData(webhookResponse);
        setDashboardData(dashboardInfo);
      } else {
        console.log('📋 Detectado dados de patente normais, renderizando interface padrão...');
        try {
          const patentData = parsePatentResponse(webhookResponse);
          setResult(patentData);
          
          // Salvar consulta no histórico apenas para dados de patente normais
          const consultationData: Omit<PatentConsultationType, 'id'> = {
            userId: auth.currentUser.uid,
            userEmail: auth.currentUser.email || '',
            produto: `${searchData.nome_comercial} (${searchData.nome_molecula})`,
            sessionId: userSessionId,
            resultado: patentData,
            consultedAt: new Date().toISOString()
          };

          const docRef = await addDoc(collection(db, 'patentConsultations'), consultationData);
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message === 'DASHBOARD_DATA_DETECTED') {
            console.log('📊 Dashboard data detectado durante parse, redirecionando para dashboard...');
            const dashboardInfo = parseDashboardData(webhookResponse);
            setDashboardData(dashboardInfo);
          } else {
            throw parseError;
          }
        }
      }

      // Atualizar tokens do usuário
      if (tokenUsage) {
        await updateDoc(doc(db, 'tokenUsage', auth.currentUser.uid), {
          usedTokens: tokenUsage.usedTokens + 1
        });
      }

    } catch (error) {
      console.error('❌ Erro na consulta de patente:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido na consulta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToConsultation = () => {
    setResult(null);
    setDashboardData(null);
    setError('');
  };

  // Se há dashboard data, mostrar dashboard
  if (dashboardData) {
    return (
      <PatentDashboardReport
        data={dashboardData}
        onBack={handleBackToConsultation}
      />
    );
  }

  // Se há resultado de patente, mostrar página de resultados
  if (result) {
    return (
      <PatentResultsPage
        result={result}
        searchTerm={`${searchData.nome_comercial} (${searchData.nome_molecula})`}
        onBack={handleBackToConsultation}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Formulário Principal */}
      <div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header com seletor de ambiente para admin */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FlaskConical size={32} className="text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Consulta de Patentes</h2>
                <p className="text-gray-600">Análise completa de propriedade intelectual farmacêutica</p>
              </div>
            </div>

            {/* Seletor de ambiente apenas para admin */}
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
                    {environment === 'production' ? 'PRODUÇÃO' : 'TESTES'}
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
                        <div className="font-medium">Testes</div>
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
            {/* Campos principais */}
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
                  placeholder="Ex: Ozempic, Trulicity, Victoza"
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
                  placeholder="Ex: Semaglutida, Dulaglutida, Liraglutida"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Categoria farmacêutica */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 size={16} className="inline mr-2 text-green-600" />
                Categoria Farmacêutica
              </label>
              <select
                value={searchData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">Selecione uma categoria</option>
                {PHARMACEUTICAL_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Benefício e doença alvo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Target size={16} className="inline mr-2 text-orange-600" />
                  Benefício Principal
                </label>
                <input
                  type="text"
                  value={searchData.beneficio}
                  onChange={(e) => handleInputChange('beneficio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Controle glicêmico e perda de peso"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Zap size={16} className="inline mr-2 text-red-600" />
                  Doença Alvo
                </label>
                <input
                  type="text"
                  value={searchData.doenca_alvo}
                  onChange={(e) => handleInputChange('doenca_alvo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Diabetes tipo 2 e obesidade"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Seleção de países */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Globe size={16} className="inline mr-2 text-indigo-600" />
                Países Alvo * (selecione pelo menos um)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {AVAILABLE_COUNTRIES.map(country => (
                  <label
                    key={country}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                      searchData.pais_alvo.includes(country)
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={searchData.pais_alvo.includes(country)}
                      onChange={() => !isLoading && handleCountryToggle(country)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                      disabled={isLoading}
                    />
                    <span className="text-sm font-medium">{country}</span>
                  </label>
                ))}
              </div>
              
              {searchData.pais_alvo.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      Países selecionados ({searchData.pais_alvo.length}):
                    </span>
                  </div>
                  <CountryFlagsFromText 
                    countriesText={searchData.pais_alvo.join(', ')}
                    size={20}
                    showNames={true}
                    className="flex flex-wrap gap-2"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !searchData.nome_comercial.trim() || !searchData.nome_molecula.trim() || searchData.pais_alvo.length === 0}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
              {isLoading ? 'Analisando Patente...' : 'Consultar Patente'}
            </button>

          </form>

          {/* Informações sobre tokens */}
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
      </div>
    </div>
  );
};

export default PatentConsultation;