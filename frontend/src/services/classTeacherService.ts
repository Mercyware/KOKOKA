import api from './api';

export interface ClassTeacherAssignment {
  id: string;
  teacherId: string;
  classId: string;
  academicYearId: string;
  schoolId: string;
  isClassTeacher: boolean;
  isSubjectTeacher: boolean;
  subjects: string[];
  assignedDate: string;
  startDate?: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'CANCELLED';
  canMarkAttendance: boolean;
  canGradeAssignments: boolean;
  canManageClassroom: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    user?: {
      email: string;
    };
  };
  class: {
    id: string;
    name: string;
    grade: string;
  };
  academicYear: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  };
}

export interface CreateAssignmentData {
  teacherId: string;
  classId: string;
  academicYearId: string;
  isClassTeacher?: boolean;
  isSubjectTeacher?: boolean;
  subjects?: string[];
  startDate?: string;
  endDate?: string;
  canMarkAttendance?: boolean;
  canGradeAssignments?: boolean;
  canManageClassroom?: boolean;
  notes?: string;
}

export interface UpdateAssignmentData {
  isClassTeacher?: boolean;
  isSubjectTeacher?: boolean;
  subjects?: string[];
  startDate?: string;
  endDate?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'TRANSFERRED' | 'CANCELLED';
  canMarkAttendance?: boolean;
  canGradeAssignments?: boolean;
  canManageClassroom?: boolean;
  notes?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  user?: {
    email: string;
  };
}

export interface Class {
  id: string;
  name: string;
  grade: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface FormData {
  classes: Class[];
  academicYears: AcademicYear[];
  teachers: Teacher[];
}

class ClassTeacherService {
  // Get all teacher-class assignments
  async getAssignments(filters?: {
    academicYearId?: string;
    teacherId?: string;
    classId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.academicYearId) params.append('academicYearId', filters.academicYearId);
    if (filters?.teacherId) params.append('teacherId', filters.teacherId);
    if (filters?.classId) params.append('classId', filters.classId);
    
    const queryString = params.toString();
    const url = `/class-teachers${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  }

  // Get form data (classes, academic years, teachers)
  async getFormData(): Promise<FormData> {
    const response = await api.get('/class-teachers/form-data');
    return response.data.data;
  }

  // Get available teachers for assignment
  async getAvailableTeachers(classId: string, academicYearId: string): Promise<Teacher[]> {
    const response = await api.get('/class-teachers/available-teachers', {
      params: { classId, academicYearId }
    });
    return response.data.data;
  }

  // Get assignment by ID
  async getAssignment(id: string): Promise<ClassTeacherAssignment> {
    const response = await api.get(`/class-teachers/${id}`);
    return response.data.data;
  }

  // Get assignments by teacher
  async getTeacherAssignments(teacherId: string, academicYearId?: string) {
    const params = academicYearId ? { academicYearId } : {};
    const response = await api.get(`/class-teachers/teacher/${teacherId}`, { params });
    return response.data;
  }

  // Get assignments by class
  async getClassAssignments(classId: string, academicYearId?: string) {
    const params = academicYearId ? { academicYearId } : {};
    const response = await api.get(`/class-teachers/class/${classId}`, { params });
    return response.data;
  }

  // Create new assignment
  async createAssignment(data: CreateAssignmentData): Promise<ClassTeacherAssignment> {
    const response = await api.post('/class-teachers', data);
    return response.data.data;
  }

  // Update assignment
  async updateAssignment(id: string, data: UpdateAssignmentData): Promise<ClassTeacherAssignment> {
    const response = await api.put(`/class-teachers/${id}`, data);
    return response.data.data;
  }

  // Delete assignment
  async deleteAssignment(id: string): Promise<void> {
    await api.delete(`/class-teachers/${id}`);
  }

  // Helper method to get full teacher name
  getTeacherFullName(teacher: Teacher): string {
    return `${teacher.firstName} ${teacher.lastName}`;
  }

  // Helper method to get teacher display name with employee ID
  getTeacherDisplayName(teacher: Teacher): string {
    return `${this.getTeacherFullName(teacher)} (${teacher.employeeId})`;
  }

  // Helper method to get class display name
  getClassDisplayName(classItem: Class): string {
    return `${classItem.name} - Grade ${classItem.grade}`;
  }

  // Helper method to format academic year display
  getAcademicYearDisplay(academicYear: AcademicYear): string {
    const startYear = new Date(academicYear.startDate).getFullYear();
    const endYear = new Date(academicYear.endDate).getFullYear();
    return `${academicYear.name} (${startYear}-${endYear})${academicYear.isCurrent ? ' - Current' : ''}`;
  }

  // Helper method to format assignment status
  formatStatus(status: ClassTeacherAssignment['status']): { label: string; color: string } {
    const statusMap = {
      ACTIVE: { label: 'Active', color: 'success' },
      INACTIVE: { label: 'Inactive', color: 'warning' },
      COMPLETED: { label: 'Completed', color: 'info' },
      TRANSFERRED: { label: 'Transferred', color: 'secondary' },
      CANCELLED: { label: 'Cancelled', color: 'danger' }
    };
    return statusMap[status] || { label: status, color: 'secondary' };
  }

  // Helper method to get assignment type label
  getAssignmentTypeLabel(assignment: ClassTeacherAssignment): string {
    const types = [];
    if (assignment.isClassTeacher) {
      types.push(assignment.canManageClassroom ? 'Class Teacher' : 'Assistant Class Teacher');
    }
    if (assignment.isSubjectTeacher) {
      types.push('Subject Teacher');
    }
    return types.length > 0 ? types.join(' & ') : 'Teacher';
  }

  // Helper method to get permissions summary
  getPermissionsSummary(assignment: ClassTeacherAssignment): string[] {
    const permissions = [];
    if (assignment.canMarkAttendance) permissions.push('Mark Attendance');
    if (assignment.canGradeAssignments) permissions.push('Grade Assignments');
    if (assignment.canManageClassroom) permissions.push('Manage Classroom');
    return permissions;
  }

  // Helper method to validate assignment data
  validateAssignmentData(data: CreateAssignmentData | UpdateAssignmentData): string[] {
    const errors: string[] = [];

    if ('teacherId' in data && !data.teacherId) {
      errors.push('Teacher is required');
    }
    
    if ('classId' in data && !data.classId) {
      errors.push('Class is required');
    }
    
    if ('academicYearId' in data && !data.academicYearId) {
      errors.push('Academic Year is required');
    }

    if (data.isSubjectTeacher && (!data.subjects || data.subjects.length === 0)) {
      errors.push('At least one subject must be selected for subject teacher assignment');
    }

    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (start >= end) {
        errors.push('Start date must be before end date');
      }
    }

    return errors;
  }
}

export default new ClassTeacherService();