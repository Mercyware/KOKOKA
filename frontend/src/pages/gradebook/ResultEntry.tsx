import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input, 
  FormField,
  PageContainer,
  PageHeader,
  PageTitle,
  PageContent
} from '@/components/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import resultService from '@/services/resultService';
import { getStudents } from '@/services/studentService';
import { getAllSubjects } from '@/services/subjectService';
import { getAllClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface ScoreEntry {
  subjectId: string;
  subjectName: string;
  firstCA: number | null;
  secondCA: number | null;
  thirdCA: number | null;
  exam: number | null;
  total: number;
  grade?: string;
}

interface ResultFormData {
  studentId: string;
  termId: string;
  classId: string;
  scores: ScoreEntry[];
  attendance: {
    daysPresent: number;
    daysAbsent: number;
    timesLate: number;
  };
  conduct: {
    grade: string;
    comment: string;
  };
}

export default function ResultEntry() {
  const { classId, termId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<ResultFormData>({
    studentId: '',
    termId: termId || '',
    classId: classId || '',
    scores: [],
    attendance: {
      daysPresent: 0,
      daysAbsent: 0,
      timesLate: 0
    },
    conduct: {
      grade: 'A',
      comment: ''
    }
  });

  useEffect(() => {
    loadInitialData();
  }, [classId, termId]);

  useEffect(() => {
    if (selectedStudent && subjects.length > 0) {
      initializeScores();
      loadExistingResult();
    }
  }, [selectedStudent, subjects, formData.termId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load all required data from API
      const [studentsResponse, subjectsResponse, academicYearsResponse, classesResponse] = await Promise.all([
        getStudents({ status: 'active' }),
        getAllSubjects(),
        getAllAcademicYears(),
        getAllClasses()
      ]);

      if (studentsResponse.success && studentsResponse.data) {
        const studentData = studentsResponse.data.students || studentsResponse.data;
        setStudents(studentData);
      }

      if (subjectsResponse.success && subjectsResponse.data) {
        setSubjects(subjectsResponse.data);
      }

      if (academicYearsResponse.success && academicYearsResponse.data?.academicYears) {
        setAcademicYears(academicYearsResponse.data.academicYears);
        // Auto-select current academic year
        const current = academicYearsResponse.data.academicYears.find((year: any) => year.isCurrent);
        if (current && current.terms) {
          setTerms(current.terms);
          // Set the first term as default if termId is not provided
          if (!termId && current.terms.length > 0) {
            setFormData(prev => ({ ...prev, termId: current.terms[0].id }));
          }
        }
      }

      if (classesResponse.success && classesResponse.data) {
        setClasses(classesResponse.data);
        // Set the first class as default if classId is not provided
        if (!classId && classesResponse.data.length > 0) {
          setFormData(prev => ({ ...prev, classId: classesResponse.data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeScores = () => {
    const initialScores: ScoreEntry[] = subjects.map(subject => ({
      subjectId: subject.id,
      subjectName: subject.name,
      firstCA: null,
      secondCA: null,
      thirdCA: null,
      exam: null,
      total: 0
    }));

    setFormData(prev => ({
      ...prev,
      studentId: selectedStudent?.id || '',
      scores: initialScores
    }));
  };

  const loadExistingResult = async () => {
    if (!selectedStudent || !formData.termId) return;
    
    try {
      // Load existing result from API
      const existingResult = await resultService.getStudentResult(selectedStudent.id, formData.termId);
      
      if (existingResult && existingResult.subjectResults) {
        // Update form with existing data
        setFormData(prev => ({
          ...prev,
          scores: prev.scores.map(score => {
            const existing = existingResult.subjectResults.find(sr => sr.subjectId === score.subjectId);
            if (existing) {
              return {
                ...score,
                firstCA: existing.caScore || null,
                secondCA: null, // These might need to be split from caScore if stored separately
                thirdCA: null,
                exam: existing.examScore || null,
                total: existing.totalScore
              };
            }
            return score;
          })
        }));
      }
    } catch (error) {
      console.log('No existing result found or error loading result:', error);
    }
  };

  const calculateGrade = (total: number): string => {
    if (total >= 90) return 'A';
    if (total >= 80) return 'B';
    if (total >= 70) return 'C';
    if (total >= 60) return 'D';
    return 'F';
  };

  const handleAcademicYearChange = (academicYearId: string) => {
    const selectedYear = academicYears.find(year => year.id === academicYearId);
    if (selectedYear && selectedYear.terms) {
      setTerms(selectedYear.terms);
      setFormData(prev => ({ ...prev, termId: '' })); // Reset term selection
    }
  };

  const updateScore = (subjectId: string, field: keyof Pick<ScoreEntry, 'firstCA' | 'secondCA' | 'thirdCA' | 'exam'>, value: number | null) => {
    setFormData(prev => ({
      ...prev,
      scores: prev.scores.map(score => {
        if (score.subjectId === subjectId) {
          const updated = { ...score, [field]: value };
          const total = (updated.firstCA || 0) + (updated.secondCA || 0) + (updated.thirdCA || 0) + (updated.exam || 0);
          updated.total = total;
          updated.grade = calculateGrade(total);
          return updated;
        }
        return score;
      })
    }));
  };

  const updateAttendance = (field: keyof typeof formData.attendance, value: number) => {
    setFormData(prev => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [field]: value
      }
    }));
  };

  const updateConduct = (field: keyof typeof formData.conduct, value: string) => {
    setFormData(prev => ({
      ...prev,
      conduct: {
        ...prev.conduct,
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedStudent || !formData.termId || !formData.classId) {
      alert('Please select student, term, and class before saving');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare data for API call
      const resultData = {
        studentId: selectedStudent.id,
        termId: formData.termId,
        classId: formData.classId,
        subjectResults: formData.scores
          .filter(score => score.total > 0) // Only save subjects with scores
          .map(score => ({
            subjectId: score.subjectId,
            caScore: (score.firstCA || 0) + (score.secondCA || 0) + (score.thirdCA || 0),
            examScore: score.exam || 0
          })),
        remarks: formData.conduct.comment
      };
      
      const result = await resultService.createOrUpdateResult(resultData);
      
      if (result) {
        alert('Result saved successfully!');
        // Reload to show updated data
        loadExistingResult();
      }
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Failed to save result. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const calculateOverallStats = () => {
    const validScores = formData.scores.filter(s => s.total > 0);
    if (validScores.length === 0) return { average: 0, total: 0, grade: 'F' };

    const totalScore = validScores.reduce((sum, s) => sum + s.total, 0);
    const average = totalScore / validScores.length;
    
    return {
      average: parseFloat(average.toFixed(1)),
      total: totalScore,
      grade: calculateGrade(average)
    };
  };

  const overallStats = calculateOverallStats();

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Result Entry</PageTitle>
        <div className="text-sm text-gray-600">Enter student results</div>
      </PageHeader>

      {/* Selection Controls */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Select Term">
          <select
            value={formData.termId}
            onChange={(e) => setFormData(prev => ({ ...prev, termId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a term...</option>
            {terms.map((term) => (
              <option key={term.id} value={term.id}>
                {term.name}
              </option>
            ))}
          </select>
        </FormField>
        
        <FormField label="Select Class">
          <select
            value={formData.classId}
            onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a class...</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Students ({students.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedStudent?.id === student.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.admissionNumber}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Student Header */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </h3>
                        <p className="text-gray-600">{selectedStudent.admissionNumber}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Overall Average</div>
                        <div className="text-2xl font-bold">{overallStats.average}%</div>
                        <Badge 
                          variant={
                            overallStats.grade === 'A' ? 'default' : 
                            overallStats.grade === 'B' ? 'secondary' :
                            overallStats.grade === 'C' ? 'outline' : 'destructive'
                          }
                        >
                          Grade {overallStats.grade}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Scores Entry */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Scores</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b text-sm">
                            <th className="text-left p-3 font-medium">Subject</th>
                            <th className="text-center p-3 font-medium w-20">1st CA<br/><span className="text-xs text-gray-500">(30)</span></th>
                            <th className="text-center p-3 font-medium w-20">2nd CA<br/><span className="text-xs text-gray-500">(30)</span></th>
                            <th className="text-center p-3 font-medium w-20">3rd CA<br/><span className="text-xs text-gray-500">(30)</span></th>
                            <th className="text-center p-3 font-medium w-20">Exam<br/><span className="text-xs text-gray-500">(70)</span></th>
                            <th className="text-center p-3 font-medium w-20">Total<br/><span className="text-xs text-gray-500">(160)</span></th>
                            <th className="text-center p-3 font-medium w-16">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.scores.map((score, index) => (
                            <tr key={score.subjectId} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                              <td className="p-3 font-medium text-sm">{score.subjectName}</td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={score.firstCA || ''}
                                  onChange={(e) => updateScore(
                                    score.subjectId, 
                                    'firstCA', 
                                    e.target.value ? parseInt(e.target.value) : null
                                  )}
                                  className="text-center text-sm h-8"
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={score.secondCA || ''}
                                  onChange={(e) => updateScore(
                                    score.subjectId, 
                                    'secondCA', 
                                    e.target.value ? parseInt(e.target.value) : null
                                  )}
                                  className="text-center text-sm h-8"
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={score.thirdCA || ''}
                                  onChange={(e) => updateScore(
                                    score.subjectId, 
                                    'thirdCA', 
                                    e.target.value ? parseInt(e.target.value) : null
                                  )}
                                  className="text-center text-sm h-8"
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="70"
                                  value={score.exam || ''}
                                  onChange={(e) => updateScore(
                                    score.subjectId, 
                                    'exam', 
                                    e.target.value ? parseInt(e.target.value) : null
                                  )}
                                  className="text-center text-sm h-8"
                                  placeholder="0"
                                />
                              </td>
                              <td className="p-3 text-center font-bold text-sm">
                                {score.total}
                              </td>
                              <td className="p-3 text-center">
                                <Badge 
                                  variant={
                                    score.grade === 'A' ? 'default' : 
                                    score.grade === 'B' ? 'secondary' :
                                    score.grade === 'C' ? 'outline' : 'destructive'
                                  }
                                >
                                  {score.grade || '-'}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Attendance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <FormField label="Days Present">
                          <Input
                            type="number"
                            min="0"
                            value={formData.attendance.daysPresent}
                            onChange={(e) => updateAttendance('daysPresent', parseInt(e.target.value) || 0)}
                          />
                        </FormField>
                        <FormField label="Days Absent">
                          <Input
                            type="number"
                            min="0"
                            value={formData.attendance.daysAbsent}
                            onChange={(e) => updateAttendance('daysAbsent', parseInt(e.target.value) || 0)}
                          />
                        </FormField>
                        <FormField label="Times Late">
                          <Input
                            type="number"
                            min="0"
                            value={formData.attendance.timesLate}
                            onChange={(e) => updateAttendance('timesLate', parseInt(e.target.value) || 0)}
                          />
                        </FormField>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Conduct */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Conduct & Comments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <FormField label="Conduct Grade">
                          <select
                            value={formData.conduct.grade}
                            onChange={(e) => updateConduct('grade', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="A">A - Excellent</option>
                            <option value="B">B - Good</option>
                            <option value="C">C - Fair</option>
                            <option value="D">D - Poor</option>
                          </select>
                        </FormField>
                        <FormField label="Teacher's Comment">
                          <textarea
                            value={formData.conduct.comment}
                            onChange={(e) => updateConduct('comment', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="Enter teacher's comment..."
                          />
                        </FormField>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  <Button 
                    intent="cancel" 
                    className="w-full sm:w-auto"
                    onClick={() => navigate('/results')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    intent="primary" 
                    className="w-full sm:w-auto"
                    onClick={handleSave}
                    disabled={saving || !selectedStudent}
                  >
                    {saving ? 'Saving...' : 'Save Result'}
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                  <p className="text-gray-500">
                    Choose a student from the list to enter their academic results
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
