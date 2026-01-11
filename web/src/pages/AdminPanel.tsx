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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projets</h1>
                    <p className="text-slate-500 mt-1">Gérez l'ensemble de vos projets immobiliers.</p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4" /> Nouveau Projet
                </Button>
            </div>

            {/* Projects Table */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-emerald-600" /></div>
                ) : error ? (
                    <div className="text-red-500">Erreur : {error}</div>
                ) : (
                    <ProjectTable projects={projects} onSelectProject={onNavigateToProject} />
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
