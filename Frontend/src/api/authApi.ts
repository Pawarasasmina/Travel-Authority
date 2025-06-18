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

interface UpdateUserProfileData {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    birthdate?: string;
    gender?: string;
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
};

// Function to get the current user's profile using the token
export const getUserProfile = async (): Promise<ApiResponse> => {
    try {
        debugLog('AUTH', 'Fetching user profile with auth token');
        
        // Use the intercepted api for authenticated requests
        const response = await api.get('/users/profile');
        
        debugLog('AUTH', 'User profile response', response.data);
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

// Function to update user's profile
export const updateUserProfile = async (userId: number, userData: UpdateUserProfileData): Promise<ApiResponse> => {
    try {
        debugLog('AUTH', 'Updating user profile', userData);
        
        // Using authenticated API instance
        const response = await api.put(`/users/${userId}`, userData);
        
        debugLog('AUTH', 'Update profile response', response.data);
        return response.data;
    } catch (error: any) {
        debugLog('AUTH', 'Update profile error', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to update profile'
        };
    }
};

// Function to upload user's profile image
export const uploadProfileImage = async (userId: number, file: File): Promise<ApiResponse> => {
    try {
        debugLog('AUTH', 'Uploading profile image');
        
        // Create form data
        const formData = new FormData();
        formData.append('profileImage', file);
        
        // Use authenticated API with multipart/form-data
        const response = await api.post(`/users/${userId}/profile-image`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        debugLog('AUTH', 'Profile image upload response', response.data);
        return response.data;
    } catch (error: any) {
        debugLog('AUTH', 'Profile image upload error', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to upload profile image'
        };
    }
};
