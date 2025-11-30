import api from './api';

export interface Grade {
  id?: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  letterGrade?: string;
  gpa?: number;
  points?: number;
  status: 'PENDING' | 'COMPLETED' | 'PUBLISHED';
  feedback?: string;
  privateNotes?: string;
  attempt: number;
  submittedAt?: string;
  isLate: boolean;
  daysLate: number;
  gradedAt?: string;
  student?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  assessment?: {
    id: string;
    title: string;
    type: string;
    totalMarks: number;
  };
}

export interface ScoreEntry {
  assessmentId: string;
  studentId: string;
  marksObtained: number;
  totalMarks?: number;
  feedback?: string;
  privateNotes?: string;
}

export interface BulkScoresRequest {
  scores: ScoreEntry[];
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  type: 'ASSIGNMENT' | 'QUIZ' | 'EXAM' | 'TEST' | 'PROJECT' | 'PRESENTATION';
  totalMarks: number;
  passingMarks: number;
  weight: number;
  duration?: number;
  scheduledDate?: string;
  dueDate?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED' | 'COMPLETED';
  classId: string;
  subjectId: string;
  academicYearId: string;
  termId?: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  class: {
    id: string;
    name: string;
    grade: string;
  };
  academicYear: {
    id: string;
    name: string;
  };
  term?: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  staff?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface Student {
  id: string;
  admissionNumber: string;
  user: {
    name: string;
    email: string;
  };
  studentClassHistory: Array<{
    class: {
      id: string;
      name: string;
      grade: string;
    };
    academicYear: {
      id: string;
      name: string;
    };
  }>;
}

export interface FormData {
  classes: Array<{
    id: string;
    name: string;
  }>;
  subjects: Array<{
    id: string;
    name: string;
  }>;
  academicYears: Array<{
    id: string;
    name: string;
  }>;
  terms: Array<{
    id: string;
    name: string;
  }>;
}

class ScoreService {
  // Get form data (classes, subjects, academic years, terms)
  async getFormData(): Promise<FormData> {
    const response = await api.get('/scores/form-data');
    return response.data.data;
  }

  // Get assessments with optional filters
  async getAssessments(params?: {
    classId?: string;
    subjectId?: string;
    academicYearId?: string;
    termId?: string;
  }): Promise<Assessment[]> {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const response = await api.get(`/scores/assessments${queryString ? `?${queryString}` : ''}`);
    console.log('Assessment API response:', response.data);
    // Handle both response.data.data and response.data formats
    const data = response.data?.data || response.data;
    return Array.isArray(data) ? data : [];
  }

  // Get students in a class for a specific academic year
  async getStudentsInClass(classId: string, academicYearId: string): Promise<Student[]> {
    const response = await api.get(`/scores/students?classId=${classId}&academicYearId=${academicYearId}`);
    return response.data.data;
  }

  // Get existing scores for an assessment
  async getScores(assessmentId: string): Promise<Grade[]> {
    const response = await api.get(`/scores/assessment/${assessmentId}`);
    return response.data.data;
  }

  // Create or update a single score
  async createOrUpdateScore(scoreData: ScoreEntry): Promise<Grade> {
    const response = await api.post('/scores', scoreData);
    return response.data.data;
  }

  // Bulk create or update scores
  async bulkCreateOrUpdateScores(scoresData: BulkScoresRequest): Promise<any> {
    const response = await api.post('/scores/bulk', scoresData);
    return response.data.data;
  }

  // Upload scores via CSV
  async uploadScoresCSV(file: File, assessmentId: string): Promise<any> {
    const formData = new FormData();
    formData.append('csvFile', file);
    formData.append('assessmentId', assessmentId);

    const response = await api.post('/scores/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // Delete a score
  async deleteScore(id: string): Promise<any> {
    const response = await api.delete(`/scores/${id}`);
    return response.data;
  }
}

export default new ScoreService();
