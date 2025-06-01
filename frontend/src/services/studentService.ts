import { ApiResponse, PaginatedResponse, Student } from '../types';
import api, { get, getPaginated, post, put, del } from './api';

// Interface for student filter parameters
export interface StudentFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled';
  class?: string;
  search?: string;
  admissionDateFrom?: string;
  admissionDateTo?: string;
  gender?: 'male' | 'female' | 'other';
  house?: string;
  minAge?: number;
  maxAge?: number;
  minGPA?: number;
  maxGPA?: number;
  minAttendance?: number;
  maxAttendance?: number;
  nationality?: string;
  religion?: string;
}

// Get all students with pagination and filtering
export const getStudents = async (filters: StudentFilters = {}): Promise<PaginatedResponse<Student>> => {
  try {
    const response = await api.get('/students', { params: filters });
    
    // Handle the specific API response structure
    if (response.data && response.data.students) {
      return {
        success: true,
        data: response.data.students,
        total: response.data.pagination.total,
        count: response.data.pagination.limit,
        pages: response.data.pagination.pages,
        currentPage: response.data.pagination.page
      };
    }
    
    // Fallback to standard response handling
    return await getPaginated<Student>('/students', filters);
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Get student by ID
export const getStudentById = async (id: string): Promise<ApiResponse<Student>> => {
  try {
    return await get<Student>(`/students/${id}`);
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error);
    throw error;
  }
};

// Create new student
export const createStudent = async (studentData: Partial<Student>): Promise<ApiResponse<Student>> => {
  try {
    return await post<Student>('/students', studentData);
  } catch (error) {
    console.error('Error creating student:', error);
    throw error;
  }
};

// Update student
export const updateStudent = async (id: string, studentData: Partial<Student>): Promise<ApiResponse<Student>> => {
  try {
    return await put<Student>(`/students/${id}`, studentData);
  } catch (error) {
    console.error(`Error updating student with ID ${id}:`, error);
    throw error;
  }
};

// Delete student
export const deleteStudent = async (id: string): Promise<ApiResponse<any>> => {
  try {
    return await del<any>(`/students/${id}`);
  } catch (error) {
    console.error(`Error deleting student with ID ${id}:`, error);
    throw error;
  }
};

// Get student attendance
export const getStudentAttendance = async (id: string): Promise<ApiResponse<any>> => {
  try {
    return await get<any>(`/students/${id}/attendance`);
  } catch (error) {
    console.error(`Error fetching attendance for student with ID ${id}:`, error);
    throw error;
  }
};

// Get student grades
export const getStudentGrades = async (id: string): Promise<ApiResponse<any>> => {
  try {
    return await get<any>(`/students/${id}/grades`);
  } catch (error) {
    console.error(`Error fetching grades for student with ID ${id}:`, error);
    throw error;
  }
};

// Get student documents
export const getStudentDocuments = async (id: string): Promise<ApiResponse<any>> => {
  try {
    return await get<any>(`/students/${id}/documents`);
  } catch (error) {
    console.error(`Error fetching documents for student with ID ${id}:`, error);
    throw error;
  }
};

// Get student class history
export const getStudentClassHistory = async (id: string): Promise<ApiResponse<any>> => {
  try {
    return await get<any>(`/students/${id}/class-history`);
  } catch (error) {
    console.error(`Error fetching class history for student with ID ${id}:`, error);
    throw error;
  }
};
