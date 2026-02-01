import { X, User, Mail, Phone, MapPin, Building, Globe } from 'lucide-react';
import { Button } from '../ui';
import { useState, useEffect } from 'react';

interface CreateClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: any) => Promise<any>;
}

const COUNTRY_CODES = [
    { code: 'FR', dial: '+33', flag: '🇫🇷' },
    { code: 'BE', dial: '+32', flag: '🇧🇪' },
    { code: 'CH', dial: '+41', flag: '🇨🇭' },
    { code: 'LU', dial: '+352', flag: '🇱🇺' },
    { code: 'MC', dial: '+377', flag: '🇲🇨' },
    { code: 'CA', dial: '+1', flag: '🇨🇦' },
    { code: 'US', dial: '+1', flag: '🇺🇸' },
    { code: 'GB', dial: '+44', flag: '🇬🇧' },
    { code: 'ES', dial: '+34', flag: '🇪🇸' },
    { code: 'IT', dial: '+39', flag: '🇮🇹' },
    { code: 'DE', dial: '+49', flag: '🇩🇪' },
];

export function CreateClientModal({ isOpen, onClose, onSubmit }: CreateClientModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Split address state
    const [tempAddress, setTempAddress] = useState({
        street: '',
        city: '',
        country: ''
    });

    const [phonePrefix, setPhonePrefix] = useState('+33');
    const [phoneNumber, setPhoneNumber] = useState('');

    const [tempPassword, setTempPassword] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                email: '',
                phone: '',
                address: ''
            });
            setTempAddress({
                street: '',
                city: '',
                country: ''
            });
            setPhonePrefix('+33');
            setPhoneNumber('');
            setTempPassword(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Construct final data
        const finalData = {
            ...formData,
            phone: `${phonePrefix} ${phoneNumber}`,
            address: `${tempAddress.street}, ${tempAddress.city}, ${tempAddress.country}`
        };

        try {
            if (onSubmit) {
                const result = await onSubmit(finalData);
                // If result contains tempPassword, use it. Otherwise just mark as "sent"
                if (result && result.tempPassword) {
                    setTempPassword(result.tempPassword);
                } else if (result) {
                    setTempPassword("sent");
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-600/40 backdrop-blur-sm animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl p-4 sm:p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 sm:mb-6 sticky top-0 bg-white z-10 pb-2">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-600">Nouveau Client</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>

                    {/* Success State */}
                    {tempPassword && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-2 text-green-800 font-semibold mb-2 text-sm sm:text-base">
                                <span>🎉 Client créé avec succès !</span>
                            </div>

                            {tempPassword !== "sent" ? (
                                <div className="space-y-2">
                                    <p className="text-xs sm:text-sm text-green-700">
                                        L'envoi automatique de l'email a échoué. Voici le mot de passe provisoire à communiquer au client :
                                    </p>
                                    <div className="bg-white border border-green-200 p-3 rounded font-mono text-center text-lg font-bold text-slate-700 select-all">
                                        {tempPassword}
                                    </div>
                                    <p className="text-xs text-slate-500 italic">
                                        Notez-le précieusement, il ne sera plus affiché ensuite.
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs sm:text-sm text-green-700 mb-3">
                                    Un email contenant les identifiants de connexion a été envoyé à <strong>{formData.email}</strong>.
                                </p>
                            )}

                            <Button type="button" className="w-full mt-3 sm:mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={onClose}>
                                Terminer
                            </Button>
                        </div>
                    )}

                    {!tempPassword && (
                        <>
                            {/* Personal Info */}
                            <div className="space-y-3 sm:space-y-4">
                                <h3 className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">Coordonnées</h3>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                        <div className="flex gap-2">
                                            <div className="relative w-[100px] shrink-0">
                                                <select
                                                    value={phonePrefix}
                                                    onChange={(e) => setPhonePrefix(e.target.value)}
                                                    className="w-full h-full px-2 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none bg-white text-sm"
                                                >
                                                    {COUNTRY_CODES.map((country) => (
                                                        <option key={country.code} value={country.dial}>
                                                            {country.flag} {country.dial}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                                placeholder="6 12 34 56 78"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* Address */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">Adresse & Compléments</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Ville</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={tempAddress.city}
                                                onChange={(e) => setTempAddress({ ...tempAddress, city: e.target.value })}
                                                className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                                placeholder="Paris"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Pays</label>
                                        <div className="relative">
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                value={tempAddress.country}
                                                onChange={(e) => setTempAddress({ ...tempAddress, country: e.target.value })}
                                                className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                                placeholder="France"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Adresse</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={tempAddress.street}
                                            onChange={(e) => setTempAddress({ ...tempAddress, street: e.target.value })}
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
