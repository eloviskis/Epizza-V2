
import React from 'react';
import PizzeriaCard from '../components/PizzeriaCard';
import Header from '../components/Header';
import { useAppContext } from '../hooks/useAppContext';

const LandingPage: React.FC = () => {
  const { navigate, pizzerias } = useAppContext();

  return (
    <div className="bg-background min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-textPrimary mb-6">Encontre a Sua Pizza Perfeita</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pizzerias.map(pizzeria => (
            <PizzeriaCard 
              key={pizzeria.id} 
              pizzeria={pizzeria}
              onClick={() => navigate('pizzeria', { pizzeriaId: pizzeria.id })}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
