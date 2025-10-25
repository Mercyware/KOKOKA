import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DatePicker,
  toast
} from '@/components/ui';
import { Save, ChevronLeft, ChevronRight, User, Target, Heart } from 'lucide-react';
import { getAllClasses } from '../../services/classService';
import { getAllSubjects } from '../../services/subjectService';
import { getAllAcademicYears } from '../../services/academicYearService';
import { getAllTerms } from '../../services/termService';
import { getStudentsByClass } from '../../services/studentService';
import { submitBehavioralGrades } from '../../services/behavioralAssessmentService';
import api from '../../services/api';
import { getDefaultCriteria, GRADE_SCALE, GRADE_DESCRIPTORS, calculateAverageGrade } from '../../constants/behavioralCriteria';
import { Class, Subject, AcademicYear } from '../../types';

interface Term {
  id?: string;
  _id?: string;
  name: string;
}

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

const RecordBehavioralScores: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Selected values
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [assessmentType, setAssessmentType] = useState<'AFFECTIVE' | 'PSYCHOMOTOR'>('AFFECTIVE');
  const [assessmentDate, setAssessmentDate] = useState<Date>(new Date());

  // Student navigation and grading
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [allGrades, setAllGrades] = useState<Record<string, StudentGrades>>({});
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  useEffect(() => {
    // Auto-select all criteria when type changes
    const criteria = getDefaultCriteria(assessmentType);
    setSelectedCriteria(criteria.map(c => c.id));
  }, [assessmentType]);

  useEffect(() => {
    // Initialize grades when students or criteria change
    if (students.length > 0 && selectedCriteria.length > 0) {
      initializeGrades();
    }
  }, [students, selectedCriteria]);

  const fetchFormData = async () => {
    setLoading(true);
    try {
      const [classesRes, subjectsRes, academicYearsRes, termsRes] = await Promise.all([
        getAllClasses().catch(() => null),
        getAllSubjects().catch(() => null),
        getAllAcademicYears().catch(() => null),
        getAllTerms().catch(() => null)
      ]);

      if (classesRes?.success && classesRes.data) setClasses(classesRes.data);
      if (subjectsRes?.success && subjectsRes.data) setSubjects(subjectsRes.data);
      if (academicYearsRes?.success && academicYearsRes.data) {
        // Handle both array and nested response formats
        const yearsData = Array.isArray(academicYearsRes.data)
          ? academicYearsRes.data
          : academicYearsRes.data.academicYears || [];
        setAcademicYears(yearsData);
        // Auto-select current academic year
        const current = yearsData.find((y: AcademicYear) => y.isCurrent);
        if (current) setSelectedAcademicYear(current.id);
      }
      if (termsRes) {
        const termsData = Array.isArray(termsRes) ? termsRes : termsRes.data;
        if (termsData) {
          const mappedTerms = termsData.map((term: any) => ({
            ...term,
            id: term.id || term._id
          }));
          setTerms(mappedTerms);
        }
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const studentsRes = await getStudentsByClass(selectedClass);
      if (studentsRes.success && studentsRes.data) {
        setStudents(studentsRes.data);
        setCurrentStudentIndex(0);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const initializeGrades = () => {
    const initialGrades: Record<string, StudentGrades> = {};

    students.forEach((student) => {
      const criteriaGrades: Record<string, string> = {};
      selectedCriteria.forEach(criteriaId => {
        criteriaGrades[criteriaId] = '';
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
  };

  const currentStudent = students[currentStudentIndex];
  const currentGrades = currentStudent ? allGrades[currentStudent.id] : null;
  const currentCriteria = getDefaultCriteria(assessmentType).filter(c => selectedCriteria.includes(c.id));

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
    toast({
      title: "Progress Saved",
      description: `Grades for ${currentStudent?.firstName} ${currentStudent?.lastName} saved`,
    });

    if (currentStudentIndex < students.length - 1) {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    if (!selectedClass || !selectedSubject || !selectedAcademicYear) {
      toast({
        title: "Validation Error",
        description: "Please select class, subject, and academic year",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Prepare grades for submission
      const gradesData = Object.values(allGrades)
        .filter(studentGrade => {
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

      // Create the assessment inline
      const criteria = selectedCriteria.map(criteriaId => {
        const criteriaInfo = currentCriteria.find(c => c.id === criteriaId);
        return {
          id: criteriaId,
          label: criteriaInfo?.label || criteriaId,
          description: criteriaInfo?.description || '',
          maxGrade: 'A'
        };
      });

      const assessmentDateStr = assessmentDate.toISOString().split('T')[0];
      const assessmentData = {
        title: `${assessmentType === 'AFFECTIVE' ? 'Affective' : 'Psychomotor'} Assessment - ${assessmentDateStr}`,
        description: `Behavioral assessment recorded on ${assessmentDateStr}`,
        type: assessmentType,
        totalMarks: selectedCriteria.length * 5,
        passingMarks: Math.floor(selectedCriteria.length * 5 * 0.5),
        weight: 1.0,
        scheduledDate: assessmentDateStr,
        subjectId: selectedSubject,
        classId: selectedClass,
        academicYearId: selectedAcademicYear,
        termId: selectedTerm || undefined,
        status: 'PUBLISHED',
        criteria
      };

      // Submit assessment with grades using api service
      const response = await api.post('/behavioral-assessments/record', {
        assessment: assessmentData,
        grades: gradesData
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: `Behavioral scores recorded for ${gradesData.length} student(s)`,
        });

        // Reset form
        setSelectedClass('');
        setSelectedSubject('');
        setStudents([]);
        setAllGrades({});
        setCurrentStudentIndex(0);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to record behavioral scores",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting behavioral scores:', error);
      toast({
        title: "Error",
        description: "An error occurred while submitting behavioral scores",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const canStartGrading = selectedClass && selectedSubject && selectedAcademicYear && students.length > 0;

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <PageTitle>Record Behavioral Scores</PageTitle>
          <PageDescription>
            Grade students on affective and psychomotor criteria - just like taking attendance
          </PageDescription>
        </PageHeader>

        <PageContent>
          {/* Selection Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Class & Assessment Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Assessment Type" required>
                  <Select value={assessmentType} onValueChange={(value: any) => setAssessmentType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AFFECTIVE">
                        <div className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Affective Domain (Behavior, Attitude, Values)
                        </div>
                      </SelectItem>
                      <SelectItem value="PSYCHOMOTOR">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Psychomotor Domain (Skills, Physical Activities)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Assessment Date" required>
                  <DatePicker
                    value={assessmentDate}
                    onChange={(date) => setAssessmentDate(date || new Date())}
                  />
                </FormField>

                <FormField label="Class" required>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name} - Grade {classItem.grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Subject" required>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Academic Year" required>
                  <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name} {year.isCurrent && '(Current)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Term">
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select term (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {terms.map((term) => (
                        <SelectItem key={term.id || term._id} value={term.id || term._id || ''}>
                          {term.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {students.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    ✓ {students.length} students found in this class
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Grading */}
          {canStartGrading && (
            <>
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
                  <CardTitle>
                    {assessmentType === 'AFFECTIVE' ? 'Affective Domain' : 'Psychomotor Domain'} Criteria
                  </CardTitle>
                  <div className="text-sm text-gray-600 mt-2">
                    Grade Scale: <strong>A</strong> (Excellent) • <strong>B</strong> (Very Good) •
                    <strong>C</strong> (Good) • <strong>D</strong> (Fair) • <strong>E</strong> (Poor)
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentCriteria.map((c) => (
                      <FormField key={c.id} label={c.label}>
                        <div className="space-y-2">
                          <p className="text-xs text-gray-500">{c.description}</p>
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
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">{grade}</span>
                                    <span className="text-xs text-gray-500">
                                      {GRADE_DESCRIPTORS[grade].label}
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

                  <FormField label="Comments">
                    <Textarea
                      value={currentGrades?.feedback || ''}
                      onChange={(e) => handleFeedbackChange(e.target.value)}
                      placeholder="Optional comments..."
                      rows={3}
                    />
                  </FormField>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                    {currentStudentIndex < students.length - 1 && (
                      <Button
                        type="button"
                        intent="action"
                        onClick={handleSaveAndNext}
                      >
                        Save & Next Student
                      </Button>
                    )}
                    <Button
                      type="button"
                      intent="primary"
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {submitting ? 'Submitting...' : 'Submit All Scores'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default RecordBehavioralScores;
