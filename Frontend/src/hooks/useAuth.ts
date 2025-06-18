import { useEffect, useState, useCallback } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { getUserProfile } from '../api/authApi';
import { debugLog } from '../utils/debug';

// Enhanced hook with auto-loading capability
export const useAuth = () => {
  const auth = useAuthContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Function to check and load user profile
  const checkAndLoadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (token && !auth.user) {
      debugLog('AUTH_HOOK', 'Found token but no user, fetching profile');
      
      try {
        const response = await getUserProfile();
        debugLog('AUTH_HOOK', 'Auto-fetched user profile', response);
        
        if (response.status === "OK" && response.data) {
          debugLog('AUTH_HOOK', 'Setting user data from profile', response.data);
          auth.login(response.data, token);
          return true;
        } else {
          debugLog('AUTH_HOOK', 'Invalid or no user data in profile response', response);
          // Clear invalid token
          localStorage.removeItem('token');
          return false;
        }
      } catch (error) {
        debugLog('AUTH_HOOK', 'Failed to fetch user profile', error);
        // Clear the token on failure
        localStorage.removeItem('token');
        return false;
      } finally {
        setIsLoading(false);
      }
    } else {
      debugLog('AUTH_HOOK', 
        token ? 'User is already loaded' : 'No token found',
        { hasToken: !!token, hasUser: !!auth.user }
      );
      setIsLoading(false);
      return !!auth.user;
    }
  }, [auth]);
  
  useEffect(() => {
    checkAndLoadProfile();
  }, [checkAndLoadProfile]);  // Dependency on the callback
  return {
    ...auth,
    isLoading,
    checkAndLoadProfile
  };
};
