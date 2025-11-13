
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { PlanName } from '../../types';
import Button from './Button';
import * as authService from '../../services/authService';

const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const BackupIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


const Header: React.FC = () => {
  const { user, logout, startPremiumTrial, premiumTrialActive, premiumTrialExpiry } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (premiumTrialActive && premiumTrialExpiry) {
        const interval = setInterval(() => {
            const now = Date.now();
            const distance = premiumTrialExpiry - now;
            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft('Expirado');
                window.location.reload();
            } else {
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}m ${seconds}s restantes`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [premiumTrialActive, premiumTrialExpiry]);

  const handleBackup = () => {
    if (!user) return;
    const backupData = authService.backupAccount(user.id);
    if (!backupData) {
        alert('Ocorreu um erro ao criar o backup. Tente novamente.');
        return;
    }

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `5399ai_backup_${user.email}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Arquivo de backup baixado! Guarde-o em um local seguro.');
  };

  return (
    <header className="bg-black bg-opacity-30 border-b border-yellow-500/20 px-4 sm:px-6 py-4 flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold text-yellow-300">Painel 5399AI</h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        {premiumTrialActive ? (
            <div className="text-center bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 px-3 py-1 rounded-lg shadow-lg">
                <p className="font-bold text-sm">PREMIUM Trial</p>
                <p className="text-xs font-mono">{timeLeft}</p>
            </div>
        ) : (
            user && user.plan !== PlanName.PREMIUM && (
                <Button onClick={startPremiumTrial} className="px-3 py-1.5 text-xs sm:text-sm">
                    Ativar Teste PREMIUM
                </Button>
            )
        )}
        <div className="text-right">
            <p className="text-sm text-yellow-100">{user?.email}</p>
            <span className="text-xs font-bold bg-yellow-500 text-gray-900 px-2 py-0.5 rounded-full">{user?.plan}</span>
        </div>
        <button onClick={handleBackup} className="p-2 rounded-full text-yellow-300 hover:bg-red-800 hover:text-white transition-colors duration-200" title="Backup da Conta">
          <BackupIcon />
        </button>
        <button onClick={logout} className="p-2 rounded-full text-yellow-300 hover:bg-red-800 hover:text-white transition-colors duration-200" title="Sair">
          <LogoutIcon />
        </button>
      </div>
    </header>
  );
};

export default Header;