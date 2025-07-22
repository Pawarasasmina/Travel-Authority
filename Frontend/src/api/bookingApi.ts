import api from './axiosConfig';
import { debugLog } from '../utils/debug';

const BOOKING_PATH = '/bookings';

interface BookingRequest {
    activityId: number;
    activityTitle: string;
    activityLocation: string;
    image: string;
    description?: string;
    bookingDate: string;
    packageId?: number;
    packageName?: string;
    basePrice: number;
    serviceFee: number;
    tax: number;
    totalPrice: number;
    totalPersons: number;
    paymentMethod: string;
    peopleCounts: Record<string, number>;
    contactEmail?: string;
    contactPhone?: string;
    ticketInstructions?: string;
    itinerary?: string;
    cancellationPolicy?: string;
}

interface BookingResponse {
    id: string;
    title: string;
    location: string;
    image: string;
    bookingDate: string;
    status: string;
    basePrice: number;
    serviceFee: number;
    tax: number;
    totalPrice: number;
    totalPersons: number;
    bookingTime: string;
    paymentMethod: string;
    packageId?: number;
    packageName?: string;
    activityId: number;
    peopleCounts: Record<string, number>;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    ticketInstructions?: string;
    itinerary?: string;
    cancellationPolicy?: string;
    orderNumber?: string;
    userEmail?: string;
    userName?: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
}

// Create a new booking
export const createBooking = async (bookingData: BookingRequest): Promise<ApiResponse> => {
    try {
        debugLog('BOOKING', 'Creating booking', bookingData);
        
        const response = await api.post(BOOKING_PATH, bookingData);
        
        debugLog('BOOKING', 'Booking creation response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('BOOKING', 'Error creating booking', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            success: false,
            message: 'Failed to create booking: ' + error.message,
            data: null
        };
    }
};

// Get user's bookings
export const getUserBookings = async (status?: string): Promise<ApiResponse> => {
    try {
        debugLog('BOOKING', 'Fetching user bookings', { status });
        
        // Get user email from localStorage to ensure we're only getting the current user's bookings
        let userEmail: string | undefined;
        try {
            const userJson = localStorage.getItem('user');
            if (userJson) {
                const userData = JSON.parse(userJson);
                userEmail = userData.email;
            }
        } catch (err) {
            debugLog('BOOKING', 'Error parsing user data', err);
        }
        
        // Include user email in params if available, along with status
        const params: Record<string, string> = {};
        if (status) params.status = status;
        if (userEmail) params.userEmail = userEmail;
        
        // The backend should be authenticating and filtering based on JWT token,
        // but we're also sending the email as an extra precaution
        const response = await api.get(BOOKING_PATH, { params });
        
        debugLog('BOOKING', 'User bookings response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('BOOKING', 'Error fetching user bookings', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            success: false,
            message: 'Failed to fetch bookings: ' + error.message,
            data: null
        };
    }
};

// Get booking by ID
export const getBookingById = async (bookingId: string): Promise<ApiResponse> => {
    try {
        debugLog('BOOKING', 'Fetching booking by ID', { bookingId });
        
        const response = await api.get(`${BOOKING_PATH}/${bookingId}`);
        
        debugLog('BOOKING', 'Booking by ID response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('BOOKING', 'Error fetching booking by ID', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            success: false,
            message: 'Failed to fetch booking: ' + error.message,
            data: null
        };
    }
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: string): Promise<ApiResponse> => {
    try {
        debugLog('BOOKING', 'Updating booking status', { bookingId, status });
        
        const response = await api.put(`${BOOKING_PATH}/${bookingId}/status`, null, {
            params: { status }
        });
        
        debugLog('BOOKING', 'Update booking status response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('BOOKING', 'Error updating booking status', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            success: false,
            message: 'Failed to update booking status: ' + error.message,
            data: null
        };
    }
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<ApiResponse> => {
    try {
        debugLog('BOOKING', 'Cancelling booking', { bookingId });
        
        const response = await api.put(`${BOOKING_PATH}/${bookingId}/cancel`);
        
        debugLog('BOOKING', 'Cancel booking response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('BOOKING', 'Error cancelling booking', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            success: false,
            message: 'Failed to cancel booking: ' + error.message,
            data: null
        };
    }
};

export type { BookingRequest, BookingResponse };
