import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { onAuthStateChanged, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { FlaskConical } from 'lucide-react';
import { hasUnrestrictedAccess, UNRESTRICTED_USER_CONFIG } from '../../utils/unrestrictedEmails';
import { getDoc } from 'firebase/firestore';

const EmailVerification = () => {
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      // Verificar se o usuário tem acesso irrestrito
      if (hasUnrestrictedAccess(user.email)) {
        console.log(`✅ Usuário com acesso irrestrito detectado: ${user.email}`);
        
        try {
          const setupSuccess = await setupUnrestrictedUser(user);
          
          if (setupSuccess) {
            navigate('/');
          } else {
            setError('Erro ao configurar conta com acesso irrestrito. Por favor, tente novamente.');
          }
        } catch (error) {
          console.error('Error setting up unrestricted user:', error);
          setError('Erro ao ativar conta. Por favor, tente novamente.');
        }
        return;
      }

      // Verificação normal de e-mail para outros usuários
      if (user.emailVerified) {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            activated: true,
            activatedAt: new Date().toISOString(),
            email: user.email,
            uid: user.uid
          }, { merge: true });

          await setDoc(doc(db, 'gdprCompliance', 'emailVerified'), {
            uid: user.uid,
            email: user.email,
            emailVerified: true,
            verifiedAt: new Date().toISOString(),
            type: 'email_verification',
            transactionId: crypto.randomUUID()
          });

          // Verificar se o usuário tem tokens disponíveis
          const tokenDoc = await getDoc(doc(db, 'tokenUsage', user.uid));
          if (tokenDoc.exists()) {
            const tokenData = tokenDoc.data();
            const remainingTokens = tokenData.totalTokens - tokenData.usedTokens;
            
            if (remainingTokens > 0) {
              navigate('/');
            } else {
              // Sem tokens - redirecionar para planos
              navigate('/plans');
            }
          } else {
            // Sem dados de token - redirecionar para planos
            navigate('/plans');
          }
        } catch (error) {
          console.error('Error updating user activation:', error);
          setError('Erro ao ativar conta. Por favor, tente novamente.');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    let timer: number;
    if (countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    if (resendDisabled) return;

    try {
      if (auth.currentUser) {
        // Verificar novamente se tem acesso irrestrito antes de enviar e-mail
        if (hasUnrestrictedAccess(auth.currentUser.email)) {
          setError('Sua conta tem acesso irrestrito. Redirecionando...');
          navigate('/');
          return;
        }

        await sendEmailVerification(auth.currentUser);
        setError('Email de verificação reenviado. Por favor, verifique sua caixa de entrada.');
        setResendDisabled(true);
        setCountdown(300);
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      if (error instanceof Error && error.message.includes('too-many-requests')) {
        setError('Muitas tentativas. Por favor, aguarde alguns minutos antes de tentar novamente.');
        setResendDisabled(true);
        setCountdown(300);
      } else {
        setError('Erro ao reenviar email. Por favor, tente novamente.');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Verificar se o usuário atual tem acesso irrestrito
  const currentUserHasUnrestrictedAccess = auth.currentUser && hasUnrestrictedAccess(auth.currentUser.email);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="flex items-center justify-center mb-6">
            <img 
              src="/logo_pharmyrus.png" 
              alt="Pharmyrus" 
              className="h-16 w-auto"
            />
          </div>
          
          {currentUserHasUnrestrictedAccess ? (
            <>
              <h2 className="text-2xl font-bold text-green-600">Acesso Corporativo Liberado</h2>
              <p className="mt-2 text-gray-600">
                Sua conta tem acesso irrestrito à plataforma. 
                Configurando estrutura completa...
              </p>
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-700">
                  <div className="font-medium mb-2">Configuração Automática:</div>
                  <div className="text-left space-y-1">
                    <div>• Plano: {UNRESTRICTED_USER_CONFIG.plan}</div>
                    • {UNRESTRICTED_USER_CONFIG.totalTokens} consultas mensais<br/>
                    <div>• Empresa: {UNRESTRICTED_USER_CONFIG.company}</div>
                    • Renovação automática todo mês<br/>
                    • Sem necessidade de verificação de e-mail
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900">Verifique seu email</h2>
              <p className="mt-2 text-gray-600">
                Por favor, verifique seu email para ativar sua conta. 
                Você receberá um link de verificação em breve.
              </p>
            </>
          )}
        </div>

        {error && (
          <div className={`p-4 rounded-md border ${
            error.includes('irrestrito') || error.includes('Redirecionando') || error.includes('Configurando')
              ? 'bg-green-50 text-green-600 border-green-200'
              : 'bg-red-50 text-red-600 border-red-200'
          }`}>
            {error}
          </div>
        )}

        {!currentUserHasUnrestrictedAccess && (
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voltar para o login
            </button>

            <div className="text-center">
              <button
                onClick={handleResendEmail}
                disabled={resendDisabled}
                className="text-blue-600 hover:text-blue-700 text-lg"
              >
                {resendDisabled 
                  ? `Aguarde ${formatTime(countdown)} para reenviar` 
                  : 'Reenviar email de verificação'
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;