import { CheckCircle2, Clock, Circle } from 'lucide-react';
import { cn, Card, CardHeader, CardTitle, CardContent } from '../ui';

interface ProjectStepperProps {
    currentPhase: number; // 0 to 3
}

const PHASES = [
    { id: 0, label: 'Études', description: 'Plans & Permis' },
    { id: 1, label: 'Préparation', description: 'Achat matériaux' },
    { id: 2, label: 'Réalisation', description: 'Gros œuvre & finitions' },
    { id: 3, label: 'Livraison', description: 'Remise des clés' },
];

export function ProjectStepper({ currentPhase }: ProjectStepperProps) {
    return (
        <Card className="overflow-hidden border-none shadow-md ring-1 ring-slate-900/5">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                <CardTitle>Progression du Projet</CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
                <div className="relative">
                    {/* Progress Bar Background */}
                    <div className="absolute left-0 top-5 h-0.5 w-full bg-slate-100" />

                    {/* Active Progress Bar */}
                    <div
                        className="absolute left-0 top-5 h-0.5 bg-emerald-500 transition-all duration-500"
                        style={{ width: `${(currentPhase / (PHASES.length - 1)) * 100}%` }}
                    />

                    {/* Steps */}
                    <div className="relative flex justify-between">
                        {PHASES.map((phase) => {
                            const status = phase.id < currentPhase ? 'completed' : phase.id === currentPhase ? 'current' : 'upcoming';

                            return (
                                <div key={phase.id} className="flex flex-col items-center group">
                                    {/* Icon/Dot */}
                                    <div className={cn(
                                        "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 bg-white",
                                        status === 'completed' && "border-emerald-500 text-emerald-500",
                                        status === 'current' && "border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/20 scale-110",
                                        status === 'upcoming' && "border-slate-200 text-slate-300"
                                    )}>
                                        {status === 'completed' && <CheckCircle2 className="h-6 w-6" />}
                                        {status === 'current' && <Clock className="h-6 w-6 animate-pulse" />}
                                        {status === 'upcoming' && <Circle className="h-6 w-6" />}
                                    </div>

                                    {/* Label */}
                                    <div className="mt-4 text-center">
                                        <p className={cn(
                                            "text-sm font-semibold transition-colors duration-300",
                                            status === 'upcoming' ? "text-slate-400" : "text-slate-900"
                                        )}>
                                            {phase.label}
                                        </p>
                                        <p className="text-xs text-slate-500 hidden md:block mt-0.5">
                                            {phase.description}
                                        </p>
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
