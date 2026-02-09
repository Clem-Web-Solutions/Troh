import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Users, Briefcase, Activity, FileText, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function AdminDashboard() {
    const [stats, setStats] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [projectCount, setProjectCount] = useState<string>('-');
    const [clientCount, setClientCount] = useState<string>('-');

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [recentActivities, activityStats, projects, clients] = await Promise.all([
                    api.getRecentActivities(),
                    api.getActivityStats(),
                    api.getProjects(),
                    api.getClients()
                ]);

                setActivities(recentActivities);
                setStats(activityStats.map((s: any) => ({
                    date: new Date(s.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                    count: s.count
                })));
                setProjectCount(projects.length.toString());
                setClientCount(clients.length.toString());

            } catch (error) {
                console.error("Dashboard data load failed", error);
            }
        };
        loadDashboardData();
    }, []);

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'PROJECT_CREATED': return <Briefcase className="w-4 h-4 text-red-600" />;
            case 'PHASE_COMPLETED': return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
            case 'DOCUMENT_UPLOADED': return <FileText className="w-4 h-4 text-orange-600" />;
            default: return <Activity className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-600 tracking-tight">Tableau de bord</h1>
                <p className="text-sm sm:text-base text-slate-500 mt-1">Vue synthétique de l'activité.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Projets Actifs</CardTitle>
                        <Briefcase className="w-4 h-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-600">{projectCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Total Projets</p>
                    </CardContent>
                </Card>
                {/* Other cards remain simple placeholders for now as requested or can be wired similarly if more data endpoints existed */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Clients</CardTitle>
                        <Users className="w-4 h-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-600">{clientCount}</div>
                        <p className="text-xs text-slate-500 mt-1">Clients inscrits</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Activités Récentes</CardTitle>
                        <Activity className="w-4 h-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-600">{activities.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Cette semaine</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Activity Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Activité de la plateforme</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] sm:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={300}>
                                <AreaChart data={stats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#FF9C38" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#FF9C38" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        cursor={{ stroke: '#FF9C38', strokeWidth: 1 }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke="#FF9C38" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Distribution Chart (Ultimate Prompt) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Répartition Financière</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[250px] sm:h-[300px] w-full flex justify-center items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[
                                            { name: 'Payé', value: 45000 },
                                            { name: 'En attente', value: 25000 },
                                            { name: 'Reste', value: 30000 },
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#22c55e" /> {/* Paid */}
                                        <Cell fill="#f59e0b" /> {/* Pending */}
                                        <Cell fill="#94a3b8" /> {/* Main/Rest */}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Feed */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base sm:text-lg">Dernières notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 sm:space-y-6">
                            {activities.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">Aucune activité récente.</p>
                            ) : (
                                activities.map((activity) => (
                                    <div key={activity.id} className="flex gap-3 sm:gap-4">
                                        <div className="mt-1">
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                                                {getActivityIcon(activity.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <p className="text-sm font-medium leading-none text-slate-600 truncate">{activity.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                                                <span>{new Date(activity.createdAt).toLocaleTimeString()}</span>
                                                {activity.project && (
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 truncate max-w-[120px]">
                                                        {activity.project.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
