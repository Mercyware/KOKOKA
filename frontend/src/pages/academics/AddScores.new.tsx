import React, { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Upload, Download, Save, UserPlus, Search, Filter, RefreshCw } from 'lucide-react';
import scoreService, { Assessment, Student, Grade, FormData } from '@/services/scoreService';

const AddScores = () => {
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
      fetchExistingScores();
    }
  }, [selectedAssessment]);

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

      const data = await scoreService.getAssessments(params);
      setAssessments(data);
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
    const headers = ['studentId', 'marksObtained', 'feedback', 'privateNotes'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => 
        `${student.id},"","",""`
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

  const selectedAssessmentData = assessments.find(a => a.id === selectedAssessment);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Scores</h1>
          <p className="text-muted-foreground">
            Enter and manage student assessment scores
          </p>
        </div>
        
        <div className="flex gap-2">
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
                  <SelectItem value="">All Classes</SelectItem>
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
                  <SelectItem value="">All Subjects</SelectItem>
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
                  <SelectItem value="">All Years</SelectItem>
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
                  <SelectItem value="">All Terms</SelectItem>
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
              <Select 
                value={selectedAssessment} 
                onValueChange={setSelectedAssessment}
              >
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
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Students & Scores
              <Badge variant="outline">
                {students.length} Students
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map((student) => {
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
                          Section: {student.studentClassHistory[0].section.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="lg:col-span-2">
                      <Label className="text-xs">Marks Obtained</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="0"
                          min={0}
                          max={selectedAssessmentData.totalMarks}
                          value={studentScore?.marksObtained || ''}
                          onChange={(e) => handleScoreChange(student.id, 'marksObtained', e.target.value)}
                          className="w-20"
                        />
                        <span className="text-sm text-muted-foreground">
                          / {selectedAssessmentData.totalMarks}
                        </span>
                      </div>
                    </div>
                    
                    {marksObtained > 0 && (
                      <div className="lg:col-span-2">
                        <Label className="text-xs">Grade & Percentage</Label>
                        <div className="flex items-center gap-2">
                          <Badge variant={marksObtained >= selectedAssessmentData.passingMarks ? "default" : "destructive"}>
                            {grade}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
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
            </div>
            
            {Object.values(scores).filter(s => s.marksObtained).length > 0 && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="text-sm">
                  <span className="font-medium">Summary:</span> {' '}
                  {Object.values(scores).filter(s => s.marksObtained).length} of {students.length} students have scores entered
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
  );
};

export default AddScores;
