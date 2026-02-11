import { CheckSquare, Plus, Loader2, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../ui';
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';

interface Subtask {
    id: number;
    name: string;
    completed: boolean;
    notes?: string;
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
    title?: string;
    className?: string;
    category?: string;
    onUpdate?: () => void;
}

export function PhaseControl({ projectId, title = "Suivi de Projet", className, category, onUpdate }: PhaseControlProps) {
    // ... (existing state)


    const [phases, setPhases] = useState<Phase[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newPhaseName, setNewPhaseName] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});

    // State for new subtasks inputs: { [phaseId]: "task name" }
    const [newSubtasks, setNewSubtasks] = useState<Record<number, string>>({});
    // State for active note editing: { [phaseId-subtaskIndex]: "note content" }
    const [editingNote, setEditingNote] = useState<string | null>(null);

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

            setPhases(parsedData.filter((p: any) => !category || p.category === category || (category === 'DESIGN' && !p.category))); // Fallback for old phases without category
            // Expand all phases by default
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
    }, [projectId, category]);

    const togglePhaseExpansion = (phaseId: number) => {
        setExpandedPhases(prev => ({
            ...prev,
            [phaseId]: !prev[phaseId]
        }));
    };

    /**
     * Fix for "Checking one checks all":
     * Since subtasks are stored as a JSON array in Postgres/Sequelize, IDs might be duplicated or non-unique in seed data.
     * We MUST use the array index to identify which subtask to toggle.
     * We send the entire updated array back to the server, so index-based modification is safe and correct.
     */
    const toggleSubtask = async (phase: Phase, subtaskIndex: number) => {
        if (!phase.subtasks || !Array.isArray(phase.subtasks)) return;

        const updatedSubtasks = phase.subtasks.map((st, idx) =>
            idx === subtaskIndex ? { ...st, completed: !st.completed } : st
        );

        // Optimistic UI update
        updatePhaseLocally(phase.id, { subtasks: updatedSubtasks });

        try {
            await api.updatePhase(phase.id, { subtasks: updatedSubtasks });
            await fetchPhases(); // Sync real IDs from backend
            if (onUpdate) onUpdate(); // Notify parent
        } catch (error) {
            console.error('Failed to update subtask:', error);
            fetchPhases(); // Rollback
        }
    };

    const handleAddSubtask = async (e: React.FormEvent, phase: Phase) => {
        e.preventDefault();
        const taskName = newSubtasks[phase.id];
        if (!taskName?.trim()) return;

        const currentSubtasks = phase.subtasks || [];
        // Generate a pseudo-random ID to avoid immediate collision, though index is verifying logic
        const newSubtask: Subtask = {
            id: Date.now(),
            name: taskName,
            completed: false
        };

        const updatedSubtasks = [...currentSubtasks, newSubtask];

        updatePhaseLocally(phase.id, { subtasks: updatedSubtasks });
        setNewSubtasks(prev => ({ ...prev, [phase.id]: '' }));

        try {
            await api.updatePhase(phase.id, { subtasks: updatedSubtasks });
            await fetchPhases(); // Sync real IDs
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error("Failed to add subtask", error);
            fetchPhases();
        }
    };

    const updatePhaseLocally = (phaseId: number, updates: Partial<Phase>) => {
        setPhases(prev => prev.map(p => p.id === phaseId ? { ...p, ...updates } : p));
    };

    // --- Helpers for Calculations ---
    const getCompletionPercentage = (subtasks?: Subtask[]) => {
        if (!subtasks || !Array.isArray(subtasks) || subtasks.length === 0) return 0;
        const completed = subtasks.filter(st => st.completed).length;
        return Math.round((completed / subtasks.length) * 100);
    };

    const getCompletedCount = (subtasks?: Subtask[]) => {
        if (!subtasks || !Array.isArray(subtasks)) return 0;
        return subtasks.filter(st => st.completed).length;
    };

    // --- Branding ---
    // If category is 'Construction' or 'Travaux' -> Meereo Logo
    // If category is 'Conception', 'Etude', 'Architecture' -> Raw Design Logo
    const getPhaseLogo = (category?: string) => {
        const lowerCat = category?.toLowerCase() || '';
        if (lowerCat.includes('tude') || lowerCat.includes('conception') || lowerCat.includes('archi')) {
            return "/logo_raw.png"; // Raw Design
        }
        return "/logo_meereo.png"; // Meereo default
    };

    // --- Reordering ---


    const handleAddPhase = async (e: React.FormEvent) => {
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
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Card className={cn("h-full flex flex-col bg-slate-50/50 border-slate-200", className)}>
            <CardHeader className="p-4 bg-white border-b border-slate-100">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-700">
                    <CheckSquare className="w-5 h-5 text-sky-600" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4 p-4 overflow-hidden">
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    {isLoading ? (
                        <div className="flex justify-center py-10"><Loader2 className="animate-spin w-8 h-8 text-slate-300" /></div>
                    ) : phases.length === 0 ? (
                        <div className="text-center text-slate-400 text-sm py-8">Aucune phase définie pour ce projet.</div>
                    ) : (
                        phases.map((phase) => {
                            const isExpanded = expandedPhases[phase.id];
                            const subtasks = phase.subtasks || [];
                            const completionPercent = getCompletionPercentage(subtasks);
                            const completedCount = getCompletedCount(subtasks);
                            const logoSrc = getPhaseLogo(phase.category);

                            return (
                                <div key={phase.id} className="group border border-slate-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200">
                                    {/* Phase Header */}
                                    <div className="p-4">
                                        <div className="flex items-start gap-4">
                                            {/* Logo Branding */}
                                            {/* Logo Branding - Force white bg for visibility of dark logos */}
                                            <div className="w-12 h-12 bg-white shadow-sm rounded-lg flex items-center justify-center p-1 border border-slate-100">
                                                {/* Fallback to INITIALS if image fails (using simple div for now) */}
                                                {/* In real app, check if image exists or use a default object-contain */}
                                                <img
                                                    src={logoSrc}
                                                    alt="Logo"
                                                    className="w-full h-full object-contain opacity-90"
                                                    onError={(e) => {
                                                        // Fallback logic could go here
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0 pt-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className="font-bold text-slate-800 truncate text-base">{phase.name}</h3>
                                                    <button
                                                        onClick={() => togglePhaseExpansion(phase.id)}
                                                        className="text-slate-400 hover:text-slate-600 p-1"
                                                    >
                                                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                                    </button>
                                                </div>

                                                {phase.description && <p className="text-sm text-slate-500 mb-2 line-clamp-2">{phase.description}</p>}

                                                {/* Progress Bar */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={cn("h-full rounded-full transition-all duration-500",
                                                                completionPercent === 100 ? "bg-green-500" : "bg-sky-500"
                                                            )}
                                                            style={{ width: `${completionPercent}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500 min-w-[3rem] text-right">
                                                        {completedCount}/{subtasks.length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Subtasks List */}
                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50/30 p-4 pt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">

                                            {/* Add Task Input */}
                                            <form
                                                onSubmit={(e) => handleAddSubtask(e, phase)}
                                                className="flex gap-2 mb-4"
                                            >
                                                <input
                                                    type="text"
                                                    value={newSubtasks[phase.id] || ''}
                                                    onChange={(e) => setNewSubtasks(prev => ({ ...prev, [phase.id]: e.target.value }))}
                                                    placeholder="Ajouter une tâche..."
                                                    className="flex-1 text-sm bg-white border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-100 focus:border-sky-400 outline-none transition-all"
                                                />
                                                <Button type="submit" size="sm" variant="secondary" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </form>

                                            {/* Subtasks */}
                                            <div className="space-y-2">
                                                {subtasks.map((subtask, sIdx) => (
                                                    <div
                                                        key={`${phase.id}-${sIdx}`} // Using Index for Key to fix duplicate ID bug
                                                        className="group bg-white border border-slate-100 rounded-lg p-3 hover:border-slate-300 transition-all"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="pt-0.5">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={subtask.completed}
                                                                    onChange={() => toggleSubtask(phase, sIdx)} // Toggle by Index
                                                                    className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <span className={cn(
                                                                    "block text-sm mb-1 transition-all",
                                                                    subtask.completed ? "line-through text-slate-400" : "text-slate-700 font-medium"
                                                                )}>
                                                                    {subtask.name}
                                                                </span>

                                                                {/* Notes Section */}
                                                                <div className="mt-2">
                                                                    {editingNote === `${phase.id}-${sIdx}` ? (
                                                                        <div className="flex flex-col gap-2 animate-in fade-in">
                                                                            <textarea
                                                                                className="w-full text-xs p-2 border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-sky-200 outline-none resize-none"
                                                                                rows={2}
                                                                                defaultValue={subtask.notes}
                                                                                onBlur={(e) => {
                                                                                    // Save note logic
                                                                                    const note = e.target.value;
                                                                                    // Update local/backend
                                                                                    const updated = subtasks.map((st, i) => i === sIdx ? { ...st, notes: note } : st);
                                                                                    updatePhaseLocally(phase.id, { subtasks: updated });
                                                                                    api.updatePhase(phase.id, { subtasks: updated });
                                                                                    setEditingNote(null);
                                                                                }}
                                                                                autoFocus
                                                                            />
                                                                            <div className="text-[10px] text-slate-400 text-right">Cliquez "hors champ" pour sauvegarder</div>
                                                                        </div>
                                                                    ) : (
                                                                        <div
                                                                            className="flex items-center gap-2 cursor-pointer group/note"
                                                                            onClick={() => setEditingNote(`${phase.id}-${sIdx}`)}
                                                                        >
                                                                            {subtask.notes ? (
                                                                                <div className="text-xs text-slate-500 bg-amber-50 border border-amber-100 p-2 rounded w-full flex items-start gap-2">
                                                                                    <FileText className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                                                                                    {subtask.notes}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="flex items-center gap-1 text-xs text-slate-300 hover:text-slate-500 transition-colors">
                                                                                    <Plus className="w-3 h-3" /> Ajouter une note
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {isAdding ? (
                        <form onSubmit={handleAddPhase} className="bg-white p-4 rounded-xl border border-dashed border-slate-300 animate-in fade-in">
                            <input
                                autoFocus
                                type="text"
                                value={newPhaseName}
                                onChange={(e) => setNewPhaseName(e.target.value)}
                                className="w-full text-sm border-none focus:ring-0 p-0 placeholder:text-slate-400 font-medium"
                                placeholder="Nom de la nouvelle phase..."
                                onBlur={() => { if (!newPhaseName) setIsAdding(false); }}
                            />
                        </form>
                    ) : (
                        <Button
                            variant="ghost"
                            className="w-full text-slate-400 hover:text-sky-600 hover:bg-sky-50 border border-dashed border-slate-200 hover:border-sky-200 h-12"
                            onClick={() => setIsAdding(true)}
                        >
                            <Plus className="w-5 h-5 mr-2" /> Nouvelle Phase
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
