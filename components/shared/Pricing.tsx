
import React from 'react';
import { getPlans } from '../../constants';
import { PlanName } from '../../types';
import Button from './Button';

interface PricingProps {
  onSelectPlan: (plan: PlanName) => void;
}

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const plansToShow = [PlanName.GRATUITO, PlanName.PRO, PlanName.VIP, PlanName.PREMIUM];
  const plans = getPlans();

  return (
    <div>
        <h2 className="text-3xl font-bold text-center text-yellow-400 mb-8">Nossos Planos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plansToShow.map((planName) => {
                const plan = plans[planName];
                const isPremium = plan.name === PlanName.PREMIUM;
                const isVip = plan.name === PlanName.VIP;
                return (
                <div key={plan.name} className={`relative bg-black bg-opacity-40 rounded-2xl p-6 flex flex-col border transition-all duration-300 hover:scale-105 hover:shadow-yellow-400/30 ${isPremium ? 'border-yellow-400 shadow-lg shadow-yellow-500/30' : 'border-red-800'}`}>
                    {isVip && (
                        <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
                            <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full uppercase">Mais Popular</span>
                        </div>
                    )}
                     {plan.saleActive && (
                        <div className="absolute top-2 right-2">
                            <span className="bg-gradient-to-r from-red-500 to-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-md uppercase shadow-lg transform rotate-6">PROMO</span>
                        </div>
                    )}
                    <h3 className={`text-2xl font-bold ${isPremium ? 'text-yellow-400' : 'text-yellow-200'}`}>{plan.name}</h3>
                    <div className="mt-2 h-16 flex flex-col justify-center">
                        {plan.originalPrice && (
                             <span className="text-xl font-bold text-gray-500 line-through">
                                R${plan.originalPrice.toFixed(2).replace('.', ',')}
                            </span>
                        )}
                        <p>
                            <span className="text-4xl font-extrabold text-white">R${plan.price.toFixed(2).replace('.', ',')}</span>
                            <span className="text-yellow-300">/mês</span>
                        </p>
                    </div>
                    <ul className="mt-6 space-y-3 text-yellow-50 flex-grow">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <CheckIcon />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-8">
                        <Button fullWidth onClick={() => onSelectPlan(plan.name)}>
                           {plan.price === 0 ? "Começar Agora" : "Selecionar Plano"}
                        </Button>
                    </div>
                </div>
                );
            })}
        </div>
    </div>
  );
};

export default Pricing;