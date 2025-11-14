
import React from 'react';
import { MenuItem } from '../types';
import ImageWithFallback from './ImageWithFallback';

interface MenuItemCardProps {
  item: MenuItem;
  onClick: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onClick }) => {
  return (
    <div 
      className="bg-surface rounded-lg shadow-md overflow-hidden flex cursor-pointer transition-shadow hover:shadow-xl"
      onClick={onClick}
    >
      <div className="flex-1 p-4">
        <h4 className="text-lg font-bold text-textPrimary">{item.name}</h4>
        <p className="text-sm text-textSecondary mt-1 line-clamp-2">{item.description}</p>
        <p className="text-md font-semibold text-primary">${item.price.toFixed(2)}</p>
      </div>
      <div className="w-32 flex-shrink-0">
        <ImageWithFallback className="w-full h-full object-cover" src={item.imageUrl} alt={item.name} />
      </div>
    </div>
  );
};

export default MenuItemCard;