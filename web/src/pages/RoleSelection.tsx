import { Shield, User } from 'lucide-react';
import { Card, CardContent } from '../components/ui';

interface RoleSelectionProps {
    onSelectRole: (role: 'client' | 'admin') => void;
}

export function RoleSelection({ onSelectRole }: RoleSelectionProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

                <div className="text-center">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">
                        <span className="text-emerald-600">Meereo</span>
                    </h1>
                    <p className="text-slate-500">Bienvenue. Veuillez sélectionner votre espace de connexion.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Client Card */}
                    <Card
                        className="group relative overflow-hidden cursor-pointer hover:border-emerald-500 hover:shadow-xl transition-all duration-300"
                        onClick={() => onSelectRole('client')}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <User className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Espace Client</h2>
                            <p className="text-slate-500">
                                Suivez l'avancement de votre projet, consultez vos documents et gérez vos paiements.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Admin Card */}
                    <Card
                        className="group relative overflow-hidden cursor-pointer hover:border-slate-800 hover:shadow-xl transition-all duration-300"
                        onClick={() => onSelectRole('admin')}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="h-20 w-20 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Espace Administrateur</h2>
                            <p className="text-slate-500">
                                Gérez les projets, mettez à jour les statuts et validez les étapes clés.
                            </p>
                        </CardContent>
                    </Card>

                </div>

            </div>
        </div>
    );
}
