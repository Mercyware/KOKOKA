import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { fetchSections, fetchHouses } from '@/services/api';
import { House } from '@/types';
import { Section } from '@/types/Section';
import { createStudent } from '@/services/studentService';
import Layout from '../../components/layout/Layout';
import { getAllClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';
import StudentForm from '@/components/students/StudentForm';
import QuickEnrollmentWizard from '@/components/students/QuickEnrollmentWizard';
import { convertToBackendData, type FrontendFormData } from '@/utils/studentFormUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Users, Zap, FileText, CheckCircle2, Clock } from 'lucide-react';

const emptyFormData: FrontendFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  gender: '',
  admissionNumber: '',
  admissionDate: new Date().toISOString().split('T')[0],
  class: '',
  section: '',
  academicYear: '',
  house: '',
  rollNumber: '',
  status: 'active',
  
  // Additional Personal Information
  placeOfBirth: '',
  nationality: '',
  religion: '',
  motherTongue: '',
  previousSchool: '',
  previousClass: '',
  tcNumber: '',
  tcDate: '',
  
  // Blood group and physical info
  bloodGroup: '',
  height: { value: '', unit: 'cm' },
  weight: { value: '', unit: 'kg' },
  
  // Comprehensive Medical Information
  medicalInfo: {
    height: '',
    weight: '',
    lastCheckup: '',
    generalHealth: '',
    bloodType: '',
    physicianName: '',
    physicianPhone: ''
  },
  allergies: [],
  medications: {
    current: []
  },
  medicalConditions: [],
  immunizations: {
    completed: [],
    pending: [],
    lastUpdated: ''
  },
  emergencyMedicalInfo: '',
  doctorName: '',
  doctorPhone: '',
  hospitalPreference: '',
  
  // Health info (legacy compatibility)
  healthInfo: {
    allergies: [],
    medicalConditions: [],
    medications: [],
    dietaryRestrictions: [],
    disabilities: []
  },
  
  // Emergency Contacts (separate from guardians)
  emergencyContacts: [{
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    isPrimary: true
  }],
  
  // Contact info
  contactInfo: {
    phone: '',
    alternativePhone: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  },
  
  // Current Address
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  
  // Permanent Address
  permanentAddress: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  
  // Academic Background
  previousAcademicRecord: {
    previousSchool: '',
    previousGrade: '',
    subjects: [],
    performance: '',
    teacherRecommendations: ''
  },
  specialNeeds: '',
  talents: [],
  extracurriculars: [],
  
  // Administrative Information
  applicationDate: '',
  interviewDate: '',
  admissionTestScore: 0,
  feesPaid: 0,
  scholarshipInfo: null,
  transportInfo: {
    mode: '',
    busRoute: '',
    pickupPoint: '',
    dropoffPoint: ''
  },
  
  // Behavioral and Social Information
  behavioralNotes: '',
  socialBackground: '',
  languagesSpoken: [],
  
  // Documents and Identification
  identificationDocs: {
    birthCertificate: false,
    passport: false,
    socialSecurityCard: false
  },
  photographs: {
    passport: 0,
    school: 0
  },
  documentsSubmitted: [],
  
  guardians: [{
    firstName: '',
    lastName: '',
    relationship: '',
    phone: '',
    email: '',
    occupation: '',
    isPrimary: true
  }]
};

const AddStudentForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [formMode, setFormMode] = useState<'selection' | 'quick' | 'full'>('selection');

  const handleBack = () => {
    navigate('/students');
  };

  const handleSave = (student: any) => {
    // Navigate to students page after successful creation
    navigate('/students');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionsResponse = await fetchSections();
        if (sectionsResponse.success && sectionsResponse.data) {
          setSections(sectionsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
        setSections([]); // Ensure it's always an array
      }
      try {
        const classesResponse = await getAllClasses();
        if (classesResponse.data) {
          setClasses(classesResponse.data);
        }
        const academicYearsResponse = await getAllAcademicYears();
        if (academicYearsResponse.success && academicYearsResponse.data?.academicYears) {
          setAcademicYears(academicYearsResponse.data.academicYears);
        } else {
          console.error('Failed to fetch academic years:', academicYearsResponse);
          setAcademicYears([]); // Ensure it's always an array
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
        setClasses([]); // Ensure it's always an array
        setAcademicYears([]); // Ensure it's always an array
      }
    };

    fetchData();

    const fetchHousesData = async () => {
      try {
        const housesResponse = await fetchHouses();
        if (housesResponse.success && housesResponse.data) {
          setHouses(housesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching houses:', error);
        setHouses([]); // Ensure it's always an array
      }
    };

    fetchHousesData();
  }, []);

  const handleQuickSubmit = (quickData: any) => {
    // Convert quick form data to full form data format
    const fullFormData: FrontendFormData = {
      ...emptyFormData,
      firstName: quickData.firstName,
      lastName: quickData.lastName,
      dateOfBirth: quickData.dateOfBirth,
      gender: quickData.gender,
      admissionNumber: quickData.admissionNumber,
      class: quickData.class,
      section: quickData.section,
      academicYear: quickData.academicYear,
      guardians: [{
        firstName: quickData.guardianFirstName,
        lastName: quickData.guardianLastName,
        relationship: quickData.guardianRelationship,
        phone: quickData.guardianPhone,
        email: quickData.guardianEmail,
        occupation: '',
        isPrimary: true
      }]
    };
    handleSubmit(fullFormData);
  };

  const handleSubmit = (formData: FrontendFormData) => {
    setLoading(true);
    setError(null); // Clear previous errors
    (async () => {
      try {
        // Convert frontend form data to backend format
        const studentData = convertToBackendData(formData);

        const response = await createStudent(studentData);

        if (response.success) {
          toast({
            title: 'Student added successfully!',
            description: 'The student profile has been created with comprehensive medical and admission information.',
            variant: 'default',
          });
          setTimeout(() => {
            navigate('/students');
          }, 500);
          if (response.data) {
            handleSave(response.data);
          }
        } else {
          // Handle error from API response
          const errorMsg = response.message || response.error || 'An error occurred while creating the student profile.';
          setError(errorMsg);
          toast({
            title: 'Failed to save student',
            description: errorMsg,
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        // Handle unexpected errors (this should not happen with the current setup)
        console.error('Unexpected error saving student:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred while saving the student.';
        setError(errorMessage);
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    })();
  };

  // Form Selection Component
  const FormSelectionScreen = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Enrollment Method</h2>
        <p className="text-lg text-gray-600">Select the enrollment process that works best for you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Enrollment Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
             onClick={() => setFormMode('quick')}>
          <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-4 group-hover:scale-110 transition-transform">
            <Zap className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Quick Enrollment</h3>
          <p className="text-gray-600 mb-4">Fast 3-step wizard with only essential information</p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Basic student information</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Academic assignment</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Primary guardian contact</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">~2 minutes</span>
            </div>
          </div>

          <Button intent="primary" className="w-full">
            Start Quick Enrollment
          </Button>
        </div>

        {/* Full Form Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
             onClick={() => setFormMode('full')}>
          <div className="flex items-center justify-center w-16 h-16 bg-green-600 text-white rounded-full mb-4 group-hover:scale-110 transition-transform">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Complete Enrollment</h3>
          <p className="text-gray-600 mb-4">Comprehensive form with all student information</p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Complete personal information</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Medical & health records</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Emergency contacts & documents</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Clock className="h-4 w-4" />
              <span className="font-medium">~8-10 minutes</span>
            </div>
          </div>

          <Button intent="secondary" className="w-full">
            Use Complete Form
          </Button>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500 mb-4">
          You can always add more details later by editing the student profile
        </p>
        <Button
          intent="cancel"
          onClick={handleBack}
          className="bg-white border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Students
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Add New Student</h1>
                <p className="text-gray-600 mt-1">
                  {formMode === 'selection' && 'Choose your preferred enrollment method'}
                  {formMode === 'quick' && 'Quick student enrollment wizard'}
                  {formMode === 'full' && 'Create a comprehensive student profile'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            {formMode === 'selection' && <FormSelectionScreen />}

            {formMode === 'quick' && (
              <>
                <div className="mb-6">
                  <Button
                    intent="secondary"
                    onClick={() => setFormMode('selection')}
                    className="flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Selection
                  </Button>
                </div>
                <QuickEnrollmentWizard
                  onSubmit={handleQuickSubmit}
                  onBack={() => {
                    setError(null);
                    setFormMode('selection');
                  }}
                  onSwitchToFull={() => {
                    setError(null);
                    setFormMode('full');
                  }}
                  loading={loading}
                  classes={classes}
                  sections={sections}
                  academicYears={academicYears}
                  error={error}
                />
              </>
            )}

            {formMode === 'full' && (
              <>
                <div className="mb-6 flex gap-3">
                  <Button
                    intent="secondary"
                    onClick={() => setFormMode('selection')}
                    className="flex items-center"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Selection
                  </Button>
                  <Button
                    intent="action"
                    onClick={() => setFormMode('quick')}
                    className="flex items-center"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Switch to Quick Enrollment
                  </Button>
                </div>
                <StudentForm
                  initialValues={emptyFormData}
                  onSubmit={handleSubmit}
                  onBack={() => setFormMode('selection')}
                  loading={loading}
                  submitLabel="Save Student"
                  sections={sections}
                  classes={classes}
                  academicYears={academicYears}
                  houses={houses}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddStudentForm;
