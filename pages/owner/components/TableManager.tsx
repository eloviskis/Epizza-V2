import React, { useState } from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import { Table } from '../../../types';
import ImageWithFallback from '../../../components/ImageWithFallback';

const TableCard: React.FC<{ table: Table }> = ({ table }) => {
    const { updateTableStatus, setTransientError } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const isOccupied = table.status === 'occupied';

    const toggleStatus = async () => {
        setIsLoading(true);
        const result = await updateTableStatus(table.id, isOccupied ? 'free' : 'occupied');
        setIsLoading(false);
        if (!result.success && !result.isNetworkError) {
            setTransientError(result.message || 'Erro ao atualizar status da mesa.');
        }
    }

    return (
        <div className={`p-4 rounded-lg shadow border-2 text-center transition-colors ${isOccupied ? 'bg-red-100 border-red-300' : 'bg-green-100 border-green-300'}`}>
            <p className="font-bold text-lg text-textPrimary">Mesa {table.number}</p>
            <ImageWithFallback src={table.qrCodeUrl} alt={`QR Code for Table ${table.number}`} className="w-24 h-24 mx-auto my-2 rounded-md" />
            <p className={`font-semibold ${isOccupied ? 'text-red-600' : 'text-green-600'}`}>{isOccupied ? 'Ocupada' : 'Livre'}</p>
            <button 
                onClick={toggleStatus}
                disabled={isLoading}
                className="mt-2 text-sm font-semibold text-primary hover:underline disabled:text-gray-400 disabled:no-underline"
            >
                {isLoading ? 'Alterando...' : 'Alterar Status'}
            </button>
        </div>
    )
}

const TableManager: React.FC = () => {
    const { tables } = useAppContext();

    return (
        <div>
            <h2 className="text-2xl font-bold text-textPrimary mb-6">Gerenciamento de Mesas</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {tables.map(table => (
                    <TableCard key={table.id} table={table} />
                ))}
            </div>
        </div>
    );
};

export default TableManager;