import api from './axiosConfig';
import { debugLog } from '../utils/debug';

// Path relative to the baseURL in axiosConfig
// The backend uses /api/v1/admin, but our baseURL already includes /api/v1
const ADMIN_PATH = '/admin';

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

// Get admin activities
export const getAdminActivities = async (): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Fetching admin activities');
        
        // Use the activity endpoint as it has all activities
        const response = await api.get('/activity/all');
        
        debugLog('ADMIN', 'Admin activities response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error fetching admin activities', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to fetch activities'
        };
    }
};

// Delete activity
export const deleteActivity = async (activityId: number): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', `Deleting activity ID: ${activityId}`);
        
        // Use the activity controller endpoint since that's what's available
        const response = await api.delete(`/activity/delete/${activityId}`);
        
        debugLog('ADMIN', 'Delete activity response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', `Error deleting activity ID: ${activityId}`, error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to delete activity'
        };
    }
};

// Create or update activity
export const saveActivity = async (activityData: any): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Saving activity', activityData);
        
        let response;
        if (activityData.id) {
            // Update existing activity
            // Use the activity controller endpoint since that's what's available
            response = await api.put(`/activity/update/${activityData.id}`, activityData);
        } else {
            // Create new activity
            // Use the activity controller endpoint since that's what's available
            response = await api.post(`/activity/save`, activityData);
        }
        
        debugLog('ADMIN', 'Save activity response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error saving activity', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to save activity'
        };
    }
};
