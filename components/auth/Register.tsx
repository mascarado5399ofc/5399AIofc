
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Input from '../shared/Input';
import Button from '../shared/Button';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password);
    } catch (err: any) {
      setError(err.message || 'Falha no cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-center text-yellow-400 mb-6">Criar Conta</h2>
      {error && <p className="bg-red-500/20 text-red-300 p-3 rounded-md mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="register-email"
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          id="register-password"
          type="password"
          label="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          id="register-confirm-password"
          type="password"
          label="Confirmar Senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} fullWidth>
          {loading ? 'Criando...' : 'Criar Conta'}
        </Button>
      </form>
    </div>
  );
};

export default Register;