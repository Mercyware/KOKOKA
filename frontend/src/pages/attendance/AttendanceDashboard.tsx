import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
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
  Map
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AttendanceStats {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
  class: {
    name: string;
    grade: string;
  };
  percentage: number;
}

interface AttendanceActivity {
  id: string;
  student: {
    firstName: string;
    lastName: string;
    admissionNumber: string;
  };
  class: {
    name: string;
    grade: string;
  };
  status: string;
  date: string;
  method: string;
  markedBy: {
    name: string;
    role: string;
  };
}

interface DashboardData {
  overview: {
    totalStudents: number;
    todayStats: AttendanceStats;
    periodStats: AttendanceStats;
  };
  lowAttendanceStudents: Student[];
  recentActivity: AttendanceActivity[];
  period: {
    days: number;
    startDate: string;
    endDate: string;
  };
}

const AttendanceDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(7);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod, selectedClass]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: selectedPeriod.toString(),
        ...(selectedClass && { classId: selectedClass })
      });

      const response = await fetch(`/api/attendance/dashboard?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (classId: string) => {
    try {
      const response = await fetch(`/api/attendance/qr-code/${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Open QR code in modal or new window
        const qrWindow = window.open('', '_blank');
        qrWindow?.document.write(`
          <html>
            <head><title>Attendance QR Code</title></head>
            <body style="text-align:center; padding:20px;">
              <h2>Scan for Attendance</h2>
              <p>${data.data.classInfo.name} - ${data.data.classInfo.grade}</p>
              <img src="${data.data.qrCodeDataURL}" alt="QR Code" style="max-width:300px;">
              <p style="color:#666; font-size:12px;">Expires: ${new Date(data.data.expiresAt).toLocaleString()}</p>
              <p style="color:#666; font-size:12px;">${data.data.instructions}</p>
            </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present': return <UserCheck className="h-4 w-4" />;
      case 'absent': return <UserX className="h-4 w-4" />;
      case 'late': return <Timer className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const pieData = dashboardData ? [
    { name: 'Present', value: dashboardData.overview.todayStats.present, color: '#10b981' },
    { name: 'Absent', value: dashboardData.overview.todayStats.absent, color: '#ef4444' },
    { name: 'Late', value: dashboardData.overview.todayStats.late, color: '#f59e0b' },
    { name: 'Excused', value: dashboardData.overview.todayStats.excused, color: '#3b82f6' }
  ] : [];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading attendance dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Attendance Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Monitor and manage student attendance across your school
            </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => window.location.href = '/attendance/take'}>
            <UserCheck className="h-4 w-4 mr-2" />
            Take Attendance
          </Button>
          <Button variant="outline" onClick={() => generateQRCode(selectedClass || '')}>
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR Code
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex space-x-2">
        {[7, 14, 30].map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
          >
            Last {period} days
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Active students enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.overview.todayStats.percentage}%
              </div>
              <Progress value={dashboardData.overview.todayStats.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground">
                {dashboardData.overview.todayStats.present} of {dashboardData.overview.todayStats.total} students
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Period Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.overview.periodStats.percentage}%
              </div>
              <Progress value={dashboardData.overview.periodStats.percentage} className="mt-2" />
              <p className="text-xs text-muted-foreground">
                Last {dashboardData.period.days} days average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Attendance</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {dashboardData.lowAttendanceStudents.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Students below 80%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Attendance Distribution */}
            {dashboardData && (
              <Card>
                <CardHeader>
                  <CardTitle>Today's Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, value}) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
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
                <Button className="w-full justify-start" variant="outline">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Take Attendance by Class
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import Attendance
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR Codes
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          {dashboardData && dashboardData.lowAttendanceStudents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Students Requiring Attention</CardTitle>
                <p className="text-sm text-gray-600">Students with attendance below 80%</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.lowAttendanceStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-gray-600">
                          {student.admissionNumber} • {student.class.name} - {student.class.grade}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="font-bold text-red-600">{student.percentage.toFixed(1)}%</p>
                          <Progress value={student.percentage} className="w-20 mt-1" />
                        </div>
                        <Button size="sm" variant="outline">
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

        <TabsContent value="activity" className="space-y-4">
          {dashboardData && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(activity.status)}
                        <div>
                          <p className="font-medium">
                            {activity.student.firstName} {activity.student.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.class.name} - {activity.class.grade} • {activity.student.admissionNumber}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(activity.date).toLocaleDateString()} by {activity.markedBy.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          via {activity.method}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </Layout>
  );
};

export default AttendanceDashboard;
