
import { PlanDetails, PlanName } from './types';

const BASE_PLANS_DATA: Omit<PlanDetails, 'price' | 'saleActive' | 'originalPrice'>[] = [
  {
    name: PlanName.GRATUITO,
    features: [
      'Chat e Imagens Ilimitados',
      '11 Gerações de Vídeo por dia',
      '12 Gerações de Áudio por dia',
      'Ferramenta de Estudos (com Fontes)',
      'Ferramenta de Criação Universal',
      'Qualidade de Geração Padrão',
    ],
    credits: { video: 11, audio: 12 },
    isUnlimited: false,
  },
  {
    name: PlanName.PRO,
    features: [
      'Chat e Imagens Ilimitados',
      '21 Gerações de Vídeo por dia',
      '22 Gerações de Áudio por dia',
      'Ferramenta de Estudos (Completo)',
      'Ferramenta de Criação Universal',
      'Qualidade de Geração Superior',
      'Suporte Prioritário',
    ],
    credits: { video: 21, audio: 22 },
    isUnlimited: false,
  },
  {
    name: PlanName.VIP,
    features: [
      'Tudo do PRO, e mais:',
      '36 Gerações de Vídeo por dia',
      '37 Gerações de Áudio por dia',
      'Qualidade de Geração Profissional',
      'Acesso Beta a Novas Ferramentas',
      'Ferramenta de Criação Universal',
    ],
    credits: { video: 36, audio: 37 },
    isUnlimited: false,
  },
  {
    name: PlanName.PREMIUM,
    features: [
      'Tudo do VIP, e mais:',
      'Gerações de Vídeo ILIMITADAS',
      'Gerações de Áudio ILIMITADAS',
      'Qualidade de Geração Máxima',
      'Acesso total e irrestrito',
      'Ferramenta de Criação Universal',
    ],
    credits: { video: Infinity, audio: Infinity },
    isUnlimited: true,
  },
];

const STANDARD_PRICES = {
    [PlanName.PRO]: 19.99,
    [PlanName.VIP]: 49.99,
    [PlanName.PREMIUM]: 99.99,
};

const SATURDAY_PRICES = {
    [PlanName.PRO]: 10,
    [PlanName.VIP]: 40,
    [PlanName.PREMIUM]: 80,
};

export const getPlans = (): Record<PlanName, PlanDetails> => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
    const isSaturday = dayOfWeek === 6;

    const plans: Record<PlanName, PlanDetails> = {} as Record<PlanName, PlanDetails>;

    for (const basePlan of BASE_PLANS_DATA) {
        let price = 0;
        let originalPrice: number | undefined = undefined;

        if (basePlan.name !== PlanName.GRATUITO) {
            if (isSaturday) {
                price = SATURDAY_PRICES[basePlan.name];
                originalPrice = STANDARD_PRICES[basePlan.name];
            } else {
                price = STANDARD_PRICES[basePlan.name];
            }
        }
        
        plans[basePlan.name] = {
            ...basePlan,
            price,
            originalPrice,
            saleActive: isSaturday && basePlan.name !== PlanName.GRATUITO,
        };
    }
    
    return plans;
};

// Export a static version for parts of the app that don't need dynamic prices (e.g., credit logic)
// to minimize code changes. This is derived from the standard prices.
const staticPlans = getPlans();
staticPlans[PlanName.PRO].price = STANDARD_PRICES[PlanName.PRO];
staticPlans[PlanName.VIP].price = STANDARD_PRICES[PlanName.VIP];
staticPlans[PlanName.PREMIUM].price = STANDARD_PRICES[PlanName.PREMIUM];
staticPlans[PlanName.PRO].saleActive = false;
staticPlans[PlanName.VIP].saleActive = false;
staticPlans[PlanName.PREMIUM].saleActive = false;
staticPlans[PlanName.PRO].originalPrice = undefined;
staticPlans[PlanName.VIP].originalPrice = undefined;
staticPlans[PlanName.PREMIUM].originalPrice = undefined;

export const PLANS = staticPlans;