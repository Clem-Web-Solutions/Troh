import { Button } from '../ui';
import { useState } from 'react';
import { Mail, User, Check, Copy, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface InviteAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function InviteAdminModal({ isOpen, onClose, onSuccess }: InviteAdminModalProps) {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const fullName = `${firstName} ${lastName}`.trim();
            const response = await api.createAdmin({ name: fullName, email });
            setTempPassword(response.user.tempPassword);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || "Erreur lors de la création de l'administrateur");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyParams = () => {
        if (!tempPassword) return;
        navigator.clipboard.writeText(`Email: ${email}\nMot de passe: ${tempPassword}`);
        // Could show a toast here
    };

    const handleClose = () => {
        if (tempPassword && onSuccess) {
            onSuccess();
        }
        setTempPassword(null);
        setEmail('');
        setFirstName('');
        setLastName('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-slate-600">Inviter un administrateur</h2>
                    <button onClick={handleClose} className="text-slate-400 hover:text-slate-500">✕</button>
                </div>

                <div className="p-6">
                    {tempPassword ? (
                        <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8" />
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-slate-600">Invitation envoyée !</h3>
                                <p className="text-slate-500 mt-2 text-sm">
                                    Le compte administrateur a été créé. Transmettez ces identifiants à votre collaborateur.
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-3 relative">
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email</p>
                                    <p className="font-mono text-sm text-slate-600 select-all">{email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Mot de passe provisoire</p>
                                    <p className="font-mono text-lg font-bold text-slate-600 select-all tracking-wide">{tempPassword}</p>
                                </div>

                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={handleCopyParams}
                                >
                                    <Copy className="w-4 h-4 mr-1" /> Copier
                                </Button>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 text-left">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                <p className="text-xs text-amber-800">
                                    Le nouvel administrateur devra changer ce mot de passe dès sa première connexion.
                                </p>
                            </div>

                            <Button onClick={handleClose} className="w-full bg-slate-600 hover:bg-slate-800">
                                Terminer
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Prénom</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Jean"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Nom</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="Dupont"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Email professionnel</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        required
                                        type="email"
                                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                        placeholder="jean.dupont@meereo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}

                            <div className="pt-2">
                                <Button type="submit" className="w-full bg-slate-600 hover:bg-slate-800" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    Envoyer l'invitation
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
