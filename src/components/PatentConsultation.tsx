import { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Search, 
  Globe,
  Building2,
  Pill,
  Target,
  MapPin,
  Loader2
} from 'lucide-react';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PatentResultType, TokenUsageType, ConsultaCompleta } from '../types';
import { parsePatentResponse } from '../utils/patentParser';
import PatentResultsPage from './PatentResultsPage';
import { useNavigate } from 'react-router-dom';

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
  
  // Estados principais
  const [searchData, setSearchData] = useState({
    nome_comercial: '',
    categoria: '',
    beneficio: '',
    doenca_alvo: '',
    pais_alvo: ['Brasil', 'Estados Unidos']
  });
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PatentResultType | null>(null);
  const [error, setError] = useState('');
  const [userCompany, setUserCompany] = useState('');
  const [userSessionId, setUserSessionId] = useState<string>('');

  // Verificar se o usuário tem tokens disponíveis
  const hasAvailableTokens = tokenUsage && (tokenUsage.totalTokens - tokenUsage.usedTokens) > 0;

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

    const startTime = Date.now();
    try {
      // Buscar dados do usuário para metadados
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();

      // Preparar dados para o webhook
      const webhookData = {
        cliente: userCompany,
        nome_comercial: searchData.nome_comercial.trim(),
        industria: 'Farmacêutica',
        setor: 'Medicamentos',
        categoria: searchData.categoria || 'Medicamentos',
        beneficio: searchData.beneficio || 'Tratamento médico',
        doenca_alvo: searchData.doenca_alvo || 'Condição médica',
        pais_alvo: searchData.pais_alvo
      };

      console.log('🚀 Enviando consulta de patente:', webhookData);

      // URL do webhook
      const webhookUrl = 'https://primary-production-2e3b.up.railway.app/webhook/patentesdev';

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
        nome_molecula: searchData.nome_comercial.trim(), // Usar nome comercial como molécula
        categoria: searchData.categoria || 'Medicamentos',
        beneficio: searchData.beneficio || 'Tratamento médico',
        doenca_alvo: searchData.doenca_alvo || 'Condição médica',
        pais_alvo: searchData.pais_alvo,
        
        // Metadados
        sessionId: userSessionId,
        environment: 'production',
        serpApiKey: 'webhook-direct',
        
        // Resultado
        resultado: webhookResponse,
        isDashboard: false,
        
        // Timestamps
        consultedAt: new Date().toISOString(),
        webhookResponseTime: responseTime
      };

      // Parse e exibir resultado
      const patentData = parsePatentResponse(webhookResponse);
      setResult(patentData);
      
      // Salvar consulta completa
      await addDoc(collection(db, 'consultas'), consultaCompleta);

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
    setError('');
  };

  // Se há resultado de patente, mostrar página de resultados
  if (result) {
    return (
      <PatentResultsPage
        result={result}
        searchTerm={searchData.nome_comercial}
        onBack={handleBackToConsultation}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <FlaskConical size={32} className="text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Consulta de Patentes</h2>
            <p className="text-gray-600">Análise completa de propriedade intelectual farmacêutica</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome comercial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Pill size={16} className="inline mr-2 text-blue-600" />
              Nome Comercial *
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

          {/* Categoria farmacêutica */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Building2 size={16} className="inline mr-2 text-green-600" />
              Categoria Farmacêutica
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
                Benefício Principal
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
                <Target size={16} className="inline mr-2 text-red-600" />
                Doença Alvo
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
                    Países selecionados ({searchData.pais_alvo.length}):
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchData.pais_alvo.map((country, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !searchData.nome_comercial.trim() || searchData.pais_alvo.length === 0 || !hasAvailableTokens}
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
            {isLoading ? 'Analisando Patente...' : !hasAvailableTokens ? 'Adquirir Plano para Consultar' : 'Consultar Patente'}
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
            {!hasAvailableTokens && (
              <div className="mt-2 text-center">
                <button
                  onClick={() => navigate('/plans')}
                  className="text-orange-600 hover:text-orange-700 font-medium underline"
                >
                  Adquirir plano para realizar consultas
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentConsultation;