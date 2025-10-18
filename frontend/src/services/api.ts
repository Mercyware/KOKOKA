import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse, PaginatedResponse, House } from '../types';
import { Section } from '../types/Section';
import { getEffectiveSubdomain, initDevSubdomain } from '../utils/devSubdomain';
import { API_CONFIG } from '../config/api';

// Get the current subdomain from the hostname or development override
const getSubdomain = (): string | null => {
  const hostname = window.location.hostname;
  
  // For development environment, check if subdomain is in localStorage
  if (hostname === 'localhost' || hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    // Initialize with a default subdomain if none exists
    // You can change 'greenwood' to any default subdomain you want to use for development
    const devSubdomain = initDevSubdomain('greenwood');
    if (devSubdomain) {
      console.log(`Using development subdomain: ${devSubdomain}`);
      return devSubdomain;
    }
    return null;
  }
  
  // Extract subdomain from hostname
  // Example: school.domain.com -> subdomain = school
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    return parts[0].toLowerCase();
  }
  
  return null;
};

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Add subdomain to headers if available
const subdomain = getSubdomain();
console.log('Current subdomain:', subdomain);
if (subdomain) {
  api.defaults.headers.common['X-School-Subdomain'] = subdomain;
  console.log('Set X-School-Subdomain header to:', subdomain);
}

// Export a function to update the subdomain header
export const updateSubdomainHeader = () => {
  const subdomain = getSubdomain();
  if (subdomain) {
    api.defaults.headers.common['X-School-Subdomain'] = subdomain;
    console.log(`API headers updated with subdomain: ${subdomain}`);
  }
};

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if not on a public route
      const publicRoutes = ['/', '/login', '/register', '/register-school'];
      const currentPath = window.location.pathname;
      
      if (!publicRoutes.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Generic GET request
export const get = async <T>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.get(url, {
      params,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    return handleApiError<T>(error);
  }
};

/**
 * Fetch all houses
 * @returns {Promise<ApiResponse<House[]>>} A promise resolving to the list of houses
 */
export const fetchHouses = async (): Promise<ApiResponse<House[]>> => {
  return get<House[]>(API_CONFIG.ENDPOINTS.HOUSES.BASE);
};

/**
 * Fetch all sections
 * @returns {Promise<ApiResponse<Section[]>>} A promise resolving to the list of sections
 */
export const fetchSections = async (): Promise<ApiResponse<Section[]>> => {
  return get<Section[]>(API_CONFIG.ENDPOINTS.SECTIONS.BASE);
};

/**
 * Health check to test API connectivity
 * @returns {Promise<ApiResponse<any>>} A promise resolving to the health status
 */
export const healthCheck = async (): Promise<ApiResponse<any>> => {
  return get<any>('/health');
};

// Generic GET request for paginated data
export const getPaginated = async <T>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<PaginatedResponse<T>> => {
  try {
    const response: AxiosResponse<PaginatedResponse<T>> = await api.get(url, {
      params,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    throw handleApiError<T[]>(error);
  }
};

// Generic POST request
export const post = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.post(url, data, config);
    return response.data;
  } catch (error: any) {
    return handleApiError<T>(error);
  }
};

// Generic PUT request
export const put = async <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.put(url, data, config);
    return response.data;
  } catch (error: any) {
    return handleApiError<T>(error);
  }
};

// Generic DELETE request
export const del = async <T>(
  url: string,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await api.delete(url, config);
    return response.data;
  } catch (error: any) {
    return handleApiError<T>(error);
  }
};

// Handle API errors
const handleApiError = <T>(error: any): ApiResponse<T> => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    return {
      success: false,
      message: error.response.data.message || 'An error occurred',
      error: error.response.data.error || error.message,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: 'No response from server',
      error: 'Network error',
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    return {
      success: false,
      message: 'Request failed',
      error: error.message,
    };
  }
};

export default api;
