import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
  Form,
  FormField,
  Input,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  Label,
  toast
} from '@/components/ui';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { getAllClasses } from '../../services/classService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllAcademicYears } from '../../services/academicYearService';
import { getAllTerms } from '../../services/termService';
import { createAssessment } from '../../services/assessmentService';
import { Class, Subject, AcademicYear } from '../../types';

interface Term {
  id?: string;
  _id?: string;
  name: string;
}

const CreateAssessment: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'EXAM',
    totalMarks: '',
    passingMarks: '',
    weight: '1.0',
    duration: '',
    scheduledDate: '',
    dueDate: '',
    instructions: '',
    subjectId: '',
    classId: '',
    academicYearId: '',
    termId: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      // Fetch all required data from APIs
      const [subjectsRes, classesRes, academicYearsRes, termsRes] = await Promise.all([
        getAllSubjects().catch(err => {
          console.error('Failed to fetch subjects:', err);
          return null;
        }),
        getAllClasses().catch(err => {
          console.error('Failed to fetch classes:', err);
          return null;
        }),
        getAllAcademicYears().catch(err => {
          console.error('Failed to fetch academic years:', err);
          return null;
        }),
        getAllTerms().catch(err => {
          console.error('Failed to fetch terms:', err);
          return null;
        })
      ]);

      console.log('API Responses:', { subjectsRes, classesRes, academicYearsRes, termsRes });

      // Handle subjects
      if (subjectsRes?.success && subjectsRes.data) {
        console.log('Setting subjects:', subjectsRes.data);
        setSubjects(subjectsRes.data);
      } else {
        console.log('Subjects response failed or no data, using fallback:', subjectsRes);
        // Fallback subjects for development/testing
        setSubjects([
          { id: '1', name: 'Mathematics', code: 'MATH', schoolId: '', description: 'Math subject' },
          { id: '2', name: 'English', code: 'ENG', schoolId: '', description: 'English subject' },
          { id: '3', name: 'Science', code: 'SCI', schoolId: '', description: 'Science subject' },
        ]);
      }

      // Handle classes
      if (classesRes?.success && classesRes.data) {
        console.log('Setting classes:', classesRes.data);
        setClasses(classesRes.data);
      } else {
        console.log('Classes response failed or no data, using fallback:', classesRes);
        // Fallback classes for development/testing
        setClasses([
          { id: '1', school: '', name: 'Class 10A', level: 10, grade: '10', capacity: 30 },
          { id: '2', school: '', name: 'Class 10B', level: 10, grade: '10', capacity: 30 },
          { id: '3', school: '', name: 'Class 9A', level: 9, grade: '9', capacity: 30 },
        ]);
      }

      // Handle academic years
      if (academicYearsRes?.success && academicYearsRes.data) {
        console.log('Setting academic years:', academicYearsRes.data);
        setAcademicYears(academicYearsRes.data);
      } else {
        console.log('Academic years response failed or no data, using fallback:', academicYearsRes);
        // Fallback academic years for development/testing
        setAcademicYears([
          { id: '1', schoolId: '', name: '2023-2024', startDate: '2023-09-01', endDate: '2024-08-31', isCurrent: false, createdAt: '', updatedAt: '' },
          { id: '2', schoolId: '', name: '2024-2025', startDate: '2024-09-01', endDate: '2025-08-31', isCurrent: true, createdAt: '', updatedAt: '' },
        ]);
      }

      // Handle terms
      if (termsRes) {
        const termsData = Array.isArray(termsRes) ? termsRes : termsRes.data;
        if (termsData) {
          const mappedTerms = termsData.map((term: any) => ({
            ...term,
            id: term.id || term._id
          }));
          console.log('Setting terms:', mappedTerms);
          setTerms(mappedTerms);
        } else {
          console.log('Terms data not found, using fallback:', termsRes);
          setTerms([
            { id: '1', name: 'Term 1' },
            { id: '2', name: 'Term 2' },
            { id: '3', name: 'Term 3' },
          ]);
        }
      } else {
        console.log('Terms response failed, using fallback:', termsRes);
        setTerms([
          { id: '1', name: 'Term 1' },
          { id: '2', name: 'Term 2' },
          { id: '3', name: 'Term 3' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set fallback data in case of any error
      setSubjects([
        { id: '1', name: 'Mathematics', code: 'MATH', schoolId: '', description: 'Math subject' },
        { id: '2', name: 'English', code: 'ENG', schoolId: '', description: 'English subject' },
        { id: '3', name: 'Science', code: 'SCI', schoolId: '', description: 'Science subject' },
      ]);
      setClasses([
        { id: '1', school: '', name: 'Class 10A', level: 10, grade: '10', capacity: 30 },
        { id: '2', school: '', name: 'Class 10B', level: 10, grade: '10', capacity: 30 },
        { id: '3', school: '', name: 'Class 9A', level: 9, grade: '9', capacity: 30 },
      ]);
      setAcademicYears([
        { id: '1', schoolId: '', name: '2023-2024', startDate: '2023-09-01', endDate: '2024-08-31', isCurrent: false, createdAt: '', updatedAt: '' },
        { id: '2', schoolId: '', name: '2024-2025', startDate: '2024-09-01', endDate: '2025-08-31', isCurrent: true, createdAt: '', updatedAt: '' },
      ]);
      setTerms([
        { id: '1', name: 'Term 1' },
        { id: '2', name: 'Term 2' },
        { id: '3', name: 'Term 3' },
      ]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subjectId || !formData.classId || !formData.totalMarks) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: formData.passingMarks ? parseInt(formData.passingMarks) : Math.floor(parseInt(formData.totalMarks) * 0.4),
        weight: parseFloat(formData.weight),
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        scheduledDate: formData.scheduledDate || undefined,
        dueDate: formData.dueDate || undefined,
        termId: formData.termId || undefined,
      };

      const response = await createAssessment(payload);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Assessment created successfully",
        });
        navigate('/assessments');
      } else {
        toast({
          title: "Error",
          description: `Failed to create assessment: ${response.message}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex items-center gap-4">
            <Button
              intent="secondary"
              size="sm"
              onClick={() => navigate('/assessments')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <PageTitle>Create Assessment</PageTitle>
              <PageDescription>
                Create a new assessment for your students
              </PageDescription>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField label="Assessment Title" required>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter assessment title"
                    required
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Enter assessment description"
                    rows={3}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Assessment Type" required>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EXAM">Exam</SelectItem>
                        <SelectItem value="QUIZ">Quiz</SelectItem>
                        <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                        <SelectItem value="TEST">Test</SelectItem>
                        <SelectItem value="PROJECT">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Status">
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Assessment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Assessment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Total Marks" required>
                    <Input
                      type="number"
                      value={formData.totalMarks}
                      onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                      placeholder="100"
                      required
                      min="1"
                    />
                  </FormField>

                  <FormField label="Passing Marks">
                    <Input
                      type="number"
                      value={formData.passingMarks}
                      onChange={(e) => handleInputChange('passingMarks', e.target.value)}
                      placeholder="40"
                      min="1"
                    />
                  </FormField>

                  <FormField label="Weight">
                    <Input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="1.0"
                      min="0.1"
                    />
                  </FormField>
                </div>

                <FormField label="Duration (minutes)">
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="60"
                    min="1"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Scheduled Date">
                    <Input
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Due Date">
                    <Input
                      type="datetime-local"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Assignment Details */}
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Subject" required>
                    <Select value={formData.subjectId} onValueChange={(value) => handleInputChange('subjectId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataLoading ? (
                          <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                        ) : (
                          <>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                            {subjects.length === 0 && (
                              <SelectItem value="no-subjects" disabled>No subjects available</SelectItem>
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Class" required>
                    <Select value={formData.classId} onValueChange={(value) => handleInputChange('classId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataLoading ? (
                          <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                        ) : (
                          <>
                            {classes.map((classItem) => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.name} - Grade {classItem.grade}
                              </SelectItem>
                            ))}
                            {classes.length === 0 && (
                              <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Academic Year">
                    <Select value={formData.academicYearId} onValueChange={(value) => handleInputChange('academicYearId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Term">
                    <Select value={formData.termId} onValueChange={(value) => handleInputChange('termId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        {terms.filter(term => term.id || term._id).map((term) => (
                          <SelectItem key={term.id || term._id} value={term.id || term._id}>
                            {term.name}
                          </SelectItem>
                        ))}
                        {terms.length === 0 && (
                          <SelectItem value="no-terms" disabled>No terms available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField label="Assessment Instructions">
                  <Textarea
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    placeholder="Enter detailed instructions for students"
                    rows={4}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <Button
                type="button"
                intent="cancel"
                className="w-full sm:w-auto"
                onClick={() => navigate('/assessments')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                intent="primary"
                className="w-full sm:w-auto"
                disabled={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Creating...' : 'Create Assessment'}
              </Button>
            </div>
          </form>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default CreateAssessment;