
import React, { useState, useRef } from 'react';
import Login from './Login';
import Register from './Register';
import Pricing from '../shared/Pricing';
import { PlanName } from '../../types';
import ForgotPassword from './ForgotPassword';
import { useAuth } from '../../hooks/useAuth';

const AuthPage: React.FC = () => {
  const [view, setView] = useState<'login' | 'register' | 'forgotPassword'>('login');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { restore } = useAuth();

  const handleSelectPlan = (plan: PlanName) => {
    alert(`Para ativar o plano ${plan}, primeiro crie sua conta ou faça login.`);
    setView('register');
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsRestoring(true);
    setRestoreError('');
    try {
        await restore(file);
        // The context handles the user state update and re-render
    } catch (err: any) {
        setRestoreError(err.message || 'Arquivo de backup inválido ou corrompido.');
    } finally {
        setIsRestoring(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Reset input
        }
    }
  };
  
  const renderForm = () => {
    switch(view) {
        case 'login':
            return <Login onForgotPassword={() => setView('forgotPassword')} />;
        case 'register':
            return <Register />;
        case 'forgotPassword':
            return <ForgotPassword onBackToLogin={() => setView('login')} />;
        default:
            return <Login onForgotPassword={() => setView('forgotPassword')} />;
    }
  }

  const renderToggleText = () => {
    if (view === 'login') {
        return (
            <>
                Não tem uma conta?{' '}
                <button onClick={() => setView('register')} className="font-semibold text-yellow-400 hover:text-yellow-300">
                    Cadastre-se
                </button>
            </>
        );
    }
     if (view === 'register') {
        return (
            <>
                Já tem uma conta?{' '}
                <button onClick={() => setView('login')} className="font-semibold text-yellow-400 hover:text-yellow-300">
                    Faça Login
                </button>
            </>
        );
    }
    // No toggle needed for forgotPassword, as it has its own back button
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 animation-fade-in" style={{ animationDelay: '0.1s' }}>
        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200">
          5399AI
        </h1>
        <p className="text-yellow-200 mt-2 text-lg">A Vanguarda da Inteligência Artificial</p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-8 animation-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="lg:col-span-2 bg-black bg-opacity-40 p-8 rounded-2xl border border-yellow-500/30 shadow-2xl shadow-red-500/20">
          {isRestoring && <p className="text-yellow-200 text-center mb-4">Restaurando sua conta...</p>}
          {restoreError && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-center">{restoreError}</p>}
          {renderForm()}
           <p className="mt-6 text-center text-sm text-yellow-200">
            {renderToggleText()}
          </p>
           <div className="mt-4 text-center text-sm text-yellow-200 border-t border-yellow-500/20 pt-4">
              <input type="file" ref={fileInputRef} onChange={handleRestore} className="hidden" accept=".json" />
              Tem um arquivo de backup?{' '}
              <button onClick={() => fileInputRef.current?.click()} disabled={isRestoring} className="font-semibold text-yellow-400 hover:text-yellow-300 disabled:opacity-50">
                  Restaurar Conta
              </button>
          </div>
        </div>
        <div className="lg:col-span-3">
            <Pricing onSelectPlan={handleSelectPlan} />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;