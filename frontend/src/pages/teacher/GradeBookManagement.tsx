import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Users,
  TrendingUp,
  Award,
  Calendar,
  Edit,
  Save,
  X,
  BarChart3,
  FileText,
  Download,
  Eye
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface GradeBook {
  id: string;
  name: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  class: {
    id: string;
    name: string;
    grade: string;
  };
  academicYear: {
    id: string;
    name: string;
    isCurrent: boolean;
  };
  term?: {
    id: string;
    name: string;
  };
  totalStudents: number;
  averageGrade?: number;
  status: string;
  isLocked: boolean;
  _count: {
    gradeEntries: number;
  };
}

interface GradeEntry {
  id: string;
  student: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
  };
  rawScore?: number;
  maxScore?: number;
  percentage?: number;
  letterGrade?: string;
  gradePoint?: number;
  category?: string;
  feedback?: string;
  gradedAt?: string;
  isExcused: boolean;
  assessment?: {
    id: string;
    title: string;
    type: string;
  };
}

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  status: string;
}

const GradeBookManagement: React.FC = () => {
  const [gradeBooks, setGradeBooks] = useState<GradeBook[]>([]);
  const [selectedGradeBook, setSelectedGradeBook] = useState<GradeBook | null>(null);
  const [gradeEntries, setGradeEntries] = useState<GradeEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [newGradeData, setNewGradeData] = useState<any>({});
  const [showAddGradeDialog, setShowAddGradeDialog] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchGradeBooks();
  }, []);

  const fetchGradeBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/gradebooks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
        },
      });

      if (!response.ok) throw new Error('Failed to fetch grade books');

      const data = await response.json();
      setGradeBooks(data.data);
    } catch (error) {
      console.error('Error fetching grade books:', error);
      toast({
        title: "Error",
        description: "Failed to fetch grade books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeBookDetails = async (gradeBookId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/gradebooks/${gradeBookId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
        },
      });

      if (!response.ok) throw new Error('Failed to fetch grade book details');

      const data = await response.json();
      const gradeBook = data.data;
      
      setSelectedGradeBook(gradeBook);
      setGradeEntries(gradeBook.gradeEntries || []);
      setStudents(gradeBook.class?.students || []);
      
      // Fetch analytics
      fetchAnalytics(gradeBookId);
    } catch (error) {
      console.error('Error fetching grade book details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch grade book details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (gradeBookId: string) => {
    try {
      const response = await fetch(`/api/gradebooks/${gradeBookId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
        },
      });

      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleAddGrade = async () => {
    if (!selectedGradeBook || !newGradeData.studentId) {
      toast({
        title: "Error",
        description: "Please select a student and enter grade data.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/gradebooks/${selectedGradeBook.id}/grades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
        },
        body: JSON.stringify(newGradeData),
      });

      if (!response.ok) throw new Error('Failed to add grade');

      const result = await response.json();
      
      setGradeEntries([result.data, ...gradeEntries]);
      setShowAddGradeDialog(false);
      setNewGradeData({});
      
      toast({
        title: "Success",
        description: "Grade added successfully.",
      });

      // Refresh analytics
      fetchAnalytics(selectedGradeBook.id);
    } catch (error) {
      console.error('Error adding grade:', error);
      toast({
        title: "Error",
        description: "Failed to add grade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGrade = async (gradeEntryId: string, updateData: any) => {
    if (!selectedGradeBook) return;

    try {
      const response = await fetch(
        `/api/gradebooks/${selectedGradeBook.id}/grades/${gradeEntryId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) throw new Error('Failed to update grade');

      const result = await response.json();
      
      setGradeEntries(gradeEntries.map(entry => 
        entry.id === gradeEntryId ? result.data : entry
      ));
      
      setEditingEntry(null);
      
      toast({
        title: "Success",
        description: "Grade updated successfully.",
      });

      // Refresh analytics
      fetchAnalytics(selectedGradeBook.id);
    } catch (error) {
      console.error('Error updating grade:', error);
      toast({
        title: "Error",
        description: "Failed to update grade. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getGradeColor = (percentage: number | null) => {
    if (percentage === null) return 'text-gray-500';
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 70) return 'text-yellow-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredGradeBooks = gradeBooks.filter(book => {
    const matchesSearch = 
      book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.class.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || book.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Group grade entries by student
  const studentGrades = students.reduce((acc, student) => {
    acc[student.id] = {
      student,
      grades: gradeEntries.filter(entry => entry.student.id === student.id)
    };
    return acc;
  }, {} as Record<string, { student: Student; grades: GradeEntry[] }>);

  if (!selectedGradeBook) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Book Management</h1>
            <p className="text-gray-600 mt-2">Manage your class grades and assessments</p>
          </div>
          <Button 
            onClick={() => navigate('/teacher/gradebooks/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Grade Book
          </Button>
        </div>

        {/* Statistics Cards */}
        {gradeBooks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Grade Books</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gradeBooks.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active grade books
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gradeBooks.reduce((sum, book) => sum + book.totalStudents, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all classes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {gradeBooks.reduce((sum, book) => sum + book._count.gradeEntries, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Grade entries recorded
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(
                    gradeBooks
                      .filter(book => book.averageGrade)
                      .reduce((sum, book) => sum + (book.averageGrade || 0), 0) / 
                    Math.max(gradeBooks.filter(book => book.averageGrade).length, 1)
                  )}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all subjects
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
            <CardDescription>Find your grade books</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search grade books..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="LOCKED">Locked</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Grade Books List */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Books ({filteredGradeBooks.length})</CardTitle>
            <CardDescription>Your current grade books</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading grade books...</p>
                </div>
              </div>
            ) : filteredGradeBooks.length === 0 ? (
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertDescription>
                  No grade books found. Create your first grade book to get started.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {filteredGradeBooks.map((gradeBook) => (
                  <div
                    key={gradeBook.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => fetchGradeBookDetails(gradeBook.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{gradeBook.name}</h3>
                        <Badge variant={gradeBook.isLocked ? "destructive" : "default"}>
                          {gradeBook.status}
                        </Badge>
                        {gradeBook.isLocked && (
                          <Badge variant="outline">Locked</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-4">
                          <span><strong>Subject:</strong> {gradeBook.subject.name}</span>
                          <span><strong>Class:</strong> {gradeBook.class.name} ({gradeBook.class.grade})</span>
                          <span><strong>Academic Year:</strong> {gradeBook.academicYear.name}</span>
                          {gradeBook.term && (
                            <span><strong>Term:</strong> {gradeBook.term.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span>{gradeBook.totalStudents} students</span>
                          <span>{gradeBook._count.gradeEntries} grade entries</span>
                          {gradeBook.averageGrade && (
                            <span className={getGradeColor(gradeBook.averageGrade)}>
                              Average: {gradeBook.averageGrade.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </Layout>
    );
  }

  // Grade Book Details View
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedGradeBook(null)}
          >
            ← Back to Grade Books
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedGradeBook.name}</h1>
            <p className="text-gray-600 mt-1">
              {selectedGradeBook.subject.name} • {selectedGradeBook.class.name} • {selectedGradeBook.academicYear.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showAddGradeDialog} onOpenChange={setShowAddGradeDialog}>
            <DialogTrigger asChild>
              <Button disabled={selectedGradeBook.isLocked}>
                <Plus className="h-4 w-4 mr-2" />
                Add Grade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Grade</DialogTitle>
                <DialogDescription>
                  Add a grade entry for a student in this grade book.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="student">Student</Label>
                  <Select 
                    value={newGradeData.studentId || ''} 
                    onValueChange={(value) => setNewGradeData({...newGradeData, studentId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName} ({student.admissionNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="rawScore">Score Obtained</Label>
                    <Input
                      id="rawScore"
                      type="number"
                      step="0.1"
                      value={newGradeData.rawScore || ''}
                      onChange={(e) => setNewGradeData({...newGradeData, rawScore: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxScore">Total Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      step="0.1"
                      value={newGradeData.maxScore || ''}
                      onChange={(e) => setNewGradeData({...newGradeData, maxScore: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newGradeData.category || ''} 
                    onValueChange={(value) => setNewGradeData({...newGradeData, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Quiz">Quiz</SelectItem>
                      <SelectItem value="Test">Test</SelectItem>
                      <SelectItem value="Exam">Exam</SelectItem>
                      <SelectItem value="Assignment">Assignment</SelectItem>
                      <SelectItem value="Project">Project</SelectItem>
                      <SelectItem value="Participation">Participation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Optional feedback for the student"
                    value={newGradeData.feedback || ''}
                    onChange={(e) => setNewGradeData({...newGradeData, feedback: e.target.value})}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button intent="cancel" onClick={() => setShowAddGradeDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGrade}>
                  Add Grade
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Reports
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getGradeColor(analytics.averageGrade)}`}>
                {analytics.averageGrade}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalEntries}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-semibold text-green-600">
                {analytics.topPerformers?.[0]?.student.firstName} {analytics.topPerformers?.[0]?.student.lastName}
              </div>
              <div className="text-xs text-gray-500">
                {analytics.topPerformers?.[0]?.percentage}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(analytics.distribution || {}).map(([grade, count]) => (
                  <div key={grade} className="flex justify-between text-xs">
                    <span>{grade}:</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>
            Grade entries for {selectedGradeBook.totalStudents} students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                No students found in this class.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Admission #</TableHead>
                    <TableHead>Grades Count</TableHead>
                    <TableHead>Average</TableHead>
                    <TableHead>Latest Grade</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(studentGrades).map(({ student, grades }) => {
                    const average = grades.length > 0 
                      ? grades
                          .filter(g => g.percentage !== null)
                          .reduce((sum, g) => sum + (g.percentage || 0), 0) / 
                        Math.max(grades.filter(g => g.percentage !== null).length, 1)
                      : 0;
                    
                    const latestGrade = grades
                      .filter(g => g.gradedAt)
                      .sort((a, b) => new Date(b.gradedAt!).getTime() - new Date(a.gradedAt!).getTime())[0];

                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>{student.admissionNumber}</TableCell>
                        <TableCell>{grades.length}</TableCell>
                        <TableCell>
                          <span className={getGradeColor(average)}>
                            {average > 0 ? `${average.toFixed(1)}%` : '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {latestGrade ? (
                            <div>
                              <span className={getGradeColor(latestGrade.percentage)}>
                                {latestGrade.percentage?.toFixed(1)}%
                              </span>
                              {latestGrade.letterGrade && (
                                <Badge variant="outline" className="ml-2">
                                  {latestGrade.letterGrade}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">No grades</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setNewGradeData({ studentId: student.id });
                                setShowAddGradeDialog(true);
                              }}
                              disabled={selectedGradeBook.isLocked}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
};

export default GradeBookManagement;