import { get, post, put, del } from './api';
import { ApiResponse } from '../types';

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: 'EXAM' | 'QUIZ' | 'ASSIGNMENT' | 'TEST' | 'PROJECT';
  totalMarks: number;
  passingMarks?: number;
  weight?: number;
  duration?: number;
  scheduledDate?: string;
  dueDate?: string;
  instructions?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'COMPLETED' | 'ARCHIVED';
  subjectId: string;
  classId: string;
  academicYearId?: string;
  termId?: string;
  schoolId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;

  // Relationships
  subject?: {
    id: string;
    name: string;
    code: string;
  };
  class?: {
    id: string;
    name: string;
    grade: string;
  };
  academicYear?: {
    id: string;
    name: string;
  };
  term?: {
    id: string;
    name: string;
  };
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateAssessmentData {
  title: string;
  description?: string;
  type: string;
  totalMarks: number;
  passingMarks?: number;
  weight?: number;
  duration?: number;
  scheduledDate?: string;
  dueDate?: string;
  instructions?: string;
  status?: string;
  subjectId: string;
  classId: string;
  academicYearId?: string;
  termId?: string;
}

// Get all assessments
export const getAllAssessments = async (params?: {
  classId?: string;
  subjectId?: string;
  academicYearId?: string;
  termId?: string;
  status?: string;
}): Promise<ApiResponse<Assessment[]>> => {
  return await get<Assessment[]>('/assessments', params);
};

// Get assessment by ID
export const getAssessmentById = async (id: string): Promise<ApiResponse<Assessment>> => {
  return await get<Assessment>(`/assessments/${id}`);
};

// Create new assessment
export const createAssessment = async (assessmentData: CreateAssessmentData): Promise<ApiResponse<Assessment>> => {
  return await post<Assessment>('/assessments', assessmentData);
};

// Update assessment
export const updateAssessment = async (id: string, assessmentData: Partial<CreateAssessmentData>): Promise<ApiResponse<Assessment>> => {
  return await put<Assessment>(`/assessments/${id}`, assessmentData);
};

// Delete assessment
export const deleteAssessment = async (id: string): Promise<ApiResponse<null>> => {
  return await del<null>(`/assessments/${id}`);
};

// Publish assessment
export const publishAssessment = async (id: string): Promise<ApiResponse<Assessment>> => {
  return await put<Assessment>(`/assessments/${id}/publish`);
};

// Archive assessment
export const archiveAssessment = async (id: string): Promise<ApiResponse<Assessment>> => {
  return await put<Assessment>(`/assessments/${id}/archive`);
};