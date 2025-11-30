import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: Array<'student' | 'teacher' | 'admin'>;
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  roles = [], 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}