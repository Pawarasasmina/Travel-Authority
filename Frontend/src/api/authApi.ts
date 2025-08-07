import api, { publicApi } from './axiosConfig';
import { debugLog } from '../utils/debug';

const AUTH_PATH = '/auth';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    nic: string;
    password: string;
    confirmPassword: string;
}

interface ApiResponse {
    data: any;
    status: string;
    message: string;
}

export const login = async (credentials: LoginCredentials): Promise<ApiResponse> => {
    try {
        debugLog('AUTH', 'Sending login request with credentials', credentials);
        
        // Use publicApi for login since we don't have a token yet
        const response = await publicApi.post(`${AUTH_PATH}/login`, credentials);
        
        // Log the exact structure we're receiving
        debugLog('AUTH', 'Login response structure', response.data);
          // Store token if present in the response
        if ((response.data.status === "OK" || response.data.status === "200 OK") && response.data.data?.token) {
            debugLog('AUTH', 'Setting token in localStorage');
            localStorage.setItem('token', response.data.data.token);
        } else if ((response.data.status === "OK" || response.data.status === "200 OK") && response.data.token) {
            debugLog('AUTH', 'Setting token from response.data.token');
            localStorage.setItem('token', response.data.token);
        } else if (response.data.data && response.data.data.accessToken) {
            debugLog('AUTH', 'Setting token from response.data.data.accessToken');
            localStorage.setItem('token', response.data.data.accessToken);
        }
        
        return response.data;
    } catch (error: any) {
        debugLog('AUTH', 'Login error', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Network error occurred'
        };
    }
};

export const register = async (userData: RegisterData): Promise<ApiResponse> => {
    try {
        debugLog('AUTH', 'Sending registration request', userData);
        
        // Use publicApi for registration since we don't have a token yet
        const response = await publicApi.post(`${AUTH_PATH}/register`, userData);
        
        debugLog('AUTH', 'Registration response', response.data);
        
        // Handle different response status formats
        // If registration is successful and includes a token, store it
        if ((response.data.status === "CREATED" || response.data.status === "OK" || 
             response.data.status === "200 OK" || response.data.status === "201 CREATED") && 
            response.data.data?.token) {
            debugLog('AUTH', 'Setting token from registration response data.token');
            localStorage.setItem('token', response.data.data.token);
        } else if ((response.data.status === "CREATED" || response.data.status === "OK" || 
                   response.data.status === "200 OK" || response.data.status === "201 CREATED") && 
                  response.data.token) {
            debugLog('AUTH', 'Setting token directly from registration response token');
            localStorage.setItem('token', response.data.token);
        } else if (response.data.data && response.data.data.accessToken) {
            debugLog('AUTH', 'Setting token from registration response data.accessToken');
            localStorage.setItem('token', response.data.data.accessToken);
        }
        
        return response.data;
    } catch (error: any) {
        debugLog('AUTH', 'Registration error', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Network error occurred'
        };
    }
};  // Function to get the current user's profile using the token
export const getUserProfile = async (): Promise<ApiResponse> => {
    try {
        debugLog('AUTH', 'Fetching user profile with auth token');
        
        // Use the intercepted api for authenticated requests
        const response = await api.get('/users/profile');
        
        debugLog('AUTH', 'User profile response', response.data);
        
        // Check if we have user data with birthdate and gender
        if (response.data && response.data.data) {
            debugLog('AUTH', 'Profile data includes:', Object.keys(response.data.data));
        }
        
        return response.data;
    } catch (error: any) {
        debugLog('AUTH', 'Get user profile error', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to get user profile'
        };
    }
};

// Function to update user profile information
export interface UpdateProfileData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    birthdate?: string;
    gender?: string;
}

export const updateUserProfile = async (userData: UpdateProfileData): Promise<ApiResponse> => {
    try {
        debugLog('AUTH', 'Updating user profile with data', userData);
        debugLog('AUTH', 'Birthdate and gender values being updated:', {
            birthdate: userData.birthdate,
            gender: userData.gender
        });
        
        // Get the user ID from local storage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            debugLog('AUTH', 'No user found in localStorage');
            return {
                data: null,
                status: 'ERROR',
                message: 'User not authenticated'
            };
        }
        
        const user = JSON.parse(storedUser);
        const userId = user.id;
        
        debugLog('AUTH', `Updating profile for user ID: ${userId}`);
        
        // Using the authenticated API instance
        const response = await api.put(`/users/${userId}/profile`, userData);
        
        debugLog('AUTH', 'Update profile response', response.data);
        debugLog('AUTH', 'Response data structure:', {
            status: response.data.status,
            message: response.data.message,
            hasData: !!response.data.data,
            dataKeys: response.data.data ? Object.keys(response.data.data) : []
        });
        
        // Update the user in localStorage to reflect the changes
        if (response.data.status === "OK" || response.data.status === "200 OK") {
            const updatedUser = {
                ...user,
                ...(userData.firstName ? { firstName: userData.firstName } : {}),
                ...(userData.lastName ? { lastName: userData.lastName } : {}),
                ...(userData.email ? { email: userData.email } : {}),
                ...(userData.phoneNumber ? { phoneNumber: userData.phoneNumber } : {}),
                ...(userData.birthdate ? { birthdate: userData.birthdate } : {}),
                ...(userData.gender ? { gender: userData.gender } : {})
            };
            debugLog('AUTH', 'Updating localStorage with new user data', updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        return response.data;
    } catch (error: any) {
        debugLog('AUTH', 'Update profile error', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to update user profile'
        };
    }
};

// Function to update user's password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<ApiResponse> => {
    try {
        debugLog('AUTH', 'Changing user password');
        
        // Get the user ID from local storage
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            debugLog('AUTH', 'No user found in localStorage');
            return {
                data: null,
                status: 'ERROR',
                message: 'User not authenticated'
            };
        }
          const userData = JSON.parse(storedUser);
        const userId = userData.id;
        debugLog('AUTH', `Found user ID: ${userId} for password change`);
        
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
            debugLog('AUTH', 'No authentication token found');
            return {
                data: null,
                status: 'ERROR',
                message: 'Authentication token is missing'
            };
        }
        debugLog('AUTH', `Using token (first 10 chars): ${token.substring(0, 10)}...`);
          
        // Using correct path without duplicating the /api/v1 prefix that's already in baseURL
        const endpoint = `/user/change-password/${userId}`;
        debugLog('AUTH', `Making request to endpoint: ${endpoint}`);
          
        const response = await api.post(endpoint, {
            currentPassword,
            newPassword
        });
        
        debugLog('AUTH', 'Change password response', response.data);
        return response.data;
    } catch (error: any) {
        debugLog('AUTH', 'Change password error', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to change password'
        };
    }
};
