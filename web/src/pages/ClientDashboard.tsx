import { ProjectTimeline } from '../components/client/ProjectTimeline';
import { FinancePage } from './FinancePage';
import { DocumentGrid } from '../components/client/DocumentGrid';
import { SiteGallery } from '../components/client/SiteGallery';
import { ClientNotifications } from '../components/client/ClientNotifications';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Loader2, LayoutDashboard, CalendarDays, FolderOpen, Image as ImageIcon, Menu, LogOut, ArrowRight, Wallet, Hammer } from 'lucide-react';
import { cn, Button, Card, CardHeader, CardTitle, CardContent } from '../components/ui';

type View = 'overview' | 'planning' | 'finance' | 'documents' | 'photos';

interface ClientDashboardProps {
    onLogout?: () => void;
}

export function ClientDashboard({ onLogout }: ClientDashboardProps) {
    const [project, setProject] = useState<any>(null);
    const [finance, setFinance] = useState<any>(null);
    const [phases, setPhases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeView, setActiveView] = useState<View>('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const projects = await api.getProjects();
                if (projects && projects.length > 0) {
                    const mainProject = projects[0];
                    setProject(mainProject);
                    const [financeData, phasesData] = await Promise.all([
                        api.getFinance(mainProject.id).catch(() => null),
                        api.getPhases(mainProject.id).catch(() => [])
                    ]);
                    // Sort phases by Order, then Date, then ID
                    const sortedPhases = phasesData.sort((a: any, b: any) => {
                        const orderA = a.order || 0;
                        const orderB = b.order || 0;
                        if (orderA !== orderB) return orderA - orderB;

                        const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
                        const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
                        if (dateA !== dateB) return dateA - dateB;

                        return a.id - b.id;
                    });

                    setFinance(financeData);
                    setPhases(sortedPhases);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    if (!project) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
            <h2 className="text-2xl font-bold text-slate-800">Aucun projet actif</h2>
            <p className="text-slate-500">Contactez votre administrateur.</p>
        </div>
    );

    // Derived Data
    // Derived Data
    // Normalize status check (DB is lowercase 'pending', App uses 'Pending')
    const currentPhaseIndex = phases.findIndex((p: any) => p.status.toLowerCase() === 'pending');
    const displayPhaseIndex = currentPhaseIndex === -1 ? phases.length - 1 : currentPhaseIndex;
    const currentPhase = phases[displayPhaseIndex] || { name: 'En attente' };
    const progress = phases.length > 0 ? Math.round((phases.filter((p: any) => p.status.toLowerCase() === 'completed').length / phases.length) * 100) : 0;

    const MENU_ITEMS = [
        { id: 'overview', label: 'Vue d\'ensemble', icon: LayoutDashboard },
        { id: 'planning', label: 'Planning', icon: CalendarDays },
        { id: 'finance', label: 'Finances', icon: Wallet },
        { id: 'documents', label: 'Documents', icon: FolderOpen },
        { id: 'photos', label: 'Photos', icon: ImageIcon },
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        {/* Welcome Banner */}
                        <div className="bg-slate-600 rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h1 className="text-3xl font-bold mb-2">Bonjour, {project.client?.name || 'Client'}</h1>
                                <p className="text-slate-300 max-w-xl">
                                    Bienvenue sur votre espace. Votre projet <strong className="text-white">{project.name}</strong> avance bien.
                                    Voici ce qu'il se passe aujourd'hui.
                                </p>
                            </div>
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-red-500/10 rotate-12 transform translate-x-10" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Status Card */}
                            <Card className="lg:col-span-2 border-slate-200">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base font-medium text-slate-500">Phase Actuelle</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-2xl font-bold text-slate-600 flex items-center gap-3">
                                            {currentPhase.name}
                                            <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                                En cours
                                            </span>
                                        </h2>
                                        <span className="text-2xl font-bold text-slate-300">{progress}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className="mt-6 flex gap-3">
                                        <Button onClick={() => setActiveView('planning')} className="gap-2">
                                            Voir le planning complet <ArrowRight className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notifications Widget */}
                            <ClientNotifications />
                        </div>

                        {/* Recent Activity / Quick Stats Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Finance Widget */}
                            <Card className="border-slate-200 hover:border-red-200 cursor-pointer transition-colors group" onClick={() => setActiveView('finance')}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Budget Consommé</p>
                                            <h3 className="text-2xl font-bold text-slate-600">
                                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(finance?.paidAmount || 0)}
                                            </h3>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-red-50 transition-colors">
                                            <Wallet className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-slate-400">
                                        Sur un total de {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(finance?.totalAmount || 0)}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Documents Widget */}
                            <Card className="border-slate-200 hover:border-blue-200 cursor-pointer transition-colors group" onClick={() => setActiveView('documents')}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-slate-500 mb-1">Derniers Documents</p>
                                            <h3 className="text-2xl font-bold text-slate-600">
                                                {project.documents?.length || 0}
                                            </h3>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                                            <FolderOpen className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="mt-4 text-xs text-slate-400">
                                        Plans, Devis, Factures...
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Widget */}
                            <Card className="border-slate-200 bg-slate-600 text-white">
                                <CardContent className="p-6 flex flex-col h-full justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                                            {project.projectManager?.name.charAt(0) || 'CP'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium opacity-90">{project.projectManager?.name || 'Chef de Projet'}</p>
                                            <p className="text-xs opacity-60">Troh Immo</p>
                                        </div>
                                    </div>
                                    <Button variant="secondary" size="sm" className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border-none">
                                        Envoyer un message
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );
            case 'planning': return <ProjectTimeline phases={phases} />;
            case 'finance': return <FinancePage />;
            case 'documents': return <DocumentGrid projectId={project.id} />;
            case 'photos': return <SiteGallery projectId={project.id} />;
            default: return null;
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50/50">
            {/* Sidebar Navigation */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
                !isMobileMenuOpen && "-translate-x-full"
            )}>
                <div className="p-6 flex-1">
                    <div className="flex items-center gap-2 mb-8 text-red-600 font-bold text-xl">
                        <Hammer className="w-6 h-6" />
                        <span>Espace Client</span>
                    </div>
                    <nav className="space-y-1">
                        {MENU_ITEMS.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => { setActiveView(item.id as View); setIsMobileMenuOpen(false); }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    activeView === item.id
                                        ? "bg-slate-600 text-white shadow-md shadow-slate-600/20"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-600"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Logout Button */}
                <div className="p-6 border-t border-slate-100">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Déconnexion
                    </button>
                </div>
                {/* Mobile Close Overlay */}
                <div className="absolute top-4 right-4 lg:hidden">
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsMobileMenuOpen(false)}>
                        <LogOut className="w-5 h-5" />
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header Trigger */}
                <div className="lg:hidden p-4 flex items-center gap-4 bg-white border-b border-slate-200">
                    <Button variant="ghost" className="h-10 w-10 p-0" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </Button>
                    <span className="font-semibold text-slate-600">Troh Immo</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto h-full">
                        {renderContent()}


                    </div>
                </div>
            </main>

            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-600/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
