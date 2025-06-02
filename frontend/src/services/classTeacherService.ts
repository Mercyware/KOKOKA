import api from './api';

// Define the interfaces for the API responses
export interface ClassTeacherResponse {
  _id: string;
  teacher: {
    _id: string;
    user: {
      name: string;
      email: string;
      role: string;
    };
    employeeId: string;
  };
  class: {
    _id: string;
    name: string;
  };
  academicYear: {
    _id: string;
    name: string;
  };
  assignedDate: string;
  isActive: boolean;
  remarks?: string;
}

export interface ClassTeacherRequest {
  teacher: string;
  class: string;
  academicYear: string;
  isActive?: boolean;
  remarks?: string;
}

// Get class teachers by academic year
const getClassTeachersByAcademicYear = async (academicYearId: string): Promise<ClassTeacherResponse[]> => {
  try {
    const response = await api.get(`/class-teachers?academicYear=${academicYearId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching class teachers:', error);
    throw error;
  }
};

// Get class teachers by teacher ID
const getClassTeachersByTeacher = async (teacherId: string, academicYearId?: string): Promise<ClassTeacherResponse[]> => {
  try {
    let url = `/class-teachers/teacher/${teacherId}`;
    
    if (academicYearId) {
      url += `?academicYear=${academicYearId}`;
    }
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching class teachers by teacher:', error);
    throw error;
  }
};

// Get a single class teacher by ID
const getClassTeacher = async (id: string): Promise<ClassTeacherResponse> => {
  try {
    const response = await api.get(`/class-teachers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching class teacher:', error);
    throw error;
  }
};

// Check if a class already has a class teacher assigned for a specific academic year
const checkClassTeacherExists = async (classId: string, academicYearId: string): Promise<boolean> => {
  try {
    const response = await api.get(`/class-teachers/check?class=${classId}&academicYear=${academicYearId}`);
    return response.data.exists;
  } catch (error) {
    console.error('Error checking class teacher existence:', error);
    throw error;
  }
};

// Create a new class teacher assignment
const createClassTeacher = async (data: ClassTeacherRequest): Promise<ClassTeacherResponse> => {
  try {
    const response = await api.post('/class-teachers', data);
    return response.data;
  } catch (error) {
    console.error('Error creating class teacher assignment:', error);
    throw error;
  }
};

// Update an existing class teacher assignment
const updateClassTeacher = async (id: string, data: Partial<ClassTeacherRequest>): Promise<ClassTeacherResponse> => {
  try {
    const response = await api.put(`/class-teachers/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating class teacher assignment:', error);
    throw error;
  }
};

// Delete a class teacher assignment
const deleteClassTeacher = async (id: string): Promise<void> => {
  try {
    await api.delete(`/class-teachers/${id}`);
  } catch (error) {
    console.error('Error deleting class teacher assignment:', error);
    throw error;
  }
};

// Export all functions
const classTeacherService = {
  getClassTeachersByAcademicYear,
  getClassTeachersByTeacher,
  getClassTeacher,
  checkClassTeacherExists,
  createClassTeacher,
  updateClassTeacher,
  deleteClassTeacher,
};

export default classTeacherService;
