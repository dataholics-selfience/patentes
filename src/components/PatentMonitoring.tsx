import { useState, useEffect } from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  Trash2, 
  Calendar, 
  Activity,
  AlertCircle,
  CheckCircle,
  Timer,
  Building2,
  Pill,
  Globe,
  BarChart3,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  orderBy 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { MonitoringConfig, MonitoringManager } from '../utils/monitoringManager';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PatentMonitoring = () => {
  const [monitorings, setMonitorings] = useState<MonitoringConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMonitorings: 0,
    activeMonitorings: 0,
    totalReconsultas: 0,
    monitoringsToday: 0
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchMonitorings();
    fetchStats();
  }, []);

  const fetchMonitorings = async () => {
    if (!auth.currentUser) return;

    try {
      const q = query(
        collection(db, 'monitoringConfigs'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const monitoringsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MonitoringConfig[];
      
      setMonitorings(monitoringsList);
    } catch (error) {
      console.error('Erro ao buscar monitoramentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!auth.currentUser) return;

    try {
      const stats = await MonitoringManager.getMonitoringStats(auth.currentUser.uid);
      setStats(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const handleToggleMonitoring = async (monitoringId: string, isActive: boolean) => {
    setActionLoading(monitoringId);
    
    try {
      if (isActive) {
        await MonitoringManager.stopMonitoring(monitoringId);
      } else {
        // Reativar monitoramento
        await updateDoc(doc(db, 'monitoringConfigs', monitoringId), {
          isActive: true,
          reactivatedAt: new Date().toISOString()
        });
      }
      
      await fetchMonitorings();
      await fetchStats();
    } catch (error) {
      console.error('Erro ao alterar status do monitoramento:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMonitoring = async (monitoringId: string) => {
    if (!confirm('Tem certeza que deseja excluir este monitoramento?')) return;
    
    setActionLoading(monitoringId);
    
    try {
      await MonitoringManager.stopMonitoring(monitoringId);
      await deleteDoc(doc(db, 'monitoringConfigs', monitoringId));
      
      await fetchMonitorings();
      await fetchStats();
    } catch (error) {
      console.error('Erro ao excluir monitoramento:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatInterval = (hours: number): string => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} minutos`;
    } else if (hours < 24) {
      return `${hours} horas`;
    } else {
      const days = Math.round(hours / 24);
      return `${days} dias`;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-300' 
      : 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive 
      ? <CheckCircle size={16} className="text-green-600" />
      : <AlertCircle size={16} className="text-gray-600" />;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin mx-auto w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Carregando monitoramentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Timer className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total de Monitoramentos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMonitorings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Activity className="text-green-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Monitoramentos Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeMonitorings}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-purple-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total de Reconsultas</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalReconsultas}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="text-orange-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Criados Hoje</p>
              <p className="text-2xl font-bold text-orange-600">{stats.monitoringsToday}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Monitoramentos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Clock size={24} className="text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">Monitoramentos de Patentes</h3>
          </div>
        </div>
        
        {monitorings.length === 0 ? (
          <div className="p-8 text-center">
            <Timer size={64} className="text-gray-400 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-900 mb-2">Nenhum monitoramento ativo</h4>
            <p className="text-gray-600 mb-6">
              Configure monitoramentos automáticos para suas consultas de patentes para receber atualizações periódicas.
            </p>
            <p className="text-sm text-gray-500">
              Para criar um monitoramento, realize uma consulta de patente e configure o monitoramento automático.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {monitorings.map((monitoring) => (
              <div key={monitoring.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <Pill size={20} className="text-blue-600" />
                        <h4 className="text-lg font-bold text-gray-900">
                          {monitoring.originalConsulta.nome_comercial}
                        </h4>
                      </div>
                      
                      <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(monitoring.isActive)}`}>
                        {getStatusIcon(monitoring.isActive)}
                        <span className="ml-1">{monitoring.isActive ? 'Ativo' : 'Pausado'}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 size={16} className="text-purple-600" />
                        <span>Molécula: {monitoring.originalConsulta.nome_molecula}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Timer size={16} className="text-orange-600" />
                        <span>Intervalo: {formatInterval(monitoring.intervalHours)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BarChart3 size={16} className="text-green-600" />
                        <span>Execuções: {monitoring.runCount}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} className="text-blue-600" />
                        <span>Criado: {formatDate(monitoring.createdAt)}</span>
                      </div>
                      
                      {monitoring.lastRunAt && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={16} className="text-indigo-600" />
                          <span>Última execução: {formatDate(monitoring.lastRunAt)}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Zap size={16} className="text-yellow-600" />
                        <span>Próxima: {formatDate(monitoring.nextRunAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Globe size={16} className="text-teal-600" />
                      <span>Países: {monitoring.originalConsulta.pais_alvo.join(', ')}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Categoria:</span> {monitoring.originalConsulta.categoria}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleToggleMonitoring(monitoring.id, monitoring.isActive)}
                      disabled={actionLoading === monitoring.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        monitoring.isActive
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } ${actionLoading === monitoring.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {actionLoading === monitoring.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : monitoring.isActive ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                      <span>{monitoring.isActive ? 'Pausar' : 'Ativar'}</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteMonitoring(monitoring.id)}
                      disabled={actionLoading === monitoring.id}
                      className={`flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm ${
                        actionLoading === monitoring.id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Trash2 size={16} />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informações sobre Monitoramento */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <Users size={20} />
          Como funciona o Monitoramento Automático
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Reconsultas automáticas no intervalo configurado</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Notificações WhatsApp quando há mudanças</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Histórico completo das últimas 5 consultas</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Detecção de novos produtos propostos</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Monitoramento pode ser pausado/reativado</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Cada reconsulta consome 1 token do plano</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatentMonitoring;