import { useEffect } from 'react';
import { ArrowLeft, Award, Globe, Users, Target, Lightbulb, Heart } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const QuemSomos = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const achievements = [
    {
      icon: Award,
      title: "Prêmio Papis.io",
      description: "Melhor empresa de Inteligência Artificial"
    },
    {
      icon: Globe,
      title: "Programa Visa - Vale do Silício",
      description: "Aceleração na Google Launchpad em São Francisco"
    },
    {
      icon: Target,
      title: "FF17 Hong Kong",
      description: "Melhor empresa de finanças latino-americana"
    },
    {
      icon: Users,
      title: "NTT Data Tokyo",
      description: "4º lugar entre 26 startups internacionais"
    },
    {
      icon: Lightbulb,
      title: "Spark Centre Toronto",
      description: "Exploração de mercado no Canadá"
    }
  ];

  const stats = [
    { number: "2016", label: "Fundação" },
    { number: "1M+", label: "Empresas Impactadas" },
    { number: "5+", label: "Prêmios Internacionais" },
    { number: "4", label: "Países de Atuação" }
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-4xl font-bold text-gray-900">Quem Somos</h1>
        </div>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Company Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Globe size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Empresa Desenvolvedora</h2>
                <p className="text-blue-600 font-semibold">DATAHOLICS - 21.976.713/0001-65</p>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-6">
                Empresa premiada internacionalmente por sua atuação aplicada a finanças, pioneira em dados alternativos e IA no Brasil. 
                Desde 2016, atendeu empresas como Vivo, Stone, Sicoob, impactando mais de 1 milhão de pequenas empresas e pessoas de baixa renda.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Recebeu premiações variadas no Brasil, como o prêmio Papis.io - Melhor empresa de Inteligência Artificial, 
                Programa da Visa no Vale do Silício, onde ficou por um mês sendo acelerada na Google Launchpad em São Francisco. 
                Venceu como a melhor empresa de finanças latino americana na competição FF17 em Hong Kong na China e foi a quarta 
                colocada em uma competição de 26 startups internacionais na Open Innovation Contest da empresa NTT Data em Tóquio no Japão. 
                Passou um mês e meio em Toronto no Canadá explorando o mercado pela Spark Centre, aceleradora local.
              </p>
              
              <p className="text-lg leading-relaxed">
                Atualmente tem focado em desenvolver soluções para a área da saúde: Uma plataforma para consulta de patentes de medicamentos 
                e criação completa de pipeline para o desenvolvimento de novas drogas, a Pharmyrus. Está ainda idealizando uma plataforma 
                de medicina integrativa que entende o problema do paciente e propõe tratamentos alternativos.
              </p>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Principais Conquistas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <achievement.icon className="text-blue-600" size={24} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{achievement.title}</h4>
                <p className="text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Founder Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Heart size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Idealizador do Projeto</h2>
                <p className="text-purple-600 font-semibold text-xl">Daniel Mendes</p>
              </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-700">
              <p className="text-lg leading-relaxed mb-6">
                Trabalha desde 1996 com internet e desde 2006 pesquisa o uso de dados alternativos e IA para desenvolvimento 
                de soluções tecnológicas. Mantém projetos com técnicas avançadas de Big Data aliadas à inteligência artificial 
                e preditiva, promovendo melhorias operacionais significativas.
              </p>
              
              <p className="text-lg leading-relaxed mb-6">
                Criador de uma metodologia própria de UX baseada em Design Thinking e Data Science, busca sempre aliar 
                performance técnica à satisfação humana.
              </p>
              
              <p className="text-lg leading-relaxed">
                Está se especializando e focando no uso de toda sua bagagem e experiência para desenvolvimento de soluções 
                ligadas à saúde.
              </p>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-6">Nossa Visão</h2>
            <p className="text-xl leading-relaxed max-w-4xl mx-auto">
              Democratizar o acesso à inovação farmacêutica através da inteligência artificial, 
              permitindo que empresas de todos os tamanhos possam desenvolver medicamentos 
              que transformem vidas e melhorem a saúde global.
            </p>
          </div>
        </section>
      </div>

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
                IA avançada que cria pipelines completos de produtos farmacêuticos, 
                transformando ideias em estratégias de mercado prontas para execução.
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="https://wa.me/5511995736666" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.109"/>
                  </svg>
                  Suporte via WhatsApp
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Criar Pipeline</Link></li>
                <li><Link to="/quem-somos" className="hover:text-white transition-colors">Quem Somos</Link></li>
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
          
          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="text-center text-gray-400">
              <p>&copy; 2025 Pharmyrus. Todos os direitos reservados.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default QuemSomos;