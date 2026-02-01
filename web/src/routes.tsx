import { Card, CardContent } from './components/ui';

// Client Pages
import { ClientDashboard } from './pages/ClientDashboard';
import { DocumentsPage } from './pages/DocumentsPage';
import { FinancePage } from './pages/FinancePage';
import { GalleryPage } from './pages/GalleryPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AdminProjectDetailsPage } from './pages/AdminProjectDetailsPage';
import { AdminClientsPage } from './pages/AdminClientsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

interface AppRoutesProps {
    currentPath: string;
    selectedProjectId: string | null;
    onNavigate: (path: string) => void;
    onNavigateToProject: (projectId: string) => void;
    onLogout: () => void;
}

export function AppRoutes({ currentPath, selectedProjectId, onNavigate, onNavigateToProject, onLogout }: AppRoutesProps) {
    switch (currentPath) {
        // Client Routes
        case 'dashboard':
            return <ClientDashboard onLogout={onLogout} />;
        case 'documents':
            return <DocumentsPage />;
        case 'finance':
            return <FinancePage />;
        case 'gallery':
            return <GalleryPage />;
        case 'change-password':
            return <ChangePasswordPage />;

        // Admin Routes
        case 'admin-dashboard':
            return <AdminDashboard />;
        case 'admin-projects':
            return <AdminProjectsPage onNavigateToProject={onNavigateToProject} />;
        case 'admin-project-details':
            return <AdminProjectDetailsPage projectId={selectedProjectId!} onBack={() => onNavigate('admin-projects')} />;
        case 'admin-clients':
            return <AdminClientsPage />;
        case 'settings':
            return <AdminSettingsPage />;

        default:
            return (
                <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 animate-in fade-in">
                    <Card className="w-full max-w-md text-center">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-2">Page en construction</h2>
                            <p className="text-slate-500">
                                La section <span className="font-medium text-slate-600">{currentPath}</span> est bientôt disponible.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
    }
}
