import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { Save, Bell, Lock, Globe } from 'lucide-react';

import { useState } from 'react';

import { InviteAdminModal } from '../components/admin/InviteAdminModal';

export function AdminSettingsPage() {
    const [activeTab, setActiveTab] = useState<'notifications' | 'security' | 'company'>('notifications');
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <InviteAdminModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-600 tracking-tight">Paramètres</h1>
                <p className="text-slate-500 mt-1">Configuration de l'application Meereo Project.</p>
            </div>

            <div className="border-b border-slate-200">
                <div className="flex items-center gap-8">
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notifications' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'security' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Sécurité & Équipe
                    </button>
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'company' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Informations Entreprise
                    </button>
                </div>
            </div>

            <div className="max-w-3xl">
                {activeTab === 'notifications' && (
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
                                    <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-red-500 cursor-pointer">
                                        <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'security' && (
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 py-4 border-b border-slate-100">
                            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-base">Sécurité & Équipe</CardTitle>
                                <p className="text-sm text-slate-500 font-normal">Gestion des accès et des administrateurs.</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-slate-600">Administrateurs Actifs</h3>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">A</div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-600">Admin Principal</p>
                                            <p className="text-xs text-slate-500">admin@meereo.com</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded">Moi</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    className="w-full border border-dashed border-slate-300 text-slate-500 hover:text-slate-600 hover:border-slate-600"
                                    onClick={() => setIsInviteModalOpen(true)}
                                >
                                    + Inviter un nouvel administrateur
                                </Button>
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <Button variant="secondary" className="w-full">Modifier mon mot de passe</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'company' && (
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
                                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" defaultValue="Meereo" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email de contact</label>
                                    <input className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" defaultValue="contact@meereo.com" />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-sm font-medium">IBAN</label>
                                    <input
                                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono"
                                        placeholder="FR76 3000 ..."
                                        defaultValue="FR76 3000 3000 1234 5678 9012 34"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button className="gap-2 bg-slate-600 text-white">
                                    <Save className="w-4 h-4" /> Enregistrer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
