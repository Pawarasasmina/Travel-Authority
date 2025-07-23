import api from './axiosConfig';
import { Activity } from '../types';
import { debugLog } from '../utils/debug';

const BASE_URL = '/activity';

export const fetchAllActivities = async () => {
  const res = await api.get(`${BASE_URL}/all`);
  return res.data.data; // assuming backend returns { data: [...] }
};

export const fetchActiveActivities = async () => {
  const res = await api.get(`${BASE_URL}/active`);
  return res.data.data; // assuming backend returns { data: [...] }
};

export const fetchActivityById = async (id: number) => {
  const res = await api.get(`${BASE_URL}/${id}`);
  return res.data.data; // assuming backend returns { data: {...} }
};

export const createActivity = async (activityData: Activity) => {
  const res = await api.post(`${BASE_URL}/save`, activityData);
  return res.data;
};

export const updateActivity = async (id: number, activityData: Activity) => {
  const res = await api.put(`${BASE_URL}/update/${id}`, activityData);
  return res.data;
};

export const deleteActivity = async (id: number) => {
  const res = await api.delete(`${BASE_URL}/delete/${id}`);
  return res.data;
};

// Check activity availability for a specific date and package
export const checkAvailability = async (activityId: number, packageId: number | undefined, date: string) => {
  try {
    debugLog('ACTIVITY', 'Checking availability', { activityId, packageId, date });
    
    const res = await api.get(`${BASE_URL}/check-availability`, { 
      params: { 
        activityId, 
        packageId: packageId || 0,  // Use 0 if packageId is undefined
        date 
      } 
    });
    
    debugLog('ACTIVITY', 'Availability response', res.data);
    return res.data;
  } catch (error: any) {
    debugLog('ACTIVITY', 'Error checking availability', error);
    if (error.response) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Failed to check availability: ' + error.message,
      data: { available: false, bookedCount: 0, maxAvailability: 0 }
    };
  }
};
