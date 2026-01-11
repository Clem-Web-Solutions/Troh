import { Euro, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '../ui';

interface FinanceSummaryProps {
    totalBudget: number;
    paidAmount: number;
}

export function FinanceSummary({ totalBudget, paidAmount }: FinanceSummaryProps) {
    const remaining = totalBudget - paidAmount;
    const progress = (paidAmount / totalBudget) * 100;

    return (
        <Card className="bg-slate-900 text-white border-slate-800 shadow-xl overflow-hidden relative">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

            <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-800 rounded-lg">
                            <Euro className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="font-semibold text-lg">Situation Financière</h3>
                    </div>
                    {remaining > 0 && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>En règle</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <p className="text-sm text-slate-400 mb-1">Budget Total</p>
                        <p className="text-2xl font-bold tracking-tight">{totalBudget.toLocaleString('fr-FR')} €</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 mb-1">Reste à payer</p>
                        <p className="text-2xl font-bold tracking-tight text-white">{remaining.toLocaleString('fr-FR')} €</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-300">Progression paiement</span>
                        <span className="text-white font-medium">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 pt-1">
                        <span>Versé: {paidAmount.toLocaleString('fr-FR')} €</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
