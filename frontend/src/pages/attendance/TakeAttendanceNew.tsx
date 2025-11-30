import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent
} from '@/components/ui/page';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Button,
  Form,
  FormField,
  StatusBadge,
  Input
} from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calendar,
  Clock,
  Users,
  UserCheck,
  UserX,
  Timer,
  Clock4,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Filter,
  Search,
  QrCode,
  Upload,
  Download,
  Eye,
  Settings,
  Zap,
  Target,
  Activity,
  Camera,
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  ArrowLeft,
  Plus,
  Minus,
  Grid3X3,
  List,
  BarChart3,
  FileText,
  Send,
  GraduationCap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { get, post } from '../../services/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  admissionNumber: string;
  profileImage?: string;
  profileImageUrl?: string;
  house?: {
    name: string;
    color: string;
  };
  attendance: {
    id: string;
    status: string;
    checkInTime?: string;
    notes?: string;
    markedBy: {
      name: string;
      role: string;
    };
  } | null;
}

interface ClassInfo {
  id: string;
  name: string;
  grade: string;
  capacity: number;
}

interface AttendanceStats {
  totalStudents: number;
  markedStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

interface RosterData {
  class: ClassInfo;
  roster: Student[];
  stats: AttendanceStats;
  date: string;
  period: string;
  subjectId?: string;
}

const ATTENDANCE_STATUSES = [
  {
    value: 'PRESENT',
    label: 'Present',
    icon: UserCheck,
    color: 'bg-green-100 text-green-800 border-green-200',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    shortcut: '1'
  },
  {
    value: 'ABSENT',
    label: 'Absent',
    icon: UserX,
    color: 'bg-red-100 text-red-800 border-red-200',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    shortcut: '2'
  },
  {
    value: 'LATE',
    label: 'Late',
    icon: Timer,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-500',
    shortcut: '3'
  },
  {
    value: 'EXCUSED',
    label: 'Excused',
    icon: Clock4,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    shortcut: '4'
  }
];

const PERIODS = [
  { value: 'FULL_DAY', label: 'Full Day' },
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'PERIOD_1', label: 'Period 1' },
  { value: 'PERIOD_2', label: 'Period 2' },
  { value: 'PERIOD_3', label: 'Period 3' },
  { value: 'PERIOD_4', label: 'Period 4' },
  { value: 'PERIOD_5', label: 'Period 5' },
  { value: 'PERIOD_6', label: 'Period 6' },
  { value: 'PERIOD_7', label: 'Period 7' },
  { value: 'PERIOD_8', label: 'Period 8' }
];

const TakeAttendanceNew: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [rosterData, setRosterData] = useState<RosterData | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableClasses, setAvailableClasses] = useState<ClassInfo[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get('period') || 'FULL_DAY');
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get('subjectId') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');
  const [autoSave, setAutoSave] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing in inputs
      }

      const keyPressed = event.key;
      const status = ATTENDANCE_STATUSES.find(s => s.shortcut === keyPressed);

      if (status && selectedStudents.size > 0) {
        event.preventDefault();
        applyStatusToSelected(status.value);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedStudents]);

  useEffect(() => {
    console.log('TakeAttendanceNew useEffect - classId:', classId);
    if (classId) {
      fetchClassRoster();
    } else {
      setLoading(false); // Stop loading if no classId
      fetchAvailableClasses(); // Load classes for selection
      console.log('No classId provided, fetching available classes');
    }
  }, [classId, selectedDate, selectedPeriod, selectedSubjectId]);

  const fetchAvailableClasses = async () => {
    setLoadingClasses(true);
    try {
      console.log('Fetching available classes');
      const result = await get('/classes');
      console.log('Classes API response:', result);

      if (result.success && result.data) {
        const classes = Array.isArray(result.data) ? result.data : (result.data as any).classes || [];
        setAvailableClasses(classes);
        console.log('Available classes loaded:', classes);
      } else {
        console.error('Failed to fetch classes:', result.message);
        toast.error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Error loading classes');
    } finally {
      setLoadingClasses(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && rosterData) {
      const timer = setInterval(() => {
        const hasChanges = Object.values(attendanceData).some(data => data.status);
        if (hasChanges) {
          submitAttendance(true); // Silent save
        }
      }, 30000); // Auto-save every 30 seconds

      return () => clearInterval(timer);
    }
  }, [autoSave, attendanceData, rosterData]);

  const fetchClassRoster = async () => {
    console.log('fetchClassRoster called with classId:', classId);
    setLoading(true);
    try {
      const params = {
        date: selectedDate,
        period: selectedPeriod,
        ...(selectedSubjectId && { subjectId: selectedSubjectId })
      };

      console.log('Making API call to:', `/attendance/class/${classId}/roster`, 'with params:', params);
      const result = await get(`/attendance/class/${classId}/roster`, params);
      console.log('API response:', result);

      if (result.success) {
        setRosterData(result.data as RosterData);

        // Initialize attendance data from existing records
        const initialAttendanceData: Record<string, any> = {};
        (result.data as RosterData).roster.forEach((student: Student) => {
          if (student.attendance) {
            initialAttendanceData[student.id] = {
              status: student.attendance.status,
              notes: student.attendance.notes || '',
              checkInTime: student.attendance.checkInTime || '',
              temperature: null,
              location: null
            };
          } else {
            initialAttendanceData[student.id] = {
              status: '',
              notes: '',
              checkInTime: '',
              temperature: null,
              location: null
            };
          }
        });
        setAttendanceData(initialAttendanceData);
        console.log('Roster data loaded successfully');
      } else {
        console.error('API error:', result.message);
        toast.error(result.message || 'Failed to fetch class roster');
      }
    } catch (error) {
      console.error('Error fetching class roster:', error);
      toast.error('Error fetching class roster');
    } finally {
      setLoading(false);
    }
  };

  const updateStudentAttendance = useCallback((studentId: string, field: string, value: any) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
        ...(field === 'status' && value === 'PRESENT' && { checkInTime: new Date().toISOString() })
      }
    }));
  }, []);

  const submitAttendance = async (silent = false) => {
    if (!rosterData) return;

    setSaving(true);
    try {
      // Prepare attendance data for API
      const attendanceDataArray = rosterData.roster
        .map(student => ({
          studentId: student.id,
          status: attendanceData[student.id]?.status || 'PRESENT',
          notes: attendanceData[student.id]?.notes || '',
          checkInTime: attendanceData[student.id]?.checkInTime || new Date().toISOString(),
          temperature: attendanceData[student.id]?.temperature,
          isLateArrival: attendanceData[student.id]?.status === 'LATE',
          lateMinutes: attendanceData[student.id]?.status === 'LATE' ? 15 : 0
        }))
        .filter(item => item.status);

      const result = await post(`/attendance/class/${classId}/take`, {
        attendanceData: attendanceDataArray,
        date: selectedDate,
        period: selectedPeriod,
        subjectId: selectedSubjectId || null,
        notes: notes,
        method: 'MANUAL'
      });

      if (result.success) {
        if (!silent) {
          toast.success(`Attendance saved! ${(result.data as any).created} created, ${(result.data as any).updated} updated`);
        }
        await fetchClassRoster(); // Refresh data
      } else {
        toast.error(result.message || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      if (!silent) {
        toast.error('Error saving attendance');
      }
    } finally {
      setSaving(false);
    }
  };

  const applyQuickAction = (action: 'present' | 'absent' | 'late' | 'reset') => {
    if (!rosterData) return;

    const newAttendanceData = { ...attendanceData };

    rosterData.roster.forEach(student => {
      switch (action) {
        case 'present':
          newAttendanceData[student.id] = {
            ...newAttendanceData[student.id],
            status: 'PRESENT',
            checkInTime: new Date().toISOString()
          };
          break;
        case 'absent':
          newAttendanceData[student.id] = {
            ...newAttendanceData[student.id],
            status: 'ABSENT',
            checkInTime: ''
          };
          break;
        case 'late':
          newAttendanceData[student.id] = {
            ...newAttendanceData[student.id],
            status: 'LATE',
            checkInTime: new Date().toISOString()
          };
          break;
        case 'reset':
          newAttendanceData[student.id] = {
            status: '',
            notes: '',
            checkInTime: '',
            temperature: null,
            location: null
          };
          break;
      }
    });

    setAttendanceData(newAttendanceData);
    toast.success(`Applied ${action} to all students`);
  };

  const applyStatusToSelected = (status: string) => {
    const newAttendanceData = { ...attendanceData };

    selectedStudents.forEach(studentId => {
      newAttendanceData[studentId] = {
        ...newAttendanceData[studentId],
        status,
        checkInTime: status === 'PRESENT' || status === 'LATE' ? new Date().toISOString() : ''
      };
    });

    setAttendanceData(newAttendanceData);
    setSelectedStudents(new Set());
    toast.success(`Marked ${selectedStudents.size} students as ${status.toLowerCase()}`);
  };

  const toggleStudentSelection = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const selectAllFiltered = () => {
    const filtered = getFilteredStudents();
    const newSelected = new Set(selectedStudents);
    filtered.forEach(student => newSelected.add(student.id));
    setSelectedStudents(newSelected);
  };

  const clearSelection = () => {
    setSelectedStudents(new Set());
  };

  const getFilteredStudents = () => {
    if (!rosterData) return [];

    return rosterData.roster.filter(student => {
      const matchesSearch = searchTerm === '' ||
        `${student.firstName} ${student.lastName} ${student.admissionNumber}`.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesFilter = filterStatus === 'all' ||
        attendanceData[student.id]?.status === filterStatus ||
        (filterStatus === 'unmarked' && !attendanceData[student.id]?.status);

      return matchesSearch && matchesFilter;
    });
  };

  const getProgressStats = () => {
    if (!rosterData) return { marked: 0, total: 0, percentage: 0, present: 0, absent: 0, late: 0, excused: 0 };

    const marked = rosterData.roster.filter(student => attendanceData[student.id]?.status).length;
    const present = rosterData.roster.filter(student => attendanceData[student.id]?.status === 'PRESENT').length;
    const absent = rosterData.roster.filter(student => attendanceData[student.id]?.status === 'ABSENT').length;
    const late = rosterData.roster.filter(student => attendanceData[student.id]?.status === 'LATE').length;
    const excused = rosterData.roster.filter(student => attendanceData[student.id]?.status === 'EXCUSED').length;

    return {
      marked,
      total: rosterData.roster.length,
      percentage: rosterData.roster.length > 0 ? Math.round((marked / rosterData.roster.length) * 100) : 0,
      present,
      absent,
      late,
      excused
    };
  };

  const getStatusIcon = (status: string) => {
    const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === status);
    if (statusConfig) {
      const Icon = statusConfig.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <User className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === status);
    return statusConfig?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading class roster...</p>
            </div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  if (!rosterData && !classId) {
    return (
      <Layout>
        <PageContainer>
          <PageHeader>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Users className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <div>
                <PageTitle className="text-3xl font-bold text-gray-900">Take Attendance</PageTitle>
                <PageDescription className="text-lg text-gray-600 mt-2">
                  Select a class to start marking attendance for today
                </PageDescription>
              </div>
            </div>
          </PageHeader>
          <PageContent>
            <div className="max-w-6xl mx-auto">
              {loadingClasses ? (
                <Card className="bg-white shadow-lg">
                  <CardContent className="py-16">
                    <div className="text-center space-y-4">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Loading Classes</h3>
                        <p className="text-gray-600 mt-1">Please wait while we fetch your classes...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : availableClasses.length > 0 ? (
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-600 p-2 rounded-lg">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-blue-900">{availableClasses.length}</p>
                            <p className="text-sm text-blue-700">Total Classes</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-600 p-2 rounded-lg">
                            <Calendar className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-900">
                              {new Date().toLocaleDateString('en-US', { day: 'numeric' })}
                            </p>
                            <p className="text-sm text-green-700">
                              {new Date().toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-purple-600 p-2 rounded-lg">
                            <Clock className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-purple-900">
                              {new Date().toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: false
                              })}
                            </p>
                            <p className="text-sm text-purple-700">Current Time</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Class Selection */}
                  <Card className="shadow-lg">
                    <CardHeader className="bg-gray-50 border-b">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">Select Class</CardTitle>
                          <p className="text-gray-600 mt-1">Choose a class to start taking attendance</p>
                        </div>
                        <Badge variant="outline" className="bg-white">
                          {availableClasses.length} classes available
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {availableClasses.map((classItem) => (
                          <Card
                            key={classItem.id}
                            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-400 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50"
                            onClick={() => navigate(`/attendance/take/${classItem.id}`)}
                          >
                            <CardContent className="p-6">
                              <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                  <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                                    <GraduationCap className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-green-100 p-1 rounded-full">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                  </div>
                                </div>

                                {/* Class Info */}
                                <div className="space-y-2">
                                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-blue-900 transition-colors">
                                    {classItem.name}
                                  </h3>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                      {classItem.grade}
                                    </Badge>
                                  </div>
                                </div>

                                {/* Stats */}
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>Capacity: {classItem.capacity} students</span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Target className="h-4 w-4" />
                                    <span>Ready for attendance</span>
                                  </div>
                                </div>

                                {/* Action Indicator */}
                                <div className="pt-2 border-t border-gray-100">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-600 font-medium group-hover:text-blue-700">
                                      Take Attendance
                                    </span>
                                    <div className="transform group-hover:translate-x-1 transition-transform">
                                      <ArrowLeft className="h-4 w-4 text-blue-600 rotate-180" />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                        <div className="text-center md:text-left">
                          <h3 className="font-semibold text-gray-900">Need help?</h3>
                          <p className="text-sm text-gray-600">
                            Learn how to efficiently take attendance or access previous records
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <Button intent="secondary" size="sm" className="bg-white">
                            <FileText className="h-4 w-4 mr-2" />
                            View Guide
                          </Button>
                          <Button intent="secondary" size="sm" className="bg-white">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Reports
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-white shadow-lg">
                  <CardContent className="py-16">
                    <div className="text-center space-y-6">
                      <div className="flex justify-center">
                        <div className="bg-gray-100 p-6 rounded-full">
                          <Users className="h-16 w-16 text-gray-400" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-gray-900">No Classes Available</h3>
                        <p className="text-gray-600 max-w-md mx-auto">
                          It looks like there are no classes set up for attendance marking. 
                          Contact your administrator to add classes to the system.
                        </p>
                      </div>
                      <div className="flex justify-center space-x-4">
                        <Button intent="primary" onClick={fetchAvailableClasses}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh
                        </Button>
                        <Button intent="secondary" onClick={() => navigate('/classes')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Manage Classes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  if (!rosterData && classId) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Class Not Found</h3>
            <p className="text-gray-600">The requested class could not be found.</p>
            <Button intent="primary" className="mt-4" onClick={() => navigate('/attendance')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  const filteredStudents = getFilteredStudents();
  const progressStats = getProgressStats();

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
            {/* Left Section - Title and Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <Button intent="secondary" size="sm" onClick={() => navigate('/attendance')} className="shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div className="min-w-0 flex-1">
                  <PageTitle className="text-2xl lg:text-3xl font-bold truncate">
                    {rosterData?.class.name || 'Class'}
                  </PageTitle>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {rosterData?.class.grade || 'Grade'}
                    </span>
                    <span>•</span>
                    <span>{rosterData?.roster.length || 0} students</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "h-3 w-3 rounded-full",
                      progressStats.percentage === 100 ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                    )} />
                    <span className="font-medium text-gray-900">
                      Progress: {progressStats.marked} of {progressStats.total}
                    </span>
                    <StatusBadge
                      status={progressStats.percentage === 100 ? "success" : progressStats.percentage > 50 ? "warning" : "error"}
                      size="sm"
                    >
                      {progressStats.percentage}%
                    </StatusBadge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {progressStats.percentage === 100 ? "Complete!" : `${100 - progressStats.percentage}% remaining`}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-700 ease-out",
                      progressStats.percentage === 100 ? "bg-green-500" : "bg-blue-600"
                    )}
                    style={{ width: `${progressStats.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6">
              <div className="flex items-center space-x-2">
                <Button 
                  intent="secondary" 
                  size="sm" 
                  onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                  className="flex items-center"
                >
                  {viewMode === 'list' ? <Grid3X3 className="h-4 w-4 mr-2" /> : <List className="h-4 w-4 mr-2" />}
                  {viewMode === 'list' ? 'Grid View' : 'List View'}
                </Button>

                <Button intent="secondary" size="sm" className="flex items-center">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              </div>

              <Button
                intent="primary"
                onClick={() => submitAttendance()}
                disabled={saving || progressStats.marked === 0}
                loading={saving}
                loadingText="Saving..."
                className="sm:min-w-[140px] font-medium"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Attendance
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageContent className="space-y-6">
          {/* Controls Panel */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-gray-800">
                  <Filter className="h-5 w-5 mr-2" />
                  Attendance Controls
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={bulkMode}
                      onCheckedChange={(checked) => setBulkMode(checked === true)}
                      id="bulk-mode"
                    />
                    <label htmlFor="bulk-mode" className="text-sm font-medium text-gray-700">
                      Bulk Selection Mode
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={autoSave}
                      onCheckedChange={(checked) => setAutoSave(checked === true)}
                      id="auto-save"
                    />
                    <label htmlFor="auto-save" className="text-sm font-medium text-gray-700">
                      Auto-save (30s)
                    </label>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <FormField label="Date">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="pl-10 bg-white"
                    />
                  </div>
                </FormField>

                <FormField label="Period">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="bg-white">
                      <Clock className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map(period => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Search Students">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Name, ID, or house..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white"
                    />
                  </div>
                  {searchTerm && (
                    <p className="text-xs text-blue-600 mt-1">
                      {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                    </p>
                  )}
                </FormField>

                <FormField label="Filter by Status">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="bg-white">
                      <Filter className="h-4 w-4 mr-2 text-gray-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students ({rosterData?.roster.length || 0})</SelectItem>
                      <SelectItem value="unmarked">
                        Unmarked ({(rosterData?.roster.length || 0) - progressStats.marked})
                      </SelectItem>
                      {ATTENDANCE_STATUSES.map(status => {
                        const count = status.value === 'PRESENT' ? progressStats.present :
                                      status.value === 'ABSENT' ? progressStats.absent :
                                      status.value === 'LATE' ? progressStats.late :
                                      progressStats.excused;
                        return (
                          <SelectItem key={status.value} value={status.value}>
                            <div className="flex items-center">
                              <status.icon className="h-4 w-4 mr-2" />
                              {status.label} ({count})
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Keyboard Shortcuts">
                  <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                    {ATTENDANCE_STATUSES.map(status => (
                      <div key={status.value} className="flex items-center justify-between text-xs">
                        <span className="flex items-center">
                          <status.icon className="h-3 w-3 mr-1" />
                          {status.label}
                        </span>
                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-white">
                          {status.shortcut}
                        </Badge>
                      </div>
                    ))}
                    <div className="text-xs text-gray-500 pt-1 border-t">
                      Select students first, then use shortcuts
                    </div>
                  </div>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[
              { 
                label: 'Present', 
                value: progressStats.present, 
                icon: UserCheck, 
                color: 'text-green-600', 
                bgColor: 'bg-green-100', 
                borderColor: 'border-green-200',
                percentage: progressStats.total > 0 ? (progressStats.present / progressStats.total * 100).toFixed(1) : '0'
              },
              { 
                label: 'Absent', 
                value: progressStats.absent, 
                icon: UserX, 
                color: 'text-red-600', 
                bgColor: 'bg-red-100', 
                borderColor: 'border-red-200',
                percentage: progressStats.total > 0 ? (progressStats.absent / progressStats.total * 100).toFixed(1) : '0'
              },
              { 
                label: 'Late', 
                value: progressStats.late, 
                icon: Timer, 
                color: 'text-yellow-600', 
                bgColor: 'bg-yellow-100', 
                borderColor: 'border-yellow-200',
                percentage: progressStats.total > 0 ? (progressStats.late / progressStats.total * 100).toFixed(1) : '0'
              },
              { 
                label: 'Excused', 
                value: progressStats.excused, 
                icon: Clock4, 
                color: 'text-blue-600', 
                bgColor: 'bg-blue-100', 
                borderColor: 'border-blue-200',
                percentage: progressStats.total > 0 ? (progressStats.excused / progressStats.total * 100).toFixed(1) : '0'
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className={cn("border-2 transition-all hover:shadow-md", stat.borderColor)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className={cn("p-1.5 rounded-full", stat.bgColor)}>
                            <Icon className={cn("h-4 w-4", stat.color)} />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                        </div>
                        <div className="space-y-1">
                          <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                          <div className="text-xs text-gray-500">{stat.percentage}% of class</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions Panel */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <Zap className="h-5 w-5 mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  intent="success"
                  size="sm"
                  onClick={() => applyQuickAction('present')}
                  className="justify-start h-12 hover:scale-105 transition-transform"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  <span className="flex flex-col items-start">
                    <span className="font-medium">Mark All Present</span>
                    <span className="text-xs opacity-75">{progressStats.total - progressStats.present} students</span>
                  </span>
                </Button>
                <Button
                  intent="danger"
                  size="sm"
                  onClick={() => applyQuickAction('absent')}
                  className="justify-start h-12 hover:scale-105 transition-transform"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  <span className="flex flex-col items-start">
                    <span className="font-medium">Mark All Absent</span>
                    <span className="text-xs opacity-75">{progressStats.total - progressStats.absent} students</span>
                  </span>
                </Button>
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={() => applyQuickAction('reset')}
                  className="justify-start h-12 hover:scale-105 transition-transform"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  <span className="flex flex-col items-start">
                    <span className="font-medium">Reset All</span>
                    <span className="text-xs opacity-75">Clear all marks</span>
                  </span>
                </Button>
                <Button
                  intent="secondary"
                  size="sm"
                  onClick={fetchClassRoster}
                  className="justify-start h-12 hover:scale-105 transition-transform"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span className="flex flex-col items-start">
                    <span className="font-medium">Refresh</span>
                    <span className="text-xs opacity-75">Reload data</span>
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Mode Controls */}
          {bulkMode && selectedStudents.size > 0 && (
            <Card className="border-blue-300 bg-gradient-to-r from-blue-50 via-blue-50 to-indigo-50 shadow-lg animate-in slide-in-from-top-2 duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 font-medium px-3 py-1">
                          {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
                        </Badge>
                        <p className="text-sm text-blue-600 mt-1">Apply attendance status to selected students</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {ATTENDANCE_STATUSES.map(status => {
                        const Icon = status.icon;
                        return (
                          <Button
                            key={status.value}
                            size="sm"
                            intent="secondary"
                            onClick={() => applyStatusToSelected(status.value)}
                            className={cn(
                              "hover:scale-105 transition-transform shadow-sm",
                              status.value === 'PRESENT' && "hover:bg-green-50 hover:text-green-700 hover:border-green-300",
                              status.value === 'ABSENT' && "hover:bg-red-50 hover:text-red-700 hover:border-red-300",
                              status.value === 'LATE' && "hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300",
                              status.value === 'EXCUSED' && "hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                            )}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {status.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      intent="secondary" 
                      onClick={selectAllFiltered}
                      className="bg-white hover:bg-blue-50 border-blue-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Select All Filtered ({filteredStudents.length})
                    </Button>
                    <Button 
                      size="sm" 
                      intent="cancel" 
                      onClick={clearSelection}
                      className="bg-white hover:bg-red-50"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Student Roster */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Students ({filteredStudents.length})</CardTitle>
                <div className="flex items-center space-x-2">
                  {bulkMode && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Bulk Mode Active
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "gap-4",
                viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-4"
              )}>
                {filteredStudents.map((student) => {
                  const currentAttendance = attendanceData[student.id] || {};
                  const isSelected = selectedStudents.has(student.id);
                  const hasStatus = currentAttendance.status;
                  const statusConfig = ATTENDANCE_STATUSES.find(s => s.value === currentAttendance.status);

                  if (viewMode === 'grid') {
                    // Grid View - Card-based layout
                    return (
                      <div
                        key={student.id}
                        className={cn(
                          "group relative border-2 rounded-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                          isSelected && bulkMode ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:border-gray-300",
                          hasStatus ? statusConfig?.bgColor : "bg-white hover:bg-gray-50",
                          "p-6 min-h-[280px] flex flex-col"
                        )}
                      >
                        {/* Selection Checkbox for Bulk Mode */}
                        {bulkMode && (
                          <div className="absolute top-3 right-3 z-10">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleStudentSelection(student.id)}
                              className="bg-white shadow-sm"
                            />
                          </div>
                        )}

                        {/* Student Avatar and Status Indicator */}
                        <div className="flex justify-center mb-4">
                          <div className="relative">
                            {student.profileImageUrl || student.profileImage ? (
                              <img
                                src={student.profileImageUrl || student.profileImage}
                                alt={`${student.firstName} ${student.lastName}`}
                                className={cn(
                                  "rounded-full object-cover border-4 transition-all",
                                  "h-20 w-20",
                                  hasStatus ? statusConfig?.borderColor : "border-gray-200"
                                )}
                              />
                            ) : (
                              <div className={cn(
                                "rounded-full flex items-center justify-center border-4 transition-all",
                                "h-20 w-20",
                                hasStatus ? `${statusConfig?.bgColor} ${statusConfig?.borderColor}` : "bg-gray-100 border-gray-200"
                              )}>
                                <User className="h-10 w-10 text-gray-500" />
                              </div>
                            )}
                            
                            {/* Status Indicator Dot */}
                            {hasStatus && (
                              <div className={cn(
                                "absolute -bottom-1 -right-1 rounded-full border-4 border-white shadow-md",
                                statusConfig?.value === 'PRESENT' && "bg-green-500",
                                statusConfig?.value === 'ABSENT' && "bg-red-500",
                                statusConfig?.value === 'LATE' && "bg-yellow-500",
                                statusConfig?.value === 'EXCUSED' && "bg-blue-500",
                                "w-7 h-7"
                              )} />
                            )}
                          </div>
                        </div>

                        {/* Student Information */}
                        <div className="text-center mb-4 flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                            {student.firstName} {student.lastName}
                            {student.middleName && ` ${student.middleName}`}
                          </h3>
                          
                          <div className="space-y-2">
                            <p className="text-sm font-mono text-gray-600 bg-gray-50 rounded-md px-2 py-1">
                              {student.admissionNumber}
                            </p>
                            
                            <div className="flex flex-wrap justify-center gap-1">
                              {student.house && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border"
                                  style={{
                                    backgroundColor: student.house.color + '15',
                                    color: student.house.color,
                                    borderColor: student.house.color + '40'
                                  }}
                                >
                                  {student.house.name}
                                </Badge>
                              )}
                              
                              {hasStatus && (
                                <Badge className={cn("text-xs font-medium", getStatusColor(currentAttendance.status))}>
                                  {statusConfig?.label}
                                </Badge>
                              )}
                              
                              {student.attendance && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                  Previously marked
                                </Badge>
                              )}
                            </div>
                            
                            {/* Status Info */}
                            <div className="text-sm text-gray-500 mt-2">
                              {hasStatus ? (
                                <div className="space-y-1">
                                  <p>Marked as {statusConfig?.label}</p>
                                  {currentAttendance.checkInTime && (
                                    <p className="text-xs flex items-center justify-center">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {new Date(currentAttendance.checkInTime).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                      })}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <p className="text-gray-400 italic">Not marked yet</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Status Selection Buttons */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            {ATTENDANCE_STATUSES.map((status) => {
                              const Icon = status.icon;
                              const isStatusSelected = currentAttendance.status === status.value;

                              return (
                                <button
                                  key={status.value}
                                  onClick={() => updateStudentAttendance(student.id, 'status', status.value)}
                                  className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all",
                                    "hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                                    isStatusSelected
                                      ? `${status.borderColor} ${status.bgColor} shadow-md`
                                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50',
                                    "min-h-[60px]"
                                  )}
                                  title={`Mark as ${status.label} (Shortcut: ${status.shortcut})`}
                                >
                                  <Icon className={cn(
                                    "h-5 w-5 mb-1 transition-colors",
                                    isStatusSelected ? status.color.replace('text-', 'text-') : 'text-gray-400'
                                  )} />
                                  <span className={cn(
                                    "text-xs font-medium",
                                    isStatusSelected ? 'text-current' : 'text-gray-500'
                                  )}>
                                    {status.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Notes Section for Grid Mode */}
                          {hasStatus && (
                            <div className="space-y-2 pt-3 border-t border-gray-100">
                              <Input
                                placeholder="Add notes..."
                                value={currentAttendance.notes || ''}
                                onChange={(e) => updateStudentAttendance(student.id, 'notes', e.target.value)}
                                className="text-xs bg-white border-gray-200 focus:border-blue-400"
                              />
                              {currentAttendance.status === 'LATE' && (
                                <Input
                                  type="number"
                                  placeholder="Minutes late..."
                                  className="text-xs bg-white border-gray-200 focus:border-yellow-400"
                                  min="0"
                                  max="120"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    // List View - Horizontal layout
                    return (
                      <div
                        key={student.id}
                        className={cn(
                          "group border-2 rounded-xl transition-all duration-200 hover:shadow-lg",
                          isSelected && bulkMode ? "border-blue-500 bg-blue-50 shadow-md" : "border-gray-200 hover:border-gray-300",
                          hasStatus ? statusConfig?.bgColor : "bg-white hover:bg-gray-50",
                          "p-3"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 flex-1 min-w-0">
                            {bulkMode && (
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleStudentSelection(student.id)}
                                className="shrink-0"
                              />
                            )}

                            <div className="relative shrink-0">
                              {student.profileImageUrl || student.profileImage ? (
                                <img
                                  src={student.profileImageUrl || student.profileImage}
                                  alt={`${student.firstName} ${student.lastName}`}
                                  className={cn(
                                    "rounded-full object-cover border-2 transition-all",
                                    "h-12 w-12",
                                    hasStatus ? statusConfig?.borderColor : "border-gray-200"
                                  )}
                                />
                              ) : (
                                <div className={cn(
                                  "rounded-full flex items-center justify-center border-2 transition-all",
                                  "h-12 w-12",
                                  hasStatus ? `${statusConfig?.bgColor} ${statusConfig?.borderColor}` : "bg-gray-100 border-gray-200"
                                )}>
                                  <User className="h-6 w-6 text-gray-500" />
                                </div>
                              )}
                              
                              {/* Status Indicator Dot */}
                              {hasStatus && (
                                <div className={cn(
                                  "absolute -bottom-1 -right-1 rounded-full border-2 border-white",
                                  statusConfig?.value === 'PRESENT' && "bg-green-500",
                                  statusConfig?.value === 'ABSENT' && "bg-red-500",
                                  statusConfig?.value === 'LATE' && "bg-yellow-500",
                                  statusConfig?.value === 'EXCUSED' && "bg-blue-500",
                                  "w-4 h-4"
                                )} />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-base text-gray-900 truncate">
                                  {student.firstName} {student.lastName}
                                  {student.middleName && ` ${student.middleName}`}
                                </h3>
                                {hasStatus && (
                                  <Badge className={cn("text-xs font-medium", getStatusColor(currentAttendance.status))}>
                                    {statusConfig?.label}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <span className="font-mono">{student.admissionNumber}</span>
                                {student.house && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border"
                                    style={{
                                      backgroundColor: student.house.color + '15',
                                      color: student.house.color,
                                      borderColor: student.house.color + '40'
                                    }}
                                  >
                                    {student.house.name}
                                  </Badge>
                                )}
                                {student.attendance && (
                                  <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    <span className="text-xs text-blue-600">Previously marked</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status Selection Buttons for List View */}
                          <div className="flex items-center space-x-2 shrink-0">
                            {ATTENDANCE_STATUSES.map((status) => {
                              const Icon = status.icon;
                              const isStatusSelected = currentAttendance.status === status.value;

                              return (
                                <button
                                  key={status.value}
                                  onClick={() => updateStudentAttendance(student.id, 'status', status.value)}
                                  className={cn(
                                    "p-2 rounded-lg border-2 transition-all hover:scale-110 active:scale-95",
                                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                                    isStatusSelected
                                      ? `${status.borderColor} ${status.bgColor} shadow-sm`
                                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                                  )}
                                  title={`Mark as ${status.label} (Shortcut: ${status.shortcut})`}
                                >
                                  <Icon className={cn(
                                    "h-4 w-4 transition-colors",
                                    isStatusSelected ? status.color.replace('text-', 'text-') : 'text-gray-400 hover:text-gray-600'
                                  )} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              {filteredStudents.length === 0 && (
                <Card className="border-dashed border-2 border-gray-300 bg-gray-50">
                  <CardContent className="py-16">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                        {searchTerm || filterStatus !== 'all' ? (
                          <Search className="h-8 w-8 text-gray-400" />
                        ) : (
                          <Users className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {searchTerm || filterStatus !== 'all' ? 'No matching students' : 'No students found'}
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                          {searchTerm || filterStatus !== 'all' 
                            ? 'Try adjusting your search terms or filter criteria to find students.'
                            : 'This class appears to be empty. Check if students are enrolled in this class.'
                          }
                        </p>
                      </div>

                      {(searchTerm || filterStatus !== 'all') && (
                        <div className="flex justify-center space-x-3">
                          <Button 
                            intent="secondary" 
                            size="sm"
                            onClick={() => {
                              setSearchTerm('');
                              setFilterStatus('all');
                            }}
                          >
                            Clear Filters
                          </Button>
                          <Button 
                            intent="secondary" 
                            size="sm"
                            onClick={fetchClassRoster}
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Session Notes */}
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-800">
                <FileText className="h-5 w-5 mr-2" />
                Session Notes
                <Badge variant="outline" className="ml-2 text-xs">
                  Optional
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add any notes about this attendance session, special circumstances, or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] bg-white border-gray-300 focus:border-blue-400 resize-none"
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-gray-500">
                  These notes will be saved with the attendance record
                </p>
                <span className="text-xs text-gray-400">
                  {notes.length}/500
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Floating Save Button for Mobile */}
          <div className="fixed bottom-6 right-6 lg:hidden z-50">
            <Button
              intent="primary"
              onClick={() => submitAttendance()}
              disabled={saving || progressStats.marked === 0}
              loading={saving}
              loadingText="Saving..."
              className="shadow-2xl h-14 px-6 rounded-full text-base font-semibold"
            >
              <Save className="h-5 w-5 mr-2" />
              Save ({progressStats.marked})
            </Button>
          </div>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default TakeAttendanceNew;