import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, Loader2, ArrowRight } from 'lucide-react';

interface Phase {
    id: number;
    name: string;
    description?: string;
    status: 'Pending' | 'Completed' | 'pending' | 'completed';
    startDate?: string;
    endDate?: string;
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

    if (!phases || phases.length === 0) return null;

    return (
        <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-white overflow-hidden max-w-6xl mx-auto">
            <CardHeader className="border-b border-slate-100 py-6">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900">Progression du Projet</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Suivez les étapes clés de votre chantier.</p>
                    </div>
                    <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 hidden md:block">
                        {/* Calculate active phase */}
                        {(() => {
                            const completed = phases.filter(p => p.status.toLowerCase() === 'completed').length;
                            const total = phases.length;
                            const percentage = Math.round((completed / total) * 100);
                            return `Avancement global : ${percentage}%`;
                        })()}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {/* Horizontal Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto pb-4 pt-6 px-6 hide-scrollbar flex gap-6 snap-x snap-mandatory"
                >
                    {phases.map((phase, index) => {
                        const isCompleted = phase.status.toLowerCase() === 'completed';
                        const isNextPending = !isCompleted && phases.slice(0, index).every(p => p.status.toLowerCase() === 'completed');

                        return (
                            <div key={phase.id} className="snap-center shrink-0 w-[300px] flex flex-col group">
                                {/* Connection Line Top (Visual) */}
                                <div className="flex items-center text-slate-200 mb-4 relative px-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white transition-colors duration-300
                                        ${isCompleted ? 'border-emerald-500 text-emerald-500' :
                                            isNextPending ? 'border-blue-500 text-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)]' : 'border-slate-200 text-slate-300'}
                                    `}>
                                        {isCompleted ? <CheckCircle2 className="w-5 h-5 fill-emerald-50" /> :
                                            isNextPending ? <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" /> :
                                                <Circle className="w-5 h-5" />}
                                    </div>

                                    {/* Line connecting to next */}
                                    {index < phases.length - 1 && (
                                        <div className={`flex-1 h-0.5 ml-2 rounded-full
                                            ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}
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
                                            <h3 className={`font-semibold text-base leading-tight ${isNextPending ? 'text-slate-900' : 'text-slate-700'}`}>
                                                {phase.name}
                                            </h3>
                                            {isNextPending && (
                                                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                    En cours
                                                </span>
                                            )}
                                        </div>

                                        {phase.description && (
                                            <p className={`text-sm mt-3 line-clamp-3 ${isNextPending ? 'text-slate-600' : 'text-slate-400'}`}>
                                                {phase.description}
                                            </p>
                                        )}

                                        {!phase.description && isNextPending && (
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
