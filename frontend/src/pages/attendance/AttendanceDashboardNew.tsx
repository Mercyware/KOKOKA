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
  StatusBadge
} from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar as CalendarIcon,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Timer,
  QrCode,
  Upload,
  Download,
  Filter,
  Search,
  Eye,
  BarChart3,
  Map,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BookOpen,
  GraduationCap,
  Building,
  CalendarDays,
  Target,
  Activity,
  FileText,
  RefreshCw,
  Plus
} from 'lucide-react';
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
  AreaChart,
  Area
} from 'recharts';
import { toast } from 'react-hot-toast';
import { get, post } from '../../services/api';

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  partial: number;
  percentage: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: {
    id: string;
    name: string;
    grade: string;
  };
  percentage: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  totalStudents: number;
  presentToday: number;
  attendanceRate: number;
}

interface AcademicTerm {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  terms: AcademicTerm[];
}

interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

interface DashboardData {
  currentAcademicYear: AcademicYear;
  currentTerm: AcademicTerm | null;
  todayStats: AttendanceStats;
  termStats: AttendanceStats;
  yearStats: AttendanceStats;
  classStats: Class[];
  lowAttendanceStudents: Student[];
  trends: AttendanceTrend[];
  recentActivity: any[];
}

const AttendanceDashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('term');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod, selectedClass]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = {
        period: selectedPeriod,
        ...(selectedClass && { classId: selectedClass })
      };

      const result = await get('/attendance/dashboard-new', params);

      if (result.success) {
        setDashboardData(result.data);
      } else {
        toast.error(result.message || 'Failed to fetch attendance data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const navigateToTakeAttendance = () => {
    if (selectedClass) {
      navigate(`/attendance/take/${selectedClass}`);
    } else {
      navigate('/attendance/take');
    }
  };

  const generateReport = async () => {
    try {
      const result = await post('/attendance/reports/generate', {
        title: `Attendance Report - ${selectedPeriod}`,
        reportType: selectedPeriod.toUpperCase(),
        fromDate: dashboardData?.currentTerm?.startDate || new Date().toISOString(),
        toDate: dashboardData?.currentTerm?.endDate || new Date().toISOString(),
        filters: {
          ...(selectedClass && { classes: [selectedClass] })
        }
      });

      if (result.success) {
        toast.success('Report generation started. You will be notified when complete.');
      } else {
        toast.error(result.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAttendanceBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 80) return 'warning';
    return 'destructive';
  };

  // Chart colors
  const chartColors = {
    present: '#10b981',
    absent: '#ef4444',
    late: '#f59e0b',
    excused: '#3b82f6',
    partial: '#8b5cf6'
  };

  const attendanceData = dashboardData ? [
    { name: 'Present', value: dashboardData.todayStats.present, color: chartColors.present },
    { name: 'Absent', value: dashboardData.todayStats.absent, color: chartColors.absent },
    { name: 'Late', value: dashboardData.todayStats.late, color: chartColors.late },
    { name: 'Excused', value: dashboardData.todayStats.excused, color: chartColors.excused }
  ].filter(item => item.value > 0) : [];

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading attendance dashboard...</p>
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
              <PageTitle>Attendance Dashboard</PageTitle>
              <PageDescription>
                {dashboardData?.currentAcademicYear && (
                  <>
                    {dashboardData.currentAcademicYear.name}
                    {dashboardData.currentTerm && ` • ${dashboardData.currentTerm.name}`}
                  </>
                )}
              </PageDescription>
            </div>
            <div className="flex space-x-3">
              <Button intent="secondary" size="sm" onClick={refreshData} disabled={refreshing}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button intent="secondary" size="sm" onClick={navigateToTakeAttendance}>
                <UserCheck className="h-4 w-4 mr-2" />
                Take Attendance
              </Button>
              <Button intent="secondary" size="sm" onClick={generateReport}>
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          {/* Quick Filters */}
          <div className="flex space-x-4 mb-6">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="term">Current Term</SelectItem>
                <SelectItem value="year">Academic Year</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedClass || "all"} onValueChange={(value) => setSelectedClass(value === "all" ? null : value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {dashboardData?.classStats.map(classItem => (
                  <SelectItem key={classItem.id} value={classItem.id}>
                    {classItem.name} - {classItem.grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Overview Cards */}
          {dashboardData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.todayStats.percentage.toFixed(1)}%
                  </div>
                  <Progress value={dashboardData.todayStats.percentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {dashboardData.todayStats.present} of {dashboardData.todayStats.total} students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Term Average</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.termStats.percentage.toFixed(1)}%
                  </div>
                  <Progress value={dashboardData.termStats.percentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Current term average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Year Average</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.yearStats.percentage.toFixed(1)}%
                  </div>
                  <Progress value={dashboardData.yearStats.percentage} className="mt-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    Academic year average
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Requires Attention</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {dashboardData.lowAttendanceStudents.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Students below 75%
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Tabs */}
          <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Distribution */}
                {dashboardData && attendanceData.length > 0 && (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Today's Attendance Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={attendanceData} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start" intent="primary" onClick={navigateToTakeAttendance}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Take Attendance
                    </Button>
                    <Button className="w-full justify-start" intent="secondary" onClick={() => navigate('/attendance/qr')}>
                      <QrCode className="h-4 w-4 mr-2" />
                      Generate QR Code
                    </Button>
                    <Button className="w-full justify-start" intent="secondary" onClick={() => navigate('/attendance/bulk')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Import
                    </Button>
                    <Button className="w-full justify-start" intent="secondary" onClick={() => navigate('/attendance/reports')}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Attendance Trends */}
              {dashboardData && dashboardData.trends.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dashboardData.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="percentage"
                          stroke="#3b82f6"
                          fill="#3b82f6"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardData?.classStats.map((classItem) => (
                  <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base font-medium">
                        {classItem.name}
                      </CardTitle>
                      <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Grade:</span>
                          <Badge variant="outline">{classItem.grade}</Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Students:</span>
                          <span className="font-medium">{classItem.totalStudents}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Present Today:</span>
                          <span className="font-medium text-green-600">{classItem.presentToday}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Attendance Rate:</span>
                            <span className={`font-medium ${getAttendanceColor(classItem.attendanceRate)}`}>
                              {classItem.attendanceRate.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={classItem.attendanceRate} className="h-2" />
                        </div>
                        <div className="flex space-x-2 mt-4">
                          <Button
                            size="sm"
                            intent="primary"
                            className="flex-1"
                            onClick={() => navigate(`/attendance/take/${classItem.id}`)}
                          >
                            <UserCheck className="h-3 w-3 mr-1" />
                            Take
                          </Button>
                          <Button
                            size="sm"
                            intent="secondary"
                            onClick={() => navigate(`/attendance/class/${classItem.id}`)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Calendar Tab */}
            <TabsContent value="calendar" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-3">
                  <CardHeader>
                    <CardTitle>Attendance Calendar</CardTitle>
                    <p className="text-sm text-gray-600">Click on a date to view detailed attendance</p>
                  </CardHeader>
                  <CardContent>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      className="rounded-md border"
                      month={calendarView}
                      onMonthChange={setCalendarView}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Selected Date</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {selectedDate.toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Overall Rate:</span>
                          <span className="font-medium text-green-600">92.5%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Present:</span>
                          <span>148</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Absent:</span>
                          <span>8</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Late:</span>
                          <span>4</span>
                        </div>
                      </div>

                      <Button className="w-full" size="sm" intent="primary">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              {dashboardData && dashboardData.lowAttendanceStudents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600 flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Students Requiring Attention
                    </CardTitle>
                    <p className="text-sm text-gray-600">Students with attendance below 75%</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {dashboardData.lowAttendanceStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {student.firstName} {student.lastName}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {student.admissionNumber} • {student.class.name} - {student.class.grade}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Total Days</p>
                                <p className="font-medium">{student.totalDays}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Present</p>
                                <p className="font-medium text-green-600">{student.presentDays}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Absent</p>
                                <p className="font-medium text-red-600">{student.absentDays}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Late</p>
                                <p className="font-medium text-yellow-600">{student.lateDays}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-2xl font-bold text-red-600">
                                {student.percentage.toFixed(1)}%
                              </p>
                              <Progress value={student.percentage} className="w-24 mt-1" />
                            </div>
                            <Button size="sm" intent="secondary" onClick={() => navigate(`/students/${student.id}/attendance`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance by Period */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance by Period</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { period: 'Morning', present: 145, absent: 12, late: 8 },
                        { period: 'Afternoon', present: 142, absent: 15, late: 8 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="present" fill={chartColors.present} />
                        <Bar dataKey="absent" fill={chartColors.absent} />
                        <Bar dataKey="late" fill={chartColors.late} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Attendance by Grade */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance by Grade</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { grade: 'Grade 1', percentage: 95.2 },
                        { grade: 'Grade 2', percentage: 92.8 },
                        { grade: 'Grade 3', percentage: 89.1 },
                        { grade: 'Grade 4', percentage: 91.5 },
                        { grade: 'Grade 5', percentage: 88.7 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
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

export default AttendanceDashboardNew;