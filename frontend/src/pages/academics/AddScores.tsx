import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Form,
  FormSection,
  FormField,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
  Badge,
  Label,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';
import { toast } from 'sonner';
import { Upload, Download, Save, UserPlus, Search, Filter, RefreshCw, ArrowLeft } from 'lucide-react';
import scoreService, { Assessment, Student, Grade, FormData } from '@/services/scoreService';

const AddScores = () => {
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
  
  // Score data
  const [scores, setScores] = useState<Record<string, { marksObtained: string; feedback: string; privateNotes: string }>>({});
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
  // CSV Upload
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  useEffect(() => {
    fetchFormData();
  }, []);

  useEffect(() => {
    if (selectedClass || selectedSubject || selectedAcademicYear || selectedTerm) {
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
      // Auto-populate class and academic year from selected assessment
      const assessmentData = assessments.find(a => a.id === selectedAssessment);
      if (assessmentData) {
        setSelectedClass(assessmentData.classId);
        setSelectedSubject(assessmentData.subjectId);
        setSelectedAcademicYear(assessmentData.academicYearId);
        setSelectedTerm(assessmentData.termId);
      }
      fetchExistingScores();
    }
  }, [selectedAssessment, assessments]);

  const fetchFormData = async () => {
    try {
      const data = await scoreService.getFormData();
      setFormData(data);
    } catch (error) {
      console.error('Error fetching form data:', error);
      toast.error('Failed to fetch form data');
    }
  };

  const fetchAssessments = async () => {
    try {
      const params: any = {};
      if (selectedClass) params.classId = selectedClass;
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedAcademicYear) params.academicYearId = selectedAcademicYear;
      if (selectedTerm) params.termId = selectedTerm;

      console.log('Fetching assessments with params:', params);
      const data = await scoreService.getAssessments(params);
      console.log('Assessments received:', data);
      setAssessments(Array.isArray(data) ? data : []);

      if (!data || data.length === 0) {
        console.log('No assessments found with current filters');
      }
    } catch (error) {
      console.error('Error fetching assessments:', error);
      setAssessments([]);
      toast.error('Failed to fetch assessments');
    }
  };

  const fetchStudents = async () => {
    if (!selectedClass || !selectedAcademicYear) return;
    
    try {
      const data = await scoreService.getStudentsInClass(selectedClass, selectedAcademicYear);
      setStudents(data);
      
      // Initialize scores object for all students
      const initialScores: Record<string, { marksObtained: string; feedback: string; privateNotes: string }> = {};
      data.forEach(student => {
        initialScores[student.id] = {
          marksObtained: '',
          feedback: '',
          privateNotes: ''
        };
      });
      setScores(initialScores);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setScores({});
      toast.error('Failed to fetch students');
    }
  };

  const fetchExistingScores = async () => {
    if (!selectedAssessment) return;
    
    try {
      const data = await scoreService.getScores(selectedAssessment);
      setExistingScores(data);
      
      // Merge existing scores with current scores
      const updatedScores = { ...scores };
      data.forEach(score => {
        if (score.student && updatedScores[score.student.id]) {
          updatedScores[score.student.id] = {
            marksObtained: score.marksObtained.toString(),
            feedback: score.feedback || '',
            privateNotes: score.privateNotes || ''
          };
        }
      });
      setScores(updatedScores);
    } catch (error) {
      console.error('Error fetching existing scores:', error);
      setExistingScores([]);
    }
  };

  const handleScoreChange = (studentId: string, field: 'marksObtained' | 'feedback' | 'privateNotes', value: string) => {
    // Validate marks if it's the marksObtained field
    if (field === 'marksObtained' && value !== '') {
      const numericValue = parseFloat(value);
      const totalMarks = selectedAssessmentData?.totalMarks || 0;
      
      if (isNaN(numericValue)) {
        setValidationErrors(prev => ({
          ...prev,
          [studentId]: 'Please enter a valid number'
        }));
      } else if (numericValue < 0) {
        setValidationErrors(prev => ({
          ...prev,
          [studentId]: 'Marks cannot be negative'
        }));
      } else if (numericValue > totalMarks) {
        setValidationErrors(prev => ({
          ...prev,
          [studentId]: `Marks cannot exceed ${totalMarks}`
        }));
        toast.error(`Marks cannot exceed ${totalMarks} for this assessment`);
        return; // Don't update state if validation fails
      } else {
        // Clear any existing validation errors for this student
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[studentId];
          return newErrors;
        });
      }
    }

    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const calculateGrade = (marksObtained: number, totalMarks: number) => {
    const percentage = (marksObtained / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
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
      
      // Refresh existing scores
      fetchExistingScores();
    } catch (error) {
      console.error('Error saving scores:', error);
      toast.error('Failed to save scores');
    } finally {
      setLoading(false);
    }
  };

  const handleCSVUpload = async () => {
    if (!csvFile || !selectedAssessment) {
      toast.error('Please select a CSV file and assessment');
      return;
    }

    setLoading(true);
    try {
      await scoreService.uploadScoresCSV(csvFile, selectedAssessment);
      toast.success('CSV uploaded successfully');
      setShowUploadDialog(false);
      setCsvFile(null);
      
      // Refresh data
      fetchExistingScores();
      fetchStudents();
    } catch (error) {
      console.error('Error uploading CSV:', error);
      toast.error('Failed to upload CSV');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ['studentId', 'studentName', 'marksObtained', 'feedback', 'privateNotes'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => 
        `${student.id},"${student.user?.name || 'Unknown Student'}","","",""`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scores_template_${selectedAssessment || 'assessment'}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter and paginate students
  const filteredStudents = students.filter(student => 
    student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredStudents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + pageSize);
  
  // Calculate progress statistics
  const scoredStudentsCount = Object.values(scores).filter(s => s.marksObtained && s.marksObtained !== '').length;
  const progressPercentage = students.length > 0 ? Math.round((scoredStudentsCount / students.length) * 100) : 0;

  const selectedAssessmentData = assessments.find(a => a.id === selectedAssessment);

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/academics/scores')}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Standard Score Entry</h1>
              <p className="text-muted-foreground">
                Complete score management with full features
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/academics/scores/quick-entry')}
            >
              Quick Entry
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/academics/scores/gradebook')}
            >
              Grade Book
            </Button>
          </div>
          {students.length > 0 && (
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          )}
          
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Scores via CSV</DialogTitle>
                <DialogDescription>
                  Upload a CSV file with student scores. Download the template first for the correct format.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="csvFile">Select CSV File</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowUploadDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCSVUpload}
                  disabled={!csvFile || !selectedAssessment || loading}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
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

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Assessments
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
              <div className="flex items-center justify-between">
                <Label>Assessment</Label>
                {assessments.length === 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Clear filters and fetch all assessments
                      setSelectedClass('');
                      setSelectedSubject('');
                      setSelectedAcademicYear('');
                      setSelectedTerm('');
                      fetchAssessments();
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Load All Assessments
                  </Button>
                )}
              </div>
              <Select
                value={selectedAssessment}
                onValueChange={setSelectedAssessment}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    assessments.length === 0
                      ? "No assessments found - try clearing filters or creating one"
                      : "Select assessment to add scores"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {assessments.length > 0 ? (
                    assessments.map((assessment) => (
                      <SelectItem key={assessment.id} value={assessment.id}>
                        <div className="flex flex-col">
                          <span>{assessment.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {(assessment.subject?.name || '-')} • {(assessment.class?.name || '-')} • {(assessment.type || '-')}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No assessments available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {assessments.length === 0 && (
                <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md border border-amber-200">
                  No assessments found with current filters. Try selecting different filters above or create a new assessment.
                </p>
              )}
            </div>
            
            {selectedAssessmentData && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
<div>
  <span className="font-medium">Subject:</span> {selectedAssessmentData.subject?.name || '-'}
</div>
<div>
  <span className="font-medium">Class:</span> {selectedAssessmentData.class?.name || '-'}
</div>
<div>
  <span className="font-medium">Type:</span> {selectedAssessmentData.type || '-'}
</div>
<div>
  <span className="font-medium">Total Marks:</span> {selectedAssessmentData.totalMarks ?? '-'}
</div>
                </div>
{selectedAssessmentData.description && (
  <p className="mt-2 text-sm text-muted-foreground">
    {selectedAssessmentData.description}
  </p>
)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Students and Scores */}
      {students.length > 0 && selectedAssessmentData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                <CardTitle>Students & Scores</CardTitle>
                <Badge variant="outline">
                  {filteredStudents.length} of {students.length} Students
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="text-muted-foreground">Progress:</div>
                  <StatusBadge 
                    variant={progressPercentage === 100 ? "success" : progressPercentage > 50 ? "warning" : "info"}
                  >
                    {scoredStudentsCount}/{students.length} ({progressPercentage}%)
                  </StatusBadge>
                </div>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="flex items-center gap-4 pt-4">
              <div className="relative flex-1 max-w-sm">
                <Input
                  placeholder="Search students by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  leftIcon={<Search />}
                />
              </div>
              <Select value={viewMode} onValueChange={(value: 'table' | 'cards') => setViewMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table View</SelectItem>
                  <SelectItem value="cards">Cards View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {viewMode === 'table' ? (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="w-32">Marks</TableHead>
                        <TableHead className="w-24">Grade</TableHead>
                        <TableHead className="w-24">%</TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedStudents.map((student) => {
                        const studentScore = scores[student.id];
                        const marksObtained = studentScore?.marksObtained ? parseFloat(studentScore.marksObtained) : 0;
                        const grade = marksObtained > 0 ? calculateGrade(marksObtained, selectedAssessmentData.totalMarks) : '';
                        const percentage = marksObtained > 0 ? ((marksObtained / selectedAssessmentData.totalMarks) * 100).toFixed(1) : '';

                        return (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{student.user.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {student.admissionNumber} • {student.user.email}
                                </div>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    min={0}
                                    max={selectedAssessmentData.totalMarks}
                                    value={studentScore?.marksObtained || ''}
                                    onChange={(e) => handleScoreChange(student.id, 'marksObtained', e.target.value)}
                                    className={`w-16 h-8 ${validationErrors[student.id] ? 'border-red-500 bg-red-50' : ''}`}
                                  />
                                  {validationErrors[student.id] && (
                                    <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 z-10 whitespace-nowrap">
                                      {validationErrors[student.id]}
                                    </div>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  /{selectedAssessmentData.totalMarks}
                                </span>
                              </div>
                            </TableCell>
                            
                            <TableCell>
                              {grade && (
                                <StatusBadge 
                                  variant={marksObtained >= (selectedAssessmentData.passingMarks || 50) ? "success" : "danger"} 
                                  className="text-xs"
                                >
                                  {grade}
                                </StatusBadge>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              {percentage && (
                                <span className="text-sm font-medium">{percentage}%</span>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              <Input
                                placeholder="Feedback..."
                                value={studentScore?.feedback || ''}
                                onChange={(e) => handleScoreChange(student.id, 'feedback', e.target.value)}
                                className="h-8"
                              />
                            </TableCell>
                            
                            <TableCell>
                              <Input
                                placeholder="Notes..."
                                value={studentScore?.privateNotes || ''}
                                onChange={(e) => handleScoreChange(student.id, 'privateNotes', e.target.value)}
                                className="h-8"
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredStudents.length)} of {filteredStudents.length} students
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                        if (page <= totalPages) {
                          return (
                            <Button
                              key={page}
                              intent={currentPage === page ? "primary" : "secondary"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        }
                        return null;
                      })}
                      
                      <Button
                        intent="secondary"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Card View for backward compatibility */
              <div className="space-y-4">
                {paginatedStudents.map((student) => {
                  const studentScore = scores[student.id];
                  const marksObtained = studentScore?.marksObtained ? parseFloat(studentScore.marksObtained) : 0;
                  const grade = marksObtained > 0 ? calculateGrade(marksObtained, selectedAssessmentData.totalMarks) : '';
                  const percentage = marksObtained > 0 ? ((marksObtained / selectedAssessmentData.totalMarks) * 100).toFixed(1) : '';

                  return (
                    <div key={student.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start p-4 border rounded-lg">
                      <div className="lg:col-span-3">
                        <div className="font-medium">{student.user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.user.email}
                        </div>
                        {student.studentClassHistory.length > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Class: {student.studentClassHistory[0].class?.name || '-'}
                          </div>
                        )}
                      </div>
                      
                      <div className="lg:col-span-2">
                        <Label className="text-xs">Marks Obtained</Label>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder="0"
                              min={0}
                              max={selectedAssessmentData.totalMarks}
                              value={studentScore?.marksObtained || ''}
                              onChange={(e) => handleScoreChange(student.id, 'marksObtained', e.target.value)}
                              className={`w-20 ${validationErrors[student.id] ? 'border-red-500 bg-red-50' : ''}`}
                            />
                            {validationErrors[student.id] && (
                              <div className="absolute top-full left-0 mt-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 z-10 whitespace-nowrap">
                                {validationErrors[student.id]}
                              </div>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            / {selectedAssessmentData.totalMarks}
                          </span>
                        </div>
                      </div>
                      
                      {marksObtained > 0 && (
                        <div className="lg:col-span-2">
                          <Label className="text-xs">Grade & Percentage</Label>
                          <div className="flex items-center gap-2">
                            <StatusBadge variant={marksObtained >= (selectedAssessmentData.passingMarks || 50) ? "success" : "danger"}>
                              {grade}
                            </StatusBadge>
                            <span className="text-sm text-muted-foreground font-medium">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {!marksObtained && <div className="lg:col-span-2"></div>}
                      
                      <div className="lg:col-span-3">
                        <Label className="text-xs">Feedback</Label>
                        <Textarea
                          placeholder="Student feedback (optional)"
                          value={studentScore?.feedback || ''}
                          onChange={(e) => handleScoreChange(student.id, 'feedback', e.target.value)}
                          rows={2}
                        />
                      </div>
                      
                      <div className="lg:col-span-2">
                        <Label className="text-xs">Private Notes</Label>
                        <Textarea
                          placeholder="Private notes (optional)"
                          value={studentScore?.privateNotes || ''}
                          onChange={(e) => handleScoreChange(student.id, 'privateNotes', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  );
                })}
                
                {/* Pagination for cards view */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 pt-4">
                    <Button
                      intent="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <span className="text-sm text-muted-foreground font-medium">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <Button
                      intent="secondary"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Progress Summary */}
            {scoredStudentsCount > 0 && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="font-medium">Progress Summary:</span> {' '}
                    {scoredStudentsCount} of {students.length} students have scores entered
                  </div>
                  {progressPercentage === 100 && (
                    <StatusBadge variant="success" className="bg-green-600">
                      Complete ✓
                    </StatusBadge>
                  )}
                </div>
                
                {/* Progress Bar */}
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}
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
            <Button 
              intent="secondary" 
              onClick={() => {
                setSelectedClass('');
                setSelectedSubject('');
                setSelectedAcademicYear('');
                setSelectedTerm('');
              }} 
              className="mt-2"
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
      
      {formData && !selectedAssessment && assessments.length > 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Please select an assessment to add scores</p>
          </CardContent>
        </Card>
      )}
      
      {selectedAssessment && students.length === 0 && (!selectedClass || !selectedAcademicYear) && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Please select both class and academic year to load students</p>
          </CardContent>
        </Card>
      )}
      
      {selectedAssessment && selectedClass && selectedAcademicYear && students.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No students found for this class and academic year</p>
          </CardContent>
        </Card>
      )}
    </div>
    </Layout>
  );
};

export default AddScores;
