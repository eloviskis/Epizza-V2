
import React from 'react';
import { Pizzeria } from '../types';
import { StarIcon } from './Icons';
import ImageWithFallback from './ImageWithFallback';

interface PizzeriaCardProps {
  pizzeria: Pizzeria;
  onClick: () => void;
}

const PizzeriaCard: React.FC<PizzeriaCardProps> = ({ pizzeria, onClick }) => {
  return (
    <div 
      className="bg-surface rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <ImageWithFallback className="w-full h-40 object-cover" src={pizzeria.heroUrl} alt={pizzeria.name} />
        <div className={`absolute top-2 right-2 px-3 py-1 text-sm font-semibold text-white rounded-full ${pizzeria.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
          {pizzeria.isOpen ? 'Aberta' : 'Fechada'}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-4">
          <ImageWithFallback className="w-16 h-16 rounded-full border-4 border-white -mt-10 shadow-md" src={pizzeria.logoUrl} alt={`${pizzeria.name} logo`} />
          <div>
            <h3 className="text-xl font-bold text-textPrimary">{pizzeria.name}</h3>
            <p className="text-sm text-textSecondary">{pizzeria.specialty}</p>
          </div>
        </div>
        <div className="mt-3 flex justify-between items-center text-sm">
          <div className="flex items-center gap-1 text-textSecondary">
            <StarIcon className="h-5 w-5 text-secondary" />
            <span className="font-bold text-textPrimary">{pizzeria.rating}</span> 
            <span>(100+)</span>
          </div>
          <p className="text-textSecondary">{pizzeria.address.split(',')[1]}</p>
        </div>
      </div>
    </div>
  );
};

export default PizzeriaCard;