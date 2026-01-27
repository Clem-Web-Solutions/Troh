import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, Loader2, ArrowRight, CheckSquare } from 'lucide-react';

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
    status: 'Pending' | 'Completed' | 'pending' | 'completed';
    startDate?: string;
    endDate?: string;
    subtasks?: Subtask[];
}

interface ProjectTimelineProps {
    phases: Phase[];
}

import { useRef, useEffect } from 'react';

// ... existing interfaces

export function ProjectTimeline({ phases }: ProjectTimelineProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (phases && phases.length > 0 && scrollContainerRef.current) {
            // Find index of first pending/active phase
            // Same logic as in map: first non-completed
            const activeIndex = phases.findIndex(p => p.status.toLowerCase() !== 'completed');

            if (activeIndex > 0) { // If 0, it's already there
                const cardWidth = 300; // w-[300px]
                const gap = 24; // gap-6 = 24px
                const paddingLeft = 24; // px-6 = 24px

                // Calculate position to center it if possible, or just scroll to it
                // Scroll to start of the card: (width + gap) * index
                const scrollPos = (cardWidth + gap) * activeIndex;

                scrollContainerRef.current.scrollTo({
                    left: scrollPos,
                    behavior: 'smooth'
                });
            }
        }
    }, [phases]);

    if (!phases || phases.length === 0) {
        return (
            <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-white overflow-hidden max-w-6xl mx-auto">
                <CardHeader className="border-b border-slate-100 py-4 sm:py-6 px-4 sm:px-6">
                    <CardTitle className="text-lg sm:text-xl font-bold text-slate-600">Progression du Projet</CardTitle>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">Suivez les étapes clés de votre chantier.</p>
                </CardHeader>
                <CardContent className="p-6 sm:p-8 text-center">
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Loader2 className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucune phase définie</h3>
                        <p className="text-sm text-slate-500 max-w-md">
                            Les phases de votre projet seront affichées ici une fois configurées par votre chef de projet.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-white overflow-hidden max-w-6xl mx-auto">
            <CardHeader className="border-b border-slate-100 py-4 sm:py-6 px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                    <div>
                        <CardTitle className="text-lg sm:text-xl font-bold text-slate-600">Progression du Projet</CardTitle>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">Suivez les étapes clés de votre chantier.</p>
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-red-600 bg-red-50 px-2 sm:px-3 py-1 rounded-full border border-red-100">
                        {/* Calculate active phase */}
                        {(() => {
                            const completed = phases.filter(p => p.status.toLowerCase() === 'completed').length;
                            const total = phases.length;
                            const percentage = Math.round((completed / total) * 100);
                            return `Avancement : ${percentage}%`;
                        })()}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Mobile: Vertical Stack */}
                <div className="md:hidden p-4 space-y-4">
                    {phases.map((phase, index) => {
                        const isCompleted = phase.status.toLowerCase() === 'completed';
                        const isNextPending = !isCompleted && phases.slice(0, index).every(p => p.status.toLowerCase() === 'completed');

                        return (
                            <div key={phase.id} className="relative">
                                {/* Timeline connector */}
                                {index < phases.length - 1 && (
                                    <div className={`absolute left-4 top-12 bottom-0 w-0.5 ${isCompleted ? 'bg-red-500' : 'bg-slate-200'}`} />
                                )}
                                
                                <div className="flex gap-3">
                                    {/* Icon */}
                                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-colors
                                        ${isCompleted ? 'border-red-500 text-red-500' :
                                            isNextPending ? 'border-blue-500 text-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 
                                            'border-slate-200 text-slate-300'}
                                    `}>
                                        {isCompleted ? <CheckSquare className="w-4 h-4" /> :
                                            isNextPending ? <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" /> :
                                                <Circle className="w-4 h-4" />}
                                    </div>

                                    {/* Content */}
                                    <div className={`flex-1 p-4 rounded-lg border transition-all
                                        ${isNextPending
                                            ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100'
                                            : isCompleted
                                                ? 'bg-slate-50 border-slate-200/60'
                                                : 'bg-white border-slate-100 opacity-60'}
                                    `}>
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1">
                                                {phase.category && (
                                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mb-1">
                                                        {phase.category}
                                                    </span>
                                                )}
                                                <h3 className="font-semibold text-sm text-slate-800">{phase.name}</h3>
                                            </div>
                                            {isNextPending && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 shrink-0">
                                                    En cours
                                                </span>
                                            )}
                                        </div>

                                        {phase.description && (
                                            <p className="text-xs text-slate-600 mb-2">{phase.description}</p>
                                        )}

                                        {/* Sous-tâches */}
                                        {phase.subtasks && Array.isArray(phase.subtasks) && phase.subtasks.length > 0 && (
                                            <div className="mt-2 space-y-1">
                                                {phase.subtasks.map((subtask) => (
                                                    <div key={subtask.id} className="flex items-center gap-2 text-xs">
                                                        {subtask.completed ? (
                                                            <CheckSquare className="w-3 h-3 text-green-600 shrink-0" />
                                                        ) : (
                                                            <Circle className="w-3 h-3 text-slate-300 shrink-0" />
                                                        )}
                                                        <span className={subtask.completed ? 'text-slate-400 line-through' : 'text-slate-600'}>
                                                            {subtask.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {(phase.startDate || phase.endDate) && (
                                            <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-dashed border-slate-200 text-xs font-medium text-slate-500">
                                                <Clock className="w-3 h-3" />
                                                <span>
                                                    {phase.startDate && format(new Date(phase.startDate), 'd MMM', { locale: fr })}
                                                    {phase.endDate && ` - ${format(new Date(phase.endDate), 'd MMM', { locale: fr })}`}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Desktop: Horizontal Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    className="hidden md:flex overflow-x-auto pb-4 pt-6 px-6 hide-scrollbar gap-6 snap-x snap-mandatory"
                >
                    {phases.map((phase, index) => {
                        const isCompleted = phase.status.toLowerCase() === 'completed';
                        const isNextPending = !isCompleted && phases.slice(0, index).every(p => p.status.toLowerCase() === 'completed');

                        return (
                            <div key={phase.id} className="snap-center shrink-0 w-[300px] flex flex-col group">
                                {/* Connection Line Top (Visual) */}
                                <div className="flex items-center text-slate-200 mb-4 relative px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-colors duration-300
                                        ${isCompleted ? 'border-red-500 text-red-500' :
                                            isNextPending ? 'border-blue-500 text-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'border-slate-200 text-slate-300'}
                                    `}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5 fill-red-50" /> :
                                            isNextPending ? <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" /> :
                                                <Circle className="w-5 h-5" />}
                                    </div>

                                    {/* Line connecting to next */}
                                    {index < phases.length - 1 && (
                                        <div className={`flex-1 h-0.5 ml-2 rounded-full
                                            ${isCompleted ? 'bg-red-500' : 'bg-slate-200'}
                                        `} />
                                    )}
                                </div>

                                {/* Content Card */}
                                <div className={`flex-1 p-5 rounded-xl border transition-all duration-300 h-full flex flex-col justify-between relative overflow-hidden
                                    ${isNextPending
                                        ? 'bg-white border-blue-200 shadow-lg shadow-blue-500/5 ring-1 ring-blue-100'
                                        : isCompleted
                                            ? 'bg-slate-50 border-slate-200/60'
                                            : 'bg-white border-slate-100 opacity-60 grayscale'}
                                `}>
                                    {/* Active Pulse Indicator */}
                                    {isNextPending && (
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-100/50 to-transparent -mr-8 -mt-8 rounded-full blur-xl" />
                                    )}

                                    <div>
                                        <div className="flex justify-between items-start mb-2">
                                            {phase.category && (
                                                <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mr-2">
                                                    {phase.category}
                                                </span>
                                            )}
                                            <h3 className={`font-semibold text-base leading-tight ${isNextPending ? 'text-slate-600' : 'text-slate-700'}`}>
                                                {phase.name}
                                            </h3>
                                            {isNextPending && (
                                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 ml-2">
                                                    En cours
                                                </span>
                                            )}
                                        </div>

                                        {phase.description && (
                                            <p className={`text-sm mt-3 mb-3 ${isNextPending ? 'text-slate-600' : 'text-slate-400'}`}>
                                                {phase.description}
                                            </p>
                                        )}

                                        {/* Sous-tâches */}
                                        {phase.subtasks && Array.isArray(phase.subtasks) && phase.subtasks.length > 0 && (
                                            <div className="mt-3 space-y-1.5">
                                                {phase.subtasks.map((subtask) => (
                                                    <div key={subtask.id} className="flex items-center gap-2 text-xs">
                                                        {subtask.completed ? (
                                                            <CheckSquare className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                                        ) : (
                                                            <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                                        )}
                                                        <span className={subtask.completed ? 'text-slate-400 line-through' : 'text-slate-600'}>
                                                            {subtask.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {!phase.description && !phase.subtasks && isNextPending && (
                                            <p className="text-sm text-slate-500 italic mt-3">
                                                Cette étape est actuellement en cours de réalisation.
                                            </p>
                                        )}
                                    </div>

                                    {(phase.startDate || phase.endDate) && (
                                        <div className={`flex items-center gap-2 mt-4 pt-4 border-t border-dashed ${isNextPending ? 'border-blue-100' : 'border-slate-100'} text-xs font-medium`}>
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            <span className={isNextPending ? 'text-blue-600' : 'text-slate-500'}>
                                                {phase.startDate && format(new Date(phase.startDate), 'd MMM', { locale: fr })}
                                                {phase.endDate && ` - ${format(new Date(phase.endDate), 'd MMM', { locale: fr })}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Spacer for right padding scroll */}
                    <div className="w-2 shrink-0" />
                </div>
            </CardContent>
        </Card>
    );
}
