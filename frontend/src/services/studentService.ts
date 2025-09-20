import { ApiResponse, PaginatedResponse, Student } from '../types';
import api, { get, getPaginated, post, put, del } from './api';

// Interface for student filter parameters
export interface StudentFilters {
  academicYear?: string;
  section?: string;
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
        totalPages: response.data.pagination.pages,
        page: response.data.pagination.page
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
export const getStudentById = async (id: string): Promise<{ success: boolean; student: Student }> => {
  try {
    const response = await get<{ student: Student }>(`/students/${id}`);
    if (response && 'student' in response) {
      return { success: true, student: response.student };
    }
    if (response && 'data' in response) {
      return { success: true, student: response.data };
    }
    throw new Error('Invalid response shape');
  } catch (error) {
    return { success: false, student: {} as Student };
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
export const updateStudent = async (id: string, studentData: Partial<Student>): Promise<{ success: boolean; student?: Student; message?: string; error?: string }> => {
  try {
    const response = await put<{ student: Student }>(`/students/${id}`, studentData);

    // Check if the response indicates an error (returned by handleApiError)
    if (response && 'success' in response && !response.success) {
      return {
        success: false,
        message: response.message || 'Failed to update student',
        error: response.error || response.message
      };
    }

    // If backend returns { student, success }
    if (response && 'student' in response) {
      return { success: true, student: response.student };
    }

    // Fallback: if backend returns { data, success }
    if (response && 'data' in response) {
      return { success: true, student: response.data };
    }

    // If response exists but doesn't have expected structure, log it for debugging
    console.error('Unexpected response structure:', response);
    return {
      success: false,
      message: 'Unexpected response format from server',
      error: 'Invalid response structure'
    };
  } catch (error: any) {
    console.error('Update student error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update student',
      error: error.response?.data?.error || error.message
    };
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

// Upload student profile picture
export const uploadStudentProfilePicture = async (
  studentId: string, 
  file: File
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await fetch(`/api/students/${studentId}/profile-picture`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Upload failed');
    }

    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error: any) {
    console.error('Profile picture upload error:', error);
    return {
      success: false,
      message: error.message || 'Failed to upload profile picture',
      error: error.message
    };
  }
};

// Delete student profile picture
export const deleteStudentProfilePicture = async (
  studentId: string
): Promise<{ success: boolean; data?: any; message?: string; error?: string }> => {
  try {
    const response = await fetch(`/api/students/${studentId}/profile-picture`, {
      method: 'DELETE',
      credentials: 'include',
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Delete failed');
    }

    return {
      success: true,
      data: result.data,
      message: result.message
    };
  } catch (error: any) {
    console.error('Profile picture delete error:', error);
    return {
      success: false,
      message: error.message || 'Failed to delete profile picture',
      error: error.message
    };
  }
};
