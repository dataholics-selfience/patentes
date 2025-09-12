import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, Search, Edit2, Trash2, Pause, Play,
  CheckCircle, XCircle, AlertTriangle, Save, X, Shield,
  Calendar, Phone, Mail, Building2, User, Clock,
  MoreVertical, Eye, UserX, UserCheck
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  getDoc,
  orderBy
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { isAdminUser } from '../../utils/serpKeyData';
import { hasUnrestrictedAccess } from '../../utils/unrestrictedEmails';

interface CorporateUser {
  uid: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  plan: string;
  createdAt: string;
  activatedAt?: string;
  unrestrictedAccess: boolean;
  activated: boolean;
  disabled?: boolean;
  disabledAt?: string;
  lastLoginAt?: string;
  totalTokens?: number;
  usedTokens?: number;
  autoRenewal?: boolean;
}

const CorporateUserAdmin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<CorporateUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<CorporateUser[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<CorporateUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Verificar se o usuário é admin
    if (!auth.currentUser || !isAdminUser(auth.currentUser.email)) {
      navigate('/');
      return;
    }

    loadCorporateUsers();
  }, [navigate]);

  useEffect(() => {
    // Filtrar usuários baseado no termo de busca
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const loadCorporateUsers = async () => {
    setIsLoading(true);
    try {
      // Buscar todos os usuários com acesso irrestrito
      const usersQuery = query(
        collection(db, 'users'),
        where('unrestrictedAccess', '==', true)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const corporateUsers: CorporateUser[] = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Buscar dados de token para cada usuário
        const tokenDoc = await getDoc(doc(db, 'tokenUsage', userDoc.id));
        const tokenData = tokenDoc.exists() ? tokenDoc.data() : null;

        corporateUsers.push({
          uid: userDoc.id,
          name: userData.name || 'Nome não informado',
          email: userData.email || '',
          company: userData.company || 'Empresa não informada',
          phone: userData.phone || 'Telefone não informado',
          plan: userData.plan || 'Corporativo',
          createdAt: userData.createdAt || '',
          activatedAt: userData.activatedAt || '',
          unrestrictedAccess: userData.unrestrictedAccess || false,
          activated: userData.activated || false,
          disabled: userData.disabled || false,
          disabledAt: userData.disabledAt || '',
          lastLoginAt: userData.lastLoginAt || '',
          totalTokens: tokenData?.totalTokens || 0,
          usedTokens: tokenData?.usedTokens || 0,
          autoRenewal: tokenData?.autoRenewal || false
        });
      }

      // Sort users by creation date in JavaScript instead of Firestore
      corporateUsers.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Descending order (newest first)
      });

      setUsers(corporateUsers);
      console.log(`📊 Carregados ${corporateUsers.length} usuários corporativos`);
    } catch (error) {
      console.error('Erro ao carregar usuários corporativos:', error);
      setError('Erro ao carregar usuários corporativos');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePauseUser = async (user: CorporateUser) => {
    if (!confirm(`Tem certeza que deseja pausar a conta de ${user.name}?`)) {
      return;
    }

    setActionLoading(user.uid);
    try {
      const now = new Date().toISOString();
      
      // Pausar usuário
      await updateDoc(doc(db, 'users', user.uid), {
        disabled: true,
        disabledAt: now,
        disabledBy: auth.currentUser?.email,
        disabledReason: 'Pausado pelo administrador'
      });

      // Registrar ação para compliance
      await setDoc(doc(collection(db, 'adminActions'), crypto.randomUUID()), {
        adminEmail: auth.currentUser?.email,
        action: 'pause_corporate_user',
        targetUserId: user.uid,
        targetUserEmail: user.email,
        performedAt: now,
        reason: 'Conta pausada pelo administrador'
      });

      setSuccess(`Conta de ${user.name} pausada com sucesso`);
      loadCorporateUsers();
    } catch (error) {
      console.error('Erro ao pausar usuário:', error);
      setError('Erro ao pausar usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateUser = async (user: CorporateUser) => {
    if (!confirm(`Tem certeza que deseja reativar a conta de ${user.name}?`)) {
      return;
    }

    setActionLoading(user.uid);
    try {
      const now = new Date().toISOString();
      
      // Reativar usuário
      await updateDoc(doc(db, 'users', user.uid), {
        disabled: false,
        reactivatedAt: now,
        reactivatedBy: auth.currentUser?.email
      });

      // Registrar ação para compliance
      await setDoc(doc(collection(db, 'adminActions'), crypto.randomUUID()), {
        adminEmail: auth.currentUser?.email,
        action: 'reactivate_corporate_user',
        targetUserId: user.uid,
        targetUserEmail: user.email,
        performedAt: now,
        reason: 'Conta reativada pelo administrador'
      });

      setSuccess(`Conta de ${user.name} reativada com sucesso`);
      loadCorporateUsers();
    } catch (error) {
      console.error('Erro ao reativar usuário:', error);
      setError('Erro ao reativar usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveUser = async (user: CorporateUser) => {
    const confirmText = `REMOVER ${user.name.toUpperCase()}`;
    const userInput = prompt(
      `ATENÇÃO: Esta ação é irreversível!\n\nPara confirmar a remoção da conta corporativa de ${user.name}, digite exatamente:\n\n${confirmText}`
    );

    if (userInput !== confirmText) {
      alert('Texto de confirmação incorreto. Operação cancelada.');
      return;
    }

    setActionLoading(user.uid);
    try {
      const now = new Date().toISOString();
      
      // Marcar usuário como removido (não deletar completamente para auditoria)
      await updateDoc(doc(db, 'users', user.uid), {
        disabled: true,
        removed: true,
        removedAt: now,
        removedBy: auth.currentUser?.email,
        removedReason: 'Removido pelo administrador'
      });

      // Desativar tokens
      const tokenDoc = await getDoc(doc(db, 'tokenUsage', user.uid));
      if (tokenDoc.exists()) {
        await updateDoc(doc(db, 'tokenUsage', user.uid), {
          disabled: true,
          disabledAt: now,
          totalTokens: 0,
          usedTokens: 0
        });
      }

      // Registrar ação para compliance e auditoria
      await setDoc(doc(collection(db, 'adminActions'), crypto.randomUUID()), {
        adminEmail: auth.currentUser?.email,
        action: 'remove_corporate_user',
        targetUserId: user.uid,
        targetUserEmail: user.email,
        targetUserName: user.name,
        targetUserCompany: user.company,
        performedAt: now,
        reason: 'Conta corporativa removida pelo administrador',
        confirmationText: confirmText
      });

      setSuccess(`Conta corporativa de ${user.name} removida com sucesso`);
      loadCorporateUsers();
    } catch (error) {
      console.error('Erro ao remover usuário:', error);
      setError('Erro ao remover usuário corporativo');
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewUser = (user: CorporateUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  };

  const getStatusBadge = (user: CorporateUser) => {
    if (user.disabled) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
          <XCircle size={12} />
          Pausada
        </span>
      );
    }
    if (user.activated) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          <CheckCircle size={12} />
          Ativa
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
        <AlertTriangle size={12} />
        Pendente
      </span>
    );
  };

  const activeUsers = users.filter(u => !u.disabled).length;
  const pausedUsers = users.filter(u => u.disabled).length;
  const totalTokensUsed = users.reduce((sum, u) => sum + (u.usedTokens || 0), 0);
  const totalTokensAvailable = users.reduce((sum, u) => sum + (u.totalTokens || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/serp-keys')}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Voltar</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <Users size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Usuários Corporativos</h1>
                  <p className="text-gray-600">Administração de contas com acesso irrestrito</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mensagens de feedback */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total de Usuários</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Contas Ativas</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Pause className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Contas Pausadas</p>
                <p className="text-2xl font-bold text-orange-600">{pausedUsers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <Shield className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Consultas Usadas</p>
                <p className="text-2xl font-bold text-purple-600">{totalTokensUsed}</p>
                <p className="text-xs text-gray-500">de {totalTokensAvailable} disponíveis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">
              Usuários Corporativos ({filteredUsers.length})
            </h3>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <Users size={48} className="text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Nenhum usuário encontrado para a busca' : 'Nenhum usuário corporativo encontrado'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plano</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uso</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Criado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Building2 size={12} />
                          {user.company}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          <Shield size={12} />
                          {user.plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {user.usedTokens || 0}/{user.totalTokens || 0}
                          </div>
                          <div className="text-gray-500">
                            {(user.totalTokens || 0) - (user.usedTokens || 0)} restantes
                          </div>
                          {user.autoRenewal && (
                            <div className="text-xs text-green-600">Auto-renovação</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(user)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="Ver detalhes"
                          >
                            <Eye size={16} />
                          </button>
                          
                          {user.disabled ? (
                            <button
                              onClick={() => handleReactivateUser(user)}
                              disabled={actionLoading === user.uid}
                              className="text-green-600 hover:text-green-800 p-1 rounded disabled:opacity-50"
                              title="Reativar conta"
                            >
                              {actionLoading === user.uid ? (
                                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Play size={16} />
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePauseUser(user)}
                              disabled={actionLoading === user.uid}
                              className="text-orange-600 hover:text-orange-800 p-1 rounded disabled:opacity-50"
                              title="Pausar conta"
                            >
                              {actionLoading === user.uid ? (
                                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Pause size={16} />
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleRemoveUser(user)}
                            disabled={actionLoading === user.uid}
                            className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50"
                            title="Remover conta"
                          >
                            {actionLoading === user.uid ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Detalhes do Usuário */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalhes do Usuário Corporativo</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User size={16} />
                    Informações Básicas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Nome:</span>
                      <p className="font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{selectedUser.email}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Empresa:</span>
                      <p className="font-medium">{selectedUser.company}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Telefone:</span>
                      <p className="font-medium">{selectedUser.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Status da Conta */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield size={16} />
                    Status da Conta
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <div className="mt-1">{getStatusBadge(selectedUser)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Plano:</span>
                      <p className="font-medium">{selectedUser.plan}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Acesso Irrestrito:</span>
                      <p className="font-medium text-green-600">
                        {selectedUser.unrestrictedAccess ? 'Sim' : 'Não'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Auto-renovação:</span>
                      <p className="font-medium">
                        {selectedUser.autoRenewal ? 'Ativa' : 'Inativa'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Uso de Tokens */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Clock size={16} />
                    Uso de Consultas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Disponível:</span>
                      <p className="text-2xl font-bold text-blue-600">{selectedUser.totalTokens || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Usado:</span>
                      <p className="text-2xl font-bold text-orange-600">{selectedUser.usedTokens || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Restante:</span>
                      <p className="text-2xl font-bold text-green-600">
                        {(selectedUser.totalTokens || 0) - (selectedUser.usedTokens || 0)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Barra de progresso */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${selectedUser.totalTokens ? ((selectedUser.usedTokens || 0) / selectedUser.totalTokens) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>{selectedUser.totalTokens || 0} consultas</span>
                    </div>
                  </div>
                </div>

                {/* Datas Importantes */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Histórico
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Conta criada:</span>
                      <p className="font-medium">{formatDate(selectedUser.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Ativada em:</span>
                      <p className="font-medium">{formatDate(selectedUser.activatedAt || '')}</p>
                    </div>
                    {selectedUser.disabled && selectedUser.disabledAt && (
                      <div>
                        <span className="text-gray-600">Pausada em:</span>
                        <p className="font-medium text-red-600">{formatDate(selectedUser.disabledAt)}</p>
                      </div>
                    )}
                    {selectedUser.lastLoginAt && (
                      <div>
                        <span className="text-gray-600">Último login:</span>
                        <p className="font-medium">{formatDate(selectedUser.lastLoginAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações Rápidas */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {selectedUser.disabled ? (
                    <button
                      onClick={() => {
                        setShowUserModal(false);
                        handleReactivateUser(selectedUser);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                    >
                      <Play size={16} />
                      Reativar Conta
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowUserModal(false);
                        handlePauseUser(selectedUser);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                    >
                      <Pause size={16} />
                      Pausar Conta
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      handleRemoveUser(selectedUser);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    Remover Conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CorporateUserAdmin;