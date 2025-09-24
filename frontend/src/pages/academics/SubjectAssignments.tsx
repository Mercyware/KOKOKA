import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  StatsCard,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  FormField,
  toast
} from '@/components/ui';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageActions, PageContent } from '@/components/ui';
import { Plus, Download, Upload, MoreHorizontal, Eye, Edit, Trash, Users, BookOpen, GraduationCap, Clock, Award } from 'lucide-react';
import { SubjectAssignmentForm } from './SubjectAssignmentForm';
import {
  getSubjectAssignments,
  deleteSubjectAssignment,
  createSubjectAssignment,
  updateSubjectAssignment,
  SubjectAssignment,
  CreateSubjectAssignmentData,
  UpdateSubjectAssignmentData
} from '@/services/subjectAssignmentService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { getAllClasses } from '@/services/classService';
import { getAllSubjects } from '@/services/subjectService';
import { getSections } from '@/services/sectionService';
import { getStaffMembers } from '@/services/staffService';
import { useAuth } from '@/contexts/AuthContext';

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  position: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface Class {
  id: string;
  name: string;
  grade: string;
}

interface Section {
  id: string;
  name: string;
}

interface AcademicYear {
  id: string;
  name: string;
  isCurrent: boolean;
}

const SubjectAssignments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PRINCIPAL';

  // State management
  const [assignments, setAssignments] = useState<SubjectAssignment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<SubjectAssignment | null>(null);

  // Load initial data
  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      loadAssignments();
    }
  }, [selectedAcademicYear]);

  const loadFormData = async () => {
    try {
      const [staffData, subjectsResponse, classesResponse, sectionsResponse, academicYearsResponse] = await Promise.all([
        getStaffMembers(),
        getAllSubjects(),
        getAllClasses(),
        getSections(),
        getAllAcademicYears()
      ]);

      const subjectsData = subjectsResponse.data;
      const classesData = classesResponse.data;
      const sectionsData = sectionsResponse.data?.data || sectionsResponse.data || [];
      const academicYearsData = academicYearsResponse.data;

      setStaff(staffData.data || []);
      setSubjects(subjectsData);
      setClasses(classesData);
      setSections(sectionsData);
      setAcademicYears(academicYearsData);

      // Set current academic year as default
      const currentYear = academicYearsData.find(year => year.isCurrent);
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id);
      } else if (academicYearsData.length > 0) {
        setSelectedAcademicYear(academicYearsData[0].id);
      }
    } catch (err) {
      setError('Failed to load form data');
    }
  };

  const loadAssignments = async () => {
    if (!selectedAcademicYear) return;

    try {
      setLoading(true);
      const data = await getSubjectAssignments({
        academicYearId: selectedAcademicYear
      });
      setAssignments(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (data: CreateSubjectAssignmentData) => {
    try {
      const finalData = { ...data, academicYearId: selectedAcademicYear };
      await createSubjectAssignment(finalData);
      setShowCreateModal(false);
      loadAssignments();
      toast({
        title: "Success",
        description: "Subject assignment created successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive"
      });
    }
  };

  const handleEditAssignment = (assignment: SubjectAssignment) => {
    setSelectedAssignment(assignment);
    setShowEditModal(true);
  };

  const handleUpdateAssignment = async (data: UpdateSubjectAssignmentData) => {
    if (!selectedAssignment) return;

    try {
      await updateSubjectAssignment(selectedAssignment.id, data);
      setShowEditModal(false);
      setSelectedAssignment(null);
      loadAssignments();
      toast({
        title: "Success",
        description: "Subject assignment updated successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await deleteSubjectAssignment(id);
      loadAssignments();
      toast({
        title: "Success",
        description: "Subject assignment deleted successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'warning';
      case 'COMPLETED': return 'info';
      case 'TRANSFERRED': return 'secondary';
      case 'CANCELLED': return 'danger';
      case 'SUSPENDED': return 'warning';
      default: return 'secondary';
    }
  };

  if (!academicYears.length) {
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

  const getAssignmentSummary = () => {
    const totalHours = assignments.reduce((sum, assignment) => sum + (assignment.hoursPerWeek || 0), 0);
    const uniqueTeachers = new Set(assignments.map(a => a.staffId)).size;
    const uniqueSubjects = new Set(assignments.map(a => a.subjectId)).size;
    const uniqueClasses = new Set(assignments.map(a => a.classId)).size;
    const activeAssignments = assignments.filter(a => a.status === 'ACTIVE').length;

    return {
      totalAssignments: assignments.length,
      activeAssignments,
      uniqueTeachers,
      uniqueSubjects,
      uniqueClasses,
      totalHours
    };
  };

  const summary = getAssignmentSummary();

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex justify-between items-start">
            <div>
              <PageTitle>Subject Assignments</PageTitle>
              <PageDescription>
                Manage teacher assignments to subjects across classes and sections
              </PageDescription>
            </div>
            <PageActions>
              <div className="flex gap-3">
                {isAdmin && (
                  <>
                    <Button intent="secondary" leftIcon={<Download />}>
                      Export
                    </Button>
                  </>
                )}
                <Button intent="primary" leftIcon={<Plus />} onClick={() => setShowCreateModal(true)}>
                  Create Assignment
                </Button>
              </div>
            </PageActions>
          </div>
        </PageHeader>

        <PageContent>
          <div className="space-y-6">
            {/* Academic Year Selector */}
            <Card>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <FormField label="Academic Year">
                      <Select
                        value={selectedAcademicYear}
                        onValueChange={setSelectedAcademicYear}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.name} {year.isCurrent ? '(Current)' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatsCard
                title="Total Assignments"
                value={summary.totalAssignments}
                icon={<BookOpen />}
              />
              <StatsCard
                title="Active Assignments"
                value={summary.activeAssignments}
                variant={summary.activeAssignments > 0 ? "success" : "warning"}
                icon={<Award />}
              />
              <StatsCard
                title="Teachers"
                value={summary.uniqueTeachers}
                icon={<Users />}
              />
              <StatsCard
                title="Subjects"
                value={summary.uniqueSubjects}
                icon={<BookOpen />}
              />
              <StatsCard
                title="Total Hours/Week"
                value={summary.totalHours}
                icon={<Clock />}
              />
            </div>

            {/* Assignments Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Subject Assignments</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} for {academicYears.find(y => y.id === selectedAcademicYear)?.name}
                  </p>
                </div>
                {assignments.length > 0 && (
                  <div className="flex gap-2">
                    <Button intent="secondary" size="sm" leftIcon={<Download />}>
                      Export
                    </Button>
                    {isAdmin && (
                      <Button intent="primary" size="sm" leftIcon={<Plus />} onClick={() => setShowCreateModal(true)}>
                        Add Assignment
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b">
                        <TableHead className="px-6 py-4 font-semibold">Teacher</TableHead>
                        <TableHead className="px-6 py-4 font-semibold">Subject</TableHead>
                        <TableHead className="px-6 py-4 font-semibold">Class & Section</TableHead>
                        <TableHead className="px-6 py-4 font-semibold">Hours/Week</TableHead>
                        <TableHead className="px-6 py-4 font-semibold">Status</TableHead>
                        <TableHead className="px-6 py-4 font-semibold">Permissions</TableHead>
                        <TableHead className="px-6 py-4 font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                              <p className="text-gray-500">Loading assignments...</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : assignments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-16">
                            <div className="flex flex-col items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <BookOpen className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="text-center">
                                <h4 className="font-medium text-gray-900 mb-1">No assignments found</h4>
                                <p className="text-gray-500 mb-4">
                                  No subject assignments found for the selected academic year.
                                </p>
                                <Button intent="primary" leftIcon={<Plus />} onClick={() => setShowCreateModal(true)}>
                                  Create First Assignment
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        assignments.map((assignment) => (
                          <TableRow key={assignment.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-medium text-sm">
                                    {assignment.staff.firstName.charAt(0)}{assignment.staff.lastName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {assignment.staff.firstName} {assignment.staff.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {assignment.staff.employeeId} • {assignment.staff.position}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{assignment.subject.name}</div>
                                <div className="text-sm text-gray-500">{assignment.subject.code}</div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div>
                                <div className="font-medium text-gray-900">{assignment.class.name}</div>
                                <div className="text-sm text-gray-500">
                                  Grade {assignment.class.grade}
                                  {assignment.section && ` • Section ${assignment.section.name}`}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="font-medium text-gray-900">{assignment.hoursPerWeek || 'Not set'}</div>
                              {assignment.term && (
                                <div className="text-sm text-gray-500">Term {assignment.term}</div>
                              )}
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <StatusBadge variant={getStatusColor(assignment.status)}>
                                {assignment.status}
                              </StatusBadge>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {assignment.isMainTeacher && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    Main Teacher
                                  </span>
                                )}
                                {assignment.canGrade && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                    Grading
                                  </span>
                                )}
                                {assignment.canMarkAttendance && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    Attendance
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button intent="action" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditAssignment(assignment)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditAssignment(assignment)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Assignment
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                    className="text-red-600"
                                  >
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete Assignment
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageContent>

        {/* Create Assignment Dialog */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-semibold text-gray-900">Create Subject Assignment</DialogTitle>
              <DialogDescription className="text-gray-600">
                Assign a teacher to a subject for the {academicYears.find(y => y.id === selectedAcademicYear)?.name} academic year.
              </DialogDescription>
            </DialogHeader>
            <SubjectAssignmentForm
              staff={staff}
              subjects={subjects}
              classes={classes}
              sections={sections}
              academicYears={academicYears}
              onSubmit={handleCreateAssignment}
              onCancel={() => setShowCreateModal(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Assignment Dialog */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b border-gray-200">
              <DialogTitle className="text-xl font-semibold text-gray-900">Edit Subject Assignment</DialogTitle>
              <DialogDescription className="text-gray-600">
                Modify the subject assignment details and permissions.
              </DialogDescription>
            </DialogHeader>
            {selectedAssignment && (
              <SubjectAssignmentForm
                assignment={selectedAssignment}
                staff={staff}
                subjects={subjects}
                classes={classes}
                sections={sections}
                academicYears={academicYears}
                onSubmit={handleUpdateAssignment}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedAssignment(null);
                }}
                isEdit
              />
            )}
          </DialogContent>
        </Dialog>
      </PageContainer>
    </Layout>
  );
};

export default SubjectAssignments;