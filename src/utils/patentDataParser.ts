interface PatentAnalysis {
  numero_completo: string;
  comentario_ia: string;
  nivel_ameaca: string;
  tipo_barreira: string;
}

interface RawPatent {
  numero_completo?: string;
  numero?: string;
  pais?: string;
  country?: string;
  fonte?: string;
  titulo?: string;
  titulo_original?: string;
  data_deposito?: string;
  date?: string;
  ano_deposito?: string;
  ano?: string;
  applicant?: string;
  titular?: string;
  ipc?: string;
  tipo_patente?: string;
  relevancia?: string;
  abstract?: string;
  comentario_ia?: string;
  nivel_ameaca?: string;
  tipo_barreira?: string;
}

export type { PatentAnalysis, RawPatent };

export interface Patent {
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

export interface PatentStatistics {
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

export interface ExecutiveReport {
  panorama_geral?: string;
  titular_dominante?: string;
  barreiras_criticas?: string;
  janelas_oportunidade?: string;
  estrategia_extensao?: string;
  formulacoes_avancadas?: string;
  risco_infracao?: string;
  recomendacoes?: string;
}

export interface KeyMetrics {
  anos_protecao_restantes: number;
  patentes_alta_ameaca: number;
  concentracao_titular: number;
}

export interface ParsedPatentData {
  estatisticas: PatentStatistics;
  patentes: Patent[];
  relatorio_executivo: ExecutiveReport;
  metricas_chave: KeyMetrics;
}

export const parsePatentData = (data: any): ParsedPatentData | null => {
  console.log('🔍 parsePatentData - Dados recebidos:', data);
  console.log('🔍 Tipo dos dados:', typeof data);
  console.log('🔍 É Array?', Array.isArray(data));

  try {
    let rawData: any = null;

    if (Array.isArray(data) && data.length > 0 && data[0].output) {
      console.log('📦 Caso 1: Array com output');
      rawData = JSON.parse(data[0].output);
    } else if (typeof data === 'string') {
      console.log('📦 Caso 2: String JSON');
      rawData = JSON.parse(data);
    } else if (data && typeof data === 'object') {
      console.log('📦 Caso 3: Objeto direto');
      rawData = data;
    }

    if (!rawData) {
      console.error('❌ Não foi possível extrair rawData');
      return null;
    }

    if (rawData.patentes || rawData.estatisticas) {
      console.log('✅ Formato padrão detectado');
      return rawData as ParsedPatentData;
    }

    if (rawData.analises_patentes || rawData.metricas_chave) {
      console.log('✅ Formato alternativo detectado - Convertendo...');
      console.log('🔍 Análises de IA:', rawData.analises_patentes?.length || 0);
      console.log('🔍 Patentes completas:', rawData.patentes_completas?.length || 0);

      const analisesIA: PatentAnalysis[] = rawData.analises_patentes || [];
      const patentesCompletas: RawPatent[] = rawData.patentes_completas || [];

      const analisesMap = new Map<string, Omit<PatentAnalysis, 'numero_completo'>>(
        analisesIA.map((a) => [
          a.numero_completo?.trim().toUpperCase(),
          {
            comentario_ia: a.comentario_ia,
            nivel_ameaca: a.nivel_ameaca,
            tipo_barreira: a.tipo_barreira
          }
        ])
      );

      console.log('✅ Map de análises criado com', analisesMap.size, 'entradas');

      const fonteDados = patentesCompletas.length > 0 ? 'patentes_completas' : 'analises_patentes';
      console.log(`🔄 Usando fonte de dados: ${fonteDados}`);

      const patentes: Patent[] = (patentesCompletas.length > 0 ? patentesCompletas : analisesIA).map((p, index) => {
        const numeroCompleto = p.numero_completo || p.numero || 'N/A';
        const prefixo = numeroCompleto.length >= 2 ? numeroCompleto.substring(0, 2).toUpperCase() : '';
        const isBR = prefixo === 'BR' || prefixo === 'PI';
        const numeroKey = numeroCompleto.trim().toUpperCase();
        const analise = analisesMap.get(numeroKey);

        if (index < 3) {
          console.log(`📋 Patente #${index + 1}:`, {
            numeroCompleto,
            temAnalise: !!analise,
            fonte: p.fonte || (isBR ? 'INPI' : 'EPO'),
            nivel_ameaca: analise?.nivel_ameaca || p.nivel_ameaca
          });
        }

        return {
          numero: numeroCompleto,
          numero_completo: numeroCompleto,
          pais: p.pais || p.country || (isBR ? 'BR' : (prefixo || 'Internacional')),
          fonte: p.fonte || (isBR ? 'INPI' : 'EPO'),
          titulo: p.titulo || p.titulo_original || 'Título não disponível',
          titulo_original: p.titulo_original || p.titulo || 'Título não disponível',
          data_deposito: p.data_deposito || p.date || 'N/A',
          ano_deposito: p.ano_deposito || p.ano || (
            p.data_deposito && p.data_deposito !== 'N/A'
              ? new Date(p.data_deposito).getFullYear().toString()
              : (p.date ? new Date(p.date).getFullYear().toString() : 'N/A')
          ),
          applicant: p.applicant || p.titular || 'Titular não informado',
          ipc: p.ipc || 'N/A',
          tipo_patente: p.tipo_patente || 'N/A',
          relevancia: p.relevancia || 'N/A',
          abstract: p.abstract || 'Resumo não disponível',
          comentario_ia: analise?.comentario_ia || p.comentario_ia || null,
          nivel_ameaca: analise?.nivel_ameaca || p.nivel_ameaca || null,
          tipo_barreira: analise?.tipo_barreira || p.tipo_barreira || null
        };
      });

      console.log('✅ Patentes processadas:', patentes.length);
      console.log('✅ Com análise de IA:', patentes.filter(p => p.comentario_ia).length);

      const estatisticas = calculateStatistics(patentes);
      const metricas_chave = calculateKeyMetrics(patentes, rawData.metricas_chave, estatisticas);

      console.log('📊 Estatísticas finais:', {
        total: estatisticas.total_patentes,
        INPI: estatisticas.por_fonte.INPI,
        EPO: estatisticas.por_fonte.EPO,
        top_titulares: estatisticas.top_titulares.length,
        timeline: estatisticas.timeline.length,
        alta_ameaca: metricas_chave.patentes_alta_ameaca,
        concentracao: metricas_chave.concentracao_titular
      });

      return {
        estatisticas,
        patentes,
        relatorio_executivo: rawData.relatorio_executivo || {},
        metricas_chave
      };
    }

    console.error('❌ Formato de dados não reconhecido');
    return null;
  } catch (error) {
    console.error('❌ Erro ao parsear dados:', error);
    return null;
  }
};

const calculateStatistics = (patentes: Patent[]): PatentStatistics => {
  const titularesMap = new Map<string, number>();
  const anoMap = new Map<string, number>();
  let inpiCount = 0;
  let epoCount = 0;

  patentes.forEach((p) => {
    const titular = p.applicant;
    if (titular && titular !== 'Desconhecido' && titular !== 'Titular não informado') {
      titularesMap.set(titular, (titularesMap.get(titular) || 0) + 1);
    }

    const ano = p.ano_deposito;
    if (ano && ano !== 'N/A') {
      anoMap.set(ano, (anoMap.get(ano) || 0) + 1);
    }

    if (p.fonte === 'INPI' || p.pais === 'BR') {
      inpiCount++;
    } else if (p.fonte === 'EPO' || (p.pais && p.pais !== 'BR')) {
      epoCount++;
    } else if (p.numero_completo) {
      const prefixo = p.numero_completo.substring(0, 2).toUpperCase();
      if (prefixo === 'BR' || prefixo === 'PI') {
        inpiCount++;
      } else {
        epoCount++;
      }
    }
  });

  const top_titulares = Array.from(titularesMap.entries())
    .map(([titular, quantidade]) => ({ titular, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  const timeline = Array.from(anoMap.entries())
    .map(([ano, quantidade]) => ({ ano, quantidade }))
    .sort((a, b) => parseInt(a.ano) - parseInt(b.ano));

  return {
    total_patentes: patentes.length,
    por_fonte: {
      INPI: inpiCount,
      EPO: epoCount || (patentes.length - inpiCount)
    },
    top_titulares,
    timeline
  };
};

const calculateKeyMetrics = (
  patentes: Patent[],
  rawMetrics: any,
  statistics: PatentStatistics
): KeyMetrics => {
  const patentesAltaAmeaca = patentes.filter(p => p.nivel_ameaca?.toLowerCase() === 'alta').length;
  const concentracao = statistics.top_titulares.length > 0
    ? Math.round((statistics.top_titulares[0].quantidade / patentes.length) * 100)
    : 0;

  return {
    anos_protecao_restantes: rawMetrics?.anos_protecao_restantes || 0,
    patentes_alta_ameaca: rawMetrics?.patentes_alta_ameaca || patentesAltaAmeaca,
    concentracao_titular: rawMetrics?.concentracao_titular || concentracao
  };
};
