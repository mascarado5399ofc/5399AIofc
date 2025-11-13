
import React, { useState, useRef } from 'react';
import { PlanName } from '../../types';
import { getPlans } from '../../constants';
import Button from './Button';

interface PaymentModalProps {
    planName: PlanName;
    onClose: () => void;
    onSuccess: () => void;
}

const PIX_KEY = 'c01df223-30cb-4168-8914-04f127dfea46';

const CopyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const UploadIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;


const PaymentModal: React.FC<PaymentModalProps> = ({ planName, onClose, onSuccess }) => {
    const plans = getPlans();
    const plan = plans[planName];
    const [proof, setProof] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(PIX_KEY).then(() => {
            setCopySuccess('Chave PIX copiada!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, (err) => {
            setCopySuccess('Falha ao copiar.');
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProof(e.target.files[0]);
        }
    };

    const handleSubmit = () => {
        if (!proof) {
            alert('Por favor, anexe o comprovante de pagamento.');
            return;
        }
        setIsProcessing(true);
        // Simulating backend verification
        setTimeout(() => {
            setIsProcessing(false);
            onSuccess();
        }, 3000); // Atraso de 3 segundos para simular o processamento
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animation-fade-in">
            <div className="bg-gray-900 border border-yellow-500/30 rounded-2xl shadow-2xl shadow-red-500/50 w-full max-w-md p-8 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-yellow-300 hover:text-white text-3xl font-bold">&times;</button>
                <h2 className="text-2xl font-bold text-center text-yellow-400 mb-4">Pagamento via PIX</h2>
                
                <div className="bg-gray-800 p-4 rounded-lg text-center mb-6">
                    <p className="text-yellow-100">Plano Selecionado: <span className="font-bold">{plan.name}</span></p>
                    {plan.originalPrice && (
                        <p className="text-xl text-gray-500 line-through">
                            De: R${plan.originalPrice.toFixed(2).replace('.', ',')}
                        </p>
                    )}
                    <p className="text-3xl font-extrabold text-white">Valor: R${plan.price.toFixed(2).replace('.', ',')}</p>
                     {plan.saleActive && (
                        <p className="text-sm font-bold text-yellow-300 animate-pulse mt-1">
                            Você está aproveitando o preço de Sábado!
                        </p>
                    )}
                </div>

                <div className="space-y-5">
                    <div>
                        <p className="text-sm font-medium text-yellow-200 mb-2">1. Copie a chave PIX e pague no seu banco:</p>
                        <div className="flex">
                            <input
                                type="text"
                                readOnly
                                value={PIX_KEY}
                                className="flex-1 bg-gray-800/50 border border-yellow-500/30 rounded-l-lg px-4 py-2 text-yellow-50 focus:outline-none"
                            />
                            <button onClick={handleCopy} title="Copiar Chave PIX" className="bg-yellow-500 text-gray-900 px-4 rounded-r-lg hover:bg-yellow-400 flex items-center justify-center transition-colors">
                                <CopyIcon />
                            </button>
                        </div>
                         {copySuccess && <p className="text-sm text-green-400 mt-1 text-center">{copySuccess}</p>}
                    </div>

                    <div>
                        <p className="text-sm font-medium text-yellow-200 mb-2">2. Anexe o comprovante de pagamento:</p>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center bg-gray-800/50 border-2 border-dashed border-yellow-500/30 rounded-lg px-4 py-3 text-yellow-200 hover:bg-gray-800 transition-colors">
                           <UploadIcon /> {proof ? proof.name : 'Selecionar Arquivo'}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf" />
                    </div>

                    <Button onClick={handleSubmit} disabled={isProcessing || !proof} fullWidth>
                        {isProcessing ? 'Verificando Pagamento...' : 'Confirmar e Ativar Plano'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;