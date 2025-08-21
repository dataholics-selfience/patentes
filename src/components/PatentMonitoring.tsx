import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Search, Eye, Calendar, Building2, Pill, TestTube, Globe, Filter, ChevronDown } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PipelineCompleta } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import PatentResultsPage from './PatentResultsPage';
import PatentDashboardReport from './PatentDashboardReport';
import { isDashboardData, parseDashboardData, parsePatentResponse } from '../utils/patentParser';

const PatentMonitoring = () => {
  const [consultas, setConsultas] = useState<PipelineCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsulta, setSelectedConsulta] = useState<PipelineCompleta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState<'all' | 'production' | 'test'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchConsultas = async () => {
      if (!auth.currentUser) return;

      try {
        const q = query(
          collection(db, 'drugPipelines'),
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const consultasList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PipelineCompleta[];
        
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
        Pipeline
      </span>
    ) : (
      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
        Patente
      </span>
    );
  };

  const filteredConsultas = consultas.filter(consulta => {
    const matchesSearch = !searchTerm || 
      consulta.target_disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consulta.therapeutic_area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || consulta.therapeutic_area === filterCategory;
    
    const matchesEnvironment = filterEnvironment === 'all' || consulta.environment === filterEnvironment;
    
    return matchesSearch && matchesCategory && matchesEnvironment;
  });

  const uniqueCategories = [...new Set(consultas.map(c => c.therapeutic_area).filter(Boolean))];

  const handleConsultaClick = (consulta: PipelineCompleta) => {
    setSelectedConsulta(consulta);
  };

  const handleBackToMonitoring = () => {
    setSelectedConsulta(null);
  };

  if (selectedConsulta) {
    let parsedData = selectedConsulta.resultado;
    
    if (typeof parsedData === 'string') {
      try {
        parsedData = JSON.parse(parsedData);
      } catch (error) {
        console.error('Error parsing stored data:', error);
      }
    }
    
    const isCurrentlyDashboard = isDashboardData(parsedData);
    
    if (isCurrentlyDashboard || selectedConsulta.isDashboard) {
      const dashboardData = parseDashboardData(parsedData);
      return (
        <PatentDashboardReport
          data={dashboardData}
          onBack={handleBackToMonitoring}
        />
      );
    } else {
      let patentData;
      try {
        patentData = parsePatentResponse(parsedData);
      } catch (error) {
        console.error('Error parsing patent data:', error);
        patentData = parsedData;
      }
      
      return (
        <PatentResultsPage
          result={patentData}
          searchTerm={`${selectedConsulta.target_disease} (${selectedConsulta.therapeutic_area})`}
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
            <img 
              src="/logo-pharmyrus.jpg" 
              alt="Pharmyrus" 
              className="h-8 w-auto"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Histórico de Pipelines</h2>
              <p className="text-gray-600">Histórico completo de pipelines criados</p>
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

        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Doença alvo ou área terapêutica"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Área Terapêutica</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as áreas</option>
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Search size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total de Pipelines</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{consultas.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Pill size={20} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">Áreas Terapêuticas</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{uniqueCategories.length}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Mercados</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {new Set(consultas.flatMap(c => c.geographic_markets)).size}
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Medicamentos</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">{consultas.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Search size={24} className="text-gray-600" />
            Histórico Completo de Pipelines
          </h3>
          
          {filteredConsultas.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={64} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {consultas.length === 0 ? 'Nenhum pipeline criado' : 'Nenhum pipeline encontrado'}
              </h3>
              <p className="text-gray-600">
                {consultas.length === 0 
                  ? 'Crie seu primeiro pipeline de medicamento para ver o histórico aqui.'
                  : 'Tente ajustar os filtros para encontrar os pipelines desejados.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredConsultas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="bg-gray-50 hover:bg-gray-100 rounded-lg p-4 border border-gray-200 transition-colors cursor-pointer"
                  onClick={() => handleConsultaClick(consulta)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <Pill size={20} className="text-blue-600" />
                          <h3 className="text-lg font-bold text-gray-900">
                            {consulta.target_disease}
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
                            <span>Área: <strong>{consulta.therapeutic_area}</strong></span>
                          </div>
                          
                          {consulta.mechanism_of_action && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>Mecanismo: <strong>{consulta.mechanism_of_action}</strong></span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>População: <strong>{consulta.target_population}</strong></span>
                          </div>
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
                      
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe size={14} className="text-indigo-600" />
                          <span className="text-sm font-medium text-gray-700">
                            Mercados analisados ({consulta.geographic_markets.length}):
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {consulta.geographic_markets.map((market, idx) => (
                            <span key={idx} className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                              {market}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-200">
                          <strong>Orçamento:</strong> {consulta.budget_range}
                        </div>
                        <div className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-200">
                          <strong>Timeline:</strong> {consulta.timeline_preference}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConsultaClick(consulta);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">ℹ️ Sobre o Pipeline Pharmyrus</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cada pipeline inclui análise completa de patentes, preços, estudos de mercado e criação de medicamento inovador</li>
            <li>• A IA consulta automaticamente todas as principais agências regulatórias internacionais</li>
            <li>• Gera documentação completa para registro de patente e aprovação regulatória</li>
            <li>• Inclui análise SWOT, TAM SAM SOM e projeções financeiras detalhadas</li>
            <li>• Clique em qualquer pipeline para revisar o relatório completo</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PatentMonitoring;