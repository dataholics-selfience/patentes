import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { Pill } from 'lucide-react';

const EVOLUTION_API_CONFIG = {
  instances: [
    { baseUrl: 'https://evolution-api-production-f719.up.railway.app', instanceKey: '215D70C6CC83-4EE4-B55A-DE7D4146CBF1' },
    { baseUrl: 'https://evolution-api-2-production.up.railway.app', instanceKey: '215D70C6CC83-4EE4-B55A-DE7D4146CBF2' },
    { baseUrl: 'https://evolution-api-3-production.up.railway.app', instanceKey: '215D70C6CC83-4EE4-B55A-DE7D4146CBF3' }
  ]
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    company: '',
    email: searchParams.get('email') || '',
    phone: '',
    password: '',
    terms: false
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const formatPhoneForEvolution = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Brazilian numbers
    if (cleanPhone.startsWith('55')) {
      return cleanPhone;
    } else if (cleanPhone.length === 11 && cleanPhone.startsWith('11')) {
      return '55' + cleanPhone;
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('11')) {
      return '55' + cleanPhone;
    } else if (cleanPhone.length === 11) {
      return '55' + cleanPhone;
    } else if (cleanPhone.length === 10) {
      return '55' + cleanPhone;
    }
    
    // International numbers - validate format
    if (cleanPhone.length >= 10 && cleanPhone.length <= 15) {
      return cleanPhone;
    }
    
    return '';
  };

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Brazilian numbers
    if (cleanPhone.startsWith('55') && cleanPhone.length === 13) return true;
    if (cleanPhone.length === 11 || cleanPhone.length === 10) return true;
    
    // International numbers
    if (cleanPhone.length >= 10 && cleanPhone.length <= 15) return true;
    
    return false;
  };

  const getRandomInstance = () => {
    const randomIndex = Math.floor(Math.random() * EVOLUTION_API_CONFIG.instances.length);
    return EVOLUTION_API_CONFIG.instances[randomIndex];
  };

  const sendWhatsAppVerification = async (phone: string, verificationLink: string) => {
    const formattedPhone = formatPhoneForEvolution(phone);
    
    if (!formattedPhone) {
      console.error('Invalid phone number format:', phone);
      return false;
    }

    const instance = getRandomInstance();
    
    const message = `🔬 *Consulta de Patentes - Ativação de Conta*

Olá! Sua conta foi criada com sucesso.

Para ativar sua conta e começar a usar nossa plataforma de análise de patentes farmacêuticas, clique no link abaixo:

${verificationLink}

✅ *Benefícios da sua conta:*
• 10 consultas gratuitas
• Análise instantânea de patentes
• Verificação de riscos regulatórios
• Identificação de compostos alternativos

⚡ *Acesso imediato após ativação!*

Precisa de ajuda? Responda esta mensagem.

---
*Consulta de Patentes - Protegendo sua inovação*`;

    try {
      const evolutionPayload = {
        number: formattedPhone,
        text: message
      };

      console.log('Sending WhatsApp verification via Evolution API:', {
        instance: instance.baseUrl,
        payload: evolutionPayload
      });

      const response = await fetch(
        `${instance.baseUrl}/message/sendText/${instance.instanceKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': instance.instanceKey
          },
          body: JSON.stringify(evolutionPayload)
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log('WhatsApp verification sent successfully:', responseData);
        return true;
      } else {
        const errorText = await response.text();
        console.error('Evolution API error:', errorText);
        return false;
      }
    } catch (error) {
      console.error('Error sending WhatsApp verification:', error);
      return false;
    }
  };

  const checkDeletedUser = async (email: string) => {
    const q = query(
      collection(db, 'deletedUsers'),
      where('email', '==', email.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.terms) {
      setError('Você precisa aceitar os termos de uso para continuar.');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Por favor, insira um número de telefone válido.');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      const isDeleted = await checkDeletedUser(formData.email);
      if (isDeleted) {
        setError('Email e dados já excluídos da plataforma');
        setIsLoading(false);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email.trim(), 
        formData.password
      );
      const user = userCredential.user;

      const transactionId = crypto.randomUUID();
      const now = new Date();
      const expirationDate = new Date(now.setMonth(now.getMonth() + 1));

      const userData = {
        uid: user.uid,
        name: formData.name.trim(),
        cpf: formData.cpf.trim(),
        company: formData.company.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        plan: 'Pesquisador',
        acceptedTerms: true,
        createdAt: new Date().toISOString(),
        termsAcceptanceId: transactionId
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      // NOVO: Plano Pesquisador não existe mais - 0 consultas
      await setDoc(doc(db, 'tokenUsage', user.uid), {
        uid: user.uid,
        email: formData.email.trim().toLowerCase(),
        plan: 'Pesquisador',
        totalTokens: 0, // SEM CONSULTAS GRATUITAS - REDIRECIONAR PARA PLANOS
        usedTokens: 0,
        lastUpdated: new Date().toISOString(),
        expirationDate: expirationDate.toISOString()
      });

      await setDoc(doc(collection(db, 'gdprCompliance'), transactionId), {
        uid: user.uid,
        email: formData.email.trim().toLowerCase(),
        type: 'terms_acceptance',
        acceptedTerms: true,
        acceptedAt: new Date().toISOString(),
        transactionId
      });

      await setDoc(doc(collection(db, 'gdprCompliance'), crypto.randomUUID()), {
        uid: user.uid,
        email: formData.email.trim().toLowerCase(),
        type: 'registration',
        registeredAt: new Date().toISOString(),
        transactionId: crypto.randomUUID()
      });

      // Redirecionar diretamente para planos - não há mais plano gratuito
      navigate('/plans');

      // Wait a moment for the email verification link to be generated
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate verification link (this would typically come from Firebase Auth)
      const verificationLink = `${window.location.origin}/verify-email`;

      // Send WhatsApp verification with the link
      if (formData.phone.trim()) {
        try {
          await sendWhatsAppVerification(formData.phone.trim(), verificationLink);
        } catch (whatsappError) {
          console.error('WhatsApp verification failed:', whatsappError);
          // Don't block registration if WhatsApp fails
        }
      }

      navigate('/verify-email');
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso. Por favor, use outro email ou faça login.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Email inválido. Por favor, verifique o email informado.');
      } else if (error.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao criar conta. Por favor, tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img 
              src="/logo-pharmyrus.jpg" 
              alt="Pharmyrus" 
              className="h-12 w-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
          <p className="mt-2 text-gray-600">Registre-se para criar medicamentos inovadores</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
          <div className="space-y-4">
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome completo"
            />
            <input
              type="text"
              name="cpf"
              required
              value={formData.cpf}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="CPF"
            />
            <input
              type="text"
              name="company"
              required
              value={formData.company}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Empresa"
            />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email"
            />
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Telefone/WhatsApp (ex: 11999887766)"
            />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Senha (mínimo 6 caracteres)"
              minLength={6}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                required
              />
              <label className="ml-2 block text-sm text-gray-700">
                Aceito os <Link to="/terms" className="text-blue-600 hover:text-blue-700">termos de uso e política de privacidade</Link>
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !formData.terms}
              className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                isLoading || !formData.terms ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-lg text-blue-600 hover:text-blue-700 font-medium">
              Já tem uma conta? Faça login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;