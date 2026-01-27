import { useState } from 'react';
import { Card, CardContent, Button } from '../components/ui';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

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
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erreur de connexion');
            }

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
                className="absolute left-0 right-0 w-full h-auto max-w-6xl mx-auto hidden sm:block"
                style={{ zIndex: 0, top: '-50px' }}
            />
            
            <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 flex items-center gap-2 sm:gap-4" style={{ zIndex: 10 }}>
                <img src="/logo_meereo.png" alt="Meereo" className="h-16 sm:h-20 lg:h-28 w-auto" />
                <img src="/ruzibiza.jpeg" alt="Ruzibiza" className="h-14 sm:h-16 lg:h-24 w-auto" />
            </div>
            
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
            </div>
        </div>
    );
}
