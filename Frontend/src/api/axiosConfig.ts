
import axios from 'axios';
import { debugLog } from '../utils/debug';

// Create a custom axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1'
});

// Add a request interceptor to attach the JWT token
api.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Debug token value to see format issues
      debugLog('API', `Token value (first 10 chars): ${token.substring(0, 10)}...`);
      
      config.headers.Authorization = `Bearer ${token}`;
      debugLog('API', `Request to ${config.url} with auth token`);
      
      // Debug full authorization header
      debugLog('API', `Authorization header: ${config.headers.Authorization}`);
    } else {
      debugLog('API', `Request to ${config.url} without auth token (none found)`);
    }
    return config;
  },
  (error) => {
    debugLog('API', 'Request error', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    debugLog('API', `Response from ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    debugLog('API', 'Response error', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    
    // If 401 Unauthorized, clear local storage and redirect to login
    if (error.response && error.response.status === 401) {
      debugLog('AUTH', 'Unauthorized access, clearing credentials');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Export the authenticated API
export default api;

// Export non-authenticated API for login/register
export const publicApi = axios.create({
  baseURL: 'http://localhost:8080/api/v1'
});

// Add debugging interceptors to public API too
publicApi.interceptors.request.use(
  (config) => {
    debugLog('PUBLIC_API', `Request to ${config.url}`);
    return config;
  },
  (error) => {
    debugLog('PUBLIC_API', 'Request error', error);
    return Promise.reject(error);
  }
);

publicApi.interceptors.response.use(
  (response) => {
    debugLog('PUBLIC_API', `Response from ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    debugLog('PUBLIC_API', 'Response error', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message
    });
    return Promise.reject(error);
  }
);
