import { useState, useMemo } from 'react';
import { Search, X, Calendar, Building2, FileText, AlertTriangle, MapPin } from 'lucide-react';

interface Patent {
  numero: string;
  numero_completo: string;
  pais: string;
  fonte: string;
  titulo: string;
  titulo_original: string;
  data_deposito: string;
  ano_deposito: string;
  applicant: string;
  ipc: string;
  tipo_patente: string;
  relevancia: string;
  abstract: string;
  comentario_ia: string | null;
  nivel_ameaca: string | null;
  tipo_barreira: string | null;
}

interface PatentsTableProps {
  patents: Patent[];
  titulares: string[];
}

const PatentsTable = ({ patents, titulares }: PatentsTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFonte, setSelectedFonte] = useState('all');
  const [selectedAmeaca, setSelectedAmeaca] = useState('all');
  const [selectedTitular, setSelectedTitular] = useState('all');
  const [selectedPatent, setSelectedPatent] = useState<Patent | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const filteredPatents = useMemo(() => {
    return patents.filter(patent => {
      const matchesSearch =
        searchTerm === '' ||
        patent.numero_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patent.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patent.titulo_original.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFonte = selectedFonte === 'all' || patent.fonte === selectedFonte;
      const matchesAmeaca = selectedAmeaca === 'all' || patent.nivel_ameaca?.toLowerCase() === selectedAmeaca.toLowerCase();
      const matchesTitular = selectedTitular === 'all' || patent.applicant === selectedTitular;

      return matchesSearch && matchesFonte && matchesAmeaca && matchesTitular;
    });
  }, [patents, searchTerm, selectedFonte, selectedAmeaca, selectedTitular]);

  const paginatedPatents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPatents.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPatents, currentPage]);

  const totalPages = Math.ceil(filteredPatents.length / itemsPerPage);

  const getThreatBadgeClass = (nivel: string | null) => {
    if (!nivel) return 'bg-gray-100 text-gray-600';
    switch (nivel.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'média':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case 'baixa':
        return 'bg-green-100 text-green-700 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getFonteBadgeClass = (fonte: string) => {
    return fonte === 'INPI'
      ? 'bg-blue-100 text-blue-700 border border-blue-200'
      : 'bg-green-100 text-green-700 border border-green-200';
  };

  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Tabela de Patentes ({filteredPatents.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por número ou título..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedFonte}
          onChange={(e) => {
            setSelectedFonte(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as fontes</option>
          <option value="INPI">INPI</option>
          <option value="EPO">EPO</option>
        </select>

        <select
          value={selectedAmeaca}
          onChange={(e) => {
            setSelectedAmeaca(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todas as ameaças</option>
          <option value="alta">Alta</option>
          <option value="média">Média</option>
          <option value="baixa">Baixa</option>
        </select>

        <select
          value={selectedTitular}
          onChange={(e) => {
            setSelectedTitular(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos os titulares</option>
          {titulares.map((titular, idx) => (
            <option key={idx} value={titular}>{truncate(titular, 40)}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Fonte
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Número
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Título
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Titular
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ano
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ameaça
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tipo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedPatents.map((patent, idx) => (
              <tr
                key={idx}
                onClick={() => setSelectedPatent(patent)}
                className="hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getFonteBadgeClass(patent.fonte)}`}>
                    {patent.fonte === 'INPI' ? 'BR' : patent.pais}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-xs text-gray-900">{patent.numero_completo}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-900" title={patent.titulo}>
                    {truncate(patent.titulo, 60)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-gray-700" title={patent.applicant}>
                    {truncate(patent.applicant, 30)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  <span className="text-sm font-bold text-gray-900">{patent.ano_deposito}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {patent.nivel_ameaca ? (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getThreatBadgeClass(patent.nivel_ameaca)}`}>
                      {patent.nivel_ameaca}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-center">
                  {patent.tipo_barreira ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                      {truncate(patent.tipo_barreira, 15)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">N/A</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredPatents.length)} de {filteredPatents.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm font-medium text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        </div>
      )}

      {selectedPatent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="text-white" size={24} />
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedPatent.numero_completo}</h2>
                  <div className="flex gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${getFonteBadgeClass(selectedPatent.fonte)}`}>
                      {selectedPatent.fonte}
                    </span>
                    {selectedPatent.nivel_ameaca && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${getThreatBadgeClass(selectedPatent.nivel_ameaca)}`}>
                        {selectedPatent.nivel_ameaca}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPatent(null)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Título Original</h3>
                    <p className="text-base text-gray-900 leading-relaxed">{selectedPatent.titulo_original}</p>
                  </div>

                  {selectedPatent.abstract && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Resumo (Abstract)</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedPatent.abstract}</p>
                    </div>
                  )}

                  {selectedPatent.comentario_ia && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💡</span>
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider">Análise de IA</h3>
                      </div>
                      <p className="text-sm text-blue-800 leading-relaxed">{selectedPatent.comentario_ia}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Informações Técnicas</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 size={14} className="text-gray-600" />
                          <span className="text-xs font-semibold text-gray-600">Titular</span>
                        </div>
                        <p className="text-sm text-gray-900">{selectedPatent.applicant}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={14} className="text-gray-600" />
                          <span className="text-xs font-semibold text-gray-600">Data Depósito</span>
                        </div>
                        <p className="text-sm text-gray-900">{selectedPatent.data_deposito}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin size={14} className="text-gray-600" />
                          <span className="text-xs font-semibold text-gray-600">País</span>
                        </div>
                        <p className="text-sm text-gray-900">{selectedPatent.pais}</p>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-gray-600 block mb-1">IPC</span>
                        <p className="text-sm font-mono text-gray-900">{selectedPatent.ipc}</p>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-gray-600 block mb-1">Tipo Patente</span>
                        <p className="text-sm text-gray-900">{selectedPatent.tipo_patente}</p>
                      </div>

                      <div>
                        <span className="text-xs font-semibold text-gray-600 block mb-1">Relevância</span>
                        <p className="text-sm text-gray-900 capitalize">{selectedPatent.relevancia}</p>
                      </div>
                    </div>
                  </div>

                  {(selectedPatent.nivel_ameaca || selectedPatent.tipo_barreira) && (
                    <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={16} className="text-yellow-700" />
                        <h3 className="text-sm font-bold text-yellow-900 uppercase tracking-wider">Análise Estratégica</h3>
                      </div>
                      <div className="space-y-3">
                        {selectedPatent.nivel_ameaca && (
                          <div>
                            <span className="text-xs font-semibold text-gray-600 block mb-1">Nível Ameaça</span>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${getThreatBadgeClass(selectedPatent.nivel_ameaca)}`}>
                              {selectedPatent.nivel_ameaca}
                            </span>
                          </div>
                        )}

                        {selectedPatent.tipo_barreira && (
                          <div>
                            <span className="text-xs font-semibold text-gray-600 block mb-1">Tipo Barreira</span>
                            <p className="text-sm text-gray-900">{selectedPatent.tipo_barreira}</p>
                          </div>
                        )}

                        <div>
                          <span className="text-xs font-semibold text-gray-600 block mb-1">Fonte</span>
                          <p className="text-sm text-gray-900">{selectedPatent.fonte}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatentsTable;
