import { Navigate } from 'react-router-dom';
import type { Role } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles) {
    try {
      const user = JSON.parse(userStr);
      if (!allowedRoles.includes(user.role)) {
        // Redirect based on user's actual role
        return user.role === 'admin'
          ? <Navigate to="/admin/dashboard" replace />
          : <Navigate to="/client/dashboard" replace />;
      }
    } catch (e) {
      console.error('Failed to parse user:', e);
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}
