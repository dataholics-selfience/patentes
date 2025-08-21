import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTranslation } from '../utils/i18n';

interface TokenUsageChartProps {
  totalTokens: number;
  usedTokens: number;
  autoRenewal?: boolean;
  renewalDate?: string;
}

const TokenUsageChart = ({ totalTokens, usedTokens, autoRenewal, renewalDate }: TokenUsageChartProps) => {
  const { t } = useTranslation();
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const [nextRenewal, setNextRenewal] = useState<Date | null>(null);
  const percentage = Math.min((usedTokens / totalTokens) * 100, 100);
  const remainingTokens = totalTokens - usedTokens;

  useEffect(() => {
    const fetchPurchaseDate = async () => {
      if (!auth.currentUser) return;
      
      try {
        const tokenDoc = await getDoc(doc(db, 'tokenUsage', auth.currentUser.uid));
        if (tokenDoc.exists() && tokenDoc.data().purchasedAt) {
          setPurchaseDate(new Date(tokenDoc.data().purchasedAt));
        }
        if (tokenDoc.exists() && tokenDoc.data().renewalDate) {
          setNextRenewal(new Date(tokenDoc.data().renewalDate));
        }
      } catch (error) {
        console.error('Error fetching purchase date:', error);
      }
    };

    fetchPurchaseDate();
  }, []);

  const getFormattedPurchaseDate = () => {
    if (!purchaseDate) return null;
    return format(purchaseDate, "dd 'de' MMMM", { locale: ptBR });
  };

  const formattedPurchaseDate = getFormattedPurchaseDate();
  
  const getFormattedRenewalDate = () => {
    if (!nextRenewal) return null;
    return format(nextRenewal, "dd 'de' MMMM", { locale: ptBR });
  };

  const formattedRenewalDate = getFormattedRenewalDate();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-700 font-medium">Consultas Mensais</span>
        <span className="text-sm text-blue-600 font-semibold">{remainingTokens} restantes</span>
      </div>
      
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${100 - percentage}%` }}
        />
      </div>

      {formattedPurchaseDate && (
        <div className="mt-2 text-xs text-gray-600">
          {autoRenewal ? 'Renovação mensal desde' : 'Adquirido em'} {formattedPurchaseDate}
        </div>
      )}
      
      {autoRenewal && formattedRenewalDate && (
        <div className="mt-1 text-xs text-green-600 font-medium">
          Próxima renovação: {formattedRenewalDate}
        </div>
      )}

      {remainingTokens <= 5 && (
        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
          {autoRenewal ? '⚠️ Poucas consultas restantes (renovação automática)' : '⚠️ Poucas consultas restantes'}
        </div>
      )}

      {remainingTokens === 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          {autoRenewal ? '🚫 Consultas esgotadas (renovação automática em breve)' : '🚫 Consultas esgotadas'}
        </div>
      )}

      <Link 
        to="/plans" 
        className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
      >
        {remainingTokens === 0 ? 'Adquirir plano para consultar' : 'Ver outros planos'}
      </Link>
    </div>
  );
};

export default TokenUsageChart;