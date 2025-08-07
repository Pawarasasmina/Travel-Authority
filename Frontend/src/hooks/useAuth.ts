import { useEffect, useState, useCallback } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { getUserProfile } from '../api/authApi';
import { debugLog } from '../utils/debug';

// Enhanced hook with auto-loading capability
export const useAuth = () => {
  const auth = useAuthContext();
  const [additionalLoading, setAdditionalLoading] = useState<boolean>(false);
    // Function to check and load user profile
  const checkAndLoadProfile = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    if (token && !auth.user && !auth.isLoading) {
      setAdditionalLoading(true);
      debugLog('AUTH_HOOK', 'Found token but no user, fetching profile');
      
      try {
        const response = await getUserProfile();
        debugLog('AUTH_HOOK', 'Auto-fetched user profile', response);
        
        if (response.status === "OK" && response.data) {
          debugLog('AUTH_HOOK', 'Setting user data from profile', response.data);
          
          // Ensure we're using the complete user data with all fields
          const profileData = response.data;
          debugLog('AUTH_HOOK', 'Profile data contains birthdate and gender:', {
            hasBirthdate: !!profileData.birthdate,
            hasGender: !!profileData.gender,
            birthdateValue: profileData.birthdate,
            genderValue: profileData.gender
          });
          
          auth.login(profileData, token);
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
        setAdditionalLoading(false);
      }
    } else {
      debugLog('AUTH_HOOK', 
        token ? 'User is already loaded or auth is loading' : 'No token found',
        { hasToken: !!token, hasUser: !!auth.user, authLoading: auth.isLoading }
      );
      return !!auth.user;
    }
  }, [auth]);
  
  useEffect(() => {
    if (!auth.isLoading) {
      checkAndLoadProfile();
    }
  }, [checkAndLoadProfile, auth.isLoading]);  // Dependency on the callback
  return {
    ...auth,
    isLoading: auth.isLoading || additionalLoading,
    checkAndLoadProfile
  };
};
