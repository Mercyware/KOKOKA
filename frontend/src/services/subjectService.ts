import { get, post, put, del } from './api';
import { ApiResponse, Subject } from '../types';

export interface SubjectData {
  name: string;
  code: string;
  description?: string;
  departmentId?: string;
}

export interface SubjectListParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Get all subjects
export const getAllSubjects = async (params?: SubjectListParams): Promise<ApiResponse<Subject[]>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  
  const url = params ? `/subjects?${queryParams.toString()}` : '/subjects';
  return await get<Subject[]>(url);
};

// Get subject by ID
export const getSubjectById = async (id: string): Promise<ApiResponse<Subject>> => {
  return await get<Subject>(`/subjects/${id}`);
};

// Create new subject
export const createSubject = async (subject: SubjectData): Promise<ApiResponse<Subject>> => {
  return await post<Subject>('/subjects', subject);
};

// Update subject
export const updateSubject = async (id: string, subject: Partial<SubjectData>): Promise<ApiResponse<Subject>> => {
  return await put<Subject>(`/subjects/${id}`, subject);
};

// Delete subject
export const deleteSubject = async (id: string): Promise<ApiResponse<null>> => {
  return await del<null>(`/subjects/${id}`);
};
