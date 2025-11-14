import React from 'react';
import { useAppContext } from '../hooks/useAppContext';

const OnlineStatusBanner: React.FC = () => {
  const { isOnline } = useAppContext();

  if (isOnline) {
    return null;
  }

  return (
    <div
      className="bg-yellow-500 text-yellow-900 text-center p-2 text-sm font-semibold z-50"
      role="status"
    >
      Conexão perdida com o servidor. Tentando reconectar...
    </div>
  );
};

export default OnlineStatusBanner;
