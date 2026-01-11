import { UploadConsole } from '../components/admin/UploadConsole';
import { ProjectDocuments } from '../components/admin/ProjectDocuments';
import { PhaseControl } from '../components/admin/PhaseControl';
import { FinanceForm } from '../components/admin/FinanceForm';
import { Button, Badge } from '../components/ui';
import { ArrowLeft, Calendar, User, Building, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AdminProjectDetailsPageProps {
    projectId: string;
    onBack: () => void;
}

export function AdminProjectDetailsPage({ projectId, onBack }: AdminProjectDetailsPageProps) {
    const [project, setProject] = useState<any>(null);
    const [finance, setFinance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tasks' | 'documents' | 'finance'>('tasks');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectData, financeData] = await Promise.all([
                    api.getProject(projectId),
                    api.getFinance(projectId).catch(() => null)
                ]);
                setProject(projectData);
                setFinance(financeData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [projectId]);

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    if (!project) return <div>Projet non trouvé</div>;

    // Calculate current phase
    const completedPhases = project.phases?.filter((p: any) => p.status === 'Completed') || [];
    const lastCompletedPhase = completedPhases.length > 0 ? completedPhases[completedPhases.length - 1] : null;

    const PROJECT = {
        client: project.client?.name || 'Inconnu',
        name: project.name,
        status: project.status,
        phase: lastCompletedPhase ? lastCompletedPhase.name : 'En discussion'
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">

            {/* Header */}
            <div className="flex flex-col gap-4 shrink-0">
                <Button variant="ghost" className="w-fit -ml-2 text-slate-500 hover:text-slate-600" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux projets
                </Button>

                <div className="flex flex-col justify-between gap-6 border-b border-slate-200 pb-0">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-slate-600 tracking-tight">{PROJECT.name}</h1>
                                <Badge variant="success">En cours</Badge>
                            </div>
                            <div className="flex items-center gap-6 text-slate-500 text-sm">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" /> {PROJECT.client}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4" /> Phase : {PROJECT.phase}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-8 px-1">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'tasks' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Suivi & Tâches
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'documents' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Documents & Upload
                        </button>
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'finance' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Finance
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 bg-slate-50/50 rounded-xl p-1">
                {activeTab === 'tasks' && (
                    <div className="h-full max-w-4xl mx-auto">
                        <PhaseControl projectId={projectId} />
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="h-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-full min-h-[500px]">
                            <ProjectDocuments projectId={projectId} />
                        </div>
                        <div className="h-[240px] lg:h-auto">
                            <UploadConsole projectId={projectId} />
                        </div>
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="h-full max-w-3xl mx-auto">
                        <FinanceForm projectId={parseInt(projectId)} />
                    </div>
                )}
            </div>

        </div>
    );
}
