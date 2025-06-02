import api from './api';
import { Class } from '../types';

/**
 * Get all classes with optional filtering, pagination, and sorting
 */
export const getClasses = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  academicYear?: string;
  level?: number;
}) => {
  const response = await api.get('/classes', { params });
  return response.data;
};

/**
 * Get a class by ID
 */
export const getClassById = async (id: string) => {
  const response = await api.get(`/classes/${id}`);
  return response.data;
};

/**
 * Create a new class
 */
export const createClass = async (classData: Partial<Class>) => {
  const response = await api.post('/classes', classData);
  return response.data;
};

/**
 * Update a class
 */
export const updateClass = async (id: string, classData: Partial<Class>) => {
  const response = await api.put(`/classes/${id}`, classData);
  return response.data;
};

/**
 * Delete a class
 */
export const deleteClass = async (id: string) => {
  const response = await api.delete(`/classes/${id}`);
  return response.data;
};

/**
 * Get students in a class
 */
export const getClassStudents = async (id: string, params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) => {
  const response = await api.get(`/classes/${id}/students`, { params });
  return response.data;
};

/**
 * Get subjects taught in a class
 */
export const getClassSubjects = async (id: string) => {
  const response = await api.get(`/classes/${id}/subjects`);
  return response.data;
};

export default {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  getClassStudents,
  getClassSubjects,
};
