import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Form,
  FormField,
  Select,
  SelectItem,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  StatsCard,
  toast
} from '@/components/ui';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageContent } from '@/components/ui';
import { Calendar, Download, TrendingUp, Users, BookOpen, Award, AlertTriangle } from 'lucide-react';
import classTeacherService, {
  ClassTeacherAssignment,
  AssignmentSummary,
  FormData
} from '@/services/classTeacherService';

const AssignmentHistory: React.FC = () => {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [assignments, setAssignments] = useState<ClassTeacherAssignment[]>([]);
  const [summaries, setSummaries] = useState<{ [key: string]: AssignmentSummary }>({});
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('all-staff');
  const [selectedClass, setSelectedClass] = useState<string>('all-classes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      loadAssignments();
      loadSummary();
    }
  }, [selectedAcademicYear, selectedStaff, selectedClass]);

  const loadFormData = async () => {
    try {
      const data = await classTeacherService.getFormData();
      setFormData(data);

      // Set current academic year as default
      const currentYear = data.academicYears.find(year => year.isCurrent);
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id);
      } else if (data.academicYears.length > 0) {
        setSelectedAcademicYear(data.academicYears[0].id);
      }
    } catch (err) {
      toast.error('Failed to load form data');
    }
  };

  const loadAssignments = async () => {
    if (!selectedAcademicYear) return;

    try {
      setLoading(true);
      const filters: any = { academicYearId: selectedAcademicYear };
      if (selectedStaff && selectedStaff !== 'all-staff') filters.staffId = selectedStaff;
      if (selectedClass && selectedClass !== 'all-classes') filters.classId = selectedClass;

      const data = await classTeacherService.getAssignments(filters);
      setAssignments(data.data || []);
    } catch (err) {
      toast.error('Failed to load assignment history');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!selectedAcademicYear) return;

    try {
      const data = await classTeacherService.getAssignmentSummary(selectedAcademicYear);
      setSummaries(prev => ({ ...prev, [selectedAcademicYear]: data }));
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const loadAllSummaries = async () => {
    if (!formData) return;

    try {
      const summaryPromises = formData.academicYears.map(year =>
        classTeacherService.getAssignmentSummary(year.id)
          .then(data => ({ yearId: year.id, summary: data }))
          .catch(() => ({ yearId: year.id, summary: null }))
      );

      const results = await Promise.all(summaryPromises);
      const summariesMap: { [key: string]: AssignmentSummary } = {};

      results.forEach(result => {
        if (result.summary) {
          summariesMap[result.yearId] = result.summary;
        }
      });

      setSummaries(summariesMap);
    } catch (err) {
      console.error('Failed to load all summaries:', err);
    }
  };

  const exportAssignments = async () => {
    try {
      // This would typically generate a CSV or Excel file
      const csvContent = generateCSV(assignments);
      downloadCSV(csvContent, `assignments-${selectedAcademicYear}.csv`);
      toast.success('Assignment history exported successfully');
    } catch (err) {
      toast.error('Failed to export assignment history');
    }
  };

  const generateCSV = (data: ClassTeacherAssignment[]): string => {
    const headers = [
      'Academic Year',
      'Staff Name',
      'Employee ID',
      'Position',
      'Class',
      'Grade',
      'Assignment Type',
      'Status',
      'Start Date',
      'End Date',
      'Can Mark Attendance',
      'Can Grade Assignments',
      'Can Manage Classroom',
      'Notes'
    ];

    const rows = data.map(assignment => [
      assignment.academicYear.name,
      `${assignment.staff.firstName} ${assignment.staff.lastName}`,
      assignment.staff.employeeId,
      assignment.staff.position,
      assignment.class.name,
      assignment.class.grade,
      getAssignmentTypeLabel(assignment),
      assignment.status,
      assignment.startDate || '',
      assignment.endDate || '',
      assignment.canMarkAttendance ? 'Yes' : 'No',
      assignment.canGradeAssignments ? 'Yes' : 'No',
      assignment.canManageClassroom ? 'Yes' : 'No',
      assignment.notes || ''
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAssignmentTypeLabel = (assignment: ClassTeacherAssignment) => {
    const types = [];
    if (assignment.isClassTeacher) {
      types.push(assignment.canManageClassroom ? 'Class Teacher' : 'Assistant Class Teacher');
    }
    if (assignment.isSubjectTeacher) {
      types.push('Subject Teacher');
    }
    return types.length > 0 ? types.join(' & ') : 'Teacher';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'COMPLETED': return 'info';
      case 'TRANSFERRED': return 'secondary';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  };

  const calculateTrends = () => {
    if (!formData || Object.keys(summaries).length < 2) return null;

    const years = formData.academicYears.sort((a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    if (years.length < 2) return null;

    const currentYear = years[years.length - 1];
    const previousYear = years[years.length - 2];

    const currentSummary = summaries[currentYear.id];
    const previousSummary = summaries[previousYear.id];

    if (!currentSummary || !previousSummary) return null;

    return {
      totalAssignments: {
        current: currentSummary.summary.totalAssignments,
        previous: previousSummary.summary.totalAssignments,
        change: currentSummary.summary.totalAssignments - previousSummary.summary.totalAssignments
      },
      classTeachers: {
        current: currentSummary.summary.classTeacherAssignments,
        previous: previousSummary.summary.classTeacherAssignments,
        change: currentSummary.summary.classTeacherAssignments - previousSummary.summary.classTeacherAssignments
      },
      unassignedClasses: {
        current: currentSummary.summary.unassignedClasses,
        previous: previousSummary.summary.unassignedClasses,
        change: currentSummary.summary.unassignedClasses - previousSummary.summary.unassignedClasses
      }
    };
  };

  const trends = calculateTrends();
  const currentSummary = selectedAcademicYear ? summaries[selectedAcademicYear] : null;

  const tableColumns = [
    {
      header: 'Academic Year',
      cell: (assignment: ClassTeacherAssignment) => assignment.academicYear.name
    },
    {
      header: 'Staff Member',
      cell: (assignment: ClassTeacherAssignment) => (
        <div>
          <div className="font-medium">
            {assignment.staff.firstName} {assignment.staff.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {assignment.staff.employeeId} • {assignment.staff.position}
          </div>
        </div>
      )
    },
    {
      header: 'Class',
      cell: (assignment: ClassTeacherAssignment) => (
        <div>
          <div className="font-medium">{assignment.class.name}</div>
          <div className="text-sm text-gray-500">Grade {assignment.class.grade}</div>
        </div>
      )
    },
    {
      header: 'Assignment Type',
      cell: (assignment: ClassTeacherAssignment) => getAssignmentTypeLabel(assignment)
    },
    {
      header: 'Duration',
      cell: (assignment: ClassTeacherAssignment) => (
        <div className="text-sm">
          {assignment.startDate && (
            <div>Start: {new Date(assignment.startDate).toLocaleDateString()}</div>
          )}
          {assignment.endDate && (
            <div>End: {new Date(assignment.endDate).toLocaleDateString()}</div>
          )}
          {!assignment.startDate && !assignment.endDate && (
            <span className="text-gray-500">Full academic year</span>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      cell: (assignment: ClassTeacherAssignment) => (
        <StatusBadge variant={getStatusColor(assignment.status)}>
          {assignment.status}
        </StatusBadge>
      )
    }
  ];

  if (!formData) {
    return (
      <Layout>
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-gray-900 rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
      <PageHeader>
        <div className="flex justify-between items-start">
          <div>
            <PageTitle>Assignment History & Reports</PageTitle>
            <PageDescription>
              View historical assignment data and generate reports
            </PageDescription>
          </div>
          <div className="flex gap-3">
            <Button intent="secondary" leftIcon={<TrendingUp />} onClick={loadAllSummaries}>
              Load All Trends
            </Button>
            <Button intent="primary" leftIcon={<Download />} onClick={exportAssignments}>
              Export Data
            </Button>
          </div>
        </div>
      </PageHeader>

      <PageContent>
        <div className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Academic Year">
                  <Select
                    value={selectedAcademicYear}
                    onValueChange={setSelectedAcademicYear}
                  >
                    {formData.academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.isCurrent ? '(Current)' : ''}
                      </SelectItem>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Staff Member (Optional)">
                  <Select
                    value={selectedStaff}
                    onValueChange={setSelectedStaff}
                  >
                    <SelectItem value="all-staff">All Staff</SelectItem>
                    {formData.staff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.firstName} {staff.lastName}
                      </SelectItem>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Class (Optional)">
                  <Select
                    value={selectedClass}
                    onValueChange={setSelectedClass}
                  >
                    <SelectItem value="all-classes">All Classes</SelectItem>
                    {formData.classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} - Grade {cls.grade}
                      </SelectItem>
                    ))}
                  </Select>
                </FormField>
              </div>
            </CardContent>
          </Card>

          {/* Current Year Summary */}
          {currentSummary && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Current Year Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatsCard
                  title="Total Assignments"
                  value={currentSummary.summary.totalAssignments}
                  icon={<Users />}
                />
                <StatsCard
                  title="Class Teachers"
                  value={currentSummary.summary.classTeacherAssignments}
                  icon={<Award />}
                />
                <StatsCard
                  title="Subject Teachers"
                  value={currentSummary.summary.subjectTeacherAssignments}
                  icon={<BookOpen />}
                />
                <StatsCard
                  title="Unassigned Classes"
                  value={currentSummary.summary.unassignedClasses}
                  variant={currentSummary.summary.unassignedClasses > 0 ? "warning" : "success"}
                  icon={<AlertTriangle />}
                />
                <StatsCard
                  title="Unassigned Staff"
                  value={currentSummary.summary.unassignedStaff}
                  variant={currentSummary.summary.unassignedStaff > 0 ? "warning" : "info"}
                  icon={<Users />}
                />
              </div>
            </div>
          )}

          {/* Trends */}
          {trends && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Year-over-Year Trends</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatsCard
                  title="Total Assignments"
                  value={trends.totalAssignments.current}
                  change={trends.totalAssignments.change}
                  icon={<Users />}
                />
                <StatsCard
                  title="Class Teachers"
                  value={trends.classTeachers.current}
                  change={trends.classTeachers.change}
                  icon={<Award />}
                />
                <StatsCard
                  title="Unassigned Classes"
                  value={trends.unassignedClasses.current}
                  change={trends.unassignedClasses.change}
                  variant={trends.unassignedClasses.current > 0 ? "warning" : "success"}
                  icon={<AlertTriangle />}
                />
              </div>
            </div>
          )}

          {/* Assignment History Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Assignment History</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  {assignments.length} records found
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColumns.map((column, index) => (
                      <TableHead key={index}>{column.header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={tableColumns.length} className="text-center py-8">
                        Loading assignment history...
                      </TableCell>
                    </TableRow>
                  ) : assignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tableColumns.length} className="text-center py-8 text-gray-500">
                        No assignment history found for the selected filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        {tableColumns.map((column, index) => (
                          <TableCell key={index}>
                            {typeof column.cell === 'function'
                              ? column.cell(assignment)
                              : assignment[column.cell as keyof typeof assignment]
                            }
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
    </Layout>
  );
};

export default AssignmentHistory;