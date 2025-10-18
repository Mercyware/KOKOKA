import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  Users,
  Loader2
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getStudentById, updateStudent } from '@/services/studentService';
import { getAllClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { fetchHouses, fetchSections } from '@/services/api';
import StudentForm from '@/components/students/StudentForm';
import { convertToFormData, convertToBackendData, type FrontendFormData } from '@/utils/studentFormUtils';

interface EditStudentFormProps {
  studentId: string;
  onBack: () => void;
  onSave?: (student: any) => void;
}

const EditStudentForm = ({ studentId, onBack, onSave }: EditStudentFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [student, setStudent] = useState<any>(null);
  const [formData, setFormData] = useState<FrontendFormData | null>(null);
  
  // Options state
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [houses, setHouses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [studentId]);

  const fetchData = async () => {
    setInitialLoading(true);
    setError(null);
    try {
      // Fetch student data and form options in parallel
      const [studentResponse, classesResponse, academicYearsResponse, housesResponse, sectionsResponse] = await Promise.all([
        getStudentById(studentId),
        getAllClasses(),
        getAllAcademicYears(),
        fetchHouses(),
        fetchSections()
      ]);

      // Set form options
      if (classesResponse.data) {
        setClasses(classesResponse.data);
      }

      if (academicYearsResponse.data) {
        setAcademicYears(academicYearsResponse.data);
      }

      if (housesResponse.success && housesResponse.data) {
        setHouses(housesResponse.data);
      }

      if (sectionsResponse.success && sectionsResponse.data) {
        setSections(sectionsResponse.data);
      }
      
      if (studentResponse.success && studentResponse.student) {
        setStudent(studentResponse.student);
        
        // Convert backend data to frontend form format
        const convertedFormData = convertToFormData(studentResponse.student as any);
        setFormData(convertedFormData);
      } else {
        throw new Error('Failed to load student data');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      setError('Failed to load student data. Please try again.');
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (data: FrontendFormData) => {
    setLoading(true);
    try {
      // Convert frontend form data to backend format
      const backendData = convertToBackendData(data);
      
      const response = await updateStudent(studentId, backendData);

      if (response.success && response.student) {
        toast({
          title: "Success",
          description: "Student updated successfully",
        });
        setTimeout(() => {
          if (onSave) {
            onSave(response.student);
          } else {
            navigate(`/students/${studentId}`);
          }
        }, 500);
      } else {
        console.error('Update failed:', response);
        toast({
          title: response.error || "Update Failed",
          description: response.message || "Failed to update student",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error updating student:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'An unexpected error occurred while updating the student.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-siohioma-primary" />
          <span className="ml-2 text-lg">Loading student data...</span>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Student</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <div className="space-x-4">
              <Button onClick={() => fetchData()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/students')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Students
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!student || !formData) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Student Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The student you're trying to edit could not be found.</p>
            <Button onClick={() => navigate('/students')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-8 w-8 text-siohioma-primary" />
              Edit Student
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update comprehensive student profile information
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate(`/students/${studentId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Student
          </Button>
        </div>

        <StudentForm
          initialValues={formData}
          onSubmit={handleSubmit}
          onBack={() => navigate(`/students/${studentId}`)}
          loading={loading}
          submitLabel={loading ? "Updating Student..." : "Update Student"}
          sections={sections}
          classes={classes}
          academicYears={academicYears}
          houses={houses}
        />
      </div>
    </Layout>
  );
};

export default EditStudentForm;