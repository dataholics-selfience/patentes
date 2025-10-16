import React, { useState } from 'react';
import { 
  Calendar, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  Pill,
  TestTube,
  FileText,
  Building2,
  Beaker,
  Microscope,
  Shield,
  BookOpen,
  ChevronRight,
  ExternalLink,
  HelpCircle,
  Search
} from 'lucide-react';
import Flag from 'react-world-flags';

// Tipos baseados no JSON atualizado
interface PatentData {
  patente_vigente: boolean;
  data_expiracao_patente_principal: string;
  data_expiracao_patente_secundaria: string;
  patentes_por_pais: Array<{
    pais: string;
    data_expiracao_primaria: string;
    data_expiracao_secundaria: string;
    tipos: string[];
    fonte: string;
  }>;
  exploracao_comercial_por_pais: Array<{
    pais: string;
    data_disponivel: string;
    tipos_liberados: string[];
    fonte: string;
  }>;
  exploracao_comercial: boolean;
  riscos_regulatorios_ou_eticos: string;
  data_vencimento_para_novo_produto: string;
  alternativas_de_compostos_analogos: string[];
  fonte_estimativa: string[];
}

interface ChemicalData {
  iupac_name: string;
  molecular_formula: string;
  molecular_weight: string;
  smiles: string;
  inchi_key: string;
  topological_polar_surface_area: string | number;
  hydrogen_bond_acceptors: string | number;
  hydrogen_bond_donors: string | number;
  rotatable_bonds: string | number;
  fonte: string;
}

interface ClinicalTrialsData {
  ativos: string;
  fase_avancada: string | boolean;
  paises: string[];
  principais_indicacoes_estudadas: string[];
  fonte: string;
}

interface OrangeBookData {
  tem_generico: boolean;
  nda_number: string;
  genericos_aprovados: string[];
  data_ultimo_generico: string;
  fonte: string;
}

interface RegulationData {
  pais: string;
  agencia: string;
  classificacao: string;
  restricoes: string[];
  facilidade_registro_generico: string;
  fonte: string;
}

interface ScientificEvidence {
  titulo: string;
  autores: string[];
  ano: number;
  resumo: string;
  doi: string;
  fonte: string;
}

interface PharmaceuticalData {
  patentes: PatentData[];
  quimica: ChemicalData;
  ensaios_clinicos: ClinicalTrialsData;
  orange_book: OrangeBookData;
  regulacao_por_pais: RegulationData[];
  evidencia_cientifica_recente: ScientificEvidence[];
  estrategias_de_formulacao: string[];
}

// Mapeamento de países para códigos de bandeiras
const countryCodeMap: { [key: string]: string } = {
  'United States': 'US',
  'Brazil': 'BR',
  'European Union': 'EU',
  'Argentina': 'AR',
  'Germany': 'DE',
  'France': 'FR',
  'United Kingdom': 'GB',
  'Japan': 'JP',
  'China': 'CN',
  'Canada': 'CA',
  'Australia': 'AU',
  'India': 'IN',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Switzerland': 'CH'
};

const getCountryCode = (countryName: string): string => {
  return countryCodeMap[countryName] || 'UN';
};

// Componente para valores desconhecidos
const UnknownValue: React.FC<{ children: React.ReactNode; tooltip?: string }> = ({ 
  children, 
  tooltip = "Dado não encontrado nas fontes oficiais" 
}) => (
  <span className="text-gray-400 italic flex items-center gap-1">
    {children}
    <HelpCircle size={14} className="text-gray-400" title={tooltip} />
  </span>
);

// Componente para status booleano com símbolos - CORRIGIDO
const BooleanStatus: React.FC<{ value: boolean | string; label: string }> = ({ value, label }) => {
  if (typeof value === 'string' && value === 'Desconhecido') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-700">{label}:</span>
        <UnknownValue>Desconhecido</UnknownValue>
      </div>
    );
  }
  
  const isTrue = Boolean(value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-700">{label}:</span>
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
        isTrue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <span className="text-lg font-bold">{isTrue ? '✓' : '✗'}</span>
        <span className="font-semibold">{isTrue ? 'SIM' : 'NÃO'}</span>
      </div>
    </div>
  );
};

// Componente para datas
const DateDisplay: React.FC<{ date: string; label: string }> = ({ date, label }) => (
  <div className="flex items-center gap-2">
    <Calendar size={16} className="text-blue-600" />
    <span className="text-gray-700">{label}:</span>
    {date === 'Desconhecido' || date === 'Não encontrada após 5 buscas' || date === 'Não aplicável' || date === 'Não encontrado' ? (
      <UnknownValue>Desconhecido</UnknownValue>
    ) : (
      <span className="font-medium">{date}</span>
    )}
  </div>
);

// Componente para fonte
const SourceBadge: React.FC<{ source: string | string[] }> = ({ source }) => {
  const sources = Array.isArray(source) ? source : [source];
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {sources.map((src, index) => (
        <span 
          key={index}
          className={`text-xs px-2 py-1 rounded-full ${
            src === 'Desconhecido' 
              ? 'bg-gray-100 text-gray-500' 
              : 'bg-blue-100 text-blue-700'
          }`}
        >
          📊 {src}
        </span>
      ))}
    </div>
  );
};

// Componente para chips/tags com tratamento para arrays vazios - CORRIGIDO
const ChipList: React.FC<{ items: string[]; emptyMessage?: string }> = ({ 
  items, 
  emptyMessage = "Desconhecidos" 
}) => (
  <div className="flex flex-wrap gap-2">
    {items && items.length > 0 ? (
      items.map((item, index) => (
        <span 
          key={index}
          className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
        >
          {item}
        </span>
      ))
    ) : (
      <UnknownValue>{emptyMessage}</UnknownValue>
    )}
  </div>
);

// Componente para compostos alternativos com links de busca
const AlternativeCompounds: React.FC<{ 
  compounds: string[]; 
  onCompoundClick: (compound: string) => void 
}> = ({ compounds, onCompoundClick }) => (
  <div className="flex flex-wrap gap-3">
    {compounds && compounds.length > 0 ? (
      compounds.map((compound, index) => (
        <button
          key={index}
          onClick={() => onCompoundClick(compound)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-lg font-medium transition-colors border border-teal-200 hover:border-teal-300"
        >
          <Search size={16} />
          {compound}
        </button>
      ))
    ) : (
      <UnknownValue>Nenhum composto alternativo identificado</UnknownValue>
    )}
  </div>
);

const PharmaceuticalDataViewer: React.FC = () => {
  const [activeSection, setActiveSection] = useState('patentes');

  // Função para simular nova busca por composto
  const handleCompoundSearch = (compound: string) => {
    alert(`Iniciando nova busca por: ${compound}`);
    // Aqui você implementaria a lógica real de busca
    // Por exemplo: navigate(`/search?q=${encodeURIComponent(compound)}`);
  };

  // Dados atualizados baseados no JSON do Ozempic
  const data: PharmaceuticalData = {
    patentes: [{
      patente_vigente: true,
      data_expiracao_patente_principal: "01/07/2026",
      data_expiracao_patente_secundaria: "Desconhecido",
      patentes_por_pais: [
        {
          pais: "United States",
          data_expiracao_primaria: "01/07/2026",
          data_expiracao_secundaria: "Desconhecido",
          tipos: ["API", "uso"],
          fonte: "Google Patents"
        },
        {
          pais: "Brazil",
          data_expiracao_primaria: "01/07/2026",
          data_expiracao_secundaria: "Não encontrada após 5 buscas",
          tipos: ["API"],
          fonte: "Google Brasil"
        },
        {
          pais: "European Union",
          data_expiracao_primaria: "Desconhecido",
          data_expiracao_secundaria: "Desconhecido",
          tipos: [],
          fonte: "Google Patents"
        }
      ],
      exploracao_comercial_por_pais: [
        {
          pais: "United States",
          data_disponivel: "01/07/2026",
          tipos_liberados: ["uso terapêutico"],
          fonte: "Google Patents"
        },
        {
          pais: "Brazil",
          data_disponivel: "01/07/2026",
          tipos_liberados: ["uso terapêutico"],
          fonte: "Google Brasil"
        },
        {
          pais: "European Union",
          data_disponivel: "Desconhecido",
          tipos_liberados: [], // Array vazio - será mostrado como "Desconhecidos"
          fonte: "Google Patents"
        }
      ],
      exploracao_comercial: true,
      riscos_regulatorios_ou_eticos: "Possível surgimento de biossimilares e aumento de competitividade",
      data_vencimento_para_novo_produto: "01/07/2026",
      alternativas_de_compostos_analogos: ["Liraglutide", "Tirzepatide"],
      fonte_estimativa: ["Google Patents", "PubMed", "PubChem"]
    }],
    quimica: {
      iupac_name: "Semaglutide",
      molecular_formula: "C187H291N45O59",
      molecular_weight: "4113.58",
      smiles: "CC(C)CC(N)C(=O)NC(CC1=CC=CC=C1)C(=O)NC(CO)C(=O)NCC2=CC=CC=C2",
      inchi_key: "OLLRHCDFLJYBMS-YSDCSADRSA-N",
      topological_polar_surface_area: 1459,
      hydrogen_bond_acceptors: 62,
      hydrogen_bond_donors: 68,
      rotatable_bonds: 76,
      fonte: "PubChem"
    },
    ensaios_clinicos: {
      ativos: "Desconhecido",
      fase_avancada: "Desconhecido",
      paises: ["United States", "Brazil", "Germany"],
      principais_indicacoes_estudadas: ["Diabetes tipo 2", "Obesidade"],
      fonte: "ClinicalTrials.gov (inferido)"
    },
    orange_book: {
      tem_generico: false,
      nda_number: "Não encontrado",
      genericos_aprovados: [],
      data_ultimo_generico: "Não aplicável",
      fonte: "FDA Orange Book"
    },
    regulacao_por_pais: [
      {
        pais: "Brazil",
        agencia: "ANVISA",
        classificacao: "Tarja vermelha",
        restricoes: ["prescrição médica"],
        facilidade_registro_generico: "Moderada",
        fonte: "ANVISA (inferido por similaridade com GLP-1 análogos)"
      },
      {
        pais: "United States",
        agencia: "FDA",
        classificacao: "RX Only",
        restricoes: ["prescrição obrigatória"],
        facilidade_registro_generico: "Alta",
        fonte: "FDA"
      }
    ],
    evidencia_cientifica_recente: [
      {
        titulo: "GLP-1 receptor agonists in diabetes and obesity",
        autores: ["Hansen M.", "Carlsson M."],
        ano: 2023,
        resumo: "Estudo clínico comparando eficácia de agonistas GLP-1 em pacientes com obesidade e resistência à insulina.",
        doi: "10.1056/NEJMoa2212534",
        fonte: "PubMed"
      }
    ],
    estrategias_de_formulacao: [
      "Formulação oral resistente ao pH gástrico",
      "Nanopartículas de liberação prolongada",
      "Suspensão subcutânea mensal",
      "Micelas autoagregadas com excipientes lipofílicos"
    ]
  };

  const sections = [
    { id: 'patentes', label: 'Patentes', icon: Shield },
    { id: 'quimica', label: 'Química', icon: Beaker },
    { id: 'ensaios', label: 'Ensaios Clínicos', icon: TestTube },
    { id: 'orange', label: 'Orange Book', icon: FileText },
    { id: 'regulacao', label: 'Regulação', icon: Building2 },
    { id: 'evidencia', label: 'Evidência Científica', icon: BookOpen },
    { id: 'formulacao', label: 'Estratégias de Formulação', icon: Pill }
  ];

  const renderPatentSection = () => {
    const patent = data.patentes[0];
    
    return (
      <div className="space-y-8">
        {/* Header com nome do produto */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <h2 className="text-3xl font-bold mb-2">Ozempic (Semaglutide)</h2>
          <p className="text-blue-100">Análise completa de propriedade intelectual e dados regulatórios</p>
        </div>

        {/* Status Geral da Patente */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="text-blue-600" size={24} />
            Status Geral da Patente
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <BooleanStatus value={patent.patente_vigente} label="Patente vigente" />
              <DateDisplay 
                date={patent.data_expiracao_patente_principal} 
                label="Expiração principal" 
              />
              <DateDisplay 
                date={patent.data_expiracao_patente_secundaria} 
                label="Expiração secundária" 
              />
            </div>
            
            <div className="space-y-4">
              <BooleanStatus value={patent.exploracao_comercial} label="Exploração comercial" />
              <DateDisplay 
                date={patent.data_vencimento_para_novo_produto} 
                label="Disponível para novo produto" 
              />
            </div>
          </div>
          
          <SourceBadge source={patent.fonte_estimativa} />
        </div>

        {/* Patentes por País */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Globe className="text-green-600" size={24} />
            Patentes por País
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">País</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Expiração Primária</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Expiração Secundária</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipos</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Fonte</th>
                </tr>
              </thead>
              <tbody>
                {patent.patentes_por_pais.map((country, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Flag 
                          code={getCountryCode(country.pais)} 
                          style={{ width: 24, height: 18 }}
                        />
                        <span className="font-medium">{country.pais}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {country.data_expiracao_primaria === 'Desconhecido' ? (
                        <UnknownValue>Desconhecido</UnknownValue>
                      ) : (
                        <span>{country.data_expiracao_primaria}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {country.data_expiracao_secundaria === 'Desconhecido' || country.data_expiracao_secundaria === 'Não encontrada após 5 buscas' ? (
                        <UnknownValue>Desconhecido</UnknownValue>
                      ) : (
                        <span>{country.data_expiracao_secundaria}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <ChipList items={country.tipos} emptyMessage="Desconhecidos" />
                    </td>
                    <td className="py-3 px-4">
                      <SourceBadge source={country.fonte} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exploração Comercial por País */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="text-purple-600" size={24} />
            Exploração Comercial por País
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patent.exploracao_comercial_por_pais.map((country, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Flag 
                    code={getCountryCode(country.pais)} 
                    style={{ width: 24, height: 18 }}
                  />
                  <span className="font-semibold">{country.pais}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-blue-600" />
                    <span className="text-sm text-gray-600">Disponível em:</span>
                    {country.data_disponivel === 'Desconhecido' ? (
                      <UnknownValue>Desconhecido</UnknownValue>
                    ) : (
                      <span className="text-sm font-medium">{country.data_disponivel}</span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Tipos liberados:</span>
                    <div className="mt-1">
                      <ChipList items={country.tipos_liberados} emptyMessage="Desconhecidos" />
                    </div>
                  </div>
                  
                  <SourceBadge source={country.fonte} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Riscos e Alternativas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="text-orange-600" size={20} />
              Riscos Regulatórios/Éticos
            </h3>
            <p className="text-gray-700 leading-relaxed">{patent.riscos_regulatorios_ou_eticos}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Microscope className="text-teal-600" size={20} />
              Compostos Análogos Alternativos
            </h3>
            <AlternativeCompounds 
              compounds={patent.alternativas_de_compostos_analogos}
              onCompoundClick={handleCompoundSearch}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderChemistrySection = () => {
    const chemistry = data.quimica;
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Beaker className="text-purple-600" size={24} />
          Dados Químicos - Semaglutide
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nome IUPAC</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                {chemistry.iupac_name === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <div className="font-mono text-sm break-words leading-relaxed">
                    {chemistry.iupac_name}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Fórmula Molecular</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                {chemistry.molecular_formula === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span className="font-mono text-lg">{chemistry.molecular_formula}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Peso Molecular</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                {chemistry.molecular_weight === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span className="font-mono">{chemistry.molecular_weight} g/mol</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">SMILES</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                {chemistry.smiles === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span className="font-mono text-xs break-all">{chemistry.smiles}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">InChI Key</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                {chemistry.inchi_key === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span className="font-mono text-xs break-all">{chemistry.inchi_key}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Área Polar Topológica</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                {chemistry.topological_polar_surface_area === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span className="font-mono">{chemistry.topological_polar_surface_area} Ų</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Aceptores de Ligação H</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                {chemistry.hydrogen_bond_acceptors === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span className="font-mono">{chemistry.hydrogen_bond_acceptors}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Doadores de Ligação H</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                {chemistry.hydrogen_bond_donors === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span className="font-mono">{chemistry.hydrogen_bond_donors}</span>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Ligações Rotacionáveis</label>
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border">
                {chemistry.rotatable_bonds === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span className="font-mono">{chemistry.rotatable_bonds}</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <SourceBadge source={chemistry.fonte} />
      </div>
    );
  };

  const renderClinicalTrialsSection = () => {
    const trials = data.ensaios_clinicos;
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TestTube className="text-green-600" size={24} />
          Ensaios Clínicos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Ensaios Ativos</label>
              <div className="mt-1 text-lg font-semibold">
                {trials.ativos === 'Desconhecido' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span>{trials.ativos}</span>
                )}
              </div>
            </div>
            
            <BooleanStatus value={trials.fase_avancada} label="Em fase avançada" />
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Países com Ensaios</label>
              <div className="mt-2">
                {trials.paises && trials.paises.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {trials.paises.map((pais, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Flag 
                          code={getCountryCode(pais)} 
                          style={{ width: 20, height: 15 }}
                        />
                        <span className="text-sm">{pais}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <UnknownValue>Nenhum país identificado</UnknownValue>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-600">Principais Indicações Estudadas</label>
          <div className="mt-2">
            {trials.principais_indicacoes_estudadas && trials.principais_indicacoes_estudadas.length > 0 ? (
              <ul className="space-y-1">
                {trials.principais_indicacoes_estudadas.map((indicacao, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{indicacao}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <UnknownValue>Nenhuma indicação identificada</UnknownValue>
            )}
          </div>
        </div>
        
        <SourceBadge source={trials.fonte} />
      </div>
    );
  };

  const renderOrangeBookSection = () => {
    const orange = data.orange_book;
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <FileText className="text-orange-600" size={24} />
          FDA Orange Book
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <BooleanStatus value={orange.tem_generico} label="Possui genérico aprovado" />
            
            <div>
              <label className="text-sm font-medium text-gray-600">Número NDA</label>
              <div className="mt-1 font-mono">
                {orange.nda_number === 'Desconhecido' || orange.nda_number === 'Não encontrado' ? (
                  <UnknownValue>Desconhecido</UnknownValue>
                ) : (
                  <span>{orange.nda_number}</span>
                )}
              </div>
            </div>
            
            <DateDisplay 
              date={orange.data_ultimo_generico} 
              label="Data do último genérico" 
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Genéricos Aprovados</label>
            <div className="mt-2">
              <ChipList items={orange.genericos_aprovados} emptyMessage="Nenhum genérico aprovado" />
            </div>
          </div>
        </div>
        
        <SourceBadge source={orange.fonte} />
      </div>
    );
  };

  const renderRegulationSection = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="text-red-600" size={24} />
          Regulação por País
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.regulacao_por_pais.map((regulation, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <Flag 
                  code={getCountryCode(regulation.pais)} 
                  style={{ width: 32, height: 24 }}
                />
                <div>
                  <h4 className="font-bold text-lg">{regulation.pais}</h4>
                  <p className="text-sm text-gray-600">{regulation.agencia}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Classificação</label>
                  <div className="mt-1">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      {regulation.classificacao}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Restrições</label>
                  <div className="mt-1">
                    <ChipList items={regulation.restricoes} emptyMessage="Nenhuma restrição" />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Facilidade Registro Genérico</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      regulation.facilidade_registro_generico === 'Alta' ? 'bg-green-100 text-green-800' :
                      regulation.facilidade_registro_generico === 'Moderada' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {regulation.facilidade_registro_generico}
                    </span>
                  </div>
                </div>
                
                <SourceBadge source={regulation.fonte} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderScientificEvidenceSection = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="text-indigo-600" size={24} />
          Evidência Científica Recente
        </h3>
        
        <div className="space-y-4">
          {data.evidencia_cientifica_recente.map((evidence, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-900">
                    {evidence.titulo === 'Desconhecido' ? (
                      <UnknownValue>Título não disponível</UnknownValue>
                    ) : (
                      evidence.titulo
                    )}
                  </h4>
                  
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>
                      {evidence.autores && evidence.autores.length > 0 ? (
                        evidence.autores.join(', ')
                      ) : (
                        <UnknownValue>Autores não disponíveis</UnknownValue>
                      )}
                    </span>
                    
                    <span>
                      {evidence.ano && evidence.ano > 0 ? (
                        `(${evidence.ano})`
                      ) : (
                        <UnknownValue>(Ano não disponível)</UnknownValue>
                      )}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Resumo</label>
                  <p className="mt-1 text-gray-700 leading-relaxed">
                    {evidence.resumo === 'Desconhecido' ? (
                      <UnknownValue>Resumo não disponível</UnknownValue>
                    ) : (
                      evidence.resumo
                    )}
                  </p>
                </div>
                
                {evidence.doi !== 'Desconhecido' && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-600">DOI:</label>
                    <a 
                      href={`https://doi.org/${evidence.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                    >
                      {evidence.doi}
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
                
                <SourceBadge source={evidence.fonte} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFormulationStrategiesSection = () => {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Pill className="text-teal-600" size={24} />
          Estratégias de Formulação
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.estrategias_de_formulacao.map((strategy, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl">💊</div>
              <span className="text-gray-800">{strategy}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'patentes':
        return renderPatentSection();
      case 'quimica':
        return renderChemistrySection();
      case 'ensaios':
        return renderClinicalTrialsSection();
      case 'orange':
        return renderOrangeBookSection();
      case 'regulacao':
        return renderRegulationSection();
      case 'evidencia':
        return renderScientificEvidenceSection();
      case 'formulacao':
        return renderFormulationStrategiesSection();
      default:
        return renderPatentSection();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Análise Farmacêutica</h2>
            
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{section.label}</span>
                    <ChevronRight 
                      size={16} 
                      className={`ml-auto transition-transform ${
                        activeSection === section.id ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmaceuticalDataViewer;