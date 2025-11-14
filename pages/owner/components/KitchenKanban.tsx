import React, { useState } from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import { Order, OrderStatus } from '../../../types';
import { ClockIcon, CheckCircleIcon, PlusIcon } from '../../../components/Icons';

interface KitchenKanbanProps {
  pizzeriaId: string;
}

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
  const { updateOrderStatus, setTransientError } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const timeSince = Math.round((Date.now() - order.createdAt) / 60000);

  const getNextStatus = (): OrderStatus | null => {
      switch(order.status) {
          case OrderStatus.Received: return OrderStatus.Preparing;
          case OrderStatus.Preparing: return OrderStatus.Baking;
          case OrderStatus.Baking: return order.orderType === 'delivery' ? OrderStatus.Delivery : OrderStatus.ReadyForPickup;
          default: return null;
      }
  }

  const handleNextStep = async () => {
    const nextStatus = getNextStatus();
    if(nextStatus) {
        setIsLoading(true);
        const result = await updateOrderStatus(order.id, nextStatus);
        setIsLoading(false);
        if (!result.success && !result.isNetworkError) {
            setTransientError(result.message || 'Falha ao atualizar o pedido.');
        }
    }
  };


  return (
    <div className="bg-white rounded-lg shadow p-4 border-l-4 border-primary">
      <div className="flex justify-between items-start">
        <h4 className="font-bold text-textPrimary">{order.customer.name}</h4>
        <span className="text-xs font-semibold bg-secondary text-yellow-800 px-2 py-1 rounded-full">{order.orderType === 'delivery' ? 'Entrega' : 'Retirada'}</span>
      </div>
      <p className="text-sm text-textSecondary font-mono">{order.id.slice(-8)}</p>
      <div className="my-3 space-y-1">
        {order.items.map(item => (
          <p key={item.id} className="text-sm text-gray-600">
            {item.quantity}x {item.menuItem.name}
          </p>
        ))}
      </div>
      <div className="flex justify-between items-center text-xs text-textSecondary pt-2 border-t">
        <div className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            <span>{timeSince} min atrás</span>
        </div>
        <span>{totalItems} itens</span>
      </div>
      {getNextStatus() && (
        <button 
            onClick={handleNextStep}
            disabled={isLoading}
            className="w-full mt-3 bg-primary text-white text-sm font-bold py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-400"
        >
            {isLoading ? 'Avançando...' : 'Próximo Passo'}
        </button>
      )}
    </div>
  );
};

const KitchenKanban: React.FC<KitchenKanbanProps> = ({ pizzeriaId }) => {
  const { orders } = useAppContext();

  const pizzeriaOrders = orders.filter(o => o.pizzeriaId === pizzeriaId);

  const received = pizzeriaOrders.filter(o => o.status === OrderStatus.Received);
  const preparing = pizzeriaOrders.filter(o => o.status === OrderStatus.Preparing || o.status === OrderStatus.Baking);
  const ready = pizzeriaOrders.filter(o => o.status === OrderStatus.Delivery || o.status === OrderStatus.ReadyForPickup);

  return (
    <div>
      <h2 className="text-2xl font-bold text-textPrimary mb-4">Pedidos na Cozinha</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column: To Do */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-bold mb-4 text-center">A Fazer ({received.length})</h3>
          <div className="space-y-4 h-96 overflow-y-auto">
            {received.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        </div>
        {/* Column: Preparing */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-bold mb-4 text-center">Preparando ({preparing.length})</h3>
          <div className="space-y-4 h-96 overflow-y-auto">
            {preparing.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        </div>
        {/* Column: Ready */}
        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-bold mb-4 text-center">Pronto para Entrega/Retirada ({ready.length})</h3>
          <div className="space-y-4 h-96 overflow-y-auto">
            {ready.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenKanban;