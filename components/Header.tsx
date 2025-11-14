import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { PizzaIcon, CartIcon, DashboardIcon, BuildingStorefrontIcon } from './Icons';
import CartFlyout from './CartFlyout';
import LoginModal from './LoginModal';
import { UserRole } from '../types';

interface HeaderProps {
  pizzeriaId?: string;
}

const Header: React.FC<HeaderProps> = ({ pizzeriaId }) => {
  const { navigate, cart, cartPizzeriaId, currentUser, logout } = useAppContext();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleCartClick = () => {
    if (pizzeriaId && cart.length > 0) {
      navigate('cart', { pizzeriaId });
    } else if (pizzeriaId) {
      setIsCartOpen(!isCartOpen);
    }
  };

  return (
    <>
      <header className="sticky top-0 bg-surface shadow-md z-20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('landing')}
          >
            <PizzaIcon className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-textPrimary tracking-tight">ePizza</h1>
          </div>
          <div className="flex items-center gap-4">
            {currentUser ? (
                <div className="flex items-center gap-4">
                    {currentUser.role === UserRole.Owner && (
                       <button onClick={() => {}} className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors">
                           <BuildingStorefrontIcon className="w-5 h-5"/> Minha Pizzaria
                       </button>
                    )}
                    {currentUser.role === UserRole.Admin && (
                        <button onClick={() => {}} className="flex items-center gap-1 text-sm font-semibold hover:text-primary transition-colors">
                           <DashboardIcon className="w-5 h-5"/> Painel Admin
                       </button>
                    )}
                    <span className="text-sm font-medium">Olá, {currentUser.name.split(' ')[0]}</span>
                    <button 
                        onClick={logout}
                        className="text-sm text-textSecondary hover:text-primary transition-colors"
                    >
                        Sair
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setIsLoginModalOpen(true)}
                    className="text-sm font-semibold hover:text-primary transition-colors"
                >
                    Entrar / Cadastrar
                </button>
            )}

            {pizzeriaId && currentUser?.role === UserRole.Customer && (
              <button 
                className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
                onClick={handleCartClick}
                aria-label="Ver carrinho"
              >
                <CartIcon className="h-7 w-7 text-textPrimary" />
                {cartItemCount > 0 && cartPizzeriaId === pizzeriaId && (
                  <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
      </header>
      {pizzeriaId && isCartOpen && cartPizzeriaId === pizzeriaId && <CartFlyout pizzeriaId={pizzeriaId} onClose={() => setIsCartOpen(false)} />}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};

export default Header;
