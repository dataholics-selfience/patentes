import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'pt' | 'en';

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
  save: string;
  cancel: string;
  
  // Authentication
  loginTitle: string;
  loginDescription: string;
  loginButton: string;
  createAccount: string;
  forgotPassword: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  
  // Errors and validation
  error: string;
  loading: string;
  networkError: string;
  
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
  
  // Languages
  portuguese: string;
  english: string;
  
  // Landing page
  landingTitle: string;
  landingDescription: string;
  
  // Plans
  choosePlan: string;
  mostPopular: string;
  consultations: string;
  startNow: string;
  
  // Support
  whatsappSupport: string;
  
  // Footer
  copyright: string;
}

const translations: Record<Language, Translations> = {
  pt: {
    // App name and branding
    appName: 'Pharmyrus',
    patentConsultation: 'Consulta de Patentes',
    platformDescription: 'IA completa para desenvolvimento de medicamentos inovadores.',
    
    // Navigation and buttons
    back: 'Voltar',
    login: 'Entrar',
    logout: 'Sair',
    register: 'Registrar',
    startFree: 'Começar Agora',
    plans: 'Planos',
    save: 'Salvar',
    cancel: 'Cancelar',
    
    // Authentication
    loginTitle: 'Entrar na sua conta',
    loginDescription: 'Acesse sua conta para consultar patentes farmacêuticas',
    loginButton: 'Entrar',
    createAccount: 'Criar conta',
    forgotPassword: 'Esqueceu a senha?',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Senha',
    
    // Errors and validation
    error: 'Erro',
    loading: 'Carregando',
    networkError: 'Erro de conexão. Verifique sua internet.',
    
    // Patent consultation
    newConsultation: 'Nova Consulta',
    consultPatent: 'Consultar Patente',
    consulting: 'Consultando',
    consultationPlaceholder: 'Digite o nome do produto para verificar patentes',
    substanceAnalyzed: 'Substância Analisada',
    patentStatus: 'Status da Patente',
    patentVigent: 'Patente Vigente',
    commercialExploration: 'Exploração Comercial',
    mainPatentExpiration: 'Expiração da Patente Principal',
    newProductExpiration: 'Expiração para Novo Produto',
    registeredCountries: 'Países Registrados',
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
    
    // Languages
    portuguese: 'Português',
    english: 'Inglês',
    
    // Landing page
    landingTitle: 'Desenvolvimento Inteligente de Medicamentos com IA',
    landingDescription: 'Crie medicamentos inovadores, analise patentes e gere documentação regulatória.',
    
    // Plans
    choosePlan: 'Escolha seu Plano',
    mostPopular: 'Mais Popular',
    consultations: 'consultas',
    startNow: 'Começar Agora',
    
    // Support
    whatsappSupport: 'Suporte via WhatsApp',
    
    // Footer
    copyright: '© 2025 Pharmyrus. Todos os direitos reservados.'
  },
  
  en: {
    // App name and branding
    appName: 'Pharmyrus',
    patentConsultation: 'Patent Consultation',
    platformDescription: 'Complete AI for innovative drug development.',
    
    // Navigation and buttons
    back: 'Back',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    startFree: 'Start Now',
    plans: 'Plans',
    save: 'Save',
    cancel: 'Cancel',
    
    // Authentication
    loginTitle: 'Sign in to your account',
    loginDescription: 'Access your account to consult pharmaceutical patents',
    loginButton: 'Sign In',
    createAccount: 'Create account',
    forgotPassword: 'Forgot password?',
    emailPlaceholder: 'Email',
    passwordPlaceholder: 'Password',
    
    // Errors and validation
    error: 'Error',
    loading: 'Loading',
    networkError: 'Connection error. Check your internet.',
    
    // Patent consultation
    newConsultation: 'New Consultation',
    consultPatent: 'Consult Patent',
    consulting: 'Consulting',
    consultationPlaceholder: 'Enter product name to check patents',
    substanceAnalyzed: 'Analyzed Substance',
    patentStatus: 'Patent Status',
    patentVigent: 'Patent Valid',
    commercialExploration: 'Commercial Exploration',
    mainPatentExpiration: 'Main Patent Expiration',
    newProductExpiration: 'New Product Expiration',
    registeredCountries: 'Registered Countries',
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
    
    // Languages
    portuguese: 'Portuguese',
    english: 'English',
    
    // Landing page
    landingTitle: 'Intelligent Drug Development with AI',
    landingDescription: 'Create innovative drugs, analyze patents and generate regulatory documentation.',
    
    // Plans
    choosePlan: 'Choose Your Plan',
    mostPopular: 'Most Popular',
    consultations: 'consultations',
    startNow: 'Start Now',
    
    // Support
    whatsappSupport: 'WhatsApp Support',
    
    // Footer
    copyright: '© 2025 Pharmyrus. All rights reserved.'
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

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    if (saved && ['pt', 'en'].includes(saved)) {
      return saved as Language;
    }
    
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt';
    if (browserLang.startsWith('en')) return 'en';
    
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