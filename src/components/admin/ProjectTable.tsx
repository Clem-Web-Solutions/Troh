import { MoreHorizontal, Calendar, ArrowRight } from 'lucide-react';
import { Card, Badge, Button } from '../ui';

interface Project {
    id: string;
    client: string;
    project: string;
    phase: string;
    lastUpdate: string;
    status: 'active' | 'pending' | 'completed';
}

const PROJECTS: Project[] = [
    { id: '1', client: 'M. et Mme. Dubois', project: 'Rénovation Villa Les Pins', phase: 'Réalisation', lastUpdate: 'Il y a 2h', status: 'active' },
    { id: '2', client: 'SCI Horizon', project: 'Construction Immeuble B', phase: 'Études', lastUpdate: 'Il y a 1j', status: 'pending' },
    { id: '3', client: 'Famille Martin', project: 'Extension Maison', phase: 'Préparation', lastUpdate: 'Il y a 3j', status: 'active' },
    { id: '4', client: 'M. Leroy', project: 'Studio Centre', phase: 'Livraison', lastUpdate: 'Il y a 5j', status: 'completed' },
];

interface ProjectTableProps {
    onSelectProject: (id: string) => void;
}

export function ProjectTable({ onSelectProject }: ProjectTableProps) {
    return (
        <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Projet</th>
                            <th className="px-6 py-4">Phase Actuelle</th>
                            <th className="px-6 py-4">Dernière mise à jour</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {PROJECTS.map((project) => (
                            <tr
                                key={project.id}
                                className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                                onClick={() => onSelectProject(project.id)}
                            >
                                <td className="px-6 py-4 font-medium text-slate-900">{project.client}</td>
                                <td className="px-6 py-4 text-slate-600">{project.project}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={project.status === 'completed' ? 'success' : project.status === 'active' ? 'default' : 'neutral'}>
                                        {project.phase}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {project.lastUpdate}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-center">
                <Button variant="ghost" className="text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-2">
                    Voir tous les projets <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </Card>
    );
}
