import axios from 'axios';
import { getSchoolSubdomain } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Interface definitions
export interface ClassSubjectHistory {
  id: string;
  classId: string;
  subjectId: string;
  academicYearId: string;
  schoolId: string;
  isCore: boolean;
  isOptional: boolean;
  credits?: number;
  hoursPerWeek?: number;
  term?: number;
  semester?: number;
  teacherId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED' | 'SUSPENDED';
  startDate: string;
  endDate?: string;
  maxStudents?: number;
  prerequisites: string[];
  description?: string;
  gradingScale?: any;
  passingGrade?: number;
  createdAt: string;
  updatedAt: string;
  
  // Populated relationships
  class?: {
    id: string;
    name: string;
    grade: string;
  };
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  academicYear?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  };
  assignedTeacher?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
}

export interface ClassSubjectHistoryFilters {
  page?: number;
  limit?: number;
  classId?: string;
  subjectId?: string;
  academicYearId?: string;
  teacherId?: string;
  status?: string;
  isCore?: boolean;
  term?: number;
  semester?: number;
}

export interface CreateClassSubjectHistoryData {
  classId: string;
  subjectId: string;
  academicYearId: string;
  isCore?: boolean;
  isOptional?: boolean;
  credits?: number;
  hoursPerWeek?: number;
  term?: number;
  semester?: number;
  teacherId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  prerequisites?: string[];
  description?: string;
  gradingScale?: any;
  passingGrade?: number;
}

export interface UpdateClassSubjectHistoryData {
  isCore?: boolean;
  isOptional?: boolean;
  credits?: number;
  hoursPerWeek?: number;
  term?: number;
  semester?: number;
  teacherId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  prerequisites?: string[];
  description?: string;
  gradingScale?: any;
  passingGrade?: number;
}

export interface BulkAssignmentData {
  assignments: CreateClassSubjectHistoryData[];
}

export interface CopyAssignmentsData {
  fromAcademicYearId: string;
  toAcademicYearId: string;
  classIds?: string[];
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add subdomain header
api.interceptors.request.use((config) => {
  // Use the reliable getSchoolSubdomain helper
  const subdomain = getSchoolSubdomain();
  const normalizedSubdomain = subdomain.toLowerCase().trim();
  config.headers['X-School-Subdomain'] = normalizedSubdomain;
  
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

// Get all class-subject assignments with filtering
export const getClassSubjectHistory = async (filters: ClassSubjectHistoryFilters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString());
    }
  });
  
  return api.get(`/class-subject-history?${params.toString()}`);
};

// Get specific assignment by ID
export const getClassSubjectHistoryById = async (id: string) => {
  return api.get(`/class-subject-history/${id}`);
};

// Create new class-subject assignment
export const createClassSubjectHistory = async (data: CreateClassSubjectHistoryData) => {
  return api.post('/class-subject-history', data);
};

// Update class-subject assignment
export const updateClassSubjectHistory = async (id: string, data: UpdateClassSubjectHistoryData) => {
  return api.put(`/class-subject-history/${id}`, data);
};

// Delete class-subject assignment
export const deleteClassSubjectHistory = async (id: string) => {
  return api.delete(`/class-subject-history/${id}`);
};

// Get subjects for a specific class and academic year
export const getSubjectsForClass = async (classId: string, academicYearId: string) => {
  return api.get(`/class-subject-history/subjects-for-class?classId=${classId}&academicYearId=${academicYearId}`);
};

// Get classes for a specific subject and academic year
export const getClassesForSubject = async (subjectId: string, academicYearId: string) => {
  return api.get(`/class-subject-history/classes-for-subject?subjectId=${subjectId}&academicYearId=${academicYearId}`);
};

// Bulk assign subjects to multiple classes
export const bulkAssignSubjects = async (data: BulkAssignmentData) => {
  return api.post('/class-subject-history/bulk-assign', data);
};

// Copy assignments from one academic year to another
export const copyAssignments = async (data: CopyAssignmentsData) => {
  return api.post('/class-subject-history/copy-assignments', data);
};

// Debug school context
export const debugSchoolContext = async () => {
  return api.get('/class-subject-history/debug');
};

// Helper function to get assignment status color
export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    case 'COMPLETED':
      return 'bg-siohioma-primary/10 text-siohioma-primary dark:bg-siohioma-primary/20 dark:text-siohioma-primary';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'SUSPENDED':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Helper function to format assignment status
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'INACTIVE':
      return 'Inactive';
    case 'COMPLETED':
      return 'Completed';
    case 'CANCELLED':
      return 'Cancelled';
    case 'SUSPENDED':
      return 'Suspended';
    default:
      return status;
  }
};