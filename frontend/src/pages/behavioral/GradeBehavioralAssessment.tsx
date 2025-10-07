import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
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
  FormField,
  toast
} from '@/components/ui';
import { ArrowLeft, Save, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { getBehavioralAssessmentById, submitBehavioralGrades, BehavioralAssessment } from '../../services/behavioralAssessmentService';
import { getStudentsByClass } from '../../services/studentService';
import { GRADE_SCALE, GRADE_DESCRIPTORS, calculateAverageGrade } from '../../constants/behavioralCriteria';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface StudentGrades {
  studentId: string;
  criteriaGrades: Record<string, string>;
  feedback: string;
  totalPoints: number;
  averageGrade: string;
}

const GradeBehavioralAssessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assessment, setAssessment] = useState<BehavioralAssessment | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [allGrades, setAllGrades] = useState<Record<string, StudentGrades>>({});

  useEffect(() => {
    if (id) {
      fetchAssessmentAndStudents();
    }
  }, [id]);

  const fetchAssessmentAndStudents = async () => {
    setLoading(true);
    try {
      const assessmentRes = await getBehavioralAssessmentById(id!);

      if (assessmentRes.success && assessmentRes.data) {
        setAssessment(assessmentRes.data);

        // Fetch students for the class
        if (assessmentRes.data.classId) {
          const studentsRes = await getStudentsByClass(assessmentRes.data.classId);

          if (studentsRes.success && studentsRes.data) {
            const studentsList = studentsRes.data;
            setStudents(studentsList);

            // Initialize grades for each student
            const initialGrades: Record<string, StudentGrades> = {};
            const criteria = assessmentRes.data.rubric || [];

            studentsList.forEach((student: Student) => {
              const criteriaGrades: Record<string, string> = {};

              criteria.forEach((c: any) => {
                criteriaGrades[c.id] = '';
              });

              initialGrades[student.id] = {
                studentId: student.id,
                criteriaGrades,
                feedback: '',
                totalPoints: 0,
                averageGrade: ''
              };
            });

            setAllGrades(initialGrades);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentStudent = students[currentStudentIndex];
  const currentGrades = currentStudent ? allGrades[currentStudent.id] : null;

  const handleGradeChange = (criteriaId: string, grade: string) => {
    if (!currentStudent) return;

    setAllGrades(prev => {
      const updated = {
        ...prev,
        [currentStudent.id]: {
          ...prev[currentStudent.id],
          criteriaGrades: {
            ...prev[currentStudent.id].criteriaGrades,
            [criteriaId]: grade
          }
        }
      };

      // Recalculate total points and average grade
      const criteriaGrades = Object.values(updated[currentStudent.id].criteriaGrades);
      const validGrades = criteriaGrades.filter(g => g !== '');

      if (validGrades.length > 0) {
        const totalPoints = validGrades.reduce((sum, g) => {
          return sum + (GRADE_DESCRIPTORS[g as keyof typeof GRADE_DESCRIPTORS]?.points || 0);
        }, 0);

        updated[currentStudent.id].totalPoints = totalPoints;
        updated[currentStudent.id].averageGrade = calculateAverageGrade(validGrades);
      }

      return updated;
    });
  };

  const handleFeedbackChange = (feedback: string) => {
    if (!currentStudent) return;

    setAllGrades(prev => ({
      ...prev,
      [currentStudent.id]: {
        ...prev[currentStudent.id],
        feedback
      }
    }));
  };

  const handlePrevious = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex(prev => prev + 1);
    }
  };

  const handleSaveAndNext = () => {
    // Save current student's grades (you can add validation here)
    toast({
      title: "Progress Saved",
      description: `Grades for ${currentStudent?.firstName} ${currentStudent?.lastName} saved`,
    });

    if (currentStudentIndex < students.length - 1) {
      handleNext();
    }
  };

  const handleSubmitAll = async () => {
    if (!assessment) return;

    try {
      setSubmitting(true);

      // Prepare grades for submission
      const gradesData = Object.values(allGrades)
        .filter(studentGrade => {
          // Only submit students who have at least one grade
          const hasGrades = Object.values(studentGrade.criteriaGrades).some(g => g !== '');
          return hasGrades;
        })
        .map(studentGrade => {
          const rubricScores = Object.entries(studentGrade.criteriaGrades)
            .filter(([_, grade]) => grade !== '')
            .map(([criteriaId, grade]) => ({
              criteriaId,
              grade,
              points: GRADE_DESCRIPTORS[grade as keyof typeof GRADE_DESCRIPTORS]?.points || 0
            }));

          return {
            studentId: studentGrade.studentId,
            marksObtained: studentGrade.totalPoints,
            feedback: studentGrade.feedback,
            rubricScores
          };
        });

      if (gradesData.length === 0) {
        toast({
          title: "No Grades to Submit",
          description: "Please grade at least one student before submitting",
          variant: "destructive",
        });
        return;
      }

      const response = await submitBehavioralGrades(id!, gradesData);

      if (response.success) {
        toast({
          title: "Success",
          description: `Grades submitted for ${gradesData.length} student(s)`,
        });
        navigate('/behavioral-assessments');
      } else {
        toast({
          title: "Error",
          description: "Failed to submit grades",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting grades:', error);
      toast({
        title: "Error",
        description: "An error occurred while submitting grades",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <PageContent>
            <div className="text-center py-8">
              <p className="text-gray-500">Loading assessment...</p>
            </div>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  if (!assessment || students.length === 0) {
    return (
      <Layout>
        <PageContainer>
          <PageContent>
            <div className="text-center py-8">
              <p className="text-gray-500">
                {!assessment ? 'Assessment not found' : 'No students found in this class'}
              </p>
              <Button
                intent="primary"
                className="mt-4"
                onClick={() => navigate('/behavioral-assessments')}
              >
                Back to Assessments
              </Button>
            </div>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  const criteria = assessment.rubric || [];

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex items-center gap-4">
            <Button
              intent="secondary"
              size="sm"
              onClick={() => navigate('/behavioral-assessments')}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <PageTitle>Grade: {assessment.title}</PageTitle>
              <PageDescription>
                {assessment.type === 'AFFECTIVE' ? 'Affective Domain' : 'Psychomotor Domain'} Assessment •
                {assessment.class?.name} • {assessment.subject?.name}
              </PageDescription>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          {/* Student Navigation */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-semibold text-lg">
                        {currentStudent?.firstName} {currentStudent?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Admission No: {currentStudent?.admissionNumber}
                      </div>
                    </div>
                  </div>
                  {currentGrades && currentGrades.averageGrade && (
                    <div className="ml-8 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium">Average Grade</div>
                      <div className="text-2xl font-bold text-blue-900">{currentGrades.averageGrade}</div>
                      <div className="text-xs text-blue-600">{currentGrades.totalPoints} points</div>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Student {currentStudentIndex + 1} of {students.length}
                  </span>
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStudentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={handleNext}
                    disabled={currentStudentIndex === students.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grading Form */}
          <Card>
            <CardHeader>
              <CardTitle>Assessment Criteria</CardTitle>
              <div className="text-sm text-gray-600 mt-2">
                Grading Scale: <strong>A</strong> (Excellent - 5pts) • <strong>B</strong> (Very Good - 4pts) •
                <strong>C</strong> (Good - 3pts) • <strong>D</strong> (Fair - 2pts) • <strong>E</strong> (Poor - 1pt)
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Criteria Grades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {criteria.map((c: any) => (
                  <FormField key={c.id} label={c.label}>
                    <div className="space-y-2">
                      {c.description && (
                        <p className="text-xs text-gray-500">{c.description}</p>
                      )}
                      <Select
                        value={currentGrades?.criteriaGrades[c.id] || ''}
                        onValueChange={(value) => handleGradeChange(c.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRADE_SCALE.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              <div className="flex items-center justify-between w-full">
                                <span className="font-semibold">{grade}</span>
                                <span className="ml-4 text-xs text-gray-500">
                                  {GRADE_DESCRIPTORS[grade].label} ({GRADE_DESCRIPTORS[grade].points}pts)
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormField>
                ))}
              </div>

              {/* Feedback */}
              <FormField label="Teacher's Comments/Feedback">
                <Textarea
                  value={currentGrades?.feedback || ''}
                  onChange={(e) => handleFeedbackChange(e.target.value)}
                  placeholder="Enter comments about the student's performance..."
                  rows={4}
                />
              </FormField>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-6 border-t">
                <Button
                  type="button"
                  intent="cancel"
                  className="w-full sm:w-auto"
                  onClick={() => navigate('/behavioral-assessments')}
                >
                  Cancel
                </Button>
                <div className="flex gap-3">
                  {currentStudentIndex < students.length - 1 && (
                    <Button
                      type="button"
                      intent="action"
                      className="w-full sm:w-auto"
                      onClick={handleSaveAndNext}
                    >
                      Save & Next Student
                    </Button>
                  )}
                  <Button
                    type="button"
                    intent="primary"
                    className="w-full sm:w-auto"
                    onClick={handleSubmitAll}
                    disabled={submitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {submitting ? 'Submitting...' : 'Submit All Grades'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default GradeBehavioralAssessment;
