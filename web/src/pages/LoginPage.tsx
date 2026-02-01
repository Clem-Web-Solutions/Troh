import { useState } from 'react';
import { Card, CardContent, Button } from '../components/ui';
import { Lock, Mail, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface LoginPageProps {
    onLogin: (user: any, token: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [view, setView] = useState<'login' | 'forgot-email' | 'forgot-reset'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [otpCode, setOtpCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const data = await api.login({ email, password });
            onLogin(data.user, data.token);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await api.requestPasswordReset(email);
            setView('forgot-reset');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError("Les mots de passe ne correspondent pas");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await api.resetPassword({ email, code: otpCode, newPassword });
            setResetSuccess(true);
            setTimeout(() => {
                setView('login');
                setResetSuccess(false);
                setPassword('');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrength = (pass: string) => {
        if (pass.length === 0) return 0;
        if (pass.length < 6) return 1;
        if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) return 3;
        return 2;
    };

    const strength = getPasswordStrength(newPassword);
    const strengthColor = ['bg-slate-200', 'bg-red-500', 'bg-orange-500', 'bg-green-500'][strength];
    const strengthLabel = ['Faible', 'Faible', 'Moyen', 'Fort'][strength];

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-3 sm:p-4 relative">
            <img
                src="/meereo.png"
                alt="Construction worker"
                className="absolute left-0 right-0 w-full h-auto max-w-screen-2xl mx-auto hidden sm:block"
                style={{ zIndex: 0, top: '-50px' }}
            />

            <div className="w-full max-w-md relative" style={{ zIndex: 10 }}>

                <Card className="border-slate-200 shadow-xl">
                    <CardContent className="p-5 sm:p-6 lg:p-8">

                        {/* VIEW: LOGIN */}
                        {view === 'login' && (
                            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                {resetSuccess && (
                                    <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2 mb-4">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Mot de passe modifié avec succès ! Connectez-vous.
                                    </div>
                                )}

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                                            placeholder="nom@exemple.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-slate-700">Mot de passe</label>
                                        <button
                                            type="button"
                                            onClick={() => setView('forgot-email')}
                                            className="text-xs text-sky-500 hover:text-sky-600"
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-sky-500 hover:bg-blue-500 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Se connecter'}
                                </Button>
                            </form>
                        )}

                        {/* VIEW: FORGOT EMAIL */}
                        {view === 'forgot-email' && (
                            <form onSubmit={handleRequestReset} className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-700">Mot de passe oublié</h3>
                                    <p className="text-sm text-slate-500">Entrez votre email pour recevoir un code.</p>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-9 px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                                        placeholder="nom@exemple.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-slate-800 hover:bg-slate-900 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Envoyer le code'}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setView('login')}
                                    className="w-full text-center text-sm text-slate-500 hover:text-slate-700"
                                >
                                    Retour à la connexion
                                </button>
                            </form>
                        )}

                        {/* VIEW: FORGOT RESET */}
                        {view === 'forgot-reset' && (
                            <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="text-center mb-4">
                                    <h3 className="text-lg font-bold text-slate-700">Réinitialisation</h3>
                                    <p className="text-sm text-slate-500">Vérifiez votre boîte mail ({email}).</p>
                                </div>

                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        {error}
                                    </div>
                                )}

                                {resetSuccess ? (
                                    <div className="flex flex-col items-center justify-center py-8">
                                        <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-2" />
                                        <p className="text-green-600 font-medium">Redirection...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Code reçu (6 chiffres)</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all text-center tracking-widest font-mono text-lg"
                                                placeholder="123456"
                                                value={otpCode}
                                                onChange={(e) => setOtpCode(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                            />
                                            {/* Strength Bar */}
                                            {newPassword && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(strength / 3) * 100}%` }} />
                                                    </div>
                                                    <span className="text-xs text-slate-500 min-w-[40px] text-right">{strengthLabel}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">Confirmer le mot de passe</label>
                                            <input
                                                type="password"
                                                required
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Changer le mot de passe'}
                                        </Button>
                                    </>
                                )}
                            </form>
                        )}

                    </CardContent>
                </Card>

                {view === 'login' && (
                    <div className="mt-8">
                        <p className="text-center text-sm text-slate-400">
                            Pas encore de compte ? Contactez votre administrateur.
                        </p>
                        <div className="flex items-center justify-center gap-8 mt-4">
                            <img src="/logo_meereo.png" alt="Meereo" className="h-32 sm:h-40 w-auto" />
                            <img src="/ruzibiza.jpeg" alt="Ruzibiza" className="h-28 sm:h-36 w-auto" />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
