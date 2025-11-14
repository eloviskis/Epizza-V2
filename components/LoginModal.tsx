import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { ApiResponse } from '../context/AppContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type View = 'login' | 'register';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAppContext();
  const [view, setView] = useState<View>('login');
  const [error, setError] = useState('');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let result: ApiResponse;

    if (view === 'login') {
      result = await login(email, password);
    } else {
      result = await register({ name, email, password, phone });
    }

    if (result.success) {
      onClose();
      // Clear fields on successful submission
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
    } else if (!result.isNetworkError) {
        setError(result.message || 'Ocorreu um erro desconhecido.');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center mb-6 border-b">
            <button onClick={() => setView('login')} className={`px-6 py-2 text-lg font-semibold ${view === 'login' ? 'border-b-2 border-primary text-primary' : 'text-textSecondary'}`}>
                Entrar
            </button>
            <button onClick={() => setView('register')} className={`px-6 py-2 text-lg font-semibold ${view === 'register' ? 'border-b-2 border-primary text-primary' : 'text-textSecondary'}`}>
                Cadastrar
            </button>
        </div>
        
        <h2 className="text-2xl font-bold text-center mb-6">{view === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
          </div>
           {view === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="mt-1 block w-full bg-white border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
            </div>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          
          <button type="submit" className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full hover:bg-red-600 transition-colors mt-4">
            {view === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;