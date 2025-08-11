import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, RefreshCw, Eye, Calendar, Building2, Pill, TestTube } from 'lucide-react';
import { auth } from '../firebase';
import { ConsultationMonitor, ConsultaData } from '../utils/consultationMonitor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatentMonitoringProps {
  onBack: () => void;
}

const PatentMonitoring = ({ onBack }: PatentMonitoringProps) => {
  const [consultas, setConsultas] = useState<ConsultaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productConsultas, setProductConsultas] = useState<ConsultaData[]>([]);

  useEffect(() => {
    const fetchAllConsultas = async () => {
      if (!auth.currentUser) return;

      try {
        // Para simplicidade, vamos buscar todas as consultas do usuário
        // Em produção, você pode querer paginar ou filtrar
        const allConsultas = await ConsultationMonitor.getConsultasByProduct(
          auth.currentUser.uid, 
          '', 
          ''
        );
        setConsultas(allConsultas);
      } catch (error) {
        console.error('Erro ao buscar consultas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllConsultas();
  }, []);

  const handleProductSelect = async (nomeComercial: string, nomeMolecula: string) => {
    if (!auth.currentUser) return;

    const productKey = `${nomeComercial}-${nomeMolecula}`;
    setSelectedProduct(productKey);

    try {
      const consultas = await ConsultationMonitor.getConsultasByProduct(
        auth.currentUser.uid,
        nomeComercial,
        nomeMolecula
      );
      setProductConsultas(consultas);
    } catch (error) {
      console.error('Erro ao buscar consultas do produto:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getUniqueProducts = () => {
    const products = new Map<string, { nome_comercial: string; nome_molecula: string; count: number; lastConsulta: string }>();
    
    consultas.forEach(consulta => {
      const key = `${consulta.nome_comercial}-${consulta.nome_molecula}`;
      if (products.has(key)) {
        const existing = products.get(key)!;
        existing.count++;
        if (new Date(consulta.consultedAt) > new Date(existing.lastConsulta)) {
          existing.lastConsulta = consulta.consultedAt;
        }
      } else {
        products.set(key, {
          nome_comercial: consulta.nome_comercial,
          nome_molecula: consulta.nome_molecula,
          count: 1,
          lastConsulta: consulta.consultedAt
        });
      }
    });

    return Array.from(products.entries()).map(([key, data]) => ({ key, ...data }));
  };

  const uniqueProducts = getUniqueProducts();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900">Carregando monitoramento...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Voltar</span>
            </button>
            
            <div className="flex items-center gap-3">
              <Clock size={32} className="text-purple-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Monitoramento de Consultas</h2>
                <p className="text-gray-600">Histórico e reconsultas automáticas a cada {ConsultationMonitor.getReconsultaIntervalMinutes()} minutos</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} />
              <span>Reconsulta automática: {ConsultationMonitor.getReconsultaIntervalMinutes()} min</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de Produtos */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Produtos Monitorados</h3>
            
            {uniqueProducts.length === 0 ? (
              <div className="text-center py-8">
                <Pill size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma consulta realizada ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uniqueProducts.map((product) => (
                  <button
                    key={product.key}
                    onClick={() => handleProductSelect(product.nome_comercial, product.nome_molecula)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      selectedProduct === product.key
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Pill size={16} className="text-blue-600" />
                          <span className="font-medium text-gray-900">{product.nome_comercial}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <TestTube size={14} className="text-purple-600" />
                          <span className="text-sm text-gray-600">{product.nome_molecula}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Última consulta: {formatDate(product.lastConsulta)}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{product.count}</div>
                        <div className="text-xs text-gray-500">consultas</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes das Consultas */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedProduct ? 'Histórico de Consultas' : 'Selecione um Produto'}
            </h3>
            
            {selectedProduct && productConsultas.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {productConsultas.map((consulta) => (
                  <div key={consulta.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {consulta.isReconsulta ? (
                          <RefreshCw size={16} className="text-purple-600" />
                        ) : (
                          <Eye size={16} className="text-blue-600" />
                        )}
                        <span className="font-medium text-gray-900">
                          {consulta.isReconsulta ? `Reconsulta #${consulta.consultaNumero}` : 'Consulta Inicial'}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(consulta.consultedAt)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Empresa:</span>
                        <div className="font-medium">{consulta.empresa}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Categoria:</span>
                        <div className="font-medium">{consulta.categoria}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Benefício:</span>
                        <div className="font-medium">{consulta.beneficio}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Doença Alvo:</span>
                        <div className="font-medium">{consulta.doenca_alvo}</div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Países:</span>
                        <div className="flex flex-wrap gap-1">
                          {consulta.pais_alvo.map((pais, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {pais}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {consulta.nextReconsultaAt && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <RefreshCw size={14} />
                          <span>Próxima reconsulta: {formatDate(consulta.nextReconsultaAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : selectedProduct ? (
              <div className="text-center py-8">
                <Clock size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma consulta encontrada para este produto</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Eye size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Selecione um produto para ver o histórico</p>
              </div>
            )}
          </div>
        </div>

        {/* Informações sobre o sistema */}
        <div className="mt-8 p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h4 className="font-bold text-purple-900 mb-2">ℹ️ Como funciona o Monitoramento</h4>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• Cada consulta é automaticamente salva e agendada para reconsulta</li>
            <li>• Reconsultas acontecem a cada <strong>{ConsultationMonitor.getReconsultaIntervalMinutes()} minutos</strong></li>
            <li>• O campo "produto_proposto" é enviado para evitar duplicatas</li>
            <li>• O campo "reconsulta" contém o número sequencial da consulta</li>
          </ul>
          <div className="mt-3 text-xs text-purple-600">
            <strong>Para alterar o intervalo:</strong> Modifique a constante RECONSULTA_INTERVAL em src/utils/consultationMonitor.ts
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatentMonitoring;