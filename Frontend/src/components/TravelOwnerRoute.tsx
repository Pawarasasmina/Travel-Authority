import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as adminApi from '../api/adminApi';

interface TravelOwnerRouteProps {
  children: React.ReactNode;
}

const TravelOwnerRoute: React.FC<TravelOwnerRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [checkingAccess, setCheckingAccess] = useState<boolean>(true);

  useEffect(() => {
    const checkOwnerAccess = async () => {
      if (!isLoading && user) {
        try {
          const response = await adminApi.checkTravelOwnerAccess();
          if (response.status === 'OK' || response.status === '200 OK') {
            setIsOwner(response.data?.isOwner || false);
          } else {
            setIsOwner(false);
          }
        } catch (error) {
          console.error('Error checking travel owner access:', error);
          setIsOwner(false);
        } finally {
          setCheckingAccess(false);
        }
      } else if (!isLoading && !user) {
        setIsOwner(false);
        setCheckingAccess(false);
      }
    };

    if (user) {
      // Quick check based on user role before API call
      if (user.role === 'TRAVEL_ACTIVITY_OWNER') {
        setIsOwner(true);
        setCheckingAccess(false);
      } else {
        checkOwnerAccess();
      }
    } else if (!isLoading) {
      setIsOwner(false);
      setCheckingAccess(false);
    }
  }, [user, isLoading]);

  if (isLoading || checkingAccess) {
    // Show loading state while checking authentication
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user || !isOwner) {
    // Redirect to login if not authenticated or not an admin
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and has admin access
  return <>{children}</>;
};

export default TravelOwnerRoute;
