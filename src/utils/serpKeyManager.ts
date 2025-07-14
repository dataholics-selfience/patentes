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
  creditsUsed: number;
}

export interface ConsultationStats {
  totalConsultations: number;
  totalCreditsUsed: number;
  averageCreditsPerConsultation: number;
  consultationsToday: number;
  consultationsThisMonth: number;
}

const CREDITS_PER_CONSULTATION = 8;

class SerpKeyManager {
  private keys: SerpKey[] = [];
  private consultationCount: number = 0;
  private usageHistory: SerpKeyUsage[] = [];
  
  constructor(keys: SerpKey[]) {
    this.keys = keys;
    this.loadKeysState();
    this.loadUsageHistory();
  }

  private loadKeysState(): void {
    // Carregar estado das chaves do localStorage se disponível
    try {
      const stored = localStorage.getItem('serpKeysState');
      if (stored) {
        const storedKeys = JSON.parse(stored) as SerpKey[];
        // Mesclar dados salvos com dados base, mantendo uso atual
        this.keys = this.keys.map(baseKey => {
          const storedKey = storedKeys.find(k => k.id === baseKey.id);
          if (storedKey) {
            return {
              ...baseKey,
              currentUsage: storedKey.currentUsage,
              isActive: storedKey.isActive,
              lastResetDate: storedKey.lastResetDate
            };
          }
          return baseKey;
        });
        console.log('📂 Estado das chaves carregado do localStorage');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estado das chaves:', error);
    }
  }

  private saveKeysState(): void {
    try {
      localStorage.setItem('serpKeysState', JSON.stringify(this.keys));
    } catch (error) {
      console.error('❌ Erro ao salvar estado das chaves:', error);
    }
  }

  private loadUsageHistory(): void {
    // Carregar histórico do localStorage se disponível
    try {
      const stored = localStorage.getItem('serpKeyUsageHistory');
      if (stored) {
        this.usageHistory = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de uso:', error);
      this.usageHistory = [];
    }
  }

  private saveUsageHistory(): void {
    try {
      localStorage.setItem('serpKeyUsageHistory', JSON.stringify(this.usageHistory));
    } catch (error) {
      console.error('Erro ao salvar histórico de uso:', error);
    }
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
    
    // Salvar estado após possível reset
    this.saveKeysState();
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

  // Registrar uso de uma chave (8 créditos por consulta) - MÉTODO CRÍTICO CORRIGIDO
  public recordUsage(apiKey: string, userId?: string, searchTerm?: string): boolean {
    console.log(`🔍 Tentando registrar uso para chave: ${apiKey.substring(0, 12)}...`);
    
    const keyData = this.keys.find(k => k.key === apiKey);
    if (!keyData) {
      console.error(`❌ Chave não encontrada: ${apiKey.substring(0, 12)}...`);
      return false;
    }

    console.log(`📊 Estado atual da chave ${keyData.id} - ${keyData.instance}: ${keyData.currentUsage}/${keyData.monthlyLimit}`);
    
    // Verificar se há créditos suficientes ANTES de descontar
    const remainingCredits = keyData.monthlyLimit - keyData.currentUsage;
    if (remainingCredits < CREDITS_PER_CONSULTATION) {
      console.error(`❌ Créditos insuficientes na chave ${keyData.id}: ${remainingCredits} < ${CREDITS_PER_CONSULTATION}`);
      keyData.isActive = false;
      return false;
    }

    // DESCONTAR OS 8 CRÉDITOS
    const oldUsage = keyData.currentUsage;
    keyData.currentUsage += CREDITS_PER_CONSULTATION;
    this.consultationCount++;
    
    console.log(`💳 CRÉDITOS DESCONTADOS: ${oldUsage} → ${keyData.currentUsage} (${CREDITS_PER_CONSULTATION} créditos descontados)`);
    
    // Registrar no histórico
    const usage: SerpKeyUsage = {
      keyId: keyData.id,
      usedAt: new Date().toISOString(),
      userId,
      searchTerm,
      creditsUsed: CREDITS_PER_CONSULTATION
    };
    this.usageHistory.push(usage);
    this.saveUsageHistory();
    
    // Salvar estado atualizado das chaves no localStorage
    try {
      localStorage.setItem('serpKeysState', JSON.stringify(this.keys));
      console.log('💾 Estado das chaves salvo no localStorage');
    } catch (error) {
      console.error('❌ Erro ao salvar estado das chaves:', error);
    }
    
    // Desativar chave se atingiu o limite
    if (keyData.currentUsage >= keyData.monthlyLimit) {
      keyData.isActive = false;
      console.log(`🚫 Chave ${keyData.id} desativada - limite atingido`);
    }
    
    console.log(`✅ Consulta registrada para chave ${keyData.id} - ${keyData.instance}: ${keyData.currentUsage}/${keyData.monthlyLimit} créditos (${CREDITS_PER_CONSULTATION} créditos descontados)`);
    return true;
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

  // Obter estatísticas de consultas - MÉTODO EXPANDIDO
  public getConsultationStats(): ConsultationStats {
    const totalCreditsUsed = this.keys.reduce((sum, key) => sum + key.currentUsage, 0);
    const totalConsultations = Math.floor(totalCreditsUsed / CREDITS_PER_CONSULTATION);
    
    // Calcular consultas de hoje
    const today = new Date().toDateString();
    const consultationsToday = this.usageHistory.filter(usage => 
      new Date(usage.usedAt).toDateString() === today
    ).length;
    
    // Calcular consultas deste mês
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const consultationsThisMonth = this.usageHistory.filter(usage => {
      const usageDate = new Date(usage.usedAt);
      return usageDate.getMonth() === currentMonth && usageDate.getFullYear() === currentYear;
    }).length;
    
    return {
      totalConsultations,
      totalCreditsUsed,
      averageCreditsPerConsultation: totalConsultations > 0 ? totalCreditsUsed / totalConsultations : 0,
      consultationsToday,
      consultationsThisMonth
    };
  }

  // Verificar se há chaves disponíveis para consulta
  public hasAvailableCredits(): boolean {
    this.checkAndResetMonthlyUsage();
    return this.keys.some(key => 
      key.isActive && (key.monthlyLimit - key.currentUsage) >= CREDITS_PER_CONSULTATION
    );
  }

  // Obter histórico de uso
  public getUsageHistory(): SerpKeyUsage[] {
    return [...this.usageHistory].sort((a, b) => 
      new Date(b.usedAt).getTime() - new Date(a.usedAt).getTime()
    );
  }

  // Atualizar dados das chaves (para interface admin)
  public updateKeys(newKeys: SerpKey[]): void {
    this.keys = newKeys;
    this.saveKeysState();
  }

  // Adicionar nova chave (para interface admin)
  public addKey(newKey: Omit<SerpKey, 'id'>): void {
    const id = `serp_${String(this.keys.length + 1).padStart(3, '0')}`;
    this.keys.push({ ...newKey, id });
    this.saveKeysState();
  }

  // Remover chave (para interface admin)
  public removeKey(keyId: string): boolean {
    const initialLength = this.keys.length;
    this.keys = this.keys.filter(key => key.id !== keyId);
    if (this.keys.length < initialLength) {
      this.saveKeysState();
    }
    return this.keys.length < initialLength;
  }

  // Atualizar chave específica (para interface admin)
  public updateKey(keyId: string, updates: Partial<SerpKey>): boolean {
    const keyIndex = this.keys.findIndex(key => key.id === keyId);
    if (keyIndex !== -1) {
      this.keys[keyIndex] = { ...this.keys[keyIndex], ...updates };
      this.saveKeysState();
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
      this.saveKeysState();
      return true;
    }
    return false;
  }

  // Limpar histórico de uso (para manutenção)
  public clearUsageHistory(): void {
    this.usageHistory = [];
    this.saveUsageHistory();
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