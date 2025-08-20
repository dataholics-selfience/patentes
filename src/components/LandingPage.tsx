import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Pill, Shield, Clock, TrendingUp, Users, CheckCircle, 
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
      title: "Análise Completa de Patentes",
      description: "Verificação global de propriedade intelectual e identificação de oportunidades para novos medicamentos."
    },
    {
      icon: Clock,
      title: "Pipeline Acelerado",
      description: "Reduza o tempo de desenvolvimento de medicamentos de anos para meses com nossa IA especializada."
    },
    {
      icon: TrendingUp,
      title: "Estudos de Mercado Completos",
      description: "TAM SAM SOM, análise SWOT, precificação e estratégia de entrada automáticos."
    },
    {
      icon: Globe,
      title: "Aprovação Regulatória",
      description: "Documentação completa para FDA, EMA, ANVISA e outras agências internacionais."
    },
    {
      icon: Target,
      title: "Medicamentos Inovadores",
      description: "IA cria novas formulações e compostos com base em gaps de mercado identificados."
    },
    {
      icon: Zap,
      title: "Documentação Automática",
      description: "Gere automaticamente toda documentação necessária para registro de patentes e aprovações."
    }
  ];

  const benefits = [
    "Crie medicamentos inovadores em meses ao invés de anos",
    "Reduza custos de P&D em até 80% com IA especializada",
    "Acelere aprovações regulatórias com documentação automática",
    "Identifique gaps de mercado e oportunidades inexploradas",
    "Minimize riscos de desenvolvimento com análise preditiva",
    "Otimize investimentos com projeções financeiras precisas"
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
              <Pill size={32} className="text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Pharmyrus</span>
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
                Começar Agora
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
                Crie Medicamentos
                <span className="text-blue-600"> Inovadores</span>
                <br />com IA
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Pipeline completo de desenvolvimento farmacêutico: análise de patentes, preços, 
                estudos de mercado, SWOT, TAM SAM SOM, criação de medicamentos inovadores e 
                documentação para registro com nossa IA especializada.
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
                  {isSubmitting ? 'Processando...' : 'Começar Agora'}
                  <ArrowRight size={20} />
                </button>
              </form>
              
              {message && (
                <p className="text-sm text-red-600">{message}</p>
              )}
              
              <p className="text-sm text-gray-500">
                ✅ Pipeline completo • ✅ Medicamentos inovadores • ✅ Documentação regulatória
              </p>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Desenvolvimento de medicamentos com IA"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Pill className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Medicamento Criado</p>
                    <p className="text-sm text-gray-600">Pipeline: Completo</p>
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
              Conectado às Principais Agências Farmacêuticas Mundiais
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa IA consulta dados em tempo real das mais importantes 
              agências regulatórias e de propriedade intelectual farmacêutica do mundo.
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
              Por que Empresas Farmacêuticas Escolhem o Pharmyrus?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa IA especializada cria pipelines completos de medicamentos, 
              acelerando a inovação e reduzindo riscos no desenvolvimento farmacêutico.
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
                Revolucione o Desenvolvimento Farmacêutico
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                No setor farmacêutico, o desenvolvimento de um novo medicamento pode levar 15 anos e custar bilhões. 
                O Pharmyrus acelera esse processo com IA especializada e análise completa.
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
                  Criar Primeiro Pipeline
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3786126/pexels-photo-3786126.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Laboratório de desenvolvimento farmacêutico"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">15 meses</div>
                  <div className="text-sm text-gray-600">Tempo economizado</div>
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
            Pronto para Revolucionar seu P&D?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a empresas farmacêuticas que já aceleram o desenvolvimento 
            de medicamentos com o Pharmyrus.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold inline-flex items-center gap-2"
            >
              Começar Agora
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
                <Pill size={32} className="text-blue-400" />
                <span className="text-2xl font-bold">Pharmyrus</span>
              </div>
              <p className="text-gray-400 mb-6">
                IA completa para criação de novos medicamentos: análise de patentes, estudos de mercado, 
                desenvolvimento de formulações inovadoras e documentação regulatória automática.
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
                <li><Link to="/register" className="hover:text-white transition-colors">Começar Agora</Link></li>
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
              <p>&copy; 2025 Pharmyrus - IA para Criação Completa de Novos Medicamentos. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;