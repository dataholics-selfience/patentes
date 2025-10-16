export const dashboardData = {
  meta: {
    timestamp: "2025-10-16T04:43:08.438Z",
    molecula: "semaglutida",
    nome_comercial: "Ozempic",
    classe_terapeutica: "agonista do receptor GLP-1"
  },

  estatisticas: {
    total_patentes: 294,
    por_fonte: {
      INPI: 24,
      EPO: 270
    },
    por_tipo: {
      formulacao: 17,
      uso_terapeutico: 6,
      combinacao: 1
    },
    top_titulares: [
      { titular: "LILLY CO ELI [US]", quantidade: 31 },
      { titular: "NOVO NORDISK AS [DK]", quantidade: 15 },
      { titular: "DAEWOONG PHARMACEUTICAL CO LTD [KR]", quantidade: 5 },
      { titular: "TAIWAN SEMICONDUCTOR MFG CO LTD [TW]", quantidade: 5 },
      { titular: "LILLY CO ELI", quantidade: 4 },
      { titular: "INVENTAGE LAB INC [KR]", quantidade: 4 },
      { titular: "PEGBIO CO LTD [CN]", quantidade: 4 },
      { titular: "REGENERON PHARMA", quantidade: 4 },
      { titular: "REGENERON PHARMA [US]", quantidade: 4 },
      { titular: "GENENTECH INC [US]", quantidade: 3 }
    ],
    timeline: [
      { ano: "2025", quantidade: 221 },
      { ano: "2024", quantidade: 29 },
      { ano: "2023", quantidade: 12 },
      { ano: "2022", quantidade: 5 },
      { ano: "2021", quantidade: 11 },
      { ano: "2020", quantidade: 3 },
      { ano: "2019", quantidade: 2 },
      { ano: "2018", quantidade: 5 },
      { ano: "2017", quantidade: 3 }
    ]
  },

  metricas_chave: {
    anos_protecao_restantes: 8,
    patentes_alta_ameaca: 10,
    concentracao_titular: 27
  },

  relatorio_executivo: {
    panorama_geral: "O portfólio de patentes da semaglutida é robusto, com 294 patentes, das quais 25 foram selecionadas para análise detalhada. A diversificação em formulações e aplicações terapêuticas fortalece a posição competitiva da droga no mercado.",
    titular_dominante: "NOVO NORDISK AS se destaca como o principal titular, com um portfólio significativo que limita a concorrência e reforça sua liderança no desenvolvimento de agonistas do GLP-1.",
    barreiras_criticas: "As patentes mais restritivas envolvem formulações líquidas e combinações terapêuticas que protegem diretamente o uso da semaglutida no tratamento de diabetes e outros distúrbios metabólicos, uma parte crítica do portfólio.",
    janelas_oportunidade: "Existem janelas de oportunidade em patentes que estão próximas ao término, assim como em composições que poderiam ser exploradas por genéricos. A proteção de formulações de liberação sustentada é uma área que deve ser monitorada.",
    recomendacoes: [
      "Monitorar continuamente o portfólio de patentes concorrentes, especialmente em tecnologias de liberação prolongada.",
      "Avaliar a possibilidade de novas combinações e formulações que poderiam expandir as indicações de uso da semaglutida.",
      "Considerar estratégias de evergreening, como a exploração de novos sais e polimorfos para revitalizar o portfólio.",
      "Investir no desenvolvimento de formulações que promovam adesão ao tratamento, focando em inovações que diferenciam o produto no mercado."
    ]
  },

  patentesAnalisadas: [
    {
      numero_completo: "ZA202503388B",
      pais: "ZA",
      ano_deposito: "2025",
      titulo: "SEMAGLUTIDE IN MEDICAL THERAPY",
      applicant: "NOVO NORDISK AS [DK]",
      ipc: "A61K 9",
      fonte: "EPO",
      comentario_ia: "A patente de semaglutida em terapia médica representa um avanço significativo no tratamento, com potencial de abrir novos mercados, especialmente em peso e controle de diabetes.",
      nivel_ameaca: "Alta",
      tipo_barreira: "Uso Terapêutico"
    },
    {
      numero_completo: "BR 11 2025 013928 2",
      pais: "BR",
      ano_deposito: "2024",
      titulo: "FORMULAÇÃO FARMACÊUTICA LÍQUIDA, DISPOSITIVOS PARA LIBERAÇÃO SUSTENTADA",
      applicant: null,
      ipc: "A61K 9/00",
      fonte: "INPI",
      comentario_ia: "Formulações farmacêuticas líquidas com liberação sustentada são cruciais para a diferenciação de produtos no mercado de agonistas do GLP-1.",
      nivel_ameaca: "Alta",
      tipo_barreira: "Formulação"
    },
    {
      numero_completo: "BR 11 2025 000056 0",
      pais: "BR",
      ano_deposito: "2023",
      titulo: "FORMULAÇÃO DE MICROESFERAS DE LIBERAÇÃO SUSTENTADA",
      applicant: null,
      ipc: "A61K 9/16",
      fonte: "INPI",
      comentario_ia: "Microesferas de liberação sustentada podem adicionar valor à semaglutida, oferecendo novas opções de administração.",
      nivel_ameaca: "Alta",
      tipo_barreira: "Formulação"
    },
    {
      numero_completo: "BR 11 2023 025201 6",
      pais: "BR",
      ano_deposito: "2022",
      titulo: "COMPOSIÇÃO DE FORMULAÇÃO DE LIBERAÇÃO SUSTENTADA",
      applicant: null,
      ipc: "A61K 9/16",
      fonte: "INPI",
      comentario_ia: "Componente estratégico que potencialmente limita a competição na entrega eficaz da semaglutida.",
      nivel_ameaca: "Alta",
      tipo_barreira: "Formulação"
    },
    {
      numero_completo: "BR 11 2022 013795 8",
      pais: "BR",
      ano_deposito: "2021",
      titulo: "COMPOSIÇÃO FARMACÊUTICA LÍQUIDA COMPREENDENDO SEMAGLUTIDA",
      applicant: null,
      ipc: "A61K 9/00",
      fonte: "INPI",
      comentario_ia: "Formulação central que bloqueia concorrentes em potencial. Barreira crítica para preservação do market share.",
      nivel_ameaca: "Alta",
      tipo_barreira: "Formulação"
    }
  ]
};
