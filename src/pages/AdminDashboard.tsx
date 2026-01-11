import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { TrendingUp, Users, Briefcase, Activity } from 'lucide-react';

export function AdminDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tableau de bord</h1>
                <p className="text-slate-500 mt-1">Vue synthétique de l'activité.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Projets Actifs</CardTitle>
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">12</div>
                        <p className="text-xs text-slate-500 mt-1">+2 depuis le mois dernier</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Clients</CardTitle>
                        <Users className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">48</div>
                        <p className="text-xs text-slate-500 mt-1">+12% de croissance</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Chiffre d'Affaires</CardTitle>
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">1.2M €</div>
                        <p className="text-xs text-slate-500 mt-1">Annuel en cours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Taux de Satisfaction</CardTitle>
                        <Activity className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">98%</div>
                        <p className="text-xs text-slate-500 mt-1">Basé sur 24 retours</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="h-64 flex items-center justify-center border-dashed">
                    <p className="text-slate-400">Graphique d'activité (Placeholder)</p>
                </Card>
                <Card className="h-64 flex items-center justify-center border-dashed">
                    <p className="text-slate-400">Dernières notifications (Placeholder)</p>
                </Card>
            </div>

        </div>
    );
}
