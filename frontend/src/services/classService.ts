import { get, post, put, del } from './api';
import { ApiResponse, Class } from '../types';

// Get all classes
export const getAllClasses = async (): Promise<ApiResponse<Class[]>> => {
  return await get<Class[]>('/classes');
};

// Get class by ID
export const getClassById = async (id: string): Promise<ApiResponse<Class>> => {
  return await get<Class>(`/classes/${id}`);
};

// Create new class
export const createClass = async (classData: Omit<Class, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Class>> => {
  return await post<Class>('/classes', classData);
};

// Update class
export const updateClass = async (id: string, classData: Partial<Omit<Class, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Class>> => {
  return await put<Class>(`/classes/${id}`, classData);
};

// Delete class
export const deleteClass = async (id: string): Promise<ApiResponse<null>> => {
  return await del<null>(`/classes/${id}`);
};

// Bulk update class grades
export const bulkUpdateClassGrades = async (updates: { id: string; grade: string }[]): Promise<ApiResponse<Class[]>> => {
  return await put<Class[]>('/classes/bulk-update-grades', { updates });
};
