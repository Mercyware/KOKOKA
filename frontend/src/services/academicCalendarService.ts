import { get, post, put, del } from './api';
import { ApiResponse } from '../types';

export interface Holiday {
  _id?: string;
  name: string;
  date: string;
  description?: string;
}

export interface AcademicCalendar {
  _id?: string;
  school: string;
  academicYear: string | { _id: string; name: string };
  term: 'First' | 'Second' | 'Third';
  startDate: string;
  endDate: string;
  holidays: Holiday[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkingDaysResponse {
  totalDays: number;
  workingDays: string[];
}

export interface HolidayCheckResponse {
  date: string;
  isHoliday: boolean;
  holidayInfo: Holiday | null;
}

// Get all academic calendars
export const getAllAcademicCalendars = async (): Promise<ApiResponse<AcademicCalendar[]>> => {
  return await get<AcademicCalendar[]>('/academic-calendars');
};

// Get academic calendar by ID
export const getAcademicCalendarById = async (id: string): Promise<ApiResponse<AcademicCalendar>> => {
  return await get<AcademicCalendar>(`/academic-calendars/${id}`);
};

// Get academic calendars by academic year
export const getAcademicCalendarsByAcademicYear = async (academicYearId: string): Promise<ApiResponse<AcademicCalendar[]>> => {
  return await get<AcademicCalendar[]>(`/academic-calendars/academic-year/${academicYearId}`);
};

// Create new academic calendar
export const createAcademicCalendar = async (academicCalendar: Omit<AcademicCalendar, '_id'>): Promise<ApiResponse<AcademicCalendar>> => {
  return await post<AcademicCalendar>('/academic-calendars', academicCalendar);
};

// Update academic calendar
export const updateAcademicCalendar = async (id: string, academicCalendar: Partial<AcademicCalendar>): Promise<ApiResponse<AcademicCalendar>> => {
  return await put<AcademicCalendar>(`/academic-calendars/${id}`, academicCalendar);
};

// Delete academic calendar
export const deleteAcademicCalendar = async (id: string): Promise<ApiResponse<null>> => {
  return await del<null>(`/academic-calendars/${id}`);
};

// Get working days
export const getWorkingDays = async (id: string): Promise<ApiResponse<WorkingDaysResponse>> => {
  return await get<WorkingDaysResponse>(`/academic-calendars/${id}/working-days`);
};

// Check if a date is a holiday
export const checkHoliday = async (id: string, date: string): Promise<ApiResponse<HolidayCheckResponse>> => {
  return await get<HolidayCheckResponse>(`/academic-calendars/${id}/check-holiday`, { date });
};

// Add holiday to academic calendar
export const addHoliday = async (id: string, holiday: Omit<Holiday, '_id'>): Promise<ApiResponse<AcademicCalendar>> => {
  return await post<AcademicCalendar>(`/academic-calendars/${id}/holidays`, holiday);
};

// Remove holiday from academic calendar
export const removeHoliday = async (id: string, holidayId: string): Promise<ApiResponse<AcademicCalendar>> => {
  return await del<AcademicCalendar>(`/academic-calendars/${id}/holidays/${holidayId}`);
};
