import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
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
  Input,
  DatePicker
} from '@/components/ui';
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
  Upload
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  admissionNumber: string;
  profileImage?: string;  // Legacy field for backward compatibility
  profileImageUrl?: string;  // New S3 CDN URL field
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
  { value: 'PRESENT', label: 'Present', icon: UserCheck, color: 'bg-green-100 text-green-800' },
  { value: 'ABSENT', label: 'Absent', icon: UserX, color: 'bg-red-100 text-red-800' },
  { value: 'LATE', label: 'Late', icon: Timer, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'EXCUSED', label: 'Excused', icon: Clock4, color: 'bg-blue-100 text-blue-800' }
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
  { value: 'PERIOD_6', label: 'Period 6' }
];

const TakeAttendance: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const [searchParams] = useSearchParams();

  const [rosterData, setRosterData] = useState<RosterData | null>(null);
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get('period') || 'FULL_DAY');
  const [selectedSubjectId, setSelectedSubjectId] = useState(searchParams.get('subjectId') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [quickActions, setQuickActions] = useState({
    markAllPresent: false,
    markAllAbsent: false
  });

  useEffect(() => {
    if (classId) {
      fetchClassRoster();
    }
  }, [classId, selectedDate, selectedPeriod, selectedSubjectId]);

  const fetchClassRoster = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        period: selectedPeriod,
        ...(selectedSubjectId && { subjectId: selectedSubjectId })
      });

      const response = await fetch(`/api/attendance/class/${classId}/roster?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRosterData(data.data);

        // Initialize attendance data from existing records
        const initialAttendanceData: Record<string, any> = {};
        data.data.roster.forEach((student: Student) => {
          if (student.attendance) {
            initialAttendanceData[student.id] = {
              status: student.attendance.status,
              notes: student.attendance.notes || '',
              checkInTime: student.attendance.checkInTime || ''
            };
          } else {
            initialAttendanceData[student.id] = {
              status: '',
              notes: '',
              checkInTime: ''
            };
          }
        });
        setAttendanceData(initialAttendanceData);
      } else {
        toast.error('Failed to fetch class roster');
      }
    } catch (error) {
      console.error('Error fetching class roster:', error);
      toast.error('Error fetching class roster');
    } finally {
      setLoading(false);
    }
  };

  const updateStudentAttendance = (studentId: string, field: string, value: any) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const submitAttendance = async () => {
    if (!rosterData) return;

    setSaving(true);
    try {
      // Prepare attendance data for API
      const attendanceDataArray = rosterData.roster.map(student => ({
        studentId: student.id,
        status: attendanceData[student.id]?.status || 'PRESENT',
        notes: attendanceData[student.id]?.notes || '',
        checkInTime: attendanceData[student.id]?.checkInTime || new Date().toISOString(),
        isLateArrival: attendanceData[student.id]?.status === 'LATE',
        lateMinutes: attendanceData[student.id]?.status === 'LATE' ? 15 : 0
      })).filter(item => item.status); // Only submit students with status

      const response = await fetch(`/api/attendance/class/${classId}/take`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          attendanceData: attendanceDataArray,
          date: selectedDate,
          period: selectedPeriod,
          subjectId: selectedSubjectId || null,
          method: 'MANUAL'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Attendance saved successfully! ${result.data.created} created, ${result.data.updated} updated`);

        // Refresh the roster to show updated data
        await fetchClassRoster();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to save attendance');
      }
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const applyQuickAction = (action: 'present' | 'absent' | 'reset') => {
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
        case 'reset':
          newAttendanceData[student.id] = {
            status: '',
            notes: '',
            checkInTime: ''
          };
          break;
      }
    });

    setAttendanceData(newAttendanceData);

    if (action === 'present') {
      toast.success('Marked all students as present');
    } else if (action === 'absent') {
      toast.success('Marked all students as absent');
    } else {
      toast.success('Reset all attendance data');
    }
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

  const filteredStudents = rosterData?.roster.filter(student => {
    const matchesSearch = searchTerm === '' ||
      `${student.firstName} ${student.lastName} ${student.admissionNumber}`.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' ||
      attendanceData[student.id]?.status === filterStatus ||
      (filterStatus === 'unmarked' && !attendanceData[student.id]?.status);

    return matchesSearch && matchesFilter;
  }) || [];

  const getProgressStats = () => {
    if (!rosterData) return { marked: 0, total: 0, percentage: 0 };

    const marked = rosterData.roster.filter(student =>
      attendanceData[student.id]?.status
    ).length;

    return {
      marked,
      total: rosterData.roster.length,
      percentage: rosterData.roster.length > 0 ? Math.round((marked / rosterData.roster.length) * 100) : 0
    };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading class roster...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!rosterData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Class Not Found</h3>
          <p className="text-gray-600">The requested class could not be found.</p>
        </div>
      </Layout>
    );
  }

  const progressStats = getProgressStats();

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Take Attendance
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {rosterData.class.name} - {rosterData.class.grade} • {rosterData.roster.length} students
            </p>
          </div>
          <div className="flex space-x-3">
            <Button intent="secondary" size="sm">
              <QrCode className="h-4 w-4 mr-2" />
              Generate QR
            </Button>
            <Button intent="secondary" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Settings and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Date">
                <DatePicker
                  value={selectedDate ? new Date(selectedDate) : undefined}
                  onChange={(date) => setSelectedDate(date ? date.toISOString().split('T')[0] : '')}
                  placeholder="Select date"
                  className="w-full"
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

              <FormField label="Search Students">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </FormField>

              <FormField label="Filter Status">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="unmarked">Unmarked</SelectItem>
                    {ATTENDANCE_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Progress and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {progressStats.marked} of {progressStats.total} marked
                    </span>
                  </div>
                  <StatusBadge
                    variant={progressStats.percentage === 100 ? "success" : "warning"}
                    icon={progressStats.percentage === 100 ? CheckCircle : AlertCircle}
                  >
                    {progressStats.percentage}% Complete
                  </StatusBadge>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressStats.percentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                intent="success"
                className="w-full justify-start"
                size="sm"
                onClick={() => applyQuickAction('present')}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark All Present
              </Button>
              <Button
                intent="danger"
                className="w-full justify-start"
                size="sm"
                onClick={() => applyQuickAction('absent')}
              >
                <UserX className="h-4 w-4 mr-2" />
                Mark All Absent
              </Button>
              <Button
                intent="secondary"
                className="w-full justify-start"
                size="sm"
                onClick={() => applyQuickAction('reset')}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Student Roster */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Student Attendance ({filteredStudents.length})</CardTitle>
            <Button
              intent="primary"
              onClick={submitAttendance}
              disabled={saving || progressStats.marked === 0}
              loading={saving}
              loadingText="Saving..."
            >
              <Save className="h-4 w-4 mr-2" />
              Save Attendance
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const currentAttendance = attendanceData[student.id] || {};

                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {student.profileImageUrl || student.profileImage ? (
                          <img
                            src={student.profileImageUrl || student.profileImage}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                          {student.middleName && ` ${student.middleName}`}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{student.admissionNumber}</span>
                          {student.house && (
                            <Badge
                              className="text-xs"
                              style={{ backgroundColor: student.house.color + '20', color: student.house.color }}
                            >
                              {student.house.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Status Selection */}
                      <div className="flex space-x-2">
                        {ATTENDANCE_STATUSES.map((status) => {
                          const Icon = status.icon;
                          const isSelected = currentAttendance.status === status.value;

                          return (
                            <button
                              key={status.value}
                              onClick={() => updateStudentAttendance(student.id, 'status', status.value)}
                              className={`
                                p-2 rounded-lg border-2 transition-all
                                ${isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                              `}
                              title={status.label}
                            >
                              <Icon className={`h-4 w-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
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

                      {/* Existing Attendance Indicator */}
                      {student.attendance && (
                        <StatusBadge variant="info" icon={CheckCircle}>
                          Previously Marked
                        </StatusBadge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No students found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TakeAttendance;