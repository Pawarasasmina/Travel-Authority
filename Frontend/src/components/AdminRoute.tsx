import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { debugLog } from '../utils/debug';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children,
  redirectPath = '/home',
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      debugLog('ADMIN_ROUTE', 'User role check', { role: user.role });
    }
  }, [isLoading, user]);

  // Show loading state while checking auth
  if (isLoading) {
    debugLog('ADMIN_ROUTE', 'Authentication checking in progress');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    debugLog('ADMIN_ROUTE', 'Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated but not admin, redirect to home
  if (user && user.role !== 'ADMIN') {
    debugLog('ADMIN_ROUTE', 'User is not an admin, redirecting', { userRole: user.role });
    return <Navigate to={redirectPath} replace />;
  }

  debugLog('ADMIN_ROUTE', 'User is authenticated and has admin role', { user });
  // User is authenticated and is admin
  return <>{children}</>;
};

export default AdminRoute;
