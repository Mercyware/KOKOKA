import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchSections, fetchHouses } from '@/services/api';
import { House } from '@/types';
import { Section } from '@/types/Section';
import { createStudent } from '@/services/studentService';
import Layout from '../../components/layout/Layout';
import { getAllClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { useNavigate } from 'react-router-dom';
import StudentForm from '@/components/students/StudentForm';
import { convertToBackendData, type FrontendFormData } from '@/utils/studentFormUtils';
import { ArrowLeft } from 'lucide-react';

interface AddStudentFormProps {
  onBack: () => void;
  onSave?: (student: any) => void;
}

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

const AddStudentForm = ({ onBack, onSave }: AddStudentFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectionsResponse = await fetchSections();
        if (sectionsResponse.success && sectionsResponse.data) {
          setSections(sectionsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching sections:', error);
      }
      try {
        const classesResponse = await getAllClasses();
        if (classesResponse.data) {
          setClasses(classesResponse.data);
        }
        const academicYearsResponse = await getAllAcademicYears();
        if (academicYearsResponse.data) {
          setAcademicYears(academicYearsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching form data:', error);
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
      }
    };

    fetchHousesData();
  }, []);

  const handleSubmit = (formData: FrontendFormData) => {
    setLoading(true);
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
          if (onSave && response.data) {
            onSave(response.data);
          }
        } else {
          console.error('Failed to save student:', response.error);
          toast({
            title: 'Failed to save student',
            description: response.message || response.error,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error saving student:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while saving the student. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <button type="button" className="btn btn-outline" onClick={onBack}>
              <span className="inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Student</h1>
              <p className="text-gray-600 dark:text-gray-400">Create a new student profile</p>
            </div>
          </div>
          <StudentForm
            initialValues={emptyFormData}
            onSubmit={handleSubmit}
            onBack={onBack}
            loading={loading}
            submitLabel="Save Student"
            sections={sections}
            classes={classes}
            academicYears={academicYears}
            houses={houses}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AddStudentForm;
