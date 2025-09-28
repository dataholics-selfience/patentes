import React, { useState } from 'react';

// Country name translations
export const countryTranslations = {
  pt: {
    'Brasil': 'Brasil',
    'Estados Unidos': 'Estados Unidos',
    'União Europeia': 'União Europeia',
    'Argentina': 'Argentina',
    'México': 'México',
    'Canadá': 'Canadá',
    'Japão': 'Japão',
    'China': 'China',
    'Alemanha': 'Alemanha',
    'França': 'França',
    'Reino Unido': 'Reino Unido',
    'Austrália': 'Austrália',
    'Índia': 'Índia'
  },
  en: {
    'Brasil': 'Brazil',
    'Estados Unidos': 'United States',
    'União Europeia': 'European Union',
    'Argentina': 'Argentina',
    'México': 'Mexico',
    'Canadá': 'Canada',
    'Japão': 'Japan',
    'China': 'China',
    'Alemanha': 'Germany',
    'França': 'France',
    'Reino Unido': 'United Kingdom',
    'Austrália': 'Australia',
    'Índia': 'India'
  }
};

// Pharmaceutical categories translations
export const categoryTranslations = {
  pt: {
    'Antidiabéticos e Antiobesidade': 'Antidiabéticos e Antiobesidade',
    'Cardiovasculares': 'Cardiovasculares',
    'Antibióticos': 'Antibióticos',
    'Antivirais': 'Antivirais',
    'Oncológicos': 'Oncológicos',
    'Neurológicos': 'Neurológicos',
    'Imunológicos': 'Imunológicos',
    'Respiratórios': 'Respiratórios',
    'Gastrointestinais': 'Gastrointestinais',
    'Dermatológicos': 'Dermatológicos',
    'Oftalmológicos': 'Oftalmológicos',
    'Analgésicos': 'Analgésicos',
    'Anti-inflamatórios': 'Anti-inflamatórios',
    'Hormônios': 'Hormônios',
    'Vitaminas e Suplementos': 'Vitaminas e Suplementos'
  },
  en: {
    'Antidiabéticos e Antiobesidade': 'Antidiabetics and Anti-obesity',
    'Cardiovasculares': 'Cardiovascular',
    'Antibióticos': 'Antibiotics',
    'Antivirais': 'Antivirals',
    'Oncológicos': 'Oncological',
    'Neurológicos': 'Neurological',
    'Imunológicos': 'Immunological',
    'Respiratórios': 'Respiratory',
    'Gastrointestinais': 'Gastrointestinal',
    'Dermatológicos': 'Dermatological',
    'Oftalmológicos': 'Ophthalmological',
    'Analgésicos': 'Analgesics',
    'Anti-inflamatórios': 'Anti-inflammatory',
    'Hormônios': 'Hormones',
    'Vitaminas e Suplementos': 'Vitamins and Supplements'
  }
};

// Simple translation system with minimal files
export const translations = {
  pt: {
    // Navigation and UI
    login: 'Entrar',
    logout: 'Sair',
    back: 'Voltar',
    loading: 'Carregando...',
    plans: 'Planos',
    corporateAccount: 'Conta Corporativa',
    whatsappSupport: 'Suporte via WhatsApp',
    connectedToMainAgencies: 'Conectado às principais agências',
    patentConsultation: 'Consulta de Patentes',
    allRightsReserved: 'Todos os direitos reservados',
    
    // Patent consultation form
    commercialName: 'Nome Comercial',
    moleculeName: 'Nome da Molécula',
    pharmaceuticalCategory: 'Categoria Farmacêutica',
    mainBenefit: 'Benefício Principal',
    targetDisease: 'Doença Alvo',
    targetCountries: 'Países Alvo',
    selectAtLeastOneCountry: 'selecione pelo menos um',
    countriesSelected: 'Países selecionados',
    createProductPipeline: 'Consultar Patente',
    creatingPipeline: 'Analisando Patente...',
    acquirePlanToConsult: 'Adquirir Plano para Consultar',
    
    // Token usage
    consultationsRemaining: 'Consultas restantes',
    of: 'de',
    plan: 'Plano',
    restrictedAccess: 'Acesso Restrito',
    needActivePlan: 'Você precisa de um plano ativo para realizar consultas de patentes.',
    viewAvailablePlans: 'Ver Planos Disponíveis',
    
    // Patent results
    notInformed: 'Não informado',
    patentStatus: 'Status da Patente',
    active: 'VIGENTE',
    expired: 'EXPIRADA',
    primaryExpiration: 'Expiração Principal',
    commercialExploration: 'Exploração Comercial',
    permitted: 'PERMITIDA',
    restricted: 'RESTRITA',
    availableForNewProduct: 'Disponível para Novo Produto',
    primaryProtection: 'Proteção Primária',
    secondaryProtection: 'Proteção Secundária',
    opportunityScore: 'Score de Oportunidade',
    protectionObject: 'Objeto de Proteção',
    patentsByCountry: 'Patentes por País',
    statusAndExpirationDates: 'Status e datas de expiração por jurisdição',
    number: 'Número',
    status: 'Status',
    expiration: 'Expiração',
    types: 'Tipos',
    source: 'Fonte',
    viewPatent: 'Ver patente',
    chemicalData: 'Dados Químicos',
    molecularFormula: 'Fórmula Molecular',
    molecularWeight: 'Peso Molecular',
    inchiKey: 'InChI Key',
    iupacName: 'Nome IUPAC',
    smiles: 'SMILES',
    clinicalTrials: 'Ensaios Clínicos',
    activeStudies: 'Estudos Ativos',
    advancedPhase: 'Fase Avançada',
    studiesInBrazil: 'Estudos no Brasil',
    yes: 'SIM',
    no: 'NÃO',
    mainIndications: 'Principais Indicações',
    detailedStudies: 'Estudos Detalhados',
    phase: 'Fase',
    country: 'País',
    orangeBook: 'FDA Orange Book',
    ndaNumber: 'Número NDA',
    approvalDate: 'Data de Aprovação',
    exclusivityExpiration: 'Expiração da Exclusividade',
    hasGeneric: 'Possui Genérico',
    exclusivities: 'Exclusividades',
    regulationByCountry: 'Regulação por País',
    classification: 'Classificação',
    genericRegistrationEase: 'Facilidade Registro Genérico',
    registrationNumber: 'Número do Registro',
    restrictions: 'Restrições',
    scientificEvidence: 'Evidência Científica Recente',
    doi: 'DOI',
    exportPdf: 'Exportar PDF',
    
    // Additional translations for better coverage
    selectCategory: 'Selecione uma categoria',
    analyzing: 'Analisando...',
    consultation: 'Consulta',
    results: 'Resultados',
    details: 'Detalhes',
    information: 'Informação',
    data: 'Dados',
    analysis: 'Análise',
    report: 'Relatório'
  },
  en: {
    // Navigation and UI
    login: 'Login',
    logout: 'Logout',
    back: 'Back',
    loading: 'Loading...',
    plans: 'Plans',
    corporateAccount: 'Corporate Account',
    whatsappSupport: 'WhatsApp Support',
    connectedToMainAgencies: 'Connected to main agencies',
    patentConsultation: 'Patent Consultation',
    allRightsReserved: 'All rights reserved',
    
    // Patent consultation form
    commercialName: 'Commercial Name',
    moleculeName: 'Molecule Name',
    pharmaceuticalCategory: 'Pharmaceutical Category',
    mainBenefit: 'Main Benefit',
    targetDisease: 'Target Disease',
    targetCountries: 'Target Countries',
    selectAtLeastOneCountry: 'select at least one',
    countriesSelected: 'Countries selected',
    createProductPipeline: 'Consult Patent',
    creatingPipeline: 'Analyzing Patent...',
    acquirePlanToConsult: 'Get Plan to Consult',
    
    // Token usage
    consultationsRemaining: 'Consultations remaining',
    of: 'of',
    plan: 'Plan',
    restrictedAccess: 'Restricted Access',
    needActivePlan: 'You need an active plan to perform patent consultations.',
    viewAvailablePlans: 'View Available Plans',
    
    // Patent results
    notInformed: 'Not informed',
    patentStatus: 'Patent Status',
    active: 'ACTIVE',
    expired: 'EXPIRED',
    primaryExpiration: 'Primary Expiration',
    commercialExploration: 'Commercial Exploration',
    permitted: 'PERMITTED',
    restricted: 'RESTRICTED',
    availableForNewProduct: 'Available for New Product',
    primaryProtection: 'Primary Protection',
    secondaryProtection: 'Secondary Protection',
    opportunityScore: 'Opportunity Score',
    protectionObject: 'Protection Object',
    patentsByCountry: 'Patents by Country',
    statusAndExpirationDates: 'Status and expiration dates by jurisdiction',
    number: 'Number',
    status: 'Status',
    expiration: 'Expiration',
    types: 'Types',
    source: 'Source',
    viewPatent: 'View patent',
    chemicalData: 'Chemical Data',
    molecularFormula: 'Molecular Formula',
    molecularWeight: 'Molecular Weight',
    inchiKey: 'InChI Key',
    iupacName: 'IUPAC Name',
    smiles: 'SMILES',
    clinicalTrials: 'Clinical Trials',
    activeStudies: 'Active Studies',
    advancedPhase: 'Advanced Phase',
    studiesInBrazil: 'Studies in Brazil',
    yes: 'YES',
    no: 'NO',
    mainIndications: 'Main Indications',
    detailedStudies: 'Detailed Studies',
    phase: 'Phase',
    country: 'Country',
    orangeBook: 'FDA Orange Book',
    ndaNumber: 'NDA Number',
    approvalDate: 'Approval Date',
    exclusivityExpiration: 'Exclusivity Expiration',
    hasGeneric: 'Has Generic',
    exclusivities: 'Exclusivities',
    regulationByCountry: 'Regulation by Country',
    classification: 'Classification',
    genericRegistrationEase: 'Generic Registration Ease',
    registrationNumber: 'Registration Number',
    restrictions: 'Restrictions',
    scientificEvidence: 'Recent Scientific Evidence',
    doi: 'DOI',
    exportPdf: 'Export PDF',
    
    // Additional translations for better coverage
    selectCategory: 'Select a category',
    analyzing: 'Analyzing...',
    consultation: 'Consultation',
    results: 'Results',
    details: 'Details',
    information: 'Information',
    data: 'Data',
    analysis: 'Analysis',
    report: 'Report'
  }
};

export type Language = 'pt' | 'en';

// Simple translation hook
export const useTranslation = () => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('pharmyrus-language');
    return (saved as Language) || 'pt';
  });

  const changeLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('pharmyrus-language', newLanguage);
  };

  const t = (key: keyof typeof translations.pt): string => {
    return translations[language][key] || translations.pt[key] || key;
  };

  const translateCountry = (countryName: string): string => {
    return countryTranslations[language][countryName as keyof typeof countryTranslations.pt] || countryName;
  };

  const translateCategory = (categoryName: string): string => {
    return categoryTranslations[language][categoryName as keyof typeof categoryTranslations.pt] || categoryName;
  };

  return { t, language, changeLanguage, translateCountry, translateCategory };
};