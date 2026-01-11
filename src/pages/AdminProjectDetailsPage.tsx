import { UploadConsole } from '../components/admin/UploadConsole';
import { PhaseControl } from '../components/admin/PhaseControl';
import { FinanceForm } from '../components/admin/FinanceForm';
import { Button, Badge } from '../components/ui';
import { ArrowLeft, Calendar, User, Building } from 'lucide-react';

interface AdminProjectDetailsPageProps {
    onBack: () => void;
}

export function AdminProjectDetailsPage({ onBack }: AdminProjectDetailsPageProps) {
    // Mock data for the specific project
    const PROJECT = {
        client: 'M. et Mme. Dubois',
        name: 'Rénovation Villa Les Pins',
        status: 'active',
        phase: 'Réalisation',
        budget: '125 000 €'
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Header with Breadcrumb-ish feel */}
            <div className="flex flex-col gap-4">
                <Button variant="ghost" className="w-fit -ml-2 text-slate-500 hover:text-slate-900" onClick={onBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour aux projets
                </Button>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{PROJECT.name}</h1>
                            <Badge variant="success">En cours</Badge>
                        </div>
                        <div className="flex items-center gap-6 text-slate-500 text-sm">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" /> {PROJECT.client}
                            </div>
                            <div className="flex items-center gap-2">
                                <Building className="w-4 h-4" /> Phasage : {PROJECT.phase}
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Début : 12 Jan 2024
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Control Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="h-[500px]">
                    <PhaseControl />
                </div>
                <div className="h-[500px]">
                    <UploadConsole />
                </div>
                <div className="h-[500px]">
                    <FinanceForm />
                </div>
            </div>

        </div>
    );
}
