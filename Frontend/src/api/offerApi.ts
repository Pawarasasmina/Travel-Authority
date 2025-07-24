import api from './axiosConfig';
import { debugLog } from '../utils/debug';

const OFFERS_PATH = '/offers';

export interface OfferData {
    id?: number;
    title: string;
    image: string;
    discount?: string;
    active?: boolean;
}

interface ApiResponse {
    data: any;
    status: string;
    message: string;
    success?: boolean;
}

// Get all offers
export const getAllOffers = async (): Promise<ApiResponse> => {
    try {
        debugLog('OFFERS', 'Fetching all offers');
        
        const response = await api.get(`${OFFERS_PATH}/all`);
        
        debugLog('OFFERS', 'All offers response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OFFERS', 'Error fetching all offers', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to fetch offers'
        };
    }
};
        
// Get offers by owner email
export const getOffersByOwner = async (email: string): Promise<any[]> => {
    try {
        debugLog('OFFERS', `Fetching offers for owner: ${email}`);
        
        const response = await api.get(`${OFFERS_PATH}/owner/${email}`);
        
        debugLog('OFFERS', 'Owner offers response', response.data);
        
        return response.data.data || [];
    } catch (error: any) {
        debugLog('OFFERS', 'Error fetching owner offers', error);
        return [];
    }
};

// Get active offers
export const getActiveOffers = async (): Promise<ApiResponse> => {
    try {
        debugLog('OFFERS', 'Fetching active offers');
        
        const response = await api.get(`${OFFERS_PATH}/active`);
        
        debugLog('OFFERS', 'Active offers response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OFFERS', 'Error fetching active offers', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to fetch active offers'
        };
    }
};

// Get offer by ID
export const getOfferById = async (offerId: number): Promise<ApiResponse> => {
    try {
        debugLog('OFFERS', `Fetching offer ID: ${offerId}`);
        
        const response = await api.get(`${OFFERS_PATH}/${offerId}`);
        
        debugLog('OFFERS', 'Offer by ID response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OFFERS', 'Error fetching offer by ID', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to fetch offer'
        };
    }
};

// Save offer (create or update)
export const saveOffer = async (offerData: OfferData): Promise<ApiResponse> => {
    try {
        debugLog('OFFERS', 'Saving offer', offerData);
        
        let response;
        if (offerData.id && offerData.id > 0) {
            // Update existing offer
            response = await api.put(`${OFFERS_PATH}/update/${offerData.id}`, offerData);
        } else {
            // Create new offer
            response = await api.post(`${OFFERS_PATH}/save`, offerData);
        }
        
        debugLog('OFFERS', 'Save offer response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OFFERS', 'Error saving offer', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to save offer'
        };
    }
};

// Delete offer
export const deleteOffer = async (offerId: number): Promise<ApiResponse> => {
    try {
        debugLog('OFFERS', `Deleting offer ID: ${offerId}`);
        
        const response = await api.delete(`${OFFERS_PATH}/delete/${offerId}`);
        
        debugLog('OFFERS', 'Delete offer response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OFFERS', 'Error deleting offer', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to delete offer'
        };
    }
};

// Delete all offers
export const deleteAllOffers = async (): Promise<ApiResponse> => {
    try {
        debugLog('OFFERS', 'Deleting all offers');
        
        const response = await api.delete(`${OFFERS_PATH}/delete/all`);
        
        debugLog('OFFERS', 'Delete all offers response', response.data);
        
        return response.data;
    } catch (error: any) {
        debugLog('OFFERS', 'Error deleting all offers', error);
        if (error.response) {
            return error.response.data;
        }
        return {
            data: null,
            status: 'ERROR',
            message: 'Failed to delete all offers'
        };
    }
};
