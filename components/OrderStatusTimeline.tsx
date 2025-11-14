
import React from 'react';
import { Order, OrderStatus } from '../types';
import { CheckCircleIcon } from './Icons';

interface OrderStatusTimelineProps {
  order: Order;
}

const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({ order }) => {
  const isDelivery = order.orderType === 'delivery';

  const allStatuses: { status: OrderStatus; label: string }[] = [
    { status: OrderStatus.Received, label: 'Pedido Recebido' },
    { status: OrderStatus.Preparing, label: 'Na Cozinha' },
    { status: OrderStatus.Baking, label: 'No Forno' },
    isDelivery
      ? { status: OrderStatus.Delivery, label: 'Saiu para Entrega' }
      : { status: OrderStatus.ReadyForPickup, label: 'Pronto para Retirada' },
    isDelivery
      ? { status: OrderStatus.Delivered, label: 'Entregue' }
      : { status: OrderStatus.PickedUp, label: 'Retirado' },
  ];
  
  const statusOrder = Object.values(OrderStatus);
  const currentStatusIndex = statusOrder.indexOf(order.status);

  return (
    <div className="p-6">
      <ol className="relative border-l border-gray-200">
        {allStatuses.map((item, index) => {
          const itemStatusIndex = statusOrder.indexOf(item.status);
          const isCompleted = itemStatusIndex <= currentStatusIndex;
          const isCurrent = itemStatusIndex === currentStatusIndex;

          return (
            <li key={item.status} className="mb-10 ml-6">
              <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-8 ring-white ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}>
                {isCompleted && <CheckCircleIcon className="w-5 h-5 text-white" />}
              </span>
              <div className={`transition-opacity duration-500 ${isCompleted ? 'opacity-100' : 'opacity-50'}`}>
                <h3 className={`text-lg font-semibold ${isCurrent ? 'text-primary' : 'text-gray-900'}`}>{item.label}</h3>
                {isCurrent && <p className="text-sm font-normal text-gray-500">Este é o status atual do seu pedido.</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default OrderStatusTimeline;
