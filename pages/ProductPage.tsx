
import React, { useState, useMemo } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { MenuItem, Option, SelectedCustomizations } from '../types';
import Header from '../components/Header';
import { ChevronLeftIcon } from '../components/Icons';
import ImageWithFallback from '../components/ImageWithFallback';

interface ProductPageProps {
  pizzeriaId: string;
  menuItemId: string;
}

const ProductPage: React.FC<ProductPageProps> = ({ pizzeriaId, menuItemId }) => {
  const { getPizzeria, navigate, addToCart } = useAppContext();
  const pizzeria = getPizzeria(pizzeriaId);
  const menuItem = pizzeria?.menu.find(item => item.id === menuItemId);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<Option | null>(menuItem?.customizationOptions?.sizes[0] || null);
  const [selectedCrust, setSelectedCrust] = useState<Option | null>(menuItem?.customizationOptions?.crusts[0] || null);
  const [selectedToppings, setSelectedToppings] = useState<Option[]>([]);
  const [notes, setNotes] = useState('');
  
  const handleToppingToggle = (topping: Option) => {
    setSelectedToppings(prev =>
      prev.find(t => t.name === topping.name)
        ? prev.filter(t => t.name !== topping.name)
        : [...prev, topping]
    );
  };

  const totalPrice = useMemo(() => {
    if (!menuItem) return 0;
    let price = menuItem.price;
    if (menuItem.customizable) {
        price *= selectedSize?.priceModifier || 1;
        price += selectedCrust?.additionalPrice || 0;
        selectedToppings.forEach(t => price += t.additionalPrice || 0);
    }
    return price * quantity;
  }, [menuItem, selectedSize, selectedCrust, selectedToppings, quantity]);

  if (!pizzeria || !menuItem) {
    return <div>Item não encontrado.</div>;
  }

  const handleAddToCart = () => {
    if (!selectedSize) return;
    const cartItem = {
      menuItem,
      quantity,
      customizations: {
        size: selectedSize,
        crust: selectedCrust,
        toppings: selectedToppings,
      } as SelectedCustomizations,
      notes,
    };
    addToCart(cartItem, pizzeria.id);
    navigate('pizzeria', { pizzeriaId });
  };

  return (
    <div>
      <Header pizzeriaId={pizzeriaId} />
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => navigate('pizzeria', { pizzeriaId })} className="flex items-center text-primary font-semibold mb-4">
          <ChevronLeftIcon className="w-5 h-5" />
          Voltar ao Cardápio
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <ImageWithFallback src={menuItem.imageUrl} alt={menuItem.name} className="w-full rounded-lg shadow-lg aspect-video object-cover" />
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold">{menuItem.name}</h1>
            <p className="text-textSecondary">{menuItem.description}</p>
            
            {menuItem.customizable && menuItem.customizationOptions && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Tamanho</h3>
                  <div className="flex gap-2 flex-wrap">
                    {menuItem.customizationOptions.sizes.map(size => (
                      <button key={size.name} onClick={() => setSelectedSize(size)} className={`px-4 py-2 rounded-full border ${selectedSize?.name === size.name ? 'bg-primary text-white border-primary' : 'bg-white'}`}>
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Borda</h3>
                  <div className="flex gap-2 flex-wrap">
                    {menuItem.customizationOptions.crusts.map(crust => (
                      <button key={crust.name} onClick={() => setSelectedCrust(crust)} className={`px-4 py-2 rounded-full border ${selectedCrust?.name === crust.name ? 'bg-primary text-white border-primary' : 'bg-white'}`}>
                        {crust.name} (+R${crust.additionalPrice?.toFixed(2)})
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Adicionais</h3>
                  <div className="flex gap-2 flex-wrap">
                    {menuItem.customizationOptions.toppings.map(topping => (
                      <button key={topping.name} onClick={() => handleToppingToggle(topping)} className={`px-4 py-2 rounded-full border ${selectedToppings.some(t => t.name === topping.name) ? 'bg-primary text-white border-primary' : 'bg-white'}`}>
                        {topping.name} (+R${topping.additionalPrice?.toFixed(2)})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold mb-2">Observações</h3>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Algum pedido especial? Ex: sem cebola" 
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div className="flex items-center justify-between sticky bottom-0 bg-white py-4">
               <div className="flex items-center gap-4">
                   <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-2 rounded-full bg-gray-200">-</button>
                   <span className="text-xl font-bold">{quantity}</span>
                   <button onClick={() => setQuantity(q => q + 1)} className="p-2 rounded-full bg-gray-200">+</button>
               </div>
              <button onClick={handleAddToCart} className="flex-1 ml-4 bg-primary text-white font-bold py-3 px-6 rounded-full hover:bg-red-600 transition-colors">
                Adicionar ao Carrinho - R${totalPrice.toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;