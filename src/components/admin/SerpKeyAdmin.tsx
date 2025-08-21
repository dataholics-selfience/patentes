import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Key, Plus, Edit2, Trash2, RotateCcw, Copy,
  CheckCircle, XCircle, AlertTriangle, Save, X,
  Shield, Calendar, Phone, Mail, Settings, BarChart3, 
  TrendingUp, Activity, Clock
} from 'lucide-react';
import { auth } from '../../firebase';

// SERP API Keys data
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

// Base de dados das chaves SERP API
const SERP_API_KEYS: SerpKey[] = [
  {
    id: 'serp_001',
    email: 'daniel.mendes@dataholics.io',
    phone: '11995736666',
    instance: 'Instância 1',
    key: '11e7b23032aae12b0f75c06af0ad60a861e9f7ea6d53fc7ca039aed18b5e3573',
    monthlyLimit: 100,
    currentUsage: 100,
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-07-26',
    isActive: false,
    isDev: false
  },
  {
    id: 'serp_002',
    email: 'innovagenoi2@gmail.com',
    phone: '5511988092945',
    instance: 'Instância 2',
    key: '3f22448f4d43ce8259fa2f7f6385222323a67c4ce4e72fcc774b43d23812889d',
    monthlyLimit: 100,
    currentUsage: 100,
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-08',
    isActive: false,
    isDev: false
  },
  {
    id: 'serp_003',
    email: 'innovagenoi3@gmail.com',
    phone: '5511966423140',
    instance: 'Instância 3',
    key: '871b533d956978e967e7621c871d53fb448bc36e90af6389eda2aca3420236e1',
    monthlyLimit: 100,
    currentUsage: 100,
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-08',
    isActive: false,
    isDev: false
  },
  {
    id: 'serp_004',
    email: 'innovagenoi@gmail.com',
    phone: '5511945616521',
    instance: 'Instância 4 (Keith)',
    key: '81a36621f3efc12ca9bdd1c0dbcc30d3ab2f2dea5f9e42af3508ff04ee8ed527',
    monthlyLimit: 100,
    currentUsage: 100,
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-09',
    isActive: false,
    isDev: false
  },
  {
    id: 'serp_005',
    email: 'innovagenoi4@gmail.com',
    phone: '5511976722257',
    instance: 'Instância 5 (LG)',
    key: 'bc20bca64032a7ac59abf330bbdeca80aa79cd72bb208059056b10fb6e33e4bc',
    monthlyLimit: 100,
    currentUsage: 49,
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-09',
    isActive: true,
    isDev: true
  },
  {
    id: 'serp_006',
    email: 'innovagenoi5@gmail.com',
    phone: '5511940685027',
    instance: 'Instância 6 (Keith Clínica)',
    key: '5e7943e3a4832058ab4f430b46e29c7e2cf3522b50e7aba2f19bea45c480c790',
    monthlyLimit: 100,
    currentUsage: 0,
    lastResetDate: new Date().toISOString(),
    renewalDate: '2025-08-10',
    isActive: true,
    isDev: false
  }
];

// Email do admin
const ADMIN_EMAIL = 'innovagenoi@gmail.com';

// Função para verificar se o usuário é admin
const isAdminUser = (email: string | null): boolean => {
  return email === ADMIN_EMAIL;
};

const SerpKeyAdmin = () => {
  const navigate = useNavigate();
  const [keys, setKeys] = useState<SerpKey[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingKeyData, setEditingKeyData] = useState<SerpKey | null>(null);
  const [newKey, setNewKey] = useState<Partial<SerpKey>>({
    email: '',
    phone: '',
    instance: '',
    key: '',
    monthlyLimit: 100,
    renewalDate: '',
    isActive: true,
    isDev: false
  });

  useEffect(() => {
    // Verificar se o usuário é admin
    if (!auth.currentUser || !isAdminUser(auth.currentUser.email)) {
      navigate('/');
      return;
    }

    loadKeys();
  }, [navigate]);

  const loadKeys = () => {
    setKeys(SERP_API_KEYS);
  };

  const handleAddKey = () => {
    // Implementação simplificada para visualização
    console.log('Adicionar nova chave:', newKey);
    setShowAddForm(false);
  };

  const handleUpdateKey = (keyId: string, updates: Partial<SerpKey>) => {
    console.log('Atualizar chave:', keyId, updates);
    setEditingKey(null);
    setEditingKeyData(null);
  };

  const handleDeleteKey = (keyId: string) => {
    if (confirm('Tem certeza que deseja remover esta chave?')) {
      console.log('Remover chave:', keyId);
    }
  };

  const handleResetUsage = (keyId: string) => {
    if (confirm('Tem certeza que deseja resetar o uso desta chave?')) {
      console.log('Resetar uso da chave:', keyId);
    }
  };

  const handleEditClick = (key: SerpKey) => {
    setEditingKey(key.id);
    setEditingKeyData({ ...key });
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setEditingKeyData(null);
  };

  const handleSaveEdit = () => {
    if (editingKeyData) {
      handleUpdateKey(editingKeyData.id, editingKeyData);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('API Key copiada para o clipboard!');
    } catch (err) {
      console.error('Erro ao copiar:', err);
      // Fallback para navegadores mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('API Key copiada para o clipboard!');
    }
  };

  const truncateKey = (key: string): string => {
    return key.length > 12 ? `${key.substring(0, 12)}...` : key;
  };

  const getStatusColor = (key: SerpKey) => {
    if (!key.isActive) return 'text-red-600 bg-red-100';
    const percentage = (key.currentUsage / key.monthlyLimit) * 100;
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getStatusIcon = (key: SerpKey) => {
    if (!key.isActive) return <XCircle size={16} />;
    const percentage = (key.currentUsage / key.monthlyLimit) * 100;
    if (percentage >= 90) return <AlertTriangle size={16} />;
    return <CheckCircle size={16} />;
  };

  const totalCredits = keys.reduce((sum, key) => sum + (key.monthlyLimit - key.currentUsage), 0);
  const totalUsed = keys.reduce((sum, key) => sum + key.currentUsage, 0);
  const totalLimit = keys.reduce((sum, key) => sum + key.monthlyLimit, 0);
  const totalConsultationsAvailable = Math.floor(totalCredits / 8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Voltar</span>
              </button>
              
              <div className="flex items-center gap-3">
                <Shield size={32} className="text-red-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Admin SUDO - Chaves SERP API</h1>
                  <p className="text-gray-600">Gerenciamento de chaves da SerpAPI</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Nova Chave
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Key className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total de Chaves</p>
                <p className="text-2xl font-bold text-gray-900">{keys.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Créditos Restantes</p>
                <p className="text-2xl font-bold text-green-600">{totalCredits}</p>
                <p className="text-xs text-gray-500">{totalConsultationsAvailable} consultas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Créditos Usados</p>
                <p className="text-2xl font-bold text-orange-600">{totalUsed}</p>
                <p className="text-xs text-gray-500">{Math.floor(totalUsed / 8)} consultas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Settings className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Limite Total</p>
                <p className="text-2xl font-bold text-purple-600">{totalLimit}</p>
                <p className="text-xs text-gray-500">{Math.floor(totalLimit / 8)} consultas máx</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário de Nova Chave */}
        {showAddForm && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Adicionar Nova Chave</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="email"
                placeholder="Email da conta"
                value={newKey.email}
                onChange={(e) => setNewKey(prev => ({ ...prev, email: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Telefone"
                value={newKey.phone}
                onChange={(e) => setNewKey(prev => ({ ...prev, phone: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Nome da instância"
                value={newKey.instance}
                onChange={(e) => setNewKey(prev => ({ ...prev, instance: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="Chave API (64 caracteres)"
                value={newKey.key}
                onChange={(e) => setNewKey(prev => ({ ...prev, key: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Limite mensal"
                value={newKey.monthlyLimit}
                onChange={(e) => setNewKey(prev => ({ ...prev, monthlyLimit: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                placeholder="Data de renovação"
                value={newKey.renewalDate}
                onChange={(e) => setNewKey(prev => ({ ...prev, renewalDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newKey.isActive}
                  onChange={(e) => setNewKey(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <span>Ativa</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newKey.isDev}
                  onChange={(e) => setNewKey(prev => ({ ...prev, isDev: e.target.checked }))}
                  className="rounded"
                />
                <span>Dev</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddKey}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Save size={16} />
                Salvar
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Chaves */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Chaves SERP API</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instância</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conta</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Key</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renovação</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keys.map((key) => (
                  <tr key={key.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{key.instance}</span>
                        {key.isDev && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            DEV
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-900">
                          <Mail size={12} />
                          {key.email}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Phone size={12} />
                          {key.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {truncateKey(key.key)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {key.currentUsage}/{key.monthlyLimit}
                        </div>
                        <div className="text-gray-500">
                          {key.monthlyLimit - key.currentUsage} restantes
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              (key.currentUsage / key.monthlyLimit) * 100 >= 90 ? 'bg-red-500' :
                              (key.currentUsage / key.monthlyLimit) * 100 >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${(key.currentUsage / key.monthlyLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${getStatusColor(key)}`}>
                        {getStatusIcon(key)}
                        <span>{key.isActive ? 'Ativa' : 'Inativa'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-900">
                        <Calendar size={12} />
                        {new Date(key.renewalDate).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResetUsage(key.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                          title="Resetar uso"
                        >
                          <RotateCcw size={16} />
                        </button>
                        <button
                          onClick={() => handleEditClick(key)}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded"
                          title="Remover"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Edição */}
        {editingKey && editingKeyData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Editar Chave SERP</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingKeyData.email}
                    onChange={(e) => setEditingKeyData(prev => prev ? { ...prev, email: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={editingKeyData.phone}
                    onChange={(e) => setEditingKeyData(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instância</label>
                  <input
                    type="text"
                    value={editingKeyData.instance}
                    onChange={(e) => setEditingKeyData(prev => prev ? { ...prev, instance: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Limite Mensal</label>
                  <input
                    type="number"
                    value={editingKeyData.monthlyLimit}
                    onChange={(e) => setEditingKeyData(prev => prev ? { ...prev, monthlyLimit: parseInt(e.target.value) } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Renovação</label>
                  <input
                    type="date"
                    value={editingKeyData.renewalDate}
                    onChange={(e) => setEditingKeyData(prev => prev ? { ...prev, renewalDate: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key Completa</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingKeyData.key}
                    onChange={(e) => setEditingKeyData(prev => prev ? { ...prev, key: e.target.value } : null)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(editingKeyData.key)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                    title="Copiar API Key"
                  >
                    <Copy size={16} />
                    Copiar
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingKeyData.isActive}
                    onChange={(e) => setEditingKeyData(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                    className="rounded"
                  />
                  <span>Ativa</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingKeyData.isDev}
                    onChange={(e) => setEditingKeyData(prev => prev ? { ...prev, isDev: e.target.checked } : null)}
                    className="rounded"
                  />
                  <span>Dev</span>
                </label>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Save size={16} />
                  Salvar
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SerpKeyAdmin;