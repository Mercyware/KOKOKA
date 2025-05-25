import api from './api';

// Department types
export interface Department {
  id: string;
  name: string;
  description: string;
  head?: {
    id: string;
    name: string;
    position: string;
  };
  status: string;
}

export interface DepartmentCreateData {
  name: string;
  description: string;
  headId?: string;
  status?: string;
}

export interface DepartmentUpdateData {
  name?: string;
  description?: string;
  headId?: string;
  status?: string;
}

// Get all departments
export const getDepartments = async () => {
  try {
    const response = await api.get('/departments');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single department by ID
export const getDepartment = async (id: string) => {
  try {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new department
export const createDepartment = async (data: DepartmentCreateData) => {
  try {
    const response = await api.post('/departments', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing department
export const updateDepartment = async (id: string, data: DepartmentUpdateData) => {
  try {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a department
export const deleteDepartment = async (id: string) => {
  try {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
