
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { TrashIcon } from './Icons';
import ImageWithFallback from './ImageWithFallback';

interface CartFlyoutProps {
  pizzeriaId: string;
  onClose: () => void;
}

const CartFlyout: React.FC<CartFlyoutProps> = ({ pizzeriaId, onClose }) => {
  const { cart, getCartTotal, removeFromCart, navigate, cartPizzeriaId } = useAppContext();

  if (cartPizzeriaId !== pizzeriaId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={onClose}>
      <div 
        className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <h3 className="text-xl font-bold">Seu Pedido</h3>
        </div>
        
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <p className="text-textSecondary">Seu carrinho está vazio.</p>
            <button
              onClick={onClose}
              className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-full hover:bg-red-600 transition-colors"
            >
              Comece a Pedir
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <ImageWithFallback src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-16 h-16 rounded-md object-cover" />
                  <div className="flex-1">
                    <p className="font-bold">{item.quantity}x {item.menuItem.name}</p>
                    <p className="text-sm text-textSecondary">
                      {item.customizations?.size?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">R${item.totalPrice.toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-4 h-4 mt-1"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t space-y-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R${getCartTotal().toFixed(2)}</span>
              </div>
              <button 
                onClick={() => navigate('cart', { pizzeriaId })}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-full hover:bg-red-600 transition-colors text-center"
              >
                Ir para o Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartFlyout;