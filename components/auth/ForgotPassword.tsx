
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../shared/Input';
import Button from '../shared/Button';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { recoverPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const message = await recoverPassword(email);
      setSuccess(message);
    } catch (err: any) {
      setError(err.message || 'Falha ao recuperar senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-yellow-400 mb-6">Recuperar Senha</h2>
      {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-center">{error}</p>}
      {success && <p className="bg-green-500/20 text-green-300 p-3 rounded-md mb-4 text-center">{success}</p>}
      
      {!success && (
        <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-yellow-200 text-center">
                Digite seu e-mail e enviaremos instruções para redefinir sua senha.
            </p>
            <Input
            id="recover-email"
            type="email"
            label="Email de Cadastro"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <Button type="submit" disabled={loading} fullWidth>
            {loading ? 'Enviando...' : 'Recuperar Senha'}
            </Button>
        </form>
      )}

      <div className="mt-4 text-center">
          <button onClick={onBackToLogin} className="text-sm font-semibold text-yellow-400 hover:text-yellow-300">
              Voltar para o Login
          </button>
      </div>
    </div>
  );
};

export default ForgotPassword;