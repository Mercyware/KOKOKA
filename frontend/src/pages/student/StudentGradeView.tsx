import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  Calendar,
  Target,
  BarChart3,
  Eye,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Star,
  User
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface GradeEntry {
  id: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  feedback?: string;
  gradedAt: string;
  category: string;
  gradeBook: {
    subject: {
      id: string;
      name: string;
      code: string;
    };
    teacher: {
      firstName: string;
      lastName: string;
    };
    academicYear: {
      name: string;
    };
    term?: {
      name: string;
    };
  };
  assessment?: {
    title: string;
    type: string;
  };
}

interface SubjectStatistics {
  subject: {
    id: string;
    name: string;
    code: string;
  };
  average: number;
  highest: number;
  lowest: number;
  totalEntries: number;
}

interface StudentGradeData {
  student: {
    id: string;
    // Additional student info
  };
  grades: GradeEntry[];
  subjectStatistics: SubjectStatistics[];
  summary: {
    totalGrades: number;
    gradedAssessments: number;
    averagePerformance: number;
  };
}

interface TrendData {
  subject: {
    name: string;
    code: string;
  };
  grades: Array<{
    percentage: number;
    date: string;
  }>;
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
}

interface ProgressData {
  curriculumProgress: Array<{
    id: string;
    overallProgress: number;
    progressionStatus: string;
    curriculum: {
      name: string;
      type: string;
    };
    class: {
      name: string;
      grade: string;
    };
  }>;
  gradeTrends: TrendData[];
  recommendations: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    actions: string[];
  }>;
}

const trendConfig = {
  IMPROVING: { label: 'Improving', color: 'text-green-600', icon: TrendingUp },
  DECLINING: { label: 'Declining', color: 'text-red-600', icon: TrendingDown },
  STABLE: { label: 'Stable', color: 'text-gray-600', icon: Minus },
};

const progressionStatusConfig = {
  AHEAD: { label: 'Ahead', color: 'bg-green-100 text-green-800' },
  ON_TRACK: { label: 'On Track', color: 'bg-blue-100 text-blue-800' },
  BEHIND: { label: 'Behind', color: 'bg-yellow-100 text-yellow-800' },
  AT_RISK: { label: 'At Risk', color: 'bg-red-100 text-red-800' },
};

const StudentGradeView: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const [gradeData, setGradeData] = useState<StudentGradeData | null>(null);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'grades' | 'progress' | 'analytics'>('grades');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (studentId) {
      if (activeView === 'grades') {
        fetchGradeData();
      } else if (activeView === 'progress') {
        fetchProgressData();
      }
    }
  }, [studentId, activeView, selectedSubject, selectedTerm, selectedYear]);

  const fetchGradeData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(selectedYear !== 'all' && { academicYearId: selectedYear }),
        ...(selectedTerm !== 'all' && { termId: selectedTerm }),
        ...(selectedSubject !== 'all' && { subjectId: selectedSubject }),
      });

      const response = await fetch(`/api/parent/students/${studentId}/grades?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
        },
      });

      if (!response.ok) throw new Error('Failed to fetch grade data');

      const data = await response.json();
      setGradeData(data.data);
    } catch (error) {
      console.error('Error fetching grade data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch grade data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...(selectedYear !== 'all' && { academicYearId: selectedYear }),
      });

      const response = await fetch(`/api/parent/students/${studentId}/progress?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'X-School-Subdomain': localStorage.getItem('schoolSubdomain') || 'demo'
        },
      });

      if (!response.ok) throw new Error('Failed to fetch progress data');

      const data = await response.json();
      setProgressData(data.data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch progress data. Please try again.",
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

  const renderGradesView = () => (
    <>
      {/* Grade Statistics */}
      {gradeData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gradeData.summary.totalGrades}</div>
              <p className="text-xs text-muted-foreground">
                Grade entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Performance</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getGradeColor(gradeData.summary.averagePerformance)}`}>
                {gradeData.summary.averagePerformance.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Overall average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded Assessments</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gradeData.summary.gradedAssessments}</div>
              <p className="text-xs text-muted-foreground">
                Completed assessments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Subject</CardTitle>
              <Star className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {gradeData.subjectStatistics.length > 0 
                  ? gradeData.subjectStatistics.reduce((best, current) => 
                      current.average > best.average ? current : best
                    ).subject.name
                  : 'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Highest average
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Subject Performance */}
      {gradeData && gradeData.subjectStatistics.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
            <CardDescription>Average performance across all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gradeData.subjectStatistics.map((subject) => (
                <div key={subject.subject.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{subject.subject.name}</span>
                      <Badge variant="outline">{subject.subject.code}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {subject.totalEntries} assessments • Range: {subject.lowest}% - {subject.highest}%
                    </div>
                    <Progress value={subject.average} className="mt-2 h-2" />
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-lg font-bold ${getGradeColor(subject.average)}`}>
                      {subject.average.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Grades Table */}
      {gradeData && (
        <Card>
          <CardHeader>
            <CardTitle>Grade History</CardTitle>
            <CardDescription>Detailed view of all grades</CardDescription>
          </CardHeader>
          <CardContent>
            {gradeData.grades.length === 0 ? (
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertDescription>
                  No grades found for the selected filters.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Assessment</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Teacher</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gradeData.grades.map((grade) => (
                      <TableRow key={grade.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{grade.gradeBook.subject.name}</div>
                            <div className="text-sm text-gray-500">{grade.gradeBook.subject.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{grade.assessment?.title || 'Assessment'}</div>
                            <div className="text-sm text-gray-500">{grade.assessment?.type}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{grade.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{grade.rawScore}/{grade.maxScore}</div>
                            <div className={`text-sm ${getGradeColor(grade.percentage)}`}>
                              {grade.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{grade.letterGrade}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(grade.gradedAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {grade.gradeBook.teacher.firstName} {grade.gradeBook.teacher.lastName}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );

  const renderProgressView = () => (
    <>
      {/* Curriculum Progress */}
      {progressData && progressData.curriculumProgress.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {progressData.curriculumProgress.map((progress) => (
            <Card key={progress.id}>
              <CardHeader>
                <CardTitle>{progress.curriculum.name}</CardTitle>
                <CardDescription>
                  {progress.curriculum.type} • {progress.class.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <Badge className={progressionStatusConfig[progress.progressionStatus as keyof typeof progressionStatusConfig]?.color}>
                      {progressionStatusConfig[progress.progressionStatus as keyof typeof progressionStatusConfig]?.label}
                    </Badge>
                  </div>
                  <div>
                    <Progress value={progress.overallProgress} className="h-3" />
                    <div className="text-sm text-gray-500 mt-1">
                      {Math.round(progress.overallProgress)}% complete
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Grade Trends */}
      {progressData && progressData.gradeTrends.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>How your grades are trending across subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.gradeTrends.map((trend, index) => {
                const trendConfig_item = trendConfig[trend.trend];
                const TrendIcon = trendConfig_item.icon;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-gray-100`}>
                        <BookOpen className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{trend.subject.name}</div>
                        <div className="text-sm text-gray-500">{trend.subject.code}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${trendConfig_item.color}`}>
                        <TrendIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{trendConfig_item.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {progressData && progressData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Personalized Recommendations</CardTitle>
            <CardDescription>Suggestions to improve your academic performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressData.recommendations.map((rec, index) => (
                <Alert key={index} className={rec.priority === 'HIGH' ? 'border-red-200 bg-red-50' : rec.priority === 'MEDIUM' ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}>
                  <div className="flex">
                    {rec.priority === 'HIGH' && <AlertTriangle className="h-4 w-4" />}
                    {rec.priority === 'MEDIUM' && <Clock className="h-4 w-4" />}
                    {rec.priority === 'LOW' && <CheckCircle className="h-4 w-4" />}
                    <div className="ml-2">
                      <h4 className="font-semibold">{rec.title}</h4>
                      <AlertDescription className="mt-1">
                        {rec.description}
                      </AlertDescription>
                      {rec.actions.length > 0 && (
                        <ul className="mt-2 text-sm space-y-1">
                          {rec.actions.map((action, actionIndex) => (
                            <li key={actionIndex} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-current rounded-full"></span>
                              {action}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );

  const renderAnalyticsView = () => (
    <Card>
      <CardHeader>
        <CardTitle>Performance Analytics</CardTitle>
        <CardDescription>Coming soon - detailed analytics and insights</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <BarChart3 className="h-4 w-4" />
          <AlertDescription>
            Advanced analytics features are being developed and will be available soon.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grade Overview</h1>
          <p className="text-gray-600 mt-2">Track academic performance and progress</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/parent/dashboard')}>
            ← Back to Dashboard
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant={activeView === 'grades' ? 'default' : 'outline'}
          onClick={() => setActiveView('grades')}
        >
          <Award className="h-4 w-4 mr-2" />
          Grades
        </Button>
        <Button 
          variant={activeView === 'progress' ? 'default' : 'outline'}
          onClick={() => setActiveView('progress')}
        >
          <Target className="h-4 w-4 mr-2" />
          Progress
        </Button>
        <Button 
          variant={activeView === 'analytics' ? 'default' : 'outline'}
          onClick={() => setActiveView('analytics')}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter grades and progress data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Academic Years</SelectItem>
                <SelectItem value="2024-2025">2024-2025</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedTerm} onValueChange={setSelectedTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Terms</SelectItem>
                <SelectItem value="term1">Term 1</SelectItem>
                <SelectItem value="term2">Term 2</SelectItem>
                <SelectItem value="term3">Term 3</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {gradeData?.subjectStatistics.map((subject) => (
                  <SelectItem key={subject.subject.id} value={subject.subject.id}>
                    {subject.subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active view */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading data...</p>
          </div>
        </div>
      ) : (
        <>
          {activeView === 'grades' && renderGradesView()}
          {activeView === 'progress' && renderProgressView()}
          {activeView === 'analytics' && renderAnalyticsView()}
        </>
      )}
      </div>
    </Layout>
  );
};

export default StudentGradeView;