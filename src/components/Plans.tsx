import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Microscope, Pill, Dna, Sparkles, ArrowLeft, Shield, Lock } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { PlanType } from '../types';

const SecurityBadge = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="flex items-center gap-2 text-gray-600">
    <Icon size={20} className="text-green-500" />
    <span>{text}</span>
  </div>
);

const Plans = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);

  const plans: PlanType[] = [
    {
      id: 'especialista',
      name: 'Especialista',
      icon: Dna,
      description: 'Plano para especialistas em desenvolvimento farmacêutico',
      tokens: 50,
      price: 13000,
      highlight: true,
      stripeLink: 'https://buy.stripe.com/4gMaEXg1h2Mw8N9fHlfYY0z'
    },
    {
      id: 'analista',
      name: 'Analista',
      icon: Pill,
      description: 'Plano para analistas de P&D farmacêutico',
      tokens: 20,
      price: 7500,
      highlight: false,
      stripeLink: 'https://buy.stripe.com/eVq14ng1hevefbx8eTfYY0y'
    },
    {
      id: 'diretor',
      name: 'Diretor',
      icon: Sparkles,
      description: 'Plano para diretores de P&D que gerenciam portfólios de medicamentos',
      tokens: 100,
      price: 25000,
      highlight: false,
      stripeLink: 'https://buy.stripe.com/8x26oH3ev0Eofbx8eTfYY0A'
    }
  ];

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setCurrentPlan(userDoc.data().plan);
        }
      } catch (error) {
        console.error('Error fetching user plan:', error);
      }
    };

    fetchUserPlan();
  }, []);

  const handlePlanClick = async (plan: PlanType) => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    try {
      // Record plan click in Firestore
      await setDoc(doc(collection(db, 'planClicks'), crypto.randomUUID()), {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        planId: plan.id,
        clickedAt: new Date().toISOString(),
        transactionId: crypto.randomUUID()
      });

      // Open Stripe checkout in the same window
      window.location.href = plan.stripeLink;
    } catch (error) {
      console.error('Error recording plan click:', error);
      setError('Erro ao processar sua solicitação. Por favor, tente novamente.');
    }
  };

  const isPlanDisabled = (planName: string) => {
    if (!currentPlan) return false;
    return currentPlan.toLowerCase().replace(' ', '-') === planName;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-12">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Escolha seu Plano</h1>
            <p className="text-gray-600 text-lg">Desbloqueie o poder da análise de patentes com nossos planos especializados</p>
           
          </div>
          <div className="w-8" />
        </div>

        {error && (
          <div className="text-red-600 text-center mb-4 bg-red-50 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isDisabled = isPlanDisabled(plan.id);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl p-6 border-2 ${
                  plan.highlight ? 'border-blue-500 transform hover:scale-105' : 'border-gray-200 hover:border-blue-300'
                } transition-all duration-300 shadow-sm hover:shadow-lg`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                    Mais Popular
                  </div>
                )}
                
                <div className="flex justify-center mb-6">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Icon size={32} className="text-blue-600" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">{plan.name}</h3>
                <p className="text-gray-600 text-center mb-6 h-24">{plan.description}</p>
                
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-blue-600">{plan.tokens} pipelines/mês</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Sem renovação automática
                  </div>
                </div>

                <button
                  onClick={() => !isDisabled && handlePlanClick(plan)}
                  disabled={isDisabled}
                  className={`block w-full py-3 px-4 rounded-lg text-white text-center font-bold transition-colors ${
                    isDisabled
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isDisabled ? 'Plano Atual' : 'Começar Agora'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-6 rounded-xl">
            <SecurityBadge icon={Shield} text="Pagamento Seguro" />
          </div>
          <div className="bg-gray-50 p-6 rounded-xl">
            <SecurityBadge icon={Lock} text="Certificado PCI DSS" />
          </div>
          <div className="bg-gray-50 p-6 rounded-xl">
            <SecurityBadge icon={Shield} text="Proteção Antifraude" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;