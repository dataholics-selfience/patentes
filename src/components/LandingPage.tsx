import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FlaskConical, Shield, Clock, TrendingUp, Users, CheckCircle, 
  ArrowRight, Phone, Mail, Globe, Zap, Target, Award,
  MessageCircle, Star, ChevronRight
} from 'lucide-react';
import { useTranslation } from '../utils/translations';
import LanguageToggle from './LanguageToggle';

const LandingPage = () => {
  const { t, language } = useTranslation();
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
      title: language === 'en' ? 'Instant Patent Verification' : 'Verificação Instantânea de Patentes',
      description: language === 'en' 
        ? 'Check pharmaceutical patent status in seconds, avoiding legal risks and million-dollar fines.'
        : 'Consulte o status de patentes farmacêuticas em segundos, evitando riscos jurídicos e multas milionárias.'
    },
    {
      icon: Clock,
      title: language === 'en' ? 'Accelerate your R&D' : 'Acelere seu P&D',
      description: language === 'en'
        ? 'Reduce research and development time by quickly identifying market opportunities.'
        : 'Reduza o tempo de pesquisa e desenvolvimento identificando rapidamente oportunidades de mercado.'
    },
    {
      icon: TrendingUp,
      title: language === 'en' ? 'Guaranteed Savings' : 'Economia Garantida',
      description: language === 'en'
        ? 'Eliminate the need for expensive consulting. Our AI offers precise analysis for a fraction of the cost.'
        : 'Elimine a necessidade de consultorias caras. Nossa IA oferece análises precisas por uma fração do custo.'
    },
    {
      icon: Globe,
      title: language === 'en' ? 'International Coverage' : 'Cobertura Internacional',
      description: language === 'en'
        ? 'Access patent information from multiple countries and jurisdictions on a single platform.'
        : 'Acesse informações de patentes de múltiplos países e jurisdições em uma única plataforma.'
    },
    {
      icon: Target,
      title: language === 'en' ? 'Risk Analysis' : 'Análise de Riscos',
      description: language === 'en'
        ? 'Identify regulatory and ethical risks before investing in product development.'
        : 'Identifique riscos regulatórios e éticos antes de investir em desenvolvimento de produtos.'
    },
    {
      icon: Zap,
      title: language === 'en' ? 'Smart Alternatives' : 'Alternativas Inteligentes',
      description: language === 'en'
        ? 'Discover analogous compounds and viable alternatives for your innovation projects.'
        : 'Descubra compostos análogos e alternativas viáveis para seus projetos de inovação.'
    }
  ];

  const benefits = [
    language === 'en' ? 'Avoid costly lawsuits for patent infringement' : 'Evite processos judiciais custosos por violação de patentes',
    language === 'en' ? 'Reduce consulting costs by up to 90%' : 'Reduza custos de consultoria em até 90%',
    language === 'en' ? 'Accelerate time-to-market for new products' : 'Acelere o time-to-market de novos produtos',
    language === 'en' ? 'Identify unexplored market opportunities' : 'Identifique oportunidades de mercado inexploradas',
    language === 'en' ? 'Minimize regulatory and ethical risks' : 'Minimize riscos regulatórios e éticos',
    language === 'en' ? 'Optimize R&D investments' : 'Otimize investimentos em P&D'
  ];

  const stats = [
    { number: "10,000+", label: language === 'en' ? 'Consultations Performed' : 'Consultas Realizadas' },
    { number: "500+", label: language === 'en' ? 'Companies Served' : 'Empresas Atendidas' },
    { number: "95%", label: language === 'en' ? 'Analysis Accuracy' : 'Precisão das Análises' },
    { number: "24/7", label: language === 'en' ? 'Availability' : 'Disponibilidade' }
  ];

  const patentAgencies = [
    {
      name: "Instituto Nacional da Propriedade Industrial",
      country: "Brasil",
      abbreviation: "INPI Brasil"
    },
    {
      name: "United States Patent and Trademark Office",
      country: "Estados Unidos",
      abbreviation: "USPTO"
    },
    {
      name: "European Patent Office",
      country: "Europa",
      abbreviation: "EPO"
    },
    {
      name: "World Intellectual Property Organization",
      country: "Internacional",
      abbreviation: "WIPO"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <img 
                src="/logo_pharmyrus.png" 
                alt="Pharmyrus" 
                className="h-12 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <LanguageToggle />
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {language === 'en' ? 'Login' : 'Entrar'}
              </Link>
              <Link 
                to="/quem-somos" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                {language === 'en' ? 'About Us' : 'Quem Somos'}
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === 'en' ? 'Start Now' : 'Começar Agora'}
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
                {language === 'en' ? 'Intelligent Analysis of' : 'Análise Inteligente de'}
                <span className="text-blue-600"> Pipelines</span>
                <span className="text-blue-600"> {language === 'en' ? 'Patents' : 'Patentes'}</span>
                <br />
                {language === 'en' ? 'Pharmaceutical' : 'Farmacêuticas'}
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                {language === 'en' 
                  ? 'Protect your company from legal risks, accelerate your R&D and save millions on consulting with our artificial intelligence platform specialized in pharmaceutical intellectual property.'
                  : 'Proteja sua empresa de riscos jurídicos, acelere seu P&D e economize milhões em consultorias com nossa plataforma de inteligência artificial especializada em propriedade intelectual farmacêutica.'
                }
              </p>
              
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 mb-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'en' ? 'Your professional email' : 'Seu email profissional'}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting 
                    ? (language === 'en' ? 'Processing...' : 'Processando...')
                    : (language === 'en' ? 'Start Now' : 'Começar Agora')
                  }
                  <ArrowRight size={20} />
                </button>
              </form>
              
              {message && (
                <p className="text-sm text-red-600">{message}</p>
              )}
              
              <p className="text-sm text-gray-500">
                ✅ {language === 'en' ? 'Professional plans' : 'Planos profissionais'} • ✅ {language === 'en' ? 'Specialized analysis' : 'Análise especializada'} • ✅ {language === 'en' ? 'Immediate access' : 'Acesso imediato'}
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
                    <p className="font-semibold text-gray-900">Pipeline Gerado</p>
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? 'Patent Verified' : 'Patente Verificada'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {language === 'en' ? 'Status: Free to use' : 'Status: Livre para uso'}
                    </p>
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
              {language === 'en' 
                ? 'Connected to Main Global Patent Agencies'
                : 'Conectado às Principais Agências de Patentes Mundiais'
              }
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'en'
                ? 'Our platform consults real-time data from the most important intellectual property organizations worldwide.'
                : 'Nossa plataforma consulta dados em tempo real das mais importantes organizações de propriedade intelectual do mundo.'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 items-center">
            {patentAgencies.map((agency, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow text-center">
                <div className="h-20 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{agency.abbreviation}</div>
                    <div className="text-xs text-gray-500">{agency.country}</div>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{agency.name}</h3>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">
              {language === 'en'
                ? 'Direct access to millions of patent records updated in real time'
                : 'Acesso direto a milhões de registros de patentes atualizados em tempo real'
              }
            </p>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>{language === 'en' ? 'Real-time data' : 'Dados em tempo real'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>{language === 'en' ? 'Global coverage' : 'Cobertura global'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span>{language === 'en' ? 'Official APIs' : 'APIs oficiais'}</span>
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
              {language === 'en'
                ? 'Why Pharmaceutical Companies Choose Our Platform?'
                : 'Por que Empresas Farmacêuticas Escolhem Nossa Plataforma?'
              }
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {language === 'en'
                ? 'Our specialized AI offers precise and instant analysis, protecting companies and accelerating innovation.'
                : 'Nossa IA especializada oferece análises precisas e instantâneas, protegendo empresas e acelerando a inovação.'
              }
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
                {language === 'en' ? 'Transform Risks into Opportunities' : 'Transforme Riscos em Oportunidades'}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {language === 'en'
                  ? 'In the pharmaceutical sector, a single patent violation can cost millions. Our platform eliminates these risks and accelerates your innovation.'
                  : 'No setor farmacêutico, uma única violação de patente pode custar milhões. Nossa plataforma elimina esses riscos e acelera sua inovação.'
                }
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
                  {language === 'en' ? 'Start Analysis Now' : 'Começar Análise Agora'}
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
                  <div className="text-sm text-gray-600">{language === 'en' ? 'Savings in 1 year' : 'Economia em 1 ano'}</div>
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
            {language === 'en' ? 'Ready to Protect Your Company?' : 'Pronto para Proteger sua Empresa?'}
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            {language === 'en'
              ? 'Join hundreds of companies that already protect their investments and accelerate innovation with our platform.'
              : 'Junte-se a centenas de empresas que já protegem seus investimentos e aceleram a inovação com nossa plataforma.'
            }
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold inline-flex items-center gap-2"
            >
              {language === 'en' ? 'Start Now' : 'Começar Agora'}
              <ArrowRight size={20} />
            </Link>
            <a 
              href="https://wa.me/5511995736666" 
              target="_blank" 
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold inline-flex items-center gap-2"
            >
              <MessageCircle size={20} />
              {language === 'en' ? 'WhatsApp Support' : 'Suporte via WhatsApp'}
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <img 
                src="/logo_pharmyrus.png" 
                alt="Pharmyrus" 
                className="h-12 w-auto mb-4"
              />
              <p className="text-gray-400 mb-6">
                {language === 'en'
                  ? 'Artificial intelligence platform specialized in pharmaceutical patent analysis and consultation, protecting companies and accelerating innovation.'
                  : 'Plataforma de inteligência artificial especializada em análise de patentes farmacêuticas, protegendo empresas e acelerando a inovação.'
                }
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="https://wa.me/5511995736666" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  <MessageCircle size={20} />
                  {language === 'en' ? 'WhatsApp Support' : 'Suporte via WhatsApp'}
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{language === 'en' ? 'Product' : 'Produto'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">{language === 'en' ? 'Start Now' : 'Começar Agora'}</Link></li>
                <li><Link to="/quem-somos" className="hover:text-white transition-colors">{language === 'en' ? 'About Us' : 'Quem Somos'}</Link></li>
                <li><a href="https://wa.me/5511995736666" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{language === 'en' ? 'Support' : 'Suporte'}</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">{language === 'en' ? 'Company' : 'Empresa'}</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="https://wa.me/5511995736666" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">{language === 'en' ? 'Contact' : 'Contato'}</a></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">{language === 'en' ? 'Terms of Use' : 'Termos de Uso'}</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">{language === 'en' ? 'Privacy' : 'Privacidade'}</Link></li>
              </ul>
            </div>
          </div>
          
          {/* Patent Agencies Logos in Footer */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="text-center mb-6">
              <h4 className="text-lg font-semibold text-gray-300 mb-4">
                {language === 'en' ? 'Connected to Main Patent Agencies' : 'Conectado às Principais Agências de Patentes'}
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {patentAgencies.map((agency, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg text-center">
                    <div className="text-lg font-bold text-blue-600">{agency.abbreviation}</div>
                    <div className="text-xs text-gray-600">{agency.country}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center text-gray-400">
              <p>&copy; 2025 {language === 'en' ? 'Patent Consultation' : 'Consulta de Patentes'}. {language === 'en' ? 'All rights reserved' : 'Todos os direitos reservados'}.</p>
              <p className="mt-2">
                <Link to="/quem-somos" className="text-gray-400 hover:text-gray-300 transition-colors">
                  DATAHOLICS - 21.976.713/0001-65
                </Link>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;