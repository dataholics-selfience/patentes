import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserType, TokenUsageType } from '../types';

interface UserProfileProps {
  hideText?: boolean;
}

const UserProfile = ({ hideText = false }: UserProfileProps) => {
  const [userData, setUserData] = useState<UserType | null>(null);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageType | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserType);
        }

        const tokenDoc = await getDoc(doc(db, 'tokenUsage', auth.currentUser.uid));
        if (tokenDoc.exists()) {
          setTokenUsage(tokenDoc.data() as TokenUsageType);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  if (!userData) return null;

  const initials = userData.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const firstName = userData.name.split(' ')[0];

  return (
    <div className="flex items-center space-x-3">
      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
        {initials}
      </div>
      {!hideText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{firstName}</span>
            {!userData.unrestrictedAccess && (
              <span className="text-xs text-gray-600">({userData.plan || 'Pesquisador'})</span>
            )}
            {userData.unrestrictedAccess && (
              <span className="text-xs text-green-600 font-medium">(Acesso Corporativo)</span>
            )}
          </div>
          {tokenUsage && (
            <div className="text-xs">
              <span className="text-blue-600">{tokenUsage.totalTokens - tokenUsage.usedTokens}</span>
              <span className="text-gray-600">
                {tokenUsage.totalTokens > 0 
                  ? ` de ${tokenUsage.totalTokens} consultas${tokenUsage.autoRenewal ? ' (mensal)' : ''}` 
                  : ' - Sem plano ativo'
                }
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;