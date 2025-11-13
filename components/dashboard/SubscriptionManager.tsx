
import React, { useState } from 'react';
import Pricing from '../shared/Pricing';
import PaymentModal from '../shared/PaymentModal';
import { useAuth } from '../../hooks/useAuth';
import { PlanName } from '../../types';

const SubscriptionManager: React.FC = () => {
    const { user, upgradePlan } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<PlanName | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelectPlan = (plan: PlanName) => {
        if (user && plan !== user.plan && plan !== PlanName.GRATUITO) {
            setSelectedPlan(plan);
            setIsModalOpen(true);
        } else if (user && plan === user.plan) {
            // Do nothing if it's the current plan
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPlan(null);
    };

    const handlePaymentSuccess = (plan: PlanName) => {
        upgradePlan(plan);
        handleCloseModal();
        alert(`Parabéns! Seu plano foi atualizado para ${plan}.`);
        // Recarrega a página para garantir que o contexto do usuário (especialmente os créditos) seja atualizado.
        window.location.reload();
    };

    return (
        <div className="animation-fade-in">
            <div className="max-w-7xl mx-auto p-4 text-center">
                <h2 className="text-3xl font-bold text-yellow-400 mb-4">Gerenciar Assinatura</h2>
                <p className="text-yellow-100 mb-6">
                    Seu plano atual é: <span className="font-bold text-yellow-300 bg-gray-800 px-3 py-1 rounded-full">{user?.plan}</span>
                </p>
                 <p className="text-yellow-200 mb-10 max-w-2xl mx-auto">
                    Escolha um plano abaixo para fazer o upgrade e desbloquear mais poder de IA, mais gerações de mídia e acesso a recursos exclusivos.
                </p>
            </div>
            
            <Pricing onSelectPlan={handleSelectPlan} />

            {isModalOpen && selectedPlan && (
                <PaymentModal
                    planName={selectedPlan}
                    onClose={handleCloseModal}
                    onSuccess={() => handlePaymentSuccess(selectedPlan)}
                />
            )}
        </div>
    );
};

export default SubscriptionManager;