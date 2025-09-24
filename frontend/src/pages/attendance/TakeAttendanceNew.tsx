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
  Send
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
        const classes = Array.isArray(result.data) ? result.data : result.data.classes || [];
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
        setRosterData(result.data);

        // Initialize attendance data from existing records
        const initialAttendanceData: Record<string, any> = {};
        result.data.roster.forEach((student: Student) => {
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
          toast.success(`Attendance saved! ${result.data.created} created, ${result.data.updated} updated`);
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
            <PageTitle>Take Attendance</PageTitle>
            <PageDescription>Select a class to mark attendance</PageDescription>
          </PageHeader>
          <PageContent>
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Select Class</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingClasses ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-gray-600 mt-2">Loading classes...</p>
                    </div>
                  ) : availableClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableClasses.map((classItem) => (
                        <Card
                          key={classItem.id}
                          className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                          onClick={() => navigate(`/attendance/take/${classItem.id}`)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-lg">{classItem.name}</h3>
                                <p className="text-gray-600">{classItem.grade}</p>
                                <p className="text-sm text-gray-500">Capacity: {classItem.capacity}</p>
                              </div>
                              <div className="text-blue-600">
                                <UserCheck className="h-6 w-6" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Available</h3>
                      <p className="text-gray-600">No classes found for attendance marking.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Button intent="secondary" size="sm" onClick={() => navigate('/attendance')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <PageTitle>{rosterData.class.name} - {rosterData.class.grade}</PageTitle>
              </div>
              <PageDescription>
                Taking attendance for {rosterData.roster.length} students • {new Date(selectedDate).toLocaleDateString()}
              </PageDescription>
            </div>

            <div className="flex items-center space-x-3">
              <StatusBadge
                variant={progressStats.percentage === 100 ? "success" : "warning"}
                icon={progressStats.percentage === 100 ? CheckCircle : Activity}
              >
                {progressStats.percentage}% Complete
              </StatusBadge>

              <div className="flex items-center space-x-2">
                <Button intent="secondary" size="sm" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
                  {viewMode === 'list' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </Button>

                <Button intent="secondary" size="sm">
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>

                <Button
                  intent="primary"
                  onClick={() => submitAttendance()}
                  disabled={saving || progressStats.marked === 0}
                  loading={saving}
                  loadingText="Saving..."
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Attendance
                </Button>
              </div>
            </div>
          </div>
        </PageHeader>

        <PageContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <FormField label="Date">
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Period">
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
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

                  <FormField label="Search">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </FormField>

                  <FormField label="Filter">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="unmarked">Unmarked</SelectItem>
                        {ATTENDANCE_STATUSES.map(status => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Options">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={bulkMode}
                        onCheckedChange={setBulkMode}
                        id="bulk-mode"
                      />
                      <label htmlFor="bulk-mode" className="text-sm">Bulk Mode</label>
                    </div>
                  </FormField>
                </div>
              </CardContent>
            </Card>

            {/* Settings Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                    id="auto-save"
                  />
                  <label htmlFor="auto-save" className="text-sm">Auto-save</label>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">Keyboard Shortcuts:</p>
                  <div className="space-y-1 text-xs">
                    {ATTENDANCE_STATUSES.map(status => (
                      <div key={status.value} className="flex justify-between">
                        <span>{status.label}</span>
                        <Badge variant="outline" className="text-xs">{status.shortcut}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Progress Overview
                  <div className="text-sm font-normal text-gray-500">
                    {progressStats.marked} of {progressStats.total} students
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressStats.percentage}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-green-600">{progressStats.present}</div>
                      <div className="text-xs text-gray-500">Present</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-red-600">{progressStats.absent}</div>
                      <div className="text-xs text-gray-500">Absent</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-yellow-600">{progressStats.late}</div>
                      <div className="text-xs text-gray-500">Late</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-blue-600">{progressStats.excused}</div>
                      <div className="text-xs text-gray-500">Excused</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    intent="success"
                    size="sm"
                    onClick={() => applyQuickAction('present')}
                    className="justify-start"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    All Present
                  </Button>
                  <Button
                    intent="danger"
                    size="sm"
                    onClick={() => applyQuickAction('absent')}
                    className="justify-start"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    All Absent
                  </Button>
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={() => applyQuickAction('reset')}
                    className="justify-start"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset All
                  </Button>
                  <Button
                    intent="secondary"
                    size="sm"
                    onClick={fetchClassRoster}
                    className="justify-start"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bulk Mode Controls */}
          {bulkMode && selectedStudents.size > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline" className="bg-white">
                      {selectedStudents.size} selected
                    </Badge>
                    <div className="flex space-x-2">
                      {ATTENDANCE_STATUSES.map(status => {
                        const Icon = status.icon;
                        return (
                          <Button
                            key={status.value}
                            size="sm"
                            intent="secondary"
                            onClick={() => applyStatusToSelected(status.value)}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {status.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" intent="secondary" onClick={selectAllFiltered}>
                      Select All Filtered
                    </Button>
                    <Button size="sm" intent="secondary" onClick={clearSelection}>
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
                viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"
              )}>
                {filteredStudents.map((student) => {
                  const currentAttendance = attendanceData[student.id] || {};
                  const isSelected = selectedStudents.has(student.id);

                  return (
                    <div
                      key={student.id}
                      className={cn(
                        "border rounded-lg p-4 transition-all hover:shadow-md",
                        isSelected && bulkMode ? "border-blue-500 bg-blue-50" : "border-gray-200",
                        currentAttendance.status && !isSelected ? ATTENDANCE_STATUSES.find(s => s.value === currentAttendance.status)?.bgColor : ""
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {bulkMode && (
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleStudentSelection(student.id)}
                            />
                          )}

                          <div className="flex-shrink-0">
                            {student.profileImageUrl || student.profileImage ? (
                              <img
                                src={student.profileImageUrl || student.profileImage}
                                alt={`${student.firstName} ${student.lastName}`}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="h-6 w-6 text-gray-500" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                              {student.middleName && ` ${student.middleName}`}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                              <span>{student.admissionNumber}</span>
                              {student.house && (
                                <Badge
                                  className="text-xs"
                                  style={{
                                    backgroundColor: student.house.color + '20',
                                    color: student.house.color,
                                    border: `1px solid ${student.house.color}40`
                                  }}
                                >
                                  {student.house.name}
                                </Badge>
                              )}
                              {student.attendance && (
                                <StatusBadge variant="info" className="text-xs">
                                  Previously Marked
                                </StatusBadge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Status Selection Buttons */}
                          <div className="flex space-x-1">
                            {ATTENDANCE_STATUSES.map((status) => {
                              const Icon = status.icon;
                              const isSelected = currentAttendance.status === status.value;

                              return (
                                <button
                                  key={status.value}
                                  onClick={() => updateStudentAttendance(student.id, 'status', status.value)}
                                  className={cn(
                                    "p-2 rounded-lg border-2 transition-all hover:scale-105",
                                    isSelected
                                      ? `${status.borderColor} ${status.bgColor}`
                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  )}
                                  title={`${status.label} (Press ${status.shortcut})`}
                                >
                                  <Icon className={cn(
                                    "h-4 w-4",
                                    isSelected ? 'text-current' : 'text-gray-500'
                                  )} />
                                </button>
                              );
                            })}
                          </div>

                          {/* Current Status Badge */}
                          {currentAttendance.status && (
                            <Badge className={getStatusColor(currentAttendance.status)}>
                              {getStatusIcon(currentAttendance.status)}
                              <span className="ml-1">
                                {ATTENDANCE_STATUSES.find(s => s.value === currentAttendance.status)?.label}
                              </span>
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Additional Controls in Grid Mode */}
                      {viewMode === 'grid' && currentAttendance.status && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          <Input
                            placeholder="Add notes..."
                            value={currentAttendance.notes || ''}
                            onChange={(e) => updateStudentAttendance(student.id, 'notes', e.target.value)}
                            className="text-sm"
                          />
                          {currentAttendance.status === 'LATE' && (
                            <Input
                              type="number"
                              placeholder="Minutes late..."
                              className="text-sm"
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No students found</p>
                  <p className="text-sm text-gray-400">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Session Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes for this attendance session..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default TakeAttendanceNew;