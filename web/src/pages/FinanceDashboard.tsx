import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PaymentMilestone } from '../components/PaymentMilestone';

// Interfaces (should be in a shared types file)
interface ProjectData {
    total_budget: number;
    milestones: any[];
    finance_summary?: {
        total_paid: number;
        total_invoiced: number;
    }
}

export function FinanceDashboard() {
    const { id } = useParams<{ id: string }>();
    const [project, setProject] = useState<ProjectData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch project finance data
        fetch(`/api/projects/${id}/payments`)
            .then(res => res.json())
            .then(data => {
                setProject(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const handlePay = async (milestoneId: string) => {
        // Call API to pay/invoice
        console.log("Processing payment for", milestoneId);
        // await fetch(`/api/payments/${milestoneId}/pay`, { method: 'POST' });
        // Refresh data...
    };

    if (loading) return <div>Chargement des finances...</div>;
    if (!project) return <div>Projet introuvable</div>;

    return (
        <div className="finance-dashboard p-6">
            <h1 className="text-3xl font-bold mb-6">Tableau de Bord Financier</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Cards */}
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 uppercase text-xs font-bold">Budget Total</h3>
                    <p className="text-2xl font-bold">{project.total_budget.toLocaleString()} €</p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 uppercase text-xs font-bold">Payé</h3>
                    {/* Placeholder logic for summary if not provided by backend yet */}
                    <p className="text-2xl font-bold text-green-600">
                        {project.milestones.filter((m: any) => m.status === 'paid').reduce((acc: number, m: any) => acc + m.amount, 0).toLocaleString()} €
                    </p>
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h3 className="text-gray-500 uppercase text-xs font-bold">Reste à payer</h3>
                    <p className="text-2xl font-bold text-blue-600">
                        {(project.total_budget - project.milestones.filter((m: any) => m.status === 'paid').reduce((acc: number, m: any) => acc + m.amount, 0)).toLocaleString()} €
                    </p>
                </div>
            </div>

            <div className="milestones-section">
                <h2 className="text-xl font-semibold mb-4">Échéancier de paiement</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                    {project.milestones.map((milestone: any) => (
                        <PaymentMilestone
                            key={milestone.milestone_id}
                            milestone={milestone}
                            project={project}
                            onPay={handlePay}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
