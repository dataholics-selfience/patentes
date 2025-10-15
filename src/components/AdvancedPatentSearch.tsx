import { useState } from 'react';
import { Search, TestTube, Pill, Loader2 } from 'lucide-react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { TokenUsageType } from '../types';

interface AdvancedPatentSearchProps {
  checkTokenUsage: () => boolean;
  tokenUsage: TokenUsageType | null;
  onResultReceived: (data: any) => void;
}

const AdvancedPatentSearch = ({ checkTokenUsage, tokenUsage, onResultReceived }: AdvancedPatentSearchProps) => {
  const [searchData, setSearchData] = useState({
    nome_comercial: '',
    nome_molecula: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setSearchData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!searchData.nome_comercial.trim()) {
      setError('Por favor, informe o nome comercial do produto.');
      return false;
    }
    if (!searchData.nome_molecula.trim()) {
      setError('Por favor, informe o nome da molécula.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setError('Usuário não autenticado');
      return;
    }

    if (!validateForm()) {
      return;
    }

    if (!checkTokenUsage()) {
      setError('Você não possui tokens suficientes para realizar esta consulta.');
      return;
    }

    setIsLoading(true);
    setError('');

    const startTime = Date.now();
    try {
      const webhookData = {
        nome_comercial: searchData.nome_comercial.trim(),
        nome_molecula: searchData.nome_molecula.trim()
      };

      console.log('🚀 Enviando busca avançada de patentes:', webhookData);

      const webhookUrl = 'https://primary-production-2e3b.up.railway.app/webhook/analise-patentes';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Erro no webhook: ${response.status} ${response.statusText}`);
      }

      const webhookResponse = await response.json();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log('✅ Resposta da busca avançada recebida:', webhookResponse);

      const consultaCompleta = {
        userId: auth.currentUser.uid,
        userEmail: auth.currentUser.email || '',
        tipo: 'busca_avancada_patentes',
        nome_comercial: searchData.nome_comercial.trim(),
        nome_molecula: searchData.nome_molecula.trim(),
        resultado: webhookResponse,
        consultedAt: new Date().toISOString(),
        webhookResponseTime: responseTime
      };

      await addDoc(collection(db, 'consultas'), consultaCompleta);

      if (tokenUsage) {
        await updateDoc(doc(db, 'tokenUsage', auth.currentUser.uid), {
          usedTokens: tokenUsage.usedTokens + 1
        });
      }

      onResultReceived(webhookResponse);

    } catch (error) {
      console.error('❌ Erro na busca avançada de patentes:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido na consulta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Busca Avançada de Patentes</h2>
          <p className="text-gray-600">Realize uma análise completa de patentes relacionadas ao seu produto</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Pill size={16} className="inline mr-2 text-blue-600" />
                Nome Comercial *
              </label>
              <input
                type="text"
                value={searchData.nome_comercial}
                onChange={(e) => handleInputChange('nome_comercial', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Verzenios"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <TestTube size={16} className="inline mr-2 text-purple-600" />
                Nome da Molécula *
              </label>
              <input
                type="text"
                value={searchData.nome_molecula}
                onChange={(e) => handleInputChange('nome_molecula', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Abemaciclib"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tempo estimado:</strong> A análise completa leva aproximadamente 5 minutos.
              Você receberá um relatório detalhado com análise de patentes, níveis de ameaça e barreiras de entrada.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !searchData.nome_comercial.trim() || !searchData.nome_molecula.trim()}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Analisando Patentes...
              </>
            ) : (
              <>
                <Search size={20} />
                Iniciar Busca Avançada
              </>
            )}
          </button>
        </form>

        {tokenUsage && (
          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Consultas restantes: <strong>{tokenUsage.totalTokens - tokenUsage.usedTokens}</strong> de {tokenUsage.totalTokens}
              </span>
              <span className="text-gray-600">
                Plano: <strong>{tokenUsage.plan}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedPatentSearch;
