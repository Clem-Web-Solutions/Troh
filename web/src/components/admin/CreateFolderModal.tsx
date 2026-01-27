import { X, FolderPlus } from 'lucide-react';
import { Button } from '../ui';
import { useState } from 'react';
import { api } from '../../lib/api';

interface CreateFolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    type: 'DOCUMENTS' | 'PHOTOS';
    onSuccess: () => void;
}

export function CreateFolderModal({ isOpen, onClose, projectId, type, onSuccess }: CreateFolderModalProps) {
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.createFolder({
                projectId,
                name,
                date,
                type
            });
            onSuccess();
            onClose();
            setName('');
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-600/40 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl p-6 m-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-600 flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-red-600" />
                        Nouveau Dossier ({type === 'PHOTOS' ? 'Album' : 'Documents'})
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Nom du dossier</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                            placeholder={type === 'PHOTOS' ? "ex: Chantier Cuisine" : "ex: Factures 2024"}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Date associée</label>
                        <input
                            type="date"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Annuler</Button>
                        <Button type="submit" disabled={isLoading} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                            {isLoading ? 'Création...' : 'Créer'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
