import { useState } from 'react';
import { Card, CardContent, Button } from '../components/ui';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface LoginPageProps {
    onLogin: (user: any, token: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

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
                                <label className="text-sm font-medium text-slate-700">Mot de passe</label>
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
                    </CardContent>
                </Card>

                <p className="text-center text-sm text-slate-400 mt-4">
                    Pas encore de compte ? Contactez votre administrateur.
                </p>

                <div className="flex items-center justify-center gap-8 mt-8">
                    <img src="/logo_meereo.png" alt="Meereo" className="h-32 sm:h-40 w-auto" />
                    <img src="/ruzibiza.jpeg" alt="Ruzibiza" className="h-28 sm:h-36 w-auto" />
                </div>
            </div>
        </div>
    );
}
