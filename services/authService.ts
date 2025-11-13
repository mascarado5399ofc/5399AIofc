
import { User, PlanName, PremiumTrial, BackupData, UserCredits } from '../types';

const USERS_KEY = '5399ai_users';
const CURRENT_USER_KEY = '5399ai_current_user';
const PREMIUM_TRIAL_KEY = '5399ai_premium_trial';

// Helper to get users from localStorage
const getUsers = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

// Helper to save users to localStorage
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const register = async (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers();
      if (users.find(u => u.email === email)) {
        return reject(new Error('Usuário com este e-mail já existe.'));
      }
      const newUser: User = {
        id: new Date().toISOString(),
        email,
        plan: PlanName.GRATUITO,
      };
      // In a real app, you would hash the password
      localStorage.setItem(`password_${newUser.id}`, password);
      
      users.push(newUser);
      saveUsers(users);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      resolve(newUser);
    }, 500);
  });
};

export const login = async (email: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const user = users.find(u => u.email === email);
            const storedPassword = user ? localStorage.getItem(`password_${user.id}`) : null;

            if (user && storedPassword === password) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
                resolve(user);
            } else {
                reject(new Error('E-mail ou senha inválidos.'));
            }
        }, 500);
    });
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const updateUserPlan = (userId: string, newPlan: PlanName): User | null => {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if(userIndex === -1) return null;

    users[userIndex].plan = newPlan;
    saveUsers(users);
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      currentUser.plan = newPlan;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
    return users[userIndex];
}

export const recoverPassword = async (email: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const user = users.find(u => u.email === email);
            if (user) {
                // In a real app, this would trigger an email with a reset link.
                // Here we just resolve a success message for the UI.
                resolve('Instruções para redefinição de senha foram enviadas para o seu e-mail.');
            } else {
                reject(new Error('Nenhum usuário encontrado com este e-mail.'));
            }
        }, 500);
    });
};

export const startPremiumTrial = (originalPlan: PlanName): PremiumTrial => {
    const expiry = Date.now() + 60 * 60 * 1000; // 1 hour from now
    const trialData: PremiumTrial = { originalPlan, expiry };
    localStorage.setItem(PREMIUM_TRIAL_KEY, JSON.stringify(trialData));
    return trialData;
}

export const getPremiumTrial = (): PremiumTrial | null => {
    const trialData = localStorage.getItem(PREMIUM_TRIAL_KEY);
    return trialData ? JSON.parse(trialData) : null;
}

export const clearPremiumTrial = () => {
    localStorage.removeItem(PREMIUM_TRIAL_KEY);
}

export const backupAccount = (userId: string): BackupData | null => {
    const user = getUsers().find(u => u.id === userId);
    if (!user) return null;

    const password_hash = localStorage.getItem(`password_${userId}`);
    if (!password_hash) return null; // Should not happen if user exists

    const creditsRaw = localStorage.getItem(`credits_${userId}`);
    const credits = creditsRaw ? JSON.parse(creditsRaw) as UserCredits : undefined;
    
    return {
        user,
        password_hash,
        credits
    };
}

export const restoreAccount = (backup: BackupData): User => {
    if (!backup || !backup.user || !backup.password_hash) {
        throw new Error("Arquivo de backup inválido.");
    }

    const users = getUsers();
    
    // Check if another user with the same email but different ID exists
    const existingUserByEmail = users.find(u => u.email === backup.user.email);
    if (existingUserByEmail && existingUserByEmail.id !== backup.user.id) {
        throw new Error('Uma conta com este e-mail já pertence a outro usuário.');
    }
    
    // Find and update/add user
    const userIndex = users.findIndex(u => u.id === backup.user.id);
    if (userIndex > -1) {
        users[userIndex] = backup.user; // Update existing user
    } else {
        users.push(backup.user); // Add new user
    }
    saveUsers(users);

    // Restore password and credits
    localStorage.setItem(`password_${backup.user.id}`, backup.password_hash);
    if (backup.credits) {
        localStorage.setItem(`credits_${backup.user.id}`, JSON.stringify(backup.credits));
    }

    // Log the user in
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(backup.user));
    
    return backup.user;
}