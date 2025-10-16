import { SerpKey } from './serpKeyManager';

// Base de dados das chaves SERP API - DADOS REAIS
export const SERP_API_KEYS: SerpKey[] = [
  {
    id: 'serp_001',
    email: 'daniel.mendes@dataholics.io',
    phone: '11995736666',
    instance: 'Instância 1',
    key: '11e7b23032aae12b0f75c06af0ad60a861e9f7ea6d53fc7ca039aed18b5e3573',
    monthlyLimit: 100,
    currentUsage: 100, // 0 restam = 100 usados
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-07-26',
    isActive: false, // 0 restam = inativa
    isDev: false
  },
  {
    id: 'serp_002',
    email: 'innovagenoi2@gmail.com',
    phone: '5511988092945',
    instance: 'Instância 2',
    key: '3f22448f4d43ce8259fa2f7f6385222323a67c4ce4e72fcc774b43d23812889d',
    monthlyLimit: 100,
    currentUsage: 100, // 0 restam = 100 usados
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-08',
    isActive: false, // 0 restam = inativa
    isDev: false
  },
  {
    id: 'serp_003',
    email: 'innovagenoi3@gmail.com',
    phone: '5511966423140',
    instance: 'Instância 3',
    key: '871b533d956978e967e7621c871d53fb448bc36e90af6389eda2aca3420236e1',
    monthlyLimit: 100,
    currentUsage: 100, // 0 restam = 100 usados
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-08',
    isActive: false, // 0 restam = inativa
    isDev: false
  },
  {
    id: 'serp_004',
    email: 'innovagenoi@gmail.com',
    phone: '5511945616521',
    instance: 'Instância 4 (Keith)',
    key: '81a36621f3efc12ca9bdd1c0dbcc30d3ab2f2dea5f9e42af3508ff04ee8ed527',
    monthlyLimit: 100,
    currentUsage: 100, // 0 restam = 100 usados
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-09',
    isActive: false, // 0 restam = inativa
    isDev: false
  },
  {
    id: 'serp_005',
    email: 'innovagenoi4@gmail.com',
    phone: '5511976722257',
    instance: 'Instância 5 (LG)',
    key: 'bc20bca64032a7ac59abf330bbdeca80aa79cd72bb208059056b10fb6e33e4bc',
    monthlyLimit: 100,
    currentUsage: 49, // 51 restam = 49 usados
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-09',
    isActive: true, // 51 restam = ativa
    isDev: true
  },
  {
    id: 'serp_006',
    email: 'innovagenoi5@gmail.com',
    phone: '5511940685027',
    instance: 'Instância 6 (Keith Clínica)',
    key: '5e7943e3a4832058ab4f430b46e29c7e2cf3522b50e7aba2f19bea45c480c790',
    monthlyLimit: 100,
    currentUsage: 0, // 100 restam = 0 usados
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-10',
    isActive: true, // 100 restam = ativa
    isDev: false
  },
  {
    id: 'serp_007',
    email: 'innovagenoi6@gmail.com',
    phone: '5511994565666',
    instance: 'Instância 7 (Dona Deny)',
    key: '67ea379386129b7f25f2af88e78aa6a195800b2b7750038b9062743623304769',
    monthlyLimit: 100,
    currentUsage: 0, // 100 restam = 0 usados
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-10',
    isActive: true, // 100 restam = ativa
    isDev: false
  },
  {
    id: 'serp_008',
    email: 'innovagenoi7@gmail.com',
    phone: '5511965881335',
    instance: 'Instância 8 (JoJo)',
    key: '3b7a505775aefec905ce2d7172ad54bba2f7fd8f40ee2aabae153e187c0c9407',
    monthlyLimit: 100,
    currentUsage: 0, // 100 restam = 0 usados
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-10',
    isActive: true, // 100 restam = ativa
    isDev: false
  },
  {
    id: 'serp_009',
    email: 'innovagenoi7@gmail.com',
    phone: '5511966310492',
    instance: 'Instância 9',
    key: 'b2131edaf44437a4a424af07de23bfe5186c1d5897231f54d388c64ac3d33670',
    monthlyLimit: 100,
    currentUsage: 0, // 100 restam = 0 usados
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-10',
    isActive: true, // 100 restam = ativa
    isDev: false
  }
];

// Função para validar se uma chave está no formato correto
export const validateSerpKey = (key: string): boolean => {
  return key && key.length === 64; // Chaves SERP API têm 64 caracteres
};

// Email do admin que pode acessar a interface de gerenciamento
export const ADMIN_EMAILS = [
  'innovagenoi@gmail.com',
  'thays.perpetua@dataholics.io',
  'daniel.mendes@dataholics.io'
];

// Função para verificar se o usuário é admin
export const isAdminUser = (email: string | null): boolean => {
  return email ? ADMIN_EMAILS.includes(email) : false;
};