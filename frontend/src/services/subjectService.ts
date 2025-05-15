import { get, post, put, del } from './api';
import { ApiResponse, Subject } from '../types';

// Get all subjects
export const getAllSubjects = async (): Promise<ApiResponse<Subject[]>> => {
  return await get<Subject[]>('/subjects');
};

export const getSubjectList = async (): Promise<ApiResponse<Subject[]>> => {
  return await get<Subject[]>('/subjects/subject-list');
}

// Get subject by ID
export const getSubjectById = async (id: string): Promise<ApiResponse<Subject>> => {
  return await get<Subject>(`/subjects/${id}`);
};

// Get subjects by academic year
export const getSubjectsByAcademicYear = async (academicYearId: string): Promise<ApiResponse<Subject[]>> => {
  return await get<Subject[]>(`/subjects/academic-year/${academicYearId}`);
};

// Get subjects by class
export const getSubjectsByClass = async (classId: string): Promise<ApiResponse<Subject[]>> => {
  return await get<Subject[]>(`/subjects/class/${classId}`);
};

// Create new subject
export const createSubject = async (subject: Omit<Subject, 'id'>): Promise<ApiResponse<Subject>> => {
  return await post<Subject>('/subjects', subject);
};

// Update subject
export const updateSubject = async (id: string, subject: Partial<Subject>): Promise<ApiResponse<Subject>> => {
  return await put<Subject>(`/subjects/${id}`, subject);
};

// Delete subject
export const deleteSubject = async (id: string): Promise<ApiResponse<null>> => {
  return await del<null>(`/subjects/${id}`);
};

// Add class to subject
export const addClassToSubject = async (subjectId: string, classId: string): Promise<ApiResponse<Subject>> => {
  return await post<Subject>(`/subjects/${subjectId}/classes`, { classId });
};

// Remove class from subject
export const removeClassFromSubject = async (subjectId: string, classId: string): Promise<ApiResponse<Subject>> => {
  return await del<Subject>(`/subjects/${subjectId}/classes`, { data: { classId } });
};

// Get teachers assigned to subject
export const getSubjectTeachers = async (id: string): Promise<ApiResponse<any[]>> => {
  return await get<any[]>(`/subjects/${id}/teachers`);
};

// Import subject from school manager
export const importSubjectFromSchoolManager = async (subject: Partial<Subject>): Promise<ApiResponse<Subject>> => {
  return await post<Subject>('/subjects/import', subject);
};
