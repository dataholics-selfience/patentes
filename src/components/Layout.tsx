import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PatentResultType, TokenUsageType } from '../types';
import PatentConsultation from './PatentConsultation';
import UserProfile from './UserProfile';
import TokenUsageChart from './TokenUsageChart';
import { Menu, X, FlaskConical, CreditCard, LogOut, MessageCircle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const [tokenUsage, setTokenUsage] = useState<TokenUsageType | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const patentAgencies = [
    {
      name: "INPI Brasil",
      logo: "/inpi-logo-1.jpeg",
      alt: "INPI Brasil"
    },
    {
      name: "USPTO",
      logo: "/uspto-logo-2.png",
      alt: "USPTO"
    },
    {
      name: "EPO",
      logo: "/epto-logo-3.png",
      alt: "EPO"
    },
    {
      name: "WIPO",
      logo: "/Wipo-logo-4.png",
      alt: "WIPO"
    }
  ];

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    // Fetch token usage
    const fetchTokenUsage = async () => {
      try {
        const tokenDoc = await getDoc(doc(db, 'tokenUsage', auth.currentUser!.uid));
        if (tokenDoc.exists()) {
          setTokenUsage(tokenDoc.data() as TokenUsageType);
        }
      } catch (error) {
        console.error('Error fetching token usage:', error);
      }
      setIsLoading(false);
    };

    fetchTokenUsage();
  }, []);

  const parsePatentResponse = (rawResponse: any): PatentResultType => {
    console.log('Raw response received:', rawResponse);
    
    let jsonString = '';
    
    // Handle nested array structure
    if (Array.isArray(rawResponse) && rawResponse.length > 0) {
      if (rawResponse[0].output) {
        // Check if it's a nested structure
        if (typeof rawResponse[0].output === 'string') {
          try {
            const parsed = JSON.parse(rawResponse[0].output);
            if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].output) {
              jsonString = parsed[0].output;
            } else {
              jsonString = rawResponse[0].output;
            }
          } catch {
            jsonString = rawResponse[0].output;
          }
        } else {
          jsonString = JSON.stringify(rawResponse[0].output);
        }
      }
    }
    
    // Remove markdown code block fences
    jsonString = jsonString.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    console.log('Cleaned JSON string:', jsonString);
    
    // Parse the actual patent data - handle both array and object formats
    let parsedData;
    try {
      const parsed = JSON.parse(jsonString);
      // If it's an array, take the first element
      parsedData = Array.isArray(parsed) ? parsed[0] : parsed;
    } catch (error) {
      console.error('Error parsing JSON:', error);
      throw new Error('Invalid JSON response from API');
    }
    
    console.log('Parsed data:', parsedData);
    
    // Parse countries from string if needed
    const parseCountries = (countriesData: any): string[] => {
      if (Array.isArray(countriesData)) {
        return countriesData;
      }
      if (typeof countriesData === 'string') {
        // Split by common separators and clean up
        return countriesData
          .split(/[,;]/)
          .map(country => country.trim())
          .filter(country => country.length > 0);
      }
      return [];
    };

    // Parse risks from string if needed
    const parseRisks = (risksData: any): string[] => {
      if (Array.isArray(risksData)) {
        return risksData;
      }
      if (typeof risksData === 'string') {
        // If it's a single string, return as array with one element
        return [risksData];
      }
      return [];
    };

    // Parse alternatives from string if needed
    const parseAlternatives = (alternativesData: any): string[] => {
      if (Array.isArray(alternativesData)) {
        return alternativesData;
      }
      if (typeof alternativesData === 'string') {
        // Split by common separators and clean up
        return alternativesData
          .split(/[,;]/)
          .map(alt => alt.trim())
          .filter(alt => alt.length > 0);
      }
      return [];
    };
    
    // Map the fields to match PatentResultType interface with improved field mapping
    const resultado: PatentResultType = {
      substancia: parsedData.substancia || parsedData.produto || parsedData.substance || 'Produto consultado',
      patente_vigente: Boolean(parsedData.patente_vigente || parsedData.patent_valid || false),
      data_expiracao_patente_principal: parsedData.data_expiracao_patente_principal || 
                                       parsedData.data_estimativa_expiracao || 
                                       parsedData.data_vencimento_patente ||
                                       parsedData.expiration_date ||
                                       'Não informado',
      paises_registrados: parseCountries(
        parsedData.paises_registrados || 
        parsedData.paises_registro ||
        parsedData.registered_countries ||
        parsedData.countries ||
        []
      ),
      exploracao_comercial: Boolean(
        parsedData.exploracao_comercial || 
        parsedData.explorada_comercialmente ||
        parsedData.commercial_exploitation ||
        false
      ),
      riscos_regulatorios_eticos: parseRisks(
        parsedData.riscos_regulatorios_eticos || 
        parsedData.riscos_regulatorios_ou_eticos ||
        parsedData.regulatory_risks ||
        parsedData.risks ||
        'Não informado'
      ),
      data_vencimento_patente_novo_produto: parsedData.data_vencimento_patente_novo_produto || 
                                          parsedData.data_vencimento_para_novo_produto || 
                                          parsedData.data_vencimento_patente ||
                                          parsedData.new_product_expiration ||
                                          null,
      alternativas_compostos: parseAlternatives(
        parsedData.alternativas_compostos ||
        parsedData.alternativas_de_compostos_analogos ||
        parsedData.alternative_compounds ||
        parsedData.alternatives ||
        []
      )
    };
    
    console.log('Final resultado:', resultado);
    return resultado;
  };

  const handleConsultation = async (produto: string, sessionId: string): Promise<PatentResultType> => {
    if (!auth.currentUser || !tokenUsage) {
      throw new Error('Usuário não autenticado ou dados de token não encontrados');
    }

    const CONSULTATION_TOKEN_COST = 10;
    const remainingTokens = tokenUsage.totalTokens - tokenUsage.usedTokens;
    
    if (remainingTokens < CONSULTATION_TOKEN_COST) {
      throw new Error(`Tokens insuficientes. Você possui ${remainingTokens} tokens restantes. Esta consulta custa ${CONSULTATION_TOKEN_COST} tokens.`);
    }

    try {
      // Call webhook with sessionId
      const response = await fetch('https://primary-production-2e3b.up.railway.app/webhook/patentes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produto: produto,
          sessionId: sessionId,
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao consultar patente');
      }

      const rawResponse = await response.json();
      console.log('Raw response:', rawResponse);
      
      // Parse the response using the improved parser
      const resultado = parsePatentResponse(rawResponse);
      
      // Set the product name from input if not present in response
      if (!resultado.substancia || resultado.substancia === 'Produto consultado') {
        resultado.substancia = produto;
      }

      console.log('Final resultado:', resultado);

      // Update token usage
      await updateDoc(doc(db, 'tokenUsage', auth.currentUser.uid), {
        usedTokens: tokenUsage.usedTokens + CONSULTATION_TOKEN_COST
      });

      setTokenUsage(prev => prev ? {
        ...prev,
        usedTokens: prev.usedTokens + CONSULTATION_TOKEN_COST
      } : null);

      return resultado;
    } catch (error) {
      console.error('Error in consultation:', error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse text-blue-600 text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 text-gray-600 hover:text-blue-600 lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <FlaskConical size={32} className="text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Consulta de Patentes</h1>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center gap-4">
            <Link
              to="/plans"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CreditCard size={16} />
              Planos
            </Link>
            <UserProfile />
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {showSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-50 lg:hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FlaskConical size={24} className="text-blue-600" />
                  <span className="font-bold text-gray-900">Patentes</span>
                </div>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 text-gray-600 hover:text-gray-900"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {/* Token Usage in Sidebar */}
              {tokenUsage && (
                <TokenUsageChart
                  totalTokens={tokenUsage.totalTokens}
                  usedTokens={tokenUsage.usedTokens}
                />
              )}
              
              <Link
                to="/plans"
                className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowSidebar(false)}
              >
                <CreditCard size={16} />
                Planos
              </Link>
              <div className="pt-4 border-t border-gray-200">
                <UserProfile />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
        <div className="grid grid-cols-1">
          {/* Consultation Panel */}
          <div className="w-full">
            <PatentConsultation 
              onConsultation={handleConsultation}
              tokenUsage={tokenUsage}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Support Button - Left */}
            <a 
              href="https://wa.me/5511995736666" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <MessageCircle size={20} />
              Suporte via WhatsApp
            </a>

            {/* Patent Agencies Logos - Right */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden lg:block">Conectado às principais agências:</span>
              <div className="flex items-center gap-4">
                {patentAgencies.map((agency, index) => (
                  <div key={index} className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <img
                      src={agency.logo}
                      alt={agency.alt}
                      className="h-6 object-contain opacity-80 hover:opacity-100 transition-opacity"
                      title={agency.name}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-500 text-sm mt-6 pt-6 border-t border-gray-200">
            <p>&copy; 2025 Consulta de Patentes. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;