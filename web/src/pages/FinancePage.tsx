import { FinanceSummary } from '../components/client/FinanceSummary';
import { Card, CardHeader, CardTitle } from '../components/ui';
import { Loader2, FileText } from 'lucide-react';
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
                // Fetch milestones using the new endpoint
                const paymentsRes = await fetch(`/api/projects/${selectedProjectId}/payments`);
                const paymentsData = await paymentsRes.json();

                // Keep existing finance fetch for backwards compat if needed, or merge
                // The new endpoint returns { total_budget, milestones }
                setFinance(paymentsData);
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
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header */}
            <div className="flex flex-col gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-600 tracking-tight">Suivi Financier</h1>
                    <p className="text-sm sm:text-base text-slate-500 mt-1">
                        Vue détaillée pour le projet <span className="font-semibold text-slate-600">{project.name}</span>.
                    </p>
                </div>
                {projects.length > 1 && (
                    <div className="w-full sm:w-auto sm:min-w-[200px]">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {/* Main Summary */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                    <FinanceSummary
                        totalBudget={displayTotal}
                        paidAmount={paidAmount}
                        totalLabel={displayLabel}
                    />

                    {/* Milestones / Tranches (Ultimate Prompt) */}
                    <Card className="overflow-hidden border-slate-200 shadow-sm">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3 sm:py-4">
                            <CardTitle className="text-sm sm:text-base font-semibold text-slate-600 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-500" />
                                <span className="hidden sm:inline">Échéancier des Paiements</span>
                                <span className="sm:hidden">Paiements</span>
                            </CardTitle>
                        </CardHeader>
                        <div className="bg-white p-0">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="p-4">Tranche</th>
                                        <th className="p-4">Montant</th>
                                        <th className="p-4">Statut</th>
                                        <th className="p-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {finance?.milestones?.map((m: any) => (
                                        <tr key={m.milestone_id} className="hover:bg-slate-50">
                                            <td className="p-4 font-medium text-slate-700">{m.label}</td>
                                            <td className="p-4 text-slate-600">{((project.budget || 50000) * m.percentage / 100).toLocaleString()} €</td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                                    ${m.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                        m.status === 'invoiced' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
                                                    {m.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {/* Action buttons could go here */}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!finance?.milestones || finance.milestones.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="p-4 text-center text-slate-500">Aucune tranche définie.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="bg-slate-600 text-white border-none p-6 shadow-xl">
                        <h3 className="font-semibold mb-6 flex items-center gap-2">
                            <div className="w-1 h-4 bg-red-500 rounded-full" />
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
