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
    const [currentFolder, setCurrentFolder] = useState<any | null>(null);
    const [documentsRefreshKey, setDocumentsRefreshKey] = useState(0);

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

    const handleUploadSuccess = () => {
        setDocumentsRefreshKey(prev => prev + 1);
    };

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
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">

            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4 shrink-0">
                <Button variant="ghost" className="w-fit -ml-2 text-slate-500 hover:text-slate-600 text-sm" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux projets
                </Button>

                <div className="flex flex-col justify-between gap-4 sm:gap-6 border-b border-slate-200 pb-0">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 px-1">
                        <div className="min-w-0 w-full sm:w-auto">
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-600 tracking-tight truncate">{PROJECT.name}</h1>
                                <Badge variant="success">En cours</Badge>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-6 text-slate-500 text-xs sm:text-sm flex-wrap">
                                <div className="flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="truncate">{PROJECT.client}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Phase : <span className="truncate">{PROJECT.phase}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-4 sm:gap-8 px-1 overflow-x-auto scrollbar-hide">
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tasks' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Suivi & Tâches
                        </button>
                        <button
                            onClick={() => setActiveTab('documents')}
                            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Documents
                        </button>
                        <button
                            onClick={() => setActiveTab('finance')}
                            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'finance' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
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
                    <div className="h-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="lg:col-span-2 h-full min-h-[400px] sm:min-h-[500px]">
                            <ProjectDocuments
                                projectId={projectId}
                                onFolderChange={setCurrentFolder}
                                refreshKey={documentsRefreshKey}
                            />
                        </div>
                        <div className="h-[200px] sm:h-[240px] lg:h-auto">
                            <UploadConsole
                                projectId={projectId}
                                targetFolder={currentFolder}
                                onUploadSuccess={handleUploadSuccess}
                            />
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
