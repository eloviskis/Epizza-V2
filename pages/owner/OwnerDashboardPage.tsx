import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import Header from '../../components/Header';
import { KitchenIcon, MenuIcon, TableIcon, ReportsIcon, BuildingStorefrontIcon } from '../../components/Icons';
import KitchenKanban from './components/KitchenKanban';
import MenuManager from './components/MenuManager';
import TableManager from './components/TableManager';


type DashboardView = 'kitchen' | 'menu' | 'tables' | 'reports';

const OwnerDashboardPage: React.FC = () => {
  const { getOwnerPizzeria, currentUser } = useAppContext();
  const [view, setView] = useState<DashboardView>('kitchen');

  const pizzeria = getOwnerPizzeria();

  if (!pizzeria) {
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Nenhuma pizzaria associada a este usuário.</h1>
          <p className="text-textSecondary mt-2">Entre em contato com o suporte para vincular sua conta.</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch(view) {
      case 'kitchen':
        return <KitchenKanban pizzeriaId={pizzeria.id}/>;
      case 'menu':
        return <MenuManager pizzeria={pizzeria} />;
      case 'tables':
        return <TableManager />;
      case 'reports':
        return <div className="text-center p-8"><h2 className="text-xl">Relatórios em breve...</h2></div>;
      default:
        return null;
    }
  }
  
  const NavItem: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }> = ({ label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white shadow'
          : 'text-textPrimary hover:bg-gray-100'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
            <BuildingStorefrontIcon className="w-10 h-10 text-primary" />
            <div>
                <h1 className="text-3xl font-extrabold text-textPrimary">{pizzeria.name}</h1>
                <p className="text-textSecondary">Painel de Gerenciamento</p>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/4 lg:w-1/5">
            <nav className="space-y-2">
              <NavItem label="Cozinha" icon={<KitchenIcon className="w-6 h-6"/>} isActive={view === 'kitchen'} onClick={() => setView('kitchen')} />
              <NavItem label="Cardápio" icon={<MenuIcon className="w-6 h-6"/>} isActive={view === 'menu'} onClick={() => setView('menu')} />
              <NavItem label="Mesas" icon={<TableIcon className="w-6 h-6"/>} isActive={view === 'tables'} onClick={() => setView('tables')} />
              <NavItem label="Relatórios" icon={<ReportsIcon className="w-6 h-6"/>} isActive={view === 'reports'} onClick={() => setView('reports')} />
            </nav>
          </aside>
          <main className="flex-1 bg-surface rounded-xl shadow-lg p-6">
            {renderView()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboardPage;
