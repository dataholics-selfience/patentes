import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Terms = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 mr-4"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">📄 Termos e Condições de Uso – Plataforma de Consulta de Patentes com IA</h1>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700">
          <p className="text-gray-600 mb-6">
            <strong>Última atualização:</strong> 26 de junho de 2025<br />
            <strong>Empresa responsável:</strong> DATAHOLICS LTDA | CNPJ: 13.205.200/0001-36
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p className="mb-6">
            Ao acessar ou utilizar a plataforma de Inteligência Artificial ("Plataforma") para análise, consulta e notificação sobre patentes, o usuário declara que leu, entendeu e concorda integralmente com estes Termos de Uso e com a Política de Privacidade.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Descrição dos Serviços</h2>
          <p className="mb-4">A Plataforma utiliza inteligência artificial e dados públicos para:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Consultar registros de patentes de bases nacionais e internacionais;</li>
            <li>Indicar status de expiração, vigência ou similaridade de patentes;</li>
            <li>Auxiliar usuários na análise de tendências tecnológicas e propriedade industrial;</li>
            <li>Emitir alertas sobre vencimento ou possíveis conflitos de registros.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Uso Permitido</h2>
          <p className="mb-4">A Plataforma destina-se a:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Usuários profissionais, empresas, inventores e pesquisadores interessados em propriedade intelectual;</li>
            <li>Fins informativos, estratégicos e de apoio à tomada de decisão.</li>
          </ul>
          <p className="mb-6">
            O uso da Plataforma não substitui pareceres técnicos, jurídicos ou registros oficiais junto aos órgãos competentes (ex: INPI, EPO, USPTO).
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Fontes de Dados e Limitações</h2>
          <p className="mb-4">A Plataforma se baseia em dados provenientes de fontes públicas e/ou APIs externas, tais como:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Instituto Nacional da Propriedade Industrial (INPI – Brasil)</li>
            <li>United States Patent and Trademark Office (USPTO)</li>
            <li>European Patent Office (EPO)</li>
            <li>World Intellectual Property Organization (WIPO)</li>
          </ul>
          <p className="mb-6">
            Apesar do esforço para manter os dados atualizados, a Plataforma não garante a precisão em tempo real nem a completude absoluta das informações. Para efeitos legais, consulte sempre a fonte oficial.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Privacidade e Proteção de Dados</h2>
          <p className="mb-4">
            A Plataforma coleta e trata dados pessoais nos termos da Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018).
          </p>
          <p className="mb-4">O usuário concorda com o tratamento de seus dados, conforme descrito na Política de Privacidade, com finalidades como:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Autenticação e controle de acesso;</li>
            <li>Personalização da experiência;</li>
            <li>Geração de relatórios e sugestões personalizadas com base em seu uso.</li>
          </ul>
          <p className="mb-6">
            O usuário poderá solicitar, a qualquer tempo, a exclusão ou portabilidade de seus dados.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Obrigações do Usuário</h2>
          <p className="mb-4">O usuário compromete-se a:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Utilizar a Plataforma de forma ética e conforme a legislação vigente;</li>
            <li>Não utilizar a Plataforma para obtenção de vantagem indevida, cópia de conteúdo protegido ou engenharia reversa de algoritmos;</li>
            <li>Não violar direitos de propriedade intelectual de terceiros a partir das informações obtidas.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">7. Direitos Autorais e Propriedade Intelectual</h2>
          <p className="mb-4">
            Os algoritmos, modelo de IA, interface, layout, estrutura de banco de dados e demais elementos da Plataforma são de titularidade exclusiva da DATAHOLICS LTDA e protegidos pela legislação vigente.
          </p>
          <p className="mb-6">
            O uso da Plataforma não concede qualquer licença ou cessão de direitos sobre software, marcas ou conteúdos utilizados ou exibidos.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">8. Limitações de Responsabilidade</h2>
          <p className="mb-4">A Plataforma é fornecida "como está", e a DATAHOLICS LTDA:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2">
            <li>Não se responsabiliza por decisões tomadas com base nas análises automatizadas;</li>
            <li>Não garante a disponibilidade contínua dos serviços;</li>
            <li>Não responde por indisponibilidades causadas por terceiros, APIs ou fontes externas.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">9. Alterações nos Termos</h2>
          <p className="mb-6">
            Estes Termos podem ser atualizados a qualquer momento. O uso contínuo da Plataforma após eventuais alterações será considerado como aceitação tácita dos novos termos.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-4">10. Foro</h2>
          <p className="mb-8">
            Fica eleito o foro da comarca de São Paulo/SP, com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir dúvidas ou controvérsias decorrentes destes Termos.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
            <p className="text-blue-800 font-medium">
              📞 <strong>Contato e Suporte:</strong> Para dúvidas sobre estes termos ou exercício de direitos relacionados aos seus dados, entre em contato conosco através do WhatsApp: 
              <a href="https://wa.me/5511995736666" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 ml-1">
                +55 11 99573-6666
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;