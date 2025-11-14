import React from 'react';
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import { UserRole } from './types';
import { PizzaIcon } from './components/Icons';
import ErrorBanner from './components/ErrorBanner';
import OnlineStatusBanner from './components/OnlineStatusBanner';

// Customer Pages
import LandingPage from './pages/LandingPage';
import PizzeriaPage from './pages/PizzeriaPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderStatusPage from './pages/OrderStatusPage';

// Owner Pages
import OwnerDashboardPage from './pages/owner/OwnerDashboardPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Main />
    </AppProvider>
  );
};

const Main: React.FC = () => {
  const { view, params, currentUser, isLoading, initError, retryInit, isOnline } = useAppContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <PizzaIcon className="h-16 w-16 text-primary animate-spin mx-auto" />
          <p className="text-lg font-semibold mt-4 text-textPrimary">Carregando ePizza...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center bg-surface p-8 rounded-lg shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-500">Falha na Conexão</h2>
          <p className="text-textSecondary mt-2">
            Não foi possível conectar ao servidor.
          </p>
          
          <div className="mt-4 text-sm text-yellow-800 bg-yellow-100 p-3 rounded-md flex items-center justify-center gap-2">
            <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Tentando reconectar automaticamente...</span>
          </div>

          <button 
            onClick={retryInit} 
            className="mt-6 bg-primary text-white font-bold py-2 px-6 rounded-full hover:bg-red-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={!isOnline}
          >
            Tentar Novamente Agora
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    // Role-based routing
    if (currentUser?.role === UserRole.Owner) {
      return <OwnerDashboardPage />;
    }
    if (currentUser?.role === UserRole.Admin) {
      return <AdminDashboardPage />;
    }
  
    // Default to Customer view
    switch (view) {
      case 'pizzeria':
        return <PizzeriaPage pizzeriaId={params.pizzeriaId} />;
      case 'product':
        return <ProductPage pizzeriaId={params.pizzeriaId} menuItemId={params.menuItemId} />;
      case 'cart':
        return <CartPage pizzeriaId={params.pizzeriaId} />;
      case 'checkout':
        return <CheckoutPage pizzeriaId={params.pizzeriaId} />;
      case 'orderStatus':
        return <OrderStatusPage orderId={params.orderId} />;
      case 'landing':
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-textPrimary">
      <OnlineStatusBanner />
      <ErrorBanner />
      {renderView()}
    </div>
  );
};

export default App;