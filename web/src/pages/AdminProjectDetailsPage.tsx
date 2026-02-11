
import { ProjectDocuments } from '../components/admin/ProjectDocuments';
import { PhaseControl } from '../components/admin/PhaseControl';
import { FinanceForm } from '../components/admin/FinanceForm';
import { Button, Badge, ConfirmationModal } from '../components/ui';
import { ArrowLeft, User, Building, Loader2, AlertTriangle, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';
// Assuming Components exist or I will create them inline or separate?
// User asked to modify this file. I will use the previously created ReserveList.
// I will create inline UI or use existing placeholders if I can't import easily.
import { ReserveList } from '../components/ReserveList'; // Imported from my previous creation


interface AdminProjectDetailsPageProps {
    projectId: string;
    onBack: () => void;
}

export function AdminProjectDetailsPage({ projectId, onBack }: AdminProjectDetailsPageProps) {
    const [project, setProject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'tasks' | 'documents' | 'finance' | 'reserves' | 'amendments'>('tasks');

    const [documentsRefreshKey] = useState(0);
    const [projectRefreshKey, setProjectRefreshKey] = useState(0);
    const [reserves, setReserves] = useState<any[]>([]);
    const [amendments, setAmendments] = useState<any[]>([]);
    const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectData, financeData] = await Promise.all([
                    api.getProject(projectId),
                    api.getFinance(projectId).catch(() => null)
                ]);

                setProject(projectData);

                if (financeData) {
                    // Start: Extract reserves and amendments if available in financeData (Project include)
                    // Note: getFinance returns { total_budget, milestones }. 
                    // Wait, getFinance controller:
                    /*
                    const project = await Project.findByPk(id, {
                        include: [
                            { model: Amendment, as: 'amendments' },
                            { model: Reserve, as: 'reserves' },
                            ...
                        ]
                    });
                    ...
                    res.json({
                        total_budget: currentTotal,
                        milestones: enrichedMilestones,
                        // It DOES NOT return amendments/reserves directly in the JSON response currently!
                        // I need to update financeController to return them OR create the routes.
                        // Updating financeController is cleaner.
                        amendments: project.amendments,
                        reserves: project.reserves
                    });
                    */
                    // For now, I'll update the controller to return these lists so frontend can use them.
                    setReserves(financeData.reserves || []);
                    setAmendments(financeData.amendments || []);
                }

            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [projectId, projectRefreshKey]);



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
                                {(() => {
                                    // Calculate Task Progress Frontend-side for immediate feedback
                                    let totalTasks = 0;
                                    let completedTasks = 0;

                                    if (project.phases) {
                                        project.phases.forEach((phase: any) => {
                                            if (phase.tasks) {
                                                phase.tasks.forEach((task: any) => {
                                                    totalTasks++;
                                                    if (task.status === 'done') completedTasks++;
                                                });
                                            }
                                        });
                                    }

                                    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                                    // Determine Badge Variant based on valid options: default, success, warning, neutral
                                    let badgeVariant: "default" | "success" | "warning" | "neutral" = "neutral";
                                    let statusText = "Démarrage";

                                    if (progress === 100) {
                                        badgeVariant = "success";
                                        statusText = "Terminé";
                                    } else if (progress > 0) {
                                        badgeVariant = "default";
                                        statusText = `En cours (${progress}%)`;
                                    }

                                    return (
                                        <Badge variant={badgeVariant}>{statusText}</Badge>
                                    );
                                })()}
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
                        <button
                            onClick={() => setActiveTab('reserves')}
                            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reserves' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Réserves ({reserves.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('amendments')}
                            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'amendments' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Avenants
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 bg-slate-50/50 rounded-xl p-1">
                {activeTab === 'tasks' && (
                    <div className="h-full max-w-4xl mx-auto space-y-8 pb-10">
/* Map Architecture */
                        <PhaseControl
                            projectId={projectId}
                            title="Phase 1 : Études & Conception (Architecte)"
                            category="DESIGN"
                            onUpdate={() => setProjectRefreshKey(k => k + 1)}
                        />

                        {/* Map Construction (Conditional) */}
                        {/* We check if project has construction context or simply show the control which will be empty/hidden if no phases? 
                            Better to show the "Activate" block if no construction phases exist. 
                            We can't easily check phases count here without fetching them. 
                            However, PhaseControl fetches them. 
                            Let's rely on a callback or simple check. 
                            Actually, we can check project.entité or statut_global.
                         */}
                        {project.entité === 'MEEREO_PROJECT' || project.statut_global === 'Chantier' ? (
                            <PhaseControl
                                projectId={projectId}
                                title="Phase 2 : Travaux & Réalisation (Construction)"
                                className="border-l-4 border-l-green-500"
                                category="CONSTRUCTION"
                                onUpdate={() => setProjectRefreshKey(k => k + 1)}
                            />
                        ) : (
                            // ... inside return ...
                            project.entité === 'RAW_DESIGN' && (
                                <div className="bg-white p-8 rounded-xl border border-dashed border-slate-300 text-center animate-in fade-in">
                                    <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-slate-700">Phase Travaux non activée</h3>
                                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                        La phase de construction n'est pas encore accessible. Validez le dossier administratif pour débloquer le suivi de chantier.
                                    </p>
                                    <Button
                                        variant="primary"
                                        onClick={() => setIsConstructionModalOpen(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        Valider le dossier & Lancer les Travaux
                                    </Button>

                                    <ConfirmationModal
                                        isOpen={isConstructionModalOpen}
                                        onClose={() => setIsConstructionModalOpen(false)}
                                        onConfirm={async () => {
                                            try {
                                                await api.createConstructionProject(projectId);
                                                window.location.reload();
                                            } catch (e: any) {
                                                console.error(e);
                                                // Alert removed, maybe use toast? For now console.
                                            }
                                        }}
                                        title="Lancer la phase travaux ?"
                                        message="Cette action va activer la phase chantiers sur ce projet. Confirmez-vous la validation du dossier administratif ?"
                                        confirmText="Valider & Lancer"
                                        variant="warning"
                                    />
                                </div>
                            )
                        )}
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="h-full max-w-5xl mx-auto">
                        <ProjectDocuments
                            projectId={projectId}
                            refreshKey={documentsRefreshKey}
                        />
                    </div>
                )}

                {activeTab === 'finance' && (
                    <div className="h-full max-w-3xl mx-auto">
                        <FinanceForm projectId={parseInt(projectId)} />
                    </div>
                )}

                {activeTab === 'reserves' && (
                    <div className="h-full max-w-4xl mx-auto">
                        <ReserveList
                            reserves={reserves}
                            onResolve={async (id) => {
                                await fetch(`/api/reserves/${id}/resolve`, { method: 'PUT' });
                                // Refresh
                                const res = await fetch(`/api/projects/${projectId}/reserves`);
                                setReserves(await res.json());
                            }}
                        />
                    </div>
                )}

                {activeTab === 'amendments' && (
                    <div className="h-full max-w-4xl mx-auto p-4">
                        <h2 className="text-xl font-bold mb-4">Avenants</h2>
                        {/* Inline Amendment List/Form or Component */}
                        <div className="mb-4">
                            <Button onClick={() => { /* Open Modal */ }}>
                                <Plus className="w-4 h-4 mr-2" /> Créer un avenant
                            </Button>
                        </div>
                        <div className="bg-white rounded list-none divide-y divide-slate-100 shadow-sm border border-slate-200">
                            {amendments.length === 0 ? (
                                <p className="p-4 text-center text-slate-500 text-sm">Aucun avenant enregistré.</p>
                            ) : (
                                amendments.map((am: any) => (
                                    <div key={am.amendment_id || am.id} className="p-4 flex justify-between items-center group hover:bg-slate-50">
                                        <div>
                                            <p className="font-medium text-slate-700 text-sm">{am.title}</p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{am.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${am.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {am.status || 'Brouillon'}
                                            </span>
                                            <p className="text-xs font-bold text-slate-600 mt-1">{am.amount_added} €</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
