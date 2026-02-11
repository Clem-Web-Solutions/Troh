import { PlusCircle, CheckCircle2, Loader2, ArrowUpRight, FileText, Trash2, ArrowDownLeft, Calendar, AlertTriangle, Pencil, Target } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button, ConfirmationModal } from '../ui';
import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';

interface FinanceFormProps {
    projectId: number;
}

export function FinanceForm({ projectId }: FinanceFormProps) {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [milestones, setMilestones] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [paymentAmount, setPaymentAmount] = useState('');

    // Fund Call Form
    const [fundCallDescription, setFundCallDescription] = useState('');
    const [fundCallAmount, setFundCallAmount] = useState('');
    const [fundCallDate, setFundCallDate] = useState('');
    const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit State
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [editForm, setEditForm] = useState({ amount: '', date: '', description: '', dueDate: '' });

    // Delete State
    const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);

    const fetchFinance = useCallback(async () => {
        if (!projectId) return;
        try {
            const data = await api.getFinance(projectId.toString());
            setTransactions(data.transactions || []);
            setMilestones(data.milestones || []);
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

    const handleAddPayment = async () => {
        if (!paymentAmount || isNaN(Number(paymentAmount))) return;
        setIsSubmitting(true);
        try {
            await api.addTransaction(projectId, {
                type: 'Payment',
                amount: Number(paymentAmount),
                status: 'Completed'
            });
            setPaymentAmount('');
            await fetchFinance();
        } catch (error) {
            alert('Erreur: ' + (error as any).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddFundCall = async () => {
        if (!fundCallAmount || !fundCallDescription || !fundCallDate) {
            alert("Veuillez remplir tous les champs (Libellé, Montant, Date limite).");
            return;
        }

        if (Number(fundCallAmount) > (summary?.remainingBudget || 0)) {
            alert("Montant supérieur au budget restant !");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.addTransaction(projectId, {
                type: 'Invoice',
                amount: Number(fundCallAmount),
                description: fundCallDescription,
                dueDate: fundCallDate,
                status: 'Pending',
                milestoneId: selectedMilestoneId
            });
            setFundCallAmount('');
            setFundCallDescription('');
            setFundCallDate('');
            setSelectedMilestoneId(null);
            await fetchFinance();
        } catch (error) {
            alert('Erreur: ' + (error as any).message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateFromMilestone = (milestone: any) => {
        setFundCallDescription(milestone.label);
        setFundCallAmount(Math.round(milestone.amount).toString()); // Rounding for cleaner inputs
        // Default date 15 days from now
        const date = new Date();
        date.setDate(date.getDate() + 15);
        setFundCallDate(date.toISOString().split('T')[0]);
        setSelectedMilestoneId(milestone.id);

        // Scroll to form?
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleEditClick = (tx: any) => {
        setEditingTransaction(tx);
        setEditForm({
            amount: tx.amount,
            date: tx.date,
            description: tx.description || '',
            dueDate: tx.dueDate || ''
        });
    };

    const handleSaveEdit = async () => {
        if (!editingTransaction) return;
        try {
            await api.updateTransaction(editingTransaction.id, {
                ...editForm,
                amount: Number(editForm.amount)
            });
            setEditingTransaction(null);
            await fetchFinance();
        } catch (error) {
            alert("Erreur lors de la modification");
        }
    };

    const handleDeleteClick = (id: number) => {
        setTransactionToDelete(id);
    };

    const confirmDelete = async () => {
        if (!transactionToDelete) return;
        try {
            await api.deleteTransaction(transactionToDelete);
            setTransactionToDelete(null);
            await fetchFinance();
        } catch (error) {
            console.error(error);
        }
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    // Calculate budget color status
    const remainingPercentage = summary?.remainingBudget && summary?.totalBudget
        ? (summary.remainingBudget / summary.totalBudget) * 100
        : 0;

    let budgetColorClass = "text-green-600";
    if (remainingPercentage < 0) budgetColorClass = "text-red-600";
    else if (remainingPercentage < 20) budgetColorClass = "text-orange-500";

    return (
        <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Card className="bg-slate-50 border-slate-100">
                    <CardContent className="p-3 sm:p-4">
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-semibold">Budget Total</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{summary?.totalBudget?.toLocaleString()} €</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50 border-slate-100">
                    <CardContent className="p-3 sm:p-4">
                        <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-semibold">Budget Restant (à engager)</p>
                        <div className="flex items-center gap-2">
                            <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${budgetColorClass}`}>
                                {summary?.remainingBudget?.toLocaleString()} €
                            </p>
                            {remainingPercentage < 20 && remainingPercentage >= 0 && <AlertTriangle className="w-5 h-5 text-orange-500" />}
                            {remainingPercentage < 0 && <AlertTriangle className="w-5 h-5 text-red-600" />}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    {/* Input Forms */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-sm font-semibold">Actions Rapides</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-6">
                            {/* Fund Call (Appel de Fonds) */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-slate-600 flex justify-between">
                                    <span>Nouvel Appel de Fonds {selectedMilestoneId && <span className="text-blue-600 font-normal ml-2">(lié à échéance)</span>}</span>
                                </label>
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="Libellé (ex: Phase 2 - 30%)"
                                        value={fundCallDescription}
                                        onChange={(e) => setFundCallDescription(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                    <div className="flex gap-3">
                                        <div className="flex-1 relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                                            <input
                                                type="number"
                                                placeholder="Montant"
                                                value={fundCallAmount}
                                                onChange={(e) => setFundCallAmount(e.target.value)}
                                                className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                            />
                                        </div>
                                        <div className="flex-1 relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="date"
                                                value={fundCallDate}
                                                onChange={(e) => setFundCallDate(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="w-full bg-slate-900 text-white"
                                        onClick={handleAddFundCall}
                                        disabled={isSubmitting}
                                    >
                                        <PlusCircle className="w-4 h-4 mr-2" /> Créer l'Appel de Fonds
                                    </Button>
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* Payment */}
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-slate-600">Enregistrer un Paiement (Encaissement)</label>
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">€</span>
                                        <input
                                            type="number"
                                            placeholder="Montant reçu"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={handleAddPayment}
                                        disabled={isSubmitting}
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Valider
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Milestones List */}
                    <Card className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-100">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                <Target className="w-4 h-4" /> Échéancier Prévisionnel
                            </CardTitle>
                        </CardHeader>
                        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                            {milestones.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">Aucun échéancier généré.</div>
                            ) : (
                                milestones.map(m => (
                                    <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-slate-900">{m.label}</span>
                                                <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{m.percentage}%</span>
                                            </div>
                                            <p className="text-xs text-slate-500">{m.phase_id}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-semibold text-slate-700">{Math.round(m.amount).toLocaleString()} €</span>
                                            {m.status === 'pending' && (
                                                <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleGenerateFromMilestone(m)}>
                                                    Générer
                                                </Button>
                                            )}
                                            {m.status === 'invoiced' && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full">FACTURÉ</span>}
                                            {m.status === 'paid' && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">PAYÉ</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Transactions List */}
                <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
                    <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-100">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Historique ({transactions.length})
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 overflow-y-auto max-h-[600px]">
                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">Aucune transaction enregistrée.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className={`p-3 flex items-center justify-between hover:bg-slate-50 group border-l-4 ${tx.type === 'Invoice' ? 'border-amber-400 bg-amber-50/30' : 'border-transparent'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${tx.type === 'Payment' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {tx.type === 'Payment' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{tx.description || (tx.type === 'Payment' ? 'Paiement' : 'Appel de fonds')}</p>
                                                <div className="flex gap-2 text-xs text-slate-500">
                                                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                                                    {tx.dueDate && (
                                                        <span className={`font-medium ${new Date(tx.dueDate) < new Date() && tx.status !== 'Paid' ? 'text-red-600' : 'text-slate-500'}`}>
                                                            • Échéance : {new Date(tx.dueDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    <span className={`px-1.5 rounded-full text-[10px] font-semibold ${tx.status === 'Completed' || tx.status === 'Paid' ? 'bg-green-100 text-green-700' :
                                                        tx.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100'
                                                        }`}>
                                                        {tx.status === 'Completed' ? 'Payé' : tx.status === 'Pending' ? 'En attente' : tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-semibold text-sm ${tx.type === 'Payment' ? 'text-red-600' : 'text-slate-800'}`}>
                                                {tx.type === 'Payment' ? '+' : '-'} {Number(tx.amount).toLocaleString()} €
                                            </span>
                                            <div className="flex gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(tx)}
                                                    className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(tx.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Edit Modal */}
            {editingTransaction && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md bg-white">
                        <CardHeader>
                            <CardTitle>Modifier la transaction</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Description</label>
                                <input
                                    type="text"
                                    value={editForm.description}
                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Montant</label>
                                <input
                                    type="number"
                                    value={editForm.amount}
                                    onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                                    className="w-full mt-1 px-3 py-2 border rounded-md"
                                />
                            </div>
                            {editingTransaction.type === 'Invoice' && (
                                <div>
                                    <label className="text-sm font-medium text-slate-700">Date d'échéance</label>
                                    <input
                                        type="date"
                                        value={editForm.dueDate}
                                        onChange={e => setEditForm({ ...editForm, dueDate: e.target.value })}
                                        className="w-full mt-1 px-3 py-2 border rounded-md"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" onClick={() => setEditingTransaction(null)}>Annuler</Button>
                                <Button onClick={handleSaveEdit}>Enregistrer</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!transactionToDelete}
                onClose={() => setTransactionToDelete(null)}
                onConfirm={confirmDelete}
                title="Supprimer la transaction"
                message="Êtes-vous sûr de vouloir supprimer cette transaction ? Le budget sera recalculé."
                confirmText="Supprimer"
                variant="danger"
            />
        </div>
    );
}
