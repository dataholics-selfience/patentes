import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Search, Eye, Calendar, Building2, Pill, TestTube, Globe, Filter, ChevronDown } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { ConsultaCompleta } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CountryFlagsFromText } from '../utils/countryFlags';
import PatentResultsPage from './PatentResultsPage';
import PatentDashboardReport from './PatentDashboardReport';

const PatentMonitoring = () => {
  const [consultas, setConsultas] = useState<ConsultaCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsulta, setSelectedConsulta] = useState<ConsultaCompleta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState<'all' | 'production' | 'test'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchConsultas = async () => {
      if (!auth.currentUser) return;

      try {
        // Use simple query without orderBy to avoid composite index requirement
        const q = query(
          collection(db, 'consultas'),
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const consultasList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ConsultaCompleta[];
        
        // Sort in client code instead of using Firestore orderBy
        consultasList.sort((a, b) => new Date(b.consultedAt).getTime() - new Date(a.consultedAt).getTime());
        
        setConsultas(consultasList);
      } catch (error) {
        console.error('Error fetching consultas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConsultas();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatResponseTime = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getEnvironmentBadge = (environment: string) => {
    return environment === 'production' ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        Produção
      </span>
    ) : (
      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
        Teste
      </span>
    );
  };

  const getTypeBadge = (isDashboard: boolean) => {
    return isDashboard ? (
      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
        Dashboard
      </span>
    ) : (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
        Patente
      </span>
    );
  };

  // Filtrar consultas
  const filteredConsultas = consultas.filter(consulta => {
    const matchesSearch = !searchTerm || 
      consulta.nome_comercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.nome_molecula.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || consulta.categoria === filterCategory;
    
    const matchesEnvironment = filterEnvironment === 'all' || consulta.environment === filterEnvironment;
    
    return matchesSearch && matchesCategory && matchesEnvironment;
  });

  const uniqueCategories = [...new Set(consultas.map(c => c.categoria).filter(Boolean))];

  const handleConsultaClick = (consulta: ConsultaCompleta) => {
    setSelectedConsulta(consulta);
  };

  const handleBackToMonitoring = () => {
    setSelectedConsulta(null);
  };

  // Se uma consulta está selecionada, mostrar os resultados
  if (selectedConsulta) {
    if (selectedConsulta.isDashboard) {
      return (
        <PatentDashboardReport
          data={selectedConsulta.resultado}
          onBack={handleBackToMonitoring}
        />
      );
    } else {
      return (
        <PatentResultsPage
          result={selectedConsulta.resultado}
          searchTerm={`${selectedConsulta.nome_comercial} (${selectedConsulta.nome_molecula})`}
          onBack={handleBackToMonitoring}
        />
      );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Carregando consultas...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock size={32} className="text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Monitoramento de Consultas</h2>
              <p className="text-gray-600">Histórico completo de consultas realizadas</p>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Filter size={16} />
            Filtros
            <ChevronDown size={16} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome comercial ou molécula"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as categorias</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ambiente</label>
                <select
                  value={filterEnvironment}
                  onChange={(e) => setFilterEnvironment(e.target.value as 'all' | 'production' | 'test')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os ambientes</option>
                  <option value="production">Produção</option>
                  <option value="test">Teste</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Search size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total de Consultas</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{consultas.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Pill size={20} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">Produtos Únicos</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {new Set(consultas.map(c => `${c.nome_comercial}-${c.nome_molecula}`)).size}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Categorias</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">{uniqueCategories.length}</p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Países Analisados</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {new Set(consultas.flatMap(c => c.pais_alvo)).size}
            </p>
          </div>
        </div>

        {/* Lista de Consultas */}
        {filteredConsultas.length === 0 ? (
          <div className="text-center py-12">
            <Clock size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {consultas.length === 0 ? 'Nenhuma consulta realizada' : 'Nenhuma consulta encontrada'}
            </h3>
            <p className="text-gray-600">
              {consultas.length === 0 
                ? 'Realize sua primeira consulta de patente para ver o histórico aqui.'
                : 'Tente ajustar os filtros para encontrar as consultas desejadas.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredConsultas.map((consulta) => (
              <div
                key={consulta.id}
                onClick={() => handleConsultaClick(consulta)}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border border-gray-200 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Pill size={20} className="text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          {consulta.nome_comercial}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getEnvironmentBadge(consulta.environment)}
                        {getTypeBadge(consulta.isDashboard)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TestTube size={14} className="text-purple-600" />
                          <span>Molécula: <strong>{consulta.nome_molecula}</strong></span>
                        </div>
                        
                        {consulta.categoria && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 size={14} className="text-green-600" />
                            <span>Categoria: <strong>{consulta.categoria}</strong></span>
                          </div>
                        )}
                        
                        {consulta.doenca_alvo && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Doença alvo: <strong>{consulta.doenca_alvo}</strong></span>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-blue-600" />
                          <span>{formatDate(consulta.consultedAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-orange-600" />
                          <span>Resposta: {formatResponseTime(consulta.webhookResponseTime)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Empresa: <strong>{consulta.userCompany}</strong></span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Países Alvo */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe size={14} className="text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Países analisados ({consulta.pais_alvo.length}):
                        </span>
                      </div>
                      <CountryFlagsFromText 
                        countriesText={consulta.pais_alvo.join(', ')}
                        size={16}
                        showNames={false}
                        className="flex flex-wrap gap-1"
                      />
                    </div>
                    
                    {/* Benefício */}
                    {consulta.beneficio && (
                      <div className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-200">
                        <strong>Benefício:</strong> {consulta.beneficio}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Eye size={20} className="text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informações sobre o sistema */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">ℹ️ Sobre o Monitoramento</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Todas as consultas são automaticamente salvas com data, hora e metadados completos</li>
            <li>• Clique em qualquer consulta para revisar os resultados completos</li>
            <li>• Use os filtros para encontrar consultas específicas</li>
            <li>• O tempo de resposta mostra a performance do webhook</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatentMonitoring;