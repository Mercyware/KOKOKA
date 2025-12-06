/**
 * TODO LIST:
 * - [x] Analyze requirements (reference UI)
 * - [ ] Review AttendanceEntry.tsx for current UI
 * - [ ] Review AttendanceReports.tsx for current UI
 * - [ ] Update global styles and Tailwind config
 * - [ ] Refactor components to match reference design
 * - [ ] Test and verify new UI
 */
import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Search,
  Filter,
  Save,
  RotateCcw,
  UserCheck,
  UserX,
  Timer,
  BookOpen,
  GraduationCap,
  MapPin,
  Smartphone,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  MoreVertical,
  Download
} from 'lucide-react';
import api from '../../services/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  admissionNumber?: string;
  profilePhoto?: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  checkInTime?: string;
}

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  section: string;
  subject?: string;
  totalStudents: number;
}

interface AttendanceSession {
  id?: string;
  classId: string;
  date: string;
  period?: string;
  subject?: string;
  method: 'manual' | 'qr' | 'biometric';
  location?: string;
  startTime: string;
  endTime?: string;
  notes?: string;
}

const AttendanceEntry: React.FC = () => {
  // State Management
  const [currentStep, setCurrentStep] = useState<'setup' | 'taking' | 'review'>('setup');
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [session, setSession] = useState<AttendanceSession>({
    classId: '',
    date: new Date().toISOString().split('T')[0],
    method: 'manual',
    startTime: new Date().toISOString()
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showRemarks, setShowRemarks] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | ''>('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/classes');
      if (response.data?.success) {
        setClasses(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch classes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (classId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/classes/${classId}/students`);
      if (response.data?.success) {
        const studentsData = (response.data.data || []).map((student: any) => ({
          ...student,
          firstName: student.firstName || student.name?.split(' ')[0] || '',
          lastName: student.lastName || student.name?.split(' ').slice(1).join(' ') || '',
          status: 'PRESENT' as const,
          checkInTime: new Date().toISOString()
        }));
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error", 
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classInfo: ClassInfo) => {
    setSelectedClass(classInfo);
    setSession(prev => ({ ...prev, classId: classInfo.id }));
    fetchStudents(classInfo.id);
    setCurrentStep('taking');
  };

  const updateStudentStatus = (studentId: string, status: Student['status'], remarks?: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { 
            ...student, 
            status,
            remarks: remarks || student.remarks,
            checkInTime: status === 'PRESENT' ? new Date().toISOString() : student.checkInTime
          }
        : student
    ));
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  const selectAllStudents = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map(s => s.id)));
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedStudents.size === 0) return;
    
    selectedStudents.forEach(studentId => {
      updateStudentStatus(studentId, bulkAction);
    });
    
    setSelectedStudents(new Set());
    setBulkAction('');
    toast({
      title: "Success",
      description: `Updated ${selectedStudents.size} students to ${bulkAction.toLowerCase()}.`,
    });
  };

  const handleSubmitAttendance = async () => {
    if (!selectedClass || students.length === 0) return;

    try {
      setSaving(true);
      const requestData = {
        classId: selectedClass.id,
        date: session.date,
        period: session.period || 'FULL_DAY',
        // Only include subjectId if a subject was provided
        ...(session.subject && { subjectId: session.subject }),
        method: session.method === 'manual' ? 'MANUAL' : 
                session.method === 'qr' ? 'QR_CODE' : 
                session.method === 'biometric' ? 'BIOMETRIC' : 'MANUAL',
        location: session.location,
        notes: session.notes,
        attendanceData: students.map(student => ({
          studentId: student.id,
          status: student.status || 'PRESENT',
          notes: student.remarks,
          checkInTime: student.checkInTime
        }))
      };

      console.log('Sending attendance data:', requestData);
      const response = await api.post('/attendance/bulk', requestData);
      
      if (response.data?.success) {
        setCurrentStep('review');
        toast({
          title: "Success",
          description: "Attendance saved successfully!",
        });
      } else {
        throw new Error(response.data?.message || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Error saving attendance:', error);
      console.error('Error response:', error?.response);
      console.error('Error response data:', error?.response?.data);
      
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Failed to save attendance. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetAttendance = () => {
    setStudents(prev => prev.map(student => ({
      ...student,
      status: 'PRESENT',
      remarks: '',
      checkInTime: new Date().toISOString()
    })));
    setSelectedStudents(new Set());
    toast({
      title: "Reset Complete",
      description: "All students marked as present.",
    });
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = (
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesFilter = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Statistics
  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'PRESENT').length,
    absent: students.filter(s => s.status === 'ABSENT').length,
    late: students.filter(s => s.status === 'LATE').length,
    excused: students.filter(s => s.status === 'EXCUSED').length,
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-50 text-green-700 border-green-200';
      case 'ABSENT': return 'bg-red-50 text-red-700 border-red-200';
      case 'LATE': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'EXCUSED': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'PRESENT': return <CheckCircle2 className="h-4 w-4" />;
      case 'ABSENT': return <XCircle className="h-4 w-4" />;
      case 'LATE': return <Timer className="h-4 w-4" />;
      case 'EXCUSED': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getStudentDisplayName = (student: Student) => {
    return `${student.firstName} ${student.lastName}`;
  };

  const getStudentInitials = (student: Student) => {
    return (student.firstName[0] + (student.lastName[0] || '')).toUpperCase();
  };

  const renderSetupStep = () => (
    <div className="space-y-6">
      {/* Session Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Attendance Session Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <DatePicker
                value={session.date ? new Date(session.date) : undefined}
                onChange={(date) => setSession(prev => ({ ...prev, date: date ? date.toISOString().split('T')[0] : '' }))}
                placeholder="Select date"
                className="w-full"
              />
            </div>
            <div>
              <Label htmlFor="period">Period/Time</Label>
              <Select onValueChange={(value) => setSession(prev => ({ ...prev, period: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERIOD_1">1st Period (8:00-9:00)</SelectItem>
                  <SelectItem value="PERIOD_2">2nd Period (9:00-10:00)</SelectItem>
                  <SelectItem value="PERIOD_3">3rd Period (10:00-11:00)</SelectItem>
                  <SelectItem value="PERIOD_4">4th Period (11:00-12:00)</SelectItem>
                  <SelectItem value="PERIOD_5">5th Period (1:00-2:00)</SelectItem>
                  <SelectItem value="PERIOD_6">6th Period (2:00-3:00)</SelectItem>
                  <SelectItem value="FULL_DAY">Regular Class</SelectItem>
                  <SelectItem value="ASSEMBLY">Assembly</SelectItem>
                  <SelectItem value="CUSTOM">Special Event</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="method">Method</Label>
              <Select 
                value={session.method} 
                onValueChange={(value) => setSession(prev => ({ ...prev, method: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="qr">QR Code</SelectItem>
                  <SelectItem value="biometric">Biometric</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Room A-101, Main Hall"
                value={session.location || ''}
                onChange={(e) => setSession(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject (Optional)</Label>
              <Input
                id="subject"
                placeholder="e.g., Mathematics, English"
                value={session.subject || ''}
                onChange={(e) => setSession(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Session Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Any additional notes about this session"
              value={session.notes || ''}
              onChange={(e) => setSession(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Class Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Select Class</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : classes.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No classes found. Please contact administrator.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((classInfo) => (
                <Card 
                  key={classInfo.id}
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-blue-300"
                  onClick={() => handleClassSelect(classInfo)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <GraduationCap className="h-8 w-8 text-blue-600" />
                      <Badge variant="outline" className="text-xs">
                        {classInfo.grade}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{classInfo.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">Section: {classInfo.section}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {classInfo.totalStudents} students
                      </span>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Select
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Take Attendance</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Modern and intuitive attendance management system
            </p>
          </div>
          
          {currentStep === 'taking' && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {new Date().toLocaleTimeString()}
              </Badge>
              <Badge variant="outline" className="text-sm">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(session.date).toLocaleDateString()}
              </Badge>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {['setup', 'taking', 'review'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold
                ${currentStep === step 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : index < ['setup', 'taking', 'review'].indexOf(currentStep)
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-gray-200 text-gray-600 border-gray-300'
                }
              `}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium capitalize ${
                currentStep === step ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step}
              </span>
              {index < 2 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  index < ['setup', 'taking', 'review'].indexOf(currentStep)
                    ? 'bg-green-600' 
                    : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Render Current Step */}
        {currentStep === 'setup' && renderSetupStep()}

        {currentStep === 'taking' && selectedClass && (
          <div className="space-y-6">
            {/* Class Information & Statistics */}
            <Card className="border-l-4 border-l-blue-600">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedClass.name} - {selectedClass.section}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {session.subject && `Subject: ${session.subject} • `}
                      {session.period && `Period: ${session.period} • `}
                      {session.location && `Location: ${session.location}`}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                        <div className="text-xs text-gray-600">Present</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                        <div className="text-xs text-gray-600">Absent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
                        <div className="text-xs text-gray-600">Late</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
                        <div className="text-xs text-gray-600">Excused</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Attendance Progress</span>
                    <span>{stats.present + stats.absent + stats.late + stats.excused}/{stats.total} processed</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(stats.present + stats.absent + stats.late + stats.excused) / stats.total * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by name, roll number, or admission number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="PRESENT">Present Only</SelectItem>
                      <SelectItem value="ABSENT">Absent Only</SelectItem>
                      <SelectItem value="LATE">Late Only</SelectItem>
                      <SelectItem value="EXCUSED">Excused Only</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* View Toggle */}
                  <div className="flex border rounded-lg">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-r-none"
                    >
                      List
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-l-none"
                    >
                      Grid
                    </Button>
                  </div>

                  {/* Remarks Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRemarks(!showRemarks)}
                    className="flex items-center"
                  >
                    {showRemarks ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    Remarks
                  </Button>
                </div>

                {/* Bulk Actions */}
                {selectedStudents.size > 0 && (
                  <div className="flex items-center space-x-4 mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-sm font-medium text-blue-700">
                      {selectedStudents.size} student(s) selected
                    </span>
                    <Select value={bulkAction} onValueChange={(value: any) => setBulkAction(value)}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Bulk action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PRESENT">Mark Present</SelectItem>
                        <SelectItem value="ABSENT">Mark Absent</SelectItem>
                        <SelectItem value="LATE">Mark Late</SelectItem>
                        <SelectItem value="EXCUSED">Mark Excused</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      size="sm" 
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Apply
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Students List/Grid */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Students ({filteredStudents.length})</span>
                  </CardTitle>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllStudents}
                      className="flex items-center"
                    >
                      {selectedStudents.size === filteredStudents.length ? 
                        <CheckSquare className="h-4 w-4 mr-2" /> : 
                        <Square className="h-4 w-4 mr-2" />
                      }
                      {selectedStudents.size === filteredStudents.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    <Button
                      variant="outline" 
                      size="sm"
                      onClick={resetAttendance}
                      className="flex items-center"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No students found matching your criteria</p>
                  </div>
                ) : viewMode === 'list' ? (
                  <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Selection Checkbox */}
                            <button
                              onClick={() => toggleStudentSelection(student.id)}
                              className="flex items-center"
                            >
                              {selectedStudents.has(student.id) ? 
                                <CheckSquare className="h-5 w-5 text-blue-600" /> : 
                                <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              }
                            </button>

                            {/* Student Avatar */}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                              {(student.firstName[0] + (student.lastName[0] || '')).toUpperCase()}
                            </div>

                            {/* Student Info */}
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {student.firstName} {student.lastName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Roll: {student.rollNumber}
                                {student.admissionNumber && ` • Admission: ${student.admissionNumber}`}
                              </p>
                              {student.checkInTime && student.status === 'PRESENT' && (
                                <p className="text-xs text-green-600 flex items-center mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Checked in at {new Date(student.checkInTime).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status Controls */}
                          <div className="flex items-center space-x-2">
                            {/* Current Status Badge */}
                            <Badge className={`${getStatusColor(student.status)} flex items-center space-x-1`}>
                              {getStatusIcon(student.status)}
                              <span>{student.status}</span>
                            </Badge>

                            {/* Status Change Buttons */}
                            <div className="flex space-x-1">
                              {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                                <Button
                                  key={status}
                                  size="sm"
                                  variant={student.status === status ? 'default' : 'outline'}
                                  onClick={() => updateStudentStatus(student.id, status as Student['status'])}
                                  className={`text-xs px-2 py-1 h-8 ${
                                    status === 'PRESENT' && student.status === status ? 'bg-green-600 hover:bg-green-700' :
                                    status === 'ABSENT' && student.status === status ? 'bg-red-600 hover:bg-red-700' :
                                    status === 'LATE' && student.status === status ? 'bg-yellow-600 hover:bg-yellow-700' :
                                    status === 'EXCUSED' && student.status === status ? 'bg-blue-600 hover:bg-blue-700' : ''
                                  }`}
                                >
                                  {status.charAt(0) + status.slice(1).toLowerCase()}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Remarks Section */}
                        {showRemarks && (
                          <div className="mt-3 ml-16">
                            <Input
                              placeholder="Add remarks (optional)"
                              value={student.remarks || ''}
                              onChange={(e) => updateStudentStatus(student.id, student.status, e.target.value)}
                              className="text-sm"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                    {filteredStudents.map((student) => (
                      <Card key={student.id} className={`transition-all duration-200 hover:shadow-lg ${
                        selectedStudents.has(student.id) ? 'ring-2 ring-blue-500' : ''
                      }`}>
                        <CardContent className="p-4">
                          {/* Selection Checkbox */}
                          <div className="flex justify-between items-start mb-3">
                            <button
                              onClick={() => toggleStudentSelection(student.id)}
                              className="flex items-center"
                            >
                              {selectedStudents.has(student.id) ? 
                                <CheckSquare className="h-5 w-5 text-blue-600" /> : 
                                <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                              }
                            </button>
                            <Badge className={`${getStatusColor(student.status)} text-xs`}>
                              {student.status}
                            </Badge>
                          </div>

                          {/* Student Avatar */}
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                            {(student.firstName[0] + (student.lastName[0] || '')).toUpperCase()}
                          </div>

                          {/* Student Info */}
                          <div className="text-center mb-4">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {student.firstName} {student.lastName}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              Roll: {student.rollNumber}
                            </p>
                          </div>

                          {/* Status Buttons */}
                          <div className="grid grid-cols-2 gap-1">
                            {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                              <Button
                                key={status}
                                size="sm"
                                variant={student.status === status ? 'default' : 'outline'}
                                onClick={() => updateStudentStatus(student.id, status as Student['status'])}
                                className={`text-xs px-1 py-1 h-7 ${
                                  status === 'PRESENT' && student.status === status ? 'bg-green-600 hover:bg-green-700' :
                                  status === 'ABSENT' && student.status === status ? 'bg-red-600 hover:bg-red-700' :
                                  status === 'LATE' && student.status === status ? 'bg-yellow-600 hover:bg-yellow-700' :
                                  status === 'EXCUSED' && student.status === status ? 'bg-blue-600 hover:bg-blue-700' : ''
                                }`}
                              >
                                {status.charAt(0)}
                              </Button>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep('setup');
                    setSelectedClass(null);
                    setStudents([]);
                  }}
                  className="flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Change Class
                </Button>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={resetAttendance}
                  className="flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset All
                </Button>
                <Button
                  onClick={handleSubmitAttendance}
                  disabled={saving || students.length === 0}
                  className="bg-green-600 hover:bg-green-700 flex items-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Attendance
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'review' && selectedClass && (
          <div className="space-y-6">
            {/* Success Message */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Attendance has been successfully saved for {selectedClass.name} - {selectedClass.section}
              </AlertDescription>
            </Alert>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>Attendance Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{stats.present}</div>
                    <div className="text-sm text-gray-600">Present</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((stats.present / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">{stats.absent}</div>
                    <div className="text-sm text-gray-600">Absent</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((stats.absent / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.late}</div>
                    <div className="text-sm text-gray-600">Late</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((stats.late / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{stats.excused}</div>
                    <div className="text-sm text-gray-600">Excused</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {((stats.excused / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Overall Attendance Rate</span>
                    <span className="font-semibold">
                      {(((stats.present + stats.late) / stats.total) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${((stats.present + stats.late) / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Session Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Session Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Class</Label>
                    <p className="font-semibold">{selectedClass.name} - {selectedClass.section}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Date</Label>
                    <p className="font-semibold">{new Date(session.date).toLocaleDateString()}</p>
                  </div>
                  {session.period && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Period</Label>
                      <p className="font-semibold">{session.period}</p>
                    </div>
                  )}
                  {session.subject && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Subject</Label>
                      <p className="font-semibold">{session.subject}</p>
                    </div>
                  )}
                  {session.location && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Location</Label>
                      <p className="font-semibold">{session.location}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Method</Label>
                    <p className="font-semibold capitalize">{session.method}</p>
                  </div>
                </div>
                {session.notes && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-600">Notes</Label>
                    <p className="font-semibold">{session.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep('setup');
                  setSelectedClass(null);
                  setStudents([]);
                  setSession({
                    classId: '',
                    date: new Date().toISOString().split('T')[0],
                    method: 'manual',
                    startTime: new Date().toISOString()
                  });
                }}
                className="flex items-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Take Another Attendance
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                  className="flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Print Report
                </Button>
                <Button
                  onClick={() => {
                    // Navigate to attendance dashboard or reports
                    window.location.href = '/attendance';
                  }}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AttendanceEntry;
