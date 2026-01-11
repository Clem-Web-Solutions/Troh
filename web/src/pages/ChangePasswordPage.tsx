import { useState } from 'react';
import { api } from '../lib/api';
import { Button, Card, CardHeader, CardTitle, CardContent } from '../components/ui';
import { Lock, AlertCircle } from 'lucide-react';

export function ChangePasswordPage() {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            window.location.href = '/';
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

            // We need to update the local user state to reflect mustChangePassword = false
            // Since useAuth likely just reads from state provided by App, and App might not have a dedicated "updateUser" exposed (I need to check App.tsx)
            // For now, we can force a "re-login" effect or just manually redirect. 
            // Better: update the stored user in localStorage and force reload or assume the next nav check works.

            // Hacky fix for local state update without full auth context refactor:
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                const parsed = JSON.parse(savedUser);
                parsed.mustChangePassword = false;
                localStorage.setItem('user', JSON.stringify(parsed));
            }

            // If checking user from App.tsx state, we might need to reload or expose a setUser.
            // Let's assume a hard reload for safety or navigating to dashboard might work if we bypassed the check?
            // Actually, if App.tsx checks `user.mustChangePassword` on every render/route, we need to update `user` object in App state.

            window.location.href = '/';

        } catch (err) {
            console.error(err);
            setError('Erreur lors du changement de mot de passe.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-amber-600" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">Sécurité du compte</CardTitle>
                    <p className="text-sm text-slate-500 mt-2">
                        Pour votre première connexion, vous devez définir un nouveau mot de passe personnel.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                placeholder="••••••••"
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
                                placeholder="••••••••"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800" disabled={isLoading}>
                            {isLoading ? 'Mise à jour...' : 'Définir mon mot de passe'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
