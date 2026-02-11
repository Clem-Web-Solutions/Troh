import { ProjectTable } from '../components/admin/ProjectTable';
import { CreateProjectModal } from '../components/admin/CreateProjectModal';
import { Plus, Loader2, Calendar, Filter } from 'lucide-react';
import { Button, Card, ConfirmationModal } from '../components/ui';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AdminProjectsPageProps {
    onNavigateToProject?: (projectId: string) => void;
}

export function AdminProjectsPage({ onNavigateToProject }: AdminProjectsPageProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<number | null>(null);

    // Filter state: "YYYY-MM" string or "ALL"
    const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

    const fetchProjects = async () => {
        setIsLoading(true);
        try {
            const data = await api.getProjects();
            setProjects(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Filter Logic
    useEffect(() => {
        if (selectedMonth === "ALL") {
            setFilteredProjects(projects);
        } else {
            const filtered = projects.filter(project => {
                const date = new Date(project.date_creation); // Filtering by Creation Date
                const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                return monthStr === selectedMonth;
            });
            setFilteredProjects(filtered);
        }
    }, [projects, selectedMonth]);

    const handleCreateProject = async (projectData: any) => {
        try {
            await api.createProject({
                name: projectData.name,
                address: projectData.address,
                client_id: projectData.client,
                entité: projectData.entité,
                chef_projet: projectData.projectManagerId,
                budget: projectData.budget,
                currency: projectData.currency,
                estimated_start_date: projectData.startDate,
                projectTypeId: projectData.projectTypeId,
                status: 'Etude'
            });
            setIsCreateModalOpen(false);
            fetchProjects();
        } catch (err: any) {
            console.error(err);
        }
    };

    const handleDeleteClick = (projectId: number) => {
        setProjectToDelete(projectId);
    };

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;
        try {
            await api.deleteProject(projectToDelete);
            setProjectToDelete(null);
            fetchProjects();
        } catch (err: any) {
            console.error(err);
            alert('Erreur lors de la suppression du projet.');
        }
    };

    // Generate Month Options from available projects
    const monthOptions = Array.from(new Set(projects.map(p => {
        const date = new Date(p.date_creation);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }))).sort().reverse(); // Newest months first

    // Helper to format month string "YYYY-MM" to readable French "Janvier 2024"
    const formatMonth = (monthStr: string) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header & Controls */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Projets</h1>
                        <p className="text-slate-500 mt-1">Gérez et suivez l'avancement de vos chantiers.</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200">
                        <Plus className="w-4 h-4" /> <span>Nouveau Projet</span>
                    </Button>
                </div>

                {/* Filters Bar */}
                <Card className="p-4 border-slate-200 shadow-sm bg-white">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <Filter className="w-4 h-4" />
                            <span>Filtrer par mois :</span>
                        </div>
                        <div className="relative w-48">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-2 focus:ring-slate-900 focus:outline-none appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                <option value="ALL">Tous les mois</option>
                                {monthOptions.map(month => (
                                    <option key={month} value={month}>
                                        {formatMonth(month).charAt(0).toUpperCase() + formatMonth(month).slice(1)}
                                    </option>
                                ))}
                            </select>
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Stats Summary */}
                        <div className="ml-auto text-sm text-slate-500 hidden sm:block">
                            Affichage de <strong>{filteredProjects.length}</strong> projet{filteredProjects.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Projects Table */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">Erreur : {error}</div>
                ) : (
                    <>
                        {filteredProjects.length > 0 ? (
                            <ProjectTable
                                projects={filteredProjects}
                                onSelectProject={(id: string) => onNavigateToProject && onNavigateToProject(id)}
                                onDelete={handleDeleteClick}
                            />
                        ) : (
                            <div className="text-center py-12 bg-slate-50/50 rounded-xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-500">Aucun projet trouvé pour cette période.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateProject}
            />

            <ConfirmationModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Supprimer le projet"
                message="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible et supprimera toutes les données associées."
                confirmText="Supprimer"
                variant="danger"
            />

        </div>
    );
}
