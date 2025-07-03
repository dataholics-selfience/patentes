import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { LanguageProvider } from './utils/i18n';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import EmailVerification from './components/auth/EmailVerification';
import AccountDeleted from './components/AccountDeleted';
import Plans from './components/Plans';
import UserManagement from './components/UserProfile/UserManagement';
import LandingPage from './components/LandingPage';
import Terms from './components/Terms';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().disabled) {
            await signOut(auth);
            setUser(null);
          } else {
            setUser(user);
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900">Carregando...</div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/home" element={<LandingPage />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Auth routes */}
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" replace />} />
          <Route path="/forgot-password" element={!user ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          <Route path="/account-deleted" element={<AccountDeleted />} />
          
          {/* Protected routes */}
          <Route path="/profile" element={user?.emailVerified ? <UserManagement /> : <Navigate to="/verify-email" replace />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/dashboard" element={
            user ? (
              user.emailVerified ? (
                <Layout />
              ) : (
                <Navigate to="/verify-email" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          {/* Default routes */}
          <Route path="/" element={
            user ? (
              user.emailVerified ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/verify-email" replace />
              )
            ) : (
              <LandingPage />
            )
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;