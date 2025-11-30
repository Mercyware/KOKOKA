import { get, post, put, del } from './api';
import { ApiResponse, PaginatedResponse, Section } from '../types';

export interface SectionQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Get all sections with pagination
export const getSections = async (params?: SectionQueryParams): Promise<ApiResponse<PaginatedResponse<Section>>> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);

  const url = queryParams.toString() ? `/sections?${queryParams}` : '/sections';
  
  const response = await get<PaginatedResponse<Section>>(url);
  return response;
};

// Get section by ID
export const getSection = async (id: string): Promise<ApiResponse<Section>> => {
  return await get<Section>(`/sections/${id}`);
};

// Create new section
export const createSection = async (sectionData: Omit<Section, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Section>> => {
  return await post<Section>('/sections', sectionData);
};

// Update section
export const updateSection = async (id: string, sectionData: Partial<Omit<Section, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<Section>> => {
  return await put<Section>(`/sections/${id}`, sectionData);
};

// Delete section
export const deleteSection = async (id: string): Promise<ApiResponse<null>> => {
  return await del<null>(`/sections/${id}`);
};
