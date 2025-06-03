import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { fetchSections, fetchHouses } from '@/services/api';
import { House } from '@/types';
import { Section } from '@/types/Section';
import { getStudentById, updateStudent } from '@/services/studentService';
import Layout from '../../components/layout/Layout';
import { getClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { useNavigate } from 'react-router-dom';
import StudentForm from '@/components/students/StudentForm';
import { ArrowLeft } from 'lucide-react';

interface EditStudentFormProps {
  studentId: string;
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

const EditStudentForm = ({ studentId, onBack, onSave }: EditStudentFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [houses, setHouses] = useState<House[]>([]);
  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true);
      try {
        const studentResponse = await getStudentById(studentId);
        if (studentResponse.success && studentResponse.data) {
          const student = studentResponse.data;
          setFormData({
            firstName: student.firstName || '',
            middleName: student.middleName || '',
            lastName: student.lastName || '',
            email: student.email || '',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
            gender: student.gender || '',
            admissionNumber: student.admissionNumber || '',
            admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            class: typeof student.class === 'object' && student.class !== null && typeof (student.class as any)._id === 'string'
              ? (student.class as any)._id
              : typeof student.class === 'string'
                ? student.class
                : '',
            section: typeof (student as any).section === 'object' && (student as any).section !== null && typeof ((student as any).section as any)._id === 'string'
              ? ((student as any).section as any)._id
              : typeof (student as any).section === 'string'
                ? (student as any).section
                : '',
            academicYear: typeof student.academicYear === 'object' && student.academicYear !== null && typeof (student.academicYear as any)._id === 'string'
              ? (student.academicYear as any)._id
              : typeof student.academicYear === 'string'
                ? student.academicYear
                : '',
            house: typeof student.house === 'object' && student.house !== null && typeof (student.house as any)._id === 'string'
              ? (student.house as any)._id
              : typeof student.house === 'string'
                ? student.house
                : '',
            rollNumber: student.rollNumber || '',
            status: student.status || 'active',
            bloodGroup: typeof student.bloodGroup === 'string' && (['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown', ''] as const).includes(student.bloodGroup as any)
              ? (student.bloodGroup as any)
              : '',
            height: {
              value: student.height?.value?.toString() || '',
              unit: student.height?.unit || 'cm'
            },
            weight: {
              value: student.weight?.value?.toString() || '',
              unit: student.weight?.unit || 'kg'
            },
            healthInfo: {
              allergies: student.healthInfo?.allergies || [],
              medicalConditions: student.healthInfo?.medicalConditions || [],
              medications: student.healthInfo?.medications || [],
              dietaryRestrictions: student.healthInfo?.dietaryRestrictions || [],
              disabilities: student.healthInfo?.disabilities || []
            },
            contactInfo: {
              phone: student.contactInfo?.phone || '',
              alternativePhone: student.contactInfo?.alternativePhone || '',
              emergencyContact: {
                name: student.contactInfo?.emergencyContact?.name || '',
                relationship: student.contactInfo?.emergencyContact?.relationship || '',
                phone: student.contactInfo?.emergencyContact?.phone || ''
              }
            },
            address: {
              street: typeof student.address === 'string' ? student.address : student.address?.street || '',
              city: student.address?.city || '',
              state: student.address?.state || '',
              zipCode: student.address?.zipCode || '',
              country: student.address?.country || ''
            },
            guardians: Array.isArray((student as any).guardians) && (student as any).guardians.length > 0
              ? (student as any).guardians.map((guardian: any) => ({
                  _id: typeof guardian._id === 'string' ? guardian._id : undefined,
                  firstName: guardian.firstName || '',
                  lastName: guardian.lastName || '',
                  relationship: guardian.relationship || '',
                  phone: guardian.phone || '',
                  email: guardian.email || '',
                  occupation: guardian.occupation || '',
                  isPrimary:
                    typeof guardian._id === 'string' &&
                    (((student as any).primaryGuardian && typeof (student as any).primaryGuardian === 'object' && typeof (student as any).primaryGuardian._id === 'string'
                      ? guardian._id === (student as any).primaryGuardian._id
                      : guardian._id === (student as any).primaryGuardian))
                }))
              : [{
                  firstName: '',
                  lastName: '',
                  relationship: '',
                  phone: '',
                  email: '',
                  occupation: '',
                  isPrimary: true
                }]
          });
        }

        const sectionsResponse = await fetchSections();
        if (sectionsResponse.success && sectionsResponse.data) {
          setSections(sectionsResponse.data);
        }
        const classesResponse = await getClasses();
        if (classesResponse.data) {
          setClasses(classesResponse.data);
        }
        const academicYearsResponse = await getAllAcademicYears();
        if (academicYearsResponse.data) {
          setAcademicYears(academicYearsResponse.data);
        }
        const housesResponse = await fetchHouses();
        if (housesResponse.success && housesResponse.data) {
          setHouses(housesResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load student data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchData();
  }, [studentId, toast]);

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
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
          gender: (formData.gender === 'male' || formData.gender === 'female' || formData.gender === 'other')
            ? formData.gender
            : undefined,
          admissionNumber: formData.admissionNumber,
          admissionDate: formData.admissionDate ? new Date(formData.admissionDate) : undefined,
          class: formData.class,
          section: formData.section || undefined,
          academicYear: formData.academicYear || undefined,
          house: formData.house || undefined,
          rollNumber: formData.rollNumber || undefined,
          status: formData.status,
          bloodGroup: formData.bloodGroup || undefined,
          height: formData.height.value ? {
            value: parseFloat(formData.height.value as string),
            unit: formData.height.unit
          } : undefined,
          weight: formData.weight.value ? {
            value: parseFloat(formData.weight.value as string),
            unit: formData.weight.unit
          } : undefined,
          healthInfo: (
            formData.healthInfo.allergies.length > 0 ||
            formData.healthInfo.medicalConditions.length > 0 ||
            formData.healthInfo.medications.length > 0 ||
            formData.healthInfo.dietaryRestrictions.length > 0 ||
            formData.healthInfo.disabilities.length > 0
          ) ? formData.healthInfo : undefined,
          contactInfo: {
            phone: formData.contactInfo.phone || undefined,
            alternativePhone: formData.contactInfo.alternativePhone || undefined,
            emergencyContact: (
              formData.contactInfo.emergencyContact.name ||
              formData.contactInfo.emergencyContact.relationship ||
              formData.contactInfo.emergencyContact.phone
            ) ? formData.contactInfo.emergencyContact : undefined
          },
          address: (
            formData.address.street ||
            formData.address.city ||
            formData.address.state ||
            formData.address.zipCode ||
            formData.address.country
          ) ? formData.address : undefined,
          guardians: validGuardians.length > 0 ? (validGuardians as any) : undefined
        };

        const response = await updateStudent(studentId, studentData);

        if (response.success) {
          toast({
            title: 'Student updated successfully!',
            description: 'The student profile has been updated.',
            variant: 'default',
          });
          setTimeout(() => {
            if (onSave) {
              onSave(response.data);
            } else {
              navigate(`/students/${studentId}`);
            }
          }, 500);
        } else {
          console.error('Failed to update student:', response.error);
          toast({
            title: 'Failed to update student',
            description: response.message || response.error,
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error updating student:', error);
        toast({
          title: 'Error',
          description: 'An error occurred while updating the student. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    })();
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <span className="text-lg">Loading student data...</span>
        </div>
      </Layout>
    );
  }

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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Student</h1>
              <p className="text-gray-600 dark:text-gray-400">Update student information</p>
            </div>
          </div>
          <StudentForm
            initialValues={formData}
            onSubmit={handleSubmit}
            onBack={onBack}
            loading={loading}
            submitLabel="Update Student"
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

export default EditStudentForm;
