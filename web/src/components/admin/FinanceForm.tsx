import { Wallet, PlusCircle, CheckCircle2, Loader2, ArrowUpRight, FileText, Trash2, ArrowDownLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '../ui';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';

interface FinanceFormProps {
    projectId: number;
}

export function FinanceForm({ projectId }: FinanceFormProps) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [paymentAmount, setPaymentAmount] = useState('');
    const [invoiceDescription, setInvoiceDescription] = useState('');
    const [invoiceAmount, setInvoiceAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchFinance = useCallback(async () => {
        if (!projectId) return;
        try {
            const data = await api.getFinance(projectId.toString());
            setTransactions(data.transactions || []);
            setSummary(data.summary);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchFinance();
    }, [fetchFinance]);

    const handleAddTransaction = async (type: 'Payment' | 'Invoice') => {
        const amount = type === 'Payment' ? paymentAmount : invoiceAmount;
        const description = type === 'Payment' ? 'Paiement enregistré' : invoiceDescription;

        if (!amount || isNaN(Number(amount))) return;

        setIsSubmitting(true);
        try {
            await api.addTransaction(projectId, {
                type,
                amount: Number(amount),
                description,
                status: type === 'Payment' ? 'Completed' : 'Pending'
            });

            // Reset forms
            setPaymentAmount('');
            setInvoiceAmount('');
            setInvoiceDescription('');

            // Refresh list
            await fetchFinance();
        } catch (error) {
            alert('Erreur lors de l\'ajout');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) return;
        try {
            await api.deleteTransaction(id);
            await fetchFinance();
        } catch (error) {
            alert('Erreur lors de la suppression');
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-50 border-slate-100">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Total Payé</p>
                        <p className="text-2xl font-bold text-emerald-600">{summary?.totalPaid?.toLocaleString()} €</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-100">
                    <CardContent className="p-4">
                        <p className="text-xs text-slate-500 uppercase font-semibold">Total Facturé</p>
                        <p className="text-2xl font-bold text-slate-900">{summary?.totalInvoiced?.toLocaleString()} €</p>
                    </CardContent>
                </Card>
            </div>

            {/* Input Forms */}
            <Card className="border-slate-200 shadow-sm shrink-0">
                <CardContent className="p-4 space-y-4">
                    {/* Payment */}
                    <div className="flex gap-3 items-end">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold text-slate-900">Enregistrer un Paiement</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                                <input
                                    type="number"
                                    placeholder="Montant reçu"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                        </div>
                        <Button
                            size="sm"
                            className="bg-slate-900 text-white"
                            onClick={() => handleAddTransaction('Payment')}
                            disabled={isSubmitting}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Valider
                        </Button>
                    </div>

                    <div className="h-px bg-slate-100" />

                    {/* Invoice */}
                    <div className="flex gap-3 items-end">
                        <div className="flex-[2] space-y-1">
                            <label className="text-xs font-semibold text-slate-900">Nouvel Appel de Fonds</label>
                            <input
                                type="text"
                                placeholder="Libellé (ex: Phase 2 - 30%)"
                                value={invoiceDescription}
                                onChange={(e) => setInvoiceDescription(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                            />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-semibold text-slate-900">Montant</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                                <input
                                    type="number"
                                    placeholder="Montant"
                                    value={invoiceAmount}
                                    onChange={(e) => setInvoiceAmount(e.target.value)}
                                    className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                />
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant="secondary"
                            className="border border-slate-200"
                            onClick={() => handleAddTransaction('Invoice')}
                            disabled={isSubmitting}
                        >
                            <PlusCircle className="w-4 h-4 mr-2" /> Créer
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Transactions List */}
            <Card className="flex-1 border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-100">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Historique ({transactions.length})
                    </CardTitle>
                </CardHeader>
                <div className="flex-1 overflow-y-auto">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-sm">Aucune transaction.</div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-50 group">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.type === 'Payment' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {tx.type === 'Payment' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900">{tx.description || '-'}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(tx.date).toLocaleDateString()}
                                                {tx.status === 'Pending' && <span className="ml-2 text-amber-600 font-medium">En attente</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`font-semibold text-sm ${tx.type === 'Payment' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {tx.type === 'Payment' ? '+' : '-'} {Number(tx.amount).toLocaleString()} €
                                        </span>
                                        <button
                                            onClick={() => handleDelete(tx.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
