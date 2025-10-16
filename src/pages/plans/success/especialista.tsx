import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handlePlanSuccess } from '../../../utils/handlePlanSuccess';
import { auth } from '../../../firebase';

export default function EspecialistaSuccess() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const activatePlan = async () => {
      try {
        await handlePlanSuccess('especialista');
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        console.error('Error activating plan:', err);
        if (err instanceof Error && err.message === 'account_deleted') {
          navigate('/account-deleted', { 
            state: { email: auth.currentUser?.email } 
          });
          return;
        }
        setError(err instanceof Error ? err.message : 'Erro ao ativar plano');
      } finally {
        setLoading(false);
      }
    };

    activatePlan();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6 animate-fade-in">
        {loading ? (
          <>
            <div className="animate-spin mx-auto w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full" />
            <h2 className="text-2xl font-bold text-gray-900">Processando seu plano</h2>
            <p className="text-gray-600">
              Aguarde enquanto configuramos seu plano Especialista com 300 consultas mensais...
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-bold text-gray-900">🎉 Compra Concluída</h1>
            <p className="text-xl text-gray-700">
              Seu plano Especialista foi ativado com sucesso!
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800">
                <strong>300 consultas mensais</strong> foram adicionadas à sua conta.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}