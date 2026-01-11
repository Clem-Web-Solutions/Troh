import { Card, CardHeader, CardTitle, CardContent } from '../ui';
import { format, min, max, differenceInDays, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Phase {
    id: number;
    name: string;
    status: 'Pending' | 'Completed';
    startDate?: string;
    endDate?: string;
}

interface ProjectGanttProps {
    phases: Phase[];
}

export function ProjectGantt({ phases }: ProjectGanttProps) {
    if (!phases || phases.length === 0) return null;

    // Filter valid phases with dates or default mock
    // For a better UX, if no dates are present, we might fallback to linear or just show empty dates. 
    // Ideally we want to show relative positioning.

    // Calculate global start and end
    const dates = phases.flatMap(p => [p.startDate ? new Date(p.startDate) : null, p.endDate ? new Date(p.endDate) : null]).filter(Boolean) as Date[];

    let minDate = dates.length > 0 ? min(dates) : new Date();
    let maxDate = dates.length > 0 ? max(dates) : addDays(new Date(), 30);

    // Buffer days
    minDate = addDays(minDate, -5);
    maxDate = addDays(maxDate, 5);

    const totalDays = differenceInDays(maxDate, minDate) || 1;

    // Helper to get position
    const getPos = (dateStr?: string) => {
        if (!dateStr) return 0;
        const d = new Date(dateStr);
        const diff = differenceInDays(d, minDate);
        return (diff / totalDays) * 100;
    };

    return (
        <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 py-4">
                <CardTitle className="text-lg font-bold text-slate-900">Planning du Projet</CardTitle>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto">
                <div className="min-w-[700px] relative space-y-6">
                    {/* Time Axis (Months) - Simplified */}
                    <div className="flex justify-between border-b border-slate-100 pb-2 text-xs text-slate-400 font-medium">
                        <span>{format(minDate, 'MMM yyyy', { locale: fr })}</span>
                        <span>{format(maxDate, 'MMM yyyy', { locale: fr })}</span>
                    </div>

                    <div className="space-y-4 relative">
                        {/* Vertical Grid Lines (Optional) */}
                        <div className="absolute inset-0 flex justify-between pointer-events-none opacity-30">
                            {[0, 25, 50, 75, 100].map(p => (
                                <div key={p} className="h-full w-px bg-slate-200" style={{ left: `${p}%`, position: 'absolute' }} />
                            ))}
                        </div>

                        {phases.map((phase) => {
                            const start = phase.startDate ? getPos(phase.startDate) : 0;
                            const end = phase.endDate ? getPos(phase.endDate) : (start + 10); // default width if no end
                            const width = Math.max(end - start, 2); // min width

                            const isCompleted = phase.status === 'Completed';

                            return (
                                <div key={phase.id} className="relative h-12 flex items-center group">
                                    {/* Label */}
                                    <div className="absolute left-0 w-32 pr-4 text-sm font-medium text-slate-700 truncate z-10 bg-white/80">
                                        {phase.name}
                                    </div>

                                    {/* Bar Container (offset by label width) */}
                                    <div className="pl-32 w-full h-full relative flex items-center">
                                        {/* Bar */}
                                        <div
                                            className={`absolute h-6 rounded-md shadow-sm transition-all duration-300 flex items-center px-2 text-xs font-semibold text-white whitespace-nowrap overflow-hidden
                                                ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500 opacity-80'}
                                            `}
                                            style={{ left: `${start}%`, width: `${width}%` }}
                                        >
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                {phase.startDate && format(new Date(phase.startDate), 'd MMM', { locale: fr })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
