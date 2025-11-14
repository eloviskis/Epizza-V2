import React, { useState, useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import Header from '../components/Header';
import { ChevronLeftIcon } from '../components/Icons';
import { OrderType } from '../types';

interface CheckoutPageProps {
  pizzeriaId: string;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ pizzeriaId }) => {
  const { cart, cartPizzeriaId, getCartTotal, placeOrder, getPizzeria, navigate, currentUser } = useAppContext();
  const pizzeria = getPizzeria(pizzeriaId);
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setCustomer({
        name: currentUser.name,
        phone: currentUser.phone,
        address: currentUser.addresses?.[0] || ''
      });
    }
  }, [currentUser]);
  
  if (!pizzeria || cartPizzeriaId !== pizzeriaId || cart.length === 0) {
    return (
        <div>
            <Header/>
            <div className="text-center py-10">
                <p>Não é possível ir para o checkout.</p>
                <button onClick={() => navigate('landing')} className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-full">Voltar ao Início</button>
            </div>
        </div>
    );
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const result = await placeOrder(customer, orderType, pizzeriaId);
    setIsSubmitting(false);
    if (!result.success && !result.isNetworkError) {
      setError(result.message || "Ocorreu um erro desconhecido ao finalizar o pedido.");
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee = orderType === 'delivery' ? pizzeria.deliveryFee : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header pizzeriaId={pizzeriaId} />
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('cart', { pizzeriaId })} className="flex items-center text-primary font-semibold mb-4">
          <ChevronLeftIcon className="w-5 h-5" />
          Voltar ao Carrinho
        </button>
        <h1 className="text-3xl font-extrabold mb-6">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Tipo de Pedido</h2>
              <div className="flex gap-4">
                <button type="button" onClick={() => setOrderType('delivery')} className={`flex-1 p-4 border rounded-lg text-left ${orderType === 'delivery' ? 'border-primary ring-2 ring-primary' : ''}`}>
                  <h3 className="font-bold">Entrega</h3>
                  <p className="text-sm text-textSecondary">Nós levamos até você.</p>
                </button>
                <button type="button" onClick={() => setOrderType('pickup')} className={`flex-1 p-4 border rounded-lg text-left ${orderType === 'pickup' ? 'border-primary ring-2 ring-primary' : ''}`}>
                  <h3 className="font-bold">Retirada</h3>
                  <p className="text-sm text-textSecondary">Você retira na loja.</p>
                </button>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-4">Seus Dados</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                  <input type="text" name="name" id="name" required value={customer.name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone</label>
                  <input type="tel" name="phone" id="phone" required value={customer.phone} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                </div>
              </div>
              {orderType === 'delivery' && (
                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">Endereço de Entrega</label>
                  <input type="text" name="address" id="address" required={orderType === 'delivery'} value={customer.address} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                </div>
              )}
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white font-bold py-3 rounded-full hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSubmitting ? 'Finalizando...' : 'Fazer Pedido'}
            </button>
          </form>
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Seu Pedido de {pizzeria.name}</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                    <span className="font-medium">R${item.totalPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 border-t mt-4">
                <div className="flex justify-between"><span>Subtotal</span><span>R${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Taxa de Entrega</span><span>R${deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span>R${total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;