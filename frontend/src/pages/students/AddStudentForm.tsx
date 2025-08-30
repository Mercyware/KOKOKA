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
import { ArrowLeft } from 'lucide-react';

interface AddStudentFormProps {
  onBack: () => void;
  onSave?: (student: any) => void;
}

const emptyFormData = {
  firstName: '',
  middleName: '',
  lastName: '',
  email: '',
  dateOfBirth: '',
  gender: '' as 'male' | 'female' | 'other' | '',
  admissionNumber: '',
  admissionDate: new Date().toISOString().split('T')[0],
  class: '',
  section: '',
  academicYear: '',
  house: '',
  rollNumber: '',
  status: 'active' as 'active' | 'graduated' | 'transferred' | 'suspended' | 'expelled',
  bloodGroup: '' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown' | '',
  height: { value: '', unit: 'cm' as 'cm' | 'in' },
  weight: { value: '', unit: 'kg' as 'kg' | 'lb' },
  healthInfo: {
    allergies: [] as string[],
    medicalConditions: [] as string[],
    medications: [] as string[],
    dietaryRestrictions: [] as string[],
    disabilities: [] as string[]
  },
  contactInfo: {
    phone: '',
    alternativePhone: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  },
  address: {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  },
  guardians: [{
    firstName: '',
    lastName: '',
    relationship: '' as 'father' | 'mother' | 'grandfather' | 'grandmother' | 'uncle' | 'aunt' | 'sibling' | 'legal guardian' | 'other' | '',
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

  const handleSubmit = (formData: any) => {
    setLoading(true);
    (async () => {
      try {
        const validGuardians = formData.guardians.filter((guardian: any) =>
          guardian.firstName &&
          guardian.lastName &&
          guardian.relationship &&
          guardian.phone
        );

        const studentData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName || undefined,
          email: formData.email || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          gender: formData.gender || undefined,
          admissionNumber: formData.admissionNumber,
          admissionDate: formData.admissionDate || undefined,
          class: formData.class,
          academicYear: formData.academicYear || undefined,
          house: formData.house || undefined,
          status: formData.status,
          phone: formData.contactInfo.phone || undefined,
          streetAddress: formData.address.street || undefined,
          city: formData.address.city || undefined,
          state: formData.address.state || undefined,
          zipCode: formData.address.zipCode || undefined,
          country: formData.address.country || undefined,
          guardians: validGuardians.length > 0 ? validGuardians : undefined
        };

        const response = await createStudent(studentData);

        if (response.success) {
          toast({
            title: 'Student added successfully!',
            description: 'The student profile has been created.',
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
