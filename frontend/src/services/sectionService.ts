import api from './api';
import { Section } from '../types';

/**
 * Get all sections
 */
export const getSections = async () => {
  const response = await api.get('/sections');
  return response.data.data;
};

/**
 * Get a section by ID
 */
export const getSection = async (id: string) => {
  const response = await api.get(`/sections/${id}`);
  return response.data.data;
};

/**
 * Create a new section
 */
export const createSection = async (sectionData: Partial<Section>) => {
  const response = await api.post('/sections', sectionData);
  return response.data;
};

/**
 * Update a section
 */
export const updateSection = async (id: string, sectionData: Partial<Section>) => {
  const response = await api.put(`/sections/${id}`, sectionData);
  return response.data;
};

/**
 * Delete a section
 */
export const deleteSection = async (id: string) => {
  const response = await api.delete(`/sections/${id}`);
  return response.data;
};

/**
 * Get students in a section
 */
export const getSectionStudents = async (id: string, params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}) => {
  const response = await api.get(`/sections/${id}/students`, { params });
  return response.data;
};

export default {
  getSections,
  getSection,
  createSection,
  updateSection,
  deleteSection,
  getSectionStudents
};
