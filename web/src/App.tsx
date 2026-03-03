import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { ClientLayout } from './components/layout/ClientLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { useState, useEffect } from 'react';

// Client Pages
import { ClientDashboard } from './pages/ClientDashboard';
import { DocumentsPage } from './pages/DocumentsPage';
import { FinancePage } from './pages/FinancePage';
import { GalleryPage } from './pages/GalleryPage';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProjectsPage } from './pages/AdminProjectsPage';
import { AdminProjectDetailsPage } from './pages/AdminProjectDetailsPage';
import { AdminClientsPage } from './pages/AdminClientsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          isAuthenticated ? (
            <Navigate to="/client/dashboard" replace />
          ) : (
            <LoginPage />
          )
        } />

        {/* Protected Routes - Client */}
        <Route path="/client" element={
          <ProtectedRoute allowedRoles={['client']}>
            <ClientLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="photos" element={<GalleryPage />} />
        </Route>

        {/* Protected Routes - Admin */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjectsPage />} />
          <Route path="projects/:id" element={<AdminProjectDetailsPage />} />
          <Route path="clients" element={<AdminClientsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>

        {/* Protected Routes - Change Password */}
        <Route
          path="/change-password"
          element={
            <ProtectedRoute>
              <ChangePasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Default Redirect */}
        <Route path="/" element={
          isAuthenticated ? (
            <Navigate to="/client/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
