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
  // Basic Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | '';
  phone: string;
  alternativePhone: string;

  // Additional Personal Information
  placeOfBirth: string;
  nationality: string;
  religion: string;
  motherTongue: string;
  languagesSpoken: string[];

  // Academic Information
  admissionNumber: string;
  admissionDate: string;
  class: string;
  section: string;
  academicYear: string;
  house: string;
  rollNumber: string;
  status: 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled';
  previousSchool: string;
  previousClass: string;
  tcNumber: string;
  tcDate: string;
  talents: string;
  extracurriculars: string;

  // Medical Information
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown' | '';
  healthInfo: {
    allergies: string[];
    medicalConditions: string[];
    medications: string[];
  };
  specialNeeds: string;
  emergencyMedicalInfo: string;
  doctorName: string;
  doctorPhone: string;
  hospitalPreference: string;

  // Emergency Contacts
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
    isPrimary: boolean;
  }>;

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

  // Guardians
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
    // Basic Personal Information
    firstName: backendData.firstName || '',
    middleName: backendData.middleName || '',
    lastName: backendData.lastName || '',
    email: backendData.email || '',
    dateOfBirth: convertDate(backendData.dateOfBirth),
    gender: (backendData.gender?.toLowerCase() as 'male' | 'female' | 'other') || '',
    phone: backendData.phone || '',
    alternativePhone: backendData.alternativePhone || '',

    // Additional Personal Information
    placeOfBirth: backendData.placeOfBirth || '',
    nationality: backendData.nationality || '',
    religion: backendData.religion || '',
    motherTongue: backendData.motherTongue || '',
    languagesSpoken: backendData.languagesSpoken || [],

    // Academic Information
    admissionNumber: backendData.admissionNumber || '',
    admissionDate: convertDate(backendData.admissionDate),
    class: backendData.currentClassId || backendData.currentClass?.id || backendData.currentClass?._id || '',
    section: backendData.currentSectionId || backendData.currentSection?.id || backendData.currentSection?._id || '',
    academicYear: backendData.academicYearId || backendData.academicYear?.id || backendData.academicYear?._id || '',
    house: backendData.houseId || backendData.house?.id || backendData.house?._id || '',
    rollNumber: backendData.rollNumber || '',
    status: (backendData.status?.toLowerCase() as 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled') || 'active',
    previousSchool: extractString(backendData.previousSchool),
    previousClass: backendData.previousClass || '',
    tcNumber: backendData.tcNumber || '',
    tcDate: convertDate(backendData.tcDate),
    talents: (backendData.talents || []).join(', '),
    extracurriculars: (backendData.extracurriculars || []).join(', '),

    // Medical Information
    bloodGroup: (backendData.bloodGroup as any) || '',
    healthInfo: {
      allergies: backendData.allergies || [],
      medicalConditions: backendData.medicalConditions || [],
      medications: (backendData.medications?.current || backendData.medications || []).map((m: any) =>
        typeof m === 'string' ? m : m.name
      )
    },
    specialNeeds: backendData.specialNeeds || '',
    emergencyMedicalInfo: backendData.emergencyMedicalInfo || '',
    doctorName: backendData.doctorName || '',
    doctorPhone: backendData.doctorPhone || '',
    hospitalPreference: backendData.hospitalPreference || '',

    // Emergency Contacts
    emergencyContacts: backendData.emergencyContacts || [{
      name: '',
      relationship: '',
      phone: '',
      email: '',
      address: '',
      isPrimary: true
    }],

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
  // Convert comma-separated strings to arrays
  const talentsArray = formData.talents
    ? formData.talents.split(',').map(t => t.trim()).filter(Boolean)
    : [];
  const extracurricularsArray = formData.extracurriculars
    ? formData.extracurriculars.split(',').map(e => e.trim()).filter(Boolean)
    : [];

  return {
    // Basic Information
    firstName: formData.firstName,
    lastName: formData.lastName,
    middleName: formData.middleName || undefined,
    email: formData.email || undefined,
    dateOfBirth: formData.dateOfBirth || undefined,
    gender: formData.gender || undefined,
    phone: formData.phone || undefined,

    // Additional Personal Information
    placeOfBirth: formData.placeOfBirth || undefined,
    nationality: formData.nationality || undefined,
    religion: formData.religion || undefined,
    motherTongue: formData.motherTongue || undefined,
    languagesSpoken: formData.languagesSpoken || [],

    // Academic Information
    admissionNumber: formData.admissionNumber,
    admissionDate: formData.admissionDate || undefined,
    class: formData.class,
    section: formData.section || undefined,
    academicYear: formData.academicYear || undefined,
    house: formData.house || undefined,
    status: formData.status,
    previousSchool: formData.previousSchool || undefined,
    previousClass: formData.previousClass || undefined,
    tcNumber: formData.tcNumber || undefined,
    tcDate: formData.tcDate || undefined,
    talents: talentsArray,
    extracurriculars: extracurricularsArray,

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
    allergies: formData.healthInfo.allergies || [],
    medicalConditions: formData.healthInfo.medicalConditions || [],
    medications: formData.healthInfo.medications?.length
      ? { current: formData.healthInfo.medications.map(m => ({ name: m, dosage: '', frequency: '' })) }
      : undefined,
    specialNeeds: formData.specialNeeds || undefined,
    emergencyMedicalInfo: formData.emergencyMedicalInfo || undefined,
    doctorName: formData.doctorName || undefined,
    doctorPhone: formData.doctorPhone || undefined,
    hospitalPreference: formData.hospitalPreference || undefined,

    // Emergency Contacts
    emergencyContacts: formData.emergencyContacts || [],

    // Guardian Information
    guardians: formData.guardians.filter(guardian =>
      guardian.firstName &&
      guardian.lastName &&
      guardian.relationship &&
      guardian.phone
    )
  };
}