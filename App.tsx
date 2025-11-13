
import React from 'react';
import { useAuth } from './hooks/useAuth';
import AuthPage from './components/auth/AuthPage';
import Dashboard from './components/dashboard/Dashboard';

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen animated-gradient text-yellow-50">
      {user ? <Dashboard /> : <AuthPage />}
    </div>
  );
};

export default App;