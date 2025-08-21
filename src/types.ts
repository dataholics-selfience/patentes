// Simplified types for patent consultation
export interface PatentResultType {
  substancia?: string;
  nome_comercial?: string;
  patente_vigente?: boolean;
  data_expiracao_patente_principal?: string;
  exploracao_comercial?: boolean;
  riscos_regulatorios_ou_eticos?: string;
  data_vencimento_para_novo_produto?: string;
  alternativas_de_compostos_analogos?: string[];
  fonte_estimativa?: string[];
  patentes_por_pais?: PatentByCountry[];
  exploracao_comercial_por_pais?: CommercialExplorationByCountry[];
  paises_registrados?: string[];
  riscos_regulatorios_eticos?: string[];
  data_vencimento_patente_novo_produto?: string | null;
  alternativas_compostos?: string[];
}

export interface PatentByCountry {
  pais: string;
  numero?: string;
  status?: string;
  data_expiracao?: string;
  data_expiracao_primaria: string;
  data_expiracao_secundaria: string;
  tipos: string[];
  tipo?: string[];
  fonte?: string;
  link?: string;
}

export interface CommercialExplorationByCountry {
  pais: string;
  data_disponivel: string;
  tipos_liberados: string[];
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
  autoRenewal?: boolean;
  renewalDate?: string;
  purchasedAt?: string;
}

export interface ConsultaCompleta {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userCompany: string;
  
  // Dados de input da consulta
  nome_comercial: string;
  nome_molecula: string;
  categoria: string;
  beneficio: string;
  doenca_alvo: string;
  pais_alvo: string[];
  
  // Metadados da consulta
  sessionId: string;
  environment: 'production' | 'test';
  serpApiKey: string; // Chave usada (truncada para segurança)
  
  // Resultado da consulta
  resultado: PatentResultType | any;
  isDashboard: boolean;
  
  // Timestamps
  consultedAt: string;
  webhookResponseTime?: number; // Tempo de resposta em ms
}