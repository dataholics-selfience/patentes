import { DivideIcon as LucideIcon } from 'lucide-react';

export interface MessageType {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  hidden?: boolean;
}

export interface UserType {
  uid: string;
  name: string;
  email: string;
  cpf: string;
  company: string;
  phone: string;
  plan?: string;
  createdAt: string;
}

export interface TokenUsageType {
  uid: string;
  email: string;
  plan: string;
  totalTokens: number;
  usedTokens: number;
  lastUpdated: string;
  expirationDate: string;
}

export interface PatentConsultationType {
  id: string;
  userId: string;
  userEmail: string;
  produto: string;
  sessionId: string;
  resultado: PatentResultType;
  consultedAt: string;
}

export interface PatentResultType {
  substancia: string;
  patente_vigente: boolean;
  data_expiracao_patente_principal: string;
  paises_registrados: string[];
  exploracao_comercial: boolean;
  riscos_regulatorios_eticos: string[];
  data_vencimento_patente_novo_produto: string | null;
  alternativas_compostos?: string[];
}

export interface PlanType {
  id: string;
  name: string;
  description: string;
  tokens: number;
  price: number;
  icon: LucideIcon;
  highlight: boolean;
  stripeLink: string;
}

export interface ChallengeType {
  id: string;
  userId: string;
  userEmail: string;
  company: string;
  businessArea: string;
  title: string;
  description: string;
  sessionId: string;
  createdAt: string;
}

export interface StartupType {
  name: string;
  description: string;
  website: string;
  email: string;
  category: string;
  vertical: string;
  foundedYear: string;
  teamSize: string;
  businessModel: string;
  city: string;
  rating: number;
  reasonForChoice: string;
  ipoStatus: string;
  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export interface StartupListType {
  id: string;
  userId: string;
  userEmail: string;
  challengeId: string;
  challengeTitle: string;
  startups: StartupType[];
  projectPlanning: Array<{
    phase: string;
    duration: string;
    description: string;
  }>;
  expectedResults: string[];
  competitiveAdvantages: string[];
  createdAt: string;
}

export interface SocialLink {
  type: string;
  url: string;
  icon: any;
  label: string;
}