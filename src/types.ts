import { DivideIcon as LucideIcon } from 'lucide-react';

// Drug Pipeline Types
export interface DrugPipelineRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userCompany: string;
  
  // Input data
  target_disease: string;
  therapeutic_area: string;
  mechanism_of_action?: string;
  target_population: string;
  geographic_markets: string[];
  budget_range: string;
  timeline_preference: string;
  
  // Metadata
  sessionId: string;
  environment: 'production' | 'test';
  
  // Results
  pipeline_result: DrugPipelineResult;
  
  // Timestamps
  createdAt: string;
  completedAt?: string;
  processingTime?: number;
}

export interface DrugPipelineResult {
  // Proposed Drug
  proposed_drug: ProposedDrug;
  
  // Patent Analysis
  patent_landscape: PatentLandscape;
  
  // Market Analysis
  market_analysis: MarketAnalysis;
  
  // Regulatory Strategy
  regulatory_strategy: RegulatoryStrategy;
  
  // Development Timeline
  development_timeline: DevelopmentPhase[];
  
  // Financial Projections
  financial_projections: FinancialProjections;
  
  // Risk Assessment
  risk_assessment: RiskAssessment;
  
  // Innovation Score
  innovation_score: InnovationScore;
}

export interface ProposedDrug {
  name: string;
  chemical_name: string;
  molecular_formula: string;
  mechanism_of_action: string;
  therapeutic_class: string;
  dosage_form: string;
  strength: string;
  route_of_administration: string;
  indication: string;
  target_population: string;
  competitive_advantages: string[];
  chemical_structure?: {
    smiles: string;
    inchi_key: string;
    molecular_weight: number;
    logp: number;
    hbd: number;
    hba: number;
  };
}

export interface PatentLandscape {
  existing_patents: ExistingPatent[];
  patent_gaps: PatentGap[];
  freedom_to_operate: FreedomToOperate;
  patent_strategy: PatentStrategy;
}

export interface ExistingPatent {
  patent_number: string;
  title: string;
  assignee: string;
  filing_date: string;
  expiration_date: string;
  status: 'active' | 'expired' | 'pending';
  countries: string[];
  claims_summary: string;
  relevance_score: number;
  blocking_potential: 'high' | 'medium' | 'low';
}

export interface PatentGap {
  opportunity_area: string;
  description: string;
  potential_claims: string[];
  novelty_score: number;
  commercial_potential: number;
}

export interface FreedomToOperate {
  overall_risk: 'low' | 'medium' | 'high';
  blocking_patents: string[];
  workaround_strategies: string[];
  clearance_recommendations: string[];
}

export interface PatentStrategy {
  filing_recommendations: PatentFiling[];
  defensive_strategy: string[];
  licensing_opportunities: string[];
  estimated_costs: {
    filing_costs: number;
    prosecution_costs: number;
    maintenance_costs: number;
  };
}

export interface PatentFiling {
  type: 'composition' | 'method_of_use' | 'formulation' | 'process';
  title: string;
  claims_outline: string[];
  priority_countries: string[];
  filing_timeline: string;
  estimated_cost: number;
}

export interface MarketAnalysis {
  market_size: MarketSize;
  competitive_landscape: CompetitiveLandscape;
  pricing_analysis: PricingAnalysis;
  swot_analysis: SWOTAnalysis;
  target_segments: TargetSegment[];
  market_entry_strategy: MarketEntryStrategy;
}

export interface MarketSize {
  tam: number; // Total Addressable Market
  sam: number; // Serviceable Available Market
  som: number; // Serviceable Obtainable Market
  cagr: number; // Compound Annual Growth Rate
  market_drivers: string[];
  market_barriers: string[];
}

export interface CompetitiveLandscape {
  direct_competitors: Competitor[];
  indirect_competitors: Competitor[];
  market_leaders: string[];
  competitive_positioning: string;
  differentiation_opportunities: string[];
}

export interface Competitor {
  name: string;
  product: string;
  market_share: number;
  price_range: {
    min: number;
    max: number;
    currency: string;
  };
  strengths: string[];
  weaknesses: string[];
  patent_expiry: string;
}

export interface PricingAnalysis {
  recommended_price: {
    amount: number;
    currency: string;
    rationale: string;
  };
  price_sensitivity: 'low' | 'medium' | 'high';
  reimbursement_potential: {
    public_systems: string[];
    private_insurance: string[];
    out_of_pocket: boolean;
  };
  pricing_strategy: string;
  revenue_projections: RevenueProjection[];
}

export interface RevenueProjection {
  year: number;
  units_sold: number;
  revenue: number;
  market_penetration: number;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface TargetSegment {
  name: string;
  size: number;
  characteristics: string[];
  needs: string[];
  willingness_to_pay: number;
  access_channels: string[];
}

export interface MarketEntryStrategy {
  launch_sequence: LaunchPhase[];
  key_partnerships: string[];
  distribution_channels: string[];
  marketing_strategy: string[];
  success_metrics: string[];
}

export interface LaunchPhase {
  phase: string;
  timeline: string;
  objectives: string[];
  key_activities: string[];
  success_criteria: string[];
  budget_allocation: number;
}

export interface RegulatoryStrategy {
  regulatory_pathway: RegulatoryPathway[];
  required_studies: RequiredStudy[];
  submission_timeline: SubmissionMilestone[];
  regulatory_costs: RegulatoryCosts;
  approval_probability: number;
}

export interface RegulatoryPathway {
  country: string;
  agency: string;
  pathway_type: string;
  timeline: string;
  requirements: string[];
  fees: number;
  success_probability: number;
}

export interface RequiredStudy {
  study_type: string;
  phase: string;
  duration: string;
  estimated_cost: number;
  patient_count: number;
  endpoints: string[];
  regulatory_guidance: string;
}

export interface SubmissionMilestone {
  milestone: string;
  timeline: string;
  deliverables: string[];
  dependencies: string[];
  risk_factors: string[];
}

export interface RegulatoryCosts {
  preclinical_studies: number;
  clinical_trials: number;
  regulatory_fees: number;
  consulting_costs: number;
  total_estimated: number;
}

export interface DevelopmentPhase {
  phase: string;
  duration: string;
  activities: string[];
  deliverables: string[];
  estimated_cost: number;
  success_probability: number;
  key_milestones: string[];
  risk_factors: string[];
}

export interface FinancialProjections {
  development_costs: DevelopmentCosts;
  revenue_forecast: RevenueForecast;
  profitability_analysis: ProfitabilityAnalysis;
  funding_requirements: FundingRequirements;
  roi_analysis: ROIAnalysis;
}

export interface DevelopmentCosts {
  research_and_development: number;
  clinical_trials: number;
  regulatory_approval: number;
  manufacturing_setup: number;
  marketing_launch: number;
  total_investment: number;
}

export interface RevenueForecast {
  year_1: number;
  year_3: number;
  year_5: number;
  peak_sales: number;
  patent_cliff_impact: number;
}

export interface ProfitabilityAnalysis {
  gross_margin: number;
  operating_margin: number;
  net_margin: number;
  break_even_timeline: string;
  payback_period: string;
}

export interface FundingRequirements {
  seed_funding: number;
  series_a: number;
  series_b: number;
  total_funding_needed: number;
  funding_milestones: FundingMilestone[];
}

export interface FundingMilestone {
  stage: string;
  amount: number;
  timeline: string;
  use_of_funds: string[];
  key_deliverables: string[];
}

export interface ROIAnalysis {
  npv: number;
  irr: number;
  payback_period: number;
  risk_adjusted_return: number;
  sensitivity_analysis: SensitivityFactor[];
}

export interface SensitivityFactor {
  factor: string;
  impact_on_roi: number;
  probability: number;
  mitigation_strategy: string;
}

export interface RiskAssessment {
  technical_risks: Risk[];
  commercial_risks: Risk[];
  regulatory_risks: Risk[];
  financial_risks: Risk[];
  overall_risk_score: number;
  mitigation_plan: MitigationStrategy[];
}

export interface Risk {
  risk_factor: string;
  probability: number;
  impact: number;
  risk_score: number;
  description: string;
  early_warning_signs: string[];
}

export interface MitigationStrategy {
  risk_category: string;
  strategy: string;
  implementation_cost: number;
  effectiveness: number;
  timeline: string;
}

export interface InnovationScore {
  overall_score: number;
  classification: string;
  innovation_factors: InnovationFactor[];
  competitive_advantage: number;
  market_disruption_potential: number;
  technical_feasibility: number;
  commercial_viability: number;
}

export interface InnovationFactor {
  factor: string;
  score: number;
  weight: number;
  justification: string;
}

// Legacy types for backward compatibility
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

export interface DrugPipelineConsultationType {
  id: string;
  userId: string;
  userEmail: string;
  target_disease: string;
  sessionId: string;
  resultado: DrugPipelineResult;
  consultedAt: string;
}

export interface PipelineCompleta {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  userCompany: string;
  
  // Dados de input da consulta
  target_disease: string;
  therapeutic_area: string;
  mechanism_of_action: string;
  target_population: string;
  geographic_markets: string[];
  budget_range: string;
  timeline_preference: string;
  
  // Metadados da consulta
  sessionId: string;
  environment: 'production' | 'test';
  serpApiKey: string; // Chave usada (truncada para segurança)
  
  // Resultado da consulta
  resultado: DrugPipelineResult | any;
  isDashboard: boolean;
  
  // Timestamps
  consultedAt: string;
  webhookResponseTime?: number; // Tempo de resposta em ms
}

// Therapeutic Areas
export const THERAPEUTIC_AREAS = [
  'Oncologia', 'Cardiologia', 'Neurologia', 'Endocrinologia', 'Imunologia',
  'Infectologia', 'Pneumologia', 'Gastroenterologia', 'Dermatologia', 
  'Oftalmologia', 'Urologia', 'Ginecologia', 'Pediatria', 'Geriatria',
  'Psiquiatria', 'Reumatologia', 'Hematologia', 'Nefrologia'
];

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