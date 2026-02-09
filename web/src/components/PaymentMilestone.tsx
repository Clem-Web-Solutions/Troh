import React, { useState } from 'react';

interface Milestone {
    milestone_id: string;
    label: string;
    percentage: number;
    status: 'pending' | 'invoiced' | 'paid';
    amount?: number;
    blocked?: boolean;
    blockReason?: string;
    condition_rule?: string;
}

interface Project {
    total_budget: number;
}

interface PaymentMilestoneProps {
    milestone: Milestone;
    project: Project;
    onPay: (id: string) => Promise<void>;
}

export function PaymentMilestone({ milestone, project, onPay }: PaymentMilestoneProps) {
    const [loading, setLoading] = useState(false);

    // Amount can be pre-calculated in backend or here
    const amount = milestone.amount || (project.total_budget * milestone.percentage / 100);
    const isPaid = milestone.status === 'paid';

    const handlePayment = async () => {
        if (loading) return;
        setLoading(true);
        try {
            await onPay(milestone.milestone_id);
        } catch (err) {
            alert("Erreur lors du paiement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`milestone p-4 border rounded-lg shadow-sm mb-4 ${isPaid ? 'bg-green-50 border-green-200' : 'bg-white'} ${milestone.blocked ? 'bg-red-50 border-red-200' : ''}`}>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">{milestone.label}</h3>
                    <p className="text-sm text-gray-600">{milestone.percentage}% du budget</p>
                    <p className="font-mono mt-1 text-lg font-semibold">{amount.toFixed(2)} €</p>

                    {milestone.condition_rule && (
                        <p className="text-xs text-blue-600 mt-1">Condition: {milestone.condition_rule}</p>
                    )}

                    {milestone.blocked && (
                        <p className="text-sm text-red-600 font-bold mt-2">
                            Condition non remplie : {milestone.blockReason}
                        </p>
                    )}
                </div>

                <div className="text-right">
                    <p className="text-sm uppercase font-bold tracking-wide mb-2">
                        {isPaid ? "✅ Payé" : (milestone.status === 'invoiced' ? "🕒 Facturé" : "❌ En attente")}
                    </p>

                    {!isPaid && (
                        <button
                            onClick={handlePayment}
                            disabled={milestone.blocked || loading}
                            className={`px-4 py-2 rounded font-bold text-white transition-colors
                                ${milestone.blocked ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            title={milestone.blocked ? milestone.blockReason : 'Payer maintenant'}
                        >
                            {loading ? '...' : (milestone.status === 'invoiced' ? 'Payer' : 'Facturer')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
