import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { PatentResultType, TokenUsageType } from '../types';
import PatentConsultation from './PatentConsultation';
import UserProfile from './UserProfile';
import TokenUsageChart from './TokenUsageChart';
import { Menu, X, FlaskConical, CreditCard, LogOut, MessageCircle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { parsePatentResponse } from '../utils/patentParser';
import { hasUnrestrictedAccess, UNRESTRICTED_USER_CONFIG } from '../utils/unrestrictedEmails';
import SerpKeyStats from './SerpKeyStats';
import { Shield } from 'lucide-react';
import { isAdminUser } from '../utils/serpKeyData';

const Layout = () => {
  const navigate = useNavigate();
  const [tokenUsage, setTokenUsage] = useState<TokenUsageType | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Patent agencies data with corrected image paths
  const patentAgencies = [
    {
      name: "INPI Brasil",
      logo: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200&h=100",
      alt: "INPI Brasil"
    },
    {
      name: "USPTO",
      logo: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200&h=100",
      alt: "USPTO"
    },
    {
      name: "EPO",
      logo: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200&h=100",
      alt: "EPO"
    },
    {
      name: "WIPO",
      logo: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200&h=100",
      alt: "WIPO"
    }
  ];

  const ensureUnrestrictedUserSetup = async () => {
    if (!auth.currentUser) return;

    if (hasUnrestrictedAccess(auth.currentUser.email)) {
      try {
        console.log(`🔧 Verificando configuração do usuário irrestrito: ${auth.currentUser.email}`);
        
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        const tokenDoc = await getDoc(doc(db, 'tokenUsage', auth.currentUser.uid));
        
        const now = new Date();
        const transactionId = crypto.randomUUID();

        if (!userDoc.exists() || !userDoc.data()?.unrestrictedAccess) {
          console.log('📝 Criando dados do usuário irrestrito...');
          await setDoc(doc(db, 'users', auth.currentUser.uid), {
            uid: auth.currentUser.uid,
            name: UNRESTRICTED_USER_CONFIG.name,
            email: auth.currentUser.email,
            cpf: UNRESTRICTED_USER_CONFIG.cpf,
            company: UNRESTRICTED_USER_CONFIG.company,
            phone: UNRESTRICTED_USER_CONFIG.phone,
            plan: UNRESTRICTED_USER_CONFIG.plan,
            activated: true,
            activatedAt: now.toISOString(),
            unrestrictedAccess: true,
            createdAt: now.toISOString(),
            acceptedTerms: true,
            termsAcceptanceId: transactionId
          }, { merge: true });
        }

        if (!tokenDoc.exists()) {
          console.log('🎫 Criando dados de token para usuário irrestrito...');
          const now = new Date();
          await setDoc(doc(db, 'tokenUsage', auth.currentUser.uid), {
            uid: auth.currentUser.uid,
            email: auth.currentUser.email,
            plan: UNRESTRICTED_USER_CONFIG.plan,
            totalTokens: UNRESTRICTED_USER_CONFIG.totalTokens,
            usedTokens: 0,
            lastUpdated: now.toISOString(), 
            purchasedAt: now.toISOString(),
            renewalDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(),
            autoRenewal: true
          });
        }

        console.log(`✅ Configuração do usuário irrestrito verificada/criada: ${auth.currentUser.email}`);
      } catch (error) {
        console.error('❌ Erro ao configurar usuário irrestrito:', error);
      }
    }
  };

  useEffect(() => {
    if (!auth.currentUser) {
      setIsLoading(false);
      return;
    }

    const initializeUser = async () => {
      await ensureUnrestrictedUserSetup();
      
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

    initializeUser();
  }, []);

  // Função simplificada apenas para verificar tokens
  const checkTokenUsage = (tokenUsage: TokenUsageType | null): boolean => {
    if (!tokenUsage) return false;
    
    const CONSULTATION_TOKEN_COST = 1;
    const remainingTokens = tokenUsage.totalTokens - tokenUsage.usedTokens;
    
    return remainingTokens >= CONSULTATION_TOKEN_COST;
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
            {auth.currentUser && hasUnrestrictedAccess(auth.currentUser.email) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Acesso Corporativo
              </div>
            )}
            {auth.currentUser && isAdminUser(auth.currentUser.email) && (
              <Link
                to="/admin/serp-keys"
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Shield size={16} />
                Admin SUDO
              </Link>
            )}
            {!(auth.currentUser && hasUnrestrictedAccess(auth.currentUser.email)) && (
              <Link
                to="/plans"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <CreditCard size={16} />
                Planos
              </Link>
            )}
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
              {tokenUsage && (
                <TokenUsageChart
                  totalTokens={tokenUsage.totalTokens}
                  usedTokens={tokenUsage.usedTokens}
                />
              )}
              
              {auth.currentUser && hasUnrestrictedAccess(auth.currentUser.email) && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Acesso Corporativo
                  </div>
                  <div className="text-xs text-green-600">
                    {UNRESTRICTED_USER_CONFIG.company}
                  </div>
                </div>
              )}
              
              {!(auth.currentUser && hasUnrestrictedAccess(auth.currentUser.email)) && (
                <Link
                  to="/plans"
                  className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => setShowSidebar(false)}
                >
                  <CreditCard size={16} />
                  Planos
                </Link>
              )}
              {auth.currentUser && isAdminUser(auth.currentUser.email) && (
                <Link
                  to="/admin/serp-keys"
                  className="flex items-center gap-2 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={() => setShowSidebar(false)}
                >
                  <Shield size={16} />
                  Admin SUDO
                </Link>
              )}
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
          <div className="w-full">
            <PatentConsultation 
              checkTokenUsage={() => checkTokenUsage(tokenUsage)}
              tokenUsage={tokenUsage}
            />
            
            {/* Mostrar stats das chaves SERP apenas para usuários com acesso irrestrito */}
            {auth.currentUser && hasUnrestrictedAccess(auth.currentUser.email) && (
              <div className="mt-8">
                <SerpKeyStats />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <a 
              href="https://wa.me/5511995736666" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <MessageCircle size={20} />
              Suporte via WhatsApp
            </a>

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

          <div className="text-center text-gray-500 text-sm mt-6 pt-6 border-t border-gray-200">
            <p>&copy; 2025 Consulta de Patentes. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;