import React, { createContext, useState, useContext, useEffect } from 'react';
import { updateUserProfile, UpdateProfileData } from '../api/authApi';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nic: string;
    birthdate?: string;
    gender?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;
    login: (userData: User, authToken?: string) => void;
    logout: () => void;
    updateUser: (userData: UpdateProfileData) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    token: null,
    login: () => {},
    logout: () => {},
    updateUser: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    useEffect(() => {
        // Check if user and token are stored in localStorage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Error parsing stored user data:", error);
                localStorage.removeItem('user'); // Remove invalid data
            }
        }
        
        if (storedToken) {
            setToken(storedToken);
            setIsAuthenticated(true);
        }
    }, []);
    
    const login = (userData: User, authToken?: string) => {
        console.log('Login with user data:', userData);
        
        if (!userData) {
            console.error("Attempted login with null or undefined user data");
            return;
        }        // Make sure we have all required user properties even if API response is inconsistent
        const normalizedUser: User = {
            id: userData.id || 0,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            nic: userData.nic || '',
            // Explicitly handle birthdate and gender to preserve their values correctly
            // Handle all possible falsy values (null, undefined, empty string)
            birthdate: userData.birthdate || '',
            gender: userData.gender || ''
        };
        
        // Log complete user data for debugging
        console.log('Complete normalized user data with birthdate and gender:', {
            birthdate: userData.birthdate,
            gender: userData.gender,
            normalizedValues: {
                birthdate: normalizedUser.birthdate,
                gender: normalizedUser.gender
            }
        });
        
        console.log('Normalized user data for login:', normalizedUser);
        
        // Set the user in state
        setUser(normalizedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
        
        // If a token is passed directly, use it
        if (authToken) {
            console.log('Setting auth token from parameter:', authToken);
            setToken(authToken);
            localStorage.setItem('token', authToken);
        } 
        // Otherwise check localStorage as fallback
        else {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                console.log('Using existing token from localStorage');
                setToken(storedToken);
            } else {
                console.warn('No authentication token available');
            }
        }
    };
    
    const logout = () => {
        console.log('Logging out user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/login';
    };
      const updateUser = async (userData: UpdateProfileData): Promise<boolean> => {
        if (!user) {
            console.error("Attempted to update profile when no user is logged in");
            return false;
        }
        
        try {
            console.log('Updating user profile with data:', userData);
            const response = await updateUserProfile(userData);
              if (response.status === "OK" || response.status === "200 OK") {
                // Create updated user object
                const updatedUser = {
                    ...user,
                    ...(userData.firstName && userData.lastName ? { 
                        firstName: userData.firstName,
                        lastName: userData.lastName
                    } : {}),
                    ...(userData.email ? { email: userData.email } : {}),
                    ...(userData.phoneNumber ? { phoneNumber: userData.phoneNumber } : {}),
                    ...(userData.birthdate ? { birthdate: userData.birthdate } : {}),
                    ...(userData.gender ? { gender: userData.gender } : {})
                };
                
                // Debug log for birthdate and gender fields
                console.log('Update profile fields:', {
                    originalUserBirthdate: user.birthdate,
                    originalUserGender: user.gender,
                    newBirthdate: userData.birthdate,
                    newGender: userData.gender,
                    updatedUserBirthdate: updatedUser.birthdate,
                    updatedUserGender: updatedUser.gender
                });
                
                // Update state and localStorage
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
                console.log('User updated in state and localStorage:', updatedUser);
                return true;
            }
            
            return false;
        } catch (error) {
            console.error("Error updating user profile:", error);
            return false;
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
