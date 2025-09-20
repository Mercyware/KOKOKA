import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  MessageSquare,
  BarChart3,
  Target,
  Home,
  Bell,
  FileText,
  User,
  GraduationCap
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface Student {
  id: string;
  admissionNumber: string;
  firstName: string;
  lastName: string;
  photo?: string;
  currentClass: {
    id: string;
    name: string;
    grade: string;
  };
  academicYear: {
    id: string;
    name: string;
    isCurrent: boolean;
  };
}

interface RecentGrade {
  id: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  feedback?: string;
  gradedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  gradeBook: {
    subject: {
      name: string;
      code: string;
    };
    teacher: {
      firstName: string;
      lastName: string;
    };
  };
  assessment?: {
    title: string;
    type: string;
  };
}

interface AttendanceSummary {
  student: Student;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

interface UpcomingAssessment {
  id: string;
  title: string;
  type: string;
  scheduledDate?: string;
  dueDate?: string;
  subject: {
    name: string;
    code: string;
  };
  class: {
    name: string;
    grade: string;
  };
  teacher: {
    firstName: string;
    lastName: string;
  };
}

interface CurriculumProgress {
  id: string;
  overallProgress: number;
  progressionStatus: string;
  strengths: string[];
  weaknesses: string[];
  student: {
    id: string;
    firstName: string;
    lastName: string;
  };
  curriculum: {
    name: string;
    type: string;
  };
  class: {
    name: string;
    grade: string;
  };
}

interface ParentDashboardData {
  guardian: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  students: Student[];
  recentGrades: RecentGrade[];
  attendanceSummary: AttendanceSummary[];
  upcomingAssessments: UpcomingAssessment[];
  curriculumProgress: CurriculumProgress[];
  recentReports: any[];
  summary: {
    totalStudents: number;
    averageAttendance: number;
    newGrades: number;
    upcomingAssessmentsCount: number;
  };
}

const progressionStatusConfig = {
  AHEAD: { label: 'Ahead', color: 'bg-green-100 text-green-800', icon: TrendingUp },
  ON_TRACK: { label: 'On Track', color: 'bg-blue-100 text-blue-800', icon: Target },
  BEHIND: { label: 'Behind', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  AT_RISK: { label: 'At Risk', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
};

const ParentDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<ParentDashboardData | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/parent/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
        },
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter data based on selected student
  const filteredData = React.useMemo(() => {
    if (!dashboardData || selectedStudent === 'all') return dashboardData;
    
    return {
      ...dashboardData,
      recentGrades: dashboardData.recentGrades.filter(grade => grade.student.id === selectedStudent),
      attendanceSummary: dashboardData.attendanceSummary.filter(att => att.student.id === selectedStudent),
      curriculumProgress: dashboardData.curriculumProgress.filter(prog => prog.student.id === selectedStudent),
    };
  }, [dashboardData, selectedStudent]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        </div>
      </Layout>
    );
  }

  if (!filteredData) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your {filteredData.students.length === 1 ? 'child\'s' : 'children\'s'} academic progress</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Children</SelectItem>
              {filteredData.students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Children</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.summary.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Attendance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{filteredData.summary.averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Grades</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{filteredData.summary.newGrades}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tests</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{filteredData.summary.upcomingAssessmentsCount}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredData.students.map((student) => {
              const attendance = filteredData.attendanceSummary.find(att => att.student.id === student.id);
              const progress = filteredData.curriculumProgress.find(prog => prog.student.id === student.id);
              
              return (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={student.profileImageUrl || student.photo} alt={`${student.firstName} ${student.lastName}`} />
                        <AvatarFallback>
                          {student.firstName[0]}{student.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {student.firstName} {student.lastName}
                        </CardTitle>
                        <CardDescription>
                          {student.currentClass.name} • Grade {student.currentClass.grade}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {attendance?.percentage || 0}%
                        </div>
                        <div className="text-xs text-gray-500">Attendance</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(progress?.overallProgress || 0)}%
                        </div>
                        <div className="text-xs text-gray-500">Progress</div>
                      </div>
                    </div>

                    {progress && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Curriculum Progress</span>
                          <Badge 
                            className={progressionStatusConfig[progress.progressionStatus as keyof typeof progressionStatusConfig]?.color}
                          >
                            {progressionStatusConfig[progress.progressionStatus as keyof typeof progressionStatusConfig]?.label}
                          </Badge>
                        </div>
                        <Progress value={progress.overallProgress} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/parent/students/${student.id}/grades`)}
                      >
                        <Award className="h-3 w-3 mr-1" />
                        Grades
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/parent/students/${student.id}/progress`)}
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Progress
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>Latest assessment results</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredData.recentGrades.length === 0 ? (
                <Alert>
                  <BookOpen className="h-4 w-4" />
                  <AlertDescription>
                    No recent grades available.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {filteredData.recentGrades.slice(0, 10).map((grade) => (
                    <div key={grade.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{grade.gradeBook.subject.name}</span>
                          <Badge variant="outline">{grade.student.firstName} {grade.student.lastName}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {grade.assessment?.title || 'Assessment'} • {grade.gradeBook.teacher.firstName} {grade.gradeBook.teacher.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Graded on {formatDate(grade.gradedAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getGradeColor(grade.percentage)}`}>
                          {grade.percentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {grade.rawScore}/{grade.maxScore}
                        </div>
                        {grade.letterGrade && (
                          <Badge variant="outline">{grade.letterGrade}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredData.recentGrades.length > 10 && (
                    <Button variant="outline" className="w-full">
                      View All Grades
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Assessments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assessments</CardTitle>
              <CardDescription>Tests and assignments due soon</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredData.upcomingAssessments.length === 0 ? (
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    No upcoming assessments.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {filteredData.upcomingAssessments.map((assessment) => (
                    <div key={assessment.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{assessment.title}</span>
                        <Badge variant="outline">{assessment.type}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {assessment.subject.name} • {assessment.class.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {assessment.teacher.firstName} {assessment.teacher.lastName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {assessment.scheduledDate && (
                          <span>Due: {formatDate(assessment.scheduledDate)}</span>
                        )}
                        {assessment.dueDate && !assessment.scheduledDate && (
                          <span>Due: {formatDate(assessment.dueDate)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Summary</CardTitle>
              <CardDescription>Last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredData.attendanceSummary.map((attendance) => (
                  <div key={attendance.student.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">
                        {attendance.student.firstName} {attendance.student.lastName}
                      </span>
                      <span className={`font-bold ${attendance.percentage >= 90 ? 'text-green-600' : attendance.percentage >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {attendance.percentage}%
                      </span>
                    </div>
                    <Progress value={attendance.percentage} className="h-2 mb-2" />
                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
                      <div className="text-center">
                        <div className="font-medium text-green-600">{attendance.present}</div>
                        <div>Present</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-red-600">{attendance.absent}</div>
                        <div>Absent</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-yellow-600">{attendance.late}</div>
                        <div>Late</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-blue-600">{attendance.excused}</div>
                        <div>Excused</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Download Report Cards
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Message Teachers
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                View Academic Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Update Contact Info
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default ParentDashboard;