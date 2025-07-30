import api from './axiosConfig';
import { debugLog } from '../utils/debug';

const ADMIN_PATH = '/admin';
const OWNER_PATH = '/admin/owner';

interface ApiResponse {
    data: any;
    status: string;
    message: string;
    success?: boolean;
}

// Owner Booking Management APIs

// Get bookings for the owner's activities
export const getOwnerBookings = async (): Promise<ApiResponse> => {
    try {
        debugLog('OWNER', 'Fetching owner bookings');
        
        const response = await api.get(`${OWNER_PATH}/bookings`);
        
        debugLog('OWNER', 'Owner bookings response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OWNER', 'Error fetching owner bookings', error);
        if (error.response) {
            // Ensure we return a proper error structure
            return {
                data: null,
                status: 'ERROR',
                message: error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText || 'Failed to fetch owner bookings'}`
            };
        }
        return {
            data: null,
            status: 'ERROR',
            message: error.message || 'Failed to fetch owner bookings'
        };
    }
};

// Update booking status (owner can only update bookings for their activities)
export const updateOwnerBookingStatus = async (bookingId: string, status: string): Promise<ApiResponse> => {
    try {
        debugLog('OWNER', `Updating owner booking ${bookingId} status to ${status}`);
        
        const response = await api.put(`${OWNER_PATH}/bookings/${bookingId}/status`, {
            status: status
        });
        
        debugLog('OWNER', 'Owner booking status update response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OWNER', 'Error updating owner booking status', error);
        if (error.response) {
            return {
                data: null,
                status: 'ERROR',
                message: error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText || 'Failed to update booking status'}`
            };
        }
        return {
            data: null,
            status: 'ERROR',
            message: error.message || 'Failed to update booking status'
        };
    }
};

// Mark booking as completed after QR verification (owner)
export const markOwnerBookingAsCompleted = async (bookingId: string): Promise<ApiResponse> => {
    try {
        debugLog('OWNER', `Marking owner booking ${bookingId} as completed`);
        
        const response = await api.post(`${OWNER_PATH}/bookings/${bookingId}/complete`);
        
        debugLog('OWNER', 'Mark owner booking as completed response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OWNER', 'Error marking owner booking as completed', error);
        if (error.response) {
            return {
                data: null,
                status: 'ERROR',
                message: error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText || 'Failed to mark booking as completed'}`
            };
        }
        return {
            data: null,
            status: 'ERROR',
            message: error.message || 'Failed to mark booking as completed'
        };
    }
};

// Verify QR Code for owner's activities
export const verifyOwnerQRCode = async (qrCodeData: string): Promise<ApiResponse> => {
    try {
        debugLog('OWNER', 'Verifying owner QR code', qrCodeData);
        
        const response = await api.post(`${OWNER_PATH}/bookings/verify-qr`, {
            qrCodeData: qrCodeData
        });
        
        debugLog('OWNER', 'Owner QR verification response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OWNER', 'Error verifying owner QR code', error);
        if (error.response) {
            return {
                data: null,
                status: 'ERROR',
                message: error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText || 'Failed to verify QR code'}`
            };
        }
        return {
            data: null,
            status: 'ERROR',
            message: error.message || 'Failed to verify QR code'
        };
    }
};

// Check if current user has travel activity owner access
export const checkTravelOwnerAccess = async (): Promise<ApiResponse> => {
    try {
        debugLog('OWNER', 'Checking travel owner access');
        
        const response = await api.get(`${ADMIN_PATH}/check-owner`);
        
        debugLog('OWNER', 'Travel owner access check response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OWNER', 'Error checking travel owner access', error);
        if (error.response) {
            return {
                data: null,
                status: 'ERROR',
                message: error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText || 'Failed to check travel owner access'}`
            };
        }
        return {
            data: null,
            status: 'ERROR',
            message: error.message || 'Failed to check travel owner access'
        };
    }
};

// Get travel owner dashboard stats
export const getTravelOwnerStats = async (): Promise<ApiResponse> => {
    try {
        debugLog('OWNER', 'Fetching travel owner dashboard stats');
        
        const response = await api.get(`${ADMIN_PATH}/owner/dashboard`);
        
        debugLog('OWNER', 'Travel owner dashboard stats response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OWNER', 'Error fetching travel owner stats', error);
        if (error.response) {
            return {
                data: null,
                status: 'ERROR',
                message: error.response.data?.message || `Error ${error.response.status}: ${error.response.statusText || 'Failed to fetch travel owner stats'}`
            };
        }
        return {
            data: null,
            status: 'ERROR',
            message: error.message || 'Failed to fetch travel owner stats'
        };
    }
};
