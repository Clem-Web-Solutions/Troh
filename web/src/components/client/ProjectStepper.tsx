import { Check, Clock, Circle } from 'lucide-react';
import { cn, Card, CardHeader, CardTitle, CardContent } from '../ui';

interface Phase {
    id: number;
    name: string;
    status: 'Pending' | 'Completed';
}

interface ProjectStepperProps {
    phases: Phase[];
}

export function ProjectStepper({ phases }: ProjectStepperProps) {
    if (!phases || phases.length === 0) return null;

    const currentPhaseIndex = phases.findIndex(p => p.status === 'Pending');
    const activeIndex = currentPhaseIndex === -1 ? phases.length - 1 : currentPhaseIndex;

    return (
        <Card className="border-none shadow-sm ring-1 ring-slate-200 bg-white">
            <CardHeader className="border-b border-slate-100 py-4">
                <CardTitle className="text-lg font-bold text-slate-900">Progression du Projet</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto pb-4 pt-8 px-8">
                    <div className="flex items-start min-w-max">
                        {phases.map((phase, index) => {
                            let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
                            if (phase.status === 'Completed') status = 'completed';
                            else if (index === activeIndex) status = 'current';

                            const isLast = index === phases.length - 1;

                            return (
                                <div key={phase.id || index} className="flex flex-col relative">
                                    <div className="flex items-center">
                                        {/* Node */}
                                        <div className="flex flex-col items-center relative z-10">
                                            <div className={cn(
                                                "flex h-12 w-12 items-center justify-center rounded-full border-[3px] transition-all duration-300 bg-white",
                                                status === 'completed' && "border-emerald-500 text-emerald-500",
                                                status === 'current' && "border-emerald-500 text-emerald-600 shadow-md scale-110",
                                                status === 'upcoming' && "border-slate-200 text-slate-300"
                                            )}>
                                                {status === 'completed' && <Check className="h-5 w-5 stroke-[3]" />}
                                                {status === 'current' && <Clock className="h-5 w-5 animate-pulse" />}
                                                {status === 'upcoming' && <Circle className="h-4 w-4 fill-slate-50 border-none" />}
                                            </div>
                                        </div>

                                        {/* Connector Line */}
                                        {!isLast && (
                                            <div className="w-24 h-1 mx-2 bg-slate-100 rounded-full">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all duration-700",
                                                        (index < activeIndex || status === 'completed') ? "bg-emerald-500" : "w-0"
                                                    )}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <div className={cn(
                                        "mt-4 w-32 text-center -ml-10",
                                        isLast && "ml-0 -translate-x-1/3" // Adjust last label alignment if needed, or keep centered logic consistent
                                    )}>
                                        {/* Resetting margin logic to be simpler: Centered on the node */}
                                        {/* We need the label to be centered on the 12w (3rem) node. */}
                                        {/* 3rem = 48px. Center is 24px. */}
                                        {/* w-32 = 128px. Center is 64px. */}
                                        {/* Shift left by 64 - 24 = 40px (approx 2.5rem or ml-[-2.5rem]) */}

                                        <div className="w-32 -ml-10 flex flex-col items-center">
                                            <p className={cn(
                                                "text-sm font-semibold transition-colors duration-300 px-1",
                                                status === 'upcoming' ? "text-slate-400" : "text-slate-900"
                                            )}>
                                                {phase.name}
                                            </p>
                                            {status === 'current' && (
                                                <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">
                                                    En cours
                                                </span>
                                            )}
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
