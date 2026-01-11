import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { Save, Bell, Lock, Globe } from 'lucide-react';

export function AdminSettingsPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Paramètres</h1>
                <p className="text-slate-500 mt-1">Configuration générale de la plateforme.</p>
            </div>

            <div className="grid gap-6">

                {/* Notifications */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 py-4 border-b border-slate-100">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Notifications</CardTitle>
                            <p className="text-sm text-slate-500 font-normal">Gérez les alertes automatiques envoyées aux clients.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        {['Confirmation de paiement', 'Passage de phase', 'Nouveau document disponible', 'Message reçu'].map((item) => (
                            <div key={item} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700">{item}</span>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500 cursor-pointer">
                                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Security */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 py-4 border-b border-slate-100">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Sécurité & Accès</CardTitle>
                            <p className="text-sm text-slate-500 font-normal">Gestion des identifiants administrateurs.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Button variant="secondary">Modifier le mot de passe</Button>
                    </CardContent>
                </Card>

                {/* General */}
                <Card>
                    <CardHeader className="flex flex-row items-center gap-4 py-4 border-b border-slate-100">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base">Informations Entreprise</CardTitle>
                            <p className="text-sm text-slate-500 font-normal">Coordonnées affichées sur l'espace client.</p>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nom de l'entreprise</label>
                                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" defaultValue="TROH Immo" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email de contact</label>
                                <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" defaultValue="contact@troh-immo.fr" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button className="gap-2 bg-slate-900 text-white">
                                <Save className="w-4 h-4" /> Enregistrer
                            </Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
