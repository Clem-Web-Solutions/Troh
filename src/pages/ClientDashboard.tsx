import { ProjectStepper } from '../components/client/ProjectStepper';
import { FinanceSummary } from '../components/client/FinanceSummary';
import { DocumentGrid } from '../components/client/DocumentGrid';
import { SiteGallery } from '../components/client/SiteGallery';

// Mock data
const PROJECT_DATA = {
    clientName: "M. et Mme. Dubois",
    projectName: "Rénovation Villa Les Pins",
    phase: 2, // Réalisation
    totalBudget: 125000,
    paidAmount: 75000
};

export function ClientDashboard() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bonjour, {PROJECT_DATA.clientName}</h1>
                    <p className="text-slate-500 mt-1">Suivi du projet : <span className="font-semibold text-slate-700">{PROJECT_DATA.projectName}</span></p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-sm font-medium text-emerald-600">Chantier en cours</span>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Left Column (Main Tracking) */}
                <div className="xl:col-span-2 space-y-8">
                    <ProjectStepper currentPhase={PROJECT_DATA.phase} />
                    <SiteGallery />
                    <DocumentGrid />
                </div>

                {/* Right Column (Finance) */}
                <div className="space-y-8">
                    <FinanceSummary
                        totalBudget={PROJECT_DATA.totalBudget}
                        paidAmount={PROJECT_DATA.paidAmount}
                    />

                    {/* Contact Card (Quick Access) */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="font-semibold text-slate-900 mb-4">Votre Chef de Projet</h3>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                                JD
                            </div>
                            <div>
                                <p className="font-medium text-slate-900">Jean Dupont</p>
                                <p className="text-sm text-slate-500">jean.dupont@troh-immo.fr</p>
                            </div>
                        </div>
                        <button className="mt-4 w-full rounded-lg bg-slate-900 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
                            Envoyer un message
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
