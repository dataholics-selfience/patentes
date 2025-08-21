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
  Loader2,
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Award,
  BarChart3,
  Microscope,
  Shield
} from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { DrugPipelineResult, TokenUsageType, PipelineCompleta } from '../types';
import { parseDashboardData } from '../utils/patentParser';
import DrugPipelineReport from './DrugPipelineReport';
import { hasUnrestrictedAccess } from '../utils/unrestrictedEmails';
import { useNavigate } from 'react-router-dom';
import DrugPipelineLoadingAnimation from './DrugPipelineLoadingAnimation';

interface DrugPipelineCreatorProps {
  checkTokenUsage: () => boolean;
  tokenUsage: TokenUsageType | null;
}

// Therapeutic areas for drug development
const THERAPEUTIC_AREAS = [
  'Oncologia',
  'Cardiologia', 
  'Neurologia',
  'Endocrinologia',
  'Imunologia',
  'Infectologia',
  'Pneumologia',
  'Gastroenterologia',
  'Dermatologia',
  'Oftalmologia',
  'Urologia',
  'Ginecologia',
  'Pediatria',
  'Geriatria',
  'Psiquiatria',
  'Reumatologia',
  'Hematologia',
  'Nefrologia'
];

// Target markets for drug development
const TARGET_MARKETS = [
  'Brasil',
  'Estados Unidos',
  'União Europeia',
  'Canadá',
  'Japão',
  'China',
  'Austrália',
  'México',
  'Argentina',
  'Chile',
  'Colômbia',
  'Reino Unido',
  'Alemanha',
  'França',
  'Itália',
  'Espanha'
];

// Budget ranges for drug development
const BUDGET_RANGES = [
  'Até R$ 10 milhões',
  'R$ 10-50 milhões',
  'R$ 50-100 milhões',
  'R$ 100-500 milhões',
  'R$ 500 milhões - 1 bilhão',
  'Acima de R$ 1 bilhão'
];

// Timeline preferences
const TIMELINE_OPTIONS = [
  '2-3 anos (Fast Track)',
  '3-5 anos (Padrão)',
  '5-7 anos (Extensivo)',
  '7-10 anos (Completo)',
  'Mais de 10 anos (Breakthrough)'
];

const DrugPipelineCreator = ({ checkTokenUsage, tokenUsage }: DrugPipelineCreatorProps) => {
  const navigate = useNavigate();
  
  // Estados principais
  const [formData, setFormData] = useState({
    target_disease: '',
    therapeutic_area: '',
    mechanism_of_action: '',
    target_population: '',
    geographic_markets: ['Brasil', 'Estados Unidos'],
    budget_range: '',
    timeline_preference: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DrugPipelineResult | null>(null);
  const [error, setError] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [userSessionId, setUserSessionId] = useState<string>('');

  // Verificar se o usuário tem tokens disponíveis
  const hasAvailableTokens = (tokenUsage && (tokenUsage.totalTokens - tokenUsage.usedTokens) > 0) || 
                            (auth.currentUser && hasUnrestrictedAccess(auth.currentUser.email));

  // Gerar ou recuperar sessionId persistente para o usuário
  useEffect(() => {
    const getOrCreateUserSessionId = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          if (userData.sessionId) {
            setUserSessionId(userData.sessionId);
          } else {
            const newSessionId = generateSessionId();
            await updateDoc(doc(db, 'users', auth.currentUser.uid), {
              sessionId: newSessionId
            });
            setUserSessionId(newSessionId);
            console.log(`🆔 Novo sessionId gerado para usuário: ${newSessionId}`);
          }
        }
      } catch (error) {
        console.error('Error getting/creating sessionId:', error);
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
          setUserCompany(userData.company || 'Empresa Farmacêutica');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMarketToggle = (market: string) => {
    setFormData(prev => ({
      ...prev,
      geographic_markets: prev.geographic_markets.includes(market)
        ? prev.geographic_markets.filter(m => m !== market)
        : [...prev.geographic_markets, market]
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.target_disease.trim()) {
      setError('Por favor, informe a doença alvo.');
      return false;
    }
    if (!formData.therapeutic_area) {
      setError('Por favor, selecione a área terapêutica.');
      return false;
    }
    if (!formData.target_population.trim()) {
      setError('Por favor, descreva a população alvo.');
      return false;
    }
    if (formData.geographic_markets.length === 0) {
      setError('Por favor, selecione pelo menos um mercado geográfico.');
      return false;
    }
    if (!formData.budget_range) {
      setError('Por favor, selecione a faixa de orçamento.');
      return false;
    }
    if (!formData.timeline_preference) {
      setError('Por favor, selecione o prazo preferido.');
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
      setError('Você não possui tokens suficientes para criar um pipeline de medicamento.');
      return;
    }

    setIsLoading(true);
    setError('');
    setResult(null);

    const startTime = Date.now();
    try {
      // Buscar dados do usuário para metadados
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();

      // Preparar dados para o webhook de criação de medicamentos
      const webhookData = {
        cliente: userCompany,
        sessionId: userSessionId,
        target_disease: formData.target_disease.trim(),
        therapeutic_area: formData.therapeutic_area,
        mechanism_of_action: formData.mechanism_of_action.trim(),
        target_population: formData.target_population.trim(),
        geographic_markets: formData.geographic_markets,
        budget_range: formData.budget_range,
        timeline_preference: formData.timeline_preference,
        request_type: 'complete_drug_pipeline'
      };

      console.log('🚀 Enviando solicitação de pipeline de medicamento:', webhookData);

      // URL do webhook para criação de medicamentos
      const webhookUrl = 'https://primary-production-2e3b.up.railway.app/webhook/pharmyrus-pipeline';

      // Enviar requisição e aguardar resposta
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

      // Preparar dados completos do pipeline para salvar
      const pipelineCompleta: Omit<PipelineCompleta, 'id'> = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || '',
        userName: userData?.name || '',
        userCompany: userData?.company || '',
        
        // Dados de input
        target_disease: formData.target_disease.trim(),
        therapeutic_area: formData.therapeutic_area,
        mechanism_of_action: formData.mechanism_of_action.trim(),
        target_population: formData.target_population.trim(),
        geographic_markets: formData.geographic_markets,
        budget_range: formData.budget_range,
        timeline_preference: formData.timeline_preference,
        
        // Metadados
        sessionId: userSessionId,
        environment: 'production',
        serpApiKey: 'auto',
        
        // Resultado
        resultado: webhookResponse,
        isDashboard: true, // Pipeline sempre é dashboard
        
        // Timestamps
        consultedAt: new Date().toISOString(),
        webhookResponseTime: responseTime
      };

      // Salvar pipeline completo
      await addDoc(collection(db, 'drugPipelines'), pipelineCompleta);

      // Parse e exibir resultado
      const pipelineData = parseDashboardData(webhookResponse);
      setResult(pipelineData);

      // Atualizar tokens do usuário
      if (tokenUsage) {
        await updateDoc(doc(db, 'tokenUsage', auth.currentUser.uid), {
          usedTokens: tokenUsage.usedTokens + 5 // Pipeline custa 5 tokens
        });
      }

    } catch (error) {
      console.error('❌ Erro na criação do pipeline:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido na criação do pipeline');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToPipeline = () => {
    setResult(null);
    setError('');
  };

  // Se há resultado, mostrar relatório do pipeline
  if (result) {
    return (
      <DrugPipelineReport
        data={result}
        onBack={handleBackToPipeline}
      />
    );
  }

  // Mostrar animação de loading
  if (isLoading) {
    return (
      <DrugPipelineLoadingAnimation
        isVisible={isLoading}
        searchTerm={`${formData.target_disease} - ${formData.therapeutic_area}`}
        onCancel={() => {
          setIsLoading(false);
          setError('Pipeline cancelado pelo usuário');
        }}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Formulário Principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header com seletor de ambiente para admin */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FlaskConical size={32} className="text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Criador de Pipeline de Medicamentos</h2>
              <p className="text-gray-600">IA completa para desenvolvimento de novos fármacos</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Doença Alvo e Área Terapêutica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target size={16} className="inline mr-2 text-red-600" />
                Doença Alvo *
              </label>
              <input
                type="text"
                value={formData.target_disease}
                onChange={(e) => handleInputChange('target_disease', e.target.value)}
                onClick={() => !hasAvailableTokens && navigate('/plans')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Diabetes tipo 2, Alzheimer, Câncer de mama"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TestTube size={16} className="inline mr-2 text-purple-600" />
                Área Terapêutica *
              </label>
              <select
                value={formData.therapeutic_area}
                onChange={(e) => handleInputChange('therapeutic_area', e.target.value)}
                onClick={() => !hasAvailableTokens && navigate('/plans')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              >
                <option value="">Selecione a área terapêutica</option>
                {THERAPEUTIC_AREAS.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Mecanismo de Ação e População Alvo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Zap size={16} className="inline mr-2 text-orange-600" />
                Mecanismo de Ação
              </label>
              <input
                type="text"
                value={formData.mechanism_of_action}
                onChange={(e) => handleInputChange('mechanism_of_action', e.target.value)}
                onClick={() => !hasAvailableTokens && navigate('/plans')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Inibidor de SGLT2, Agonista GLP-1"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users size={16} className="inline mr-2 text-green-600" />
                População Alvo *
              </label>
              <input
                type="text"
                value={formData.target_population}
                onChange={(e) => handleInputChange('target_population', e.target.value)}
                onClick={() => !hasAvailableTokens && navigate('/plans')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Adultos com diabetes tipo 2, Idosos com demência"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Orçamento e Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign size={16} className="inline mr-2 text-green-600" />
                Faixa de Orçamento *
              </label>
              <select
                value={formData.budget_range}
                onChange={(e) => handleInputChange('budget_range', e.target.value)}
                onClick={() => !hasAvailableTokens && navigate('/plans')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              >
                <option value="">Selecione a faixa de orçamento</option>
                {BUDGET_RANGES.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TrendingUp size={16} className="inline mr-2 text-indigo-600" />
                Prazo de Desenvolvimento *
              </label>
              <select
                value={formData.timeline_preference}
                onChange={(e) => handleInputChange('timeline_preference', e.target.value)}
                onClick={() => !hasAvailableTokens && navigate('/plans')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              >
                <option value="">Selecione o prazo preferido</option>
                {TIMELINE_OPTIONS.map(timeline => (
                  <option key={timeline} value={timeline}>{timeline}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Seleção de mercados geográficos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Globe size={16} className="inline mr-2 text-indigo-600" />
              Mercados Geográficos * (selecione pelo menos um)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {TARGET_MARKETS.map(market => (
                <label
                  key={market}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.geographic_markets.includes(market)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={formData.geographic_markets.includes(market)}
                    onChange={() => !isLoading && handleMarketToggle(market)}
                    onClick={() => !hasAvailableTokens && navigate('/plans')}
                    className="rounded text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="text-sm font-medium">{market}</span>
                </label>
              ))}
            </div>
            
            {formData.geographic_markets.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Mercados selecionados ({formData.geographic_markets.length}):
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.geographic_markets.map((market, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {market}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.target_disease.trim() || !formData.therapeutic_area || !formData.target_population.trim() || formData.geographic_markets.length === 0 || !formData.budget_range || !formData.timeline_preference || !hasAvailableTokens}
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
              <Microscope size={20} />
            )}
            {isLoading ? 'Criando Pipeline Completo...' : !hasAvailableTokens ? 'Adquirir Plano para Criar Pipeline' : 'Criar Pipeline de Medicamento'}
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
                Consultas restantes: <strong>{tokenUsage.totalTokens - tokenUsage.usedTokens}</strong> de {tokenUsage.totalTokens}
              </span>
              <span className={hasAvailableTokens ? 'text-gray-600' : 'text-orange-600'}>
                Plano: <strong>{tokenUsage.plan}</strong>
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              💡 Cada pipeline completo consome 5 tokens e inclui: análise de patentes, estudo de mercado, SWOT, TAM SAM SOM, documentação regulatória e proposta de medicamento inovador.
            </div>
            {!hasAvailableTokens && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => navigate('/plans')}
                  className="text-orange-600 hover:text-orange-700 font-medium underline"
                >
                  Adquirir plano para criar pipelines
                </button>
              </div>
            )}
          </div>
        )}

        {/* Informações sobre o que será gerado */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Award size={20} />
            O que será gerado no seu pipeline:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
              <Shield size={20} className="text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Análise de Patentes</div>
                <div className="text-xs text-gray-600">Verificação global de IP</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
              <DollarSign size={20} className="text-green-600" />
              <div>
                <div className="font-medium text-gray-900">Análise de Preços</div>
                <div className="text-xs text-gray-600">Benchmarking internacional</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
              <BarChart3 size={20} className="text-purple-600" />
              <div>
                <div className="font-medium text-gray-900">Estudo de Mercado</div>
                <div className="text-xs text-gray-600">TAM SAM SOM + SWOT</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
              <Pill size={20} className="text-orange-600" />
              <div>
                <div className="font-medium text-gray-900">Medicamento Inovador</div>
                <div className="text-xs text-gray-600">Proposta de nova droga</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
              <FileText size={20} className="text-indigo-600" />
              <div>
                <div className="font-medium text-gray-900">Documentação</div>
                <div className="text-xs text-gray-600">Registro de patente</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-blue-100">
              <Building2 size={20} className="text-teal-600" />
              <div>
                <div className="font-medium text-gray-900">Estratégia Regulatória</div>
                <div className="text-xs text-gray-600">Aprovação em agências</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrugPipelineCreator;