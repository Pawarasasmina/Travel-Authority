import api from './axiosConfig';
import { debugLog } from '../utils/debug';

// Path relative to the baseURL in axiosConfig
// The backend uses /api/v1/admin, but our baseURL already includes /api/v1
const ADMIN_PATH = '/admin';

interface ApiResponse {
    data: any;
    status: string;
    message: string;
    success?: boolean; // Backend sometimes includes this field
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

// Edit user details
export const editUser = async (userId: number, userData: any): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', `Editing user ${userId}`, userData);
        
        const response = await api.put(`/user/update/${userId}`, userData);
        
        debugLog('ADMIN', 'Edit user response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error editing user', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to edit user'
        };
    }
};

// Delete user
export const deleteUser = async (userId: number): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', `Deleting user ${userId}`);
        
        const response = await api.delete(`/user/delete/${userId}`);
        
        debugLog('ADMIN', 'Delete user response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error deleting user', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to delete user'
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

// Delete all activities
export const deleteAllActivities = async (): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Deleting all activities');
        
        const response = await api.delete('/activity/delete/all');
        
        debugLog('ADMIN', 'Delete all activities response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error deleting all activities', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to delete all activities'
        };
    }
};

// Create or update activity
export const saveActivity = async (activityData: any): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Saving activity', activityData);
        
        // Debug log for packages' availability
        activityData.packages?.forEach((pkg: any) => {
            console.log(`[adminApi] Package ${pkg.name} - Availability before mapping: ${pkg.availability}, type: ${typeof pkg.availability}`);
        });
        
        // Clean up the activity data to match backend DTO expectations
        const cleanActivityData = {
            ...activityData,
            // Ensure numeric values are properly typed
            price: Number(activityData.price) || 0,
            availability: Number(activityData.availability) || 0,
            rating: Number(activityData.rating) || 0,
            // Ensure packages array is properly formatted with pricing tiers
            packages: activityData.packages?.map((pkg: any) => ({
                // If id is 0, undefined, or null, don't include it
                ...(pkg.id && pkg.id > 0 ? { id: pkg.id } : {}),
                name: pkg.name,
                description: pkg.description || '',
                price: Number(pkg.price) || 0,
                // Fix: Add availability field to packages
                availability: typeof pkg.availability === 'number' ? pkg.availability : 10,
                foreignAdultPrice: Number(pkg.foreignAdultPrice) || 0,
                foreignKidPrice: Number(pkg.foreignKidPrice) || 0,
                localAdultPrice: Number(pkg.localAdultPrice) || 0,
                localKidPrice: Number(pkg.localKidPrice) || 0,
                features: pkg.features || [],
                // Include images if they exist
                images: pkg.images || []
            })) || [],
            // Ensure boolean fields are properly typed
            active: Boolean(activityData.active !== undefined ? activityData.active : true)
        };
        
        // Debug log for packages after mapping
        cleanActivityData.packages?.forEach((pkg: any) => {
            console.log(`[adminApi] Package ${pkg.name} - Availability after mapping: ${pkg.availability}, type: ${typeof pkg.availability}`);
        });
        
        let response;
        if (activityData.id && activityData.id > 0) {
            // Update existing activity
            // Create a copy without the ID to avoid potential backend issues with ID handling
            const { id, ...updateData } = cleanActivityData;
            debugLog('ADMIN', `Updating activity ${activityData.id} with data`, updateData);
            response = await api.put(`/activity/update/${activityData.id}`, updateData);
        } else {
            // Create new activity - remove id field for new activities
            const { id, ...newActivityData } = cleanActivityData;
            debugLog('ADMIN', 'Creating new activity with data', newActivityData);
            response = await api.post(`/activity/save`, newActivityData);
        }
        
        debugLog('ADMIN', 'Save activity response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error saving activity', error);
        if (error.response) {
            // Log detailed error information
            debugLog('ADMIN', 'Server error response', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
            });
            return {
                data: null,
                status: 'ERROR',
                message: error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText}`
            };
        }
        return {
            data: null,
            status: 'ERROR',
            message: error.message || 'Failed to save activity'
        };
    }
};

// Get all bookings for admin
export const getAllBookings = async (): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Fetching all bookings');
        
        const response = await api.get(`${ADMIN_PATH}/bookings`);
        
        debugLog('ADMIN', 'All bookings response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error fetching all bookings', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to fetch bookings'
        };
    }
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: string): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', `Updating booking ${bookingId} status to ${status}`);
        
        const response = await api.put(`${ADMIN_PATH}/bookings/${bookingId}/status`, { status });
        
        debugLog('ADMIN', 'Update booking status response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error updating booking status', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to update booking status'
        };
    }
};

// Verify QR Code
export const verifyQRCode = async (qrCodeData: string): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Verifying QR code', qrCodeData);
        
        const response = await api.post('/bookings/verify-qr', {
            qrCodeData: qrCodeData
        });
        
        debugLog('ADMIN', 'QR verification response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error verifying QR code', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to verify QR code'
        };
    }
};

// Mark booking as completed after QR verification
export const markBookingAsCompleted = async (bookingId: string): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', `Marking booking ${bookingId} as completed`);
        
        const response = await api.post(`/bookings/${bookingId}/complete`);
        
        debugLog('ADMIN', 'Mark booking as completed response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error marking booking as completed', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to mark booking as completed'
        };
    }
};

// Delete single booking
export const deleteBooking = async (bookingId: string): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', `Deleting booking ${bookingId}`);
        
        const response = await api.delete(`/bookings/${bookingId}`);
        
        debugLog('ADMIN', 'Delete booking response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error deleting booking', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to delete booking'
        };
    }
};

// Delete all bookings
export const deleteAllBookings = async (): Promise<ApiResponse> => {
    try {
        debugLog('ADMIN', 'Deleting all bookings');
        
        const response = await api.delete('/bookings/all');
        
        debugLog('ADMIN', 'Delete all bookings response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('ADMIN', 'Error deleting all bookings', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to delete all bookings'
        };
    }
};
