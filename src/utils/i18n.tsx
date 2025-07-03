import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en' | 'fr' | 'it' | 'es';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

interface Translations {
  // App name and branding
  appName: string;
  patentConsultation: string;
  platformDescription: string;
  
  // Navigation and buttons
  back: string;
  login: string;
  logout: string;
  register: string;
  startFree: string;
  plans: string;
  upgradeButton: string;
  save: string;
  cancel: string;
  confirm: string;
  delete: string;
  edit: string;
  add: string;
  remove: string;
  
  // Authentication
  loginTitle: string;
  loginDescription: string;
  loginButton: string;
  loggingIn: string;
  createAccount: string;
  forgotPassword: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  
  // Errors and validation
  error: string;
  loading: string;
  networkError: string;
  invalidEmail: string;
  passwordTooShort: string;
  userNotFound: string;
  wrongPassword: string;
  
  // Patent consultation
  newConsultation: string;
  consultPatent: string;
  consulting: string;
  consultationPlaceholder: string;
  substanceAnalyzed: string;
  patentStatus: string;
  patentVigent: string;
  commercialExploration: string;
  mainPatentExpiration: string;
  newProductExpiration: string;
  registeredCountries: string;
  noCountriesRegistered: string;
  regulatoryRisks: string;
  alternativeCompounds: string;
  yes: string;
  no: string;
  permitted: string;
  restricted: string;
  
  // Token usage
  tokenUsage: string;
  remaining: string;
  renewalOn: string;
  upgradePlan: string;
  tokenLimitReached: string;
  updatePlan: string;
  
  // Languages
  portuguese: string;
  english: string;
  french: string;
  italian: string;
  spanish: string;
  
  // Landing page
  landingTitle: string;
  landingDescription: string;
  freeConsultations: string;
  noCreditCard: string;
  immediateAccess: string;
  instantVerification: string;
  accelerateRD: string;
  guaranteedSavings: string;
  internationalCoverage: string;
  riskAnalysis: string;
  smartAlternatives: string;
  avoidLawsuits: string;
  reduceCosts: string;
  accelerateTimeToMarket: string;
  identifyOpportunities: string;
  minimizeRisks: string;
  optimizeInvestments: string;
  consultationsPerformed: string;
  companiesServed: string;
  analysisAccuracy: string;
  availability: string;
  connectedToAgencies: string;
  realTimeData: string;
  globalCoverage: string;
  officialApis: string;
  product: string;
  support: string;
  contact: string;
  termsOfUse: string;
  privacy: string;
  allRightsReserved: string;
  
  // Plans - EXPANDED
  planPesquisador: string;
  planAnalista: string;
  planEspecialista: string;
  planDiretor: string;
  planPesquisadorDescription: string;
  planAnalistaDescription: string;
  planEspecialistaDescription: string;
  planDiretorDescription: string;
  choosePlan: string;
  unlockPowerDescription: string;
  mostPopular: string;
  free: string;
  consultations: string;
  initialPlan: string;
  currentPlan: string;
  startNow: string;
  researcherPlanError: string;
  errorProcessingRequest: string;
  securePayment: string;
  pciCertified: string;
  fraudProtection: string;
  
  // Support
  whatsappSupport: string;
  
  // Footer
  copyright: string;
  
  // Sidebar
  newChallenge: string;
  pipelineCRM: string;
  challenges: string;
  
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
}

const translations: Record<Language, Translations> = {
  pt: {
    // App name and branding
    appName: 'Consulta de Patentes',
    patentConsultation: 'Consulta de Patentes',
    platformDescription: 'Plataforma especializada em consulta e análise de patentes farmacêuticas com inteligência artificial.',
    
    // Navigation and buttons
    back: 'Voltar',
    login: 'Entrar',
    logout: 'Sair',
    register: 'Registrar',
    startFree: 'Começar Grátis',
    plans: 'Planos',
    upgradeButton: 'Atualizar Plano',
    save: 'Salvar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Excluir',
    edit: 'Editar',
    add: 'Adicionar',
    remove: 'Remover',
    
    // Authentication
    loginTitle: 'Entrar na sua conta',
    loginDescription: 'Acesse sua conta para consultar patentes farmacêuticas',
    loginButton: 'Entrar',
    loggingIn: 'Entrando...',
    createAccount: 'Criar conta',
    forgotPassword: 'Esqueceu a senha?',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Senha',
    
    // Errors and validation
    error: 'Erro',
    loading: 'Carregando',
    networkError: 'Erro de conexão. Verifique sua internet.',
    invalidEmail: 'Email inválido',
    passwordTooShort: 'A senha deve ter pelo menos 6 caracteres',
    userNotFound: 'Usuário não encontrado',
    wrongPassword: 'Senha incorreta',
    
    // Patent consultation
    newConsultation: 'Nova Consulta',
    consultPatent: 'Consultar Patente',
    consulting: 'Consultando',
    consultationPlaceholder: 'Digite o nome do produto ou substância para verificar o status da patente',
    substanceAnalyzed: 'Substância Analisada',
    patentStatus: 'Status da Patente',
    patentVigent: 'Patente Vigente',
    commercialExploration: 'Exploração Comercial',
    mainPatentExpiration: 'Expiração da Patente Principal',
    newProductExpiration: 'Expiração para Novo Produto',
    registeredCountries: 'Países Registrados',
    noCountriesRegistered: 'Nenhum país registrado',
    regulatoryRisks: 'Riscos Regulatórios',
    alternativeCompounds: 'Compostos Alternativos',
    yes: 'Sim',
    no: 'Não',
    permitted: 'Permitida',
    restricted: 'Restrita',
    
    // Token usage
    tokenUsage: 'Uso de Tokens',
    remaining: 'restantes',
    renewalOn: 'Renovação em',
    upgradePlan: 'Atualizar plano',
    tokenLimitReached: 'Limite de tokens atingido para o plano',
    updatePlan: 'Atualize seu plano para continuar.',
    
    // Languages
    portuguese: 'Português',
    english: 'Inglês',
    french: 'Francês',
    italian: 'Italiano',
    spanish: 'Espanhol',
    
    // Landing page
    landingTitle: 'Análise Inteligente de Patentes Farmacêuticas',
    landingDescription: 'Verifique o status de patentes, identifique riscos regulatórios e descubra oportunidades de mercado com nossa IA especializada.',
    freeConsultations: '100 consultas gratuitas',
    noCreditCard: 'Sem cartão de crédito',
    immediateAccess: 'Acesso imediato',
    instantVerification: 'Verificação Instantânea',
    accelerateRD: 'Acelere P&D',
    guaranteedSavings: 'Economia Garantida',
    internationalCoverage: 'Cobertura Internacional',
    riskAnalysis: 'Análise de Riscos',
    smartAlternatives: 'Alternativas Inteligentes',
    avoidLawsuits: 'Evite processos judiciais',
    reduceCosts: 'Reduza custos de desenvolvimento',
    accelerateTimeToMarket: 'Acelere o tempo de mercado',
    identifyOpportunities: 'Identifique oportunidades',
    minimizeRisks: 'Minimize riscos regulatórios',
    optimizeInvestments: 'Otimize investimentos',
    consultationsPerformed: 'Consultas realizadas',
    companiesServed: 'Empresas atendidas',
    analysisAccuracy: 'Precisão da análise',
    availability: 'Disponibilidade',
    connectedToAgencies: 'Conectado às principais agências de patentes',
    realTimeData: 'Dados em tempo real',
    globalCoverage: 'Cobertura global',
    officialApis: 'APIs oficiais',
    product: 'Produto',
    support: 'Suporte',
    contact: 'Contato',
    termsOfUse: 'Termos de Uso',
    privacy: 'Privacidade',
    allRightsReserved: 'Todos os direitos reservados',
    
    // Plans - EXPANDED
    planPesquisador: 'Pesquisador',
    planAnalista: 'Analista',
    planEspecialista: 'Especialista',
    planDiretor: 'Diretor',
    planPesquisadorDescription: 'Plano inicial para pesquisadores que estão começando suas análises de patentes',
    planAnalistaDescription: 'Plano para analistas que precisam de consultas regulares de patentes farmacêuticas',
    planEspecialistaDescription: 'Plano para especialistas em propriedade intelectual farmacêutica',
    planDiretorDescription: 'Plano para diretores de P&D que gerenciam portfólios extensos de patentes',
    choosePlan: 'Escolha seu Plano',
    unlockPowerDescription: 'Desbloqueie o poder da análise de patentes com nossos planos especializados',
    mostPopular: 'Mais Popular',
    free: 'Gratuito',
    consultations: 'consultas',
    initialPlan: 'Plano Inicial',
    currentPlan: 'Plano Atual',
    startNow: 'Começar Agora',
    researcherPlanError: 'O plano Pesquisador é o plano inicial e não pode ser contratado. Por favor, escolha outro plano.',
    errorProcessingRequest: 'Erro ao processar sua solicitação. Por favor, tente novamente.',
    securePayment: 'Pagamento Seguro',
    pciCertified: 'Certificado PCI DSS',
    fraudProtection: 'Proteção Antifraude',
    
    // Support
    whatsappSupport: 'Suporte via WhatsApp',
    
    // Footer
    copyright: '© 2025 Consulta de Patentes. Todos os direitos reservados.',
    
    // Sidebar
    newChallenge: 'Novo Desafio',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Desafios',
    
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
    international: 'Internacional'
  },
  
  en: {
    // App name and branding
    appName: 'Patent Consultation',
    patentConsultation: 'Patent Consultation',
    platformDescription: 'Specialized platform for pharmaceutical patent consultation and analysis with artificial intelligence.',
    
    // Navigation and buttons
    back: 'Back',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    startFree: 'Start Free',
    plans: 'Plans',
    upgradeButton: 'Upgrade Plan',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    
    // Authentication
    loginTitle: 'Sign in to your account',
    loginDescription: 'Access your account to consult pharmaceutical patents',
    loginButton: 'Sign In',
    loggingIn: 'Signing in...',
    createAccount: 'Create account',
    forgotPassword: 'Forgot password?',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    
    // Errors and validation
    error: 'Error',
    loading: 'Loading',
    networkError: 'Connection error. Check your internet.',
    invalidEmail: 'Invalid email',
    passwordTooShort: 'Password must be at least 6 characters',
    userNotFound: 'User not found',
    wrongPassword: 'Incorrect password',
    
    // Patent consultation
    newConsultation: 'New Consultation',
    consultPatent: 'Consult Patent',
    consulting: 'Consulting',
    consultationPlaceholder: 'Enter the product or substance name to check patent status',
    substanceAnalyzed: 'Analyzed Substance',
    patentStatus: 'Patent Status',
    patentVigent: 'Patent Valid',
    commercialExploration: 'Commercial Exploration',
    mainPatentExpiration: 'Main Patent Expiration',
    newProductExpiration: 'New Product Expiration',
    registeredCountries: 'Registered Countries',
    noCountriesRegistered: 'No countries registered',
    regulatoryRisks: 'Regulatory Risks',
    alternativeCompounds: 'Alternative Compounds',
    yes: 'Yes',
    no: 'No',
    permitted: 'Permitted',
    restricted: 'Restricted',
    
    // Token usage
    tokenUsage: 'Token Usage',
    remaining: 'remaining',
    renewalOn: 'Renewal on',
    upgradePlan: 'Upgrade plan',
    tokenLimitReached: 'Token limit reached for plan',
    updatePlan: 'Upgrade your plan to continue.',
    
    // Languages
    portuguese: 'Portuguese',
    english: 'English',
    french: 'French',
    italian: 'Italian',
    spanish: 'Spanish',
    
    // Landing page
    landingTitle: 'Intelligent Pharmaceutical Patent Analysis',
    landingDescription: 'Check patent status, identify regulatory risks and discover market opportunities with our specialized AI.',
    freeConsultations: '100 free consultations',
    noCreditCard: 'No credit card required',
    immediateAccess: 'Immediate access',
    instantVerification: 'Instant Verification',
    accelerateRD: 'Accelerate R&D',
    guaranteedSavings: 'Guaranteed Savings',
    internationalCoverage: 'International Coverage',
    riskAnalysis: 'Risk Analysis',
    smartAlternatives: 'Smart Alternatives',
    avoidLawsuits: 'Avoid lawsuits',
    reduceCosts: 'Reduce development costs',
    accelerateTimeToMarket: 'Accelerate time to market',
    identifyOpportunities: 'Identify opportunities',
    minimizeRisks: 'Minimize regulatory risks',
    optimizeInvestments: 'Optimize investments',
    consultationsPerformed: 'Consultations performed',
    companiesServed: 'Companies served',
    analysisAccuracy: 'Analysis accuracy',
    availability: 'Availability',
    connectedToAgencies: 'Connected to major patent agencies',
    realTimeData: 'Real-time data',
    globalCoverage: 'Global coverage',
    officialApis: 'Official APIs',
    product: 'Product',
    support: 'Support',
    contact: 'Contact',
    termsOfUse: 'Terms of Use',
    privacy: 'Privacy',
    allRightsReserved: 'All rights reserved',
    
    // Plans - EXPANDED
    planPesquisador: 'Researcher',
    planAnalista: 'Analyst',
    planEspecialista: 'Specialist',
    planDiretor: 'Director',
    planPesquisadorDescription: 'Initial plan for researchers starting their patent analysis',
    planAnalistaDescription: 'Plan for analysts who need regular pharmaceutical patent consultations',
    planEspecialistaDescription: 'Plan for pharmaceutical intellectual property specialists',
    planDiretorDescription: 'Plan for R&D directors managing extensive patent portfolios',
    choosePlan: 'Choose Your Plan',
    unlockPowerDescription: 'Unlock the power of patent analysis with our specialized plans',
    mostPopular: 'Most Popular',
    free: 'Free',
    consultations: 'consultations',
    initialPlan: 'Initial Plan',
    currentPlan: 'Current Plan',
    startNow: 'Start Now',
    researcherPlanError: 'The Researcher plan is the initial plan and cannot be purchased. Please choose another plan.',
    errorProcessingRequest: 'Error processing your request. Please try again.',
    securePayment: 'Secure Payment',
    pciCertified: 'PCI DSS Certified',
    fraudProtection: 'Fraud Protection',
    
    // Support
    whatsappSupport: 'WhatsApp Support',
    
    // Footer
    copyright: '© 2025 Patent Consultation. All rights reserved.',
    
    // Sidebar
    newChallenge: 'New Challenge',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Challenges',
    
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
    international: 'International'
  },
  
  fr: {
    // App name and branding
    appName: 'Consultation de Brevets',
    patentConsultation: 'Consultation de Brevets',
    platformDescription: 'Plateforme spécialisée dans la consultation et l\'analyse de brevets pharmaceutiques avec intelligence artificielle.',
    
    // Navigation and buttons
    back: 'Retour',
    login: 'Connexion',
    logout: 'Déconnexion',
    register: 'S\'inscrire',
    startFree: 'Commencer Gratuitement',
    plans: 'Plans',
    upgradeButton: 'Mettre à Niveau',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    confirm: 'Confirmer',
    delete: 'Supprimer',
    edit: 'Modifier',
    add: 'Ajouter',
    remove: 'Retirer',
    
    // Authentication
    loginTitle: 'Connectez-vous à votre compte',
    loginDescription: 'Accédez à votre compte pour consulter les brevets pharmaceutiques',
    loginButton: 'Se Connecter',
    loggingIn: 'Connexion...',
    createAccount: 'Créer un compte',
    forgotPassword: 'Mot de passe oublié?',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Mot de passe',
    
    // Errors and validation
    error: 'Erreur',
    loading: 'Chargement',
    networkError: 'Erreur de connexion. Vérifiez votre internet.',
    invalidEmail: 'Email invalide',
    passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères',
    userNotFound: 'Utilisateur non trouvé',
    wrongPassword: 'Mot de passe incorrect',
    
    // Patent consultation
    newConsultation: 'Nouvelle Consultation',
    consultPatent: 'Consulter le Brevet',
    consulting: 'Consultation',
    consultationPlaceholder: 'Entrez le nom du produit ou de la substance pour vérifier le statut du brevet',
    substanceAnalyzed: 'Substance Analysée',
    patentStatus: 'Statut du Brevet',
    patentVigent: 'Brevet Valide',
    commercialExploration: 'Exploitation Commerciale',
    mainPatentExpiration: 'Expiration du Brevet Principal',
    newProductExpiration: 'Expiration du Nouveau Produit',
    registeredCountries: 'Pays Enregistrés',
    noCountriesRegistered: 'Aucun pays enregistré',
    regulatoryRisks: 'Risques Réglementaires',
    alternativeCompounds: 'Composés Alternatifs',
    yes: 'Oui',
    no: 'Non',
    permitted: 'Autorisée',
    restricted: 'Restreinte',
    
    // Token usage
    tokenUsage: 'Utilisation des Jetons',
    remaining: 'restants',
    renewalOn: 'Renouvellement le',
    upgradePlan: 'Mettre à niveau le plan',
    tokenLimitReached: 'Limite de jetons atteinte pour le plan',
    updatePlan: 'Mettez à niveau votre plan pour continuer.',
    
    // Languages
    portuguese: 'Portugais',
    english: 'Anglais',
    french: 'Français',
    italian: 'Italien',
    spanish: 'Espagnol',
    
    // Landing page
    landingTitle: 'Analyse Intelligente de Brevets Pharmaceutiques',
    landingDescription: 'Vérifiez le statut des brevets, identifiez les risques réglementaires et découvrez les opportunités de marché avec notre IA spécialisée.',
    freeConsultations: '100 consultations gratuites',
    noCreditCard: 'Aucune carte de crédit requise',
    immediateAccess: 'Accès immédiat',
    instantVerification: 'Vérification Instantanée',
    accelerateRD: 'Accélérer R&D',
    guaranteedSavings: 'Économies Garanties',
    internationalCoverage: 'Couverture Internationale',
    riskAnalysis: 'Analyse des Risques',
    smartAlternatives: 'Alternatives Intelligentes',
    avoidLawsuits: 'Éviter les poursuites',
    reduceCosts: 'Réduire les coûts de développement',
    accelerateTimeToMarket: 'Accélérer la mise sur le marché',
    identifyOpportunities: 'Identifier les opportunités',
    minimizeRisks: 'Minimiser les risques réglementaires',
    optimizeInvestments: 'Optimiser les investissements',
    consultationsPerformed: 'Consultations effectuées',
    companiesServed: 'Entreprises servies',
    analysisAccuracy: 'Précision de l\'analyse',
    availability: 'Disponibilité',
    connectedToAgencies: 'Connecté aux principales agences de brevets',
    realTimeData: 'Données en temps réel',
    globalCoverage: 'Couverture mondiale',
    officialApis: 'APIs officielles',
    product: 'Produit',
    support: 'Support',
    contact: 'Contact',
    termsOfUse: 'Conditions d\'Utilisation',
    privacy: 'Confidentialité',
    allRightsReserved: 'Tous droits réservés',
    
    // Plans - EXPANDED
    planPesquisador: 'Chercheur',
    planAnalista: 'Analyste',
    planEspecialista: 'Spécialiste',
    planDiretor: 'Directeur',
    planPesquisadorDescription: 'Plan initial pour les chercheurs commençant leur analyse de brevets',
    planAnalistaDescription: 'Plan pour les analystes nécessitant des consultations régulières de brevets pharmaceutiques',
    planEspecialistaDescription: 'Plan pour les spécialistes en propriété intellectuelle pharmaceutique',
    planDiretorDescription: 'Plan pour les directeurs R&D gérant des portefeuilles étendus de brevets',
    choosePlan: 'Choisissez Votre Plan',
    unlockPowerDescription: 'Débloquez la puissance de l\'analyse de brevets avec nos plans spécialisés',
    mostPopular: 'Plus Populaire',
    free: 'Gratuit',
    consultations: 'consultations',
    initialPlan: 'Plan Initial',
    currentPlan: 'Plan Actuel',
    startNow: 'Commencer Maintenant',
    researcherPlanError: 'Le plan Chercheur est le plan initial et ne peut pas être acheté. Veuillez choisir un autre plan.',
    errorProcessingRequest: 'Erreur lors du traitement de votre demande. Veuillez réessayer.',
    securePayment: 'Paiement Sécurisé',
    pciCertified: 'Certifié PCI DSS',
    fraudProtection: 'Protection Antifraude',
    
    // Support
    whatsappSupport: 'Support WhatsApp',
    
    // Footer
    copyright: '© 2025 Consultation de Brevets. Tous droits réservés.',
    
    // Sidebar
    newChallenge: 'Nouveau Défi',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Défis',
    
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
    taiwan: 'Taiwan',
    hongKong: 'Hong Kong',
    newZealand: 'Nouvelle-Zélande',
    europeanUnion: 'Union Européenne',
    international: 'International'
  },
  
  it: {
    // App name and branding
    appName: 'Consultazione Brevetti',
    patentConsultation: 'Consultazione Brevetti',
    platformDescription: 'Piattaforma specializzata nella consultazione e analisi di brevetti farmaceutici con intelligenza artificiale.',
    
    // Navigation and buttons
    back: 'Indietro',
    login: 'Accedi',
    logout: 'Esci',
    register: 'Registrati',
    startFree: 'Inizia Gratis',
    plans: 'Piani',
    upgradeButton: 'Aggiorna Piano',
    save: 'Salva',
    cancel: 'Annulla',
    confirm: 'Conferma',
    delete: 'Elimina',
    edit: 'Modifica',
    add: 'Aggiungi',
    remove: 'Rimuovi',
    
    // Authentication
    loginTitle: 'Accedi al tuo account',
    loginDescription: 'Accedi al tuo account per consultare i brevetti farmaceutici',
    loginButton: 'Accedi',
    loggingIn: 'Accesso...',
    createAccount: 'Crea account',
    forgotPassword: 'Password dimenticata?',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    
    // Errors and validation
    error: 'Errore',
    loading: 'Caricamento',
    networkError: 'Errore di connessione. Controlla la tua internet.',
    invalidEmail: 'Email non valida',
    passwordTooShort: 'La password deve essere di almeno 6 caratteri',
    userNotFound: 'Utente non trovato',
    wrongPassword: 'Password errata',
    
    // Patent consultation
    newConsultation: 'Nuova Consultazione',
    consultPatent: 'Consulta Brevetto',
    consulting: 'Consultazione',
    consultationPlaceholder: 'Inserisci il nome del prodotto o della sostanza per verificare lo stato del brevetto',
    substanceAnalyzed: 'Sostanza Analizzata',
    patentStatus: 'Stato del Brevetto',
    patentVigent: 'Brevetto Valido',
    commercialExploration: 'Sfruttamento Commerciale',
    mainPatentExpiration: 'Scadenza Brevetto Principale',
    newProductExpiration: 'Scadenza Nuovo Prodotto',
    registeredCountries: 'Paesi Registrati',
    noCountriesRegistered: 'Nessun paese registrato',
    regulatoryRisks: 'Rischi Normativi',
    alternativeCompounds: 'Composti Alternativi',
    yes: 'Sì',
    no: 'No',
    permitted: 'Permesso',
    restricted: 'Limitato',
    
    // Token usage
    tokenUsage: 'Utilizzo Token',
    remaining: 'rimanenti',
    renewalOn: 'Rinnovo il',
    upgradePlan: 'Aggiorna piano',
    tokenLimitReached: 'Limite token raggiunto per il piano',
    updatePlan: 'Aggiorna il tuo piano per continuare.',
    
    // Languages
    portuguese: 'Portoghese',
    english: 'Inglese',
    french: 'Francese',
    italian: 'Italiano',
    spanish: 'Spagnolo',
    
    // Landing page
    landingTitle: 'Analisi Intelligente di Brevetti Farmaceutici',
    landingDescription: 'Verifica lo stato dei brevetti, identifica i rischi normativi e scopri le opportunità di mercato con la nostra IA specializzata.',
    freeConsultations: '100 consultazioni gratuite',
    noCreditCard: 'Nessuna carta di credito richiesta',
    immediateAccess: 'Accesso immediato',
    instantVerification: 'Verifica Istantanea',
    accelerateRD: 'Accelera R&S',
    guaranteedSavings: 'Risparmi Garantiti',
    internationalCoverage: 'Copertura Internazionale',
    riskAnalysis: 'Analisi dei Rischi',
    smartAlternatives: 'Alternative Intelligenti',
    avoidLawsuits: 'Evita cause legali',
    reduceCosts: 'Riduci i costi di sviluppo',
    accelerateTimeToMarket: 'Accelera il time-to-market',
    identifyOpportunities: 'Identifica opportunità',
    minimizeRisks: 'Minimizza i rischi normativi',
    optimizeInvestments: 'Ottimizza gli investimenti',
    consultationsPerformed: 'Consultazioni eseguite',
    companiesServed: 'Aziende servite',
    analysisAccuracy: 'Precisione dell\'analisi',
    availability: 'Disponibilità',
    connectedToAgencies: 'Collegato alle principali agenzie di brevetti',
    realTimeData: 'Dati in tempo reale',
    globalCoverage: 'Copertura globale',
    officialApis: 'API ufficiali',
    product: 'Prodotto',
    support: 'Supporto',
    contact: 'Contatto',
    termsOfUse: 'Termini di Utilizzo',
    privacy: 'Privacy',
    allRightsReserved: 'Tutti i diritti riservati',
    
    // Plans - EXPANDED
    planPesquisador: 'Ricercatore',
    planAnalista: 'Analista',
    planEspecialista: 'Specialista',
    planDiretor: 'Direttore',
    planPesquisadorDescription: 'Piano iniziale per ricercatori che iniziano la loro analisi di brevetti',
    planAnalistaDescription: 'Piano per analisti che necessitano di consultazioni regolari di brevetti farmaceutici',
    planEspecialistaDescription: 'Piano per specialisti in proprietà intellettuale farmaceutica',
    planDiretorDescription: 'Piano per direttori R&S che gestiscono portafogli estesi di brevetti',
    choosePlan: 'Scegli il Tuo Piano',
    unlockPowerDescription: 'Sblocca il potere dell\'analisi di brevetti con i nostri piani specializzati',
    mostPopular: 'Più Popolare',
    free: 'Gratuito',
    consultations: 'consultazioni',
    initialPlan: 'Piano Iniziale',
    currentPlan: 'Piano Attuale',
    startNow: 'Inizia Ora',
    researcherPlanError: 'Il piano Ricercatore è il piano iniziale e non può essere acquistato. Scegli un altro piano.',
    errorProcessingRequest: 'Errore nell\'elaborazione della richiesta. Riprova.',
    securePayment: 'Pagamento Sicuro',
    pciCertified: 'Certificato PCI DSS',
    fraudProtection: 'Protezione Antifrode',
    
    // Support
    whatsappSupport: 'Supporto WhatsApp',
    
    // Footer
    copyright: '© 2025 Consultazione Brevetti. Tutti i diritti riservati.',
    
    // Sidebar
    newChallenge: 'Nuova Sfida',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Sfide',
    
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
    international: 'Internazionale'
  },
  
  es: {
    // App name and branding
    appName: 'Consulta de Patentes',
    patentConsultation: 'Consulta de Patentes',
    platformDescription: 'Plataforma especializada en consulta y análisis de patentes farmacéuticas con inteligencia artificial.',
    
    // Navigation and buttons
    back: 'Volver',
    login: 'Iniciar Sesión',
    logout: 'Cerrar Sesión',
    register: 'Registrarse',
    startFree: 'Comenzar Gratis',
    plans: 'Planes',
    upgradeButton: 'Actualizar Plan',
    save: 'Guardar',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    remove: 'Quitar',
    
    // Authentication
    loginTitle: 'Inicia sesión en tu cuenta',
    loginDescription: 'Accede a tu cuenta para consultar patentes farmacéuticas',
    loginButton: 'Iniciar Sesión',
    loggingIn: 'Iniciando sesión...',
    createAccount: 'Crear cuenta',
    forgotPassword: '¿Olvidaste tu contraseña?',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Contraseña',
    
    // Errors and validation
    error: 'Error',
    loading: 'Cargando',
    networkError: 'Error de conexión. Verifica tu internet.',
    invalidEmail: 'Email inválido',
    passwordTooShort: 'La contraseña debe tener al menos 6 caracteres',
    userNotFound: 'Usuario no encontrado',
    wrongPassword: 'Contraseña incorrecta',
    
    // Patent consultation
    newConsultation: 'Nueva Consulta',
    consultPatent: 'Consultar Patente',
    consulting: 'Consultando',
    consultationPlaceholder: 'Ingresa el nombre del producto o sustancia para verificar el estado de la patente',
    substanceAnalyzed: 'Sustancia Analizada',
    patentStatus: 'Estado de la Patente',
    patentVigent: 'Patente Vigente',
    commercialExploration: 'Explotación Comercial',
    mainPatentExpiration: 'Expiración de Patente Principal',
    newProductExpiration: 'Expiración de Nuevo Producto',
    registeredCountries: 'Países Registrados',
    noCountriesRegistered: 'Ningún país registrado',
    regulatoryRisks: 'Riesgos Regulatorios',
    alternativeCompounds: 'Compuestos Alternativos',
    yes: 'Sí',
    no: 'No',
    permitted: 'Permitida',
    restricted: 'Restringida',
    
    // Token usage
    tokenUsage: 'Uso de Tokens',
    remaining: 'restantes',
    renewalOn: 'Renovación el',
    upgradePlan: 'Actualizar plan',
    tokenLimitReached: 'Límite de tokens alcanzado para el plan',
    updatePlan: 'Actualiza tu plan para continuar.',
    
    // Languages
    portuguese: 'Portugués',
    english: 'Inglés',
    french: 'Francés',
    italian: 'Italiano',
    spanish: 'Español',
    
    // Landing page
    landingTitle: 'Análisis Inteligente de Patentes Farmacéuticas',
    landingDescription: 'Verifica el estado de patentes, identifica riesgos regulatorios y descubre oportunidades de mercado con nuestra IA especializada.',
    freeConsultations: '100 consultas gratuitas',
    noCreditCard: 'Sin tarjeta de crédito',
    immediateAccess: 'Acceso inmediato',
    instantVerification: 'Verificación Instantánea',
    accelerateRD: 'Acelerar I+D',
    guaranteedSavings: 'Ahorros Garantizados',
    internationalCoverage: 'Cobertura Internacional',
    riskAnalysis: 'Análisis de Riesgos',
    smartAlternatives: 'Alternativas Inteligentes',
    avoidLawsuits: 'Evitar demandas',
    reduceCosts: 'Reducir costos de desarrollo',
    accelerateTimeToMarket: 'Acelerar tiempo al mercado',
    identifyOpportunities: 'Identificar oportunidades',
    minimizeRisks: 'Minimizar riesgos regulatorios',
    optimizeInvestments: 'Optimizar inversiones',
    consultationsPerformed: 'Consultas realizadas',
    companiesServed: 'Empresas atendidas',
    analysisAccuracy: 'Precisión del análisis',
    availability: 'Disponibilidad',
    connectedToAgencies: 'Conectado a las principales agencias de patentes',
    realTimeData: 'Datos en tiempo real',
    globalCoverage: 'Cobertura global',
    officialApis: 'APIs oficiales',
    product: 'Producto',
    support: 'Soporte',
    contact: 'Contacto',
    termsOfUse: 'Términos de Uso',
    privacy: 'Privacidad',
    allRightsReserved: 'Todos los derechos reservados',
    
    // Plans - EXPANDED
    planPesquisador: 'Investigador',
    planAnalista: 'Analista',
    planEspecialista: 'Especialista',
    planDiretor: 'Director',
    planPesquisadorDescription: 'Plan inicial para investigadores que comienzan su análisis de patentes',
    planAnalistaDescription: 'Plan para analistas que necesitan consultas regulares de patentes farmacéuticas',
    planEspecialistaDescription: 'Plan para especialistas en propiedad intelectual farmacéutica',
    planDiretorDescription: 'Plan para directores de I+D que gestionan carteras extensas de patentes',
    choosePlan: 'Elige Tu Plan',
    unlockPowerDescription: 'Desbloquea el poder del análisis de patentes con nuestros planes especializados',
    mostPopular: 'Más Popular',
    free: 'Gratuito',
    consultations: 'consultas',
    initialPlan: 'Plan Inicial',
    currentPlan: 'Plan Actual',
    startNow: 'Comenzar Ahora',
    researcherPlanError: 'El plan Investigador es el plan inicial y no se puede comprar. Elige otro plan.',
    errorProcessingRequest: 'Error al procesar tu solicitud. Inténtalo de nuevo.',
    securePayment: 'Pago Seguro',
    pciCertified: 'Certificado PCI DSS',
    fraudProtection: 'Protección Antifraude',
    
    // Support
    whatsappSupport: 'Soporte WhatsApp',
    
    // Footer
    copyright: '© 2025 Consulta de Patentes. Todos los derechos reservados.',
    
    // Sidebar
    newChallenge: 'Nuevo Desafío',
    pipelineCRM: 'Pipeline CRM',
    challenges: 'Desafíos',
    
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
    international: 'Internacional'
  }
};

const LanguageContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

// Function to get language tag for webhook
export const getLanguageTag = (language: Language): string => {
  const languageMap: Record<Language, string> = {
    pt: 'Portuguese',
    en: 'English',
    fr: 'French',
    it: 'Italian',
    es: 'Spanish'
  };
  return languageMap[language];
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved && ['pt', 'en', 'fr', 'it', 'es'].includes(saved)) {
      return saved as Language;
    }
    
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('en')) return 'en';
    if (browserLang.startsWith('fr')) return 'fr';
    if (browserLang.startsWith('it')) return 'it';
    if (browserLang.startsWith('es')) return 'es';
    
    return 'pt';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const value: TranslationContextType = {
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