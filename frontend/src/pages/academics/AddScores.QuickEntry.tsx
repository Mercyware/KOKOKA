import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Save, 
  UserPlus, 
  Search, 
  Filter, 
  RefreshCw, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle,
  Clock,
  Zap,
  Users,
  Calculator
} from 'lucide-react';
import scoreService, { Assessment, Student, Grade, FormData } from '@/services/scoreService';

const AddScoresQuickEntry = () => {
  const navigate = useNavigate();
  // Form data from backend
  const [formData, setFormData] = useState<FormData | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [existingScores, setExistingScores] = useState<Grade[]>([]);
  
  // Selected values
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedAssessment, setSelectedAssessment] = useState('');
  
  // Quick entry state
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, { marksObtained: string; feedback: string; privateNotes: string }>>({});
  const [loading, setLoading] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [keyboardMode, setKeyboardMode] = useState(true);

  // Timing
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [entryTimes, setEntryTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    if ((selectedClass && selectedClass !== 'all-classes') || 
        (selectedSubject && selectedSubject !== 'all-subjects') || 
        (selectedAcademicYear && selectedAcademicYear !== 'all-years') || 
        (selectedTerm && selectedTerm !== 'all-terms')) {
      fetchAssessments();
    }
  }, [selectedClass, selectedSubject, selectedAcademicYear, selectedTerm]);

  useEffect(() => {
    if (selectedClass && selectedAcademicYear) {
      fetchStudents();
    }
  }, [selectedClass, selectedAcademicYear]);

  useEffect(() => {
    if (selectedAssessment) {
      const assessmentData = assessments.find(a => a.id === selectedAssessment);
      if (assessmentData) {
        setSelectedClass(assessmentData.class.id);
        setSelectedSubject(assessmentData.subject.id);
        setSelectedAcademicYear(assessmentData.academicYear.id);
        setSelectedTerm(assessmentData.term?.id || '');
      }
      fetchExistingScores();
      setStartTime(new Date());
    }
  }, [selectedAssessment]);

  // Keyboard navigation
  useEffect(() => {
    if (!keyboardMode) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement && e.target.type === 'number') return;
      
      switch (e.key) {
        case 'ArrowRight':
        case 'Tab':
          e.preventDefault();
          nextStudent();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          previousStudent();
          break;
        case 'Enter':
          if (e.ctrlKey) {
            e.preventDefault();
            handleSaveScores();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardMode, currentStudentIndex, students.length]);

  const fetchFormData = async () => {
    try {
      const data = await scoreService.getFormData();
      setFormData(data);
      
      // Auto-select current academic year if available
      // Note: Academic years don't have startDate/endDate in the current type
      // We'll select the first one for now
      if (data.academicYears.length > 0) {
        setSelectedAcademicYear(data.academicYears[0].id);
      }
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to load form data');
    }
  };

  const fetchAssessments = async () => {
    try {
      const params: {
        classId?: string;
        subjectId?: string;
        academicYearId?: string;
        termId?: string;
      } = {};
      
      if (selectedClass && selectedClass !== 'all-classes') params.classId = selectedClass;
      if (selectedSubject && selectedSubject !== 'all-subjects') params.subjectId = selectedSubject;
      if (selectedAcademicYear && selectedAcademicYear !== 'all-years') params.academicYearId = selectedAcademicYear;
      if (selectedTerm && selectedTerm !== 'all-terms') params.termId = selectedTerm;

      const data = await scoreService.getAssessments(params);
      setAssessments(data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
      toast.error('Failed to load assessments');
    }
  };

  const fetchStudents = async () => {
    try {
      const classId = selectedClass && selectedClass !== 'all-classes' ? selectedClass : '';
      const yearId = selectedAcademicYear && selectedAcademicYear !== 'all-years' ? selectedAcademicYear : '';
      const data = await scoreService.getStudentsInClass(classId, yearId);
      setStudents(data);
      setCurrentStudentIndex(0);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  const fetchExistingScores = async () => {
    try {
      const data = await scoreService.getScores(selectedAssessment);
      setExistingScores(data);
      
      // Populate scores object
      const scoresMap: Record<string, { marksObtained: string; feedback: string; privateNotes: string }> = {};
      data.forEach((score: Grade) => {
        if (score.student?.id) {
          scoresMap[score.student.id] = {
            marksObtained: score.marksObtained?.toString() || '',
            feedback: score.feedback || '',
            privateNotes: score.privateNotes || ''
          };
        }
      });
      setScores(scoresMap);
    } catch (error) {
      console.error('Error fetching existing scores:', error);
      toast.error('Failed to load existing scores');
    }
  };

  const nextStudent = () => {
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex(prev => prev + 1);
    }
  };

  const previousStudent = () => {
    if (currentStudentIndex > 0) {
      setCurrentStudentIndex(prev => prev - 1);
    }
  };

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    const newScores = { ...scores };
    if (!newScores[studentId]) {
      newScores[studentId] = { marksObtained: '', feedback: '', privateNotes: '' };
    }
    newScores[studentId] = { ...newScores[studentId], [field]: value };
    setScores(newScores);

    // Record entry time
    if (field === 'marksObtained' && value) {
      setEntryTimes(prev => ({
        ...prev,
        [studentId]: Date.now()
      }));
    }

    // Auto-save if enabled
    if (autoSave && field === 'marksObtained' && value) {
      setTimeout(() => {
        saveSingleScore(studentId);
      }, 1000);
    }
  };

  const saveSingleScore = async (studentId: string) => {
    const studentScore = scores[studentId];
    if (!studentScore?.marksObtained || !selectedAssessment) return;

    try {
      await scoreService.createOrUpdateScore({
        assessmentId: selectedAssessment,
        studentId,
        marksObtained: parseFloat(studentScore.marksObtained),
        feedback: studentScore.feedback,
        privateNotes: studentScore.privateNotes
      });
      
      toast.success('Score auto-saved', { duration: 1000 });
    } catch (error) {
      console.error('Error auto-saving score:', error);
    }
  };

  const handleSaveScores = async () => {
    if (!selectedAssessment) {
      toast.error('Please select an assessment');
      return;
    }

    const validScores = Object.entries(scores).filter(([, score]) => score.marksObtained && score.marksObtained !== '');
    
    if (validScores.length === 0) {
      toast.error('Please enter at least one score');
      return;
    }

    setLoading(true);
    try {
      const scoresData = validScores.map(([studentId, score]) => ({
        assessmentId: selectedAssessment,
        studentId,
        marksObtained: parseFloat(score.marksObtained),
        feedback: score.feedback,
        privateNotes: score.privateNotes
      }));

      await scoreService.bulkCreateOrUpdateScores({ scores: scoresData });
      toast.success(`Successfully saved ${validScores.length} scores`);
      
      fetchExistingScores();
    } catch (error) {
      console.error('Error saving scores:', error);
      toast.error('Failed to save scores');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (marks: number, total: number) => {
    const percentage = (marks / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  const currentStudent = students[currentStudentIndex];
  const currentScore = currentStudent ? scores[currentStudent.id] : null;
  const selectedAssessmentData = assessments.find(a => a.id === selectedAssessment);
  const scoredStudentsCount = Object.values(scores).filter(s => s.marksObtained && s.marksObtained !== '').length;
  const progressPercentage = students.length > 0 ? Math.round((scoredStudentsCount / students.length) * 100) : 0;
  const averageTime = Object.keys(entryTimes).length > 0 ? 
    Object.values(entryTimes).reduce((sum, time, index, arr) => {
      if (index === 0) return 0;
      return sum + (time - entryTimes[Object.keys(entryTimes)[index - 1]]);
    }, 0) / (Object.keys(entryTimes).length - 1) : 0;

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header with Quick Stats */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/academics/scores')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <Zap className="h-8 w-8 text-siohioma-orange" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Quick Score Entry</h1>
                <p className="text-muted-foreground">
                  Lightning-fast score entry with keyboard navigation
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/academics/scores/standard')}
              >
                Standard Entry
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/academics/scores/gradebook')}
              >
                Grade Book
              </Button>
            </div>
            {startTime && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Session: {Math.round((Date.now() - startTime.getTime()) / 1000 / 60)}min
              </div>
            )}
            <div className="flex items-center gap-2">
              <Label htmlFor="keyboard-mode" className="text-sm">Keyboard Mode</Label>
              <input 
                id="keyboard-mode"
                type="checkbox" 
                checked={keyboardMode} 
                onChange={(e) => setKeyboardMode(e.target.checked)}
                className="rounded"
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
              <input 
                id="auto-save"
                type="checkbox" 
                checked={autoSave} 
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded"
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-siohioma-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{scoredStudentsCount}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Calculator className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">{progressPercentage}%</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Time</p>
                <p className="text-2xl font-bold">
                  {averageTime > 0 ? `${Math.round(averageTime / 1000)}s` : '--'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        {students.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Overall Progress</div>
                <div className="text-sm text-muted-foreground">
                  {scoredStudentsCount} / {students.length} students
                </div>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Quick Setup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Class</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-classes">All Classes</SelectItem>
                    {formData?.classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-subjects">All Subjects</SelectItem>
                    {formData?.subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-years">All Years</SelectItem>
                    {formData?.academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-terms">All Terms</SelectItem>
                    {formData?.terms.map((term) => (
                      <SelectItem key={term.id} value={term.id}>
                        {term.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Select Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Assessment</Label>
                <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assessment to add scores" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        <div className="flex flex-col">
                          <span>{assessment.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {assessment.subject.name} • {assessment.class.name} • {assessment.type}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedAssessmentData && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Subject:</span> {selectedAssessmentData.subject.name}
                    </div>
                    <div>
                      <span className="font-medium">Class:</span> {selectedAssessmentData.class.name}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {selectedAssessmentData.type}
                    </div>
                    <div>
                      <span className="font-medium">Total Marks:</span> {selectedAssessmentData.totalMarks}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Entry Interface */}
        {currentStudent && selectedAssessmentData && (
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Quick Entry Mode
                  <Badge variant="outline">
                    Student {currentStudentIndex + 1} of {students.length}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={previousStudent}
                    disabled={currentStudentIndex === 0}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextStudent}
                    disabled={currentStudentIndex === students.length - 1}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Info */}
                <div className="space-y-4">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-siohioma-primary dark:text-siohioma-primary">
                      {currentStudent.user.name}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {currentStudent.user.email}
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Student #{currentStudentIndex + 1}
                    </div>
                  </div>
                  
                  {currentScore?.marksObtained && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm text-green-700 dark:text-green-300 mb-2">Current Score</div>
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                          {currentScore.marksObtained} / {selectedAssessmentData.totalMarks}
                        </div>
                        <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
                          {calculateGrade(parseFloat(currentScore.marksObtained), selectedAssessmentData.totalMarks)}
                        </Badge>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          {((parseFloat(currentScore.marksObtained) / selectedAssessmentData.totalMarks) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Score Entry */}
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="marks" className="text-lg">Marks Obtained</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="marks"
                        type="number"
                        placeholder="Enter marks..."
                        min={0}
                        max={selectedAssessmentData.totalMarks}
                        value={currentScore?.marksObtained || ''}
                        onChange={(e) => handleScoreChange(currentStudent.id, 'marksObtained', e.target.value)}
                        className="text-xl h-12 font-semibold"
                        autoFocus
                      />
                      <span className="text-lg text-muted-foreground font-medium">
                        / {selectedAssessmentData.totalMarks}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      onClick={nextStudent}
                      disabled={currentStudentIndex === students.length - 1}
                      className="h-12 text-lg"
                    >
                      Next Student <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleSaveScores}
                      disabled={loading}
                      className="h-12 text-lg"
                    >
                      <Save className="h-5 w-5 mr-2" />
                      {loading ? 'Saving...' : 'Save All Scores'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Students Summary List */}
        {students.length > 0 && selectedAssessmentData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {students.map((student, index) => {
                  const studentScore = scores[student.id];
                  const hasScore = studentScore?.marksObtained && studentScore.marksObtained !== '';
                  const isActive = index === currentStudentIndex;
                  
                  return (
                    <div
                      key={student.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isActive 
                          ? 'border-siohioma-primary bg-siohioma-primary/10 dark:bg-siohioma-primary/20' 
                          : hasScore 
                            ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setCurrentStudentIndex(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{student.user.name}</div>
                          <div className="text-xs text-muted-foreground">#{index + 1}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {hasScore ? (
                            <>
                              <Badge variant="outline" className="text-xs">
                                {studentScore.marksObtained}
                              </Badge>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            </>
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Keyboard Shortcuts */}
        {keyboardMode && (
          <Card className="bg-gray-50 dark:bg-gray-900">
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">
                <div className="font-medium mb-2">Keyboard Shortcuts:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>→ or Tab: Next student</div>
                  <div>← : Previous student</div>
                  <div>Ctrl + Enter: Save all scores</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No data states */}
        {!formData && (
          <Card>
            <CardContent className="text-center py-8">
              <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading form data...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AddScoresQuickEntry;
