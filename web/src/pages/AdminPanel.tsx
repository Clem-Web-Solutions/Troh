import { ProjectTable } from '../components/admin/ProjectTable';
import { CreateProjectModal } from '../components/admin/CreateProjectModal';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '../components/ui';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface AdminPanelProps {
    onNavigateToProject: (projectId: string) => void;
}

export function AdminPanel({ onNavigateToProject }: AdminPanelProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const handleCreateProject = async (projectData: any) => {
        try {
            await api.createProject({
                name: projectData.name,
                address: projectData.address,
                clientId: projectData.client, // Ensure this matches backend expectation (ID)
                status: 'Etude' // Default
            });
            setIsCreateModalOpen(false);
            fetchProjects(); // Refresh list
        } catch (err: any) {
            console.error(err);
            // Handle error in modal ideally
        }
    };

    const handleDeleteProject = async (projectId: number) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
            try {
                await api.deleteProject(projectId);
                fetchProjects();
            } catch (err: any) {
                console.error(err);
                alert('Erreur lors de la suppression du projet.');
            }
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-600 tracking-tight">Projets</h1>
                        <p className="text-sm sm:text-base text-slate-500 mt-1">Gérez l'ensemble de vos projets immobiliers.</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-red-600 hover:bg-red-700 w-full sm:w-auto">
                        <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Nouveau Projet</span><span className="sm:hidden">Nouveau</span>
                    </Button>
                </div>
            </div>

            {/* Projects Table */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-red-600" /></div>
                ) : error ? (
                    <div className="text-red-500">Erreur : {error}</div>
                ) : (
                    <ProjectTable projects={projects} onSelectProject={onNavigateToProject} onDelete={handleDeleteProject} />
                )}
            </div>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateProject}
            />

        </div>
    );
}
