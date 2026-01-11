import { ProjectTable } from '../components/admin/ProjectTable';
import { CreateProjectModal } from '../components/admin/CreateProjectModal';
import { Plus } from 'lucide-react';
import { Button } from '../components/ui';
import { useState } from 'react';

interface AdminPanelProps {
    onNavigateToProject: (projectId: string) => void;
}

export function AdminPanel({ onNavigateToProject }: AdminPanelProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
                <ProjectTable onSelectProject={onNavigateToProject} />
            </div>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

        </div>
    );
}
