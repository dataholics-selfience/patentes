import { useState } from 'react';
import { 
  ArrowLeft, 
  Download,
  FlaskConical,
  Shield,
  Beaker,
  TestTube,
  FileText,
  TrendingUp,
  CheckCircle,
  XCircle,
  Globe,
  Building2,
  Calendar,
  ExternalLink,
  Award,
  DollarSign,
  BookOpen,
  Pill,
  MapPin
} from 'lucide-react';
import { PatentResultType } from '../types';
import jsPDF from 'jspdf';
import Flag from 'react-world-flags';

interface PatentResultsPageProps {
  result: PatentResultType;
  searchTerm: string;
  onBack: () => void;
}

// Mapeamento de países para códigos de bandeiras
const countryCodeMap: { [key: string]: string } = {
  'Estados Unidos': 'US',
  'United States': 'US',
  'Brasil': 'BR',
  'Brazil': 'BR',
  'Japão': 'JP',
  'Japan': 'JP',
  'Argentina': 'AR',
  'Colômbia': 'CO',
  'Colombia': 'CO',
  'Chile': 'CL',
  'México': 'MX',
  'Mexico': 'MX',
  'União Europeia': 'EU',
  'European Union': 'EU',
  'China': 'CN',
  'Alemanha': 'DE',
  'Germany': 'DE',
  'França': 'FR',
  'France': 'FR',
  'Reino Unido': 'GB',
  'United Kingdom': 'GB'
};

const getCountryCode = (countryName: string): string => {
  return countryCodeMap[countryName] || 'UN';
};

// Componente Gauge para Score de Oportunidade
const OpportunityGauge = ({ score, classification }: { score: number; classification: string }) => {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColor = (score: number) => {
    if (score >= 80) return '#10B981'; // Verde
    if (score >= 60) return '#F59E0B'; // Amarelo
    if (score >= 40) return '#F97316'; // Laranja
    return '#EF4444'; // Vermelho
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            stroke={getColor(score)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{score}</span>
          <span className="text-sm text-gray-600">de 100</span>
        </div>
      </div>
      <div className="mt-4 text-center">
        <div className="text-lg font-semibold text-gray-900">{classification}</div>
        <div className="text-sm text-gray-600">Score de Oportunidade</div>
      </div>
    </div>
  );
};

const PatentResultsPage = ({ result, searchTerm, onBack }: PatentResultsPageProps) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Parse do JSON result
  const data = typeof result === 'string' ? JSON.parse(result) : result;
  
  const produto = data.produto || searchTerm;
  const patentes = data.patentes || [];
  const quimica = data.quimica || {};
  const ensaiosClinicosData = data.ensaios_clinicos || {};
  const orangeBook = data.orange_book || {};
  const registroRegulatorio = data.registro_regulatorio || {};
  const regulacaoPorPais = data.regulacao_por_pais || [];
  const evidenciaCientifica = data.evidencia_cientifica_recente || [];
  const estrategiasFormulacao = data.estrategias_de_formulacao || {};
  const dadosMercado = data.dados_de_mercado || {};
  const scoreOportunidade = data.score_de_oportunidade || {};

  const handleSavePDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;
      
      // Título
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RELATÓRIO DE ANÁLISE DE PATENTE FARMACÊUTICA', margin, yPosition);
      yPosition += 15;
      
      // Produto
      pdf.setFontSize(14);
      pdf.text(`Produto: ${produto}`, margin, yPosition);
      yPosition += 10;
      
      // Data
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPosition);
      yPosition += 15;
      
      // Score
      if (scoreOportunidade.valor) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`Score de Oportunidade: ${scoreOportunidade.valor}/100 (${scoreOportunidade.classificacao})`, margin, yPosition);
        yPosition += 10;
      }
      
      const fileName = `relatorio-patente-${produto.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
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
                <FlaskConical size={32} className="text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Análise Completa de Propriedade Intelectual</h1>
                  <p className="text-gray-600">Relatório detalhado do produto farmacêutico</p>
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
          {/* Produto e Score */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Produto */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FlaskConical size={24} className="text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Produto Analisado</h2>
              </div>
              
              <div className="mb-4">
                <p className="text-3xl font-bold text-blue-600">{produto}</p>
                <p className="text-sm text-gray-500 mt-1">Produto farmacêutico consultado</p>
              </div>

              {estrategiasFormulacao.nome_comercial && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Nome Comercial</div>
                  <div className="text-lg font-semibold text-blue-800">{estrategiasFormulacao.nome_comercial}</div>
                  {estrategiasFormulacao.fabricante && (
                    <div className="text-sm text-gray-600 mt-1">Fabricante: {estrategiasFormulacao.fabricante}</div>
                  )}
                </div>
              )}
            </div>

            {/* Score de Oportunidade */}
            {scoreOportunidade.valor && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={24} className="text-green-600" />
                  <h2 className="text-xl font-bold text-gray-900">Análise de Oportunidade</h2>
                </div>
                
                <div className="flex justify-center">
                  <OpportunityGauge 
                    score={scoreOportunidade.valor} 
                    classification={scoreOportunidade.classificacao} 
                  />
                </div>

                {scoreOportunidade.justificativa && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Justificativa</div>
                    <p className="text-sm text-gray-600">{scoreOportunidade.justificativa}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dados da Patente */}
          {patentes.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Shield size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Dados da Patente Principal</h3>
                </div>
              </div>
              
              {patentes.map((patente, index) => (
                <div key={index} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <span className="text-sm font-medium text-gray-600">Número da Patente</span>
                      <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{patente.numero_patente}</p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        {patente.patente_vigente ? (
                          <CheckCircle size={20} className="text-green-600" />
                        ) : (
                          <XCircle size={20} className="text-red-600" />
                        )}
                        <span className="font-semibold text-gray-900">Status</span>
                      </div>
                      <p className={`text-lg font-bold ${patente.patente_vigente ? 'text-green-600' : 'text-red-600'}`}>
                        {patente.patente_vigente ? 'VIGENTE' : 'EXPIRADA'}
                      </p>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <span className="text-sm font-medium text-gray-600">Expiração Principal</span>
                      <p className="text-lg font-bold text-gray-900 mt-1">{patente.data_expiracao_patente_principal}</p>
                    </div>
                  </div>

                  {patente.objeto_protecao && (
                    <div className="bg-white p-4 rounded-lg border border-blue-100">
                      <span className="text-sm font-medium text-gray-600">Objeto de Proteção</span>
                      <p className="text-gray-900 mt-1">{patente.objeto_protecao}</p>
                    </div>
                  )}

                  {/* Patentes por País */}
                  {patente.patentes_por_pais && patente.patentes_por_pais.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-blue-600" />
                        Patentes por País
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {patente.patentes_por_pais.map((country, idx) => (
                          <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 mb-3">
                              <Flag 
                                code={getCountryCode(country.pais)} 
                                style={{ width: 24, height: 18 }}
                              />
                              <span className="font-medium">{country.pais}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div><strong>Número:</strong> {country.numero || 'N/A'}</div>
                              <div><strong>Status:</strong> {country.status}</div>
                              <div><strong>Expiração:</strong> {country.data_expiracao}</div>
                              {country.tipo && country.tipo.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {country.tipo.map((tipo, i) => (
                                    <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                      {tipo}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Dados Químicos */}
          {quimica.molecular_formula && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <Beaker size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Dados Químicos</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Fórmula Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{quimica.molecular_formula}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">Peso Molecular</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{quimica.molecular_weight} g/mol</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-purple-100">
                  <span className="text-sm font-medium text-gray-600">InChI Key</span>
                  <p className="text-sm font-mono text-gray-900 mt-1 break-all">{quimica.inchi_key}</p>
                </div>

                {quimica.iupac_name && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100 md:col-span-2 lg:col-span-3">
                    <span className="text-sm font-medium text-gray-600">Nome IUPAC</span>
                    <p className="text-sm text-gray-900 mt-1 break-words">{quimica.iupac_name}</p>
                  </div>
                )}

                {quimica.smiles && (
                  <div className="bg-white p-4 rounded-lg border border-purple-100 md:col-span-2 lg:col-span-3">
                    <span className="text-sm font-medium text-gray-600">SMILES</span>
                    <p className="text-sm font-mono text-gray-900 mt-1 break-all">{quimica.smiles}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ensaios Clínicos */}
          {ensaiosClinicosData.estudos && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                  <TestTube size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ensaios Clínicos</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">Estudos Ativos</span>
                  <p className="text-2xl font-bold text-green-600 mt-1">{ensaiosClinicosData.ativos}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">Fase Avançada</span>
                  <p className={`text-lg font-bold mt-1 ${ensaiosClinicosData.fase_avancada ? 'text-green-600' : 'text-red-600'}`}>
                    {ensaiosClinicosData.fase_avancada ? 'SIM' : 'NÃO'}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-green-100">
                  <span className="text-sm font-medium text-gray-600">Estudos no Brasil</span>
                  <p className={`text-lg font-bold mt-1 ${ensaiosClinicosData.tem_no_brasil ? 'text-green-600' : 'text-red-600'}`}>
                    {ensaiosClinicosData.tem_no_brasil ? 'SIM' : 'NÃO'}
                  </p>
                </div>
              </div>

              {ensaiosClinicosData.principais_indicacoes_estudadas && (
                <div className="mb-6">
                  <span className="text-sm font-medium text-gray-600 mb-2 block">Principais Indicações</span>
                  <div className="flex flex-wrap gap-2">
                    {ensaiosClinicosData.principais_indicacoes_estudadas.map((indicacao, idx) => (
                      <span key={idx} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                        {indicacao}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900">Estudos Detalhados</h4>
                {ensaiosClinicosData.estudos.map((estudo, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-green-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-bold text-lg text-gray-900 mb-2">{estudo.titulo}</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Award size={16} className="text-green-600" />
                            <span><strong>Fase:</strong> {estudo.fase}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-green-600" />
                            <span><strong>País:</strong> {estudo.pais}</span>
                          </div>
                        </div>
                      </div>
                      {estudo.link && (
                        <a 
                          href={estudo.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="ml-4 text-green-600 hover:text-green-800"
                        >
                          <ExternalLink size={16} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orange Book */}
          {orangeBook.nda_number && (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">FDA Orange Book</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-600">Número NDA</span>
                  <p className="text-lg font-bold text-gray-900 mt-1 font-mono">{orangeBook.nda_number}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-600">Data de Aprovação</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{orangeBook.data_aprovacao}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-600">Expiração da Exclusividade</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{orangeBook.data_expiracao_exclusividade}</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-orange-100">
                  <span className="text-sm font-medium text-gray-600">Possui Genérico</span>
                  <p className={`text-lg font-bold mt-1 ${orangeBook.tem_generico ? 'text-green-600' : 'text-red-600'}`}>
                    {orangeBook.tem_generico ? 'SIM' : 'NÃO'}
                  </p>
                </div>

                {orangeBook.exclusividades && orangeBook.exclusividades.length > 0 && (
                  <div className="bg-white p-4 rounded-lg border border-orange-100 md:col-span-2">
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Exclusividades</span>
                    <div className="flex flex-wrap gap-2">
                      {orangeBook.exclusividades.map((exclusividade, idx) => (
                        <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm">
                          {exclusividade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Registro Regulatório */}
          {Object.keys(registroRegulatorio).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 size={24} className="text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Registros Regulatórios</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(registroRegulatorio).map(([pais, registro]) => (
                  <div key={pais} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Flag 
                        code={getCountryCode(pais)} 
                        style={{ width: 24, height: 18 }}
                      />
                      <span className="font-semibold">{pais}</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      {registro.numero_registro && (
                        <div><strong>Registro:</strong> {registro.numero_registro}</div>
                      )}
                      {registro.nda && (
                        <div><strong>NDA:</strong> {registro.nda}</div>
                      )}
                      {registro.data_registro && (
                        <div><strong>Data:</strong> {registro.data_registro}</div>
                      )}
                      {registro.data_aprovacao && (
                        <div><strong>Aprovação:</strong> {registro.data_aprovacao}</div>
                      )}
                      {registro.descricao && (
                        <div><strong>Descrição:</strong> {registro.descricao}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regulação por País */}
          {regulacaoPorPais.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Building2 size={24} className="text-red-600" />
                <h3 className="text-xl font-bold text-gray-900">Regulação por País</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regulacaoPorPais.map((regulacao, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Flag 
                        code={getCountryCode(regulacao.pais)} 
                        style={{ width: 32, height: 24 }}
                      />
                      <div>
                        <h4 className="font-bold text-lg">{regulacao.pais}</h4>
                        <p className="text-sm text-gray-600">{regulacao.agencia}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Classificação</span>
                        <div className="mt-1">
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                            {regulacao.classificacao}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-600">Facilidade Registro Genérico</span>
                        <div className="mt-1">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            regulacao.facilidade_registro_generico === 'Alta' ? 'bg-green-100 text-green-800' :
                            regulacao.facilidade_registro_generico === 'Média' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {regulacao.facilidade_registro_generico}
                          </span>
                        </div>
                      </div>

                      {regulacao.restricoes && regulacao.restricoes.length > 0 && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">Restrições</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {regulacao.restricoes.map((restricao, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                                {restricao}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidência Científica */}
          {evidenciaCientifica.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen size={24} className="text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Evidência Científica Recente</h3>
              </div>
              
              <div className="space-y-4">
                {evidenciaCientifica.map((evidencia, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{evidencia.titulo}</h4>
                        <div className="text-sm text-gray-600 mb-2">
                          <span>{evidencia.autores.join(', ')} ({evidencia.ano})</span>
                        </div>
                        <p className="text-gray-700 mb-3">{evidencia.resumo}</p>
                        {evidencia.doi && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">DOI:</span>
                            <a 
                              href={`https://doi.org/${evidencia.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              {evidencia.doi}
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estratégias de Formulação */}
          {estrategiasFormulacao.variacoes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Pill size={24} className="text-teal-600" />
                <h3 className="text-xl font-bold text-gray-900">Estratégias de Formulação</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {estrategiasFormulacao.variacoes && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Variações Disponíveis</span>
                    <div className="space-y-2">
                      {estrategiasFormulacao.variacoes.map((variacao, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Pill size={16} className="text-teal-600" />
                          <span>{variacao}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {estrategiasFormulacao.tecnologia && (
                  <div>
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Tecnologias</span>
                    <div className="flex flex-wrap gap-2">
                      {estrategiasFormulacao.tecnologia.map((tech, idx) => (
                        <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dados de Mercado */}
          {dadosMercado.preco_medio_estimado && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <DollarSign size={24} className="text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Dados de Mercado</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <span className="text-sm font-medium text-gray-600">Preço Médio Estimado</span>
                  <p className="text-2xl font-bold text-green-600 mt-1">{dadosMercado.preco_medio_estimado}</p>
                  <p className="text-sm text-gray-500">Referência: {dadosMercado.referencia_ano}</p>
                </div>

                {dadosMercado.top_3_paises_volume && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 md:col-span-2">
                    <span className="text-sm font-medium text-gray-600 mb-2 block">Top 3 Países por Volume</span>
                    <div className="flex flex-wrap gap-2">
                      {dadosMercado.top_3_paises_volume.map((pais, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-white rounded border">
                          <Flag 
                            code={getCountryCode(pais)} 
                            style={{ width: 20, height: 15 }}
                          />
                          <span className="text-sm font-medium">{pais}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatentResultsPage;