import api from './api';

// Teacher Subject Assignment types
export interface TeacherSubjectAssignmentResponse {
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
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  classes: Array<{
    class: {
      _id: string;
      name: string;
      level: number;
    };
    classArms: Array<{
      _id: string;
      name: string;
    }>;
  }>;
  academicYear: {
    _id: string;
    name: string;
  };
  term?: {
    _id: string;
    name: string;
  };
  assignedDate: Date;
  isActive: boolean;
  remarks?: string;
}

export interface TeacherSubjectAssignmentRequest {
  teacher: string; // Teacher ID
  subject: string; // Subject ID
  classes: string[]; // Array of Class IDs
  classArms: Record<string, string[]>; // Map of Class ID to array of Class Arm IDs
  academicYear: string; // Academic Year ID
  term?: string; // Term ID (optional)
  isActive: boolean;
  remarks?: string;
}

// Internal interface used for API calls
interface TransformedTeacherSubjectAssignmentRequest {
  teacher: string;
  subject: string;
  classes: Array<{ class: string; classArms: string[] }>;
  academicYear: string;
  term?: string;
  isActive: boolean;
  remarks?: string;
}

export interface TeacherSubjectAssignmentFilter {
  academicYear: string;
  class?: string;
  subject?: string;
  teacher?: string;
  isActive?: boolean;
}

// Get all teacher subject assignments with optional filtering
export const getTeacherSubjectAssignments = async (filters: TeacherSubjectAssignmentFilter) => {
  try {
    const response = await api.get('/staff-subject-assignments', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single teacher subject assignment by ID
export const getTeacherSubjectAssignment = async (id: string) => {
  try {
    const response = await api.get(`/staff-subject-assignments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get teacher subject assignments by teacher ID
export const getTeacherSubjectAssignmentsByTeacher = async (teacherId: string, academicYearId?: string) => {
  try {
    const params = academicYearId ? { academicYear: academicYearId } : {};
    const response = await api.get(`/staff-subject-assignments/teacher/${teacherId}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get teacher subject assignments by subject ID
export const getTeacherSubjectAssignmentsBySubject = async (subjectId: string, academicYearId?: string) => {
  try {
    const params = academicYearId ? { academicYear: academicYearId } : {};
    const response = await api.get(`/staff-subject-assignments/subject/${subjectId}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get teacher subject assignments by class ID
export const getTeacherSubjectAssignmentsByClass = async (classId: string, academicYearId?: string) => {
  try {
    const params = academicYearId ? { academicYear: academicYearId } : {};
    const response = await api.get(`/staff-subject-assignments/class/${classId}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new teacher subject assignment
export const createTeacherSubjectAssignment = async (data: TeacherSubjectAssignmentRequest) => {
  try {
    // Create a new object with the transformed data
    const transformedData: TransformedTeacherSubjectAssignmentRequest = {
      teacher: data.teacher,
      subject: data.subject,
      academicYear: data.academicYear,
      isActive: data.isActive,
      classes: data.classes.map(classId => ({ 
        class: classId, 
        classArms: data.classArms[classId] || [] 
      }))
    };
    
    // Add optional fields if present
    if (data.term !== undefined) transformedData.term = data.term;
    if (data.remarks !== undefined) transformedData.remarks = data.remarks;
    
    const response = await api.post('/staff-subject-assignments', transformedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing teacher subject assignment
export const updateTeacherSubjectAssignment = async (id: string, data: Partial<TeacherSubjectAssignmentRequest>) => {
  try {
    // Create a new object with the transformed data
    const transformedData: Partial<TransformedTeacherSubjectAssignmentRequest> = {};
    
    // Copy all fields except classes
    if (data.teacher !== undefined) transformedData.teacher = data.teacher;
    if (data.subject !== undefined) transformedData.subject = data.subject;
    if (data.academicYear !== undefined) transformedData.academicYear = data.academicYear;
    if (data.term !== undefined) transformedData.term = data.term;
    if (data.isActive !== undefined) transformedData.isActive = data.isActive;
    if (data.remarks !== undefined) transformedData.remarks = data.remarks;
    
    // Transform classes if present
    if (data.classes) {
      transformedData.classes = data.classes.map(classId => ({ 
        class: classId, 
        classArms: (data.classArms && data.classArms[classId]) || [] 
      }));
    }
    
    const response = await api.put(`/staff-subject-assignments/${id}`, transformedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a teacher subject assignment
export const deleteTeacherSubjectAssignment = async (id: string) => {
  try {
    const response = await api.delete(`/staff-subject-assignments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get teacher subject assignments by academic year
export const getTeacherSubjectAssignmentsByAcademicYear = async (academicYearId: string) => {
  try {
    const response = await api.get(`/staff-subject-assignments/academic-year/${academicYearId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get teacher subject assignments by term
export const getTeacherSubjectAssignmentsByTerm = async (termId: string) => {
  try {
    const response = await api.get(`/staff-subject-assignments/term/${termId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update teacher subject assignment status (active/inactive)
export const updateTeacherSubjectAssignmentStatus = async (id: string, isActive: boolean) => {
  try {
    const response = await api.patch(`/staff-subject-assignments/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Export all functions as named exports
