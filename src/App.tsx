import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
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
import { hasUnrestrictedAccess } from './utils/unrestrictedEmails';
import SerpKeyAdmin from './components/admin/SerpKeyAdmin';

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

  const canAccessDashboard = (user: any): boolean => {
    if (!user) return false;
    
    if (hasUnrestrictedAccess(user.email)) {
      console.log(`✅ Acesso irrestrito concedido para: ${user.email}`);
      return true;
    }
    
    return user.emailVerified;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900">Carregando...</div>
      </div>
    );
  }

  return (
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
        <Route path="/profile" element={
          user && canAccessDashboard(user) ? (
            <UserManagement />
          ) : user && !canAccessDashboard(user) ? (
            <Navigate to="/verify-email" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/admin/serp-keys" element={
          user && canAccessDashboard(user) ? (
            <SerpKeyAdmin />
          ) : user && !canAccessDashboard(user) ? (
            <Navigate to="/verify-email" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path="/plans" element={
          user && hasUnrestrictedAccess(user.email) ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Plans />
          )
        } />
        <Route path="/dashboard" element={
          user ? (
            canAccessDashboard(user) ? (
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
            canAccessDashboard(user) ? (
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
  );
}

export default App;