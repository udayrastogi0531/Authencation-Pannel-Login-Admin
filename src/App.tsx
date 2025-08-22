import React from 'react';
import { AuthProvider } from './contexts/FirebaseAuthContext';
import { useAuth } from './hooks/useAuth';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;