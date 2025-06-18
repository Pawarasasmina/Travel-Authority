import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { debugLog } from '../utils/debug';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  redirectPath = '/login',
}) => {
  const { isAuthenticated, user, isLoading, token } = useAuth();

  useEffect(() => {
    // Double check token validity
    if (!token && !isLoading) {
      debugLog('PROTECTED_ROUTE', 'No token found in auth context');
      
      // Check if there's a token in localStorage as fallback
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        debugLog('PROTECTED_ROUTE', 'No token in localStorage either, will redirect');
      }
    }
  }, [token, isLoading]);

  // Show loading state while checking auth
  if (isLoading) {
    debugLog('PROTECTED_ROUTE', 'Authentication checking in progress');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF7F50]"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    debugLog('PROTECTED_ROUTE', 'Not authenticated, redirecting to', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  debugLog('PROTECTED_ROUTE', 'User is authenticated', { user });
  // User is authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
