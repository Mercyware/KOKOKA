import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Input,
  FormField
} from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  FileText,
  Download,
  Filter,
  Search,
  Calendar as CalendarIcon,
  Users,
  UserCheck,
  UserX,
  Timer,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  GraduationCap,
  Eye,
  RefreshCw,
  Plus,
  Settings,
  Target,
  BookOpen,
  MapPin,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { get, post } from '../../services/api';

interface AttendanceReport {
  id: string;
  title: string;
  description: string;
  reportType: string;
  fromDate: string;
  toDate: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
  generatedAt: string;
  fileUrl?: string;
  summary: {
    totalDays: number;
    totalStudents: number;
    averageAttendance: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
}

interface ClassSummary {
  id: string;
  name: string;
  grade: string;
  totalStudents: number;
  attendanceRate: number;
  present: number;
  absent: number;
  late: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

interface StudentSummary {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: {
    name: string;
    grade: string;
  };
  attendanceRate: number;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  status: 'good' | 'warning' | 'critical';
}

interface AcademicPeriod {
  id: string;
  name: string;
  type: 'TERM' | 'SEMESTER' | 'YEAR';
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface DashboardData {
  academicPeriods: AcademicPeriod[];
  currentPeriod: AcademicPeriod;
  overallStats: {
    totalStudents: number;
    totalClasses: number;
    averageAttendance: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
  };
  classSummaries: ClassSummary[];
  lowAttendanceStudents: StudentSummary[];
  recentReports: AttendanceReport[];
  trends: {
    daily: Array<{
      date: string;
      present: number;
      absent: number;
      late: number;
      percentage: number;
    }>;
    weekly: Array<{
      week: string;
      attendance: number;
    }>;
    monthly: Array<{
      month: string;
      attendance: number;
    }>;
  };
}

const REPORT_TYPES = [
  { value: 'DAILY', label: 'Daily Report' },
  { value: 'WEEKLY', label: 'Weekly Summary' },
  { value: 'MONTHLY', label: 'Monthly Report' },
  { value: 'TERM', label: 'Term Report' },
  { value: 'CUSTOM', label: 'Custom Range' }
];

const CHART_COLORS = {
  present: '#10b981',
  absent: '#ef4444',
  late: '#f59e0b',
  excused: '#3b82f6',
  primary: '#3b82f6',
  secondary: '#8b5cf6'
};

const AttendanceReportsNew: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Report Generation States
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    title: '',
    description: '',
    reportType: 'MONTHLY',
    includeCharts: true,
    includeStudentDetails: true,
    includeClassBreakdown: true,
    format: 'PDF'
  });

  useEffect(() => {
    fetchDashboardData();
    fetchReports();
  }, [selectedPeriod, selectedClass, dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        ...(selectedPeriod && { periodId: selectedPeriod }),
        ...(selectedClass !== 'all' && { classId: selectedClass }),
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      };

      const result = await get('/attendance/reports/dashboard', params);

      if (result.success) {
        setDashboardData(result.data);
        if (!selectedPeriod && result.data.currentPeriod) {
          setSelectedPeriod(result.data.currentPeriod.id);
        }
      } else {
        toast.error(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const params = {
        ...(selectedClass !== 'all' && { classId: selectedClass }),
        startDate: dateRange.from.toISOString(),
        endDate: dateRange.to.toISOString()
      };

      const result = await get('/attendance/reports', params);

      if (result.success) {
        setReports(result.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setReportsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const result = await post('/attendance/reports/generate', {
        ...reportConfig,
        fromDate: dateRange.from.toISOString(),
        toDate: dateRange.to.toISOString(),
        filters: {
          ...(selectedClass !== 'all' && { classes: [selectedClass] }),
          ...(selectedPeriod && { periodId: selectedPeriod })
        }
      });

      if (result.success) {
        toast.success('Report generation started. You will be notified when complete.');
        setShowReportDialog(false);
        setTimeout(fetchReports, 2000); // Refresh reports list
      } else {
        toast.error(result.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    }
  };

  const downloadReport = async (reportId: string, title: string) => {
    try {
      // For file downloads, we still need to use fetch but with proper API base URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/attendance/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': 'greenwood' // TODO: Get this from the API service
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast.error('Failed to download report');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Error downloading report');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <StatusBadge variant="success" icon={CheckCircle}>Completed</StatusBadge>;
      case 'GENERATING':
        return <StatusBadge variant="warning" icon={Clock}>Generating</StatusBadge>;
      case 'PENDING':
        return <StatusBadge variant="secondary" icon={Timer}>Pending</StatusBadge>;
      case 'FAILED':
        return <StatusBadge variant="destructive" icon={AlertTriangle}>Failed</StatusBadge>;
      default:
        return <StatusBadge variant="secondary">Unknown</StatusBadge>;
    }
  };

  const getAttendanceStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable', value: number) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className={`h-4 w-4 ${value > 0 ? 'text-green-600' : 'text-red-600'}`} />;
      case 'down':
        return <ArrowDownRight className={`h-4 w-4 ${value > 0 ? 'text-red-600' : 'text-green-600'}`} />;
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const filteredStudents = dashboardData?.lowAttendanceStudents.filter(student => {
    const matchesSearch = searchTerm === '' ||
      `${student.firstName} ${student.lastName} ${student.admissionNumber}`.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter = filterStatus === 'all' || student.status === filterStatus;

    return matchesSearch && matchesFilter;
  }) || [];

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading attendance reports...</p>
            </div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex justify-between items-start">
            <div>
              <PageTitle>Attendance Reports & Analytics</PageTitle>
              <PageDescription>
                Comprehensive attendance analysis and reporting tools
                {dashboardData?.currentPeriod && (
                  <> • {dashboardData.currentPeriod.name}</>
                )}
              </PageDescription>
            </div>
            <div className="flex space-x-3">
              <Button intent="secondary" size="sm" onClick={fetchDashboardData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button intent="primary" size="sm" onClick={() => setShowReportDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          {/* Quick Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Period" />
              </SelectTrigger>
              <SelectContent>
                {dashboardData?.academicPeriods.map(period => (
                  <SelectItem key={period.id} value={period.id}>
                    {period.name} {period.isCurrent && '(Current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {dashboardData?.classSummaries.map(cls => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} - {cls.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DatePickerWithRange
              from={dateRange.from}
              to={dateRange.to}
              onSelect={(range) => range?.from && range?.to && setDateRange({ from: range.from, to: range.to })}
            />
          </div>

          {/* Overview Stats */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.overallStats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    Across {dashboardData.overallStats.totalClasses} classes
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.overallStats.averageAttendance.toFixed(1)}%
                  </div>
                  <Progress value={dashboardData.overallStats.averageAttendance} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.overallStats.presentToday}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardData.overallStats.absentToday} absent, {dashboardData.overallStats.lateToday} late
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Low Attendance</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {dashboardData.lowAttendanceStudents.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Students below 75%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content */}
          <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Trends */}
                {dashboardData?.trends.daily && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Attendance Trends (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dashboardData.trends.daily}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="percentage"
                            stroke={CHART_COLORS.primary}
                            fill={CHART_COLORS.primary}
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Top Performing Classes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Classes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData?.classSummaries
                        .sort((a, b) => b.attendanceRate - a.attendanceRate)
                        .slice(0, 5)
                        .map((cls, index) => (
                          <div key={cls.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                                index === 0 ? "bg-yellow-100 text-yellow-800" :
                                index === 1 ? "bg-gray-100 text-gray-800" :
                                index === 2 ? "bg-orange-100 text-orange-800" :
                                "bg-blue-100 text-blue-800"
                              )}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{cls.name}</p>
                                <p className="text-sm text-gray-500">{cls.grade} • {cls.totalStudents} students</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`font-bold ${getAttendanceStatusColor(cls.attendanceRate || 0)}`}>
                                {(cls.attendanceRate || 0).toFixed(1)}%
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                {getTrendIcon(cls.trend, cls.trendValue)}
                                <span className="ml-1">{Math.abs(cls.trendValue || 0).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reports</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData?.recentReports.slice(0, 5).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{report.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {report.reportType}
                              </Badge>
                              {getStatusBadge(report.status)}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {report.status === 'COMPLETED' && (
                              <Button
                                size="sm"
                                intent="secondary"
                                onClick={() => downloadReport(report.id, report.title)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            )}
                            <Button size="sm" intent="secondary">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData?.classSummaries.map((cls) => (
                  <Card key={cls.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div>
                        <CardTitle className="text-lg">{cls.name}</CardTitle>
                        <p className="text-sm text-gray-500">{cls.grade} • {cls.totalStudents} students</p>
                      </div>
                      <Building className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Attendance Rate</span>
                          <span className={`font-bold text-lg ${getAttendanceStatusColor(cls.attendanceRate || 0)}`}>
                            {(cls.attendanceRate || 0).toFixed(1)}%
                          </span>
                        </div>

                        <Progress value={cls.attendanceRate || 0} className="h-2" />

                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                          <div>
                            <div className="font-medium text-green-600">{cls.present}</div>
                            <div className="text-gray-500">Present</div>
                          </div>
                          <div>
                            <div className="font-medium text-red-600">{cls.absent}</div>
                            <div className="text-gray-500">Absent</div>
                          </div>
                          <div>
                            <div className="font-medium text-yellow-600">{cls.late}</div>
                            <div className="text-gray-500">Late</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center space-x-1 text-sm">
                            {getTrendIcon(cls.trend, cls.trendValue)}
                            <span className={cls.trend === 'up' ? 'text-green-600' : cls.trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                              {Math.abs(cls.trendValue || 0).toFixed(1)}% vs last period
                            </span>
                          </div>
                          <Button
                            size="sm"
                            intent="secondary"
                            onClick={() => navigate(`/attendance/reports/class/${cls.id}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              {/* Filters */}
              <div className="flex space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="critical">Critical (&lt;70%)</SelectItem>
                    <SelectItem value="warning">Warning (70-85%)</SelectItem>
                    <SelectItem value="good">Good (&gt;85%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Students Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Attendance Summary ({filteredStudents.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Attendance Rate</TableHead>
                        <TableHead>Total Days</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Late</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {student.admissionNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.class.name}</p>
                              <p className="text-sm text-gray-500">{student.class.grade}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className={`font-bold ${getAttendanceStatusColor(student.attendanceRate || student.percentage || 0)}`}>
                                {(student.attendanceRate || student.percentage || 0).toFixed(1)}%
                              </span>
                              <Progress value={student.attendanceRate || student.percentage || 0} className="w-16 h-2" />
                            </div>
                          </TableCell>
                          <TableCell>{student.totalDays}</TableCell>
                          <TableCell>
                            <span className="text-green-600 font-medium">{student.present}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600 font-medium">{student.absent}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-yellow-600 font-medium">{student.late}</span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              variant={
                                student.status === 'good' ? 'success' :
                                student.status === 'warning' ? 'warning' : 'destructive'
                              }
                            >
                              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                            </StatusBadge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              intent="secondary"
                              onClick={() => navigate(`/students/${student.id}/attendance`)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredStudents.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No students found matching your criteria</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance by Day of Week */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance by Day of Week</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { day: 'Mon', attendance: 92.5 },
                        { day: 'Tue', attendance: 94.2 },
                        { day: 'Wed', attendance: 91.8 },
                        { day: 'Thu', attendance: 93.1 },
                        { day: 'Fri', attendance: 89.4 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="attendance" fill={CHART_COLORS.primary} />
                      </BarChart>
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
                      <RechartsPieChart>
                        <Pie
                          data={[
                            { name: 'Present', value: dashboardData?.overallStats.presentToday || 0, color: CHART_COLORS.present },
                            { name: 'Absent', value: dashboardData?.overallStats.absentToday || 0, color: CHART_COLORS.absent },
                            { name: 'Late', value: dashboardData?.overallStats.lateToday || 0, color: CHART_COLORS.late }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: 'Present', value: dashboardData?.overallStats.presentToday || 0, color: CHART_COLORS.present },
                            { name: 'Absent', value: dashboardData?.overallStats.absentToday || 0, color: CHART_COLORS.absent },
                            { name: 'Late', value: dashboardData?.overallStats.lateToday || 0, color: CHART_COLORS.late }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Weekly Trends */}
                {dashboardData?.trends.weekly && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Weekly Attendance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dashboardData.trends.weekly}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="week" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="attendance"
                            stroke={CHART_COLORS.primary}
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Reports</CardTitle>
                    <Button intent="primary" onClick={() => setShowReportDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Generate New Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-medium">{report.title}</h3>
                            {getStatusBadge(report.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{report.reportType}</span>
                            <span>•</span>
                            <span>{new Date(report.fromDate).toLocaleDateString()} - {new Date(report.toDate).toLocaleDateString()}</span>
                            {report.generatedAt && (
                              <>
                                <span>•</span>
                                <span>Generated {new Date(report.generatedAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {report.status === 'COMPLETED' && (
                            <Button
                              size="sm"
                              intent="secondary"
                              onClick={() => downloadReport(report.id, report.title)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          )}
                          <Button size="sm" intent="secondary">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </div>
                      </div>
                    ))}

                    {reports.length === 0 && (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No reports generated yet</p>
                        <p className="text-sm text-gray-400 mb-4">Generate your first attendance report to get started</p>
                        <Button intent="primary" onClick={() => setShowReportDialog(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Generate Report
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default AttendanceReportsNew;