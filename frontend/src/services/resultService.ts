import api from './api';
import { ApiResponse } from '../types';

export interface GradeScale {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  type: 'PERCENTAGE' | 'GPA' | 'POINTS' | 'CUSTOM';
  schoolId: string;
  ranges: GradeRange[];
  createdAt: string;
  updatedAt: string;
}

export interface GradeRange {
  id: string;
  minScore: number;
  maxScore: number;
  grade: string;
  points?: number;
  description?: string;
  order: number;
  gradeScaleId: string;
}

export interface Result {
  id: string;
  studentId: string;
  termId: string;
  classId: string;
  totalScore: number;
  averageScore: number;
  grade: string;
  points?: number;
  position?: number;
  totalStudents?: number;
  remarks?: string;
  isPublished: boolean;
  schoolId: string;
  student: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  term: {
    id: string;
    name: string;
    academicYear: {
      name: string;
    };
  };
  class: {
    id: string;
    name: string;
  };
  subjectResults: SubjectResult[];
  createdAt: string;
  updatedAt: string;
}

export interface SubjectResult {
  id: string;
  resultId: string;
  subjectId: string;
  caScore?: number;
  examScore?: number;
  totalScore: number;
  grade: string;
  points?: number;
  position?: number;
  totalStudents?: number;
  remarks?: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
}

export interface CreateResultData {
  studentId: string;
  termId: string;
  classId: string;
  subjectResults: {
    subjectId: string;
    caScore?: number;
    examScore?: number;
  }[];
  remarks?: string;
}

export interface ResultFilters {
  termId?: string;
  classId?: string;
  studentId?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}

class ResultService {
  // Create or update result
  async createOrUpdateResult(data: CreateResultData): Promise<Result> {
    const response = await api.post('/results', data);
    return response.data.data;
  }

  // Get results with filters
  async getResults(filters: ResultFilters = {}): Promise<{ results: Result[]; total: number; page: number; limit: number }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/results?${params.toString()}`);
    return response.data.data;
  }

  // Get single result by ID
  async getResult(id: string): Promise<Result> {
    const response = await api.get(`/results/${id}`);
    return response.data.data;
  }

  // Get student result for specific term
  async getStudentResult(studentId: string, termId: string): Promise<Result | null> {
    const response = await api.get(`/results/student/${studentId}/term/${termId}`);
    return response.data.data;
  }

  // Generate report card
  async generateReportCard(studentId: string, termId: string): Promise<any> {
    const response = await api.get(`/results/report-card/${studentId}/${termId}`);
    return response.data.data;
  }

  // Publish results for a term and class
  async publishResults(termId: string, classId: string): Promise<any> {
    const response = await api.post(`/results/publish`, { termId, classId });
    return response.data;
  }

  // Unpublish results for a term and class
  async unpublishResults(termId: string, classId: string): Promise<any> {
    const response = await api.post(`/results/unpublish`, { termId, classId });
    return response.data;
  }

  // Calculate positions for a term and class
  async calculatePositions(termId: string, classId: string): Promise<any> {
    const response = await api.post(`/results/calculate-positions`, { termId, classId });
    return response.data;
  }

  // Delete result
  async deleteResult(id: string): Promise<any> {
    const response = await api.delete(`/results/${id}`);
    return response.data;
  }

  // Grade Scale Management
  async getGradeScales(): Promise<GradeScale[]> {
    const response = await api.get('/grade-scales');
    return response.data.data;
  }

  async createGradeScale(data: Omit<GradeScale, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>): Promise<GradeScale> {
    const response = await api.post('/grade-scales', data);
    return response.data.data;
  }

  async updateGradeScale(id: string, data: Partial<GradeScale>): Promise<GradeScale> {
    const response = await api.put(`/grade-scales/${id}`, data);
    return response.data.data;
  }

  async deleteGradeScale(id: string): Promise<any> {
    const response = await api.delete(`/grade-scales/${id}`);
    return response.data;
  }

  async getDefaultGradeScales(): Promise<GradeScale[]> {
    const response = await api.get('/grade-scales/defaults');
    return response.data.data;
  }

  async setActiveGradeScale(id: string): Promise<any> {
    const response = await api.post(`/grade-scales/${id}/activate`);
    return response.data;
  }
}

export default new ResultService();