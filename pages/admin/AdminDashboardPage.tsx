import React, { useState, useMemo } from 'react';
import Header from '../../components/Header';
import { useAppContext } from '../../hooks/useAppContext';
import { Pizzeria } from '../../types';
import ImageWithFallback from '../../components/ImageWithFallback';

const PizzeriaRow: React.FC<{ pizzeria: Pizzeria }> = ({ pizzeria }) => {
    const { togglePizzeriaActive, setTransientError } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        const result = await togglePizzeriaActive(pizzeria.id);
        setIsLoading(false);
        if (!result.success && !result.isNetworkError) {
            setTransientError(result.message || 'Não foi possível alterar o status da pizzaria.');
        }
    }

    return (
        <tr className="border-b hover:bg-gray-50">
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <ImageWithFallback src={pizzeria.logoUrl} alt={pizzeria.name} className="w-10 h-10 rounded-full object-cover"/>
                    <div>
                        <p className="font-bold">{pizzeria.name}</p>
                        <p className="text-sm text-textSecondary">{pizzeria.address}</p>
                    </div>
                </div>
            </td>
            <td className="p-4 text-center">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${pizzeria.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {pizzeria.isOpen ? 'Aberta' : 'Fechada'}
                </span>
            </td>
            <td className="p-4 text-center">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${pizzeria.isActive ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                    {pizzeria.isActive ? 'Ativa' : 'Inativa'}
                </span>
            </td>
            <td className="p-4 text-center">
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={pizzeria.isActive} 
                        onChange={handleToggle}
                        className="sr-only peer"
                        disabled={isLoading}
                    />
                    <div className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                </label>
            </td>
        </tr>
    );
}

const AdminDashboardPage: React.FC = () => {
    const { pizzerias } = useAppContext();
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

    const filteredPizzerias = useMemo(() => {
        if (filterStatus === 'active') {
            return pizzerias.filter(p => p.isActive);
        }
        if (filterStatus === 'inactive') {
            return pizzerias.filter(p => !p.isActive);
        }
        return pizzerias;
    }, [pizzerias, filterStatus]);


    return (
        <div className="bg-background min-h-screen">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-extrabold text-textPrimary mb-6">Painel do Administrador</h1>

                <div className="mb-6 flex items-center gap-6 p-4 bg-white rounded-lg shadow">
                    <h3 className="text-md font-semibold text-textPrimary">Filtrar por status:</h3>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="statusFilter"
                                value="all"
                                checked={filterStatus === 'all'}
                                onChange={() => setFilterStatus('all')}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            Todos
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="statusFilter"
                                value="active"
                                checked={filterStatus === 'active'}
                                onChange={() => setFilterStatus('active')}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            Ativas
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="statusFilter"
                                value="inactive"
                                checked={filterStatus === 'inactive'}
                                onChange={() => setFilterStatus('inactive')}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                            />
                            Inativas
                        </label>
                    </div>
                </div>

                <div className="bg-surface rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b">
                         <h2 className="text-xl font-bold">Gerenciamento de Pizzarias ({filteredPizzerias.length})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="p-4">Pizzaria</th>
                                    <th scope="col" className="p-4 text-center">Status Loja</th>
                                    <th scope="col" className="p-4 text-center">Status Plataforma</th>
                                    <th scope="col" className="p-4 text-center">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPizzerias.map(pizzeria => (
                                    <PizzeriaRow key={pizzeria.id} pizzeria={pizzeria} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;