import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Lock, AlertCircle } from 'lucide-react';

export function ChangePasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(storedUser);

        if (password.length < 6) {
            setError('Le mot de passe doit faire au moins 6 caractères.');
            return;
        }

        if (password !== confirm) {
            setError('Les mots de passe ne correspondent pas.');
            return;
        }

        setIsLoading(true);
        try {
            if (!user?.id) throw new Error("No user");

            await api.changePassword(user.id, password);

            // Update the stored user to reflect mustChangePassword = false
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                parsed.mustChangePassword = false;
                localStorage.setItem('user', JSON.stringify(parsed));
            }

            // Redirect to dashboard
            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/client/dashboard');
            }

        } catch (err) {
            console.error(err);
            setError('Erreur lors du changement de mot de passe.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-4">
            <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="text-center pb-2 px-4 sm:px-6">
                    <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                        <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-600">Sécurité du compte</CardTitle>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2">
                        Pour votre première connexion, vous devez définir un nouveau mot de passe personnel.
                    </p>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Nouveau mot de passe</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                placeholder="•••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                required
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                                placeholder="•••••••"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-slate-600 hover:bg-slate-800" disabled={isLoading}>
                            {isLoading ? 'Mise à jour...' : 'Définir mon mot de passe'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
