import { useState, useEffect } from 'react';
import { ArrowLeft, FileText, AlertTriangle, Shield, CheckCircle, TrendingUp, Calendar, MessageSquare } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import PatentChatAgent from './PatentChatAgent';

interface PatentAnalysis {
  numero_completo: string;
  comentario_ia: string;
  nivel_ameaca: string;
  tipo_barreira: string;
}

interface ExecutiveReport {
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
  analises_patentes: PatentAnalysis[];
  relatorio_executivo: ExecutiveReport;
  metricas_chave: KeyMetrics;
}

interface AdvancedPatentReportProps {
  data: any;
  onBack: () => void;
}

const AdvancedPatentReport = ({ data, onBack }: AdvancedPatentReportProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  let parsedData: AdvancedPatentData | null = null;

  try {
    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      parsedData = JSON.parse(data[0].output);
    } else if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    } else if (data.analises_patentes) {
      parsedData = data;
    }
  } catch (error) {
    console.error('Erro ao parsear dados:', error);
  }

  if (!parsedData || !parsedData.analises_patentes) {
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
          <p className="text-red-600">Erro ao carregar os dados da análise de patentes.</p>
        </div>
      </div>
    );
  }

  const { analises_patentes, relatorio_executivo, metricas_chave } = parsedData;

  useEffect(() => {
    const saveToFirebase = async () => {
      if (!auth.currentUser || !parsedData) return;

      try {
        await addDoc(collection(db, 'patentes-avançadas'), {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email || '',
          analises_patentes: parsedData.analises_patentes,
          relatorio_executivo: parsedData.relatorio_executivo,
          metricas_chave: parsedData.metricas_chave,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('Erro ao salvar consulta no Firebase:', error);
      }
    };

    saveToFirebase();
  }, [parsedData]);

  const getThreatColor = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'alta':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'média':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'baixa':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const countByThreat = {
    alta: analises_patentes.filter(p => p.nivel_ameaca.toLowerCase() === 'alta').length,
    média: analises_patentes.filter(p => p.nivel_ameaca.toLowerCase() === 'média').length,
    baixa: analises_patentes.filter(p => p.nivel_ameaca.toLowerCase() === 'baixa').length
  };

  const countByBarrier = analises_patentes.reduce((acc, patent) => {
    const barrier = patent.tipo_barreira || 'Outros';
    acc[barrier] = (acc[barrier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft size={20} />
          Voltar à Busca
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatório de Análise de Patentes</h1>
        <p className="text-gray-600">Análise completa do panorama de propriedade intelectual</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Anos de Proteção</h3>
            <Calendar className="text-blue-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{metricas_chave.anos_protecao_restantes}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Patentes Alta Ameaça</h3>
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{metricas_chave.patentes_alta_ameaca}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Concentração Titular</h3>
            <TrendingUp className="text-purple-600" size={20} />
          </div>
          <p className="text-3xl font-bold text-gray-900">{metricas_chave.concentracao_titular}%</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-blue-600" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Relatório Executivo</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Panorama Geral</h3>
            <p className="text-gray-700 leading-relaxed">{relatorio_executivo.panorama_geral}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Titular Dominante</h3>
            <p className="text-gray-700 leading-relaxed">{relatorio_executivo.titular_dominante}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Barreiras Críticas</h3>
            <p className="text-gray-700 leading-relaxed">{relatorio_executivo.barreiras_criticas}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Janelas de Oportunidade</h3>
            <p className="text-gray-700 leading-relaxed">{relatorio_executivo.janelas_oportunidade}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Estratégia de Extensão</h3>
            <p className="text-gray-700 leading-relaxed">{relatorio_executivo.estrategia_extensao}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Formulações Avançadas</h3>
            <p className="text-gray-700 leading-relaxed">{relatorio_executivo.formulacoes_avancadas}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Risco de Infração</h3>
            <p className="text-gray-700 leading-relaxed">{relatorio_executivo.risco_infracao}</p>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recomendações</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{relatorio_executivo.recomendacoes}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Distribuição por Nível de Ameaça</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-700">Alta Ameaça</span>
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-red-600 mt-2">{countByThreat.alta}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-700">Média Ameaça</span>
              <Shield className="text-yellow-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{countByThreat.média}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-700">Baixa Ameaça</span>
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <p className="text-3xl font-bold text-green-600 mt-2">{countByThreat.baixa}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tipos de Barreiras</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(countByBarrier).map(([barrier, count]) => (
            <div key={barrier} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">{barrier}</p>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Análise Detalhada de Patentes ({analises_patentes.length})
        </h2>
        <div className="space-y-4">
          {analises_patentes.map((patent, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getThreatColor(patent.nivel_ameaca)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-mono text-lg font-bold">{patent.numero_completo}</h3>
                  <div className="flex gap-2 mt-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getThreatColor(patent.nivel_ameaca)}`}>
                      {patent.nivel_ameaca}
                    </span>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                      {patent.tipo_barreira}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed">{patent.comentario_ia}</p>
            </div>
          ))}
        </div>
      </div>

      <PatentChatAgent
        patentHistory={parsedData}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};

export default AdvancedPatentReport;
