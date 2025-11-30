import React, { useState, useEffect } from 'react';
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
  StatusBadge,
  Input
} from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  User,
  Calendar as CalendarIcon,
  Clock,
  Users,
  UserCheck,
  UserX,
  Timer,
  TrendingUp,
  TrendingDown,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  RefreshCw,
  ArrowLeft,
  GraduationCap,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  Home,
  Star,
  Target,
  Activity,
  FileText,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { get } from '@/services/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  admissionNumber: string;
  profileImage?: string;
  profileImageUrl?: string;
  dateOfBirth?: string;
  email?: string;
  phone?: string;
  class: {
    id: string;
    name: string;
    grade: string;
  };
  house?: {
    name: string;
    color: string;
  };
  guardians: Array<{
    id: string;
    firstName: string;
    lastName: string;
    relationship: string;
    phone: string;
    email: string;
  }>;
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'PARTIAL';
  period: string;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
  subject?: {
    name: string;
    code: string;
  };
  markedBy: {
    name: string;
    role: string;
  };
  method: string;
  location?: any;
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  partialDays: number;
  attendanceRate: number;
  monthlyStats: Array<{
    month: string;
    present: number;
    absent: number;
    late: number;
    rate: number;
  }>;
  subjectStats: Array<{
    subject: string;
    present: number;
    total: number;
    rate: number;
  }>;
  trends: Array<{
    date: string;
    status: string;
    rate: number;
  }>;
}

interface AcademicPeriod {
  id: string;
  name: string;
  type: 'TERM' | 'SEMESTER' | 'YEAR';
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface StudentAttendanceData {
  student: Student;
  academicPeriods: AcademicPeriod[];
  currentPeriod: AcademicPeriod;
  stats: AttendanceStats;
  records: AttendanceRecord[];
  calendarData: Record<string, AttendanceRecord[]>;
}

const STATUS_CONFIG = {
  PRESENT: { color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50', icon: UserCheck },
  ABSENT: { color: 'bg-red-100 text-red-800', bgColor: 'bg-red-50', icon: UserX },
  LATE: { color: 'bg-yellow-100 text-yellow-800', bgColor: 'bg-yellow-50', icon: Timer },
  EXCUSED: { color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50', icon: CheckCircle },
  PARTIAL: { color: 'bg-purple-100 text-purple-800', bgColor: 'bg-purple-50', icon: Clock }
};

const CHART_COLORS = {
  present: '#10b981',
  absent: '#ef4444',
  late: '#f59e0b',
  excused: '#3b82f6',
  partial: '#8b5cf6'
};

const StudentAttendanceView: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<StudentAttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId, selectedPeriod]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      // Check for date range in URL params first (from attendance reports page)
      const urlStartDate = searchParams.get('startDate');
      const urlEndDate = searchParams.get('endDate');

      const params = {
        ...(selectedPeriod && { periodId: selectedPeriod }),
        ...(urlStartDate && { startDate: urlStartDate }),
        ...(urlEndDate && { endDate: urlEndDate })
      };

      const result = await get(`/students/${studentId}/attendance`, params);

      if (result.success) {
        setData(result.data);
        if (!selectedPeriod && result.data.currentPeriod) {
          setSelectedPeriod(result.data.currentPeriod.id);
        }
      } else {
        toast.error(result.message || 'Failed to fetch student attendance data');
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Error loading student data');
    } finally {
      setLoading(false);
    }
  };

  const getCalendarDayData = (date: Date) => {
    if (!data) return null;
    const dateStr = date.toISOString().split('T')[0];
    return data.calendarData[dateStr] || null;
  };

  const getCalendarDayStyle = (date: Date) => {
    const dayData = getCalendarDayData(date);
    if (!dayData || dayData.length === 0) return '';

    // Get the most significant status for the day
    const statuses = dayData.map(record => record.status);
    if (statuses.includes('ABSENT')) return 'bg-red-100 text-red-800 font-medium';
    if (statuses.includes('LATE')) return 'bg-yellow-100 text-yellow-800 font-medium';
    if (statuses.includes('PARTIAL')) return 'bg-purple-100 text-purple-800 font-medium';
    if (statuses.includes('EXCUSED')) return 'bg-blue-100 text-blue-800 font-medium';
    if (statuses.includes('PRESENT')) return 'bg-green-100 text-green-800 font-medium';

    return '';
  };

  const generateReport = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}/attendance/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          periodId: selectedPeriod,
          includeCharts: true,
          includeNotes: true
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data?.student.firstName}_${data?.student.lastName}_Attendance_Report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report downloaded successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    }
  };

  const getAttendanceStatus = (rate: number) => {
    if (rate >= 90) return { label: 'Excellent', variant: 'success' as const, color: 'text-green-600' };
    if (rate >= 80) return { label: 'Good', variant: 'warning' as const, color: 'text-yellow-600' };
    if (rate >= 70) return { label: 'Fair', variant: 'warning' as const, color: 'text-orange-600' };
    return { label: 'Poor', variant: 'destructive' as const, color: 'text-red-600' };
  };

  const filteredRecords = data?.records.filter(record => {
    const matchesPeriod = filterPeriod === 'all' || record.period === filterPeriod;
    const matchesSubject = filterSubject === 'all' || record.subject?.code === filterSubject;
    return matchesPeriod && matchesSubject;
  }) || [];

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading student attendance...</p>
            </div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <PageContainer>
          <div className="text-center py-12">
            <User className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Student Not Found</h3>
            <p className="text-gray-600">The requested student could not be found.</p>
            <Button intent="primary" className="mt-4" onClick={() => navigate('/students')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  const attendanceStatus = getAttendanceStatus(data.stats.attendanceRate);

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start space-x-4">
              <Button intent="secondary" size="sm" onClick={() => navigate('/students')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={data.student.profileImageUrl || data.student.profileImage} />
                  <AvatarFallback>
                    {data.student.firstName[0]}{data.student.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <PageTitle>
                    {data.student.firstName} {data.student.lastName}
                    {data.student.middleName && ` ${data.student.middleName}`}
                  </PageTitle>
                  <div className="flex items-center space-x-4 mt-1">
                    <PageDescription>
                      {data.student.admissionNumber} • {data.student.class.name} - {data.student.class.grade}
                    </PageDescription>
                    {data.student.house && (
                      <Badge
                        style={{
                          backgroundColor: data.student.house.color + '20',
                          color: data.student.house.color,
                          border: `1px solid ${data.student.house.color}40`
                        }}
                      >
                        {data.student.house.name}
                      </Badge>
                    )}
                    <StatusBadge variant={attendanceStatus.variant}>
                      {attendanceStatus.label} ({data.stats.attendanceRate.toFixed(1)}%)
                    </StatusBadge>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {data.academicPeriods.map(period => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name} {period.isCurrent && '(Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button intent="secondary" size="sm" onClick={generateReport}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button intent="secondary" size="sm" onClick={fetchStudentData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${attendanceStatus.color}`}>
                  {data.stats.attendanceRate.toFixed(1)}%
                </div>
                <Progress value={data.stats.attendanceRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Present Days</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {data.stats.presentDays}
                </div>
                <p className="text-xs text-muted-foreground">
                  out of {data.stats.totalDays} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {data.stats.absentDays}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((data.stats.absentDays / data.stats.totalDays) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Late Days</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {data.stats.lateDays}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((data.stats.lateDays / data.stats.totalDays) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Excused Days</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {data.stats.excusedDays}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((data.stats.excusedDays / data.stats.totalDays) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="records">Records</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Monthly Attendance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={data.stats.monthlyStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="rate"
                          stroke={CHART_COLORS.present}
                          fill={CHART_COLORS.present}
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Attendance Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Present', value: data.stats.presentDays, color: CHART_COLORS.present },
                            { name: 'Absent', value: data.stats.absentDays, color: CHART_COLORS.absent },
                            { name: 'Late', value: data.stats.lateDays, color: CHART_COLORS.late },
                            { name: 'Excused', value: data.stats.excusedDays, color: CHART_COLORS.excused }
                          ].filter(item => item.value > 0)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Present', value: data.stats.presentDays, color: CHART_COLORS.present },
                            { name: 'Absent', value: data.stats.absentDays, color: CHART_COLORS.absent },
                            { name: 'Late', value: data.stats.lateDays, color: CHART_COLORS.late },
                            { name: 'Excused', value: data.stats.excusedDays, color: CHART_COLORS.excused }
                          ].filter(item => item.value > 0).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Subject Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>Subject-wise Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.stats.subjectStats.map((subject, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{subject.subject}</span>
                            <span className={`font-bold ${getAttendanceStatus(subject.rate).color}`}>
                              {subject.rate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress value={subject.rate} className="flex-1" />
                            <span className="text-sm text-gray-500">
                              {subject.present}/{subject.total}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Attendance Calendar</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" intent="secondary" onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                          {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <Button size="sm" intent="secondary" onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      month={selectedMonth}
                      onMonthChange={setSelectedMonth}
                      modifiers={{
                        present: (date) => {
                          const dayData = getCalendarDayData(date);
                          return dayData?.some(record => record.status === 'PRESENT') || false;
                        },
                        absent: (date) => {
                          const dayData = getCalendarDayData(date);
                          return dayData?.some(record => record.status === 'ABSENT') || false;
                        },
                        late: (date) => {
                          const dayData = getCalendarDayData(date);
                          return dayData?.some(record => record.status === 'LATE') || false;
                        },
                        excused: (date) => {
                          const dayData = getCalendarDayData(date);
                          return dayData?.some(record => record.status === 'EXCUSED') || false;
                        }
                      }}
                      modifiersStyles={{
                        present: { backgroundColor: '#dcfce7', color: '#166534', fontWeight: 'bold' },
                        absent: { backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 'bold' },
                        late: { backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold' },
                        excused: { backgroundColor: '#dbeafe', color: '#2563eb', fontWeight: 'bold' }
                      }}
                      className="rounded-md border w-full"
                    />
                  </CardContent>
                </Card>

                {/* Legend and Month Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Legend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-green-200 rounded"></div>
                        <span className="text-sm">Present</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-red-200 rounded"></div>
                        <span className="text-sm">Absent</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                        <span className="text-sm">Late</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-blue-200 rounded"></div>
                        <span className="text-sm">Excused</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-medium mb-3">This Month Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Present:</span>
                          <span className="font-medium text-green-600">
                            {data.stats.monthlyStats.find(m => m.month === selectedMonth.toLocaleDateString('en-US', { month: 'short' }))?.present || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Absent:</span>
                          <span className="font-medium text-red-600">
                            {data.stats.monthlyStats.find(m => m.month === selectedMonth.toLocaleDateString('en-US', { month: 'short' }))?.absent || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Late:</span>
                          <span className="font-medium text-yellow-600">
                            {data.stats.monthlyStats.find(m => m.month === selectedMonth.toLocaleDateString('en-US', { month: 'short' }))?.late || 0}
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-medium">
                          <span>Rate:</span>
                          <span className={getAttendanceStatus(data.stats.monthlyStats.find(m => m.month === selectedMonth.toLocaleDateString('en-US', { month: 'short' }))?.rate || 0).color}>
                            {(data.stats.monthlyStats.find(m => m.month === selectedMonth.toLocaleDateString('en-US', { month: 'short' }))?.rate || 0).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Records Tab */}
            <TabsContent value="records" className="space-y-6">
              {/* Filters */}
              <div className="flex space-x-4">
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Periods</SelectItem>
                    <SelectItem value="FULL_DAY">Full Day</SelectItem>
                    <SelectItem value="MORNING">Morning</SelectItem>
                    <SelectItem value="AFTERNOON">Afternoon</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterSubject} onValueChange={setFilterSubject}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {data.stats.subjectStats.map((subject, index) => (
                      <SelectItem key={index} value={subject.subject}>
                        {subject.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Records Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Records ({filteredRecords.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Check-in Time</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Marked By</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.slice(0, 50).map((record) => {
                        const StatusIcon = STATUS_CONFIG[record.status]?.icon || User;
                        return (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {new Date(record.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <StatusIcon className="h-4 w-4" />
                                <Badge className={STATUS_CONFIG[record.status]?.color}>
                                  {record.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{record.period}</TableCell>
                            <TableCell>
                              {record.subject ? (
                                <div>
                                  <div className="font-medium">{record.subject.name}</div>
                                  <div className="text-sm text-gray-500">{record.subject.code}</div>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {record.checkInTime ? (
                                new Date(record.checkInTime).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{record.method}</Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{record.markedBy.name}</div>
                                <div className="text-sm text-gray-500">{record.markedBy.role}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.notes ? (
                                <span className="text-sm">{record.notes}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  {filteredRecords.length === 0 && (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No attendance records found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Patterns */}
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Attendance Pattern</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { day: 'Mon', rate: 95.2 },
                        { day: 'Tue', rate: 92.8 },
                        { day: 'Wed', rate: 89.1 },
                        { day: 'Thu', rate: 93.1 },
                        { day: 'Fri', rate: 87.4 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="rate" fill={CHART_COLORS.present} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Punctuality Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Punctuality Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium">On Time</span>
                        </div>
                        <span className="text-2xl font-bold text-green-600">
                          {((data.stats.presentDays / data.stats.totalDays) * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Timer className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium">Late Arrivals</span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-600">
                          {((data.stats.lateDays / data.stats.totalDays) * 100).toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="font-medium">Absences</span>
                        </div>
                        <span className="text-2xl font-bold text-red-600">
                          {((data.stats.absentDays / data.stats.totalDays) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Student Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Full Name</label>
                          <p className="mt-1 text-sm">
                            {data.student.firstName} {data.student.middleName} {data.student.lastName}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Admission Number</label>
                          <p className="mt-1 text-sm">{data.student.admissionNumber}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Class</label>
                          <p className="mt-1 text-sm">{data.student.class.name} - {data.student.class.grade}</p>
                        </div>
                        {data.student.house && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">House</label>
                            <p className="mt-1 text-sm">{data.student.house.name}</p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-4">
                        {data.student.dateOfBirth && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                            <p className="mt-1 text-sm">{new Date(data.student.dateOfBirth).toLocaleDateString()}</p>
                          </div>
                        )}
                        {data.student.email && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Email</label>
                            <p className="mt-1 text-sm">{data.student.email}</p>
                          </div>
                        )}
                        {data.student.phone && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">Phone</label>
                            <p className="mt-1 text-sm">{data.student.phone}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Guardians</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {((data.student as any).guardianStudents || []).map((guardianStudent: any) => {
                        const guardian = guardianStudent.guardian || guardianStudent;
                        const relationship = guardianStudent.relationship || guardian.relationship || 'Guardian';
                        
                        return (
                          <div key={guardian.id || `guardian-${guardian.firstName}-${guardian.lastName}`} className="p-3 border rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium">{guardian.firstName} {guardian.lastName}</h4>
                              <Badge variant="outline" className="text-xs">
                                {relationship.charAt(0).toUpperCase() + relationship.slice(1).toLowerCase()}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center space-x-2">
                                <Phone className="h-3 w-3" />
                                <span>{guardian.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Mail className="h-3 w-3" />
                                <span>{guardian.email}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default StudentAttendanceView;