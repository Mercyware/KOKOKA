import api from './api';

// Term types
export interface Term {
  _id: string;
  name: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCurrent?: boolean;
  description?: string;
  school: string;
}

export interface TermCreateData {
  name: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  description?: string;
}

export interface TermUpdateData {
  name?: string;
  academicYear?: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  description?: string;
}

// Get all terms
export const getAllTerms = async () => {
  try {
    const response = await api.get('/terms');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single term by ID
export const getTerm = async (id: string) => {
  try {
    const response = await api.get(`/terms/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new term
export const createTerm = async (data: TermCreateData) => {
  try {
    const response = await api.post('/terms', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing term
export const updateTerm = async (id: string, data: TermUpdateData) => {
  try {
    const response = await api.put(`/terms/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a term
export const deleteTerm = async (id: string) => {
  try {
    const response = await api.delete(`/terms/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get terms by academic year
export const getTermsByAcademicYear = async (academicYearId: string) => {
  try {
    const response = await api.get(`/terms/academic-year/${academicYearId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get current term
export const getCurrentTerm = async () => {
  try {
    const response = await api.get('/terms/current');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Set a term as current
export const setCurrentTerm = async (id: string) => {
  try {
    const response = await api.patch(`/terms/${id}/set-current`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update term status (active/inactive)
export const updateTermStatus = async (id: string, isActive: boolean) => {
  try {
    const response = await api.patch(`/terms/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getAllTerms,
  getTerm,
  createTerm,
  updateTerm,
  deleteTerm,
  getTermsByAcademicYear,
  getCurrentTerm,
  setCurrentTerm,
  updateTermStatus
};
