import api from './api';

export interface SubjectAssignment {
  id: string;
  staffId: string;
  subjectId: string;
  classId: string;
  academicYearId: string;
  schoolId: string;
  sectionId?: string;
  assignedDate: string;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'CANCELLED' | 'SUSPENDED';
  hoursPerWeek?: number;
  term?: number;
  semester?: number;
  isMainTeacher: boolean;
  canGrade: boolean;
  canMarkAttendance: boolean;
  notes?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;

  // Related data
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    position: string;
    qualification?: string;
    experience?: number;
  };
  subject: {
    id: string;
    name: string;
    code: string;
    description?: string;
    credits?: number;
  };
  class: {
    id: string;
    name: string;
    grade: string;
    description?: string;
  };
  section?: {
    id: string;
    name: string;
    description?: string;
  };
  academicYear: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
  };
}

export interface CreateSubjectAssignmentData {
  staffId: string;
  subjectId: string;
  classId: string;
  academicYearId: string;
  sectionId?: string;
  startDate?: string;
  endDate?: string;
  hoursPerWeek?: number;
  term?: number;
  semester?: number;
  isMainTeacher?: boolean;
  canGrade?: boolean;
  canMarkAttendance?: boolean;
  notes?: string;
  description?: string;
}

export interface UpdateSubjectAssignmentData {
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'CANCELLED' | 'SUSPENDED';
  hoursPerWeek?: number;
  term?: number;
  semester?: number;
  isMainTeacher?: boolean;
  canGrade?: boolean;
  canMarkAttendance?: boolean;
  notes?: string;
  description?: string;
}

export interface SubjectAssignmentFilters {
  academicYearId?: string;
  classId?: string;
  staffId?: string;
  subjectId?: string;
  sectionId?: string;
  status?: string;
}

/**
 * Get all subject assignments with optional filters
 */
export const getSubjectAssignments = async (filters?: SubjectAssignmentFilters): Promise<SubjectAssignment[]> => {
  try {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
    }

    const queryString = params.toString();
    const url = queryString ? `/subject-assignments?${queryString}` : '/subject-assignments';

    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get subject assignment by ID
 */
export const getSubjectAssignmentById = async (id: string): Promise<SubjectAssignment> => {
  try {
    const response = await api.get(`/subject-assignments/${id}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create new subject assignment
 */
export const createSubjectAssignment = async (data: CreateSubjectAssignmentData): Promise<SubjectAssignment> => {
  try {
    const response = await api.post('/subject-assignments', data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update subject assignment
 */
export const updateSubjectAssignment = async (id: string, data: UpdateSubjectAssignmentData): Promise<SubjectAssignment> => {
  try {
    const response = await api.put(`/subject-assignments/${id}`, data);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete subject assignment
 */
export const deleteSubjectAssignment = async (id: string): Promise<void> => {
  try {
    await api.delete(`/subject-assignments/${id}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Get assignments for a specific teacher
 */
export const getTeacherAssignments = async (staffId: string, academicYearId?: string): Promise<SubjectAssignment[]> => {
  try {
    const params = academicYearId ? `?academicYearId=${academicYearId}` : '';
    const response = await api.get(`/subject-assignments/teacher/${staffId}${params}`);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get assignments for a specific class
 */
export const getClassAssignments = async (classId: string, filters?: { academicYearId?: string; sectionId?: string }): Promise<SubjectAssignment[]> => {
  try {
    const params = new URLSearchParams();

    if (filters?.academicYearId) {
      params.append('academicYearId', filters.academicYearId);
    }

    if (filters?.sectionId) {
      params.append('sectionId', filters.sectionId);
    }

    const queryString = params.toString();
    const url = queryString ? `/subject-assignments/class/${classId}?${queryString}` : `/subject-assignments/class/${classId}`;

    const response = await api.get(url);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get assignments grouped by teacher
 */
export const getAssignmentsByTeacher = async (academicYearId?: string): Promise<Record<string, SubjectAssignment[]>> => {
  try {
    const assignments = await getSubjectAssignments({ academicYearId });

    return assignments.reduce((grouped, assignment) => {
      const teacherKey = `${assignment.staff.firstName} ${assignment.staff.lastName}`;
      if (!grouped[teacherKey]) {
        grouped[teacherKey] = [];
      }
      grouped[teacherKey].push(assignment);
      return grouped;
    }, {} as Record<string, SubjectAssignment[]>);
  } catch (error) {
    throw error;
  }
};

/**
 * Get assignments grouped by class
 */
export const getAssignmentsByClass = async (academicYearId?: string): Promise<Record<string, SubjectAssignment[]>> => {
  try {
    const assignments = await getSubjectAssignments({ academicYearId });

    return assignments.reduce((grouped, assignment) => {
      const classKey = assignment.section
        ? `${assignment.class.name} - ${assignment.section.name}`
        : assignment.class.name;

      if (!grouped[classKey]) {
        grouped[classKey] = [];
      }
      grouped[classKey].push(assignment);
      return grouped;
    }, {} as Record<string, SubjectAssignment[]>);
  } catch (error) {
    throw error;
  }
};

/**
 * Get assignments grouped by subject
 */
export const getAssignmentsBySubject = async (academicYearId?: string): Promise<Record<string, SubjectAssignment[]>> => {
  try {
    const assignments = await getSubjectAssignments({ academicYearId });

    return assignments.reduce((grouped, assignment) => {
      const subjectKey = assignment.subject.name;
      if (!grouped[subjectKey]) {
        grouped[subjectKey] = [];
      }
      grouped[subjectKey].push(assignment);
      return grouped;
    }, {} as Record<string, SubjectAssignment[]>);
  } catch (error) {
    throw error;
  }
};

/**
 * Check if a teacher is available for assignment
 * This checks if the teacher has conflicting assignments in the same time period
 */
export const checkTeacherAvailability = async (
  staffId: string,
  classId: string,
  academicYearId: string,
  sectionId?: string
): Promise<{ available: boolean; conflicts: SubjectAssignment[] }> => {
  try {
    const teacherAssignments = await getTeacherAssignments(staffId, academicYearId);

    // Check for conflicts (same class and section)
    const conflicts = teacherAssignments.filter(assignment =>
      assignment.classId === classId &&
      assignment.sectionId === sectionId &&
      assignment.status === 'ACTIVE'
    );

    return {
      available: conflicts.length === 0,
      conflicts
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Get teaching workload for a teacher
 */
export const getTeacherWorkload = async (staffId: string, academicYearId?: string): Promise<{
  totalHours: number;
  totalClasses: number;
  totalSubjects: number;
  assignments: SubjectAssignment[];
}> => {
  try {
    const assignments = await getTeacherAssignments(staffId, academicYearId);

    const totalHours = assignments.reduce((sum, assignment) =>
      sum + (assignment.hoursPerWeek || 0), 0
    );

    const uniqueClasses = new Set(assignments.map(a =>
      a.sectionId ? `${a.classId}-${a.sectionId}` : a.classId
    )).size;

    const uniqueSubjects = new Set(assignments.map(a => a.subjectId)).size;

    return {
      totalHours,
      totalClasses: uniqueClasses,
      totalSubjects: uniqueSubjects,
      assignments
    };
  } catch (error) {
    throw error;
  }
};

export default {
  getSubjectAssignments,
  getSubjectAssignmentById,
  createSubjectAssignment,
  updateSubjectAssignment,
  deleteSubjectAssignment,
  getTeacherAssignments,
  getClassAssignments,
  getAssignmentsByTeacher,
  getAssignmentsByClass,
  getAssignmentsBySubject,
  checkTeacherAvailability,
  getTeacherWorkload
};