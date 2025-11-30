import api from './api';

export const analyticsService = {
  // Attendance Analytics
  attendance: {
    /**
     * Analyze student attendance
     */
    async analyzeStudent(studentId: string, windowDays = 30) {
      const response = await api.get(`/analytics/attendance/student/${studentId}`, {
        params: { windowDays },
      });
      return response.data.data;
    },

    /**
     * Analyze class attendance
     */
    async analyzeClass(classId: string, windowDays = 30) {
      const response = await api.get(`/analytics/attendance/class/${classId}`, {
        params: { windowDays },
      });
      return response.data.data;
    },

    /**
     * Get at-risk students
     */
    async getAtRiskStudents(classId?: string, threshold = 85) {
      const response = await api.get('/analytics/attendance/at-risk', {
        params: { classId, threshold },
      });
      return response.data.data;
    },

    /**
     * Resolve attendance pattern
     */
    async resolvePattern(patternId: string, notes?: string) {
      const response = await api.put(`/analytics/attendance/patterns/${patternId}/resolve`, {
        notes,
      });
      return response.data;
    },
  },

  // Performance Predictions
  predictions: {
    /**
     * Predict student grade
     */
    async predictGrade(studentId: string, subjectId?: string, timeframe = 'end_of_year') {
      const response = await api.get(`/analytics/predictions/student/${studentId}/grade`, {
        params: { subjectId, timeframe },
      });
      return response.data.data;
    },
  },

  // Risk Assessment
  risk: {
    /**
     * Assess student risk
     */
    async assessStudent(studentId: string) {
      const response = await api.get(`/analytics/risk/student/${studentId}`);
      return response.data.data;
    },

    /**
     * Get high-risk students
     */
    async getHighRiskStudents(riskLevel = 'HIGH', limit = 50) {
      const response = await api.get('/analytics/risk/high-risk', {
        params: { riskLevel, limit },
      });
      return response.data.data;
    },

    /**
     * Resolve risk assessment
     */
    async resolveAssessment(assessmentId: string, notes?: string) {
      const response = await api.put(`/analytics/risk/${assessmentId}/resolve`, { notes });
      return response.data;
    },
  },

  /**
   * Get comprehensive student analytics
   */
  async getComprehensiveAnalytics(studentId: string) {
    const response = await api.get(`/analytics/student/${studentId}/comprehensive`);
    return response.data.data;
  },
};
