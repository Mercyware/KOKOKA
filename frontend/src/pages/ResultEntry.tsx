import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Input, 
  Form, 
  FormField,
  PageContainer,
  PageHeader,
  PageTitle,
  PageContent,
  StatusBadge
} from '@/components/ui';
import { api } from '@/services/api';

interface SubjectScore {
  subjectId: string;
  subjectName: string;
  firstCA?: number;
  secondCA?: number;
  thirdCA?: number;
  exam?: number;
  total: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  photo?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  students: Student[];
}

interface TermInfo {
  id: string;
  name: string;
  academicYear: {
    name: string;
  };
}

export default function ResultEntry() {
  const { classId, termId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
  const [termInfo, setTermInfo] = useState<TermInfo | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [scores, setScores] = useState<SubjectScore[]>([]);
  const [attendance, setAttendance] = useState({
    daysPresent: 0,
    daysAbsent: 0,
    timesLate: 0
  });
  const [conduct, setConduct] = useState({
    grade: 'A',
    teacherComment: ''
  });

  useEffect(() => {
    loadInitialData();
  }, [classId, termId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      const [classResponse, termResponse, subjectsResponse] = await Promise.all([
        api.get(`/classes/${classId}`),
        api.get(`/terms/${termId}`),
        api.get('/subjects')
      ]);

      const classData = classResponse.data.data;
      const termData = termResponse.data.data;
      const subjectsData = subjectsResponse.data.data;

      setClassInfo(classData);
      setTermInfo(termData);
      setSubjects(subjectsData);
      setStudents(classData.students || []);

      // Initialize scores array
      const initialScores = subjectsData.map((subject: Subject) => ({
        subjectId: subject.id,
        subjectName: subject.name,
        firstCA: undefined,
        secondCA: undefined,
        thirdCA: undefined,
        exam: undefined,
        total: 0
      }));
      setScores(initialScores);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentResult = async (studentId: string) => {
    try {
      const response = await api.get(`/results/student/${studentId}/term/${termId}`);
      const result = response.data.data;
      
      if (result) {
        // Populate existing scores
        const existingScores = scores.map(score => {
          const existingSubject = result.subjectResults.find(
            (sr: any) => sr.subjectId === score.subjectId
          );
          if (existingSubject) {
            return {
              ...score,
              firstCA: existingSubject.firstCA,
              secondCA: existingSubject.secondCA,
              thirdCA: existingSubject.thirdCA,
              exam: existingSubject.exam,
              total: existingSubject.totalScore
            };
          }
          return score;
        });
        setScores(existingScores);

        setAttendance({
          daysPresent: result.daysPresent,
          daysAbsent: result.daysAbsent,
          timesLate: result.timesLate
        });

        setConduct({
          grade: result.conductGrade || 'A',
          teacherComment: result.teacherComment || ''
        });
      }
    } catch (error) {
      // No existing result, keep empty form
      console.log('No existing result found');
    }
  };

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    loadStudentResult(student.id);
  };

  const handleScoreChange = (subjectId: string, field: string, value: number) => {
    setScores(prev => prev.map(score => {
      if (score.subjectId === subjectId) {
        const updated = { ...score, [field]: value };
        // Calculate total
        const ca1 = updated.firstCA || 0;
        const ca2 = updated.secondCA || 0;
        const ca3 = updated.thirdCA || 0;
        const exam = updated.exam || 0;
        updated.total = ca1 + ca2 + ca3 + exam;
        return updated;
      }
      return score;
    }));
  };

  const handleSave = async () => {
    if (!selectedStudent) return;

    try {
      setSaving(true);
      const resultData = {
        studentId: selectedStudent.id,
        termId: termId!,
        classId: classId!,
        subjectScores: scores.map(score => ({
          subjectId: score.subjectId,
          firstCA: score.firstCA,
          secondCA: score.secondCA,
          thirdCA: score.thirdCA,
          exam: score.exam
        })),
        attendance,
        conduct
      };

      await api.post('/results', resultData);
      
      // Show success message
      alert('Result saved successfully!');
      
    } catch (error) {
      console.error('Error saving result:', error);
      alert('Failed to save result');
    } finally {
      setSaving(false);
    }
  };

  const calculateOverallAverage = () => {
    const validScores = scores.filter(score => score.total > 0);
    if (validScores.length === 0) return 0;
    
    const totalScore = validScores.reduce((sum, score) => sum + score.total, 0);
    return (totalScore / validScores.length).toFixed(2);
  };

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
        <PageTitle>
          Result Entry - {classInfo?.name} - {termInfo?.name}
        </PageTitle>
        <div className="text-sm text-gray-600">
          Academic Year: {termInfo?.academicYear?.name}
        </div>
      </PageHeader>

      <PageContent>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Student List */}
          <div className="lg:col-span-1">
            <Card>
              <Card.Header>
                <Card.Title>Students ({students.length})</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleStudentSelect(student)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedStudent?.id === student.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.admissionNumber}
                      </div>
                    </button>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>

          {/* Result Form */}
          <div className="lg:col-span-3">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Student Info */}
                <Card>
                  <Card.Content className="flex items-center gap-4 p-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                      {selectedStudent.photo ? (
                        <img
                          src={selectedStudent.photo}
                          alt=""
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-medium">
                          {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {selectedStudent.firstName} {selectedStudent.lastName}
                      </h3>
                      <p className="text-gray-600">{selectedStudent.admissionNumber}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Overall Average</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateOverallAverage()}%
                      </div>
                    </div>
                  </Card.Content>
                </Card>

                {/* Scores Table */}
                <Card>
                  <Card.Header>
                    <Card.Title>Academic Scores</Card.Title>
                    <div className="text-sm text-gray-600">
                      CA (Continuous Assessment): 30 marks each | Exam: 70 marks | Total: 160 marks
                    </div>
                  </Card.Header>
                  <Card.Content>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b bg-gray-50">
                            <th className="text-left p-3 font-medium">Subject</th>
                            <th className="text-center p-3 font-medium w-24">1st CA<br/><span className="text-xs text-gray-500">(30)</span></th>
                            <th className="text-center p-3 font-medium w-24">2nd CA<br/><span className="text-xs text-gray-500">(30)</span></th>
                            <th className="text-center p-3 font-medium w-24">3rd CA<br/><span className="text-xs text-gray-500">(30)</span></th>
                            <th className="text-center p-3 font-medium w-24">Exam<br/><span className="text-xs text-gray-500">(70)</span></th>
                            <th className="text-center p-3 font-medium w-24">Total<br/><span className="text-xs text-gray-500">(160)</span></th>
                            <th className="text-center p-3 font-medium w-16">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scores.map((score) => (
                            <tr key={score.subjectId} className="border-b hover:bg-gray-50">
                              <td className="p-3 font-medium">{score.subjectName}</td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={score.firstCA || ''}
                                  onChange={(e) => handleScoreChange(
                                    score.subjectId, 
                                    'firstCA', 
                                    parseFloat(e.target.value) || 0
                                  )}
                                  className="text-center w-full"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={score.secondCA || ''}
                                  onChange={(e) => handleScoreChange(
                                    score.subjectId, 
                                    'secondCA', 
                                    parseFloat(e.target.value) || 0
                                  )}
                                  className="text-center w-full"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="30"
                                  value={score.thirdCA || ''}
                                  onChange={(e) => handleScoreChange(
                                    score.subjectId, 
                                    'thirdCA', 
                                    parseFloat(e.target.value) || 0
                                  )}
                                  className="text-center w-full"
                                />
                              </td>
                              <td className="p-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="70"
                                  value={score.exam || ''}
                                  onChange={(e) => handleScoreChange(
                                    score.subjectId, 
                                    'exam', 
                                    parseFloat(e.target.value) || 0
                                  )}
                                  className="text-center w-full"
                                />
                              </td>
                              <td className="p-3 text-center font-medium bg-blue-50">
                                {score.total.toFixed(0)}
                              </td>
                              <td className="p-3 text-center text-sm">
                                {((score.total / 160) * 100).toFixed(0)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card.Content>
                </Card>

                {/* Attendance and Conduct */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <Card.Header>
                      <Card.Title>Attendance Record</Card.Title>
                    </Card.Header>
                    <Card.Content>
                      <div className="space-y-4">
                        <FormField label="Days Present">
                          <Input
                            type="number"
                            min="0"
                            value={attendance.daysPresent}
                            onChange={(e) => setAttendance(prev => ({
                              ...prev,
                              daysPresent: parseInt(e.target.value) || 0
                            }))}
                          />
                        </FormField>
                        <FormField label="Days Absent">
                          <Input
                            type="number"
                            min="0"
                            value={attendance.daysAbsent}
                            onChange={(e) => setAttendance(prev => ({
                              ...prev,
                              daysAbsent: parseInt(e.target.value) || 0
                            }))}
                          />
                        </FormField>
                        <FormField label="Times Late">
                          <Input
                            type="number"
                            min="0"
                            value={attendance.timesLate}
                            onChange={(e) => setAttendance(prev => ({
                              ...prev,
                              timesLate: parseInt(e.target.value) || 0
                            }))}
                          />
                        </FormField>
                        <div className="pt-2 border-t">
                          <div className="text-sm text-gray-600">
                            Attendance Percentage: {
                              ((attendance.daysPresent / (attendance.daysPresent + attendance.daysAbsent) || 0) * 100).toFixed(1)
                            }%
                          </div>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Header>
                      <Card.Title>Conduct & Comments</Card.Title>
                    </Card.Header>
                    <Card.Content>
                      <div className="space-y-4">
                        <FormField label="Conduct Grade">
                          <select
                            value={conduct.grade}
                            onChange={(e) => setConduct(prev => ({
                              ...prev,
                              grade: e.target.value
                            }))}
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
                            value={conduct.teacherComment}
                            onChange={(e) => setConduct(prev => ({
                              ...prev,
                              teacherComment: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                            placeholder="Enter teacher's comment about the student's performance..."
                          />
                        </FormField>
                      </div>
                    </Card.Content>
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
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Result'}
                  </Button>
                </div>
              </div>
            ) : (
              <Card>
                <Card.Content className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <div className="text-lg font-medium">Select a student to enter results</div>
                    <div>Choose a student from the list on the left to begin entering their academic results</div>
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}