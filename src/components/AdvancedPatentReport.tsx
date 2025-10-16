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

interface Patent {
  numero: string;
  numero_completo: string;
  pais: string;
  fonte: string;
  titulo: string;
  titulo_original: string;
  data_deposito: string;
  ano_deposito: string;
  applicant: string;
  ipc: string;
  tipo_patente: string;
  relevancia: string;
  abstract: string;
  comentario_ia: string | null;
  nivel_ameaca: string | null;
  tipo_barreira: string | null;
}

interface Statistics {
  total_patentes: number;
  por_fonte: {
    INPI: number;
    EPO: number;
  };
  top_titulares: Array<{
    titular: string;
    quantidade: number;
  }>;
  timeline: Array<{
    ano: string;
    quantidade: number;
  }>;
}

interface ExecutiveReportData {
  panorama_geral: string;
  titular_dominante: string;
  barreiras_criticas: string;
  janelas_oportunidade: string;
  estrategia_extensao: string;
  formulacoes_avancadas: string;
  risco_infracao: string;
  recomendacoes: string;
}

interface KeyMetrics {
  anos_protecao_restantes: number;
  patentes_alta_ameaca: number;
  concentracao_titular: number;
}

interface AdvancedPatentData {
  estatisticas: Statistics;
  patentes: Patent[];
  relatorio_executivo: ExecutiveReportData;
  metricas_chave: KeyMetrics;
}

interface AdvancedPatentReportProps {
  data: any;
  onBack: () => void;
  environment?: 'production' | 'test';
  nomeComercial?: string;
  nomeMolecula?: string;
}

const AdvancedPatentReport = ({ data, onBack, environment = 'production', nomeComercial, nomeMolecula }: AdvancedPatentReportProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  let parsedData: AdvancedPatentData | null = null;

  console.log('🔍 AdvancedPatentReport - Dados recebidos:', data);
  console.log('🔍 Tipo dos dados:', typeof data);
  console.log('🔍 É Array?', Array.isArray(data));

  try {
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      console.log('📦 Caso 1: Array com output');
      parsedData = JSON.parse(data[0].output);
    } else if (typeof data === 'string') {
      console.log('📦 Caso 2: String JSON');
      parsedData = JSON.parse(data);
    } else if (data && typeof data === 'object') {
      console.log('📦 Caso 3: Objeto direto');

      if (data.patentes || data.estatisticas) {
        parsedData = data;
      } else if (data.analises_patentes || data.metricas_chave) {
        console.log('📦 Caso 3.1: Formato alternativo detectado');
        parsedData = {
          estatisticas: data.estatisticas || {
            total_patentes: data.analises_patentes?.length || 0,
            por_fonte: {
              INPI: data.analises_patentes?.filter((p: any) => p.fonte === 'INPI').length || 0,
              EPO: data.analises_patentes?.filter((p: any) => p.fonte === 'EPO').length || 0
            },
            top_titulares: data.top_titulares || [],
            timeline: data.timeline || []
          },
          patentes: data.analises_patentes || [],
          relatorio_executivo: data.relatorio_executivo || {},
          metricas_chave: data.metricas_chave || {}
        };
      }
    }

    console.log('✅ Dados parseados:', parsedData);
  } catch (error) {
    console.error('❌ Erro ao parsear dados:', error);
    console.error('❌ Dados que causaram erro:', JSON.stringify(data, null, 2));
  }

  if (!parsedData || (!parsedData.patentes && !parsedData.analises_patentes)) {
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

  const patentes = parsedData.patentes || parsedData.analises_patentes || [];
  const estatisticas = parsedData.estatisticas || {
    total_patentes: patentes.length,
    por_fonte: {
      INPI: patentes.filter((p: any) => p.fonte === 'INPI').length,
      EPO: patentes.filter((p: any) => p.fonte === 'EPO').length
    },
    top_titulares: parsedData.top_titulares || [],
    timeline: parsedData.timeline || []
  };
  const relatorio_executivo = parsedData.relatorio_executivo || {};
  const metricas_chave = parsedData.metricas_chave || {
    anos_protecao_restantes: 0,
    patentes_alta_ameaca: 0,
    concentracao_titular: 0
  };

  console.log('📊 Dados extraídos - Patentes:', patentes.length, 'itens');
  console.log('📊 Estatísticas:', estatisticas);
  console.log('📊 Métricas chave:', metricas_chave);

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
