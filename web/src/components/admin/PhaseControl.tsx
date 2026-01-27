import { CheckSquare, MessagesSquare, Plus, Loader2, ArrowUp, ArrowDown, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface Subtask {
    id: number;
    name: string;
    completed: boolean;
}

interface Phase {
    id: number;
    name: string;
    category?: string;
    description?: string;
    status: string;
    order: number;
    startDate?: string;
    endDate?: string;
    subtasks?: Subtask[];
}

interface PhaseControlProps {
    projectId: string;
}

export function PhaseControl({ projectId }: PhaseControlProps) {
    const [phases, setPhases] = useState<Phase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPhaseName, setNewPhaseName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});

    const fetchPhases = async () => {
        try {
            const data = await api.getPhases(projectId);
            
            // Parse subtasks if they come as JSON strings
            const parsedData = data.map((phase: any) => {
                if (phase.subtasks && typeof phase.subtasks === 'string') {
                    try {
                        phase.subtasks = JSON.parse(phase.subtasks);
                    } catch (e) {
                        console.error('Failed to parse subtasks:', e);
                        phase.subtasks = [];
                    }
                }
                return phase;
            });
            
            setPhases(parsedData);
            // Expand all phases by default to show subtasks
            const initialExpanded: Record<number, boolean> = {};
            parsedData.forEach((phase: Phase) => {
                initialExpanded[phase.id] = true;
            });
            setExpandedPhases(initialExpanded);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPhases();
    }, [projectId]);

    const togglePhaseExpansion = (phaseId: number) => {
        setExpandedPhases(prev => ({
            ...prev,
            [phaseId]: !prev[phaseId]
        }));
    };

    const toggleSubtask = async (phase: Phase, subtaskId: number) => {
        if (!phase.subtasks || !Array.isArray(phase.subtasks)) return;

        const updatedSubtasks = phase.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );

        // Update local state immediately for responsiveness
        setPhases(phases.map(p =>
            p.id === phase.id ? { ...p, subtasks: updatedSubtasks } : p
        ));

        try {
            await api.updatePhase(phase.id, { subtasks: updatedSubtasks });
        } catch (error) {
            console.error('Failed to update subtask:', error);
            fetchPhases(); // Rollback on error
        }
    };

    const getCompletionPercentage = (subtasks?: Subtask[] | any) => {
        if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0) return 0;
        const completed = subtasks.filter((st: Subtask) => st.completed).length;
        return Math.round((completed / subtasks.length) * 100);
    };

    const getCompletedCount = (subtasks?: Subtask[] | any) => {
        if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0) return 0;
        return subtasks.filter((st: Subtask) => st.completed).length;
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

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                    Contrôle d'Avancement
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 sm:gap-6 overflow-hidden p-3 sm:p-4 md:p-6">
                <div className="flex-1 overflow-y-auto space-y-3 sm:space-y-4 pr-1 sm:pr-2">
                    {isLoading ? (
                        <div className="flex justify-center"><Loader2 className="animate-spin w-5 h-5 text-slate-400" /></div>
                    ) : phases.length === 0 ? (
                        <div className="text-center text-slate-400 text-xs sm:text-sm py-4">Aucune étape définie.</div>
                    ) : (
                        phases.map((phase, index) => {
                            const isExpanded = expandedPhases[phase.id];
                            const completionPercent = getCompletionPercentage(phase.subtasks);
                            const completedCount = getCompletedCount(phase.subtasks);
                            const totalSubtasks = (phase.subtasks && Array.isArray(phase.subtasks)) ? phase.subtasks.length : 0;
                            const hasSubtasks = totalSubtasks > 0;

                            return (
                                <div key={phase.id} className="border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                    {/* Header de la phase */}
                                    <div className="p-3 sm:p-4">
                                        <div className="flex items-start gap-3">
                                            {/* Bouton d'expansion */}
                                            {hasSubtasks && (
                                                <button
                                                    onClick={() => togglePhaseExpansion(phase.id)}
                                                    className="mt-1 text-slate-400 hover:text-slate-600 transition-colors"
                                                >
                                                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                </button>
                                            )}
                                            
                                            <div className="flex-1 min-w-0">
                                                {/* Titre et badge de catégorie */}
                                                <div className="flex items-center gap-2 mb-2">
                                                    {phase.category && (
                                                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                            {phase.category}
                                                        </span>
                                                    )}
                                                    <h3 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
                                                        {phase.name}
                                                    </h3>
                                                </div>
                                                
                                                {/* Description */}
                                                {phase.description && (
                                                    <p className="text-xs sm:text-sm text-slate-600 mb-2">
                                                        {phase.description}
                                                    </p>
                                                )}

                                                {/* Barre de progression */}
                                                {hasSubtasks && (
                                                    <div className="mb-2">
                                                        <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                                                            <span>{completedCount}/{totalSubtasks} complétées</span>
                                                            <span className="font-medium">{completionPercent}%</span>
                                                        </div>
                                                        <div className="bg-slate-200 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                                                                style={{ width: `${completionPercent}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleMove(index, 'up')}
                                                    disabled={index === 0}
                                                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30 p-1"
                                                >
                                                    <ArrowUp className="w-3 h-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleMove(index, 'down')}
                                                    disabled={index === phases.length - 1}
                                                    className="text-slate-400 hover:text-slate-600 disabled:opacity-30 p-1"
                                                >
                                                    <ArrowDown className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Liste des sous-tâches (expansible) */}
                                    {hasSubtasks && isExpanded && phase.subtasks && Array.isArray(phase.subtasks) && (
                                        <div className="border-t border-slate-100 p-3 sm:p-4 bg-slate-50/50 space-y-2">
                                            {phase.subtasks.map((subtask) => (
                                                <label
                                                    key={subtask.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-white rounded cursor-pointer transition-colors group"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={subtask.completed}
                                                        onChange={() => toggleSubtask(phase, subtask.id)}
                                                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                                                    />
                                                    <span className={cn(
                                                        "flex-1 text-sm transition-all",
                                                        subtask.completed
                                                            ? "line-through text-slate-400"
                                                            : "text-slate-700 font-medium"
                                                    )}>
                                                        {subtask.name}
                                                    </span>
                                                    {subtask.completed && (
                                                        <CheckSquare className="w-4 h-4 text-green-600" />
                                                    )}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {isAdding ? (
                        <form onSubmit={handleAdd} className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={newPhaseName}
                                onChange={(e) => setNewPhaseName(e.target.value)}
                                className="flex-1 text-sm border-b border-red-500 focus:outline-none py-1"
                                placeholder="Nom de l'étape..."
                                onBlur={() => { if (!newPhaseName) setIsAdding(false); }}
                            />
                            <Button type="submit" size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-600"><Plus className="w-4 h-4" /></Button>
                        </form>
                    ) : (
                        <Button variant="ghost" size="sm" className="w-full text-slate-400 hover:text-red-600 border border-dashed border-slate-200 hover:border-red-200" onClick={() => setIsAdding(true)}>
                            <Plus className="w-4 h-4 mr-2" /> Ajouter une étape
                        </Button>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-2 text-slate-600 font-medium mb-3">
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
