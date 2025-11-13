
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserCredits, PlanName } from '../types';
import { useAuth } from '../hooks/useAuth';
import { PLANS } from '../constants';

interface UserContextType {
  credits: UserCredits | null;
  useCredit: (type: 'video' | 'audio') => boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

const isToday = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);

  useEffect(() => {
    if (user) {
      const storedCreditsRaw = localStorage.getItem(`credits_${user.id}`);
      const planDetails = PLANS[user.plan];
      
      if (storedCreditsRaw) {
        const storedCredits = JSON.parse(storedCreditsRaw) as UserCredits;
        if (isToday(storedCredits.lastReset)) {
          setCredits(storedCredits);
        } else {
          // Reset credits for the new day
          const newCredits: UserCredits = {
            video: planDetails.credits.video,
            audio: planDetails.credits.audio,
            lastReset: new Date().toISOString(),
          };
          localStorage.setItem(`credits_${user.id}`, JSON.stringify(newCredits));
          setCredits(newCredits);
        }
      } else {
        // Initialize credits for the first time
        const newCredits: UserCredits = {
          video: planDetails.credits.video,
          audio: planDetails.credits.audio,
          lastReset: new Date().toISOString(),
        };
        localStorage.setItem(`credits_${user.id}`, JSON.stringify(newCredits));
        setCredits(newCredits);
      }
    } else {
      setCredits(null);
    }
  }, [user]);

  const useCredit = useCallback((type: 'video' | 'audio'): boolean => {
    if (!user || !credits) return false;
    
    if (PLANS[user.plan].isUnlimited) return true;

    if (credits[type] > 0) {
      const newCredits = { ...credits, [type]: credits[type] - 1 };
      setCredits(newCredits);
      localStorage.setItem(`credits_${user.id}`, JSON.stringify(newCredits));
      return true;
    }
    
    return false;
  }, [user, credits]);

  return (
    <UserContext.Provider value={{ credits, useCredit }}>
      {children}
    </UserContext.Provider>
  );
};