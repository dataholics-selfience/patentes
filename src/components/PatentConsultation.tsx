import React, { useState, useEffect } from 'react';
import { Search, Loader2, XCircle, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PatentConsultationProps {
  // Add any props you need here
}

const PatentConsultation: React.FC<PatentConsultationProps> = () => {
  const [produto, setProduto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountExpired, setIsAccountExpired] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!produto.trim() || isLoading || isAccountExpired) return;
    
    setIsLoading(true);
    // Add your submission logic here
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Consulta de Patentes
        </h1>

        {isAccountExpired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="text-red-500 mr-2" size={20} />
                <span className="text-red-700 font-medium">
                  Sua conta expirou. Faça upgrade para continuar usando o serviço.
                </span>
              </div>
              <Link
                to="/plans"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                <CreditCard size={20} className="mr-2" />
                Ver Planos
              </Link>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                placeholder="Ex: Minoxidil, Paracetamol, Ibuprofeno..."
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${
                  isAccountExpired 
                    ? 'border-red-300 bg-red-50 text-red-500 placeholder-red-400 cursor-not-allowed'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                disabled={isLoading || isAccountExpired}
              />
            </div>
            <button
              type="submit"
              disabled={!produto.trim() || isLoading || isAccountExpired}
              className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                isAccountExpired
                  ? 'bg-red-400 text-white cursor-not-allowed opacity-50'
                  : !produto.trim() || isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Analisando...
                </>
              ) : isAccountExpired ? (
                <>
                  <XCircle size={20} />
                  Expirado
                </>
              ) : (
                <>
                  <Search size={20} />
                  Analisar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatentConsultation;