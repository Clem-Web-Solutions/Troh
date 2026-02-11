import { useState } from 'react';

interface Reserve {
    reserve_id: string;
    description: string;
    status: 'open' | 'resolved';
    severity: string;
    photo_url?: string;
}

interface ReserveListProps {
    reserves: Reserve[];
    onResolve: (reserveId: string) => Promise<void>;
}

export function ReserveList({ reserves, onResolve }: ReserveListProps) {
    const [resolving, setResolving] = useState<string | null>(null);

    const handleResolve = async (id: string) => {
        setResolving(id);
        await onResolve(id);
        setResolving(null);
    };

    return (
        <div className="reserves-container p-4">
            <h2 className="text-xl font-bold mb-4">Réserves</h2>
            <div className="space-y-4">
                {reserves.length === 0 && <p className="text-gray-500">Aucune réserve.</p>}
                {reserves.map(reserve => (
                    <div key={reserve.reserve_id} className={`reserve-item p-4 border rounded shadow ${reserve.status === 'resolved' ? 'bg-green-50' : 'bg-white'}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-lg">{reserve.description}</h3>
                                <div className="text-sm text-gray-600 mt-1">
                                    <p>Statut : <span className={`font-bold ${reserve.status === 'resolved' ? 'text-green-600' : 'text-red-600'}`}>
                                        {reserve.status === 'resolved' ? 'Résolue' : 'Ouverte'}
                                    </span></p>
                                    <p>Sévérité : {reserve.severity}</p>
                                    {reserve.photo_url && (
                                        <a href={reserve.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-xs">
                                            Voir photo
                                        </a>
                                    )}
                                </div>
                            </div>
                            {reserve.status !== 'resolved' && (
                                <button
                                    onClick={() => handleResolve(reserve.reserve_id)}
                                    disabled={resolving === reserve.reserve_id}
                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
                                >
                                    {resolving === reserve.reserve_id ? 'Analyse...' : 'Marquer résolue'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
