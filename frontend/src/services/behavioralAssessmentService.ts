import api from './api';

export interface BehavioralAssessment {
  id: string;
  title: string;
  description?: string;
  type: 'AFFECTIVE' | 'PSYCHOMOTOR';
  totalMarks: number;
  passingMarks: number;
  weight: number;
  duration?: number;
  scheduledDate?: string;
  dueDate?: string;
  instructions?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  rubric?: any;
  subjectId: string;
  classId: string;
  academicYearId: string;
  termId?: string;
  staffId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  class?: any;
  subject?: any;
  academicYear?: any;
  term?: any;
  staff?: any;
  _count?: {
    grades: number;
  };
}

export interface CreateBehavioralAssessmentData {
  title: string;
  description?: string;
  type: 'AFFECTIVE' | 'PSYCHOMOTOR';
  totalMarks: number;
  passingMarks?: number;
  weight?: number;
  scheduledDate?: string;
  dueDate?: string;
  instructions?: string;
  subjectId: string;
  classId: string;
  academicYearId: string;
  termId?: string;
  status?: string;
  criteria?: any;
}

export interface BehavioralGrade {
  studentId: string;
  marksObtained: number;
  feedback?: string;
  rubricScores?: any;
}

// Get all behavioral assessments
export const getAllBehavioralAssessments = async (params?: {
  classId?: string;
  subjectId?: string;
  academicYearId?: string;
  termId?: string;
  type?: 'AFFECTIVE' | 'PSYCHOMOTOR';
}) => {
  const queryParams = new URLSearchParams();
  if (params?.classId) queryParams.append('classId', params.classId);
  if (params?.subjectId) queryParams.append('subjectId', params.subjectId);
  if (params?.academicYearId) queryParams.append('academicYearId', params.academicYearId);
  if (params?.termId) queryParams.append('termId', params.termId);
  if (params?.type) queryParams.append('type', params.type);

  const queryString = queryParams.toString();
  const url = `/behavioral-assessments${queryString ? `?${queryString}` : ''}`;

  return api.get<BehavioralAssessment[]>(url);
};

// Get behavioral assessment by ID
export const getBehavioralAssessmentById = async (id: string) => {
  return api.get<BehavioralAssessment>(`/behavioral-assessments/${id}`);
};

// Create behavioral assessment
export const createBehavioralAssessment = async (data: CreateBehavioralAssessmentData) => {
  return api.post<BehavioralAssessment>('/behavioral-assessments', data);
};

// Update behavioral assessment
export const updateBehavioralAssessment = async (id: string, data: Partial<CreateBehavioralAssessmentData>) => {
  return api.put<BehavioralAssessment>(`/behavioral-assessments/${id}`, data);
};

// Delete behavioral assessment
export const deleteBehavioralAssessment = async (id: string) => {
  return api.delete(`/behavioral-assessments/${id}`);
};

// Submit grades for behavioral assessment
export const submitBehavioralGrades = async (id: string, grades: BehavioralGrade[]) => {
  return api.post(`/behavioral-assessments/${id}/grades`, { grades });
};
