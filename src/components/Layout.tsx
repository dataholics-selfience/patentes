import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PatentConsultationType, PatentResultType, TokenUsageType } from '../types';
import PatentConsultation from './PatentConsultation';
import PatentHistory from './PatentHistory';
import UserProfile from './UserProfile';
import { Menu, X, FlaskConical, History, CreditCard, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

const Layout = () => {
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState<PatentConsultationType[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageType | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    };

    fetchTokenUsage();

    // Listen to consultations
    const consultationsQuery = query(
      collection(db, 'patentConsultations'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('consultedAt', 'desc')
    );

    const unsubscribe = onSnapshot(consultationsQuery, (snapshot) => {
      const newConsultations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PatentConsultationType[];
      
      setConsultations(newConsultations);
      setIsLoading(false);
    }, (error) => {
      console.error('Error fetching consultations:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
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
    
    // Parse the actual patent data
    const parsedData = JSON.parse(jsonString);
    console.log('Parsed data:', parsedData);
    
    // Map the fields to match PatentResultType interface
    const resultado: PatentResultType = {
      substancia: parsedData.substancia || 'Produto consultado',
      patente_vigente: parsedData.patente_vigente || false,
      data_expiracao_patente_principal: parsedData.data_expiracao_patente_principal || 
                                       parsedData.data_estimativa_expiracao || 
                                       parsedData.data_vencimento_patente || 
                                       'Não informado',
      paises_registrados: Array.isArray(parsedData.paises_registrados) 
        ? parsedData.paises_registrados 
        : Array.isArray(parsedData.paises_registro)
          ? parsedData.paises_registro
          : (typeof parsedData.paises_registro === 'string' 
              ? [parsedData.paises_registro] 
              : []),
      exploracao_comercial: parsedData.exploracao_comercial || 
                           parsedData.explorada_comercialmente || 
                           false,
      riscos_regulatorios_eticos: Array.isArray(parsedData.riscos_regulatorios_eticos) 
        ? parsedData.riscos_regulatorios_eticos 
        : Array.isArray(parsedData.riscos_regulatorios_ou_eticos)
          ? parsedData.riscos_regulatorios_ou_eticos
          : (typeof parsedData.riscos_regulatorios_ou_eticos === 'string'
              ? [parsedData.riscos_regulatorios_ou_eticos]
              : ['Não informado']),
      data_vencimento_patente_novo_produto: parsedData.data_vencimento_patente_novo_produto || 
                                          parsedData.data_vencimento_para_novo_produto || 
                                          parsedData.data_vencimento_patente || 
                                          null,
      alternativas_compostos: Array.isArray(parsedData.alternativas_compostos) 
        ? parsedData.alternativas_compostos.map((alt: any) => 
            typeof alt === 'string' ? alt : (alt.nome || alt.descricao || alt)
          )
        : Array.isArray(parsedData.alternativas_de_compostos_analogos)
          ? parsedData.alternativas_de_compostos_analogos.map((alt: any) => 
              typeof alt === 'string' ? alt : (alt.nome || alt.descricao || alt)
            )
          : []
    };
    
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

      // Save consultation to history
      await addDoc(collection(db, 'patentConsultations'), {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email,
        produto,
        sessionId,
        resultado,
        consultedAt: new Date().toISOString()
      });

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
    <div className="min-h-screen bg-white">
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
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <History size={16} />
              Histórico
            </button>
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
              <Link
                to="/plans"
                className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => setShowSidebar(false)}
              >
                <CreditCard size={16} />
                Planos
              </Link>
              <button
                onClick={() => {
                  setShowHistory(!showHistory);
                  setShowSidebar(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <History size={16} />
                Histórico
              </button>
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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Consultation Panel */}
          <div className={`${showHistory ? 'lg:col-span-2' : 'lg:col-span-3'} transition-all duration-300`}>
            <PatentConsultation 
              onConsultation={handleConsultation}
              tokenUsage={tokenUsage}
            />
          </div>
          
          {/* History Panel */}
          {showHistory && (
            <div className="lg:col-span-1">
              <PatentHistory 
                consultations={consultations}
                onClose={() => setShowHistory(false)}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Layout;