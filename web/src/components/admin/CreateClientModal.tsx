import { X, User, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '../ui';
import { useState } from 'react';

interface CreateClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: any) => Promise<any>;
}

export function CreateClientModal({ isOpen, onClose, onSubmit }: CreateClientModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });
    const [tempPassword, setTempPassword] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Since we need to show the temp password, we need to handle the API call here if onSubmit doesn't return it
        // But typically onSubmit is passed from parent. 
        // Let's assume the parent (AdminClientsPage) handles creation and we might need to change how this works.
        // Or, we change the parent to pass the created user back?
        // Actually, cleaner is to let CreateClientModal handle the call if it needs to show the result.
        // BUT, looking at usage in `AdminClientsPage`: `<CreateClientModal ... onSubmit={async (data) => { await api.createClient(data); ... }} />`
        // We should move the API call HERE or modify onSubmit to return the result.

        try {
            if (onSubmit) {
                // We need the result.
                // Let's modify the prop signature to allow returning data?
                // Or better: Assume onSubmit returns the response object if it's async.
                const result = await onSubmit(formData);
                if (result && result.user && result.user.tempPassword) {
                    setTempPassword(result.user.tempPassword);
                } else {
                    // Fallback or just close if no temp pass (shouldn't happen with new backend)
                    onClose();
                }
            }
        } catch (error) {
            console.error(error);
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
            <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl p-6 m-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-600">Nouveau Client</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>

                    {/* Success State - Temp Password */}
                    {tempPassword && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-red-800 font-semibold mb-2">
                                <span className="text-xl">🎉 Client créé avec succès !</span>
                            </div>
                            <p className="text-sm text-red-700 mb-3">
                                Voici le mot de passe provisoire à communiquer au client. Il devra le changer lors de sa première connexion.
                            </p>
                            <div className="bg-white border border-red-200 rounded p-3 flex items-center justify-between">
                                <code className="text-lg font-mono font-bold text-slate-800 tracking-wider select-all">{tempPassword}</code>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => navigator.clipboard.writeText(tempPassword)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    Copier
                                </Button>
                            </div>
                            <Button type="button" className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white" onClick={onClose}>
                                Terminer
                            </Button>
                        </div>
                    )}

                    {!tempPassword && (
                        <>
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Coordonnées</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nom Complet / Raison Sociale</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                            placeholder="ex: M. et Mme. Martin"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                                placeholder="client@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Téléphone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                                placeholder="06 12 34 56 78"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* Address */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Adresse & Compléments</h3>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Adresse</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                            placeholder="123 rue de la Paix"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Annuler</Button>
                                <Button type="submit" className="flex-1 bg-slate-600 hover:bg-slate-800">Ajouter le client</Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
