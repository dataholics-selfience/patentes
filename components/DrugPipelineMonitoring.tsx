import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Search, Eye, Calendar, Building2, Pill, TestTube, Globe, Filter, ChevronDown, FlaskConical, BarChart3, TrendingUp, Package, Target } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { PipelineCompleta } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CountryFlagsFromText } from '../utils/countryFlags';
import DrugPipelineReport from './DrugPipelineReport';
import { parseDashboardData } from '../utils/patentParser';

const DrugPipelineMonitoring = () => {
  const [pipelines, setPipelines] = useState<PipelineCompleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPipeline, setSelectedPipeline] = useState<PipelineCompleta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArea, setFilterArea] = useState('');
  const [filterEnvironment, setFilterEnvironment] = useState<'all' | 'production' | 'test'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchPipelines = async () => {
      if (!auth.currentUser) return;

      try {
        // Use simple query without orderBy to avoid composite index requirement
        const q = query(
          collection(db, 'drugPipelines'),
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const pipelinesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as PipelineCompleta[];
        
        // Sort in client code instead of using Firestore orderBy
        pipelinesList.sort((a, b) => new Date(b.consultedAt).getTime() - new Date(a.consultedAt).getTime());
        
        setPipelines(pipelinesList);
      } catch (error) {
        console.error('Error fetching pipelines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPipelines();
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

  // Filtrar pipelines
  const filteredPipelines = pipelines.filter(pipeline => {
    const matchesSearch = !searchTerm || 
      pipeline.target_disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pipeline.therapeutic_area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArea = !filterArea || pipeline.therapeutic_area === filterArea;
    
    const matchesEnvironment = filterEnvironment === 'all' || pipeline.environment === filterEnvironment;
    
    return matchesSearch && matchesArea && matchesEnvironment;
  });

  const uniqueAreas = [...new Set(pipelines.map(p => p.therapeutic_area).filter(Boolean))];

  const handlePipelineClick = (pipeline: PipelineCompleta) => {
    setSelectedPipeline(pipeline);
  };

  const handleBackToMonitoring = () => {
    setSelectedPipeline(null);
  };

  // Se um pipeline está selecionado, mostrar o relatório
  if (selectedPipeline) {
    const pipelineData = parseDashboardData(selectedPipeline.resultado);
    return (
      <DrugPipelineReport
        data={pipelineData}
        onBack={handleBackToMonitoring}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Carregando pipelines...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FlaskConical size={32} className="text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Pipeline de Medicamentos</h2>
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
                  placeholder="Doença alvo ou área terapêutica"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Área Terapêutica</label>
                <select
                  value={filterArea}
                  onChange={(e) => setFilterArea(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as áreas</option>
                  {uniqueAreas.map(area => (
                    <option key={area} value={area}>{area}</option>
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
              <FlaskConical size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total de Pipelines</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{pipelines.length}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TestTube size={20} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">Áreas Terapêuticas</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{uniqueAreas.length}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Globe size={20} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Mercados Analisados</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              {new Set(pipelines.flatMap(p => p.geographic_markets)).size}
            </p>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={20} className="text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Medicamentos Criados</span>
            </div>
            <p className="text-2xl font-bold text-orange-900 mt-1">{pipelines.length}</p>
          </div>
        </div>

        {/* Lista de Pipelines */}
        {filteredPipelines.length === 0 ? (
          <div className="text-center py-12">
            <FlaskConical size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {pipelines.length === 0 ? 'Nenhum pipeline criado' : 'Nenhum pipeline encontrado'}
            </h3>
            <p className="text-gray-600">
              {pipelines.length === 0 
                ? 'Crie seu primeiro pipeline de medicamento para ver o histórico aqui.'
                : 'Tente ajustar os filtros para encontrar os pipelines desejados.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className="bg-gray-50 hover:bg-gray-100 rounded-lg p-6 border border-gray-200 transition-colors cursor-pointer"
                onClick={() => handlePipelineClick(pipeline)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <Pill size={20} className="text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">
                          {pipeline.target_disease}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {getEnvironmentBadge(pipeline.environment)}
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Pipeline
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TestTube size={14} className="text-purple-600" />
                          <span>Área: <strong>{pipeline.therapeutic_area}</strong></span>
                        </div>
                        
                        {pipeline.mechanism_of_action && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Target size={14} className="text-orange-600" />
                            <span>Mecanismo: <strong>{pipeline.mechanism_of_action}</strong></span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>População: <strong>{pipeline.target_population}</strong></span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-blue-600" />
                          <span>{formatDate(pipeline.consultedAt)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock size={14} className="text-orange-600" />
                          <span>Processamento: {formatResponseTime(pipeline.webhookResponseTime)}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>Empresa: <strong>{pipeline.userCompany}</strong></span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Mercados Geográficos */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Globe size={14} className="text-indigo-600" />
                        <span className="text-sm font-medium text-gray-700">
                          Mercados analisados ({pipeline.geographic_markets.length}):
                        </span>
                      </div>
                      <CountryFlagsFromText 
                        countriesText={pipeline.geographic_markets.join(', ')}
                        size={16}
                        showNames={false}
                        className="flex flex-wrap gap-1"
                      />
                    </div>
                    
                    {/* Orçamento e Timeline */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-200">
                        <strong>Orçamento:</strong> {pipeline.budget_range}
                      </div>
                      <div className="text-sm text-gray-600 bg-white rounded p-2 border border-gray-200">
                        <strong>Timeline:</strong> {pipeline.timeline_preference}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePipelineClick(pipeline);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver pipeline completo"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Informações sobre o sistema */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-bold text-blue-900 mb-2">ℹ️ Sobre o Pipeline Pharmyrus</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Cada pipeline inclui análise completa de patentes, preços, estudos de mercado e criação de medicamento inovador</li>
            <li>• A IA consulta automaticamente todas as principais agências regulatórias internacionais</li>
            <li>• Gera documentação completa para registro de patente e aprovação regulatória</li>
            <li>• Inclui análise SWOT, TAM SAM SOM e projeções financeiras detalhadas</li>
            <li>• Clique em qualquer pipeline para revisar o relatório completo</li>
            <li>• Use os filtros para encontrar pipelines específicos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DrugPipelineMonitoring;