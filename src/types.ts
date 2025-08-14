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
  autoRenewal?: boolean;
  renewalDate?: string;
  purchasedAt?: string;
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
  resultado: PatentResultType | any; // Pode ser dashboard ou patent data
  isDashboard: boolean;
  
  // Timestamps
  consultedAt: string;
  webhookResponseTime?: number; // Tempo de resposta em ms
}

export interface PatentByCountry {
  pais: string;
  numero?: string;
  status?: string;
  data_expiracao?: string;
  data_expiracao_primaria: string;
  data_expiracao?: string; // Campo alternativo que pode vir do JSON
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

export interface ChemicalData {
  iupac_name: string;
  molecular_formula: string;
  molecular_weight: string;
  smiles: string;
  inchi_key: string;
  topological_polar_surface_area: string;
  hydrogen_bond_acceptors: string;
  hydrogen_bond_donors: string;
  rotatable_bonds: string;
  fonte?: string;
}

export interface ClinicalTrialsData {
  ativos: string;
  fase_avancada: boolean;
  tem_no_brasil?: boolean;
  paises: string[];
  principais_indicacoes_estudadas: string[];
  estudos?: Array<{
    titulo: string;
    fase: string;
    pais: string;
    link?: string;
  }>;
  fonte?: string;
}

export interface OrangeBookData {
  tem_generico: boolean;
  nda_number: string;
  genericos_aprovados: string[];
  data_ultimo_generico: string;
  data_aprovacao?: string;
  exclusividades?: string[];
  data_expiracao_exclusividade?: string;
  patentes_listadas?: string[];
  fonte?: string;
  link?: string;
}

export interface RegulationByCountry {
  pais: string;
  agencia: string;
  classificacao: string;
  restricoes: string[];
  facilidade_registro_generico: string;
  numero_registro?: string;
  fonte?: string;
}

export interface ScientificEvidence {
  titulo: string;
  autores: string[];
  ano: string;
  resumo: string;
  doi: string;
  fonte?: string;
}

export interface PatentData {
  numero_patente?: string;
  patente_vigente: boolean;
  tipo_protecao_detalhado?: {
    primaria?: string[];
    secundaria?: string[];
  };
  objeto_protecao?: string;
  data_expiracao_patente_principal: string;
  data_expiracao_patente_secundaria: string;
  patentes_por_pais: PatentByCountry[];
  exploracao_comercial_por_pais: CommercialExplorationByCountry[];
  exploracao_comercial: boolean;
  riscos_regulatorios_ou_eticos: string;
  data_vencimento_para_novo_produto: string;
  alternativas_de_compostos_analogos: string[];
  fonte_estimativa: string[];
}

export interface OpportunityScore {
  valor: number;
  classificacao: string;
  justificativa?: string;
  criterios?: any;
}

export interface PatentResultType {
  patentes: PatentData[];
  quimica: ChemicalData;
  ensaios_clinicos: ClinicalTrialsData;
  orange_book: OrangeBookData;
  registro_regulatorio?: any;
  regulacao_por_pais: RegulationByCountry[];
  evidencia_cientifica_recente: ScientificEvidence[];
  estrategias_de_formulacao: any;
  dados_de_mercado?: any;
  score_de_oportunidade?: OpportunityScore;
  
  // Legacy fields for backward compatibility
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

export interface MonitoringConfig {
  id: string;
  consultaId: string;
  userId: string;
  intervalHours: number;
  isActive: boolean;
  createdAt: string;
  lastRunAt?: string;
  nextRunAt: string;
  runCount: number;
  originalConsulta: {
    nome_comercial: string;
    nome_molecula: string;
    categoria: string;
    beneficio: string;
    doenca_alvo: string;
    pais_alvo: string[];
    userCompany: string;
    sessionId: string;
    environment: 'production' | 'test';
  };
}