import { X, Building, User, Calendar, Euro, Briefcase } from 'lucide-react';
import { Button } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: any) => void;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        client: '',
        entité: 'RAW_DESIGN', // Default
        email: '',
        budget: '',
        currency: 'XOF', // Default CFA
        startDate: '',
        projectManagerId: '',
        projectTypeId: ''
    });

    const getEstimatedCFA = (amount: string, currency: string) => {
        if (!amount) return '';
        const val = parseFloat(amount);
        if (isNaN(val)) return '';

        if (currency === 'XOF') return ''; // No conversion needed

        // Fixed rates as per plan
        const rates: Record<string, number> = {
            'EUR': 655.957,
            'USD': 620, // Approx
            'CHF': 680  // Approx
        };

        const rate = rates[currency] || 1;
        const estimated = val * rate;

        return `${estimated.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA`;
    };
    const [projectManagers, setProjectManagers] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen) {
            // Fetch potential Project Managers (Admins) and Clients
            Promise.all([
                api.getUsers('admin'),
                api.getClients()
            ]).then(([admins, clientsData]) => {
                setProjectManagers(admins);
                setClients(clientsData);
            }).catch(console.error);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit?.(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-600/40 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl p-4 sm:p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white z-10 pb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-600">Nouveau Projet</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>

                    {/* Client Info */}
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">Informations Client</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Client</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        value={formData.client}
                                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                        className="w-full pl-9 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none bg-white"
                                        required
                                    >
                                        <option value="">Sélectionner un client...</option>
                                        {clients.map(client => (
                                            <option key={client.id} value={client.id}>{client.name} (ID: {client.id})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                    placeholder="Auto-rempli..."
                                    readOnly={!!formData.client} // Make read-only if client selected, or auto-fill
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Project Info */}
                    <div className="space-y-3 sm:space-y-4">
                        <h3 className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">Détails Projet</h3>

                        {/* Project Manager Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Entité</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        className="w-full pl-9 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none bg-white"
                                        value={formData.entité}
                                        onChange={(e) => setFormData({ ...formData, entité: e.target.value })}
                                    >
                                        <option value="RAW_DESIGN">RAW DESIGN</option>
                                        <option value="MEEREO_PROJECT">MEEREO PROJECT</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Type de Mission</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        className="w-full pl-9 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none bg-white"
                                        value={formData.projectTypeId}
                                        onChange={(e) => setFormData({ ...formData, projectTypeId: e.target.value })}
                                        required
                                    >
                                        <option value="">Sélectionner un type...</option>
                                        {formData.entité === 'RAW_DESIGN' ? (
                                            <>
                                                <option value="ARCHI_MISSION_COMPLETE">Mission Complète (Conception + Suivi)</option>
                                                <option value="ARCHI_CONCEPTION">Conception Seule</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value="CONSTRUCTION_CLE_EN_MAIN">Construction Clé en Main</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Chef de Projet</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        className="w-full pl-9 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none bg-white"
                                        value={formData.projectManagerId}
                                        onChange={(e) => setFormData({ ...formData, projectManagerId: e.target.value })}
                                    >
                                        <option value="">Sélectionner...</option>
                                        {projectManagers.map(user => (
                                            <option key={user.id} value={user.id}>{user.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nom du Projet</label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full pl-9 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                    placeholder="ex: Rénovation Villa"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            {/* Budget Row */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Budget</label>
                                <div className="flex gap-2">
                                    <div className="relative w-1/3 sm:w-1/4">
                                        <select
                                            value={formData.currency}
                                            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none bg-white"
                                        >
                                            <option value="XOF">CFA</option>
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                            <option value="CHF">CHF</option>
                                        </select>
                                    </div>
                                    <div className="relative flex-1">
                                        <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="number"
                                            value={formData.budget}
                                            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                            className="w-full pl-9 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                            placeholder="Montant..."
                                        />
                                    </div>
                                </div>
                                {/* Conversion Helper */}
                                {formData.currency !== 'XOF' && formData.budget && (
                                    <p className="text-xs text-slate-500 italic">
                                        Environ {getEstimatedCFA(formData.budget, formData.currency)}
                                    </p>
                                )}
                            </div>

                            {/* Date Row */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Début Estimé</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full pl-9 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                        <Button type="button" variant="secondary" className="flex-1 order-2 sm:order-1" onClick={onClose}>Annuler</Button>
                        <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 order-1 sm:order-2">Créer le projet</Button>
                    </div>

                </form>
            </div>
        </div>
    );
}
