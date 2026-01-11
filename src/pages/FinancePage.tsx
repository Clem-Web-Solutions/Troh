import { FinanceSummary } from '../components/client/FinanceSummary';
import { Card, CardHeader, CardTitle, Badge, Button } from '../components/ui';
import { Download, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function FinancePage() {
    const TRANSACTIONS = [
        { id: 1, label: 'Acompte 30% - Gros Oeuvre', date: '12 Jan 2024', amount: 45000, type: 'payment', status: 'paid' },
        { id: 2, label: 'Appel de fonds - Toiture', date: '28 Jan 2024', amount: 12500, type: 'invoice', status: 'pending' },
        { id: 3, label: 'Acompte - Menuiseries', date: '15 Fév 2024', amount: 8000, type: 'payment', status: 'paid' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Suivi Financier</h1>
                <p className="text-slate-500 mt-1">Vue détaillée de votre budget et des paiements.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Summary */}
                <div className="lg:col-span-2 space-y-8">
                    <FinanceSummary totalBudget={125000} paidAmount={75000} />

                    {/* Transaction History */}
                    <Card className="overflow-hidden">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <CardTitle>Historique des transactions</CardTitle>
                                <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
                                    <Download className="w-4 h-4" /> Exporter
                                </Button>
                            </div>
                        </CardHeader>
                        <div className="divide-y divide-slate-100">
                            {TRANSACTIONS.map((tx) => (
                                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-full ${tx.type === 'payment' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'}`}>
                                            {tx.type === 'payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{tx.label}</p>
                                            <p className="text-sm text-slate-500">{tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-slate-900">
                                            {tx.type === 'payment' ? '-' : ''} {tx.amount.toLocaleString()} €
                                        </p>
                                        <Badge variant={tx.status === 'paid' ? 'success' : 'warning'}>
                                            {tx.status === 'paid' ? 'Payé' : 'En attente'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none p-6">
                        <h3 className="font-semibold mb-4">Coordonnées Bancaires</h3>
                        <div className="space-y-4 text-sm text-slate-300">
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">IBAN</p>
                                <p className="font-mono text-white">FR76 3000 3000 1234 5678 9012 34</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">BIC</p>
                                <p className="font-mono text-white">SOGEFRPP</p>
                            </div>
                            <div className="pt-4 border-t border-slate-800">
                                <p className="text-xs text-slate-400">
                                    Merci d'indiquer la référence <span className="text-white font-medium">PRJ-2024-042</span> dans le libellé de virement.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    );
}
