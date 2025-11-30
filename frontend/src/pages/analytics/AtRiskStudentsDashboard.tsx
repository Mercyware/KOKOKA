import React, { useEffect, useState } from 'react';
import { analyticsService } from '@/services/analyticsService';
import { Card, Button, PageContainer, PageHeader, PageTitle, PageDescription } from '@/components/ui';
import { AlertTriangle, TrendingDown, Calendar, Filter, Download, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AtRiskStudentsDashboard: React.FC = () => {
  const [attendanceRisk, setAttendanceRisk] = useState<any[]>([]);
  const [academicRisk, setAcademicRisk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high'>('all');

  useEffect(() => {
    loadAtRiskStudents();
  }, []);

  const loadAtRiskStudents = async () => {
    setLoading(true);

    try {
      const [attendanceData, riskData] = await Promise.all([
        analyticsService.attendance.getAtRiskStudents(undefined, 85),
        analyticsService.risk.getHighRiskStudents('HIGH', 50),
      ]);

      setAttendanceRisk(attendanceData);
      setAcademicRisk(riskData);
    } catch (error) {
      console.error('Failed to load at-risk students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAcademicRisk = academicRisk.filter((student) => {
    if (filter === 'all') return true;
    if (filter === 'critical') return student.riskScore >= 75;
    if (filter === 'high') return student.riskScore >= 50 && student.riskScore < 75;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageContainer>
      <PageHeader>
        <div>
          <PageTitle>At-Risk Students</PageTitle>
          <PageDescription>Students requiring intervention and support</PageDescription>
        </div>
        <div className="flex space-x-2">
          <Button intent="action" size="sm" onClick={loadAtRiskStudents}>
            <Calendar className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button intent="action" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </PageHeader>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Attendance Risk</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">{attendanceRisk.length}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Below 85% attendance</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Academic Risk</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{academicRisk.length}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">High or critical risk level</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Needs Intervention</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {filteredAcademicRisk.filter((s) => s.riskScore >= 75).length}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Critical risk level</p>
          </div>
        </Card>
      </div>

      {/* Attendance Risk Students */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Poor Attendance</h2>
          {attendanceRisk.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No students with attendance issues</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">
                      Class
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-700">
                      Attendance Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">
                      Patterns
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {attendanceRisk.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-slate-500">{student.admissionNumber}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {student.currentClass?.name || '-'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            student.attendancePercentage < 75
                              ? 'bg-red-100 text-red-700'
                              : student.attendancePercentage < 85
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {student.attendancePercentage?.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-600">
                          {student.attendancePatterns?.length || 0} pattern(s)
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link to={`/analytics/student/${student.id}`}>
                          <Button intent="action" size="sm">
                            View Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {/* Academic Risk Students */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Academic Risk</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 text-xs rounded ${
                  filter === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-3 py-1 text-xs rounded ${
                  filter === 'critical'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-3 py-1 text-xs rounded ${
                  filter === 'high'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                High
              </button>
            </div>
          </div>

          {filteredAcademicRisk.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No students match filter</p>
          ) : (
            <div className="space-y-3">
              {filteredAcademicRisk.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 rounded-lg border ${
                    student.riskScore >= 75
                      ? 'bg-red-50 border-red-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-slate-900">
                          {student.firstName} {student.lastName}
                        </h3>
                        <span className="text-xs text-slate-500">
                          {student.currentClass?.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            student.riskScore >= 75
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          Risk Score: {student.riskScore}
                        </span>
                      </div>

                      {/* Risk Assessments */}
                      {student.riskAssessments && student.riskAssessments.length > 0 && (
                        <div className="space-y-2">
                          {student.riskAssessments.map((assessment: any, idx: number) => (
                            <div key={idx} className="text-xs">
                              <span className="font-medium text-slate-700">
                                {assessment.riskType.replace(/_/g, ' ')}:
                              </span>
                              <span className="text-slate-600 ml-1">{assessment.riskLevel}</span>
                              {assessment.indicators && assessment.indicators.length > 0 && (
                                <div className="ml-3 mt-1 space-y-0.5">
                                  {assessment.indicators.slice(0, 2).map((ind: string, i: number) => (
                                    <p key={i} className="text-slate-600">
                                      • {ind}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link to={`/analytics/student/${student.id}`}>
                      <Button intent="primary" size="sm">
                        View Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
};

export default AtRiskStudentsDashboard;
