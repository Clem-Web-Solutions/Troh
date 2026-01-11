import { CheckSquare, MessagesSquare, Plus, Trash2, Loader2, ArrowUp, ArrowDown, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface PhaseControlProps {
    projectId: string;
}

export function PhaseControl({ projectId }: PhaseControlProps) {
    const [phases, setPhases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPhaseName, setNewPhaseName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [expandedPhaseId, setExpandedPhaseId] = useState<number | null>(null);

    const fetchPhases = async () => {
        try {
            const data = await api.getPhases(projectId);
            setPhases(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPhases();
    }, [projectId]);

    const handleToggle = async (phase: any) => {
        const isCompleted = (phase.status || '').toLowerCase() === 'completed';
        const newStatus = isCompleted ? 'Pending' : 'Completed';
        const updatedPhases = phases.map(p => p.id === phase.id ? { ...p, status: newStatus } : p);
        setPhases(updatedPhases);

        try {
            await api.updatePhase(phase.id, { status: newStatus });
        } catch (error) {
            console.error(error);
            fetchPhases();
        }
    };

    const handleMove = async (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === phases.length - 1) return;

        const newPhases = [...phases];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap locally for UI responsiveness
        [newPhases[index], newPhases[swapIndex]] = [newPhases[swapIndex], newPhases[index]];

        // Assign temp order based on index if 'order' was 0
        newPhases.forEach((p, i) => p.order = i);
        setPhases(newPhases);

        try {
            // Update both items in backend
            const p1 = newPhases[index];
            const p2 = newPhases[swapIndex];

            await Promise.all([
                api.updatePhase(p1.id, { order: p1.order }),
                api.updatePhase(p2.id, { order: p2.order })
            ]);
        } catch (error) {
            console.error("Failed to reorder", error);
            fetchPhases();
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPhaseName.trim()) {
            setIsAdding(false);
            return;
        }

        try {
            await api.createPhase(projectId, newPhaseName);
            setNewPhaseName('');
            setIsAdding(false);
            fetchPhases();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Supprimer cette étape ?')) return;
        try {
            await api.deletePhase(id);
            fetchPhases();
        } catch (error) {
            console.error(error);
        }
    };

    const updateDescription = async (id: number, description: string) => {
        try {
            await api.updatePhase(id, { description });
            setPhases(phases.map(p => p.id === id ? { ...p, description } : p));
        } catch (error) {
            console.error("Failed to update description", error);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    Contrôle d'Avancement
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-6 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {isLoading ? (
                        <div className="flex justify-center"><Loader2 className="animate-spin w-5 h-5 text-slate-400" /></div>
                    ) : phases.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-4">Aucune étape définie.</div>
                    ) : (
                        phases.map((phase, index) => {
                            const isCompleted = (phase.status || '').toLowerCase() === 'completed';
                            return (
                                <div key={phase.id} className="border border-transparent hover:border-slate-100 rounded-lg p-1 group">
                                    <div className="flex items-center gap-3">
                                        <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleMove(index, 'up')}
                                                disabled={index === 0}
                                                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                            >
                                                <ArrowUp className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleMove(index, 'down')}
                                                disabled={index === phases.length - 1}
                                                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                            >
                                                <ArrowDown className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <div
                                            onClick={() => handleToggle(phase)}
                                            className={cn(
                                                "w-5 h-5 min-w-[1.25rem] rounded border flex items-center justify-center transition-colors cursor-pointer",
                                                isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-slate-400"
                                            )}>
                                            {isCompleted && <CheckSquare className="w-3.5 h-3.5" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-medium transition-colors flex-1 cursor-pointer select-none",
                                            isCompleted ? "text-slate-900 line-through decoration-slate-400" : "text-slate-700"
                                        )} onClick={() => handleToggle(phase)}>
                                            {phase.name}
                                        </span>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setExpandedPhaseId(expandedPhaseId === phase.id ? null : phase.id)}
                                                className={cn("p-1 transition-colors", expandedPhaseId === phase.id ? "text-blue-500" : "text-slate-400 hover:text-blue-500")}
                                                title="Modifier détails"
                                            >
                                                <FileText className="w-3.5 h-3.5" />
                                            </button>
                                            <input
                                                type="date"
                                                className="text-xs border rounded px-1 py-0.5 text-slate-500 w-24"
                                                defaultValue={phase.startDate ? phase.startDate.split('T')[0] : ''}
                                                onBlur={(e) => {
                                                    if (e.target.value !== phase.startDate) {
                                                        api.updatePhase(phase.id, { startDate: e.target.value });
                                                    }
                                                }}
                                                title="Date de début"
                                            />
                                            <button onClick={() => handleDelete(phase.id)} className="p-1 text-slate-400 hover:text-red-500 transition-all">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {expandedPhaseId === phase.id && (
                                        <div className="mt-2 ml-11 mr-2 p-3 bg-slate-50 rounded-md border border-slate-100">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-xs font-semibold text-slate-500">Description Client</label>
                                                <textarea
                                                    className="w-full text-sm p-2 border border-slate-200 rounded focus:border-blue-500 focus:outline-none min-h-[60px]"
                                                    placeholder="Décrivez cette étape pour le client (ex: Dépôt du permis...)"
                                                    defaultValue={phase.description || ''}
                                                    onBlur={(e) => updateDescription(phase.id, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        }))}

                    {isAdding ? (
                        <form onSubmit={handleAdd} className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={newPhaseName}
                                onChange={(e) => setNewPhaseName(e.target.value)}
                                className="flex-1 text-sm border-b border-emerald-500 focus:outline-none py-1"
                                placeholder="Nom de l'étape..."
                                onBlur={() => { if (!newPhaseName) setIsAdding(false); }}
                            />
                            <Button type="submit" size="sm" variant="ghost" className="h-7 w-7 p-0 text-emerald-600"><Plus className="w-4 h-4" /></Button>
                        </form>
                    ) : (
                        <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-emerald-600 border border-dashed border-slate-200 hover:border-emerald-200" onClick={() => setIsAdding(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Ajouter une étape
                        </Button>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-2 text-slate-900 font-medium mb-3">
                        <MessagesSquare className="w-4 h-4" />
                        <span>Mises à jour Client</span>
                    </div>
                    <div className="space-y-3">
                        {/* Placeholder for updates */}
                        <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                            "Les matériaux pour la toiture ont été livrés ce matin. Début de pose prévu demain."
                            <div className="text-right mt-1 font-semibold not-italic text-slate-400">10:42</div>
                        </div>
                        <Button variant="secondary" size="sm" className="w-full gap-2">
                            <Plus className="w-4 h-4" /> Ajouter une note
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
