import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { FlaskConical, ArrowLeft } from 'lucide-react';
import { hasUnrestrictedAccess, UNRESTRICTED_USER_CONFIG } from '../../utils/unrestrictedEmails';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const validateInputs = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Por favor, preencha todos os campos.');
      return false;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Por favor, insira um email válido.');
      return false;
    }
    if (trimmedPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    return true;
  };

  // Função para configurar usuário com acesso irrestrito
  const setupUnrestrictedUser = async (user: any) => {
    try {
      console.log(`🔧 Configurando usuário com acesso irrestrito: ${user.email}`);
      
      const now = new Date();
      const transactionId = crypto.randomUUID();

      // 1. Criar/atualizar documento do usuário
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: UNRESTRICTED_USER_CONFIG.name,
        email: user.email,
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

      // 2. Criar/atualizar token usage
      await setDoc(doc(db, 'tokenUsage', user.uid), {
        uid: user.uid,
        email: user.email,
        plan: UNRESTRICTED_USER_CONFIG.plan,
        totalTokens: UNRESTRICTED_USER_CONFIG.totalTokens,
        usedTokens: 0,
        lastUpdated: now.toISOString(),
        purchasedAt: now.toISOString(),
        renewalDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString(), // Primeiro dia do próximo mês
        autoRenewal: true
      }, { merge: true });

      // 3. Registrar compliance GDPR
      await setDoc(doc(db, 'gdprCompliance', transactionId), {
        uid: user.uid,
        email: user.email,
        type: 'unrestricted_access_setup',
        unrestrictedAccess: true,
        grantedAt: now.toISOString(),
        transactionId
      });

      console.log(`✅ Usuário com acesso irrestrito configurado com sucesso: ${user.email}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao configurar usuário com acesso irrestrito:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      
      if (!validateInputs()) {
        return;
      }

      setIsLoading(true);

      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password.trim();

      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        trimmedEmail,
        trimmedPassword
      );

      const user = userCredential.user;
      if (!user) {
        throw new Error('No user data available');
      }

      // Verificar se o usuário tem acesso irrestrito
      if (hasUnrestrictedAccess(user.email)) {
        console.log(`✅ Login com acesso irrestrito: ${user.email}`);
        
        // Configurar estrutura completa do usuário
        const setupSuccess = await setupUnrestrictedUser(user);
        
        if (setupSuccess) {
          setError('');
          navigate('/', { replace: true });
          return;
        } else {
          setError('Erro ao configurar conta com acesso irrestrito. Tente novamente.');
          return;
        }
      }

      // Verificação normal de e-mail para outros usuários
      if (!user.emailVerified) {
        await auth.signOut();
        setError('Por favor, verifique seu email antes de fazer login.');
        navigate('/verify-email');
        return;
      }

      setError('');
      navigate('/', { replace: true });
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessages: { [key: string]: string } = {
        'auth/invalid-credential': 'Email ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.',
        'auth/user-disabled': 'Esta conta foi desativada. Entre em contato com o suporte.',
        'auth/too-many-requests': 'Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.',
        'auth/network-request-failed': 'Erro de conexão. Verifique sua internet e tente novamente.',
        'auth/invalid-email': 'O formato do email é inválido.',
        'auth/user-not-found': 'Não existe uma conta com este email.',
        'auth/wrong-password': 'Senha incorreta.',
      };

      setError(
        errorMessages[error.code] || 
        'Ocorreu um erro ao fazer login. Por favor, verifique suas credenciais e tente novamente.'
      );
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-between mb-6">
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              <span className="text-sm">Voltar</span>
            </Link>
            <div className="flex items-center gap-3">
              <Pill size={48} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Pharmyrus</h1>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Faça seu login</h2>
          <p className="mt-2 text-gray-600">Acesse sua conta para criar medicamentos inovadores</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className={`text-center p-3 rounded-md border ${
              error.includes('irrestrito') || error.includes('acesso liberado')
                ? 'text-green-600 bg-green-50 border-green-200'
                : 'text-red-600 bg-red-50 border-red-200'
            }`}>
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email"
                disabled={isLoading}
                autoComplete="email"
              />
              {/* Indicador visual para e-mails com acesso irrestrito */}
              {email.trim() && hasUnrestrictedAccess(email.trim()) && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-sm font-medium">Acesso Corporativo Irrestrito</span>
                      <div>• Plano: {UNRESTRICTED_USER_CONFIG.plan}</div>
                      <div>• {UNRESTRICTED_USER_CONFIG.totalTokens} consultas mensais</div>
                    <div>• {UNRESTRICTED_USER_CONFIG.totalTokens} consultas mensais</div>
                      <div>• Renovação automática todo mês</div>
                      <div>• Sem necessidade de verificação de e-mail</div>
                    <div>• Sem necessidade de verificação de e-mail</div>
                  </div>
                </div>
              )}
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Senha"
                disabled={isLoading}
                minLength={6}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              to="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-700"
              tabIndex={isLoading ? -1 : 0}
            >
              Esqueceu a senha?
            </Link>
            <Link 
              to="/register" 
              className="text-lg text-blue-600 hover:text-blue-700 font-medium"
              tabIndex={isLoading ? -1 : 0}
            >
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;