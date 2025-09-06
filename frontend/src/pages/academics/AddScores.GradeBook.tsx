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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Save, 
  Search, 
  Filter, 
  RefreshCw,
  BookOpen,
  Calculator,
  TrendingUp,
  Users,
  GraduationCap,
  Settings,
  ArrowLeft,
  Download,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';
import scoreService, { Assessment, Student, Grade, FormData } from '@/services/scoreService';

const AddScoresGradeBook = () => {
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
  
  // Grade book state
  const [scores, setScores] = useState<Record<string, { marksObtained: string; feedback: string; privateNotes: string }>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [showPrivateNotes, setShowPrivateNotes] = useState(false);
  const [showStatistics, setShowStatistics] = useState(true);
  const [gradeScale, setGradeScale] = useState('percentage'); // 'percentage' | 'points' | 'letter'
  
  // Validation and editing
  const [editingCell, setEditingCell] = useState<{ studentId: string; field: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
    }
  }, [selectedAssessment]);

  const fetchFormData = async () => {
    try {
      const data = await scoreService.getFormData();
      setFormData(data);
      
      // Auto-select first academic year
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

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    // Validate marks
    if (field === 'marksObtained' && selectedAssessmentData) {
      const marks = parseFloat(value);
      if (value && (isNaN(marks) || marks < 0 || marks > selectedAssessmentData.totalMarks)) {
        setValidationErrors(prev => ({
          ...prev,
          [studentId]: `Marks must be between 0 and ${selectedAssessmentData.totalMarks}`
        }));
        return;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[studentId];
          return newErrors;
        });
      }
    }

    const newScores = { ...scores };
    if (!newScores[studentId]) {
      newScores[studentId] = { marksObtained: '', feedback: '', privateNotes: '' };
    }
    newScores[studentId] = { ...newScores[studentId], [field]: value };
    setScores(newScores);
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

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'B+':
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'C+':
      case 'C': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'D': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'F': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const calculateStatistics = () => {
    const validScores = Object.values(scores)
      .filter(s => s.marksObtained && s.marksObtained !== '')
      .map(s => parseFloat(s.marksObtained));

    if (validScores.length === 0) {
      return { average: 0, highest: 0, lowest: 0, passed: 0, failed: 0 };
    }

    const average = validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
    const highest = Math.max(...validScores);
    const lowest = Math.min(...validScores);
    
    const totalMarks = selectedAssessmentData?.totalMarks || 100;
    const passingMarks = selectedAssessmentData?.passingMarks || 40;
    
    const passed = validScores.filter(score => score >= passingMarks).length;
    const failed = validScores.length - passed;

    return { average, highest, lowest, passed, failed, total: validScores.length };
  };

  // Filter students based on search
  const filteredStudents = students.filter(student =>
    student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedAssessmentData = assessments.find(a => a.id === selectedAssessment);
  const statistics = calculateStatistics();

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate('/academics/scores')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <BookOpen className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Grade Book</h1>
                <p className="text-muted-foreground">
                  Traditional gradebook interface for score entry
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
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
                onClick={() => navigate('/academics/scores/quick-entry')}
              >
                Quick Entry
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatistics(!showStatistics)}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {showStatistics ? 'Hide Stats' : 'Show Stats'}
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  View Options
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Grade Book Display Options</DialogTitle>
                  <DialogDescription>
                    Customize what information is displayed in the grade book.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Show Feedback Column</Label>
                    <input 
                      type="checkbox" 
                      checked={showFeedback} 
                      onChange={(e) => setShowFeedback(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Show Private Notes Column</Label>
                    <input 
                      type="checkbox" 
                      checked={showPrivateNotes} 
                      onChange={(e) => setShowPrivateNotes(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Grade Display</Label>
                    <Select value={gradeScale} onValueChange={setGradeScale}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="points">Points</SelectItem>
                        <SelectItem value="letter">Letter Grade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics Cards */}
        {showStatistics && selectedAssessmentData && (statistics.total ?? 0) > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.average.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Average Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.highest}
                </div>
                <div className="text-sm text-muted-foreground">Highest Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {statistics.lowest}
                </div>
                <div className="text-sm text-muted-foreground">Lowest Score</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.passed}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {statistics.failed}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filter & Setup
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
              <GraduationCap className="h-5 w-5" />
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

        {/* Grade Book Table */}
        {filteredStudents.length > 0 && selectedAssessmentData && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Grade Book
                  <Badge variant="outline">
                    {filteredStudents.length} Students
                  </Badge>
                </CardTitle>
                
                <div className="flex items-center gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  {/* Save Button */}
                  <Button
                    onClick={handleSaveScores}
                    disabled={loading || Object.values(scores).every(s => !s.marksObtained)}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Scores'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="font-semibold">Student</TableHead>
                      <TableHead className="text-center font-semibold w-32">
                        Score ({selectedAssessmentData.totalMarks} pts)
                      </TableHead>
                      <TableHead className="text-center font-semibold w-24">Grade</TableHead>
                      <TableHead className="text-center font-semibold w-20">%</TableHead>
                      {showFeedback && <TableHead className="font-semibold w-48">Feedback</TableHead>}
                      {showPrivateNotes && <TableHead className="font-semibold w-48">Private Notes</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => {
                      const studentScore = scores[student.id];
                      const marksObtained = studentScore?.marksObtained ? parseFloat(studentScore.marksObtained) : 0;
                      const grade = marksObtained > 0 ? calculateGrade(marksObtained, selectedAssessmentData.totalMarks) : '';
                      const percentage = marksObtained > 0 ? ((marksObtained / selectedAssessmentData.totalMarks) * 100).toFixed(1) : '';
                      const isPassing = marksObtained >= selectedAssessmentData.passingMarks;

                      return (
                        <TableRow 
                          key={student.id}
                          className={`${index % 2 === 0 ? 'bg-muted/20' : ''} hover:bg-muted/40`}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium">{student.user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {student.user.email}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center">
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="0"
                                min={0}
                                max={selectedAssessmentData.totalMarks}
                                value={studentScore?.marksObtained || ''}
                                onChange={(e) => handleScoreChange(student.id, 'marksObtained', e.target.value)}
                                className={`text-center font-semibold ${validationErrors[student.id] ? 'border-red-500 bg-red-50' : ''}`}
                                onFocus={() => setEditingCell({ studentId: student.id, field: 'marksObtained' })}
                                onBlur={() => setEditingCell(null)}
                              />
                              {validationErrors[student.id] && (
                                <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 z-10 whitespace-nowrap">
                                  {validationErrors[student.id]}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell className="text-center">
                            {grade && (
                              <Badge className={`${getGradeColor(grade)} font-semibold`}>
                                {grade}
                              </Badge>
                            )}
                          </TableCell>
                          
                          <TableCell className="text-center">
                            {percentage && (
                              <div className={`font-semibold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                                {percentage}%
                              </div>
                            )}
                          </TableCell>
                          
                          {showFeedback && (
                            <TableCell>
                              <Textarea
                                placeholder="Feedback..."
                                value={studentScore?.feedback || ''}
                                onChange={(e) => handleScoreChange(student.id, 'feedback', e.target.value)}
                                className="min-h-[60px] text-sm"
                                rows={2}
                              />
                            </TableCell>
                          )}
                          
                          {showPrivateNotes && (
                            <TableCell>
                              <Textarea
                                placeholder="Private notes..."
                                value={studentScore?.privateNotes || ''}
                                onChange={(e) => handleScoreChange(student.id, 'privateNotes', e.target.value)}
                                className="min-h-[60px] text-sm"
                                rows={2}
                              />
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Summary Bar */}
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">Summary:</span> {' '}
                    {Object.values(scores).filter(s => s.marksObtained).length} of {filteredStudents.length} students scored
                  </div>
                  {(statistics.total ?? 0) > 0 && (
                    <div className="flex items-center gap-4">
                      <div>Class Average: <span className="font-semibold">{statistics.average.toFixed(1)}</span></div>
                      <div>Pass Rate: <span className="font-semibold">{(((statistics.passed) / (statistics.total ?? 1)) * 100).toFixed(1)}%</span></div>
                    </div>
                  )}
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
        
        {formData && assessments.length === 0 && (selectedClass || selectedSubject || selectedAcademicYear || selectedTerm) && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No assessments found for the selected filters</p>
              <Button variant="outline" onClick={() => {
                setSelectedClass('');
                setSelectedSubject('');
                setSelectedAcademicYear('');
                setSelectedTerm('');
              }} className="mt-2">
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AddScoresGradeBook;
