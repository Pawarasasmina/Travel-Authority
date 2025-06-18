import React, { createContext, useState, useContext, useEffect } from 'react';

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
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    token: null,
    login: () => {},
    logout: () => {},
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
    }, []);    const login = (userData: User, authToken?: string) => {
        console.log('Login with user data:', userData);
        
        if (!userData) {
            console.error("Attempted login with null or undefined user data");
            return;
        }
        
        // Make sure we have all required user properties even if API response is inconsistent
        const normalizedUser: User = {
            id: userData.id || 0,
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            phoneNumber: userData.phoneNumber || '',
            nic: userData.nic || ''
        };
        
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
    };    const logout = () => {
        console.log('Logging out user');
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
