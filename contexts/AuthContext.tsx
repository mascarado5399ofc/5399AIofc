
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, PlanName, PremiumTrial, BackupData } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (email: string, pass: string) => Promise<User>;
  logout: () => void;
  upgradePlan: (plan: PlanName) => void;
  recoverPassword: (email: string) => Promise<string>;
  restore: (backupFile: File) => Promise<User>;
  startPremiumTrial: () => void;
  premiumTrialActive: boolean;
  premiumTrialExpiry: number | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [premiumTrialExpiry, setPremiumTrialExpiry] = useState<number | null>(null);

  useEffect(() => {
    const checkUserStatus = () => {
      let loggedInUser = authService.getCurrentUser();
      if (loggedInUser) {
        const trial = authService.getPremiumTrial();
        if (trial) {
          if (Date.now() > trial.expiry) {
            // Trial expired
            loggedInUser = authService.updateUserPlan(loggedInUser.id, trial.originalPlan) ?? loggedInUser;
            authService.clearPremiumTrial();
            setPremiumTrialExpiry(null);
          } else {
            // Trial active
            loggedInUser.plan = PlanName.PREMIUM;
            setPremiumTrialExpiry(trial.expiry);
          }
        }
        setUser(loggedInUser);
      }
      setLoading(false);
    };
    checkUserStatus();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const loggedInUser = await authService.login(email, pass);
    setUser(loggedInUser);
    // On login, re-check trial status
    window.location.reload();
    return loggedInUser;
  };

  const register = async (email: string, pass: string): Promise<User> => {
    const newUser = await authService.register(email, pass);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };
  
  const upgradePlan = (plan: PlanName) => {
    if (user) {
      const updatedUser = authService.updateUserPlan(user.id, plan);
      setUser(updatedUser);
    }
  }

  const recoverPassword = async (email: string): Promise<string> => {
    return authService.recoverPassword(email);
  };

  const restore = async (backupFile: File): Promise<User> => {
    const fileContent = await backupFile.text();
    const backupData = JSON.parse(fileContent) as BackupData;
    const restoredUser = authService.restoreAccount(backupData);
    setUser(restoredUser);
    window.location.reload(); // Reload to ensure all contexts are updated
    return restoredUser;
  }

  const startPremiumTrial = () => {
    if (user && user.plan !== PlanName.PREMIUM) {
      const trial = authService.startPremiumTrial(user.plan);
      const updatedUser = authService.updateUserPlan(user.id, PlanName.PREMIUM);
      setUser(updatedUser);
      setPremiumTrialExpiry(trial.expiry);
    }
  };

  const premiumTrialActive = user?.plan === PlanName.PREMIUM && premiumTrialExpiry !== null;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, upgradePlan, recoverPassword, restore, startPremiumTrial, premiumTrialActive, premiumTrialExpiry }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};