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
  toast
} from '@/components/ui';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { getAllClasses } from '../../services/classService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllAcademicYears } from '../../services/academicYearService';
import { getAllTerms } from '../../services/termService';
import { getAssessmentById, updateAssessment } from '../../services/assessmentService';
import { Class, Subject, AcademicYear } from '../../types';

interface Term {
  id?: string;
  _id?: string;
  name: string;
}

const EditAssessment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
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
    const loadData = async () => {
      await fetchData(); // Wait for dropdowns to load first
      if (id) {
        await fetchAssessment(); // Then load assessment
      }
    };
    loadData();
  }, [id]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
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

      if (subjectsRes?.success && subjectsRes.data) {
        console.log('Subjects loaded:', subjectsRes.data);
        setSubjects(subjectsRes.data);
      }

      if (classesRes?.success && classesRes.data) {
        console.log('Classes loaded:', classesRes.data);
        setClasses(classesRes.data);
      }

      if (academicYearsRes?.success && academicYearsRes.data) {
        const years = (academicYearsRes.data as any).academicYears || academicYearsRes.data;
        console.log('Academic years loaded:', years);
        setAcademicYears(Array.isArray(years) ? years : []);
      }

      if (termsRes) {
        const termsData = Array.isArray(termsRes) ? termsRes : termsRes.data;
        if (termsData) {
          const mappedTerms = termsData.map((term: any) => ({
            ...term,
            id: term.id || term._id
          }));
          console.log('Terms loaded:', mappedTerms);
          setTerms(mappedTerms);
        }
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setDataLoading(false);
    }
  };

  const fetchAssessment = async () => {
    try {
      const response = await getAssessmentById(id!);
      console.log('Assessment response:', response);

      if (response.success && response.data) {
        const assessment = response.data;
        console.log('Assessment data:', assessment);

        // Extract term ID with detailed logging
        const extractedTermId = assessment.termId || assessment.term?.id || '';
        console.log('Term extraction:', {
          termId: assessment.termId,
          termObject: assessment.term,
          extractedTermId: extractedTermId
        });

        const newFormData = {
          title: assessment.title || '',
          description: assessment.description || '',
          type: assessment.type || 'EXAM',
          totalMarks: assessment.totalMarks?.toString() || '',
          passingMarks: assessment.passingMarks?.toString() || '',
          weight: assessment.weight?.toString() || '1.0',
          duration: assessment.duration?.toString() || '',
          scheduledDate: assessment.scheduledDate ? new Date(assessment.scheduledDate).toISOString().split('T')[0] : '',
          dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString().split('T')[0] : '',
          instructions: assessment.instructions || '',
          subjectId: assessment.subjectId || assessment.subject?.id || '',
          classId: assessment.classId || assessment.class?.id || '',
          academicYearId: assessment.academicYearId || assessment.academicYear?.id || '',
          termId: extractedTermId,
          status: assessment.status || 'DRAFT'
        };

        console.log('Setting form data:', newFormData);
        console.log('Available terms:', terms);
        setFormData(newFormData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load assessment",
          variant: "destructive",
        });
        navigate('/assessments');
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment",
        variant: "destructive",
      });
      navigate('/assessments');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.subjectId || !formData.classId || !formData.totalMarks || !formData.academicYearId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Subject, Class, Total Marks, Academic Year)",
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

      const response = await updateAssessment(id!, payload);

      if (response.success) {
        toast({
          title: "Success!",
          description: "Assessment updated successfully",
        });
        navigate('/assessments');
      } else {
        toast({
          title: "Error",
          description: `Failed to update assessment: ${response.message}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast({
        title: "Error",
        description: "An error occurred while updating the assessment",
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
              intent="action"
              size="sm"
              onClick={() => navigate('/assessments')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <PageTitle>Edit Assessment</PageTitle>
              <PageDescription>
                Update assessment details and information
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
                <FormField label="Title" required>
                  <Input
                    placeholder="Enter assessment title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                  />
                </FormField>

                <FormField label="Description">
                  <Textarea
                    placeholder="Enter assessment description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Type" required>
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

                  <FormField label="Status" required>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">Draft</SelectItem>
                        <SelectItem value="PUBLISHED">Published</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="ARCHIVED">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Subject and Class */}
            <Card>
              <CardHeader>
                <CardTitle>Subject and Class</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Subject" required>
                    <Select
                      value={formData.subjectId || undefined}
                      onValueChange={(value) => handleInputChange('subjectId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataLoading ? (
                          <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                        ) : (
                          <>
                            {Array.isArray(subjects) && subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.name} ({subject.code})
                              </SelectItem>
                            ))}
                            {(!Array.isArray(subjects) || subjects.length === 0) && (
                              <SelectItem value="no-subjects" disabled>No subjects available</SelectItem>
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Class" required>
                    <Select
                      value={formData.classId || undefined}
                      onValueChange={(value) => handleInputChange('classId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataLoading ? (
                          <SelectItem value="loading" disabled>Loading classes...</SelectItem>
                        ) : (
                          <>
                            {Array.isArray(classes) && classes.map((classItem) => (
                              <SelectItem key={classItem.id} value={classItem.id}>
                                {classItem.name} - Grade {classItem.grade}
                              </SelectItem>
                            ))}
                            {(!Array.isArray(classes) || classes.length === 0) && (
                              <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                            )}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Academic Year" required>
                    <Select
                      value={formData.academicYearId || undefined}
                      onValueChange={(value) => handleInputChange('academicYearId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(academicYears) && academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Term">
                    <Select
                      value={formData.termId || undefined}
                      onValueChange={(value) => handleInputChange('termId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select term (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(terms) && terms.filter(term => term.id || term._id).map((term) => (
                          <SelectItem key={term.id || term._id} value={term.id || term._id}>
                            {term.name}
                          </SelectItem>
                        ))}
                        {(!Array.isArray(terms) || terms.length === 0) && (
                          <SelectItem value="no-terms" disabled>No terms available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Marks and Weight */}
            <Card>
              <CardHeader>
                <CardTitle>Marks and Weight</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Total Marks" required>
                    <Input
                      type="number"
                      placeholder="100"
                      value={formData.totalMarks}
                      onChange={(e) => handleInputChange('totalMarks', e.target.value)}
                      min="0"
                    />
                  </FormField>

                  <FormField label="Passing Marks">
                    <Input
                      type="number"
                      placeholder="40"
                      value={formData.passingMarks}
                      onChange={(e) => handleInputChange('passingMarks', e.target.value)}
                      min="0"
                    />
                  </FormField>

                  <FormField label="Weight">
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="1.0"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      min="0"
                    />
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Schedule and Duration */}
            <Card>
              <CardHeader>
                <CardTitle>Schedule and Duration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="Duration (minutes)">
                    <Input
                      type="number"
                      placeholder="60"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      min="0"
                    />
                  </FormField>

                  <FormField label="Scheduled Date">
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                    />
                  </FormField>

                  <FormField label="Due Date">
                    <Input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    />
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
                <FormField label="Instructions for Students">
                  <Textarea
                    placeholder="Enter detailed instructions for students..."
                    value={formData.instructions}
                    onChange={(e) => handleInputChange('instructions', e.target.value)}
                    rows={6}
                  />
                </FormField>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <Button intent="cancel" className="w-full sm:w-auto" onClick={() => navigate('/assessments')} type="button">
                Cancel
              </Button>
              <Button intent="primary" className="w-full sm:w-auto" type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Updating...' : 'Update Assessment'}
              </Button>
            </div>
          </form>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default EditAssessment;
