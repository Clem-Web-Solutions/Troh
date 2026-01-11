import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { AppRoutes } from './routes';
import { LoginPage } from './pages/LoginPage';

type Role = 'client' | 'admin' | null;

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  mustChangePassword?: boolean;
}

function App() {
  const [role, setRole] = useState<Role>(null);
  const [currentPath, setCurrentPath] = useState('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setRole(parsedUser.role);
        // Restore path logic with security check
        if (parsedUser.mustChangePassword) {
          setCurrentPath('change-password');
        } else if (currentPath === 'dashboard') {
          setCurrentPath(parsedUser.role === 'admin' ? 'admin-dashboard' : 'dashboard');
        }
      } catch (e) {
        console.error("Failed to parse stored user", e);
        handleLogout();
      }
    }
  }, []);

  const handleLogin = (userData: AuthUser, authToken: string) => {
    setToken(authToken);
    setRole(userData.role);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));

    if (userData.mustChangePassword) {
      setCurrentPath('change-password');
    } else if (userData.role === 'admin') {
      setCurrentPath('admin-dashboard');
    } else {
      setCurrentPath('dashboard');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setCurrentPath('dashboard');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const navigateToProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPath('admin-project-details');
  };

  if (!role || !token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Layout
      currentPath={currentPath}
      onNavigate={setCurrentPath}
      role={role}
      onLogout={handleLogout}
    >
      <AppRoutes
        currentPath={currentPath}
        selectedProjectId={selectedProjectId}
        onNavigate={setCurrentPath}
        onNavigateToProject={navigateToProject}
        onLogout={handleLogout}
      />
    </Layout>
  );
}

export default App;
