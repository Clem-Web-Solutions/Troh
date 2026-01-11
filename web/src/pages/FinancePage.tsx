import { FinanceSummary } from '../components/client/FinanceSummary';
import { Card, CardHeader, CardTitle, Button } from '../components/ui';
import { Download, ArrowUpRight, ArrowDownLeft, Loader2, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

export function FinancePage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
    const [finance, setFinance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await api.getProjects();
                setProjects(data);
                if (data && data.length > 0) {
                    setSelectedProjectId(data[0].id);
                }
            } catch (error) {
                console.error("Failed to load projects", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, []);

    useEffect(() => {
        if (!selectedProjectId) return;

        const fetchFinance = async () => {
            try {
                const financeData = await api.getFinance(selectedProjectId.toString());
                setFinance(financeData);
            } catch (error) {
                console.error("Failed to load finance", error);
            }
        };
        fetchFinance();
    }, [selectedProjectId]);

    if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

    if (!selectedProjectId) return <div className="p-8 text-center text-slate-500">Aucun projet trouvé.</div>;

    const project = projects.find(p => p.id === selectedProjectId);
    if (!finance || !project) return <div className="p-8 text-center text-slate-500">Chargement...</div>;

    const transactions = finance.transactions || [];

    // Calculate basics
    const paidAmount = finance.summary ? finance.summary.totalPaid : Number(finance.paidAmount);
    // Calculate total invoiced from summary OR fallback to summing invoice transactions
    const totalInvoiced = finance.summary ? finance.summary.totalInvoiced : transactions.filter((t: any) => t.type === 'Invoice').reduce((acc: number, t: any) => acc + Number(t.amount), 0);

    const projectBudget = Number(project.budget) || 0;
    const financeTotal = Number(finance.totalAmount) || 0;

    // Determine what to show as "Total"
    // If there is a manual finance total (project cost), use it.
    // Else if project has a budget, use it.
    // Else use sum of invoices (Progressive Billing).

    let displayTotal = financeTotal > 0 ? financeTotal : projectBudget;
    let displayLabel = "Budget Total";

    if (displayTotal === 0) {
        displayTotal = totalInvoiced;
        displayLabel = "Total Facturé";
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Suivi Financier</h1>
                    <p className="text-slate-500 mt-1">
                        Vue détaillée pour le projet <span className="font-semibold text-slate-900">{project.name}</span>.
                    </p>
                </div>
                {projects.length > 1 && (
                    <div className="min-w-[200px]">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Changer de projet</label>
                        <select
                            value={selectedProjectId || ''}
                            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                            className="w-full p-2 bg-white border border-slate-200 rounded-md text-sm font-medium focus:ring-2 focus:ring-slate-900 focus:outline-square"
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Summary */}
                <div className="lg:col-span-2 space-y-8">
                    <FinanceSummary
                        totalBudget={displayTotal}
                        paidAmount={paidAmount}
                        totalLabel={displayLabel}
                    />

                    {/* Transaction History */}
                    <Card className="overflow-hidden border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-500" />
                                    Historique des transactions ({transactions.length})
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-slate-900">
                                    <Download className="w-4 h-4" /> Exporter
                                </Button>
                            </div>
                        </CardHeader>
                        <div className="divide-y divide-slate-100 bg-white">
                            {transactions.length === 0 ? (
                                <div className="p-8 text-center text-slate-500 text-sm">Aucune transaction enregistrée.</div>
                            ) : (
                                transactions.map((tx: any) => (
                                    <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-full shrink-0 ${tx.type === 'Payment' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                                {tx.type === 'Payment' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900">{tx.description || 'Transaction sans libellé'}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {new Date(tx.date).toLocaleDateString()}
                                                    {tx.status === 'Pending' && <span className="ml-2 text-amber-600 font-medium">En attente</span>}
                                                    {tx.status === 'Completed' && tx.type === 'Invoice' && <span className="ml-2 text-emerald-600 font-medium">Payé</span>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold text-sm ${tx.type === 'Payment' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                                {tx.type === 'Payment' ? '-' : '+'} {parseFloat(tx.amount).toLocaleString()} €
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none p-6 shadow-xl">
                        <h3 className="font-semibold mb-6 flex items-center gap-2">
                            <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                            Coordonnées Bancaires
                        </h3>
                        <div className="space-y-5 text-sm text-slate-300">
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">IBAN</p>
                                <p className="font-mono text-white tracking-wide text-base">FR76 3000 3000 1234 5678 9012 34</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1.5">BIC</p>
                                <p className="font-mono text-white tracking-wide text-base">SOGEFRPP</p>
                            </div>
                            <div className="pt-5 border-t border-slate-800">
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Merci d'indiquer la référence <span className="text-white font-medium bg-slate-800 px-1.5 py-0.5 rounded ml-1">PRJ-{project.id}</span> dans le libellé de virement.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

        </div>
    );
}
