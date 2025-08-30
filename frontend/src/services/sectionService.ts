import { get, post, put, del } from './api';
import { ApiResponse } from '../types';

export interface Section {
  id?: string;
  name: string;
  classId: string;
  capacity?: number;
  description?: string;
  schoolId: string;
  className?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all sections
export const getAllSections = async (): Promise<ApiResponse<Section[]>> => {
  return await get<Section[]>('/sections');
};

// Get section by ID
export const getSectionById = async (id: string): Promise<ApiResponse<Section>> => {
  return await get<Section>(`/sections/${id}`);
};

// Get sections by class ID
export const getSectionsByClass = async (classId: string): Promise<ApiResponse<Section[]>> => {
  return await get<Section[]>(`/sections/class/${classId}`);
};

// Create new section
export const createSection = async (sectionData: Omit<Section, 'id' | 'schoolId' | 'className' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Section>> => {
  return await post<Section>('/sections', sectionData);
};

// Update section
export const updateSection = async (id: string, sectionData: Partial<Omit<Section, 'id' | 'schoolId' | 'className' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Section>> => {
  return await put<Section>(`/sections/${id}`, sectionData);
};

// Delete section
export const deleteSection = async (id: string): Promise<ApiResponse<null>> => {
  return await del<null>(`/sections/${id}`);
};
