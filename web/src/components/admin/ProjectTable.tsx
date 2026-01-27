import { Calendar, ArrowRight } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

interface Project {
    id: number;
    name: string;
    clientId: number;
    status: string;
    progress: number;
    client?: { name: string };
    phases?: any[];
    updatedAt: string;
}

interface ProjectTableProps {
    projects: Project[];
    onSelectProject: (id: string) => void;
    onDelete?: (id: number) => void;
}

export function ProjectTable({ projects, onSelectProject, onDelete }: ProjectTableProps) {
    // Helper to format date relative
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Projet</th>
                            <th className="px-6 py-4">État</th>
                            <th className="px-6 py-4">Dernière mise à jour</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {projects.map((project) => (
                            <tr
                                key={project.id}
                                className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                onClick={() => onSelectProject(project.id.toString())}
                            >
                                <td className="px-6 py-4 font-medium text-slate-600">{project.client?.name || 'N/A'}</td>
                                <td className="px-6 py-4 text-slate-600">{project.name}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={project.status === 'Completed' ? 'success' : project.status === 'Chantier' ? 'default' : 'neutral'}>
                                        {project.status} ({project.progress}%)
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {formatDate(project.updatedAt)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete?.(project.id);
                                            }}
                                            title="Supprimer le projet"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100 bg-white">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => onSelectProject(project.id.toString())}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-slate-700 truncate mb-1">{project.name}</h3>
                                <p className="text-sm text-slate-500 truncate">{project.client?.name || 'N/A'}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 shrink-0 ml-2"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete?.(project.id);
                                }}
                                title="Supprimer le projet"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                            </Button>
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <Badge variant={project.status === 'Completed' ? 'success' : project.status === 'Chantier' ? 'default' : 'neutral'}>
                                {project.status} ({project.progress}%)
                            </Badge>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Calendar className="w-3.5 h-3.5" />
                                {formatDate(project.updatedAt)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-center">
                <Button variant="ghost" className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 gap-2">
                    Voir tous les projets <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
}
