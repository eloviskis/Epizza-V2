
import React, { useState } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { MenuItemCategory } from '../types';
import Header from '../components/Header';
import MenuItemCard from '../components/MenuItemCard';
import { StarIcon, MapPinIcon, ClockIcon } from '../components/Icons';
import ImageWithFallback from '../components/ImageWithFallback';

interface PizzeriaPageProps {
  pizzeriaId: string;
}

const PizzeriaPage: React.FC<PizzeriaPageProps> = ({ pizzeriaId }) => {
  const { getPizzeria, navigate } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const pizzeria = getPizzeria(pizzeriaId);

  if (!pizzeria) {
    return (
      <div>
        <Header />
        <p className="text-center py-10">Pizzaria não encontrada.</p>
      </div>
    );
  }

  const categories: MenuItemCategory[] = ['Pizza', 'Bebida', 'Sobremesa'];
  
  const filteredMenu = pizzeria.menu.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const groupedMenu = categories.map(category => ({
      category,
      items: filteredMenu.filter(item => item.category === category)
  })).filter(group => group.items.length > 0);


  return (
    <div>
      <Header pizzeriaId={pizzeriaId} />
      <div className="relative h-64">
        <ImageWithFallback src={pizzeria.heroUrl} alt={pizzeria.name} className="w-full h-full object-cover"/>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <main className="container mx-auto px-4 pb-12">
        <div className="bg-surface rounded-lg shadow-lg p-6 -mt-24 relative z-10">
            <div className="flex flex-col md:flex-row items-start gap-6">
                <ImageWithFallback src={pizzeria.logoUrl} alt={`${pizzeria.name} logo`} className="w-24 h-24 rounded-full border-4 border-white shadow-md"/>
                <div className="flex-1">
                    <h2 className="text-3xl font-extrabold text-textPrimary">{pizzeria.name}</h2>
                    <p className="text-textSecondary mt-1">{pizzeria.specialty}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-textSecondary">
                        <div className="flex items-center gap-1"><StarIcon className="w-4 h-4 text-secondary"/> <span className="font-bold text-textPrimary">{pizzeria.rating}</span></div>
                        <div className="flex items-center gap-1"><MapPinIcon className="w-4 h-4 text-gray-400"/> {pizzeria.address}</div>
                        <div className="flex items-center gap-1"><ClockIcon className="w-4 h-4 text-gray-400"/> {pizzeria.openingHours.Monday}</div>
                    </div>
                </div>
                <div className={`px-4 py-2 text-sm font-bold text-white rounded-full ${pizzeria.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                    {pizzeria.isOpen ? 'Aberta' : 'Fechada'}
                </div>
            </div>
        </div>

        <div className="mt-8">
            <input
                type="text"
                placeholder="Buscar no cardápio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
        </div>

        <div className="mt-8 space-y-10">
            {groupedMenu.map(group => (
                <div key={group.category}>
                    <h3 className="text-2xl font-bold border-b-2 border-primary pb-2 mb-4">{group.category}s</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {group.items.map(item => (
                            <MenuItemCard 
                                key={item.id} 
                                item={item}
                                onClick={() => pizzeria.isOpen && navigate('product', { pizzeriaId, menuItemId: item.id })}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default PizzeriaPage;