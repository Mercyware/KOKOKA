import api from './api';
import { Staff } from '../types';

/**
 * Get all staff members
 */
export const getStaffMembers = async () => {
  const response = await api.get('/staff');
  return response.data.data;
};

/**
 * Get a staff member by ID
 */
export const getStaffMember = async (id: string) => {
  const response = await api.get(`/staff/${id}`);
  return response.data.data;
};

/**
 * Create a new staff member
 */
export const createStaffMember = async (staffData: Partial<Staff>) => {
  const response = await api.post('/staff', staffData);
  return response.data;
};

/**
 * Update a staff member
 */
export const updateStaffMember = async (id: string, staffData: Partial<Staff>) => {
  const response = await api.put(`/staff/${id}`, staffData);
  return response.data;
};

/**
 * Delete a staff member
 */
export const deleteStaffMember = async (id: string) => {
  const response = await api.delete(`/staff/${id}`);
  return response.data;
};

export default {
  getStaffMembers,
  getStaffMember,
  createStaffMember,
  updateStaffMember,
  deleteStaffMember
};
