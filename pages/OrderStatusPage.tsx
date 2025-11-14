import React, { useEffect } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { OrderStatus } from '../types';
import Header from '../components/Header';
import OrderStatusTimeline from '../components/OrderStatusTimeline';

interface OrderStatusPageProps {
  orderId: string;
}

const OrderStatusPage: React.FC<OrderStatusPageProps> = ({ orderId }) => {
  const { currentOrder, updateOrderStatus, navigate, setTransientError } = useAppContext();

  useEffect(() => {
    if (currentOrder?.id !== orderId) return;

    // Don't restart simulation if order is already complete
    const finalStatuses = [OrderStatus.Delivered, OrderStatus.PickedUp];
    if (finalStatuses.includes(currentOrder.status)) {
        return;
    }

    const statuses = [
      OrderStatus.Preparing,
      OrderStatus.Baking,
      currentOrder.orderType === 'delivery' ? OrderStatus.Delivery : OrderStatus.ReadyForPickup,
      currentOrder.orderType === 'delivery' ? OrderStatus.Delivered : OrderStatus.PickedUp,
    ];

    let currentStatusIndex = statuses.indexOf(currentOrder.status);
    if (currentStatusIndex === -1) { // If current status is 'received'
        currentStatusIndex = 0;
    } else {
        currentStatusIndex++; // Start from the next status
    }

    const interval = setInterval(async () => {
      if (currentStatusIndex < statuses.length) {
        const result = await updateOrderStatus(orderId, statuses[currentStatusIndex]);
        if (result.success) {
            currentStatusIndex++;
        } else {
            if (!result.isNetworkError) {
              setTransientError(result.message || 'A atualização do status falhou.');
            }
            clearInterval(interval);
        }
      } else {
        clearInterval(interval);
      }
    }, 7000); // 7 seconds per status update

    return () => clearInterval(interval);
  }, [orderId, currentOrder, updateOrderStatus, setTransientError]);

  if (!currentOrder || currentOrder.id !== orderId) {
    return (
      <div>
        <Header />
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold">Pedido não encontrado.</h1>
          <button onClick={() => navigate('landing')} className="mt-4 bg-primary text-white font-bold py-2 px-4 rounded-full">Voltar ao Início</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold text-primary">Obrigado pelo seu pedido!</h1>
                <p className="text-textSecondary mt-2">Seu pedido da <strong>{currentOrder.pizzeriaName}</strong> está sendo processado.</p>
                <p className="text-sm text-gray-500 mt-1">ID do Pedido: {currentOrder.id}</p>
            </div>

            <OrderStatusTimeline order={currentOrder} />
            
            <div className="mt-8 text-center">
                <button onClick={() => navigate('landing')} className="bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-colors">
                    Voltar ao Início
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;