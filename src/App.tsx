import { useState } from 'react';
import { Layout } from './components/layout/Layout';
// Client Pages
import { ClientDashboard } from './pages/ClientDashboard';
import { DocumentsPage } from './pages/DocumentsPage';
import { FinancePage } from './pages/FinancePage';
import { GalleryPage } from './pages/GalleryPage';
// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminPanel } from './pages/AdminPanel'; // This is now Admin Projects List
import { AdminProjectDetailsPage } from './pages/AdminProjectDetailsPage';
import { AdminClientsPage } from './pages/AdminClientsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

import { RoleSelection } from './pages/RoleSelection';
import { Card, CardContent } from './components/ui';

type Role = 'client' | 'admin' | null;

function App() {
  const [role, setRole] = useState<Role>(null);
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  // const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleRoleSelect = (selectedRole: 'client' | 'admin') => {
    setRole(selectedRole);
    // Set default path based on role
    if (selectedRole === 'admin') {
      setCurrentPath('admin-dashboard');
    } else {
      setCurrentPath('dashboard');
    }
  };

  const navigateToProject = (projectId: string) => {
    // setSelectedProjectId(projectId);
    console.log('Navigating to project', projectId);
    setCurrentPath('admin-project-details');
  };

  const renderContent = () => {
    switch (currentPath) {
      // Client Routes
      case 'dashboard':
        return <ClientDashboard />;
      case 'documents':
        return <DocumentsPage />;
      case 'finance':
        return <FinancePage />;
      case 'gallery':
        return <GalleryPage />;

      // Admin Routes
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-projects':
        return <AdminPanel onNavigateToProject={navigateToProject} />;
      case 'admin-project-details':
        return <AdminProjectDetailsPage onBack={() => setCurrentPath('admin-projects')} />;
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
                  La section <span className="font-medium text-slate-900">{currentPath}</span> est bientôt disponible.
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  if (!role) {
    return <RoleSelection onSelectRole={handleRoleSelect} />;
  }

  return (
    <Layout
      currentPath={currentPath}
      onNavigate={setCurrentPath}
      role={role}
      onLogout={() => setRole(null)}
    >
      {renderContent()}
    </Layout>
  );
}

export default App;
