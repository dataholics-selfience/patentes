// Sistema de tradução automática para dados do dashboard
export interface DashboardTranslations {
  [key: string]: {
    pt: string;
    en: string;
  };
}

// Traduções para campos do dashboard
export const dashboardFieldTranslations: DashboardTranslations = {
  // Campos principais
  'produto_proposto': { pt: 'Produto Proposto', en: 'Proposed Product' },
  'score_oportunidade': { pt: 'Score de Oportunidade', en: 'Opportunity Score' },
  'classificacao': { pt: 'Classificação', en: 'Classification' },
  'justificativa': { pt: 'Justificativa', en: 'Justification' },
  'resumo_executivo': { pt: 'Resumo Executivo', en: 'Executive Summary' },
  'analise_mercado': { pt: 'Análise de Mercado', en: 'Market Analysis' },
  'estrategia_entrada': { pt: 'Estratégia de Entrada', en: 'Entry Strategy' },
  'riscos_identificados': { pt: 'Riscos Identificados', en: 'Identified Risks' },
  'oportunidades': { pt: 'Oportunidades', en: 'Opportunities' },
  'recomendacoes': { pt: 'Recomendações', en: 'Recommendations' },
  'proximos_passos': { pt: 'Próximos Passos', en: 'Next Steps' },
  'investimento_estimado': { pt: 'Investimento Estimado', en: 'Estimated Investment' },
  'retorno_esperado': { pt: 'Retorno Esperado', en: 'Expected Return' },
  'prazo_desenvolvimento': { pt: 'Prazo de Desenvolvimento', en: 'Development Timeline' },
  'concorrencia': { pt: 'Concorrência', en: 'Competition' },
  'barreiras_entrada': { pt: 'Barreiras de Entrada', en: 'Entry Barriers' },
  'vantagens_competitivas': { pt: 'Vantagens Competitivas', en: 'Competitive Advantages' },
  
  // Status e classificações
  'Excelente': { pt: 'Excelente', en: 'Excellent' },
  'Muito Bom': { pt: 'Muito Bom', en: 'Very Good' },
  'Bom': { pt: 'Bom', en: 'Good' },
  'Regular': { pt: 'Regular', en: 'Fair' },
  'Ruim': { pt: 'Ruim', en: 'Poor' },
  'Alto': { pt: 'Alto', en: 'High' },
  'Médio': { pt: 'Médio', en: 'Medium' },
  'Baixo': { pt: 'Baixo', en: 'Low' },
  'Sim': { pt: 'Sim', en: 'Yes' },
  'Não': { pt: 'Não', en: 'No' },
  'Ativo': { pt: 'Ativo', en: 'Active' },
  'Inativo': { pt: 'Inativo', en: 'Inactive' },
  'Vigente': { pt: 'Vigente', en: 'Active' },
  'Expirada': { pt: 'Expirada', en: 'Expired' },
  'Permitida': { pt: 'Permitida', en: 'Permitted' },
  'Restrita': { pt: 'Restrita', en: 'Restricted' },
  
  // Países
  'Brasil': { pt: 'Brasil', en: 'Brazil' },
  'Estados Unidos': { pt: 'Estados Unidos', en: 'United States' },
  'União Europeia': { pt: 'União Europeia', en: 'European Union' },
  'Argentina': { pt: 'Argentina', en: 'Argentina' },
  'México': { pt: 'México', en: 'Mexico' },
  'Canadá': { pt: 'Canadá', en: 'Canada' },
  'Japão': { pt: 'Japão', en: 'Japan' },
  'China': { pt: 'China', en: 'China' },
  'Alemanha': { pt: 'Alemanha', en: 'Germany' },
  'França': { pt: 'França', en: 'France' },
  'Reino Unido': { pt: 'Reino Unido', en: 'United Kingdom' },
  'Austrália': { pt: 'Austrália', en: 'Australia' },
  'Índia': { pt: 'Índia', en: 'India' },
  
  // Categorias farmacêuticas
  'Antidiabéticos e Antiobesidade': { pt: 'Antidiabéticos e Antiobesidade', en: 'Antidiabetics and Anti-obesity' },
  'Cardiovasculares': { pt: 'Cardiovasculares', en: 'Cardiovascular' },
  'Antibióticos': { pt: 'Antibióticos', en: 'Antibiotics' },
  'Antivirais': { pt: 'Antivirais', en: 'Antivirals' },
  'Oncológicos': { pt: 'Oncológicos', en: 'Oncological' },
  'Neurológicos': { pt: 'Neurológicos', en: 'Neurological' },
  'Imunológicos': { pt: 'Imunológicos', en: 'Immunological' },
  'Respiratórios': { pt: 'Respiratórios', en: 'Respiratory' },
  'Gastrointestinais': { pt: 'Gastrointestinais', en: 'Gastrointestinal' },
  'Dermatológicos': { pt: 'Dermatológicos', en: 'Dermatological' },
  'Oftalmológicos': { pt: 'Oftalmológicos', en: 'Ophthalmological' },
  'Analgésicos': { pt: 'Analgésicos', en: 'Analgesics' },
  'Anti-inflamatórios': { pt: 'Anti-inflamatórios', en: 'Anti-inflammatory' },
  'Hormônios': { pt: 'Hormônios', en: 'Hormones' },
  'Vitaminas e Suplementos': { pt: 'Vitaminas e Suplementos', en: 'Vitamins and Supplements' },
  
  // Termos médicos comuns
  'diabetes': { pt: 'diabetes', en: 'diabetes' },
  'obesidade': { pt: 'obesidade', en: 'obesity' },
  'hipertensão': { pt: 'hipertensão', en: 'hypertension' },
  'câncer': { pt: 'câncer', en: 'cancer' },
  'infecção': { pt: 'infecção', en: 'infection' },
  'dor': { pt: 'dor', en: 'pain' },
  'inflamação': { pt: 'inflamação', en: 'inflammation' },
  'depressão': { pt: 'depressão', en: 'depression' },
  'ansiedade': { pt: 'ansiedade', en: 'anxiety' },
  'asma': { pt: 'asma', en: 'asthma' },
  
  // Termos de negócio
  'mercado': { pt: 'mercado', en: 'market' },
  'investimento': { pt: 'investimento', en: 'investment' },
  'retorno': { pt: 'retorno', en: 'return' },
  'lucro': { pt: 'lucro', en: 'profit' },
  'receita': { pt: 'receita', en: 'revenue' },
  'custo': { pt: 'custo', en: 'cost' },
  'desenvolvimento': { pt: 'desenvolvimento', en: 'development' },
  'pesquisa': { pt: 'pesquisa', en: 'research' },
  'inovação': { pt: 'inovação', en: 'innovation' },
  'estratégia': { pt: 'estratégia', en: 'strategy' },
  'competição': { pt: 'competição', en: 'competition' },
  'concorrência': { pt: 'concorrência', en: 'competition' },
  
  // Frases comuns
  'Não informado': { pt: 'Não informado', en: 'Not informed' },
  'Não disponível': { pt: 'Não disponível', en: 'Not available' },
  'Em desenvolvimento': { pt: 'Em desenvolvimento', en: 'In development' },
  'Aprovado': { pt: 'Aprovado', en: 'Approved' },
  'Pendente': { pt: 'Pendente', en: 'Pending' },
  'Rejeitado': { pt: 'Rejeitado', en: 'Rejected' },
  'Em análise': { pt: 'Em análise', en: 'Under review' },
  'Finalizado': { pt: 'Finalizado', en: 'Completed' },
  'Em andamento': { pt: 'Em andamento', en: 'In progress' },
  'Planejado': { pt: 'Planejado', en: 'Planned' },
  'Cancelado': { pt: 'Cancelado', en: 'Cancelled' },
  
  // Meses
  'janeiro': { pt: 'janeiro', en: 'January' },
  'fevereiro': { pt: 'fevereiro', en: 'February' },
  'março': { pt: 'março', en: 'March' },
  'abril': { pt: 'abril', en: 'April' },
  'maio': { pt: 'maio', en: 'May' },
  'junho': { pt: 'junho', en: 'June' },
  'julho': { pt: 'julho', en: 'July' },
  'agosto': { pt: 'agosto', en: 'August' },
  'setembro': { pt: 'setembro', en: 'September' },
  'outubro': { pt: 'outubro', en: 'October' },
  'novembro': { pt: 'novembro', en: 'November' },
  'dezembro': { pt: 'dezembro', en: 'December' }
};

// Função para traduzir texto automaticamente
export const translateText = (text: string, targetLanguage: 'pt' | 'en'): string => {
  if (!text || typeof text !== 'string') return text;
  
  // Se o idioma alvo é português, retornar o texto original
  if (targetLanguage === 'pt') return text;
  
  let translatedText = text;
  
  // Aplicar traduções palavra por palavra
  Object.entries(dashboardFieldTranslations).forEach(([key, translations]) => {
    const ptText = translations.pt;
    const enText = translations.en;
    
    // Substituição case-insensitive
    const regex = new RegExp(`\\b${ptText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    translatedText = translatedText.replace(regex, enText);
  });
  
  return translatedText;
};

// Função para traduzir objetos recursivamente
export const translateObject = (obj: any, targetLanguage: 'pt' | 'en'): any => {
  if (!obj || targetLanguage === 'pt') return obj;
  
  if (typeof obj === 'string') {
    return translateText(obj, targetLanguage);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => translateObject(item, targetLanguage));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const translatedObj: any = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      // Traduzir a chave se necessário
      const translatedKey = translateText(key, targetLanguage);
      // Traduzir o valor recursivamente
      translatedObj[translatedKey] = translateObject(value, targetLanguage);
    });
    
    return translatedObj;
  }
  
  return obj;
};

// Função específica para traduzir dados do dashboard
export const translateDashboardData = (dashboardData: any, targetLanguage: 'pt' | 'en'): any => {
  if (!dashboardData || targetLanguage === 'pt') return dashboardData;
  
  // Criar uma cópia profunda do objeto para não modificar o original
  const translatedData = JSON.parse(JSON.stringify(dashboardData));
  
  // Traduzir recursivamente todo o objeto
  return translateObject(translatedData, targetLanguage);
};

// Traduções específicas para títulos e seções do dashboard
export const dashboardSectionTranslations = {
  pt: {
    'Produto Proposto': 'Produto Proposto',
    'Score de Oportunidade': 'Score de Oportunidade',
    'Análise de Mercado': 'Análise de Mercado',
    'Estratégia de Entrada': 'Estratégia de Entrada',
    'Riscos e Oportunidades': 'Riscos e Oportunidades',
    'Recomendações': 'Recomendações',
    'Próximos Passos': 'Próximos Passos',
    'Investimento e Retorno': 'Investimento e Retorno',
    'Cronograma': 'Cronograma',
    'Análise Competitiva': 'Análise Competitiva',
    'Resumo Executivo': 'Resumo Executivo'
  },
  en: {
    'Produto Proposto': 'Proposed Product',
    'Score de Oportunidade': 'Opportunity Score',
    'Análise de Mercado': 'Market Analysis',
    'Estratégia de Entrada': 'Entry Strategy',
    'Riscos e Oportunidades': 'Risks and Opportunities',
    'Recomendações': 'Recommendations',
    'Próximos Passos': 'Next Steps',
    'Investimento e Retorno': 'Investment and Return',
    'Cronograma': 'Timeline',
    'Análise Competitiva': 'Competitive Analysis',
    'Resumo Executivo': 'Executive Summary'
  }
};

// Função para traduzir títulos de seções
export const translateSectionTitle = (title: string, targetLanguage: 'pt' | 'en'): string => {
  if (targetLanguage === 'pt') return title;
  
  const translations = dashboardSectionTranslations.en;
  return translations[title as keyof typeof translations] || translateText(title, targetLanguage);
};