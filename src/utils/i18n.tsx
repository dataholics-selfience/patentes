import { useState, useEffect, createContext, useContext } from 'react';

export type Language = 'pt' | 'en' | 'fr' | 'it' | 'es';

interface Translations {
  // Navigation and Common
  home: string;
  about: string;
  contact: string;
  login: string;
  register: string;
  logout: string;
  back: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  remove: string;
  confirm: string;
  loading: string;
  error: string;
  success: string;
  
  // App Name and Branding
  appName: string;
  appDescription: string;
  
  // Landing Page
  landingTitle: string;
  landingSubtitle: string;
  landingDescription: string;
  startFree: string;
  learnMore: string;
  features: string;
  pricing: string;
  testimonials: string;
  freeConsultations: string;
  noCreditCard: string;
  immediateAccess: string;
  
  // Patent Consultation
  patentConsultation: string;
  newConsultation: string;
  newConsultationDescription: string;
  productName: string;
  consultPatent: string;
  consulting: string;
  patentStatus: string;
  patentActive: string;
  patentExpired: string;
  expirationDate: string;
  registeredCountries: string;
  commercialExploration: string;
  regulatoryRisks: string;
  alternativeCompounds: string;
  patentHistory: string;
  loadingPatentInfo: string;
  analyzingDatabases: string;
  
  // Login and Auth
  loginTitle: string;
  loginDescription: string;
  enterYourCredentials: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  loginButton: string;
  loggingIn: string;
  
  // User Profile
  profile: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  cpf: string;
  updateProfile: string;
  resetPassword: string;
  deleteAccount: string;
  dangerZone: string;
  
  // Plans
  plans: string;
  choosePlan: string;
  currentPlan: string;
  upgradeButton: string;
  researcher: string;
  analyst: string;
  specialist: string;
  director: string;
  
  // Token Usage
  tokenUsage: string;
  remaining: string;
  renewalOn: string;
  upgradePlan: string;
  
  // Languages
  portuguese: string;
  english: string;
  french: string;
  italian: string;
  spanish: string;
  
  // Countries
  brazil: string;
  unitedStates: string;
  germany: string;
  france: string;
  unitedKingdom: string;
  japan: string;
  china: string;
  southKorea: string;
  canada: string;
  australia: string;
  india: string;
  italy: string;
  spain: string;
  netherlands: string;
  switzerland: string;
  sweden: string;
  norway: string;
  denmark: string;
  finland: string;
  belgium: string;
  austria: string;
  portugal: string;
  mexico: string;
  argentina: string;
  chile: string;
  colombia: string;
  peru: string;
  uruguay: string;
  russia: string;
  southAfrica: string;
  israel: string;
  singapore: string;
  thailand: string;
  malaysia: string;
  indonesia: string;
  philippines: string;
  vietnam: string;
  taiwan: string;
  hongKong: string;
  newZealand: string;
  europeanUnion: string;
  international: string;
  
  // Patent Agencies
  connectedToAgencies: string;
  realTimeData: string;
  globalCoverage: string;
  officialApis: string;
  
  // Features
  instantVerification: string;
  accelerateRD: string;
  guaranteedSavings: string;
  internationalCoverage: string;
  riskAnalysis: string;
  smartAlternatives: string;
  
  // Benefits
  avoidLawsuits: string;
  reduceCosts: string;
  accelerateTimeToMarket: string;
  identifyOpportunities: string;
  minimizeRisks: string;
  optimizeInvestments: string;
  
  // Stats
  consultationsPerformed: string;
  companiesServed: string;
  analysisAccuracy: string;
  availability: string;
  
  // Footer
  platformDescription: string;
  product: string;
  support: string;
  termsOfUse: string;
  privacy: string;
  allRightsReserved: string;
  
  // Forms
  fullName: string;
  password: string;
  confirmPassword: string;
  createAccount: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  forgotPassword: string;
  
  // Errors and Messages
  invalidEmail: string;
  passwordTooShort: string;
  passwordsDoNotMatch: string;
  emailAlreadyInUse: string;
  userNotFound: string;
  wrongPassword: string;
  networkError: string;
  
  // Patent Results
  substanceAnalyzed: string;
  patentVigent: string;
  yes: string;
  no: string;
  permitted: string;
  restricted: string;
  mainPatentExpiration: string;
  newProductExpiration: string;
  noCountriesRegistered: string;
  noRisksReported: string;
  noAlternativesFound: string;
  
  // Actions
  viewDetails: string;
  downloadReport: string;
  shareResults: string;
  consultAnother: string;
  
  // Security
  securePayment: string;
  pciCompliant: string;
  fraudProtection: string;
  
  // AI Output Translations
  aiAnalysisComplete: string;
  patentAnalysisResults: string;
  substanceBeingAnalyzed: string;
  patentStatusAnalysis: string;
  expirationDatesInfo: string;
  registeredCountriesInfo: string;
  regulatoryRisksInfo: string;
  alternativeCompoundsInfo: string;
  
  // Common UI Elements
  close: string;
  open: string;
  next: string;
  previous: string;
  submit: string;
  reset: string;
  clear: string;
  search: string;
  filter: string;
  sort: string;
  
  // Status Messages
  processingRequest: string;
  requestCompleted: string;
  requestFailed: string;
  tryAgain: string;
  pleaseWait: string;
}

const translations: Record<Language, Translations> = {
  pt: {
    // Navigation and Common
    home: 'Início',
    about: 'Sobre',
    contact: 'Contato',
    login: 'Entrar',
    register: 'Registrar',
    logout: 'Sair',
    back: 'Voltar',
    save: 'Salvar',
    cancel: 'Cancelar',
    delete: 'Excluir',
    edit: 'Editar',
    add: 'Adicionar',
    remove: 'Remover',
    confirm: 'Confirmar',
    loading: 'Carregando',
    error: 'Erro',
    success: 'Sucesso',
    
    // App Name and Branding
    appName: 'Consulta de Patentes',
    appDescription: 'Análise inteligente de propriedade intelectual farmacêutica',
    
    // Landing Page
    landingTitle: 'Verifique Patentes Farmacêuticas em Segundos',
    landingSubtitle: 'Proteja sua empresa de riscos jurídicos, acelere seu P&D e economize milhões',
    landingDescription: 'Nossa plataforma de inteligência artificial especializada em propriedade intelectual farmacêutica oferece análises precisas e instantâneas.',
    startFree: 'Começar Grátis',
    learnMore: 'Saiba Mais',
    features: 'Recursos',
    pricing: 'Preços',
    testimonials: 'Depoimentos',
    freeConsultations: '100 consultas gratuitas',
    noCreditCard: 'Sem cartão de crédito',
    immediateAccess: 'Acesso imediato',
    
    // Patent Consultation
    patentConsultation: 'Consulta de Patentes',
    newConsultation: 'Nova Consulta de Patente',
    newConsultationDescription: 'Digite o nome do produto ou substância para verificar o status da patente',
    productName: 'Nome do Produto',
    consultPatent: 'Consultar',
    consulting: 'Consultando',
    patentStatus: 'Status da Patente',
    patentActive: 'Patente Ativa',
    patentExpired: 'Patente Expirada',
    expirationDate: 'Data de Expiração',
    registeredCountries: 'Países com Registro',
    commercialExploration: 'Exploração Comercial',
    regulatoryRisks: 'Riscos Regulatórios e Éticos',
    alternativeCompounds: 'Alternativas de Compostos Análogos',
    patentHistory: 'Histórico de Patentes',
    loadingPatentInfo: 'Carregando informações de patentes',
    analyzingDatabases: 'Analisando bases de dados internacionais...',
    
    // Login and Auth
    loginTitle: 'Faça seu login',
    loginDescription: 'Acesse sua conta para consultar patentes',
    enterYourCredentials: 'Digite suas credenciais para acessar',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Senha',
    loginButton: 'Entrar',
    loggingIn: 'Entrando...',
    
    // User Profile
    profile: 'Perfil',
    name: 'Nome',
    email: 'Email',
    company: 'Empresa',
    phone: 'Telefone',
    cpf: 'CPF',
    updateProfile: 'Atualizar Perfil',
    resetPassword: 'Redefinir Senha',
    deleteAccount: 'Excluir Conta',
    dangerZone: 'Zona de Perigo',
    
    // Plans
    plans: 'Planos',
    choosePlan: 'Escolha seu Plano',
    currentPlan: 'Plano Atual',
    upgradeButton: 'Atualizar Plano',
    researcher: 'Pesquisador',
    analyst: 'Analista',
    specialist: 'Especialista',
    director: 'Diretor',
    
    // Token Usage
    tokenUsage: 'Uso de Tokens',
    remaining: 'restantes',
    renewalOn: 'Renovação em',
    upgradePlan: 'Atualizar plano',
    
    // Languages
    portuguese: 'Português',
    english: 'Inglês',
    french: 'Francês',
    italian: 'Italiano',
    spanish: 'Espanhol',
    
    // Countries
    brazil: 'Brasil',
    unitedStates: 'Estados Unidos',
    germany: 'Alemanha',
    france: 'França',
    unitedKingdom: 'Reino Unido',
    japan: 'Japão',
    china: 'China',
    southKorea: 'Coreia do Sul',
    canada: 'Canadá',
    australia: 'Austrália',
    india: 'Índia',
    italy: 'Itália',
    spain: 'Espanha',
    netherlands: 'Holanda',
    switzerland: 'Suíça',
    sweden: 'Suécia',
    norway: 'Noruega',
    denmark: 'Dinamarca',
    finland: 'Finlândia',
    belgium: 'Bélgica',
    austria: 'Áustria',
    portugal: 'Portugal',
    mexico: 'México',
    argentina: 'Argentina',
    chile: 'Chile',
    colombia: 'Colômbia',
    peru: 'Peru',
    uruguay: 'Uruguai',
    russia: 'Rússia',
    southAfrica: 'África do Sul',
    israel: 'Israel',
    singapore: 'Singapura',
    thailand: 'Tailândia',
    malaysia: 'Malásia',
    indonesia: 'Indonésia',
    philippines: 'Filipinas',
    vietnam: 'Vietnã',
    taiwan: 'Taiwan',
    hongKong: 'Hong Kong',
    newZealand: 'Nova Zelândia',
    europeanUnion: 'União Europeia',
    international: 'Internacional',
    
    // Patent Agencies
    connectedToAgencies: 'Conectado às Principais Agências de Patentes Mundiais',
    realTimeData: 'Dados em tempo real',
    globalCoverage: 'Cobertura global',
    officialApis: 'APIs oficiais',
    
    // Features
    instantVerification: 'Verificação Instantânea de Patentes',
    accelerateRD: 'Acelere seu P&D',
    guaranteedSavings: 'Economia Garantida',
    internationalCoverage: 'Cobertura Internacional',
    riskAnalysis: 'Análise de Riscos',
    smartAlternatives: 'Alternativas Inteligentes',
    
    // Benefits
    avoidLawsuits: 'Evite processos judiciais custosos por violação de patentes',
    reduceCosts: 'Reduza custos de consultoria em até 90%',
    accelerateTimeToMarket: 'Acelere o time-to-market de novos produtos',
    identifyOpportunities: 'Identifique oportunidades de mercado inexploradas',
    minimizeRisks: 'Minimize riscos regulatórios e éticos',
    optimizeInvestments: 'Otimize investimentos em P&D',
    
    // Stats
    consultationsPerformed: 'Consultas Realizadas',
    companiesServed: 'Empresas Atendidas',
    analysisAccuracy: 'Precisão das Análises',
    availability: 'Disponibilidade',
    
    // Footer
    platformDescription: 'Plataforma de inteligência artificial especializada em análise de patentes farmacêuticas, protegendo empresas e acelerando a inovação.',
    product: 'Produto',
    support: 'Suporte',
    termsOfUse: 'Termos de Uso',
    privacy: 'Privacidade',
    allRightsReserved: 'Todos os direitos reservados',
    
    // Forms
    fullName: 'Nome Completo',
    password: 'Senha',
    confirmPassword: 'Confirmar Senha',
    createAccount: 'Criar Conta',
    alreadyHaveAccount: 'Já tem uma conta?',
    dontHaveAccount: 'Não tem uma conta?',
    forgotPassword: 'Esqueceu a senha?',
    
    // Errors and Messages
    invalidEmail: 'Email inválido',
    passwordTooShort: 'Senha muito curta',
    passwordsDoNotMatch: 'Senhas não coincidem',
    emailAlreadyInUse: 'Email já está em uso',
    userNotFound: 'Usuário não encontrado',
    wrongPassword: 'Senha incorreta',
    networkError: 'Erro de rede',
    
    // Patent Results
    substanceAnalyzed: 'Substância Analisada',
    patentVigent: 'Patente Vigente',
    yes: 'SIM',
    no: 'NÃO',
    permitted: 'PERMITIDA',
    restricted: 'RESTRITA',
    mainPatentExpiration: 'Expiração da Patente Principal',
    newProductExpiration: 'Vencimento para Novo Produto',
    noCountriesRegistered: 'Nenhum país registrado informado',
    noRisksReported: 'Nenhum risco regulatório reportado',
    noAlternativesFound: 'Nenhuma alternativa encontrada',
    
    // Actions
    viewDetails: 'Ver Detalhes',
    downloadReport: 'Baixar Relatório',
    shareResults: 'Compartilhar Resultados',
    consultAnother: 'Consultar Outro',
    
    // Security
    securePayment: 'Pagamento Seguro',
    pciCompliant: 'Certificado PCI DSS',
    fraudProtection: 'Proteção Antifraude',
    
    // AI Output Translations
    aiAnalysisComplete: 'Análise da IA concluída',
    patentAnalysisResults: 'Resultados da análise de patentes',
    substanceBeingAnalyzed: 'Substância sendo analisada',
    patentStatusAnalysis: 'Análise do status da patente',
    expirationDatesInfo: 'Informações sobre datas de expiração',
    registeredCountriesInfo: 'Informações sobre países registrados',
    regulatoryRisksInfo: 'Informações sobre riscos regulatórios',
    alternativeCompoundsInfo: 'Informações sobre compostos alternativos',
    
    // Common UI Elements
    close: 'Fechar',
    open: 'Abrir',
    next: 'Próximo',
    previous: 'Anterior',
    submit: 'Enviar',
    reset: 'Redefinir',
    clear: 'Limpar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    
    // Status Messages
    processingRequest: 'Processando solicitação',
    requestCompleted: 'Solicitação concluída',
    requestFailed: 'Solicitação falhou',
    tryAgain: 'Tente novamente',
    pleaseWait: 'Por favor, aguarde'
  },
  
  en: {
    // Navigation and Common
    home: 'Home',
    about: 'About',
    contact: 'Contact',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    back: 'Back',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    confirm: 'Confirm',
    loading: 'Loading',
    error: 'Error',
    success: 'Success',
    
    // App Name and Branding
    appName: 'Patent Consultation',
    appDescription: 'Intelligent pharmaceutical intellectual property analysis',
    
    // Landing Page
    landingTitle: 'Verify Pharmaceutical Patents in Seconds',
    landingSubtitle: 'Protect your company from legal risks, accelerate your R&D and save millions',
    landingDescription: 'Our artificial intelligence platform specialized in pharmaceutical intellectual property offers accurate and instant analysis.',
    startFree: 'Start Free',
    learnMore: 'Learn More',
    features: 'Features',
    pricing: 'Pricing',
    testimonials: 'Testimonials',
    freeConsultations: '100 free consultations',
    noCreditCard: 'No credit card',
    immediateAccess: 'Immediate access',
    
    // Patent Consultation
    patentConsultation: 'Patent Consultation',
    newConsultation: 'New Patent Consultation',
    newConsultationDescription: 'Enter the product or substance name to check patent status',
    productName: 'Product Name',
    consultPatent: 'Consult',
    consulting: 'Consulting',
    patentStatus: 'Patent Status',
    patentActive: 'Patent Active',
    patentExpired: 'Patent Expired',
    expirationDate: 'Expiration Date',
    registeredCountries: 'Registered Countries',
    commercialExploration: 'Commercial Exploration',
    regulatoryRisks: 'Regulatory and Ethical Risks',
    alternativeCompounds: 'Alternative Analogous Compounds',
    patentHistory: 'Patent History',
    loadingPatentInfo: 'Loading patent information',
    analyzingDatabases: 'Analyzing international databases...',
    
    // Login and Auth
    loginTitle: 'Sign in to your account',
    loginDescription: 'Access your account to consult patents',
    enterYourCredentials: 'Enter your credentials to access',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    loginButton: 'Sign In',
    loggingIn: 'Signing in...',
    
    // User Profile
    profile: 'Profile',
    name: 'Name',
    email: 'Email',
    company: 'Company',
    phone: 'Phone',
    cpf: 'Tax ID',
    updateProfile: 'Update Profile',
    resetPassword: 'Reset Password',
    deleteAccount: 'Delete Account',
    dangerZone: 'Danger Zone',
    
    // Plans
    plans: 'Plans',
    choosePlan: 'Choose Your Plan',
    currentPlan: 'Current Plan',
    upgradeButton: 'Upgrade Plan',
    researcher: 'Researcher',
    analyst: 'Analyst',
    specialist: 'Specialist',
    director: 'Director',
    
    // Token Usage
    tokenUsage: 'Token Usage',
    remaining: 'remaining',
    renewalOn: 'Renewal on',
    upgradePlan: 'Upgrade plan',
    
    // Languages
    portuguese: 'Portuguese',
    english: 'English',
    french: 'French',
    italian: 'Italian',
    spanish: 'Spanish',
    
    // Countries
    brazil: 'Brazil',
    unitedStates: 'United States',
    germany: 'Germany',
    france: 'France',
    unitedKingdom: 'United Kingdom',
    japan: 'Japan',
    china: 'China',
    southKorea: 'South Korea',
    canada: 'Canada',
    australia: 'Australia',
    india: 'India',
    italy: 'Italy',
    spain: 'Spain',
    netherlands: 'Netherlands',
    switzerland: 'Switzerland',
    sweden: 'Sweden',
    norway: 'Norway',
    denmark: 'Denmark',
    finland: 'Finland',
    belgium: 'Belgium',
    austria: 'Austria',
    portugal: 'Portugal',
    mexico: 'Mexico',
    argentina: 'Argentina',
    chile: 'Chile',
    colombia: 'Colombia',
    peru: 'Peru',
    uruguay: 'Uruguay',
    russia: 'Russia',
    southAfrica: 'South Africa',
    israel: 'Israel',
    singapore: 'Singapore',
    thailand: 'Thailand',
    malaysia: 'Malaysia',
    indonesia: 'Indonesia',
    philippines: 'Philippines',
    vietnam: 'Vietnam',
    taiwan: 'Taiwan',
    hongKong: 'Hong Kong',
    newZealand: 'New Zealand',
    europeanUnion: 'European Union',
    international: 'International',
    
    // Patent Agencies
    connectedToAgencies: 'Connected to Major Global Patent Agencies',
    realTimeData: 'Real-time data',
    globalCoverage: 'Global coverage',
    officialApis: 'Official APIs',
    
    // Features
    instantVerification: 'Instant Patent Verification',
    accelerateRD: 'Accelerate your R&D',
    guaranteedSavings: 'Guaranteed Savings',
    internationalCoverage: 'International Coverage',
    riskAnalysis: 'Risk Analysis',
    smartAlternatives: 'Smart Alternatives',
    
    // Benefits
    avoidLawsuits: 'Avoid costly patent infringement lawsuits',
    reduceCosts: 'Reduce consulting costs by up to 90%',
    accelerateTimeToMarket: 'Accelerate time-to-market for new products',
    identifyOpportunities: 'Identify unexplored market opportunities',
    minimizeRisks: 'Minimize regulatory and ethical risks',
    optimizeInvestments: 'Optimize R&D investments',
    
    // Stats
    consultationsPerformed: 'Consultations Performed',
    companiesServed: 'Companies Served',
    analysisAccuracy: 'Analysis Accuracy',
    availability: 'Availability',
    
    // Footer
    platformDescription: 'Artificial intelligence platform specialized in pharmaceutical patent analysis, protecting companies and accelerating innovation.',
    product: 'Product',
    support: 'Support',
    termsOfUse: 'Terms of Use',
    privacy: 'Privacy',
    allRightsReserved: 'All rights reserved',
    
    // Forms
    fullName: 'Full Name',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    createAccount: 'Create Account',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    forgotPassword: 'Forgot password?',
    
    // Errors and Messages
    invalidEmail: 'Invalid email',
    passwordTooShort: 'Password too short',
    passwordsDoNotMatch: 'Passwords do not match',
    emailAlreadyInUse: 'Email already in use',
    userNotFound: 'User not found',
    wrongPassword: 'Wrong password',
    networkError: 'Network error',
    
    // Patent Results
    substanceAnalyzed: 'Substance Analyzed',
    patentVigent: 'Patent Active',
    yes: 'YES',
    no: 'NO',
    permitted: 'PERMITTED',
    restricted: 'RESTRICTED',
    mainPatentExpiration: 'Main Patent Expiration',
    newProductExpiration: 'New Product Expiration',
    noCountriesRegistered: 'No registered countries reported',
    noRisksReported: 'No regulatory risks reported',
    noAlternativesFound: 'No alternatives found',
    
    // Actions
    viewDetails: 'View Details',
    downloadReport: 'Download Report',
    shareResults: 'Share Results',
    consultAnother: 'Consult Another',
    
    // Security
    securePayment: 'Secure Payment',
    pciCompliant: 'PCI DSS Certified',
    fraudProtection: 'Fraud Protection',
    
    // AI Output Translations
    aiAnalysisComplete: 'AI analysis completed',
    patentAnalysisResults: 'Patent analysis results',
    substanceBeingAnalyzed: 'Substance being analyzed',
    patentStatusAnalysis: 'Patent status analysis',
    expirationDatesInfo: 'Expiration dates information',
    registeredCountriesInfo: 'Registered countries information',
    regulatoryRisksInfo: 'Regulatory risks information',
    alternativeCompoundsInfo: 'Alternative compounds information',
    
    // Common UI Elements
    close: 'Close',
    open: 'Open',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    reset: 'Reset',
    clear: 'Clear',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    
    // Status Messages
    processingRequest: 'Processing request',
    requestCompleted: 'Request completed',
    requestFailed: 'Request failed',
    tryAgain: 'Try again',
    pleaseWait: 'Please wait'
  },
  
  fr: {
    // Navigation and Common
    home: 'Accueil',
    about: 'À propos',
    contact: 'Contact',
    login: 'Connexion',
    register: "S'inscrire",
    logout: 'Déconnexion',
    back: 'Retour',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    remove: 'Retirer',
    confirm: 'Confirmer',
    loading: 'Chargement',
    error: 'Erreur',
    success: 'Succès',
    
    // App Name and Branding
    appName: 'Consultation de Brevets',
    appDescription: 'Analyse intelligente de la propriété intellectuelle pharmaceutique',
    
    // Landing Page
    landingTitle: 'Vérifiez les Brevets Pharmaceutiques en Secondes',
    landingSubtitle: 'Protégez votre entreprise des risques juridiques, accélérez votre R&D et économisez des millions',
    landingDescription: 'Notre plateforme d\'intelligence artificielle spécialisée dans la propriété intellectuelle pharmaceutique offre des analyses précises et instantanées.',
    startFree: 'Commencer Gratuitement',
    learnMore: 'En Savoir Plus',
    features: 'Fonctionnalités',
    pricing: 'Tarifs',
    testimonials: 'Témoignages',
    freeConsultations: '100 consultations gratuites',
    noCreditCard: 'Pas de carte de crédit',
    immediateAccess: 'Accès immédiat',
    
    // Patent Consultation
    patentConsultation: 'Consultation de Brevets',
    newConsultation: 'Nouvelle Consultation de Brevet',
    newConsultationDescription: 'Entrez le nom du produit ou de la substance pour vérifier le statut du brevet',
    productName: 'Nom du Produit',
    consultPatent: 'Consulter',
    consulting: 'Consultation en cours',
    patentStatus: 'Statut du Brevet',
    patentActive: 'Brevet Actif',
    patentExpired: 'Brevet Expiré',
    expirationDate: "Date d'Expiration",
    registeredCountries: 'Pays Enregistrés',
    commercialExploration: 'Exploitation Commerciale',
    regulatoryRisks: 'Risques Réglementaires et Éthiques',
    alternativeCompounds: 'Composés Analogues Alternatifs',
    patentHistory: 'Historique des Brevets',
    loadingPatentInfo: 'Chargement des informations de brevet',
    analyzingDatabases: 'Analyse des bases de données internationales...',
    
    // Login and Auth
    loginTitle: 'Connectez-vous à votre compte',
    loginDescription: 'Accédez à votre compte pour consulter les brevets',
    enterYourCredentials: 'Entrez vos identifiants pour accéder',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Mot de passe',
    loginButton: 'Se connecter',
    loggingIn: 'Connexion en cours...',
    
    // User Profile
    profile: 'Profil',
    name: 'Nom',
    email: 'Email',
    company: 'Entreprise',
    phone: 'Téléphone',
    cpf: 'ID Fiscal',
    updateProfile: 'Mettre à Jour le Profil',
    resetPassword: 'Réinitialiser le Mot de Passe',
    deleteAccount: 'Supprimer le Compte',
    dangerZone: 'Zone de Danger',
    
    // Plans
    plans: 'Plans',
    choosePlan: 'Choisissez Votre Plan',
    currentPlan: 'Plan Actuel',
    upgradeButton: 'Mettre à Niveau',
    researcher: 'Chercheur',
    analyst: 'Analyste',
    specialist: 'Spécialiste',
    director: 'Directeur',
    
    // Token Usage
    tokenUsage: 'Utilisation des Jetons',
    remaining: 'restants',
    renewalOn: 'Renouvellement le',
    upgradePlan: 'Mettre à niveau le plan',
    
    // Languages
    portuguese: 'Portugais',
    english: 'Anglais',
    french: 'Français',
    italian: 'Italien',
    spanish: 'Espagnol',
    
    // Countries
    brazil: 'Brésil',
    unitedStates: 'États-Unis',
    germany: 'Allemagne',
    france: 'France',
    unitedKingdom: 'Royaume-Uni',
    japan: 'Japon',
    china: 'Chine',
    southKorea: 'Corée du Sud',
    canada: 'Canada',
    australia: 'Australie',
    india: 'Inde',
    italy: 'Italie',
    spain: 'Espagne',
    netherlands: 'Pays-Bas',
    switzerland: 'Suisse',
    sweden: 'Suède',
    norway: 'Norvège',
    denmark: 'Danemark',
    finland: 'Finlande',
    belgium: 'Belgique',
    austria: 'Autriche',
    portugal: 'Portugal',
    mexico: 'Mexique',
    argentina: 'Argentine',
    chile: 'Chili',
    colombia: 'Colombie',
    peru: 'Pérou',
    uruguay: 'Uruguay',
    russia: 'Russie',
    southAfrica: 'Afrique du Sud',
    israel: 'Israël',
    singapore: 'Singapour',
    thailand: 'Thaïlande',
    malaysia: 'Malaisie',
    indonesia: 'Indonésie',
    philippines: 'Philippines',
    vietnam: 'Vietnam',
    taiwan: 'Taïwan',
    hongKong: 'Hong Kong',
    newZealand: 'Nouvelle-Zélande',
    europeanUnion: 'Union Européenne',
    international: 'International',
    
    // Patent Agencies
    connectedToAgencies: 'Connecté aux Principales Agences de Brevets Mondiales',
    realTimeData: 'Données en temps réel',
    globalCoverage: 'Couverture mondiale',
    officialApis: 'APIs officielles',
    
    // Features
    instantVerification: 'Vérification Instantanée des Brevets',
    accelerateRD: 'Accélérez votre R&D',
    guaranteedSavings: 'Économies Garanties',
    internationalCoverage: 'Couverture Internationale',
    riskAnalysis: 'Analyse des Risques',
    smartAlternatives: 'Alternatives Intelligentes',
    
    // Benefits
    avoidLawsuits: 'Évitez les poursuites coûteuses pour violation de brevets',
    reduceCosts: 'Réduisez les coûts de conseil jusqu\'à 90%',
    accelerateTimeToMarket: 'Accélérez le time-to-market des nouveaux produits',
    identifyOpportunities: 'Identifiez les opportunités de marché inexploitées',
    minimizeRisks: 'Minimisez les risques réglementaires et éthiques',
    optimizeInvestments: 'Optimisez les investissements en R&D',
    
    // Stats
    consultationsPerformed: 'Consultations Effectuées',
    companiesServed: 'Entreprises Servies',
    analysisAccuracy: 'Précision des Analyses',
    availability: 'Disponibilité',
    
    // Footer
    platformDescription: 'Plateforme d\'intelligence artificielle spécialisée dans l\'analyse de brevets pharmaceutiques, protégeant les entreprises et accélérant l\'innovation.',
    product: 'Produit',
    support: 'Support',
    termsOfUse: 'Conditions d\'Utilisation',
    privacy: 'Confidentialité',
    allRightsReserved: 'Tous droits réservés',
    
    // Forms
    fullName: 'Nom Complet',
    password: 'Mot de Passe',
    confirmPassword: 'Confirmer le Mot de Passe',
    createAccount: 'Créer un Compte',
    alreadyHaveAccount: 'Vous avez déjà un compte?',
    dontHaveAccount: 'Vous n\'avez pas de compte?',
    forgotPassword: 'Mot de passe oublié?',
    
    // Errors and Messages
    invalidEmail: 'Email invalide',
    passwordTooShort: 'Mot de passe trop court',
    passwordsDoNotMatch: 'Les mots de passe ne correspondent pas',
    emailAlreadyInUse: 'Email déjà utilisé',
    userNotFound: 'Utilisateur non trouvé',
    wrongPassword: 'Mot de passe incorrect',
    networkError: 'Erreur réseau',
    
    // Patent Results
    substanceAnalyzed: 'Substance Analysée',
    patentVigent: 'Brevet Actif',
    yes: 'OUI',
    no: 'NON',
    permitted: 'AUTORISÉ',
    restricted: 'RESTREINT',
    mainPatentExpiration: 'Expiration du Brevet Principal',
    newProductExpiration: 'Expiration du Nouveau Produit',
    noCountriesRegistered: 'Aucun pays enregistré signalé',
    noRisksReported: 'Aucun risque réglementaire signalé',
    noAlternativesFound: 'Aucune alternative trouvée',
    
    // Actions
    viewDetails: 'Voir les Détails',
    downloadReport: 'Télécharger le Rapport',
    shareResults: 'Partager les Résultats',
    consultAnother: 'Consulter un Autre',
    
    // Security
    securePayment: 'Paiement Sécurisé',
    pciCompliant: 'Certifié PCI DSS',
    fraudProtection: 'Protection Anti-Fraude',
    
    // AI Output Translations
    aiAnalysisComplete: 'Analyse IA terminée',
    patentAnalysisResults: 'Résultats de l\'analyse de brevets',
    substanceBeingAnalyzed: 'Substance en cours d\'analyse',
    patentStatusAnalysis: 'Analyse du statut du brevet',
    expirationDatesInfo: 'Informations sur les dates d\'expiration',
    registeredCountriesInfo: 'Informations sur les pays enregistrés',
    regulatoryRisksInfo: 'Informations sur les risques réglementaires',
    alternativeCompoundsInfo: 'Informations sur les composés alternatifs',
    
    // Common UI Elements
    close: 'Fermer',
    open: 'Ouvrir',
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Soumettre',
    reset: 'Réinitialiser',
    clear: 'Effacer',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    
    // Status Messages
    processingRequest: 'Traitement de la demande',
    requestCompleted: 'Demande terminée',
    requestFailed: 'Demande échouée',
    tryAgain: 'Réessayer',
    pleaseWait: 'Veuillez patienter'
  },
  
  it: {
    // Navigation and Common
    home: 'Home',
    about: 'Chi Siamo',
    contact: 'Contatto',
    login: 'Accedi',
    register: 'Registrati',
    logout: 'Esci',
    back: 'Indietro',
    save: 'Salva',
    cancel: 'Annulla',
    delete: 'Elimina',
    edit: 'Modifica',
    add: 'Aggiungi',
    remove: 'Rimuovi',
    confirm: 'Conferma',
    loading: 'Caricamento',
    error: 'Errore',
    success: 'Successo',
    
    // App Name and Branding
    appName: 'Consultazione Brevetti',
    appDescription: 'Analisi intelligente della proprietà intellettuale farmaceutica',
    
    // Landing Page
    landingTitle: 'Verifica i Brevetti Farmaceutici in Secondi',
    landingSubtitle: 'Proteggi la tua azienda dai rischi legali, accelera la tua R&S e risparmia milioni',
    landingDescription: 'La nostra piattaforma di intelligenza artificiale specializzata nella proprietà intellettuale farmaceutica offre analisi precise e istantanee.',
    startFree: 'Inizia Gratis',
    learnMore: 'Scopri di Più',
    features: 'Caratteristiche',
    pricing: 'Prezzi',
    testimonials: 'Testimonianze',
    freeConsultations: '100 consultazioni gratuite',
    noCreditCard: 'Nessuna carta di credito',
    immediateAccess: 'Accesso immediato',
    
    // Patent Consultation
    patentConsultation: 'Consultazione Brevetti',
    newConsultation: 'Nuova Consultazione Brevetto',
    newConsultationDescription: 'Inserisci il nome del prodotto o della sostanza per verificare lo stato del brevetto',
    productName: 'Nome del Prodotto',
    consultPatent: 'Consulta',
    consulting: 'Consultazione in corso',
    patentStatus: 'Stato del Brevetto',
    patentActive: 'Brevetto Attivo',
    patentExpired: 'Brevetto Scaduto',
    expirationDate: 'Data di Scadenza',
    registeredCountries: 'Paesi Registrati',
    commercialExploration: 'Sfruttamento Commerciale',
    regulatoryRisks: 'Rischi Normativi ed Etici',
    alternativeCompounds: 'Composti Analoghi Alternativi',
    patentHistory: 'Cronologia Brevetti',
    loadingPatentInfo: 'Caricamento informazioni brevetto',
    analyzingDatabases: 'Analisi dei database internazionali...',
    
    // Login and Auth
    loginTitle: 'Accedi al tuo account',
    loginDescription: 'Accedi al tuo account per consultare i brevetti',
    enterYourCredentials: 'Inserisci le tue credenziali per accedere',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    loginButton: 'Accedi',
    loggingIn: 'Accesso in corso...',
    
    // User Profile
    profile: 'Profilo',
    name: 'Nome',
    email: 'Email',
    company: 'Azienda',
    phone: 'Telefono',
    cpf: 'Codice Fiscale',
    updateProfile: 'Aggiorna Profilo',
    resetPassword: 'Reimposta Password',
    deleteAccount: 'Elimina Account',
    dangerZone: 'Zona di Pericolo',
    
    // Plans
    plans: 'Piani',
    choosePlan: 'Scegli il Tuo Piano',
    currentPlan: 'Piano Attuale',
    upgradeButton: 'Aggiorna Piano',
    researcher: 'Ricercatore',
    analyst: 'Analista',
    specialist: 'Specialista',
    director: 'Direttore',
    
    // Token Usage
    tokenUsage: 'Utilizzo Token',
    remaining: 'rimanenti',
    renewalOn: 'Rinnovo il',
    upgradePlan: 'Aggiorna piano',
    
    // Languages
    portuguese: 'Portoghese',
    english: 'Inglese',
    french: 'Francese',
    italian: 'Italiano',
    spanish: 'Spagnolo',
    
    // Countries
    brazil: 'Brasile',
    unitedStates: 'Stati Uniti',
    germany: 'Germania',
    france: 'Francia',
    unitedKingdom: 'Regno Unito',
    japan: 'Giappone',
    china: 'Cina',
    southKorea: 'Corea del Sud',
    canada: 'Canada',
    australia: 'Australia',
    india: 'India',
    italy: 'Italia',
    spain: 'Spagna',
    netherlands: 'Paesi Bassi',
    switzerland: 'Svizzera',
    sweden: 'Svezia',
    norway: 'Norvegia',
    denmark: 'Danimarca',
    finland: 'Finlandia',
    belgium: 'Belgio',
    austria: 'Austria',
    portugal: 'Portogallo',
    mexico: 'Messico',
    argentina: 'Argentina',
    chile: 'Cile',
    colombia: 'Colombia',
    peru: 'Perù',
    uruguay: 'Uruguay',
    russia: 'Russia',
    southAfrica: 'Sudafrica',
    israel: 'Israele',
    singapore: 'Singapore',
    thailand: 'Tailandia',
    malaysia: 'Malesia',
    indonesia: 'Indonesia',
    philippines: 'Filippine',
    vietnam: 'Vietnam',
    taiwan: 'Taiwan',
    hongKong: 'Hong Kong',
    newZealand: 'Nuova Zelanda',
    europeanUnion: 'Unione Europea',
    international: 'Internazionale',
    
    // Patent Agencies
    connectedToAgencies: 'Collegato alle Principali Agenzie Brevetti Mondiali',
    realTimeData: 'Dati in tempo reale',
    globalCoverage: 'Copertura globale',
    officialApis: 'API ufficiali',
    
    // Features
    instantVerification: 'Verifica Istantanea dei Brevetti',
    accelerateRD: 'Accelera la tua R&S',
    guaranteedSavings: 'Risparmi Garantiti',
    internationalCoverage: 'Copertura Internazionale',
    riskAnalysis: 'Analisi dei Rischi',
    smartAlternatives: 'Alternative Intelligenti',
    
    // Benefits
    avoidLawsuits: 'Evita costose cause per violazione di brevetti',
    reduceCosts: 'Riduci i costi di consulenza fino al 90%',
    accelerateTimeToMarket: 'Accelera il time-to-market dei nuovi prodotti',
    identifyOpportunities: 'Identifica opportunità di mercato inesplorate',
    minimizeRisks: 'Minimizza i rischi normativi ed etici',
    optimizeInvestments: 'Ottimizza gli investimenti in R&S',
    
    // Stats
    consultationsPerformed: 'Consultazioni Eseguite',
    companiesServed: 'Aziende Servite',
    analysisAccuracy: 'Precisione delle Analisi',
    availability: 'Disponibilità',
    
    // Footer
    platformDescription: 'Piattaforma di intelligenza artificiale specializzata nell\'analisi di brevetti farmaceutici, proteggendo le aziende e accelerando l\'innovazione.',
    product: 'Prodotto',
    support: 'Supporto',
    termsOfUse: 'Termini di Utilizzo',
    privacy: 'Privacy',
    allRightsReserved: 'Tutti i diritti riservati',
    
    // Forms
    fullName: 'Nome Completo',
    password: 'Password',
    confirmPassword: 'Conferma Password',
    createAccount: 'Crea Account',
    alreadyHaveAccount: 'Hai già un account?',
    dontHaveAccount: 'Non hai un account?',
    forgotPassword: 'Password dimenticata?',
    
    // Errors and Messages
    invalidEmail: 'Email non valida',
    passwordTooShort: 'Password troppo corta',
    passwordsDoNotMatch: 'Le password non corrispondono',
    emailAlreadyInUse: 'Email già in uso',
    userNotFound: 'Utente non trovato',
    wrongPassword: 'Password errata',
    networkError: 'Errore di rete',
    
    // Patent Results
    substanceAnalyzed: 'Sostanza Analizzata',
    patentVigent: 'Brevetto Attivo',
    yes: 'SÌ',
    no: 'NO',
    permitted: 'CONSENTITO',
    restricted: 'LIMITATO',
    mainPatentExpiration: 'Scadenza Brevetto Principale',
    newProductExpiration: 'Scadenza Nuovo Prodotto',
    noCountriesRegistered: 'Nessun paese registrato segnalato',
    noRisksReported: 'Nessun rischio normativo segnalato',
    noAlternativesFound: 'Nessuna alternativa trovata',
    
    // Actions
    viewDetails: 'Visualizza Dettagli',
    downloadReport: 'Scarica Report',
    shareResults: 'Condividi Risultati',
    consultAnother: 'Consulta un Altro',
    
    // Security
    securePayment: 'Pagamento Sicuro',
    pciCompliant: 'Certificato PCI DSS',
    fraudProtection: 'Protezione Anti-Frode',
    
    // AI Output Translations
    aiAnalysisComplete: 'Analisi IA completata',
    patentAnalysisResults: 'Risultati dell\'analisi dei brevetti',
    substanceBeingAnalyzed: 'Sostanza in analisi',
    patentStatusAnalysis: 'Analisi dello stato del brevetto',
    expirationDatesInfo: 'Informazioni sulle date di scadenza',
    registeredCountriesInfo: 'Informazioni sui paesi registrati',
    regulatoryRisksInfo: 'Informazioni sui rischi normativi',
    alternativeCompoundsInfo: 'Informazioni sui composti alternativi',
    
    // Common UI Elements
    close: 'Chiudi',
    open: 'Apri',
    next: 'Successivo',
    previous: 'Precedente',
    submit: 'Invia',
    reset: 'Reimposta',
    clear: 'Cancella',
    search: 'Cerca',
    filter: 'Filtra',
    sort: 'Ordina',
    
    // Status Messages
    processingRequest: 'Elaborazione richiesta',
    requestCompleted: 'Richiesta completata',
    requestFailed: 'Richiesta fallita',
    tryAgain: 'Riprova',
    pleaseWait: 'Attendere prego'
  },
  
  es: {
    // Navigation and Common
    home: 'Inicio',
    about: 'Acerca de',
    contact: 'Contacto',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    back: 'Volver',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    remove: 'Quitar',
    confirm: 'Confirmar',
    loading: 'Cargando',
    error: 'Error',
    success: 'Éxito',
    
    // App Name and Branding
    appName: 'Consulta de Patentes',
    appDescription: 'Análisis inteligente de propiedad intelectual farmacéutica',
    
    // Landing Page
    landingTitle: 'Verifica Patentes Farmacéuticas en Segundos',
    landingSubtitle: 'Protege tu empresa de riesgos legales, acelera tu I+D y ahorra millones',
    landingDescription: 'Nuestra plataforma de inteligencia artificial especializada en propiedad intelectual farmacéutica ofrece análisis precisos e instantáneos.',
    startFree: 'Comenzar Gratis',
    learnMore: 'Saber Más',
    features: 'Características',
    pricing: 'Precios',
    testimonials: 'Testimonios',
    freeConsultations: '100 consultas gratuitas',
    noCreditCard: 'Sin tarjeta de crédito',
    immediateAccess: 'Acceso inmediato',
    
    // Patent Consultation
    patentConsultation: 'Consulta de Patentes',
    newConsultation: 'Nueva Consulta de Patente',
    newConsultationDescription: 'Ingresa el nombre del producto o sustancia para verificar el estado de la patente',
    productName: 'Nombre del Producto',
    consultPatent: 'Consultar',
    consulting: 'Consultando',
    patentStatus: 'Estado de la Patente',
    patentActive: 'Patente Activa',
    patentExpired: 'Patente Expirada',
    expirationDate: 'Fecha de Expiración',
    registeredCountries: 'Países Registrados',
    commercialExploration: 'Explotación Comercial',
    regulatoryRisks: 'Riesgos Regulatorios y Éticos',
    alternativeCompounds: 'Compuestos Análogos Alternativos',
    patentHistory: 'Historial de Patentes',
    loadingPatentInfo: 'Cargando información de patentes',
    analyzingDatabases: 'Analizando bases de datos internacionales...',
    
    // Login and Auth
    loginTitle: 'Inicia sesión en tu cuenta',
    loginDescription: 'Accede a tu cuenta para consultar patentes',
    enterYourCredentials: 'Ingresa tus credenciales para acceder',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Contraseña',
    loginButton: 'Iniciar Sesión',
    loggingIn: 'Iniciando sesión...',
    
    // User Profile
    profile: 'Perfil',
    name: 'Nombre',
    email: 'Email',
    company: 'Empresa',
    phone: 'Teléfono',
    cpf: 'ID Fiscal',
    updateProfile: 'Actualizar Perfil',
    resetPassword: 'Restablecer Contraseña',
    deleteAccount: 'Eliminar Cuenta',
    dangerZone: 'Zona de Peligro',
    
    // Plans
    plans: 'Planes',
    choosePlan: 'Elige tu Plan',
    currentPlan: 'Plan Actual',
    upgradeButton: 'Actualizar Plan',
    researcher: 'Investigador',
    analyst: 'Analista',
    specialist: 'Especialista',
    director: 'Director',
    
    // Token Usage
    tokenUsage: 'Uso de Tokens',
    remaining: 'restantes',
    renewalOn: 'Renovación el',
    upgradePlan: 'Actualizar plan',
    
    // Languages
    portuguese: 'Portugués',
    english: 'Inglés',
    french: 'Francés',
    italian: 'Italiano',
    spanish: 'Español',
    
    // Countries
    brazil: 'Brasil',
    unitedStates: 'Estados Unidos',
    germany: 'Alemania',
    france: 'Francia',
    unitedKingdom: 'Reino Unido',
    japan: 'Japón',
    china: 'China',
    southKorea: 'Corea del Sur',
    canada: 'Canadá',
    australia: 'Australia',
    india: 'India',
    italy: 'Italia',
    spain: 'España',
    netherlands: 'Países Bajos',
    switzerland: 'Suiza',
    sweden: 'Suecia',
    norway: 'Noruega',
    denmark: 'Dinamarca',
    finland: 'Finlandia',
    belgium: 'Bélgica',
    austria: 'Austria',
    portugal: 'Portugal',
    mexico: 'México',
    argentina: 'Argentina',
    chile: 'Chile',
    colombia: 'Colombia',
    peru: 'Perú',
    uruguay: 'Uruguay',
    russia: 'Rusia',
    southAfrica: 'Sudáfrica',
    israel: 'Israel',
    singapore: 'Singapur',
    thailand: 'Tailandia',
    malaysia: 'Malasia',
    indonesia: 'Indonesia',
    philippines: 'Filipinas',
    vietnam: 'Vietnam',
    taiwan: 'Taiwán',
    hongKong: 'Hong Kong',
    newZealand: 'Nueva Zelanda',
    europeanUnion: 'Unión Europea',
    international: 'Internacional',
    
    // Patent Agencies
    connectedToAgencies: 'Conectado a las Principales Agencias de Patentes Mundiales',
    realTimeData: 'Datos en tiempo real',
    globalCoverage: 'Cobertura global',
    officialApis: 'APIs oficiales',
    
    // Features
    instantVerification: 'Verificación Instantánea de Patentes',
    accelerateRD: 'Acelera tu I+D',
    guaranteedSavings: 'Ahorros Garantizados',
    internationalCoverage: 'Cobertura Internacional',
    riskAnalysis: 'Análisis de Riesgos',
    smartAlternatives: 'Alternativas Inteligentes',
    
    // Benefits
    avoidLawsuits: 'Evita demandas costosas por violación de patentes',
    reduceCosts: 'Reduce los costos de consultoría hasta un 90%',
    accelerateTimeToMarket: 'Acelera el time-to-market de nuevos productos',
    identifyOpportunities: 'Identifica oportunidades de mercado inexploradas',
    minimizeRisks: 'Minimiza los riesgos regulatorios y éticos',
    optimizeInvestments: 'Optimiza las inversiones en I+D',
    
    // Stats
    consultationsPerformed: 'Consultas Realizadas',
    companiesServed: 'Empresas Atendidas',
    analysisAccuracy: 'Precisión de los Análisis',
    availability: 'Disponibilidad',
    
    // Footer
    platformDescription: 'Plataforma de inteligencia artificial especializada en análisis de patentes farmacéuticas, protegiendo empresas y acelerando la innovación.',
    product: 'Producto',
    support: 'Soporte',
    termsOfUse: 'Términos de Uso',
    privacy: 'Privacidad',
    allRightsReserved: 'Todos los derechos reservados',
    
    // Forms
    fullName: 'Nombre Completo',
    password: 'Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    createAccount: 'Crear Cuenta',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    dontHaveAccount: '¿No tienes una cuenta?',
    forgotPassword: '¿Olvidaste tu contraseña?',
    
    // Errors and Messages
    invalidEmail: 'Email inválido',
    passwordTooShort: 'Contraseña muy corta',
    passwordsDoNotMatch: 'Las contraseñas no coinciden',
    emailAlreadyInUse: 'Email ya está en uso',
    userNotFound: 'Usuario no encontrado',
    wrongPassword: 'Contraseña incorrecta',
    networkError: 'Error de red',
    
    // Patent Results
    substanceAnalyzed: 'Sustancia Analizada',
    patentVigent: 'Patente Activa',
    yes: 'SÍ',
    no: 'NO',
    permitted: 'PERMITIDO',
    restricted: 'RESTRINGIDO',
    mainPatentExpiration: 'Expiración de Patente Principal',
    newProductExpiration: 'Expiración de Nuevo Producto',
    noCountriesRegistered: 'No se reportaron países registrados',
    noRisksReported: 'No se reportaron riesgos regulatorios',
    noAlternativesFound: 'No se encontraron alternativas',
    
    // Actions
    viewDetails: 'Ver Detalles',
    downloadReport: 'Descargar Reporte',
    shareResults: 'Compartir Resultados',
    consultAnother: 'Consultar Otro',
    
    // Security
    securePayment: 'Pago Seguro',
    pciCompliant: 'Certificado PCI DSS',
    fraudProtection: 'Protección Anti-Fraude',
    
    // AI Output Translations
    aiAnalysisComplete: 'Análisis de IA completado',
    patentAnalysisResults: 'Resultados del análisis de patentes',
    substanceBeingAnalyzed: 'Sustancia siendo analizada',
    patentStatusAnalysis: 'Análisis del estado de la patente',
    expirationDatesInfo: 'Información sobre fechas de expiración',
    registeredCountriesInfo: 'Información sobre países registrados',
    regulatoryRisksInfo: 'Información sobre riesgos regulatorios',
    alternativeCompoundsInfo: 'Información sobre compuestos alternativos',
    
    // Common UI Elements
    close: 'Cerrar',
    open: 'Abrir',
    next: 'Siguiente',
    previous: 'Anterior',
    submit: 'Enviar',
    reset: 'Restablecer',
    clear: 'Limpiar',
    search: 'Buscar',
    filter: 'Filtrar',
    sort: 'Ordenar',
    
    // Status Messages
    processingRequest: 'Procesando solicitud',
    requestCompleted: 'Solicitud completada',
    requestFailed: 'Solicitud fallida',
    tryAgain: 'Intentar de nuevo',
    pleaseWait: 'Por favor espere'
  }
};

// Function to detect user's preferred language
const detectUserLanguage = (): Language => {
  // Check localStorage first
  const saved = localStorage.getItem('language') as Language;
  if (saved && saved in translations) {
    return saved;
  }
  
  // Check browser language
  const browserLang = navigator.language.toLowerCase();
  
  // Map browser language codes to our supported languages
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('es')) return 'es';
  
  // Try to detect by country code (optional, more advanced detection)
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes('America/Sao_Paulo') || timezone.includes('America/Recife')) return 'pt';
    if (timezone.includes('Europe/Madrid') || timezone.includes('Europe/Madrid')) return 'es';
    if (timezone.includes('Europe/Paris')) return 'fr';
    if (timezone.includes('Europe/Rome')) return 'it';
  } catch (e) {
    // Ignore timezone detection errors
  }
  
  // Default to Portuguese
  return 'pt';
};

// Language context
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}>({
  language: 'pt',
  setLanguage: () => {},
  t: translations.pt
});

// Hook to use translation
export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return default Portuguese translations if context is not available
    return {
      language: 'pt' as Language,
      setLanguage: () => {},
      t: translations.pt
    };
  }
  return context;
};

// Language provider component
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return detectUserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update document language and title
    document.documentElement.lang = lang;
    document.title = `${translations[lang].appName} - ${translations[lang].appDescription}`;
  };

  useEffect(() => {
    // Set initial document language and title
    document.documentElement.lang = language;
    document.title = `${translations[language].appName} - ${translations[language].appDescription}`;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Export translations for direct access if needed
export { translations };
export type { Translations };