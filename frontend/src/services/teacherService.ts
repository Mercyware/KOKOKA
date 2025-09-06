import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Interface definitions
export interface Teacher {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  photo?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  qualification?: string;
  experience?: number;
  joiningDate: string;
  salary?: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RETIRED';
  schoolId: string;
  userId: string;
  departmentId?: string;
  createdAt: string;
  updatedAt: string;
  
  // Populated relationships
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  department?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateTeacherData {
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  qualification?: string;
  experience?: number;
  salary?: number;
  departmentId?: string;
  email: string;
  password: string;
}

export interface UpdateTeacherData extends Partial<CreateTeacherData> {
  status?: string;
}

export interface TeacherFilters {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add subdomain header
api.interceptors.request.use((config) => {
  const subdomain = localStorage.getItem('schoolSubdomain') || 'demo';
  config.headers['X-School-Subdomain'] = subdomain;
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw error;
  }
);

// Service functions

// Get all teachers
export const getAllTeachers = async (filters: TeacherFilters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  // Use staff endpoint which includes teachers
  return api.get(`/staff?${params.toString()}`);
};

// Get teacher by ID
export const getTeacherById = async (id: string) => {
  return api.get(`/staff/${id}`);
};

// Create new teacher
export const createTeacher = async (data: CreateTeacherData) => {
  return api.post('/staff', {
    ...data,
    staffType: 'TEACHER' // Ensure staff type is set to teacher
  });
};

// Update teacher
export const updateTeacher = async (id: string, data: UpdateTeacherData) => {
  return api.put(`/staff/${id}`, data);
};

// Delete teacher
export const deleteTeacher = async (id: string) => {
  return api.delete(`/staff/${id}`);
};

// Get teachers by department
export const getTeachersByDepartment = async (departmentId: string) => {
  return api.get(`/staff?departmentId=${departmentId}&staffType=TEACHER`);
};

// Get active teachers only
export const getActiveTeachers = async () => {
  return api.get('/staff?status=ACTIVE&staffType=TEACHER');
};