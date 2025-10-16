import { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Shield,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Globe,
  Building2,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Target,
  Award
} from 'lucide-react';
import Flag from 'react-world-flags';
import jsPDF from 'jspdf';

interface PatentAnalysisReportProps {
  data: any;
  onBack: () => void;
}

const countryCodeMap: { [key: string]: string } = {
  'BR': 'BR', 'US': 'US', 'EP': 'EU', 'WO': 'UN', 'CN': 'CN',
  'JP': 'JP', 'KR': 'KR', 'DE': 'DE', 'FR': 'FR', 'GB': 'GB',
  'CA': 'CA', 'AU': 'AU', 'IN': 'IN', 'MX': 'MX', 'ES': 'ES',
  'IT': 'IT', 'NL': 'NL', 'CH': 'CH', 'SE': 'SE', 'BE': 'BE',
  'AT': 'AT', 'DK': 'DK', 'FI': 'FI', 'NO': 'NO', 'PL': 'PL',
  'PT': 'PT', 'IE': 'IE', 'GR': 'GR', 'CZ': 'CZ', 'HU': 'HU',
  'RO': 'RO', 'BG': 'BG', 'SK': 'SK', 'HR': 'HR', 'LT': 'LT',
  'SI': 'SI', 'LV': 'LV', 'EE': 'EE', 'CY': 'CY', 'LU': 'LU',
  'MT': 'MT', 'TR': 'TR', 'IL': 'IL', 'ZA': 'ZA', 'RU': 'RU',
  'UA': 'UA', 'TW': 'TW', 'SG': 'SG', 'MY': 'MY', 'TH': 'TH',
  'ID': 'ID', 'PH': 'PH', 'VN': 'VN', 'NZ': 'NZ', 'AR': 'AR',
  'CL': 'CL', 'CO': 'CO', 'PE': 'PE', 'VE': 'VE', 'CR': 'CR',
  'PA': 'PA', 'UY': 'UY', 'BO': 'BO', 'PY': 'PY', 'EC': 'EC',
  'GT': 'GT', 'HN': 'HN', 'NI': 'NI', 'SV': 'SV', 'SA': 'SA'
};

const getThreatColor = (nivel: string) => {
  const nivelLower = nivel?.toLowerCase() || '';
  if (nivelLower.includes('alta') || nivelLower.includes('crítica')) return 'text-red-600 bg-red-50';
  if (nivelLower.includes('média')) return 'text-yellow-600 bg-yellow-50';
  if (nivelLower.includes('baixa')) return 'text-green-600 bg-green-50';
  return 'text-gray-600 bg-gray-50';
};

const getThreatIcon = (nivel: string) => {
  const nivelLower = nivel?.toLowerCase() || '';
  if (nivelLower.includes('alta') || nivelLower.includes('crítica')) return <AlertTriangle className="text-red-600" size={16} />;
  if (nivelLower.includes('média')) return <AlertTriangle className="text-yellow-600" size={16} />;
  if (nivelLower.includes('baixa')) return <CheckCircle className="text-green-600" size={16} />;
  return <AlertTriangle className="text-gray-600" size={16} />;
};

const PatentAnalysisReport = ({ data, onBack }: PatentAnalysisReportProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [expandedPatent, setExpandedPatent] = useState<string | null>(null);

  const patentData = Array.isArray(data) ? data[0] : data;
  const meta = patentData?.meta || {};
  const estatisticas = patentData?.estatisticas || {};
  const relatorioExecutivo = patentData?.relatorio_executivo || {};
  const metricasChave = patentData?.metricas_chave || {};
  const patentes = patentData?.patentes || [];

  const handleSavePDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RELATÓRIO DE ANÁLISE DE PATENTES', margin, yPosition);
      yPosition += 15;

      pdf.setFontSize(14);
      pdf.text(`Molécula: ${meta.molecula || 'N/A'}`, margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(12);
      pdf.text(`Nome Comercial: ${meta.nome_comercial || 'N/A'}`, margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);

      const fileName = `relatorio-patentes-${meta.molecula?.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Voltar</span>
              </button>

              <div className="flex items-center gap-3">
                <Shield size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Análise de Patentes</h1>
                  <p className="text-gray-600">Relatório completo de propriedade intelectual</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSavePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gerando PDF...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Exportar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header Principal */}
          <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-xl shadow-2xl border border-blue-700 p-8">
            <div className="text-center mb-6">
              <h2 className="text-4xl font-bold text-white mb-2">
                {meta.nome_comercial || 'Nome Comercial'}
              </h2>
              <p className="text-blue-200 text-xl">
                Molécula: {meta.molecula || 'N/A'}
              </p>
              <p className="text-blue-300 text-lg">
                Classe Terapêutica: {meta.classe_terapeutica || 'N/A'}
              </p>
              {meta.timestamp && (
                <p className="text-blue-400 text-sm mt-2">
                  Data da Análise: {new Date(meta.timestamp).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>

            {/* Métricas Chave */}
            {metricasChave && Object.keys(metricasChave).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-800/50 rounded-lg p-4 border border-blue-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={20} className="text-white" />
                    <span className="text-white font-medium">Anos de Proteção</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{metricasChave.anos_protecao_restantes || 0}</p>
                </div>

                <div className="bg-red-800/50 rounded-lg p-4 border border-red-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={20} className="text-white" />
                    <span className="text-white font-medium">Patentes Alta Ameaça</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{metricasChave.patentes_alta_ameaca || 0}</p>
                </div>

                <div className="bg-purple-800/50 rounded-lg p-4 border border-purple-600/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 size={20} className="text-white" />
                    <span className="text-white font-medium">Concentração Titular</span>
                  </div>
                  <p className="text-3xl font-bold text-white">{metricasChave.concentracao_titular || 0}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Estatísticas Gerais */}
          {estatisticas && Object.keys(estatisticas).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-blue-600" />
                Estatísticas Gerais
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-gray-600">Total de Patentes</span>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{estatisticas.total_patentes || 0}</p>
                </div>

                {estatisticas.por_fonte && (
                  <>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-gray-600">INPI</span>
                      <p className="text-3xl font-bold text-green-600 mt-1">{estatisticas.por_fonte.INPI || 0}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <span className="text-sm font-medium text-gray-600">EPO</span>
                      <p className="text-3xl font-bold text-purple-600 mt-1">{estatisticas.por_fonte.EPO || 0}</p>
                    </div>
                  </>
                )}

                {estatisticas.por_relevancia && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <span className="text-sm font-medium text-gray-600">Relevância Média</span>
                    <p className="text-3xl font-bold text-orange-600 mt-1">{estatisticas.por_relevancia.media || 0}</p>
                  </div>
                )}
              </div>

              {/* Top Titulares */}
              {estatisticas.top_titulares && estatisticas.top_titulares.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Titulares</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {estatisticas.top_titulares.map((titular: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex justify-between items-center">
                        <span className="text-gray-800 text-sm">{titular.titular}</span>
                        <span className="font-bold text-blue-600">{titular.quantidade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {estatisticas.timeline && estatisticas.timeline.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline de Patentes</h4>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {estatisticas.timeline.map((item: any, idx: number) => (
                      <div key={idx} className="bg-indigo-50 p-3 rounded-lg border border-indigo-200 flex-shrink-0">
                        <div className="text-sm font-medium text-gray-600">{item.ano}</div>
                        <div className="text-2xl font-bold text-indigo-600">{item.quantidade}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Relatório Executivo */}
          {relatorioExecutivo && Object.keys(relatorioExecutivo).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FileText size={24} className="text-purple-600" />
                Relatório Executivo
              </h3>

              <div className="space-y-6">
                {relatorioExecutivo.panorama_geral && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-bold text-purple-900 mb-2">Panorama Geral</h4>
                    <p className="text-gray-800 leading-relaxed">{relatorioExecutivo.panorama_geral}</p>
                  </div>
                )}

                {relatorioExecutivo.titular_dominante && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-bold text-blue-900 mb-2">Titular Dominante</h4>
                    <p className="text-gray-800 leading-relaxed">{relatorioExecutivo.titular_dominante}</p>
                  </div>
                )}

                {relatorioExecutivo.barreiras_criticas && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-bold text-red-900 mb-2">Barreiras Críticas</h4>
                    <p className="text-gray-800 leading-relaxed">{relatorioExecutivo.barreiras_criticas}</p>
                  </div>
                )}

                {relatorioExecutivo.janelas_oportunidade && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-bold text-green-900 mb-2">Janelas de Oportunidade</h4>
                    <p className="text-gray-800 leading-relaxed">{relatorioExecutivo.janelas_oportunidade}</p>
                  </div>
                )}

                {relatorioExecutivo.estrategia_extensao && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-bold text-orange-900 mb-2">Estratégia de Extensão</h4>
                    <p className="text-gray-800 leading-relaxed">{relatorioExecutivo.estrategia_extensao}</p>
                  </div>
                )}

                {relatorioExecutivo.formulacoes_avancadas && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-bold text-indigo-900 mb-2">Formulações Avançadas</h4>
                    <p className="text-gray-800 leading-relaxed">{relatorioExecutivo.formulacoes_avancadas}</p>
                  </div>
                )}

                {relatorioExecutivo.risco_infracao && (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-bold text-yellow-900 mb-2">Risco de Infração</h4>
                    <p className="text-gray-800 leading-relaxed">{relatorioExecutivo.risco_infracao}</p>
                  </div>
                )}

                {relatorioExecutivo.recomendacoes && (
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <h4 className="font-bold text-teal-900 mb-2">Recomendações Estratégicas</h4>
                    <p className="text-gray-800 leading-relaxed">{relatorioExecutivo.recomendacoes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de Patentes */}
          {patentes && patentes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Shield size={24} className="text-blue-600" />
                Patentes Identificadas ({patentes.length})
              </h3>

              <div className="space-y-4">
                {patentes.map((patente: any, idx: number) => {
                  const isExpanded = expandedPatent === `${idx}`;

                  return (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => setExpandedPatent(isExpanded ? null : `${idx}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {patente.pais && (
                                <Flag
                                  code={countryCodeMap[patente.pais] || 'UN'}
                                  style={{ width: 24, height: 18 }}
                                />
                              )}
                              <span className="font-mono text-sm text-blue-600 font-medium">
                                {patente.numero_completo || patente.numero}
                              </span>
                              {patente.fonte && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  {patente.fonte}
                                </span>
                              )}
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {patente.titulo || patente.titulo_original || 'Título não disponível'}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {patente.data_deposito && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {patente.ano_deposito || new Date(patente.data_deposito).getFullYear()}
                                </span>
                              )}
                              {patente.tipo_patente && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                  {patente.tipo_patente}
                                </span>
                              )}
                              {patente.relevancia && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                                  {patente.relevancia}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="ml-4">
                            {isExpanded ? (
                              <XCircle size={20} className="text-gray-400" />
                            ) : (
                              <CheckCircle size={20} className="text-gray-400" />
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {patente.applicant && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Requerente:</span>
                                <p className="text-gray-900">{patente.applicant}</p>
                              </div>
                            )}

                            {patente.ipc && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">IPC:</span>
                                <p className="text-gray-900 font-mono">{patente.ipc}</p>
                              </div>
                            )}

                            {patente.date && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Data:</span>
                                <p className="text-gray-900">{new Date(patente.date).toLocaleDateString('pt-BR')}</p>
                              </div>
                            )}

                            {patente.termo_busca && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Termo de Busca:</span>
                                <p className="text-gray-900">{patente.termo_busca}</p>
                              </div>
                            )}

                            {patente.categoria_busca && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Categoria:</span>
                                <p className="text-gray-900">{patente.categoria_busca}</p>
                              </div>
                            )}

                            {patente.tipo_barreira && (
                              <div>
                                <span className="text-sm font-medium text-gray-600">Tipo de Barreira:</span>
                                <p className="text-gray-900">{patente.tipo_barreira}</p>
                              </div>
                            )}
                          </div>

                          {patente.abstract && (
                            <div className="mt-4">
                              <span className="text-sm font-medium text-gray-600 block mb-2">Resumo:</span>
                              <p className="text-gray-800 leading-relaxed text-sm bg-gray-50 p-3 rounded">
                                {patente.abstract}
                              </p>
                            </div>
                          )}

                          {/* Comentário da IA - só exibe se não for null */}
                          {patente.comentario_ia && (
                            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-start gap-2">
                                <Award size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="text-sm font-medium text-blue-900 block mb-1">Análise da IA:</span>
                                  <p className="text-blue-800 leading-relaxed text-sm">{patente.comentario_ia}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Nível de Ameaça - só exibe se não for null */}
                          {patente.nivel_ameaca && (
                            <div className={`mt-3 p-3 rounded-lg border ${getThreatColor(patente.nivel_ameaca)}`}>
                              <div className="flex items-center gap-2">
                                {getThreatIcon(patente.nivel_ameaca)}
                                <span className="font-medium">Nível de Ameaça: {patente.nivel_ameaca}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatentAnalysisReport;
