import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { FlaskConical, ArrowLeft } from 'lucide-react';
import { useTranslation } from '../../utils/i18n.tsx';

const Login = () => {
  const { t } = useTranslation();
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
      setError(t.invalidEmail);
      return false;
    }
    if (trimmedPassword.length < 6) {
      setError(t.passwordTooShort);
      return false;
    }
    return true;
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

      if (!user.emailVerified) {
        await auth.signOut();
        setError('Por favor, verifique seu email antes de fazer login.');
        navigate('/verify-email');
        return;
      }

      setError('');
      navigate('/dashboard', { replace: true });
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessages: { [key: string]: string } = {
        'auth/invalid-credential': 'Email ou senha incorretos. Por favor, verifique suas credenciais e tente novamente.',
        'auth/user-disabled': 'Esta conta foi desativada. Entre em contato com o suporte.',
        'auth/too-many-requests': 'Muitas tentativas de login. Por favor, aguarde alguns minutos e tente novamente.',
        'auth/network-request-failed': t.networkError,
        'auth/invalid-email': t.invalidEmail,
        'auth/user-not-found': t.userNotFound,
        'auth/wrong-password': t.wrongPassword,
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
              <span className="text-sm">{t.back}</span>
            </Link>
            <div className="flex items-center gap-3">
              <FlaskConical size={48} className="text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{t.patentConsultation}</h1>
            </div>
            <div className="w-16"></div> {/* Spacer for centering */}
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t.loginTitle}</h2>
          <p className="mt-2 text-gray-600">{t.loginDescription}</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-200">
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
                placeholder={t.emailPlaceholder}
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t.passwordPlaceholder}
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
              {isLoading ? t.loggingIn : t.loginButton}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <Link 
              to="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-700"
              tabIndex={isLoading ? -1 : 0}
            >
              {t.forgotPassword}
            </Link>
            <Link 
              to="/register" 
              className="text-lg text-blue-600 hover:text-blue-700 font-medium"
              tabIndex={isLoading ? -1 : 0}
            >
              {t.createAccount}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;