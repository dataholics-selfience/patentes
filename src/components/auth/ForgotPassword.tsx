import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { FlaskConical } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check if user account was deleted
      const q = query(
        collection(db, 'deletedUsers'),
        where('email', '==', email.toLowerCase().trim())
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setError('Esta conta foi excluída conforme os termos da LGPD, GDPR e padrões internacionais de proteção de dados dos usuários.');
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage('Email de recuperação enviado. Verifique sua caixa de entrada.');
      setError('');
    } catch (error: any) {
      setError('Erro ao enviar email de recuperação. Verifique o endereço informado.');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <FlaskConical size={48} className="text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Consulta de Patentes</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Recuperar Senha</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-600 text-center bg-red-50 p-3 rounded-md border border-red-200">{error}</div>}
          {message && <div className="text-green-600 text-center bg-green-50 p-3 rounded-md border border-green-200">{message}</div>}
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Email"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Enviar email de recuperação
            </button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-600 hover:text-blue-700">
              Voltar para o login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;