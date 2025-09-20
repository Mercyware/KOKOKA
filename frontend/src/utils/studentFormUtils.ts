// Utility functions for student form data conversion

export interface BackendStudentData {
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  admissionNumber: string;
  admissionDate?: string;
  status?: string;
  
  // Additional Personal Information
  placeOfBirth?: string;
  nationality?: string;
  religion?: string;
  motherTongue?: string;
  previousSchool?: string;
  previousClass?: string;
  tcNumber?: string;
  tcDate?: string;
  
  // Physical and medical info
  bloodGroup?: string;
  phone?: string;
  
  // Address
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  
  // Permanent Address
  permanentStreetAddress?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentZipCode?: string;
  permanentCountry?: string;
  
  // Medical Information
  medicalInfo?: any;
  allergies?: string[];
  medications?: any;
  medicalConditions?: string[];
  immunizations?: any;
  emergencyMedicalInfo?: string;
  doctorName?: string;
  doctorPhone?: string;
  hospitalPreference?: string;
  
  // Emergency Contacts
  emergencyContacts?: any[];
  
  // Academic Background
  previousAcademicRecord?: any;
  specialNeeds?: string;
  talents?: string[];
  extracurriculars?: string[];
  
  // Administrative Information
  applicationDate?: string;
  interviewDate?: string;
  admissionTestScore?: number;
  feesPaid?: number;
  scholarshipInfo?: any;
  transportInfo?: any;
  
  // Behavioral and Social Information
  behavioralNotes?: string;
  socialBackground?: string;
  languagesSpoken?: string[];
  
  // Documents and Identification
  identificationDocs?: any;
  photographs?: any;
  documentsSubmitted?: string[];
  
  // Academic assignments
  currentClassId?: string;
  currentSectionId?: string;
  academicYearId?: string;
  houseId?: string;
  
  // Relations (populated data)
  currentClass?: any;
  currentSection?: any;
  academicYear?: any;
  house?: any;
  guardianStudents?: any[];
}

export interface FrontendFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  admissionNumber: string;
  admissionDate: string;
  class: string;
  section: string;
  academicYear: string;
  house: string;
  rollNumber: string;
  status: 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled';
  
  // Additional Personal Information
  placeOfBirth: string;
  nationality: string;
  religion: string;
  motherTongue: string;
  previousSchool: string;
  previousClass: string;
  tcNumber: string;
  tcDate: string;
  
  // Blood group and physical info
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown' | '';
  height: { value: string; unit: 'cm' | 'in' };
  weight: { value: string; unit: 'kg' | 'lb' };
  
  // Comprehensive Medical Information
  medicalInfo: {
    height: string;
    weight: string;
    lastCheckup: string;
    generalHealth: string;
    bloodType: string;
    physicianName: string;
    physicianPhone: string;
  };
  allergies: string[];
  medications: {
    current: Array<{
      name: string;
      dosage: string;
      frequency: string;
    }>;
  };
  medicalConditions: string[];
  immunizations: {
    completed: string[];
    pending: string[];
    lastUpdated: string;
  };
  emergencyMedicalInfo: string;
  doctorName: string;
  doctorPhone: string;
  hospitalPreference: string;
  
  // Health info (legacy compatibility)
  healthInfo: {
    allergies: string[];
    medicalConditions: string[];
    medications: string[];
    dietaryRestrictions: string[];
    disabilities: string[];
  };
  
  // Emergency Contacts (separate from guardians)
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
    isPrimary: boolean;
  }>;
  
  // Contact info
  contactInfo: {
    phone: string;
    alternativePhone: string;
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
  
  // Current Address
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Permanent Address
  permanentAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  
  // Academic Background
  previousAcademicRecord: {
    previousSchool: string;
    previousGrade: string;
    subjects: string[];
    performance: string;
    teacherRecommendations: string;
  };
  specialNeeds: string;
  talents: string[];
  extracurriculars: string[];
  
  // Administrative Information
  applicationDate: string;
  interviewDate: string;
  admissionTestScore: number;
  feesPaid: number;
  scholarshipInfo: {
    type: string;
    amount: number;
    percentage: number;
  } | null;
  transportInfo: {
    mode: string;
    busRoute: string;
    pickupPoint: string;
    dropoffPoint: string;
  };
  
  // Behavioral and Social Information
  behavioralNotes: string;
  socialBackground: string;
  languagesSpoken: string[];
  
  // Documents and Identification
  identificationDocs: {
    birthCertificate: boolean;
    passport: boolean;
    socialSecurityCard: boolean;
  };
  photographs: {
    passport: number;
    school: number;
  };
  documentsSubmitted: string[];
  
  guardians: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
    email: string;
    occupation: string;
    isPrimary: boolean;
  }>;
}

// Convert backend student data to frontend form format
export function convertToFormData(backendData: any): FrontendFormData {
  // Helper function to convert dates
  const convertDate = (dateValue: any): string => {
    if (!dateValue) return '';
    if (dateValue instanceof Date) return dateValue.toISOString().split('T')[0];
    if (typeof dateValue === 'string') return new Date(dateValue).toISOString().split('T')[0];
    return '';
  };

  // Helper function to extract string from objects (like previousSchool)
  const extractString = (value: any, fallback = ''): string => {
    if (!value) return fallback;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.name) return value.name;
    return fallback;
  };

  return {
    // Basic Information
    firstName: backendData.firstName || '',
    middleName: backendData.middleName || '',
    lastName: backendData.lastName || '',
    email: backendData.email || '',
    dateOfBirth: convertDate(backendData.dateOfBirth),
    gender: (backendData.gender?.toLowerCase() as 'male' | 'female' | 'other') || '',
    admissionNumber: backendData.admissionNumber || '',
    admissionDate: convertDate(backendData.admissionDate),
    status: (backendData.status?.toLowerCase() as 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled') || 'active',
    rollNumber: backendData.rollNumber || '',

    // Additional Personal Information
    placeOfBirth: backendData.placeOfBirth || '',
    nationality: backendData.nationality || '',
    religion: backendData.religion || '',
    motherTongue: backendData.motherTongue || '',
    previousSchool: extractString(backendData.previousSchool),
    previousClass: backendData.previousClass || '',
    tcNumber: backendData.tcNumber || '',
    tcDate: convertDate(backendData.tcDate),

    // Academic assignments
    class: backendData.currentClassId || backendData.currentClass?.id || backendData.currentClass?._id || '',
    section: backendData.currentSectionId || backendData.currentSection?.id || backendData.currentSection?._id || '',
    academicYear: backendData.academicYearId || backendData.academicYear?.id || backendData.academicYear?._id || '',
    house: backendData.houseId || backendData.house?.id || backendData.house?._id || '',

    // Physical info
    bloodGroup: (backendData.bloodGroup as any) || '',
    height: { 
      value: backendData.medicalInfo?.height?.replace(/[^\d.]/g, '') || backendData.height?.value || '', 
      unit: 'cm' as 'cm' | 'in' 
    },
    weight: { 
      value: backendData.medicalInfo?.weight?.replace(/[^\d.]/g, '') || backendData.weight?.value || '', 
      unit: 'kg' as 'kg' | 'lb' 
    },

    // Comprehensive Medical Information
    medicalInfo: {
      height: backendData.medicalInfo?.height || '',
      weight: backendData.medicalInfo?.weight || '',
      lastCheckup: backendData.medicalInfo?.lastCheckup || '',
      generalHealth: backendData.medicalInfo?.generalHealth || '',
      bloodType: backendData.medicalInfo?.bloodType || '',
      physicianName: backendData.medicalInfo?.physicianName || '',
      physicianPhone: backendData.medicalInfo?.physicianPhone || ''
    },
    allergies: backendData.allergies || [],
    medications: backendData.medications || { current: [] },
    medicalConditions: backendData.medicalConditions || [],
    immunizations: backendData.immunizations || { completed: [], pending: [], lastUpdated: '' },
    emergencyMedicalInfo: backendData.emergencyMedicalInfo || '',
    doctorName: backendData.doctorName || '',
    doctorPhone: backendData.doctorPhone || '',
    hospitalPreference: backendData.hospitalPreference || '',

    // Health info (legacy compatibility)
    healthInfo: {
      allergies: backendData.allergies || backendData.healthInfo?.allergies || [],
      medicalConditions: backendData.medicalConditions || backendData.healthInfo?.medicalConditions || [],
      medications: backendData.healthInfo?.medications || [],
      dietaryRestrictions: backendData.healthInfo?.dietaryRestrictions || [],
      disabilities: backendData.healthInfo?.disabilities || []
    },

    // Emergency Contacts
    emergencyContacts: backendData.emergencyContacts || [{
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      isPrimary: true
    }],

    // Contact info
    contactInfo: {
      phone: backendData.phone || '',
      alternativePhone: backendData.alternativePhone || '',
      emergencyContact: {
        name: backendData.emergencyContact?.name || '',
        relationship: backendData.emergencyContact?.relationship || '',
        phone: backendData.emergencyContact?.phone || ''
      }
    },

    // Current Address
    address: {
      street: backendData.streetAddress || backendData.address?.street || '',
      city: backendData.city || backendData.address?.city || '',
      state: backendData.state || backendData.address?.state || '',
      zipCode: backendData.zipCode || backendData.address?.zipCode || '',
      country: backendData.country || backendData.address?.country || ''
    },

    // Permanent Address
    permanentAddress: {
      street: backendData.permanentStreetAddress || backendData.permanentAddress?.street || '',
      city: backendData.permanentCity || backendData.permanentAddress?.city || '',
      state: backendData.permanentState || backendData.permanentAddress?.state || '',
      zipCode: backendData.permanentZipCode || backendData.permanentAddress?.zipCode || '',
      country: backendData.permanentCountry || backendData.permanentAddress?.country || ''
    },

    // Academic Background
    previousAcademicRecord: backendData.previousAcademicRecord || {
      previousSchool: '',
      previousGrade: '',
      subjects: [],
      performance: '',
      teacherRecommendations: ''
    },
    specialNeeds: backendData.specialNeeds || '',
    talents: backendData.talents || [],
    extracurriculars: backendData.extracurriculars || [],

    // Administrative Information
    applicationDate: convertDate(backendData.applicationDate),
    interviewDate: convertDate(backendData.interviewDate),
    admissionTestScore: backendData.admissionTestScore || 0,
    feesPaid: backendData.feesPaid || 0,
    scholarshipInfo: backendData.scholarshipInfo || null,
    transportInfo: backendData.transportInfo || {
      mode: '',
      busRoute: '',
      pickupPoint: '',
      dropoffPoint: ''
    },

    // Behavioral and Social Information
    behavioralNotes: backendData.behavioralNotes || '',
    socialBackground: backendData.socialBackground || '',
    languagesSpoken: backendData.languagesSpoken || [],

    // Documents and Identification
    identificationDocs: backendData.identificationDocs || {
      birthCertificate: false,
      passport: false,
      socialSecurityCard: false
    },
    photographs: backendData.photographs || {
      passport: 0,
      school: 0
    },
    documentsSubmitted: backendData.documentsSubmitted || [],

    // Guardians
    guardians: (backendData.guardianStudents || backendData.guardians)?.map((gs: any) => {
      const guardian = gs.guardian || gs;
      return {
        firstName: guardian.firstName || '',
        lastName: guardian.lastName || '',
        relationship: gs.relationship || guardian.relationship || '',
        phone: guardian.phone || '',
        email: guardian.email || '',
        occupation: guardian.occupation || '',
        isPrimary: gs.isPrimary || guardian.isPrimary || false
      };
    }) || [{
      firstName: '',
      lastName: '',
      relationship: '',
      phone: '',
      email: '',
      occupation: '',
      isPrimary: true
    }]
  };
}

// Convert frontend form data to backend format
export function convertToBackendData(formData: FrontendFormData): any {
  return {
    // Basic Information
    firstName: formData.firstName,
    lastName: formData.lastName,
    middleName: formData.middleName || undefined,
    email: formData.email || undefined,
    dateOfBirth: formData.dateOfBirth || undefined,
    gender: formData.gender || undefined,
    admissionNumber: formData.admissionNumber,
    admissionDate: formData.admissionDate || undefined,
    status: formData.status,

    // Additional Personal Information
    placeOfBirth: formData.placeOfBirth || undefined,
    nationality: formData.nationality || undefined,
    religion: formData.religion || undefined,
    motherTongue: formData.motherTongue || undefined,
    previousSchool: formData.previousSchool || undefined,
    previousClass: formData.previousClass || undefined,
    tcNumber: formData.tcNumber || undefined,
    tcDate: formData.tcDate || undefined,

    // Academic Assignment
    class: formData.class,
    section: formData.section || undefined,
    academicYear: formData.academicYear || undefined,
    house: formData.house || undefined,

    // Contact Information
    phone: formData.contactInfo.phone || undefined,

    // Current Address
    streetAddress: formData.address.street || undefined,
    city: formData.address.city || undefined,
    state: formData.address.state || undefined,
    zipCode: formData.address.zipCode || undefined,
    country: formData.address.country || undefined,

    // Permanent Address
    permanentStreetAddress: formData.permanentAddress.street || undefined,
    permanentCity: formData.permanentAddress.city || undefined,
    permanentState: formData.permanentAddress.state || undefined,
    permanentZipCode: formData.permanentAddress.zipCode || undefined,
    permanentCountry: formData.permanentAddress.country || undefined,

    // Medical Information
    bloodGroup: formData.bloodGroup || undefined,
    medicalInfo: formData.medicalInfo,
    allergies: formData.allergies || [],
    medications: formData.medications,
    medicalConditions: formData.medicalConditions || [],
    immunizations: formData.immunizations,
    emergencyMedicalInfo: formData.emergencyMedicalInfo || undefined,
    doctorName: formData.doctorName || undefined,
    doctorPhone: formData.doctorPhone || undefined,
    hospitalPreference: formData.hospitalPreference || undefined,

    // Emergency Contacts
    emergencyContacts: formData.emergencyContacts || [],

    // Academic Background
    previousAcademicRecord: formData.previousAcademicRecord,
    specialNeeds: formData.specialNeeds || undefined,
    talents: formData.talents || [],
    extracurriculars: formData.extracurriculars || [],

    // Administrative Information
    applicationDate: formData.applicationDate || undefined,
    interviewDate: formData.interviewDate || undefined,
    admissionTestScore: formData.admissionTestScore || undefined,
    feesPaid: formData.feesPaid || undefined,
    scholarshipInfo: formData.scholarshipInfo,
    transportInfo: formData.transportInfo,

    // Behavioral and Social Information
    behavioralNotes: formData.behavioralNotes || undefined,
    socialBackground: formData.socialBackground || undefined,
    languagesSpoken: formData.languagesSpoken || [],

    // Documents and Identification
    identificationDocs: formData.identificationDocs,
    photographs: formData.photographs,
    documentsSubmitted: formData.documentsSubmitted || [],

    // Guardian Information
    guardians: formData.guardians.filter(guardian =>
      guardian.firstName &&
      guardian.lastName &&
      guardian.relationship &&
      guardian.phone
    )
  };
}