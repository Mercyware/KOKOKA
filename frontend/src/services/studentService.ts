import api from './api';
import { Student, StudentClassHistory } from '../types';

/**
 * Get all students with optional filtering, pagination, and sorting
 */
export const getStudents = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: string;
  class?: string;
  search?: string;
  admissionDateFrom?: string;
  admissionDateTo?: string;
  gender?: string;
  academicYear?: string;
}) => {
  const response = await api.get('/students', { params });
  return response.data;
};

/**
 * Get a student by ID
 */
export const getStudentById = async (id: string) => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

/**
 * Create a new student
 */
export const createStudent = async (studentData: Partial<Student>) => {
  const response = await api.post('/students', studentData);
  return response.data;
};

/**
 * Update a student
 */
export const updateStudent = async (id: string, studentData: Partial<Student>) => {
  const response = await api.put(`/students/${id}`, studentData);
  return response.data;
};

/**
 * Delete a student
 */
export const deleteStudent = async (id: string) => {
  const response = await api.delete(`/students/${id}`);
  return response.data;
};

/**
 * Get student attendance
 */
export const getStudentAttendance = async (id: string) => {
  const response = await api.get(`/students/${id}/attendance`);
  return response.data;
};

/**
 * Get student grades
 */
export const getStudentGrades = async (id: string) => {
  const response = await api.get(`/students/${id}/grades`);
  return response.data;
};

/**
 * Get student documents
 */
export const getStudentDocuments = async (id: string) => {
  const response = await api.get(`/students/${id}/documents`);
  return response.data;
};

/**
 * Upload document for student
 */
export const uploadStudentDocument = async (id: string, documentData: any) => {
  const response = await api.post(`/students/${id}/documents`, documentData);
  return response.data;
};

/**
 * Delete student document
 */
export const deleteStudentDocument = async (studentId: string, documentId: string) => {
  const response = await api.delete(`/students/${studentId}/documents/${documentId}`);
  return response.data;
};

/**
 * Verify student document
 */
export const verifyStudentDocument = async (studentId: string, documentId: string) => {
  const response = await api.put(`/students/${studentId}/documents/${documentId}/verify`);
  return response.data;
};

/**
 * Get student class history
 */
export const getStudentClassHistory = async (id: string) => {
  const response = await api.get<StudentClassHistory[]>(`/students/${id}/class-history`);
  return response.data;
};

/**
 * Get all student class history records
 */
export const getAllStudentClassHistory = async (params?: {
  page?: number;
  limit?: number;
  academicYear?: string;
  class?: string;
}) => {
  const response = await api.get('/student-class-history', { params });
  return response.data;
};

/**
 * Search students by academic year and class
 */
export const searchStudentsByAcademicYearAndClass = async (params: {
  academicYear: string;
  class?: string;
  classArm?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/student-class-history/search', { params });
  return response.data;
};

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentAttendance,
  getStudentGrades,
  getStudentDocuments,
  uploadStudentDocument,
  deleteStudentDocument,
  verifyStudentDocument,
  getStudentClassHistory,
  getAllStudentClassHistory,
  searchStudentsByAcademicYearAndClass
};
