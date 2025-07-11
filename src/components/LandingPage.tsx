import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FlaskConical, Shield, Clock, TrendingUp, Users, CheckCircle, 
  ArrowRight, Phone, Mail, Globe, Zap, Target, Award,
  MessageCircle, Star, ChevronRight
} from 'lucide-react';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      // Redirect to registration with pre-filled email
      window.location.href = `/register?email=${encodeURIComponent(email.trim())}`;
    } catch (error) {
      console.error('Error:', error);
      setMessage('Erro ao processar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Verificação Instantânea de Patentes",
      description: "Consulte o status de patentes farmacêuticas em segundos, evitando riscos jurídicos e multas milionárias."
    },
    {
      icon: Clock,
      title: "Acelere seu P&D",
      description: "Reduza o tempo de pesquisa e desenvolvimento identificando rapidamente oportunidades de mercado."
    },
    {
      icon: TrendingUp,
      title: "Economia Garantida",
      description: "Elimine a necessidade de consultorias caras. Nossa IA oferece análises precisas por uma fração do custo."
    },
    {
      icon: Globe,
      title: "Cobertura Internacional",
      description: "Acesse informações de patentes de múltiplos países e jurisdições em uma única plataforma."
    },
    {
      icon: Target,
      title: "Análise de Riscos",
      description: "Identifique riscos regulatórios e éticos antes de investir em desenvolvimento de produtos."
    },
    {
      icon: Zap,
      title: "Alternativas Inteligentes",
      description: "Descubra compostos análogos e alternativas viáveis para seus projetos de inovação."
    }
  ];

  const benefits = [
    "Evite processos judiciais custosos por violação de patentes",
    "Reduza custos de consultoria em até 90%",
    "Acelere o time-to-market de novos produtos",
    "Identifique oportunidades de mercado inexploradas",
    "Minimize riscos regulatórios e éticos",
    "Otimize investimentos em P&D"
  ];

  const stats = [
    { number: "10,000+", label: "Consultas Realizadas" },
    { number: "500+", label: "Empresas Atendidas" },
    { number: "95%", label: "Precisão das Análises" },
    { number: "24/7", label: "Disponibilidade" }
  ];

  const patentAgencies = [
    {
      name: "Instituto Nacional da Propriedade Industrial",
      country: "Brasil",
      logo: "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=200&h=100",
      alt: "INPI Brasil",
      size: "extra-reduced" // 40% smaller total (20% + 20% additional)
    },
    {
      name: "United States Patent and Trademark Office",
      country: "Estados Unidos",
      logo: "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=200&h=100",
      alt: "USPTO",
      size: "normal"
    },
    {
      name: "European Patent Office",
      country: "Europa",
      logo: "https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=200&h=100",
      alt: "EPO",
      size: "extra-reduced" // 40% smaller total (20% + 20% additional)
    },
    {
      name: "World Intellectual Property Organization",
      country: "Internacional",
      logo: "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=200&h=100",
      alt: "WIPO",
      size: "normal"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <FlaskConical size={32} className="text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Consulta de Patentes</span>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Entrar
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Começar Grátis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
                Verifique Patentes
                <span className="text-blue-600"> Farmacêuticas</span>
                <br />em Segundos
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Proteja sua empresa de riscos jurídicos, acelere seu P&D e economize milhões 
                em consultorias com nossa plataforma de inteligência artificial especializada 
                em propriedade intelectual farmacêutica.
              </p>
              
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email profissional"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processando...' : 'Começar Grátis'}
                  <ArrowRight size={20} />
                </button>
              </form>
              
              {message && (
                <p className="text-sm text-red-600">{message}</p>
              )}
              
              <p className="text-sm text-gray-500">
                ✅ 10 consultas gratuitas • ✅ Sem cartão de crédito • ✅ Acesso imediato
              </p>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Laboratório farmacêutico moderno"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Patente Verificada</p>
                    <p className="text-sm text-gray-600">Status: Livre para uso</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Patent Agencies Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Conectado às Principais Agências de Patentes Mundiais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa plataforma consulta dados em tempo real das mais importantes 
              organizações de propriedade intelectual do mundo.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 items-center">
            {patentAgencies.map((agency, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow text-center">
                <div className="h-20 flex items-center justify-center mb-4">
                  <img
                    src={agency.logo}
                    alt={agency.alt}
                    className={`max-h-full max-w-full object-contain ${
                      agency.size === 'extra-reduced' ? 'scale-[0.64]' : // 80% of 80% = 64%
                      agency.size === 'reduced' ? 'scale-80' : ''
                    }`}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{agency.name}</h3>
                <p className="text-xs text-gray-600">{agency.country}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              Acesso direto a milhões de registros de patentes atualizados em tempo real
            </p>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Dados em tempo real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Cobertura global</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>APIs oficiais</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que Empresas Farmacêuticas Escolhem Nossa Plataforma?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa IA especializada oferece análises precisas e instantâneas, 
              protegendo empresas e acelerando a inovação.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <feature.icon className="text-blue-600" size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Transforme Riscos em Oportunidades
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                No setor farmacêutico, uma única violação de patente pode custar milhões. 
                Nossa plataforma elimina esses riscos e acelera sua inovação.
              </p>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-green-600 mt-1 flex-shrink-0" size={20} />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold inline-flex items-center gap-2"
                >
                  Começar Análise Gratuita
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Pesquisador analisando dados"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">R$ 2.5M</div>
                  <div className="text-sm text-gray-600">Economia em 1 ano</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para Proteger sua Empresa?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já protegem seus investimentos 
            e aceleram a inovação com nossa plataforma.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold inline-flex items-center gap-2"
            >
              Começar Grátis Agora
              <ArrowRight size={20} />
            </Link>
            <a 
              href="https://wa.me/5511995736666" 
              target="_blank" 
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold inline-flex items-center gap-2"
            >
              <MessageCircle size={20} />
              Suporte via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <FlaskConical size={32} className="text-blue-400" />
                <span className="text-2xl font-bold">Consulta de Patentes</span>
              </div>
              <p className="text-gray-400 mb-6">
                Plataforma de inteligência artificial especializada em análise de patentes 
                farmacêuticas, protegendo empresas e acelerando a inovação.
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="https://wa.me/5511995736666" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  <MessageCircle size={20} />
                  Suporte via WhatsApp
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Começar Grátis</Link></li>
                <li><Link to="/plans" className="hover:text-white transition-colors">Planos</Link></li>
                <li><a href="https://wa.me/5511995736666" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Suporte</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://wa.me/5511995736666" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contato</a></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Patent Agencies Logos in Footer */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-300 mb-4">Conectado às Principais Agências de Patentes</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center justify-items-center">
                {patentAgencies.map((agency, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg">
                    <img
                      src={agency.logo}
                      alt={agency.alt}
                      className={`h-8 object-contain opacity-80 hover:opacity-100 transition-opacity ${
                        agency.size === 'extra-reduced' ? 'scale-[0.64]' : // 80% of 80% = 64%
                        agency.size === 'reduced' ? 'scale-80' : ''
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center text-gray-400">
              <p>&copy; 2025 Consulta de Patentes. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;