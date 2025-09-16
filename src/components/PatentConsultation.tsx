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
import { PatentResultType, TokenUsageType, ConsultaCompleta } from '../types';
import { parsePatentResponse, isDashboardData, parseDashboardData } from '../utils/patentParser';
import PatentResultsPage from './PatentResultsPage';
import PatentDashboardReport from './PatentDashboardReport';
import { CountryFlagsFromText } from '../utils/countryFlags';
import { hasUnrestrictedAccess } from '../utils/unrestrictedEmails';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Componente para redirecionar usuários sem tokens
const TokenAccessGuard = ({ children, hasTokens }: { children: React.ReactNode; hasTokens: boolean }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!hasTokens && !hasUnrestrictedAccess(auth.currentUser?.email)) {
      navigate('/plans');
    }
  }, [hasTokens, navigate]);

  if (!hasTokens && !hasUnrestrictedAccess(auth.currentUser?.email)) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-orange-900 mb-4">{t('restrictedAccess')}</h2>
          <p className="text-orange-700 mb-6">
            {t('needActivePlan')}
          </p>
          <button
            onClick={() => navigate('/plans')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {t('viewAvailablePlans')}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

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
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  // Verificar se o usuário tem tokens disponíveis
  const hasAvailableTokens = (tokenUsage && (tokenUsage.totalTokens - tokenUsage.usedTokens) > 0) || 
                            (auth.currentUser && hasUnrestrictedAccess(auth.currentUser.email));

  // Verificar se o usuário é o admin que pode ver o seletor
  const isAdminUser = auth.currentUser?.email === 'innovagenoi@gmail.com';

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

    setIsLoading(true);
    setError('');
    setResult(null);
    setDashboardData(null);

    const startTime = Date.now();
    try {
      // Buscar dados do usuário para metadados
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();

      // Preparar dados para o webhook
      const webhookData = {
        cliente: userData?.company || 'Empresa',
        nome_comercial: searchData.nome_comercial.trim(),
        nome_molecula: searchData.nome_molecula.trim(),
        industria: 'Farmacêutica',
        setor: 'Medicamentos',
        categoria: searchData.categoria || 'Medicamentos',
        beneficio: searchData.beneficio || 'Tratamento médico',
        doenca_alvo: searchData.doenca_alvo || 'Condição médica',
        pais_alvo: searchData.pais_alvo,
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
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      console.log('✅ Resposta do webhook recebida:', webhookResponse);

      // Preparar dados completos da consulta para salvar
      const consultaCompleta: Omit<ConsultaCompleta, 'id'> = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || '',
        userName: userData?.name || '',
        userCompany: userData?.company || '',
        
        // Dados de input
        nome_comercial: searchData.nome_comercial.trim(),
        nome_molecula: searchData.nome_molecula.trim(),
        categoria: searchData.categoria || 'Medicamentos',
        beneficio: searchData.beneficio || 'Tratamento médico',
        doenca_alvo: searchData.doenca_alvo || 'Condição médica',
        pais_alvo: searchData.pais_alvo,
        
        // Metadados
        environment,
        serpApiKey: 'auto', // Será selecionada automaticamente pelo webhook
        
        // Resultado
        resultado: webhookResponse,
        isDashboard: isDashboardData(webhookResponse),
        
        // Timestamps
        consultedAt: new Date().toISOString(),
        webhookResponseTime: responseTime
      };
      // Verificar se é dashboard ou dados de patente normais
      if (isDashboardData(webhookResponse)) {
        console.log('📊 Detectado dados de dashboard, renderizando dashboard...');
        const dashboardInfo = parseDashboardData(webhookResponse);
        setDashboardData(dashboardInfo);
        
        // Salvar consulta completa
        await addDoc(collection(db, 'consultas'), consultaCompleta);
      } else {
        console.log('📋 Detectado dados de patente normais, renderizando interface padrão...');
        const patentData = parsePatentResponse(webhookResponse);
        setResult(patentData);
        
        // Atualizar resultado parseado na consulta
        consultaCompleta.resultado = patentData;
        
        // Salvar consulta completa
        await addDoc(collection(db, 'consultas'), consultaCompleta);
        
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
    <TokenAccessGuard hasTokens={hasAvailableTokens}>
      <div className="max-w-4xl mx-auto">
      {/* Formulário Principal */}
      <div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Header com seletor de ambiente para admin */}
          <div className="flex items-center justify-end mb-6">
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
                  {t('commercialName')} *
                </label>
                <input
                  type="text"
                  value={searchData.nome_comercial}
                  onChange={(e) => handleInputChange('nome_comercial', e.target.value)}
                  onClick={() => !hasAvailableTokens && navigate('/plans')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Ozempic, Trulicity, Victoza"
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TestTube size={16} className="inline mr-2 text-purple-600" />
                  {t('moleculeName')} *
                </label>
                <input
                  type="text"
                  value={searchData.nome_molecula}
                  onChange={(e) => handleInputChange('nome_molecula', e.target.value)}
                  onClick={() => !hasAvailableTokens && navigate('/plans')}
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
                {t('pharmaceuticalCategory')}
              </label>
              <select
                value={searchData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                onClick={() => !hasAvailableTokens && navigate('/plans')}
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
                  {t('mainBenefit')}
                </label>
                <input
                  type="text"
                  value={searchData.beneficio}
                  onChange={(e) => handleInputChange('beneficio', e.target.value)}
                  onClick={() => !hasAvailableTokens && navigate('/plans')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Controle glicêmico e perda de peso"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Zap size={16} className="inline mr-2 text-red-600" />
                  {t('targetDisease')}
                </label>
                <input
                  type="text"
                  value={searchData.doenca_alvo}
                  onChange={(e) => handleInputChange('doenca_alvo', e.target.value)}
                  onClick={() => !hasAvailableTokens && navigate('/plans')}
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
                {t('targetCountries')} * ({t('selectAtLeastOneCountry')})
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
                      onClick={() => !hasAvailableTokens && navigate('/plans')}
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
                      {t('countriesSelected')} ({searchData.pais_alvo.length}):
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
              disabled={isLoading || !searchData.nome_comercial.trim() || !searchData.nome_molecula.trim() || searchData.pais_alvo.length === 0 || !hasAvailableTokens}
              onClick={() => !hasAvailableTokens && navigate('/plans')}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg transition-colors text-lg font-semibold ${
                !hasAvailableTokens 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white cursor-pointer' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
              {isLoading ? t('creatingPipeline') : !hasAvailableTokens ? t('acquirePlanToConsult') : t('createProductPipeline')}
            </button>

          </form>

          {/* Informações sobre tokens */}
          {tokenUsage && (
            <div className={`mt-6 p-4 border rounded-lg ${
              hasAvailableTokens 
                ? 'bg-gray-50 border-gray-200' 
                : 'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className={hasAvailableTokens ? 'text-gray-600' : 'text-orange-600'}>
                  {t('consultationsRemaining')}: <strong>{tokenUsage.totalTokens - tokenUsage.usedTokens}</strong> {t('of')} {tokenUsage.totalTokens}
                </span>
                <span className={hasAvailableTokens ? 'text-gray-600' : 'text-orange-600'}>
                  {t('plan')}: <strong>{tokenUsage.plan}</strong>
                </span>
              </div>
              {!hasAvailableTokens && (
                <div className="mt-2 text-center">
                  <button
                    onClick={() => navigate('/plans')}
                    className="text-orange-600 hover:text-orange-700 font-medium underline"
                  >
                    {t('acquirePlanToConsult')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      </div>
    </TokenAccessGuard>
  );
};

export default PatentConsultation;