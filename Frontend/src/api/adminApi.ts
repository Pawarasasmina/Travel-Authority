import api from './axiosConfig';
import { debugLog } from '../utils/debug';

const ADMIN_PATH = '/api/v1/admin';

interface ApiResponse {
    data: any;
    status: string;
    message: string;
}

// Get dashboard stats
export const getDashboardStats = async (): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Fetching dashboard stats');
        
        const response = await api.get(`${ADMIN_PATH}/dashboard`);
        
        debugLog('ADMIN', 'Dashboard stats response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error fetching dashboard stats', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to fetch dashboard stats'
        };
    }
};

// Get all users
export const getAllUsers = async (): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Fetching all users');
        
        const response = await api.get(`${ADMIN_PATH}/users`);
        
        debugLog('ADMIN', 'All users response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error fetching all users', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to fetch users'
        };
    }
};

// Update user role
export const updateUserRole = async (userId: number, role: string): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', `Updating user ${userId} role to ${role}`);
        
        const response = await api.put(`${ADMIN_PATH}/users/${userId}/role`, { role });
        
        debugLog('ADMIN', 'Update user role response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error updating user role', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to update user role'
        };
    }
};

// Check if current user has admin access
export const checkAdminAccess = async (): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Checking admin access');
        
        const response = await api.get(`${ADMIN_PATH}/check-admin`);
        
        debugLog('ADMIN', 'Admin access check response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error checking admin access', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to check admin access'
        };
    }
};
