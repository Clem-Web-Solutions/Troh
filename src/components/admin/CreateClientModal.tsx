import { X, User, Mail, Phone, MapPin, Building } from 'lucide-react';
import { Button } from '../ui';

interface CreateClientModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateClientModal({ isOpen, onClose }: CreateClientModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl p-6 m-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Nouveau Client</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form className="space-y-6">

                    {/* Personal Info */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Coordonnées</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nom Complet / Raison Sociale</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input type="text" className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none" placeholder="ex: M. et Mme. Martin" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="email" className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none" placeholder="client@email.com" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Téléphone</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="tel" className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none" placeholder="06 12 34 56 78" />
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
                                <input type="text" className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none" placeholder="123 rue de la Paix" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Type de Client</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none bg-white">
                                        <option>Particulier</option>
                                        <option>Professionnel (SCI, Entreprise)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Source</label>
                                <select className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white">
                                    <option>Site Web</option>
                                    <option>Recommandation</option>
                                    <option>Réseaux Sociaux</option>
                                    <option>Autre</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Annuler</Button>
                        <Button type="button" className="flex-1 bg-slate-900 hover:bg-slate-800">Ajouter le client</Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
