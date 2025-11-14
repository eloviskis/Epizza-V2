import React, { useState } from 'react';
import { Pizzeria, MenuItem, MenuItemCategory } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import { PlusIcon, TrashIcon } from '../../../components/Icons';
import ImageWithFallback from '../../../components/ImageWithFallback';
import { ApiResponse } from '../../../context/AppContext';

interface MenuManagerProps {
    pizzeria: Pizzeria;
}

const MenuManager: React.FC<MenuManagerProps> = ({ pizzeria }) => {
    const { updateMenuItem, addMenuItem, deleteMenuItem, setTransientError } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | Partial<MenuItem> | null>(null);

    const handleOpenModal = (item: MenuItem | null = null) => {
        setEditingItem(item || { name: '', description: '', category: 'Pizza', price: 0, imageUrl: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
    };

    const handleSave = async (itemToSave: MenuItem | Partial<MenuItem>): Promise<ApiResponse> => {
        const result = 'id' in itemToSave
            ? await updateMenuItem(pizzeria.id, itemToSave as MenuItem)
            : await addMenuItem(pizzeria.id, itemToSave as Omit<MenuItem, 'id'>);
        
        if (result.success) {
            handleCloseModal();
        }
        return result;
    };

    const handleDelete = async (itemId: string) => {
        if(window.confirm('Tem certeza de que deseja excluir este item?')) {
            const result = await deleteMenuItem(pizzeria.id, itemId);
            if(!result.success && !result.isNetworkError){
                setTransientError(result.message || 'Erro ao excluir item.');
            }
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-textPrimary">Gerenciar Cardápio</h2>
                <button onClick={() => handleOpenModal()} className="bg-primary text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 hover:bg-red-600 transition-colors">
                    <PlusIcon className="w-5 h-5"/>
                    Adicionar Item
                </button>
            </div>

            <div className="space-y-4">
                {pizzeria.menu.map(item => (
                    <div key={item.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ImageWithFallback src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
                            <div>
                                <h4 className="font-bold">{item.name}</h4>
                                <p className="text-sm text-textSecondary">R${item.price.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button onClick={() => handleOpenModal(item)} className="text-sm font-semibold text-primary hover:underline">Editar</button>
                             <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && editingItem && (
                <ItemModal item={editingItem} onSave={handleSave} onClose={handleCloseModal} />
            )}
        </div>
    );
};

interface ItemModalProps {
    item: MenuItem | Partial<MenuItem>;
    onSave: (item: MenuItem | Partial<MenuItem>) => Promise<ApiResponse>;
    onClose: () => void;
}

const ItemModal: React.FC<ItemModalProps> = ({ item, onSave, onClose }) => {
    const [formData, setFormData] = useState(item);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'price' ? parseFloat(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSaving(true);
        const result = await onSave(formData);
        setIsSaving(false);
        if(!result.success && !result.isNetworkError){
            setError(result.message || 'Ocorreu um erro desconhecido.');
        }
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4">{'id' in formData ? 'Editar Item' : 'Adicionar Item'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">Nome</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium">Descrição</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Preço</label>
                            <input type="number" name="price" step="0.01" value={formData.price} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Categoria</label>
                            <select name="category" value={formData.category} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required>
                                <option value="Pizza">Pizza</option>
                                <option value="Bebida">Bebida</option>
                                <option value="Sobremesa">Sobremesa</option>
                            </select>
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium">URL da Imagem</label>
                        <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full mt-1 p-2 border rounded" required/>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center -mb-2">{error}</p>}

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-gray-400 transition-colors">
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
         </div>
    )
}


export default MenuManager;