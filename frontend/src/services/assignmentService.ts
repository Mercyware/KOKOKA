import api from './api';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  schoolId: string;
  dueDate: string;
  maxPoints: number;
  instructions: string;
  attachments: string[];
  allowLateSubmissions: boolean;
  latePenaltyPercentage: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  subject?: any;
  class?: any;
  teacher?: any;
  submission?: Submission;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  attachments: string[];
  submittedAt: string;
  isLate: boolean;
  status: 'DRAFT' | 'SUBMITTED' | 'LATE' | 'GRADED';
  grade: number | null;
  feedback: string | null;
  rubricScores: any;
  gradedAt: string | null;
  gradedBy: string | null;
  assignment?: Assignment;
  student?: any;
}

export interface AssignmentStats {
  totalStudents: number;
  totalSubmissions: number;
  submissionRate: number;
  gradedSubmissions: number;
  pendingGrading: number;
  gradingRate: number;
  lateSubmissions: number;
  averageGrade: number;
  maxPoints: number;
}

export interface StudentAssignments {
  upcoming: Assignment[];
  overdue: Assignment[];
  submitted: Assignment[];
  graded: Assignment[];
}

export interface LearningActivity {
  id: string;
  studentId: string;
  assignmentId: string | null;
  activityType: string;
  metadata: any;
  duration: number | null;
  timestamp: string;
  assignment?: Assignment;
}

export interface EngagementMetrics {
  timeRange: number;
  totalActivities: number;
  activeDays: number;
  activeRate: number;
  averageDailyActivities: number;
  totalDuration: number;
  averageDuration: number;
  activityTypeBreakdown: Record<string, number>;
  subjectEngagement: Record<string, number>;
  engagementScore: number;
}

const assignmentService = {
  // ==================== ASSIGNMENT ENDPOINTS ====================

  /**
   * Create a new assignment
   */
  async createAssignment(data: Partial<Assignment>) {
    const response = await api.post('/assignments', data);
    return response.data;
  },

  /**
   * Get all assignments with filters
   */
  async getAssignments(filters?: Record<string, any>) {
    const response = await api.get('/assignments', { params: filters });
    return response.data;
  },

  /**
   * Get assignment by ID
   */
  async getAssignment(id: string, includeSubmissions = false) {
    const response = await api.get(`/assignments/${id}`, {
      params: { includeSubmissions },
    });
    return response.data;
  },

  /**
   * Update assignment
   */
  async updateAssignment(id: string, data: Partial<Assignment>) {
    const response = await api.put(`/assignments/${id}`, data);
    return response.data;
  },

  /**
   * Delete assignment
   */
  async deleteAssignment(id: string) {
    const response = await api.delete(`/assignments/${id}`);
    return response.data;
  },

  /**
   * Get my assignments (student view)
   */
  async getMyAssignments(filters?: Record<string, any>): Promise<{ data: StudentAssignments }> {
    const response = await api.get('/assignments/my-assignments', { params: filters });
    return response.data;
  },

  /**
   * Get assignment statistics
   */
  async getAssignmentStats(id: string): Promise<{ data: AssignmentStats }> {
    const response = await api.get(`/assignments/${id}/stats`);
    return response.data;
  },

  /**
   * Get pending assignments
   */
  async getPendingAssignments() {
    const response = await api.get('/assignments/pending');
    return response.data;
  },

  // ==================== SUBMISSION ENDPOINTS ====================

  /**
   * Submit assignment
   */
  async submitAssignment(assignmentId: string, data: {
    content: string;
    attachments?: string[];
    isDraft?: boolean;
  }) {
    const response = await api.post(`/assignments/${assignmentId}/submit`, data);
    return response.data;
  },

  /**
   * Get submission by ID
   */
  async getSubmission(id: string): Promise<{ data: Submission }> {
    const response = await api.get(`/assignments/submissions/${id}`);
    return response.data;
  },

  /**
   * Get all submissions for an assignment
   */
  async getAssignmentSubmissions(assignmentId: string, filters?: Record<string, any>): Promise<{ data: Submission[] }> {
    const response = await api.get(`/assignments/${assignmentId}/submissions`, { params: filters });
    return response.data;
  },

  /**
   * Get my submissions (student view)
   */
  async getMySubmissions(filters?: Record<string, any>): Promise<{ data: Submission[] }> {
    const response = await api.get('/assignments/submissions/my-submissions', { params: filters });
    return response.data;
  },

  /**
   * Delete submission
   */
  async deleteSubmission(id: string) {
    const response = await api.delete(`/assignments/submissions/${id}`);
    return response.data;
  },

  /**
   * Get student submission statistics
   */
  async getStudentSubmissionStats(studentId?: string, filters?: Record<string, any>) {
    const endpoint = studentId
      ? `/assignments/submissions/stats/student/${studentId}`
      : '/assignments/submissions/stats/student';
    const response = await api.get(endpoint, { params: filters });
    return response.data;
  },

  /**
   * Get pending grading queue (teacher view)
   */
  async getPendingGradingQueue(): Promise<{ data: Submission[] }> {
    const response = await api.get('/assignments/grading/pending');
    return response.data;
  },

  // ==================== GRADING ENDPOINTS ====================

  /**
   * Grade a submission
   */
  async gradeSubmission(submissionId: string, data: {
    grade: number;
    feedback?: string;
    rubricScores?: any;
  }) {
    const response = await api.post(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  /**
   * Bulk grade submissions
   */
  async bulkGradeSubmissions(data: {
    submissionIds: string[];
    grade: number;
    feedback?: string;
  }) {
    const response = await api.post('/assignments/grading/bulk', data);
    return response.data;
  },

  /**
   * Update grade
   */
  async updateGrade(submissionId: string, data: {
    grade?: number;
    feedback?: string;
    rubricScores?: any;
  }) {
    const response = await api.put(`/assignments/submissions/${submissionId}/grade`, data);
    return response.data;
  },

  /**
   * Get grading statistics
   */
  async getGradingStats(assignmentId: string) {
    const response = await api.get(`/assignments/${assignmentId}/grading/stats`);
    return response.data;
  },

  /**
   * Get grade comparison
   */
  async getGradeComparison(submissionId: string) {
    const response = await api.get(`/assignments/submissions/${submissionId}/comparison`);
    return response.data;
  },

  /**
   * Get comment templates
   */
  async getCommentTemplates() {
    const response = await api.get('/assignments/grading/templates/comments');
    return response.data;
  },

  // ==================== LEARNING ACTIVITY ENDPOINTS ====================

  /**
   * Track learning activity
   */
  async trackActivity(data: {
    activityType: string;
    assignmentId?: string;
    metadata?: any;
    duration?: number;
  }) {
    const response = await api.post('/assignments/activities/track', data);
    return response.data;
  },

  /**
   * Get student learning activities
   */
  async getStudentActivities(studentId?: string, filters?: Record<string, any>): Promise<{ data: LearningActivity[] }> {
    const endpoint = studentId
      ? `/assignments/activities/student/${studentId}`
      : '/assignments/activities/student';
    const response = await api.get(endpoint, { params: filters });
    return response.data;
  },

  /**
   * Get engagement metrics
   */
  async getEngagementMetrics(studentId?: string, timeRange = 30): Promise<{ data: EngagementMetrics }> {
    const endpoint = studentId
      ? `/assignments/activities/engagement/${studentId}`
      : '/assignments/activities/engagement';
    const response = await api.get(endpoint, { params: { timeRange } });
    return response.data;
  },

  /**
   * Get learning patterns
   */
  async getLearningPatterns(studentId?: string, days = 30) {
    const endpoint = studentId
      ? `/assignments/activities/patterns/${studentId}`
      : '/assignments/activities/patterns';
    const response = await api.get(endpoint, { params: { days } });
    return response.data;
  },

  /**
   * Get participation score
   */
  async getParticipationScore(studentId?: string) {
    const endpoint = studentId
      ? `/assignments/activities/participation/${studentId}`
      : '/assignments/activities/participation';
    const response = await api.get(endpoint);
    return response.data;
  },

  /**
   * Get time-on-task analytics
   */
  async getTimeOnTask(studentId?: string, days = 30) {
    const endpoint = studentId
      ? `/assignments/activities/time-on-task/${studentId}`
      : '/assignments/activities/time-on-task';
    const response = await api.get(endpoint, { params: { days } });
    return response.data;
  },

  /**
   * Get learning journey
   */
  async getLearningJourney(studentId?: string, limit = 50) {
    const endpoint = studentId
      ? `/assignments/activities/journey/${studentId}`
      : '/assignments/activities/journey';
    const response = await api.get(endpoint, { params: { limit } });
    return response.data;
  },
};

export default assignmentService;
