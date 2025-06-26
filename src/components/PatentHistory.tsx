import { useState } from 'react';
import { History, X, Calendar, Search, CheckCircle, XCircle } from 'lucide-react';
import { PatentConsultationType } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PatentHistoryProps {
  consultations: PatentConsultationType[];
  onClose: () => void;
}

const PatentHistory = ({ consultations, onClose }: PatentHistoryProps) => {
  const [selectedConsultation, setSelectedConsultation] = useState<PatentConsultationType | null>(null);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
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
        
        <div className="p-4 space-y-4">
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
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Exploração comercial:</span>
              <span className={`text-xs font-medium ${result.exploracao_comercial ? 'text-green-600' : 'text-red-600'}`}>
                {result.exploracao_comercial ? 'Permitida' : 'Restrita'}
              </span>
            </div>
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
              <button
                key={consultation.id}
                onClick={() => setSelectedConsultation(consultation)}
                className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 truncate">
                    {consultation.produto}
                  </span>
                  {consultation.resultado.patente_vigente ? (
                    <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-red-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Calendar size={12} />
                  {formatDate(consultation.consultedAt)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatentHistory;