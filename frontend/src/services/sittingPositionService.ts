import api from './api';

// Sitting Position types
export interface ClassroomLayoutResponse {
  rows: number;
  columns: number;
  positions: SittingPositionResponse[];
  layout: Array<Array<SittingPositionResponse | null>>;
  assignedDate?: Date;
}

export interface SittingPositionResponse {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  class: {
    _id: string;
    name: string;
  };
  classArm: {
    _id: string;
    name: string;
  };
  academicYear: {
    _id: string;
    name: string;
  };
  term: {
    _id: string;
    name: string;
  };
  row: number;
  column: number;
  positionNumber: number;
  isActive: boolean;
  remarks?: string;
  assignedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SittingPositionRequest {
  student: string; // Student ID
  class: string; // Class ID
  classArm: string; // Class Arm ID
  academicYear: string; // Academic Year ID
  term: string; // Term ID
  row: number;
  column: number;
  positionNumber: number;
  isActive: boolean;
  remarks?: string;
}

export interface SittingPositionFilter {
  academicYear?: string;
  term?: string;
  class?: string;
  classArm?: string;
  student?: string;
  isActive?: boolean;
}

// Get all sitting positions with optional filtering
export const getSittingPositions = async (filters?: SittingPositionFilter) => {
  try {
    const response = await api.get('/sitting-positions', { params: filters });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get a single sitting position by ID
export const getSittingPosition = async (id: string) => {
  try {
    const response = await api.get(`/sitting-positions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new sitting position
export const createSittingPosition = async (data: SittingPositionRequest) => {
  try {
    const response = await api.post('/sitting-positions', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update an existing sitting position
export const updateSittingPosition = async (id: string, data: Partial<SittingPositionRequest>) => {
  try {
    const response = await api.put(`/sitting-positions/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a sitting position
export const deleteSittingPosition = async (id: string) => {
  try {
    const response = await api.delete(`/sitting-positions/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get sitting positions by student
export const getSittingPositionsByStudent = async (studentId: string) => {
  try {
    const response = await api.get(`/sitting-positions/student/${studentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get sitting positions by class and arm
export const getSittingPositionsByClassAndArm = async (classId: string, classArmId: string, termId?: string) => {
  try {
    const params = termId ? { term: termId } : {};
    const response = await api.get(`/sitting-positions/class/${classId}/arm/${classArmId}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get sitting positions by academic year
export const getSittingPositionsByAcademicYear = async (academicYearId: string) => {
  try {
    const response = await api.get(`/sitting-positions/academic-year/${academicYearId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get sitting positions by term
export const getSittingPositionsByTerm = async (termId: string) => {
  try {
    const response = await api.get(`/sitting-positions/term/${termId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update sitting position status (active/inactive)
export const updateSittingPositionStatus = async (id: string, isActive: boolean) => {
  try {
    const response = await api.patch(`/sitting-positions/${id}/status`, { isActive });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get classroom layout for a specific class and arm
export const getClassroomLayout = async (classId: string, classArmId: string, termId: string) => {
  try {
    const response = await api.get(`/sitting-positions/layout/class/${classId}/arm/${classArmId}`, {
      params: { term: termId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default {
  getSittingPositions,
  getSittingPosition,
  createSittingPosition,
  updateSittingPosition,
  deleteSittingPosition,
  getSittingPositionsByStudent,
  getSittingPositionsByClassAndArm,
  getSittingPositionsByAcademicYear,
  getSittingPositionsByTerm,
  updateSittingPositionStatus,
  getClassroomLayout
};
