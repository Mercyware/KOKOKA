import api from './api';
import { ClassArm } from '../types';

/**
 * Get all class arms
 */
export const getClassArms = async () => {
  try {
    const response = await api.get('/class-arms');
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching class arms:', error);
    return [];
  }
};

/**
 * Get a class arm by ID
 */
export const getClassArm = async (id: string) => {
  const response = await api.get(`/class-arms/${id}`);
  return response.data.data;
};

/**
 * Create a new class arm
 */
export const createClassArm = async (classArmData: Partial<ClassArm>) => {
  const response = await api.post('/class-arms', classArmData);
  return response.data;
};

/**
 * Update a class arm
 */
export const updateClassArm = async (id: string, classArmData: Partial<ClassArm>) => {
  const response = await api.put(`/class-arms/${id}`, classArmData);
  return response.data;
};

/**
 * Delete a class arm
 */
export const deleteClassArm = async (id: string) => {
  const response = await api.delete(`/class-arms/${id}`);
  return response.data;
};

/**
 * Get students in a class arm
 */
export const getClassArmStudents = async (id: string, params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) => {
  const response = await api.get(`/class-arms/${id}/students`, { params });
  return response.data;
};

export default {
  getClassArms,
  getClassArm,
  createClassArm,
  updateClassArm,
  deleteClassArm,
  getClassArmStudents
};
