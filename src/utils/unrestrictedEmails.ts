// Lista de e-mails com acesso irrestrito (não precisam verificar e-mail)
export const UNRESTRICTED_EMAILS = [
  'dproenca@its.jnj.com',
  'innovagenoi7@gmail.com',
  'robert.filho@hypofarma.com.br'
];

// Função para verificar se um e-mail tem acesso irrestrito
export const hasUnrestrictedAccess = (email: string | null): boolean => {
  if (!email) return false;
  return UNRESTRICTED_EMAILS.includes(email.toLowerCase().trim());
};

// Função para adicionar novos e-mails à lista (para uso futuro)
export const addUnrestrictedEmail = (email: string): void => {
  const normalizedEmail = email.toLowerCase().trim();
  if (!UNRESTRICTED_EMAILS.includes(normalizedEmail)) {
    UNRESTRICTED_EMAILS.push(normalizedEmail);
  }
};

// Configuração padrão para usuários com acesso irrestrito - PLANO GRATUITO
export const UNRESTRICTED_USER_CONFIG = {
  plan: 'Pesquisador',
  totalTokens: 25, // 25 consultas mensais (renovação automática)
  name: 'Usuário Corporativo',
  company: 'Hypofarma',
  cpf: '000.000.000-00',
  phone: '+55-000-000-0000'
};