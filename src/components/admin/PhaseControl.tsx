import { CheckSquare, MessagesSquare, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, cn } from '../ui';


const PHASES = [
    { id: 0, label: 'Signature Devis', completed: true },
    { id: 1, label: 'Dépôt Permis', completed: true },
    { id: 2, label: 'Commande Matériaux', completed: true },
    { id: 3, label: 'Début Chantier', completed: false },
    { id: 4, label: 'Inspection Mi-Parcours', completed: false },
    { id: 5, label: 'Livraison Client', completed: false },
];

export function PhaseControl() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                    Contrôle d'Avancement
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    {PHASES.map((phase) => (
                        <div key={phase.id} className="flex items-center gap-3 group cursor-pointer">
                            <div className={cn(
                                "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                phase.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 group-hover:border-slate-400"
                            )}>
                                {phase.completed && <CheckSquare className="w-3.5 h-3.5" />}
                            </div>
                            <span className={cn(
                                "text-sm font-medium transition-colors",
                                phase.completed ? "text-slate-900 line-through decoration-slate-400" : "text-slate-700"
                            )}>
                                {phase.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-900 font-medium mb-3">
                        <MessagesSquare className="w-4 h-4" />
                        <span>Mises à jour Client</span>
                    </div>
                    <div className="space-y-3">
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
