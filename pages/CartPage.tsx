
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Header from '../components/Header';
import { PlusIcon, MinusIcon, TrashIcon, ChevronLeftIcon } from '../components/Icons';
import ImageWithFallback from '../components/ImageWithFallback';

interface CartPageProps {
  pizzeriaId: string;
}

const CartPage: React.FC<CartPageProps> = ({ pizzeriaId }) => {
  const { cart, cartPizzeriaId, getCartTotal, updateCartItemQuantity, removeFromCart, navigate } = useAppContext();
  
  if (cartPizzeriaId !== pizzeriaId) {
    return (
        <div>
            <Header pizzeriaId={pizzeriaId} />
            <div className="text-center py-10">
                <p>Seu carrinho está vazio ou contém itens de outra pizzaria.</p>
                <button onClick={() => navigate('pizzeria', { pizzeriaId })} className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-full">Voltar ao Cardápio</button>
            </div>
        </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header pizzeriaId={pizzeriaId} />
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('pizzeria', { pizzeriaId })} className="flex items-center text-primary font-semibold mb-4">
          <ChevronLeftIcon className="w-5 h-5" />
          Voltar ao Cardápio
        </button>
        <h1 className="text-3xl font-extrabold mb-6">Seu Carrinho</h1>

        {cart.length === 0 ? (
          <p>Seu carrinho está vazio.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 border-b pb-4 last:border-b-0">
                  <ImageWithFallback src={item.menuItem.imageUrl} alt={item.menuItem.name} className="w-full sm:w-24 h-24 rounded-md object-cover"/>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{item.menuItem.name}</h3>
                    <p className="text-sm text-textSecondary">{item.customizations.size.name}{item.customizations.crust ? `, ${item.customizations.crust.name}` : ''}</p>
                    {item.customizations.toppings && item.customizations.toppings.length > 0 && <p className="text-xs text-textSecondary">Adicionais: {item.customizations.toppings.map(t => t.name).join(', ')}</p>}
                    {item.notes && <p className="text-xs text-textSecondary mt-1 italic">Observações: "{item.notes}"</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border rounded-full px-2">
                      <button onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}><MinusIcon className="w-4 h-4"/></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}><PlusIcon className="w-4 h-4"/></button>
                    </div>
                    <p className="font-bold w-20 text-right">R${item.totalPrice.toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Resumo do Pedido</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>R${getCartTotal().toFixed(2)}</span>
                  </div>
                   <div className="flex justify-between text-lg font-bold pt-4 border-t">
                    <span>Total</span>
                    <span>R${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button 
                    onClick={() => navigate('checkout', {pizzeriaId})}
                    className="mt-6 w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-red-600 transition-colors"
                >
                    Finalizar Pedido
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;