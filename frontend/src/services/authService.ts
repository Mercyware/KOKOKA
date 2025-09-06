import { User, LoginCredentials, RegisterData, ApiResponse } from '../types';
import { post, get } from './api';

// Login user
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<{ token: string; user: User }>> => {
  return await post<{ token: string; user: User }>('/auth/login', credentials);
};

// Register user
export const register = async (data: RegisterData): Promise<ApiResponse<{ token: string; user: User }>> => {
  return await post<{ token: string; user: User }>('/auth/register', data);
};

// Get current user
export const getCurrentUser = async (): Promise<ApiResponse<User>> => {
  return await get<User>('/auth/me');
};

// Logout user
export const logout = async (): Promise<ApiResponse<void>> => {
  return await post<void>('/auth/logout');
};

// Register a new school
export const registerSchool = async (schoolData: any): Promise<ApiResponse<any>> => {
  return await post<any>('/schools/register', schoolData);
};

// Check if a subdomain is available
export const checkSubdomainAvailability = async (subdomain: string): Promise<ApiResponse<{ available: boolean }>> => {
  return await get<{ available: boolean }>(`/schools/check-subdomain/${subdomain}`);
};

// Set authentication token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Remove authentication token
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

// Set user in local storage and sync school data
export const setUser = (user: User): void => {
  localStorage.setItem('user', JSON.stringify(user));
  
  // Sync school subdomain from user data
  if (user.school && user.school.subdomain) {
    localStorage.setItem('schoolSubdomain', user.school.subdomain);
    console.log('Synced school subdomain from user data:', user.school.subdomain);
  }
  
  // Sync school name for other components
  if (user.school && user.school.name) {
    localStorage.setItem('schoolName', user.school.name);
  }
};

// Get user from local storage
export const getUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove user from local storage and clean up school data
export const removeUser = (): void => {
  localStorage.removeItem('user');
  localStorage.removeItem('schoolSubdomain');
  localStorage.removeItem('schoolName');
  console.log('Cleaned up user and school data from localStorage');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

// Get school subdomain from localStorage or user data
export const getSchoolSubdomain = (): string => {
  // First try to get from localStorage (should be synced by setUser)
  let subdomain = localStorage.getItem('schoolSubdomain');
  
  // If not found, try to get from user data
  if (!subdomain) {
    const user = getUser();
    if (user?.school?.subdomain) {
      subdomain = user.school.subdomain;
      // Sync it to localStorage for next time
      localStorage.setItem('schoolSubdomain', subdomain);
      console.log('Retrieved and synced subdomain from user data:', subdomain);
    }
  }
  
  // Default fallback
  return subdomain || 'demo';
};
