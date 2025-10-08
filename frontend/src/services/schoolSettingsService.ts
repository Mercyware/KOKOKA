import api from './api';

export interface SchoolSettings {
  id: string;
  name: string;
  subdomain: string;
  logo: string | null;
  description: string | null;
  established: string | null;
  type: string;
  status: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
  settings: {
    academic?: {
      gradingSystem?: string;
      passingGrade?: string;
      maxGrade?: string;
      gradeScale?: string;
      termSystem?: string;
      numberOfTerms?: string;
      attendanceTracking?: boolean;
      lateThreshold?: string;
      absentAfter?: string;
    };
    system?: {
      theme?: string;
      primaryColor?: string;
      language?: string;
      timezone?: string;
      dateFormat?: string;
      timeFormat?: string;
      currency?: string;
    };
    notifications?: {
      emailNotifications?: boolean;
      smsNotifications?: boolean;
      pushNotifications?: boolean;
      parentNotifications?: boolean;
      staffNotifications?: boolean;
      dailyReport?: boolean;
      weeklyReport?: boolean;
      attendanceAlerts?: boolean;
      gradeAlerts?: boolean;
    };
    features?: {
      attendance?: boolean;
      gradebook?: boolean;
      library?: boolean;
      transportation?: boolean;
      hostel?: boolean;
      canteen?: boolean;
      payroll?: boolean;
      inventory?: boolean;
      messaging?: boolean;
      events?: boolean;
    };
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSchoolSettingsPayload {
  name?: string;
  logo?: string;
  description?: string;
  established?: string;
  type?: string;
  email?: string;
  phone?: string;
  website?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  settings?: {
    academic?: any;
    system?: any;
    notifications?: any;
    features?: any;
  };
}

/**
 * Get current school settings
 */
export const getSchoolSettings = async (): Promise<SchoolSettings> => {
  const response = await api.get('/schools/settings');
  return response.data.school;
};

/**
 * Update school settings
 */
export const updateSchoolSettings = async (
  payload: UpdateSchoolSettingsPayload
): Promise<SchoolSettings> => {
  const response = await api.put('/schools/settings', payload);
  return response.data.school;
};

/**
 * Update only general information
 */
export const updateGeneralInfo = async (data: {
  name?: string;
  logo?: string;
  description?: string;
  established?: string;
  type?: string;
  email?: string;
  phone?: string;
  website?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}): Promise<SchoolSettings> => {
  return updateSchoolSettings(data);
};

/**
 * Update only academic settings
 */
export const updateAcademicSettings = async (academicSettings: any): Promise<SchoolSettings> => {
  return updateSchoolSettings({
    settings: { academic: academicSettings }
  });
};

/**
 * Update only system preferences
 */
export const updateSystemPreferences = async (systemPreferences: any): Promise<SchoolSettings> => {
  return updateSchoolSettings({
    settings: { system: systemPreferences }
  });
};

/**
 * Update only notification settings
 */
export const updateNotificationSettings = async (notificationSettings: any): Promise<SchoolSettings> => {
  return updateSchoolSettings({
    settings: { notifications: notificationSettings }
  });
};

/**
 * Update only feature toggles
 */
export const updateFeatureToggles = async (featureToggles: any): Promise<SchoolSettings> => {
  return updateSchoolSettings({
    settings: { features: featureToggles }
  });
};
