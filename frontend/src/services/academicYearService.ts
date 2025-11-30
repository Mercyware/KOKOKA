import { get, post, put, del } from './api';
import { ApiResponse, AcademicYear } from '../types';

// Get all academic years
export const getAllAcademicYears = async (): Promise<ApiResponse<{ academicYears: AcademicYear[]; pagination?: any }>> => {
  return await get<{ academicYears: AcademicYear[]; pagination?: any }>('/academic-years');
};

// Get academic year by ID
export const getAcademicYearById = async (id: string): Promise<ApiResponse<AcademicYear>> => {
  return await get<AcademicYear>(`/academic-years/${id}`);
};

// Create new academic year
export const createAcademicYear = async (academicYear: Omit<AcademicYear, 'id'>): Promise<ApiResponse<AcademicYear>> => {
  return await post<AcademicYear>('/academic-years', academicYear);
};

// Update academic year
export const updateAcademicYear = async (id: string, academicYear: Partial<AcademicYear>): Promise<ApiResponse<AcademicYear>> => {
  return await put<AcademicYear>(`/academic-years/${id}`, academicYear);
};

// Delete academic year
export const deleteAcademicYear = async (id: string): Promise<ApiResponse<null>> => {
  return await del<null>(`/academic-years/${id}`);
};

// Get current academic year
export const getCurrentAcademicYear = async (): Promise<ApiResponse<AcademicYear>> => {
  return await get<AcademicYear>('/academic-years/current');
};

// Get active academic year
export const getActiveAcademicYear = async (): Promise<ApiResponse<AcademicYear>> => {
  return await get<AcademicYear>('/academic-years/active');
};

// Set active academic year
export const setActiveAcademicYear = async (id: string): Promise<ApiResponse<AcademicYear>> => {
  return await put<AcademicYear>(`/academic-years/${id}/set-active`, {});
};

// Check if academic year name exists
export const checkAcademicYearName = async (name: string, school: string): Promise<ApiResponse<{ exists: boolean }>> => {
  return await get<{ exists: boolean }>('/academic-years/check-name', { name, school });
};
