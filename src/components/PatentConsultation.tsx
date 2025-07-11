import { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, AlertTriangle, Globe, Calendar, Shield, Beaker, Clock, CreditCard, FileText, Building2, Microscope, FlaskConical, Pill, TestTube, BookOpen, Users, Zap, Target, Award, MessageCircle } from 'lucide-react';
import { PatentResultType, TokenUsageType, PatentByCountry, CommercialExplorationByCountry, PatentData, ChemicalData, ClinicalTrialsData, OrangeBookData, RegulationByCountry, ScientificEvidence } from '../types';
import { Link } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Flag from 'react-world-flags';
import PatentLoadingAnimation from './PatentLoadingAnimation';
import PatentResultsPage from './PatentResultsPage';
import { hasUnrestrictedAccess } from '../utils/unrestrictedEmails';
import { auth } from '../firebase';

interface PatentConsultationProps {
  onConsultation: (produto: string, sessionId: string) => Promise<PatentResultType>;
  tokenUsage: TokenUsageType | null;
}

// Mapeamento de países para códigos de bandeiras
const countryCodeMap: { [key: string]: string } = {
  'Brasil': 'BR', 'Brazil': 'BR', 'Estados Unidos': 'US', 'United States': 'US', 'USA': 'US', 'US': 'US',
  'Alemanha': 'DE', 'Germany': 'DE', 'França': 'FR', 'France': 'FR', 'Reino Unido': 'GB', 'United Kingdom': 'GB', 'UK': 'GB',
  'Japão': 'JP', 'Japan': 'JP', 'China': 'CN', 'Coreia do Sul': 'KR', 'South Korea': 'KR', 'Canadá': 'CA', 'Canada': 'CA',
  'Austrália': 'AU', 'Australia': 'AU', 'Índia': 'IN', 'India': 'IN', 'Itália': 'IT', 'Italy': 'IT',
  'Espanha': 'ES', 'Spain': 'ES', 'Holanda': 'NL', 'Netherlands': 'NL', 'Suíça': 'CH', 'Switzerland': 'CH',
  'Europa': 'EU', 'European Union': 'EU', 'EU': 'EU', 'EPO': 'EU', 'European Patent Office': 'EU', 'União Europeia': 'EU'
};

const getCountryCode = (countryName: string): string | null => {
  if (!countryName) return null;
  const exactMatch = countryCodeMap[countryName];
  if (exactMatch) return exactMatch;
  const lowerCountry = countryName.toLowerCase();
  const foundKey = Object.keys(countryCodeMap).find(key => 
    key.toLowerCase() === lowerCountry
  );
  if (foundKey) return countryCodeMap[foundKey];
  const partialMatch = Object.keys(countryCodeMap).find(key => 
    key.toLowerCase().includes(lowerCountry) || lowerCountry.includes(key.toLowerCase())
  );
  if (partialMatch) return countryCodeMap[partialMatch];
  return null;
};

interface CountryFlagProps {
  countryName: string;
  size?: number;
  showName?: boolean;
  className?: string;
}

const CountryFlag: React.FC<CountryFlagProps> = ({ 
  countryName, 
  size = 24, 
  showName = true, 
  className = "" 
}) => {
  const countryCode = getCountryCode(countryName);
  
  if (!countryCode) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div 
          className="bg-gray-300 rounded-sm flex items-center justify-center text-gray-600 text-xs font-bold"
          style={{ width: size, height: size * 0.75 }}
        >
          ?
        </div>
        {showName && <span>{countryName}</span>}
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div style={{ width: size, height: size * 0.75 }} className="flex-shrink-0">
        <Flag 
          code={countryCode} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '2px',
            display: 'block'
          }}
          alt={`${countryName} flag`}
        />
      </div>
      {showName && <span>{countryName}</span>}
    </div>
  );
};

// Componente Gauge animado para Score de Oportunidade
const AnimatedOpportunityGauge = ({ score, classification }: { score: number; classification: string }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    // Animação do número (cronômetro)
    const duration = 2000; // 2 segundos
    const steps = 60; // 60 frames
    const increment = score / steps;
    let currentStep = 0;
    
    const numberTimer = setInterval(() => {
      currentStep++;
      const currentValue = Math.min(increment * currentStep, score);
      setAnimatedScore(Math.round(currentValue));
      
      if (currentStep >= steps) {
        clearInterval(numberTimer);
        setAnimatedScore(score); // Garantir valor final exato
      }
    }, duration / steps);
    
    // Animação do progress bar (sincronizada)
    const progressTimer = setInterval(() => {
      setAnimatedProgress(prev => {
        const newProgress = prev + (score / steps);
        return Math.min(newProgress, score);
      });
    }, duration / steps);
    
    return () => {
      clearInterval(numberTimer);
      clearInterval(progressTimer);
    };
  }, [score]);
  
  const radius = 100; // Aumentado em 33% (de 75 para 100)
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Verde
    if (score >= 60) return '#F59E0B'; // Amarelo
    if (score >= 40) return '#F97316'; // Laranja
    return '#EF4444'; // Vermelho
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="rgba(255, 255, 255, 0.2)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={getColor(score)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ 
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.1s ease-out'
            }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{animatedScore}</span>
          <span className="text-sm text-blue-200">de 100</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold text-white">{classification}</div>
        <div className="text-sm text-blue-200">Score de Oportunidade</div>
      </div>
    </div>
  );
};

// Componente para exibir dados de patente
const PatentDataCard: React.FC<{ patent: PatentData; index: number }> = ({ patent, index }) => {
  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-8 border border-blue-700 shadow-lg">
      {/* Header unificado */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
          <Shield size={32} className="text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Análise de Propriedade Intelectual</h3>
          {patent.numero_patente && patent.numero_patente !== 'Não informado' && (
            <p className="text-blue-200 font-mono text-lg">{patent.numero_patente}</p>
          )}
        </div>
      </div>
      
      {/* Conteúdo principal em grid unificado */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-center">
        {/* Informações principais */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Status da Patente */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                {patent.patente_vigente ? (
                  <CheckCircle size={24} className="text-green-400" />
                ) : (
                  <XCircle size={24} className="text-red-400" />
                )}
                <span className="font-semibold text-blue-100">Status da Patente</span>
              </div>
              <p className={`text-xl font-bold ${patent.patente_vigente ? 'text-green-400' : 'text-red-400'}`}>
                {patent.patente_vigente ? 'VIGENTE' : 'EXPIRADA'}
              </p>
            </div>

            {/* Expiração Principal */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Calendar size={24} className="text-orange-400" />
                <span className="font-semibold text-blue-100">Expiração Principal</span>
              </div>
              <p className="text-xl font-bold text-white">{patent.data_expiracao_patente_principal}</p>
              {patent.data_expiracao_patente_secundaria && patent.data_expiracao_patente_secundaria !== 'Não informado' && (
                <p className="text-sm text-blue-200 mt-1">Secundária: {patent.data_expiracao_patente_secundaria}</p>
              )}
            </div>

            {/* Exploração Comercial */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Building2 size={24} className="text-purple-400" />
                <span className="font-semibold text-blue-100">Exploração Comercial</span>
              </div>
              <p className={`text-xl font-bold ${patent.exploracao_comercial ? 'text-green-400' : 'text-red-400'}`}>
                {patent.exploracao_comercial ? 'PERMITIDA' : 'RESTRITA'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Score de Oportunidade - Gauge maior */}
        <div className="lg:col-span-1 flex justify-center">
          {/* Placeholder para o gauge - será substituído quando o score estiver disponível */}
          <div className="text-center">
            <div className="w-32 h-32 bg-blue-700 rounded-full flex items-center justify-center mb-4">
              <Target size={48} className="text-blue-300" />
            </div>
            <div className="text-lg font-semibold text-white">Score</div>
            <div className="text-sm text-blue-200">Em breve</div>
          </div>
        </div>
      </div>

      {/* Objeto de Proteção */}
      {patent.objeto_protecao && patent.objeto_protecao !== 'Não informado' && (
        <div className="mt-8 pt-6 border-t border-blue-700">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={20} className="text-blue-300" />
            <span className="font-semibold text-blue-100">Objeto de Proteção</span>
          </div>
          <p className="text-white leading-relaxed">{patent.objeto_protecao}</p>
        </div>
      )}

      {/* Tipo de Proteção Detalhado */}
      {patent.tipo_protecao_detalhado && (
        <div className="mt-6">
          <h4 className="text-lg font-bold text-blue-100 mb-4 flex items-center gap-2">
            <Award size={20} className="text-blue-300" />
            Tipos de Proteção
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patent.tipo_protecao_detalhado.primaria && patent.tipo_protecao_detalhado.primaria.length > 0 && (
              <div className="bg-blue-800 p-4 rounded-lg border border-green-400">
                <span className="font-semibold text-green-300 block mb-2">Proteção Primária</span>
                <div className="flex flex-wrap gap-1">
                  {patent.tipo_protecao_detalhado.primaria.map((tipo, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-400 text-green-900 rounded text-sm font-medium">
                      {tipo}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {patent.tipo_protecao_detalhado.secundaria && patent.tipo_protecao_detalhado.secundaria.length > 0 && (
              <div className="bg-blue-800 p-4 rounded-lg border border-yellow-400">
                <span className="font-semibold text-yellow-300 block mb-2">Proteção Secundária</span>
                <div className="flex flex-wrap gap-1">
                  {patent.tipo_protecao_detalhado.secundaria.map((tipo, idx) => (
                    <span key={idx} className="px-2 py-1 bg-yellow-400 text-yellow-900 rounded text-sm font-medium">
                      {tipo}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Patentes por País */}
      {patent.patentes_por_pais && patent.patentes_por_pais.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-blue-100 mb-4 flex items-center gap-2">
            <Globe size={20} className="text-blue-300" />
            Patentes por País
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full bg-blue-800 rounded-lg border border-blue-600">
              <thead>
                <tr className="border-b border-blue-600 bg-blue-700">
                  <th className="text-left py-3 px-4 font-semibold text-blue-100">País</th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-100">Número</th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-100">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-100">Expiração</th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-100">Tipos</th>
                  <th className="text-left py-3 px-4 font-semibold text-blue-100">Fonte</th>
                </tr>
              </thead>
              <tbody>
            {patent.patentes_por_pais.map((country, idx) => (
              <tr key={idx} className="border-b border-blue-700 hover:bg-blue-750">
                <td className="py-3 px-4">
                  <CountryFlag countryName={country.pais} size={20} className="font-medium text-white" />
                </td>
                <td className="py-3 px-4">
                  <span className="font-mono text-sm text-blue-200">{country.numero}</span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    country.status === 'Ativa' ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'
                  }`}>
                    {country.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="font-medium text-white">{country.data_expiracao || country.data_expiracao_primaria}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {(country.tipo || country.tipos || []).map((tipo, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-400 text-blue-900 rounded text-xs font-medium">
                        {tipo}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs text-blue-300">{country.fonte}</span>
                </td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Exploração Comercial por País */}
      {patent.exploracao_comercial_por_pais && patent.exploracao_comercial_por_pais.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-blue-100 mb-4 flex items-center gap-2">
            <Target size={20} className="text-blue-300" />
            Exploração Comercial por País
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patent.exploracao_comercial_por_pais.map((exploration, idx) => (
              <div key={idx} className="bg-blue-800 p-4 rounded-lg border border-blue-600">
                <CountryFlag countryName={exploration.pais} size={24} className="mb-3 font-medium text-white" />
                <div className="space-y-2 text-sm text-blue-200">
                  <div><strong className="text-white">Disponível em:</strong> {exploration.data_disponivel}</div>
                  <div><strong className="text-white">Tipos Liberados:</strong> {exploration.tipos_liberados.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riscos e Oportunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {patent.riscos_regulatorios_ou_eticos !== 'Não informado' && (
          <div className="bg-red-900 bg-opacity-30 p-4 rounded-lg border border-red-400">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-red-400" />
              <span className="font-semibold text-red-300">Riscos Regulatórios</span>
            </div>
            <p className="text-red-200">{patent.riscos_regulatorios_ou_eticos}</p>
          </div>
        )}

        {patent.data_vencimento_para_novo_produto !== 'Não informado' && (
          <div className="bg-green-900 bg-opacity-30 p-4 rounded-lg border border-green-400">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={20} className="text-green-400" />
              <span className="font-semibold text-green-300">Oportunidade para Novo Produto</span>
            </div>
            <p className="text-green-200">Disponível a partir de: {patent.data_vencimento_para_novo_produto}</p>
          </div>
        )}
      </div>

      {/* Alternativas de Compostos */}
      {patent.alternativas_de_compostos_analogos && patent.alternativas_de_compostos_analogos.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-bold text-blue-100 mb-4 flex items-center gap-2">
            <Beaker size={20} className="text-blue-300" />
            Alternativas de Compostos
          </h4>
          <div className="flex flex-wrap gap-2">
            {patent.alternativas_de_compostos_analogos.map((alt, idx) => (
              <span key={idx} className="px-3 py-2 bg-purple-400 text-purple-900 rounded-full text-sm font-medium">
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PatentConsultation = ({ onConsultation, tokenUsage }: PatentConsultationProps) => {
  const [produto, setProduto] = useState('');
  const [nomeComercial, setNomeComercial] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingAnimation, setShowLoadingAnimation] = useState(false);
  const [showResultsPage, setShowResultsPage] = useState(false);
  const [result, setResult] = useState<PatentResultType | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!produto.trim() && !nomeComercial.trim()) || isLoading) return;

    setIsLoading(true);
    setShowLoadingAnimation(true);
    setError('');
    setResult(null);

    try {
      const sessionId = uuidv4().replace(/-/g, '');
      console.log('🚀 Iniciando consulta de patente:', { produto, nomeComercial }, 'SessionId:', sessionId);
      
      // Aguardar resposta completa do webhook com timeout de 3 minutos
      const resultado = await Promise.race([
        onConsultation(produto.trim(), nomeComercial.trim(), sessionId),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: Consulta demorou mais que 3 minutos')), 180000)
        )
      ]);
      
      console.log('📊 Resultado final recebido:', resultado);
      
      // Validar se o resultado está completo antes de exibir
      if (resultado && typeof resultado === 'object') {
        // Aguardar mais tempo para garantir que todos os dados foram processados completamente
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setResult(resultado);
        setShowLoadingAnimation(false);
        setShowResultsPage(true);
      } else {
        throw new Error('Resposta incompleta do servidor');
      }
    } catch (err) {
      console.error('❌ Erro na consulta:', err);
      setShowLoadingAnimation(false);
      
      if (err instanceof Error && err.message.includes('Timeout')) {
        setError('A consulta demorou mais de 3 minutos para ser processada. O webhook pode estar processando múltiplas consultas. Tente novamente em alguns minutos.');
      } else {
        setError(err instanceof Error ? err.message : 'Erro ao consultar patente');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const remainingTokens = tokenUsage ? tokenUsage.totalTokens - tokenUsage.usedTokens : 0;
  const isAccountExpired = remainingTokens <= 0;

  // Show loading animation
  if (showLoadingAnimation) {
    const searchTerm = produto.trim() || nomeComercial.trim() || "medicamento";
    return (
      <PatentLoadingAnimation isVisible={showLoadingAnimation} searchTerm={searchTerm} />
    );
  }

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
            <p className="text-gray-600">Consultando múltiplas bases de dados especializadas...</p>
          </div>
        )}

        {result && (
          <div className="space-y-8">
            {/* Substância Analisada */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Microscope size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Substância Analisada</h3>
              </div>
              <div className="space-y-2">
                {produto.trim() && (
                  <div>
                    <span className="text-sm text-gray-600">Nome da Molécula:</span>
                    <p className="text-2xl font-bold text-blue-600">{produto}</p>
                  </div>
                )}
                {nomeComercial.trim() && (
                  <div>
                    <span className="text-sm text-gray-600">Nome Comercial:</span>
                    <p className="text-2xl font-bold text-purple-600">{nomeComercial}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Dados de Patente */}
            {result.patentes && result.patentes.length > 0 && (
              <div className="space-y-6">
                {result.patentes.map((patent, index) => (
                  <PatentDataCard key={index} patent={patent} index={index} />
                ))}
              </div>
            )}

            {/* Score de Oportunidade com Justificativa */}
            {result.score_de_oportunidade && (
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-8 border border-blue-700 shadow-lg">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  {/* Score com Gauge Animado */}
                  <div className="lg:col-span-1 flex justify-center">
                    <AnimatedOpportunityGauge 
                      score={result.score_de_oportunidade.valor} 
                      classification={result.score_de_oportunidade.classificacao} 
                    />
                  </div>
                  
                  {/* Justificativa */}
                  {result.score_de_oportunidade.justificativa && (
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <Target size={24} className="text-blue-300" />
                        <h4 className="text-xl font-bold text-white">Justificativa do Score</h4>
                      </div>
                      <p className="text-blue-100 leading-relaxed text-lg">
                        {result.score_de_oportunidade.justificativa}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dados Químicos */}
            {result.quimica && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Beaker size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Dados Químicos</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Nome IUPAC</span>
                    <p className="text-lg font-bold text-gray-900 mt-1 break-words">{result.quimica.iupac_name}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Fórmula Molecular</span>
                    <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{result.quimica.molecular_formula}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Peso Molecular</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.molecular_weight}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">SMILES</span>
                    <p className="text-sm font-mono text-gray-900 mt-1 break-all">{result.quimica.smiles}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">InChI Key</span>
                    <p className="text-sm font-mono text-gray-900 mt-1 break-all">{result.quimica.inchi_key}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Área Polar Topológica</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.topological_polar_surface_area}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Aceptores de Ligação H</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.hydrogen_bond_acceptors}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Doadores de Ligação H</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.hydrogen_bond_donors}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-purple-100">
                    <span className="text-sm font-medium text-gray-600">Ligações Rotacionáveis</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.quimica.rotatable_bonds}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ensaios Clínicos */}
            {result.ensaios_clinicos && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <TestTube size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Ensaios Clínicos</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <span className="text-sm font-medium text-gray-600">Status dos Ensaios</span>
                    <p className="text-lg font-bold text-gray-900 mt-1">{result.ensaios_clinicos.ativos}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">Fase Avançada</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      result.ensaios_clinicos.fase_avancada ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="text-lg font-bold">{result.ensaios_clinicos.fase_avancada ? '✓' : '✗'}</span>
                      <span className="font-semibold">{result.ensaios_clinicos.fase_avancada ? 'SIM' : 'NÃO'}</span>
                    </div>
                  </div>
                </div>
                
                {result.ensaios_clinicos.paises && result.ensaios_clinicos.paises.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Países com Ensaios</span>
                    <div className="flex flex-wrap gap-2">
                      {result.ensaios_clinicos.paises.map((pais, idx) => (
                        <CountryFlag key={idx} countryName={pais} size={20} className="bg-white px-3 py-1 rounded-full border border-green-200" />
                      ))}
                    </div>
                  </div>
                )}
                
                {result.ensaios_clinicos.principais_indicacoes_estudadas && result.ensaios_clinicos.principais_indicacoes_estudadas.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Principais Indicações Estudadas</span>
                    <div className="flex flex-wrap gap-2">
                      {result.ensaios_clinicos.principais_indicacoes_estudadas.map((indicacao, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {indicacao}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Orange Book */}
            {result.orange_book && (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                    <FileText size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Regulação Farmacêutica</h3>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">Possui Genérico</span>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                      result.orange_book.tem_generico ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="text-lg font-bold">{result.orange_book.tem_generico ? '✓' : '✗'}</span>
                      <span className="font-semibold">{result.orange_book.tem_generico ? 'SIM' : 'NÃO'}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border border-orange-100">
                    <span className="text-sm font-medium text-gray-600">Número NDA</span>
                    <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{result.orange_book.nda_number}</p>
                  </div>
                  
                  {result.orange_book.genericos_aprovados && result.orange_book.genericos_aprovados.length > 0 && (
                    <div className="bg-white p-4 rounded-lg border border-orange-100 md:col-span-2">
                      <span className="text-sm font-medium text-gray-600 mb-2 block">Genéricos Aprovados</span>
                      <div className="flex flex-wrap gap-2">
                        {result.orange_book.genericos_aprovados.map((generico, idx) => (
                          <span key={idx} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                            {generico}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentConsultation;