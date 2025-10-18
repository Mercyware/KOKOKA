// Common types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
  data: T[];
}

// File Management System
export interface FileManager {
  id: string;
  fileName: string;
  fileKey: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  category: 'PROFILE_PICTURE' | 'DOCUMENT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'REPORT' | 'ASSIGNMENT' | 'OTHER';
  originalName?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  compressed: boolean;
  entityType?: string;
  entityId?: string;
  uploadedById?: string;
  schoolId: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED' | 'QUARANTINED' | 'PROCESSING';
  isPublic: boolean;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school?: School; // School object from auth response
  schoolId?: string; // School ID field
  schoolStatus?: SchoolStatus;
  profileImage?: string;
  lastLogin?: Date;
  isActive: boolean;
  // Additional fields from auth response
  emailVerified?: boolean;
  student?: any;
  teacher?: any;
  guardian?: any;
}

export type UserRole = 'student' | 'teacher' | 'admin' | 'superadmin' | 'cashier' | 'librarian' | 'counselor' | 'nurse' | 'security' | 'maintenance' | 'other';

export interface School {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  logo: string;
  address?: Address;
  contactInfo?: ContactInfo;
  description?: string;
  established?: Date;
  type: SchoolType;
  status: SchoolStatus;
  settings: SchoolSettings;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export type SchoolType = 'PRIMARY' | 'SECONDARY' | 'COLLEGE' | 'UNIVERSITY' | 'VOCATIONAL' | 'OTHER';
export type SchoolStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

export interface SchoolSettings {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logo?: string;
  };
  grading: {
    system: 'percentage' | 'letter' | 'gpa' | 'custom';
    passMark: number;
    scale: GradeScale[];
  };
  academicYear: {
    startMonth: number;
    endMonth: number;
    terms: number;
  };
  features: {
    sms: boolean;
    email: boolean;
    library: boolean;
    transport: boolean;
    hostel: boolean;
    ai: boolean;
  };
}

export interface GradeScale {
  grade: string;
  minScore: number;
  maxScore: number;
  gpa?: number;
  description?: string;
}

export interface Subscription {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  paymentMethod?: string;
  paymentId?: string;
}

export interface House {
  id: string;
  name: string;
  code: string;
  color?: string;
  description?: string;
  schoolId: string;
  createdAt: Date;
  updatedAt: Date;
  students?: Student[];
  studentCount?: number;
}

/**
 * @deprecated Use ClassArm instead. This interface is kept for backward compatibility.
 */
export interface Section {
  id?: string;
  school?: string;
  schoolId?: string;
  name: string;
  code?: string;
  capacity?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  students?: string[];
  studentCount?: number;
}

export interface Student {
  _id: string;
  id: string; // Deprecated, use _id instead
  school: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  user?: string;
  email?: string;
  admissionNumber: string;
  admissionDate: Date;
  academicYear?: string;
  class: string;
  rollNumber?: string;
  house?: string | House;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  photo?: string;  // Legacy field - kept for backward compatibility
  profilePictureId?: string;  // FileManager ID for profile picture
  profilePictureUrl?: string; // Direct URL from FileManager system
  bloodGroup?: string;
  height?: {
    value: number;
    unit: 'cm' | 'in';
    lastMeasured?: Date;
  };
  weight?: {
    value: number;
    unit: 'kg' | 'lb';
    lastMeasured?: Date;
  };
  address?: Address;
  contactInfo?: {
    phone?: string;
    alternativePhone?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  guardians?: string[];
  guardianStudents?: any[]; // Guardian relationships with additional details
  primaryGuardian?: string;
  attendance?: Attendance[];
  grades?: Grade[];
  healthInfo?: HealthInfo;
  extracurricular?: Extracurricular[];
  behavior?: Behavior[];
  academicHistory?: AcademicHistory[];
  documents?: string[];
  enrollmentDate: Date;
  previousSchool?: {
    name?: string;
    address?: string;
    contactInfo?: string;
    attendedFrom?: Date;
    attendedTo?: Date;
    reasonForLeaving?: string;
  };
  graduationDate?: Date;
  status: 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled';
  nationality?: string;
  religion?: string;
  caste?: string;
  motherTongue?: string;
  languages?: string[];
  transportRoute?: string;
  hostelRoom?: string;
  scholarshipInfo?: ScholarshipInfo[];
  achievements?: Achievement[];
  notes?: string;
  tags?: string[];
  fullName?: string;
  age?: number;
  attendancePercentage?: number;
  averageGrade?: number;
}

export interface Attendance {
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  remark?: string;
}

export interface Grade {
  exam: string;
  score: number;
  grade: string;
  answers?: {
    question: string;
    answer: string;
    score: number;
  }[];
  date: Date;
  remarks?: string;
}

export interface HealthInfo {
  bloodGroup?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  vaccinationStatus?: {
    name: string;
    date: Date;
    dueDate: Date;
    status: 'completed' | 'pending' | 'exempted';
  }[];
  disabilities?: string[];
  dietaryRestrictions?: string[];
  visionStatus?: string;
  hearingStatus?: string;
  lastCheckup?: Date;
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
  };
}

export interface Extracurricular {
  activity: string;
  role?: string;
  achievements?: string[];
}

export interface Behavior {
  date: Date;
  incident: string;
  action: string;
  reportedBy: string;
}

export interface AcademicHistory {
  year: string;
  class: string;
  school: string;
  performance: string;
}

export interface StudentClassHistory {
  id: string;
  student: string;
  class: {
    id: string;
    name: string;
    level: number;
  };
  academicYear: {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
  };
  school: string;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'transferred' | 'withdrawn';
  remarks?: string;
  photo?: string;
}

export interface ScholarshipInfo {
  name: string;
  amount: number;
  startDate: Date;
  endDate: Date;
  provider: string;
  status: 'active' | 'expired' | 'pending' | 'rejected';
}

export interface Achievement {
  title: string;
  description?: string;
  date: Date;
  category?: string;
  awardedBy?: string;
}

export interface Staff {
  id: string;
  school: string;
  firstName: string;
  lastName: string;
  email?: string;
  employeeId: string;
  position: string;
  department?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: Address;
  contactInfo?: {
    phone?: string;
    alternatePhone?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  qualifications?: {
    degree: string;
    institution: string;
    year: number;
    specialization?: string;
  }[];
  joinDate: Date;
  endDate?: Date;
  status: 'active' | 'on leave' | 'terminated' | 'retired';
  salary?: {
    amount: number;
    currency: string;
    paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  };
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    branchCode?: string;
    ifscCode?: string;
  };
  documents?: {
    resume?: string;
    idProof?: string;
    addressProof?: string;
    offerLetter?: string;
    contract?: string;
  };
  createdBy?: string;
  remarks?: string;
}

export interface Teacher {
  id: string;
  school: string;
  user: string;
  employeeId: string;
  dateOfBirth: Date;
  gender: 'male' | 'female' | 'other';
  address?: Address;
  contactInfo: {
    phone: string;
    alternatePhone?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  qualifications?: {
    degree: string;
    institution: string;
    year: number;
    specialization?: string;
    documents?: string[];
  }[];
  subjects: string[];
  classes?: string[];
  schedule?: {
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string;
    endTime: string;
    subject: string;
    class: string;
  }[];
  experience?: {
    institution: string;
    position: string;
    startDate: Date;
    endDate?: Date;
    responsibilities?: string[];
  }[];
  specializations?: string[];
  certifications?: {
    name: string;
    issuingOrganization: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialID?: string;
    documentUrl?: string;
  }[];
  achievements?: {
    title: string;
    description?: string;
    date: Date;
  }[];
  attendance?: Attendance[];
  salary?: {
    amount: number;
    currency: string;
    paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  };
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    branchCode?: string;
    ifscCode?: string;
  };
  documents?: {
    resume?: string;
    idProof?: string;
    addressProof?: string;
    offerLetter?: string;
    contract?: string;
  };
  joinDate: Date;
  endDate?: Date;
  status: 'active' | 'on leave' | 'terminated' | 'retired';
  remarks?: string;
  age?: number;
  attendancePercentage?: number;
  yearsOfService?: number;
}

export interface Class {
  id: string;
  school: string;
  name: string;
  level: number;
  grade?: string | number;
  capacity?: number;
  description?: string;
  subjects?: string[];
  createdBy?: string;
  students?: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits?: number;
  schoolId: string;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
    code: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  isCurrent: boolean;
  description?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  school?: {
    id: string;
    name: string;
    slug: string;
    subdomain: string;
  };
  terms?: any[];
}

export interface Term {
  id: string;
  school: string;
  name: string;
  academicYear: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  description?: string;
  createdBy?: string;
  isCurrent?: boolean;
}

export interface Guardian {
  id: string;
  firstName: string;
  lastName: string;
  relationship: 'father' | 'mother' | 'grandfather' | 'grandmother' | 'uncle' | 'aunt' | 'sibling' | 'legal guardian' | 'other';
  email?: string;
  phone: string;
  alternativePhone?: string;
  occupation?: string;
  employer?: string;
  address?: Address;
  isEmergencyContact?: boolean;
  isAuthorizedPickup?: boolean;
  isPrimary?: boolean;
  notes?: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'birth_certificate' | 'medical_record' | 'immunization_record' | 'previous_school_record' | 'transfer_certificate' | 'report_card' | 'id_card' | 'passport' | 'visa' | 'residence_permit' | 'guardian_id' | 'fee_receipt' | 'scholarship_document' | 'special_needs_assessment' | 'photo' | 'other';
  description?: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy?: string;
  uploadedAt: Date;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface Exam {
  id: string;
  school: string;
  name: string;
  description?: string;
  academicYear: string;
  term: string;
  examType: 'midterm' | 'final' | 'quiz' | 'assignment' | 'project' | 'other';
  startDate: Date;
  endDate: Date;
  classes: string[];
  subjects: string[];
  totalMarks: number;
  passingMarks: number;
  weightage?: number;
  instructions?: string;
  createdBy: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

export interface Fee {
  id: string;
  school: string;
  name: string;
  description?: string;
  academicYear: string;
  term?: string;
  amount: number;
  currency: string;
  dueDate: Date;
  applicableTo: {
    classes?: string[];
    students?: string[];
  };
  isRecurring: boolean;
  recurringPeriod?: 'monthly' | 'quarterly' | 'yearly';
  isCompulsory: boolean;
  discounts?: {
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    applicableTo?: string[];
  }[];
  createdBy: string;
  status: 'active' | 'inactive';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  school?: string;
}
