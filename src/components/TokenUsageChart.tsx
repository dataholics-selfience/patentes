import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { format } from 'date-fns';
import { ptBR, enUS, fr, de, it } from 'date-fns/locale';
import { useTranslation } from '../utils/i18n';

interface TokenUsageChartProps {
  totalTokens: number;
  usedTokens: number;
}

const TokenUsageChart = ({ totalTokens, usedTokens }: TokenUsageChartProps) => {
  const { t, language } = useTranslation();
  const [purchaseDate, setPurchaseDate] = useState<Date | null>(null);
  const percentage = Math.min((usedTokens / totalTokens) * 100, 100);
  const remainingTokens = totalTokens - usedTokens;

  const getLocale = () => {
    switch (language) {
      case 'pt': return ptBR;
      case 'fr': return fr;
      case 'de': return de;
      case 'it': return it;
      default: return enUS;
    }
  };

  useEffect(() => {
    const fetchPurchaseDate = async () => {
      if (!auth.currentUser) return;
      
      try {
        const tokenDoc = await getDoc(doc(db, 'tokenUsage', auth.currentUser.uid));
        if (tokenDoc.exists() && tokenDoc.data().purchasedAt) {
          setPurchaseDate(new Date(tokenDoc.data().purchasedAt));
        }
      } catch (error) {
        console.error('Error fetching purchase date:', error);
      }
    };

    fetchPurchaseDate();
  }, []);

  const getFormattedPurchaseDate = () => {
    if (!purchaseDate) return null;
    
    switch (language) {
      case 'pt':
        return format(purchaseDate, "dd 'de' MMMM", { locale: ptBR });
      case 'fr':
        return format(purchaseDate, "dd MMMM", { locale: fr });
      case 'de':
        return format(purchaseDate, "dd. MMMM", { locale: de });
      case 'it':
        return format(purchaseDate, "dd MMMM", { locale: it });
      default:
        return format(purchaseDate, "MMMM dd", { locale: enUS });
    }
  };

  const formattedPurchaseDate = getFormattedPurchaseDate();

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
          Adquirido em {formattedPurchaseDate}
        </div>
      )}

      {remainingTokens <= 5 && (
        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-700">
          ⚠️ Poucas consultas restantes
        </div>
      )}

      {remainingTokens === 0 && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          🚫 Consultas esgotadas
        </div>
      )}

      <Link 
        to="/plans" 
        className="mt-3 block text-center text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
      >
        {remainingTokens === 0 ? 'Adquirir novo plano' : 'Ver outros planos'}
      </Link>
    </div>
  );
};

export default TokenUsageChart;