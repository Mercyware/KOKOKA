import api from './api';

// Staff types
export interface StaffMember {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  photo?: string;
  position: string;
  staffType: 'TEACHER' | 'ADMINISTRATOR' | 'LIBRARIAN' | 'ACCOUNTANT' | 'RECEPTIONIST' | 'SECURITY' | 'MAINTENANCE' | 'COUNSELOR' | 'NURSE' | 'GENERAL';
  joiningDate: string;
  salary: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RETIRED';
  user: {
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  };
  department?: {
    id: string;
    name: string;
    description?: string;
  };
  teacherSubjects?: Array<{
    id: string;
    subject?: {
      id: string;
      name: string;
      code: string;
    };
  }>;
  subjectAssignments?: Array<{
    id: string;
    subject?: {
      id: string;
      name: string;
      code: string;
    };
    class?: {
      id: string;
      name: string;
      grade: string;
    };
  }>;
  classTeachers?: Array<{
    id: string;
    class?: {
      id: string;
      name: string;
      grade: string;
    };
  }>;
  qualifications?: Qualification[];
  createdAt: string;
  updatedAt: string;
}

export interface Qualification {
  id: string;
  staffId: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  yearObtained?: number;
  grade?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QualificationCreateData {
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  yearObtained?: number;
  grade?: string;
  description?: string;
}

export interface QualificationUpdateData {
  degree?: string;
  institution?: string;
  fieldOfStudy?: string;
  yearObtained?: number;
  grade?: string;
  description?: string;
}

export interface StaffCreateData {
  userId?: string;
  user?: {
    name: string;
    email: string;
    password: string;
    role?: string;
  };
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  photo?: string;
  position: string;
  staffType: 'TEACHER' | 'ADMINISTRATOR' | 'LIBRARIAN' | 'ACCOUNTANT' | 'RECEPTIONIST' | 'SECURITY' | 'MAINTENANCE' | 'COUNSELOR' | 'NURSE' | 'GENERAL';
  departmentId?: string;
  salary?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RETIRED';
}

export interface StaffUpdateData {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  photo?: string;
  position?: string;
  staffType?: 'TEACHER' | 'ADMINISTRATOR' | 'LIBRARIAN' | 'ACCOUNTANT' | 'RECEPTIONIST' | 'SECURITY' | 'MAINTENANCE' | 'COUNSELOR' | 'NURSE' | 'GENERAL';
  departmentId?: string;
  salary?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'RETIRED';
}

export interface StaffFilterOptions {
  department?: string;
  status?: string;
  staffType?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Get all staff members with optional filtering
export const getStaffMembers = async (options?: StaffFilterOptions) => {
  try {
    const response = await api.get('/staff', { params: options });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single staff member by ID
export const getStaffMember = async (id: string) => {
  try {
    const response = await api.get(`/staff/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new staff member
export const createStaffMember = async (data: StaffCreateData) => {
  try {
    const response = await api.post('/staff', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing staff member
export const updateStaffMember = async (id: string, data: StaffUpdateData) => {
  try {
    const response = await api.put(`/staff/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a staff member
export const deleteStaffMember = async (id: string) => {
  try {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get staff members by department
export const getStaffByDepartment = async (departmentId: string) => {
  try {
    const response = await api.get(`/staff/department/${departmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get staff members by type (e.g., teachers, admin, etc.)
export const getStaffByType = async (type: string) => {
  try {
    const response = await api.get(`/staff/type/${type}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get teachers (convenience method)
export const getTeachers = async () => {
  try {
    return await getStaffByType('TEACHER');
  } catch (error) {
    throw error;
  }
};

// Get admin staff (convenience method)
export const getAdminStaff = async () => {
  try {
    return await getStaffByType('ADMINISTRATOR');
  } catch (error) {
    throw error;
  }
};

// Update staff status (active/inactive)
export const updateStaffStatus = async (id: string, status: string) => {
  try {
    const response = await api.patch(`/staff/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Assign subjects to a teacher
export const assignSubjectsToTeacher = async (teacherId: string, subjectIds: string[]) => {
  try {
    const response = await api.post(`/staff/${teacherId}/subjects`, { subjectIds });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Assign classes to a teacher
export const assignClassesToTeacher = async (teacherId: string, classIds: string[]) => {
  try {
    const response = await api.post(`/staff/${teacherId}/classes`, { classIds });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Qualification management
export const addQualification = async (staffId: string, data: QualificationCreateData) => {
  try {
    const response = await api.post(`/staff/${staffId}/qualifications`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateQualification = async (
  staffId: string,
  qualificationId: string,
  data: QualificationUpdateData
) => {
  try {
    const response = await api.put(
      `/staff/${staffId}/qualifications/${qualificationId}`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteQualification = async (staffId: string, qualificationId: string) => {
  try {
    const response = await api.delete(`/staff/${staffId}/qualifications/${qualificationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getStaffMembers,
  getStaffMember,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  getStaffByDepartment,
  getStaffByType,
  getTeachers,
  getAdminStaff,
  updateStaffStatus,
  assignSubjectsToTeacher,
  assignClassesToTeacher,
  addQualification,
  updateQualification,
  deleteQualification
};
