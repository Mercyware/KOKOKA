import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Input,
  PageContainer,
  PageHeader,
  PageTitle,
  PageContent
} from '@/components/ui';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ClassSummary {
  id: string;
  name: string;
  studentCount: number;
  resultStatus: 'pending' | 'partial' | 'complete';
  averageScore: number;
  publishedResults: number;
}

interface TermInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function ResultsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<ClassSummary[]>([]);
  const [currentTerm, setCurrentTerm] = useState<TermInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data - replace with actual API calls
      const mockTerm: TermInfo = {
        id: '1',
        name: 'First Term 2024/2025',
        startDate: '2024-09-01',
        endDate: '2024-12-15',
        isActive: true
      };

      const mockClasses: ClassSummary[] = [
        {
          id: '1',
          name: 'Primary 1A',
          studentCount: 25,
          resultStatus: 'complete',
          averageScore: 78.5,
          publishedResults: 25
        },
        {
          id: '2', 
          name: 'Primary 1B',
          studentCount: 28,
          resultStatus: 'partial',
          averageScore: 75.2,
          publishedResults: 15
        },
        {
          id: '3',
          name: 'Primary 2A',
          studentCount: 30,
          resultStatus: 'pending',
          averageScore: 0,
          publishedResults: 0
        },
        {
          id: '4',
          name: 'Primary 2B', 
          studentCount: 27,
          resultStatus: 'complete',
          averageScore: 82.1,
          publishedResults: 27
        },
        {
          id: '5',
          name: 'Primary 3A',
          studentCount: 24,
          resultStatus: 'partial',
          averageScore: 76.8,
          publishedResults: 12
        }
      ];

      setCurrentTerm(mockTerm);
      setClasses(mockClasses);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: ClassSummary['resultStatus']) => {
    switch (status) {
      case 'complete': return 'default';
      case 'partial': return 'secondary';
      case 'pending': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: ClassSummary['resultStatus']) => {
    switch (status) {
      case 'complete': return 'Complete';
      case 'partial': return 'In Progress';
      case 'pending': return 'Not Started';
      default: return 'Unknown';
    }
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const overallStats = {
    totalStudents: classes.reduce((sum, cls) => sum + cls.studentCount, 0),
    totalPublished: classes.reduce((sum, cls) => sum + cls.publishedResults, 0),
    averageScore: classes.filter(cls => cls.averageScore > 0).reduce((sum, cls) => sum + cls.averageScore, 0) / classes.filter(cls => cls.averageScore > 0).length || 0,
    completionRate: classes.filter(cls => cls.resultStatus === 'complete').length / classes.length * 100
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <div className="flex justify-between items-center">
          <div>
            <PageTitle>Results Management</PageTitle>
            <div className="text-sm text-gray-600 mt-1">
              {currentTerm?.name} • Academic Year 2024/2025
            </div>
          </div>
          <Button 
            intent="primary"
            onClick={() => navigate('/gradebook/grade-scales')}
          >
            Grade Scale Settings
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Published Results</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.totalPublished}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.averageScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{overallStats.completionRate.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Class Results Overview</CardTitle>
              <div className="flex items-center gap-4">
                <Input
                  type="text"
                  placeholder="Search classes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium text-gray-900">Class</th>
                    <th className="pb-3 font-medium text-gray-900">Students</th>
                    <th className="pb-3 font-medium text-gray-900">Status</th>
                    <th className="pb-3 font-medium text-gray-900">Average Score</th>
                    <th className="pb-3 font-medium text-gray-900">Published</th>
                    <th className="pb-3 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((classItem) => (
                    <tr key={classItem.id} className="border-b hover:bg-gray-50">
                      <td className="py-4">
                        <div className="font-medium text-gray-900">{classItem.name}</div>
                      </td>
                      <td className="py-4 text-gray-600">
                        {classItem.studentCount}
                      </td>
                      <td className="py-4">
                        <Badge variant={getStatusVariant(classItem.resultStatus)}>
                          {getStatusText(classItem.resultStatus)}
                        </Badge>
                      </td>
                      <td className="py-4 text-gray-600">
                        {classItem.averageScore > 0 ? `${classItem.averageScore}%` : '-'}
                      </td>
                      <td className="py-4 text-gray-600">
                        {classItem.publishedResults}/{classItem.studentCount}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/gradebook/result-entry/${classItem.id}/${currentTerm?.id}`}
                          >
                            <Button intent="action" size="sm">
                              Enter Results
                            </Button>
                          </Link>
                          <Button 
                            intent="action" 
                            size="sm"
                            onClick={() => navigate(`/gradebook/class-results/${classItem.id}/${currentTerm?.id}`)}
                          >
                            View Results
                          </Button>
                          {classItem.resultStatus !== 'pending' && (
                            <Button 
                              intent="action" 
                              size="sm"
                              onClick={() => navigate(`/gradebook/report-cards/${classItem.id}/${currentTerm?.id}`)}
                            >
                              Generate Reports
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredClasses.length === 0 && (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No classes found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchQuery ? 'Try adjusting your search criteria.' : 'No classes available for this term.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  intent="primary" 
                  className="w-full"
                  onClick={() => navigate('/gradebook/bulk-upload')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Bulk Upload Results
                </Button>
                <Button 
                  intent="action" 
                  className="w-full"
                  onClick={() => navigate('/gradebook/analytics')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                  View Analytics
                </Button>
                <Button 
                  intent="action" 
                  className="w-full"
                  onClick={() => navigate('/gradebook/export')}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
  );
}