// API Configuration
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 30000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register', 
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout',
      VERIFY_EMAIL: '/auth/verify-email',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
    
    // Schools
    SCHOOLS: {
      BASE: '/schools',
      REGISTER: '/schools/register',
      PROFILE: '/schools/profile',
    },
    
    // Students
    STUDENTS: {
      BASE: '/students',
      BY_ID: (id: string) => `/students/${id}`,
      CLASS_HISTORY: '/student-class-history',
    },
    
    // Staff & Teachers
    STAFF: {
      BASE: '/staff',
      BY_ID: (id: string) => `/staff/${id}`,
    },
    
    TEACHERS: {
      BASE: '/teachers',
      BY_ID: (id: string) => `/teachers/${id}`,
      SUBJECTS: '/teacher-subject-assignments',
    },
    
    // Academic Management
    ACADEMIC_YEARS: {
      BASE: '/academic-years',
      BY_ID: (id: string) => `/academic-years/${id}`,
    },
    
    ACADEMIC_CALENDARS: {
      BASE: '/academic-calendars',
      BY_ID: (id: string) => `/academic-calendars/${id}`,
    },
    
    TERMS: {
      BASE: '/terms',
      BY_ID: (id: string) => `/terms/${id}`,
    },
    
    CLASSES: {
      BASE: '/classes',
      BY_ID: (id: string) => `/classes/${id}`,
      TEACHERS: '/class-teachers',
    },
    
    SUBJECTS: {
      BASE: '/subjects',
      BY_ID: (id: string) => `/subjects/${id}`,
    },
    
    // School Structure
    DEPARTMENTS: {
      BASE: '/departments',
      BY_ID: (id: string) => `/departments/${id}`,
    },
    
    HOUSES: {
      BASE: '/houses',
      BY_ID: (id: string) => `/houses/${id}`,
    },
    
    SECTIONS: {
      BASE: '/sections',
      BY_ID: (id: string) => `/sections/${id}`,
    },
    
    // Assignments & Positions
    SITTING_POSITIONS: {
      BASE: '/sitting-positions',
      BY_ID: (id: string) => `/sitting-positions/${id}`,
    },
    
    // AI Features
    AI: {
      BASE: '/ai',
      INSIGHTS: '/ai/insights',
      RECOMMENDATIONS: '/ai/recommendations',
    },
    
    // Timetables & Exams
    TIMETABLES: {
      BASE: '/timetables',
      BY_ID: (id: string) => `/timetables/${id}`,
    },
    
    EXAMS: {
      BASE: '/exams',
      BY_ID: (id: string) => `/exams/${id}`,
    },
    
    // Fees
    FEES: {
      BASE: '/fees',
      BY_ID: (id: string) => `/fees/${id}`,
    },
  },
  
  // HTTP status codes
  STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },
} as const;

export default API_CONFIG;