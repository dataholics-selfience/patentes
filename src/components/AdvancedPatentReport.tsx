import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import PatentChatAgent from './PatentChatAgent';
import HeroCards from './patent-report/HeroCards';
import TimelineChart from './patent-report/TimelineChart';
import TopHolders from './patent-report/TopHolders';
import ExecutiveReport from './patent-report/ExecutiveReport';
import DistributionMetrics from './patent-report/DistributionMetrics';
import PatentsTable from './patent-report/PatentsTable';
import { parsePatentData, type ParsedPatentData, type Patent } from '../utils/patentDataParser';

interface AdvancedPatentReportProps {
  data: any;
  onBack: () => void;
  environment?: 'production' | 'test';
  nomeComercial?: string;
  nomeMolecula?: string;
}

const AdvancedPatentReport = ({ data, onBack, environment = 'production', nomeComercial, nomeMolecula }: AdvancedPatentReportProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const parsedData = parsePatentData(data);

  if (!parsedData || !parsedData.patentes) {
    console.error('❌ Dados inválidos ou ausentes');
    console.error('❌ parsedData:', parsedData);

    return (
      <div className="max-w-7xl mx-auto p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} />
          Voltar à Busca
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600 font-semibold mb-2">Erro ao carregar os dados da análise de patentes.</p>
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-red-500 hover:text-red-700">
              Ver detalhes técnicos
            </summary>
            <pre className="mt-2 p-3 bg-white rounded border border-red-300 text-xs overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  const patentes = parsedData.patentes;
  const estatisticas = parsedData.estatisticas;
  const relatorio_executivo = parsedData.relatorio_executivo;
  const metricas_chave = parsedData.metricas_chave;

  console.log('📊 Dados extraídos:');
  console.log('  - Patentes:', patentes.length, 'itens');
  console.log('  - Top Titulares:', estatisticas.top_titulares?.length || 0);
  console.log('  - Timeline:', estatisticas.timeline?.length || 0);
  console.log('  - Métricas:', metricas_chave);

  useEffect(() => {
    const saveToFirebase = async () => {
      if (!auth.currentUser || !parsedData) return;

      try {
        await addDoc(collection(db, 'patentes-avançadas'), {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email || '',
          nome_comercial: nomeComercial || '',
          nome_molecula: nomeMolecula || '',
          estatisticas: parsedData.estatisticas,
          patentes: parsedData.patentes,
          relatorio_executivo: parsedData.relatorio_executivo,
          metricas_chave: parsedData.metricas_chave,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Erro ao salvar consulta no Firebase:', error);
      }
    };

    saveToFirebase();
  }, [parsedData, nomeComercial, nomeMolecula]);

  const uniqueTitulares = Array.from(
    new Set(patentes.map((p: any) => p.applicant || p.titular || 'Desconhecido').filter(Boolean))
  ).sort();

  return (
    <div className="max-w-[1600px] mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Voltar à Busca</span>
        </button>

        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg"
        >
          <MessageSquare size={20} />
          Conversar com Agente
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Análise de Patentes</h1>
        <p className="text-gray-600">
          {nomeComercial && nomeMolecula
            ? `${nomeComercial} (${nomeMolecula})`
            : 'Panorama completo de propriedade intelectual'}
        </p>
      </div>

      <HeroCards
        totalPatentes={estatisticas.total_patentes || 0}
        inpi={estatisticas.por_fonte?.INPI || 0}
        epo={estatisticas.por_fonte?.EPO || 0}
        anosProtecao={metricas_chave.anos_protecao_restantes || 0}
        patentesAltaAmeaca={metricas_chave.patentes_alta_ameaca || 0}
        titularDominante={estatisticas.top_titulares?.[0]?.titular || 'N/A'}
        concentracaoTitular={metricas_chave.concentracao_titular || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <TimelineChart timeline={estatisticas.timeline || []} />
        </div>
        <div>
          <TopHolders
            holders={estatisticas.top_titulares || []}
            totalPatentes={estatisticas.total_patentes}
          />
        </div>
      </div>

      {relatorio_executivo && Object.keys(relatorio_executivo).length > 0 && (
        <div className="mb-6">
          <ExecutiveReport relatorio={relatorio_executivo} />
        </div>
      )}

      <DistributionMetrics
        patents={patentes}
        inpi={estatisticas.por_fonte?.INPI || 0}
        epo={estatisticas.por_fonte?.EPO || 0}
      />

      <PatentsTable
        patents={patentes}
        titulares={uniqueTitulares}
      />

      <PatentChatAgent
        patentHistory={parsedData}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        environment={environment}
      />
    </div>
  );
};

export default AdvancedPatentReport;
