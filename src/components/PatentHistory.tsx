import { useState } from 'react';
import { History, X, Calendar, Search, CheckCircle, XCircle, Eye, Trash2 } from 'lucide-react';
import { PatentConsultationType } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface PatentHistoryProps {
  consultations: PatentConsultationType[];
  onClose: () => void;
  onConsultationDeleted: (id: string) => void;
}

const PatentHistory = ({ consultations, onClose, onConsultationDeleted }: PatentHistoryProps) => {
  const [selectedConsultation, setSelectedConsultation] = useState<PatentConsultationType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const handleDeleteConsultation = async (consultationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (deletingId) return;
    
    setDeletingId(consultationId);
    
    try {
      await deleteDoc(doc(db, 'patentConsultations', consultationId));
      onConsultationDeleted(consultationId);
      
      // If the deleted consultation was selected, clear selection
      if (selectedConsultation?.id === consultationId) {
        setSelectedConsultation(null);
      }
    } catch (error) {
      console.error('Error deleting consultation:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (selectedConsultation) {
    const result = selectedConsultation.resultado;
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-fit">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Detalhes da Consulta</h3>
            <button
              onClick={() => setSelectedConsultation(null)}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          <div>
            <span className="text-sm text-gray-600">Produto consultado:</span>
            <p className="font-semibold text-gray-900">{selectedConsultation.produto}</p>
          </div>
          
          <div>
            <span className="text-sm text-gray-600">Data da consulta:</span>
            <p className="font-semibold text-gray-900">{formatDate(selectedConsultation.consultedAt)}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {result.patente_vigente ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <XCircle size={16} className="text-red-600" />
              )}
              <span className="text-sm">
                Patente {result.patente_vigente ? 'vigente' : 'expirada'}
              </span>
            </div>
            
            <div>
              <span className="text-xs text-gray-600">Expiração:</span>
              <p className="text-sm font-medium">{result.data_expiracao_patente_principal}</p>
            </div>
            
            <div>
              <span className="text-xs text-gray-600">Países registrados:</span>
              <p className="text-sm">{result.paises_registrados.length} países</p>
              {result.paises_registrados.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {result.paises_registrados.map((pais, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {pais}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Exploração comercial:</span>
              <span className={`text-xs font-medium ${result.exploracao_comercial ? 'text-green-600' : 'text-red-600'}`}>
                {result.exploracao_comercial ? 'Permitida' : 'Restrita'}
              </span>
            </div>

            {result.riscos_regulatorios_eticos && result.riscos_regulatorios_eticos.length > 0 && (
              <div>
                <span className="text-xs text-gray-600">Riscos regulatórios:</span>
                <ul className="mt-1 space-y-1">
                  {result.riscos_regulatorios_eticos.map((risco, index) => (
                    <li key={index} className="text-xs text-gray-700 flex items-start gap-1">
                      <span className="text-red-500">•</span>
                      {risco}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.alternativas_compostos && result.alternativas_compostos.length > 0 && (
              <div>
                <span className="text-xs text-gray-600">Alternativas de compostos:</span>
                <ul className="mt-1 space-y-1">
                  {result.alternativas_compostos.map((alternativa, index) => (
                    <li key={index} className="text-xs text-gray-700 flex items-start gap-1">
                      <span className="text-blue-500">•</span>
                      {alternativa}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.data_vencimento_patente_novo_produto && (
              <div>
                <span className="text-xs text-gray-600">Vencimento para novo produto:</span>
                <p className="text-sm font-medium text-orange-600">
                  {result.data_vencimento_patente_novo_produto}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-fit">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={20} className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Histórico de Consultas</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {consultations.length === 0 ? (
          <div className="text-center py-8">
            <Search size={48} className="text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma consulta realizada ainda</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {consultations.map((consultation) => (
              <div
                key={consultation.id}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setSelectedConsultation(consultation)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900 truncate">
                        {consultation.produto}
                      </span>
                      <div className="flex items-center gap-2">
                        {consultation.resultado.patente_vigente ? (
                          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-red-600 flex-shrink-0" />
                        )}
                        <Eye size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={(e) => handleDeleteConsultation(consultation.id, e)}
                    disabled={deletingId === consultation.id}
                    className={`ml-2 p-1 rounded hover:bg-red-100 transition-colors ${
                      deletingId === consultation.id 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-red-500 hover:text-red-700'
                    }`}
                    title="Excluir consulta"
                  >
                    {deletingId === consultation.id ? (
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar size={12} />
                  {formatDate(consultation.consultedAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentHistory;