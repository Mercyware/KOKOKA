import api from './api';

// Staff types
export interface StaffMember {
  id: string;
  employeeId: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  staffType: string;
  department: {
    id: string;
    name: string;
    description?: string;
  };
  position: string;
  gender: string;
  dateOfBirth: Date | null;
  nationalId: string;
  phone: string;
  alternatePhone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  status: string;
  joinDate?: string;
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  subjects?: string[];
  classes?: string[];
}

export interface StaffCreateData {
  user: {
    name: string;
    email: string;
    password: string;
    role: string;
  };
  employeeId: string;
  staffType: string;
  dateOfBirth: Date | null;
  gender: string;
  nationalId: string;
  department: string; // Department ID
  position: string;
  contactInfo: {
    phone: string;
    alternatePhone?: string;
    emergencyContact?: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface StaffUpdateData {
  employeeId?: string;
  staffType?: string;
  dateOfBirth?: Date | null;
  gender?: string;
  nationalId?: string;
  department?: string; // Department ID
  position?: string;
  contactInfo?: {
    phone?: string;
    alternatePhone?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status?: string;
}

export interface StaffFilterOptions {
  staffType?: string;
  department?: string;
  status?: string;
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
    return await getStaffByType('teacher');
  } catch (error) {
    throw error;
  }
};

// Get admin staff (convenience method)
export const getAdminStaff = async () => {
  try {
    return await getStaffByType('admin');
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

// This function is moved to departmentService.ts

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
  assignClassesToTeacher
};
