
export enum PlanName {
  GRATUITO = 'Gratuito',
  PRO = 'PRO',
  VIP = 'VIP',
  PREMIUM = 'PREMIUM',
}

export interface PlanDetails {
  name: PlanName;
  price: number;
  originalPrice?: number;
  features: string[];
  credits: {
    video: number;
    audio: number;
  };
  isUnlimited: boolean;
  saleActive?: boolean;
}

export interface User {
  id: string;
  email: string;
  plan: PlanName;
}

// Multimodal support
export interface TextPart {
  type: 'text';
  text: string;
}
export interface ImagePart {
  type: 'image';
  inlineData: {
    mimeType: string;
    data: string; // base64
  };
  source: 'file' | 'clipboard';
}
export interface AudioPart {
    type: 'audio';
    inlineData: {
        mimeType: string;
        data: string; // base64
    };
    audioUrl: string; // a blob URL for playback
}
export interface VideoPart {
    type: 'video';
    inlineData: {
        mimeType: string;
        data: string; // base64
    };
    videoUrl: string; // a blob URL for playback
}

export type Part = TextPart | ImagePart | AudioPart | VideoPart;

export interface Message {
  sender: 'user' | 'bot';
  parts: Part[];
}


export interface UserCredits {
  video: number;
  audio: number;
  lastReset: string; // ISO date string
}

export interface PremiumTrial {
  originalPlan: PlanName;
  expiry: number; // timestamp
}

export interface Source {
    web?: {
        uri: string;
        title: string;
    };
    maps?: {
        uri: string;
        title: string;
    }
}

export type Tool = 'chat' | 'image' | 'video' | 'audio' | 'study' | 'creator' | 'planos';

export interface BackupData {
  user: User;
  password_hash: string;
  credits?: UserCredits;
}

// Adiciona tipos globais para a API aistudio para evitar erros do TypeScript
// e fornecer segurança de tipos ao acessá-la.

declare global {
  // FIX: Moved the AIStudio interface declaration inside `declare global` to prevent
  // module-scoped type conflicts with the global Window interface augmentation.
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}