import { useState } from 'react';
import { FileText, Shield, AlertTriangle, Building, TrendingUp, Users } from 'lucide-react';
import { dashboardData } from '../data/dashboardData';

export default function PatentDashboard() {
  const [filtroFonte, setFiltroFonte] = useState('');
  const [filtroAmeaca, setFiltroAmeaca] = useState('');
  const [modalPatente, setModalPatente] = useState<any>(null);

  const patentes = dashboardData.patentesAnalisadas;

  const patentesFiltradas = patentes.filter(p => {
    if (filtroFonte && p.fonte !== filtroFonte) return false;
    if (filtroAmeaca && p.nivel_ameaca !== filtroAmeaca) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Dashboard de Patentes - {dashboardData.meta.nome_comercial}
        </h1>
        <p className="text-gray-600">
          {dashboardData.meta.molecula} | {dashboardData.meta.classe_terapeutica}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {dashboardData.estatisticas.total_patentes}
              </p>
              <p className="text-gray-600 font-medium mb-1">Total de Patentes</p>
              <p className="text-sm text-gray-500">
                INPI: {dashboardData.estatisticas.por_fonte.INPI} |
                EPO: {dashboardData.estatisticas.por_fonte.EPO}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-4xl font-bold text-green-600 mb-2">
                {dashboardData.metricas_chave.anos_protecao_restantes}
              </p>
              <p className="text-gray-600 font-medium mb-1">Anos de Proteção</p>
              <p className="text-sm text-gray-500">Proteção média estimada</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-4xl font-bold text-red-600 mb-2">
                {dashboardData.metricas_chave.patentes_alta_ameaca}
              </p>
              <p className="text-gray-600 font-medium mb-1">Alta Ameaça</p>
              <p className="text-sm text-gray-500">Patentes críticas</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600 mb-2 truncate">
                {dashboardData.estatisticas.top_titulares[0].titular}
              </p>
              <p className="text-gray-600 font-medium mb-1">Titular Dominante</p>
              <p className="text-sm text-gray-500">
                {dashboardData.metricas_chave.concentracao_titular}% do portfólio
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Building className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Relatório Executivo
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Panorama Geral</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {dashboardData.relatorio_executivo.panorama_geral}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Titular Dominante</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {dashboardData.relatorio_executivo.titular_dominante}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Barreiras Críticas</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {dashboardData.relatorio_executivo.barreiras_criticas}
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Janelas de Oportunidade</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {dashboardData.relatorio_executivo.janelas_oportunidade}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Recomendações</h3>
          <ul className="space-y-2">
            {dashboardData.relatorio_executivo.recomendacoes.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-4 flex-wrap">
          <select
            value={filtroFonte}
            onChange={(e) => setFiltroFonte(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as Fontes</option>
            <option value="INPI">INPI</option>
            <option value="EPO">EPO</option>
          </select>

          <select
            value={filtroAmeaca}
            onChange={(e) => setFiltroAmeaca(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os Níveis</option>
            <option value="Alta">Alta Ameaça</option>
            <option value="Média">Média Ameaça</option>
            <option value="Baixa">Baixa Ameaça</option>
          </select>

          <button
            onClick={() => {
              setFiltroFonte('');
              setFiltroAmeaca('');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Limpar Filtros
          </button>

          <span className="ml-auto flex items-center text-gray-600">
            <Users className="w-5 h-5 mr-2" />
            {patentesFiltradas.length} patentes
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Fonte
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Titular
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ano
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Ameaça
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tipo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patentesFiltradas.map((patente) => (
                <tr
                  key={patente.numero_completo}
                  onClick={() => setModalPatente(patente)}
                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      patente.fonte === 'INPI'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {patente.fonte === 'INPI' ? 'BR' : patente.pais}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {patente.numero_completo}
                    </code>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 line-clamp-2 max-w-md">
                      {patente.titulo}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 truncate max-w-xs">
                      {patente.applicant || 'Não informado'}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="text-sm font-semibold text-gray-900">
                      {patente.ano_deposito}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    {patente.nivel_ameaca ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        patente.nivel_ameaca === 'Alta'
                          ? 'bg-red-100 text-red-800'
                          : patente.nivel_ameaca === 'Média'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {patente.nivel_ameaca}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">N/A</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {patente.tipo_barreira}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalPatente && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalhes da Patente
                </h2>
                <button
                  onClick={() => setModalPatente(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Número</label>
                  <p className="text-lg font-mono bg-gray-100 p-2 rounded">
                    {modalPatente.numero_completo}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Título</label>
                  <p className="text-gray-900">{modalPatente.titulo}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-600">País</label>
                    <p className="text-gray-900">{modalPatente.pais}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Ano</label>
                    <p className="text-gray-900">{modalPatente.ano_deposito}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">Titular</label>
                  <p className="text-gray-900">{modalPatente.applicant || 'Não informado'}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-600">IPC</label>
                  <p className="text-gray-900 font-mono">{modalPatente.ipc}</p>
                </div>

                {modalPatente.comentario_ia && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <label className="text-sm font-semibold text-blue-900 mb-2 block">
                      Análise IA
                    </label>
                    <p className="text-sm text-blue-900">{modalPatente.comentario_ia}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-600">Nível de Ameaça</label>
                    <p className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                      modalPatente.nivel_ameaca === 'Alta'
                        ? 'bg-red-100 text-red-800'
                        : modalPatente.nivel_ameaca === 'Média'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {modalPatente.nivel_ameaca || 'N/A'}
                    </p>
                  </div>

                  <div className="flex-1">
                    <label className="text-sm font-semibold text-gray-600">Tipo de Barreira</label>
                    <p className="text-gray-900">{modalPatente.tipo_barreira}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
