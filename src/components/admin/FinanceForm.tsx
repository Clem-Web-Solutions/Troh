import { Wallet, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../ui';

export function FinanceForm() {
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                    Gestion Financière
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Payment Input */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Enregistrer un paiement</label>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                            <input
                                type="number"
                                placeholder="Montant"
                                className="w-full pl-7 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent placeholder:text-slate-400"
                            />
                        </div>
                        <Button className="shrink-0 gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Valider
                        </Button>
                    </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Funds Call */}
                <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-700">Appel de fonds</label>
                    <div className="space-y-2">
                        <select className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white">
                            <option>Phase 2 - 30% Gros Oeuvre</option>
                            <option>Phase 3 - 30% Second Oeuvre</option>
                            <option>Solde - 5% Réception</option>
                        </select>
                        <Button variant="secondary" className="w-full gap-2">
                            <PlusCircle className="w-4 h-4" /> Générer Facture & Notifier
                        </Button>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
