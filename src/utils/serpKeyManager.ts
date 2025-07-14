export interface SerpKey {
  id: string;
  email: string;
  phone: string;
  instance: string;
  key: string;
  monthlyLimit: number;
  currentUsage: number;
  lastResetDate: string;
  renewalDate: string;
  isActive: boolean;
  isDev: boolean;
}

export interface SerpKeyUsage {
  keyId: string;
  usedAt: string;
  userId?: string;
  searchTerm?: string;
}

export interface ConsultationStats {
  totalConsultations: number;
  totalCreditsUsed: number;
  averageCreditsPerConsultation: number;
}

const CREDITS_PER_CONSULTATION = 8;

class SerpKeyManager {
  private keys: SerpKey[] = [];
  private consultationCount: number = 0;
  
  constructor(keys: SerpKey[]) {
    this.keys = keys;
  }

  // Resetar contadores mensais se necessário
  private checkAndResetMonthlyUsage(): void {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    this.keys.forEach(key => {
      const lastReset = new Date(key.lastResetDate);
      const resetMonth = lastReset.getMonth();
      const resetYear = lastReset.getFullYear();

      // Se mudou o mês, resetar o contador
      if (currentYear > resetYear || (currentYear === resetYear && currentMonth > resetMonth)) {
        key.currentUsage = 0;
        key.lastResetDate = now.toISOString();
        key.isActive = true; // Reativar chave após reset
        console.log(`🔄 Reset mensal para chave ${key.id}: ${key.instance}`);
      }
    });
  }

  // Obter a melhor chave disponível com pelo menos 8 créditos
  public getAvailableKey(): string | null {
    this.checkAndResetMonthlyUsage();

    // Filtrar chaves ativas que têm pelo menos 8 créditos disponíveis
    const availableKeys = this.keys.filter(key => 
      key.isActive && (key.monthlyLimit - key.currentUsage) >= CREDITS_PER_CONSULTATION
    );

    if (availableKeys.length === 0) {
      console.error('❌ Nenhuma chave SERP API disponível com pelo menos 8 créditos');
      return null;
    }

    // Ordenar por menor uso atual (distribuição mais equilibrada)
    availableKeys.sort((a, b) => a.currentUsage - b.currentUsage);
    
    const selectedKey = availableKeys[0];
    const remainingCredits = selectedKey.monthlyLimit - selectedKey.currentUsage;
    console.log(`🔑 Chave SERP selecionada: ${selectedKey.id} - ${selectedKey.instance} (créditos restantes: ${remainingCredits})`);
    
    return selectedKey.key;
  }

  // Registrar uso de uma chave (8 créditos por consulta)
  public recordUsage(apiKey: string, userId?: string, searchTerm?: string): void {
    const keyData = this.keys.find(k => k.key === apiKey);
    if (keyData) {
      keyData.currentUsage += CREDITS_PER_CONSULTATION;
      this.consultationCount++;
      
      // Desativar chave se atingiu o limite
      if (keyData.currentUsage >= keyData.monthlyLimit) {
        keyData.isActive = false;
        console.log(`🚫 Chave ${keyData.id} desativada - limite atingido`);
      }
      
      console.log(`📊 Consulta registrada para chave ${keyData.id} - ${keyData.instance}: ${keyData.currentUsage}/${keyData.monthlyLimit} créditos (${CREDITS_PER_CONSULTATION} créditos usados)`);
    }
  }

  // Obter estatísticas das chaves
  public getKeyStats(): Array<{
    id: string;
    email: string;
    phone: string;
    instance: string;
    usage: number;
    limit: number;
    remaining: number;
    percentage: number;
    renewalDate: string;
    isActive: boolean;
    isDev: boolean;
    canConsult: boolean;
  }> {
    this.checkAndResetMonthlyUsage();
    
    return this.keys.map(key => ({
      id: key.id,
      email: key.email,
      phone: key.phone,
      instance: key.instance,
      usage: key.currentUsage,
      limit: key.monthlyLimit,
      remaining: key.monthlyLimit - key.currentUsage,
      percentage: Math.round((key.currentUsage / key.monthlyLimit) * 100),
      renewalDate: key.renewalDate,
      isActive: key.isActive,
      isDev: key.isDev,
      canConsult: key.isActive && (key.monthlyLimit - key.currentUsage) >= CREDITS_PER_CONSULTATION
    }));
  }

  // Obter estatísticas de consultas
  public getConsultationStats(): ConsultationStats {
    const totalCreditsUsed = this.keys.reduce((sum, key) => sum + key.currentUsage, 0);
    const totalConsultations = Math.floor(totalCreditsUsed / CREDITS_PER_CONSULTATION);
    
    return {
      totalConsultations,
      totalCreditsUsed,
      averageCreditsPerConsultation: totalConsultations > 0 ? totalCreditsUsed / totalConsultations : 0
    };
  }

  // Verificar se há chaves disponíveis para consulta
  public hasAvailableCredits(): boolean {
    this.checkAndResetMonthlyUsage();
    return this.keys.some(key => 
      key.isActive && (key.monthlyLimit - key.currentUsage) >= CREDITS_PER_CONSULTATION
    );
  }

  // Atualizar dados das chaves (para interface admin)
  public updateKeys(newKeys: SerpKey[]): void {
    this.keys = newKeys;
  }

  // Adicionar nova chave (para interface admin)
  public addKey(newKey: Omit<SerpKey, 'id'>): void {
    const id = `serp_${String(this.keys.length + 1).padStart(3, '0')}`;
    this.keys.push({ ...newKey, id });
  }

  // Remover chave (para interface admin)
  public removeKey(keyId: string): boolean {
    const initialLength = this.keys.length;
    this.keys = this.keys.filter(key => key.id !== keyId);
    return this.keys.length < initialLength;
  }

  // Atualizar chave específica (para interface admin)
  public updateKey(keyId: string, updates: Partial<SerpKey>): boolean {
    const keyIndex = this.keys.findIndex(key => key.id === keyId);
    if (keyIndex !== -1) {
      this.keys[keyIndex] = { ...this.keys[keyIndex], ...updates };
      return true;
    }
    return false;
  }

  // Obter todas as chaves (para interface admin)
  public getAllKeys(): SerpKey[] {
    return [...this.keys];
  }

  // Resetar uso de uma chave específica (para interface admin)
  public resetKeyUsage(keyId: string): boolean {
    const key = this.keys.find(k => k.id === keyId);
    if (key) {
      key.currentUsage = 0;
      key.isActive = true;
      key.lastResetDate = new Date().toISOString();
      return true;
    }
    return false;
  }
}

// Instância singleton do gerenciador
let serpKeyManagerInstance: SerpKeyManager | null = null;

export const initializeSerpKeyManager = (keys: SerpKey[]): void => {
  serpKeyManagerInstance = new SerpKeyManager(keys);
};

export const getSerpKeyManager = (): SerpKeyManager | null => {
  return serpKeyManagerInstance;
};
