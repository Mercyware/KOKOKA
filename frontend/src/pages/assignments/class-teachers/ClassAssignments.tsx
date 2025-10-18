import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Form,
  FormField,
  FormSection,
  Input,
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
  DialogTrigger,
  Checkbox,
  Switch,
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  toast,
  NavigationItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageActions, PageContent } from '@/components/ui';
import { Plus, Download, Upload, MoreHorizontal, Eye, Edit, Trash, Copy, Users, BookOpen, Award, AlertTriangle, ChevronsUpDown, Check } from 'lucide-react';
import classTeacherService, {
  ClassTeacherAssignment,
  AssignmentSummary,
  FormData,
  CreateAssignmentData,
  BulkAssignmentData
} from '@/services/classTeacherService';
import { useAuth } from '@/contexts/AuthContext';

const ClassAssignments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PRINCIPAL';

  // State management
  const [assignments, setAssignments] = useState<ClassTeacherAssignment[]>([]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [summary, setSummary] = useState<AssignmentSummary | null>(null);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setBulkModal] = useState(false);
  const [showCopyModal, setShowCopyModal] = useState(false);

  // Form states
  const [createForm, setCreateForm] = useState<CreateAssignmentData>({
    staffId: '',
    classId: '',
    sectionId: '',
    academicYearId: '',
    isClassTeacher: true,
    isSubjectTeacher: false,
    subjects: [],
    canMarkAttendance: true,
    canGradeAssignments: true,
    canManageClassroom: false,
    notes: ''
  });

  const [bulkAssignments, setBulkAssignments] = useState<CreateAssignmentData[]>([]);

  // Combobox states
  const [openStaffCombobox, setOpenStaffCombobox] = useState(false);

  // Load initial data
  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      loadAssignments();
      loadSummary();
    }
  }, [selectedAcademicYear]);

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
      setError('Failed to load form data');
    }
  };

  const loadAssignments = async () => {
    if (!selectedAcademicYear) return;

    try {
      setLoading(true);
      const data = await classTeacherService.getAssignments({
        academicYearId: selectedAcademicYear
      });
      setAssignments(data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    if (!selectedAcademicYear) return;

    try {
      const data = await classTeacherService.getAssignmentSummary(selectedAcademicYear);
      setSummary(data);
    } catch (err) {
      console.error('Failed to load summary:', err);
    }
  };

  const handleCreateAssignment = async () => {
    try {
      const data = { ...createForm, academicYearId: selectedAcademicYear };
      await classTeacherService.createAssignment(data);
      setShowCreateModal(false);
      loadAssignments();
      loadSummary();
      toast({
        title: "Success",
        description: "Assignment created successfully"
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive"
      });
    }
  };

  const handleBulkCreate = async () => {
    try {
      const data: BulkAssignmentData = {
        academicYearId: selectedAcademicYear,
        assignments: bulkAssignments
      };
      const result = await classTeacherService.bulkCreateAssignments(data);
      setBulkModal(false);
      loadAssignments();
      loadSummary();
      toast({
        title: "Success",
        description: `Bulk assignment completed. ${result.data.successful.length} successful, ${result.data.failed.length} failed, ${result.data.skipped.length} skipped.`
      });
    } catch (err) {
      Toast.error('Failed to process bulk assignments');
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      await classTeacherService.deleteAssignment(id);
      loadAssignments();
      loadSummary();
      Toast.success('Assignment deleted successfully');
    } catch (err) {
      Toast.error('Failed to delete assignment');
    }
  };

  const addBulkAssignment = () => {
    setBulkAssignments([...bulkAssignments, {
      staffId: '',
      classId: '',
      sectionId: '',
      academicYearId: selectedAcademicYear,
      isClassTeacher: true,
      isSubjectTeacher: false,
      subjects: [],
      canMarkAttendance: true,
      canGradeAssignments: true,
      canManageClassroom: false,
      notes: ''
    }]);
  };

  const removeBulkAssignment = (index: number) => {
    setBulkAssignments(bulkAssignments.filter((_, i) => i !== index));
  };

  const updateBulkAssignment = (index: number, field: string, value: any) => {
    const updated = [...bulkAssignments];
    updated[index] = { ...updated[index], [field]: value };
    setBulkAssignments(updated);
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
            <PageTitle>Class Assignments</PageTitle>
            <PageDescription>
              Manage teacher-class assignments for the academic year
            </PageDescription>
          </div>
          <PageActions>
            <div className="flex gap-3">
              {isAdmin && (
                <>
                  <Button intent="secondary" leftIcon={<Copy />} onClick={() => setShowCopyModal(true)}>
                    Copy from Previous Year
                  </Button>
                  <Button intent="secondary" leftIcon={<Upload />} onClick={() => setBulkModal(true)}>
                    Bulk Assign
                  </Button>
                </>
              )}
              <Button intent="primary" leftIcon={<Plus />} onClick={() => setShowCreateModal(true)}>
                Add Assignment
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
                        {formData.academicYears.map((year) => (
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
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <StatsCard
                title="Total Assignments"
                value={summary.summary.totalAssignments}
                icon={<Users />}
              />
              <StatsCard
                title="Class Teachers"
                value={summary.summary.classTeacherAssignments}
                icon={<Award />}
              />
              <StatsCard
                title="Subject Teachers"
                value={summary.summary.subjectTeacherAssignments}
                icon={<BookOpen />}
              />
              <StatsCard
                title="Unassigned Classes"
                value={summary.summary.unassignedClasses}
                variant={summary.summary.unassignedClasses > 0 ? "warning" : "success"}
                icon={<AlertTriangle />}
              />
              <StatsCard
                title="Unassigned Staff"
                value={summary.summary.unassignedStaff}
                variant={summary.summary.unassignedStaff > 0 ? "warning" : "info"}
                icon={<Users />}
              />
            </div>
          )}

          {/* Assignments Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Teacher-Class Assignments</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} for {formData?.academicYears?.find(y => y.id === selectedAcademicYear)?.name}
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
                      <TableHead className="px-6 py-4 font-semibold">Staff Member</TableHead>
                      <TableHead className="px-6 py-4 font-semibold">Class & Section</TableHead>
                      <TableHead className="px-6 py-4 font-semibold">Assignment Type</TableHead>
                      <TableHead className="px-6 py-4 font-semibold">Status</TableHead>
                      <TableHead className="px-6 py-4 font-semibold">Permissions</TableHead>
                      <TableHead className="px-6 py-4 font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-12">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="text-gray-500">Loading assignments...</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="text-center">
                              <h4 className="font-medium text-gray-900 mb-1">No assignments found</h4>
                              <p className="text-gray-500 mb-4">
                                No teacher-class assignments found for the selected academic year.
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
                              <div className="font-medium text-gray-900">{assignment.class.name}</div>
                              <div className="text-sm text-gray-500">
                                Grade {assignment.class.grade}
                                {assignment.sectionId && ' • Section assigned'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="font-medium text-gray-900">
                                {getAssignmentTypeLabel(assignment)}
                              </div>
                              {assignment.isSubjectTeacher && assignment.subjects && assignment.subjects.length > 0 && (
                                <div className="text-sm text-gray-500">
                                  {assignment.subjects.length} subject{assignment.subjects.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <StatusBadge variant={getStatusColor(assignment.status)}>
                              {assignment.status}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {assignment.canMarkAttendance && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  Attendance
                                </span>
                              )}
                              {assignment.canGradeAssignments && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                  Grading
                                </span>
                              )}
                              {assignment.canManageClassroom && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                  Classroom
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => navigate(`/teachers/class-assignments/${assignment.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {isAdmin && (
                                  <>
                                    <DropdownMenuItem onClick={() => navigate(`/teachers/class-assignments/${assignment.id}/edit`)}>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Assignment
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDeleteAssignment(assignment.id)}
                                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                    >
                                      <Trash className="mr-2 h-4 w-4" />
                                      Delete Assignment
                                    </DropdownMenuItem>
                                  </>
                                )}
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
            <DialogTitle className="text-xl font-semibold text-gray-900">Create Teacher-Class Assignment</DialogTitle>
            <DialogDescription className="text-gray-600">
              Assign a staff member to teach a class for the {formData?.academicYears?.find(y => y.id === selectedAcademicYear)?.name} academic year.
            </DialogDescription>
          </DialogHeader>
          <Form spacing="lg" className="py-6">
            <FormSection title="Basic Assignment Information" description="Select the teacher, class, and section for this assignment">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField label="Staff Member" required>
                  <Popover open={openStaffCombobox} onOpenChange={setOpenStaffCombobox}>
                    <PopoverTrigger asChild>
                      <Button
                        intent="secondary"
                        role="combobox"
                        aria-expanded={openStaffCombobox}
                        className="w-full justify-between"
                      >
                        {createForm.staffId
                          ? formData?.staff?.find((staff) => staff.id === createForm.staffId)
                            ? `${formData.staff.find((staff) => staff.id === createForm.staffId)?.firstName} ${formData.staff.find((staff) => staff.id === createForm.staffId)?.lastName} (${formData.staff.find((staff) => staff.id === createForm.staffId)?.employeeId})`
                            : "Select staff member..."
                          : "Select staff member..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search staff members..." />
                        <CommandEmpty>No staff member found.</CommandEmpty>
                        <CommandGroup>
                          <CommandList className="max-h-[200px] overflow-y-auto">
                            {formData?.staff?.map((staff) => (
                              <CommandItem
                                key={staff.id}
                                value={`${staff.firstName} ${staff.lastName} ${staff.employeeId}`}
                                onSelect={() => {
                                  setCreateForm({ ...createForm, staffId: staff.id });
                                  setOpenStaffCombobox(false);
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    createForm.staffId === staff.id ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {staff.firstName} {staff.lastName} ({staff.employeeId})
                              </CommandItem>
                            ))}
                          </CommandList>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormField>

                <FormField label="Class" required>
                  <Select
                    value={createForm.classId}
                    onValueChange={(value) => setCreateForm({ ...createForm, classId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData?.classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - Grade {cls.grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Section" description="Optional - specific section for organizing students">
                  <Select
                    value={createForm.sectionId || 'no-section'}
                    onValueChange={(value) => setCreateForm({ ...createForm, sectionId: value === 'no-section' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select section (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-section">No specific section</SelectItem>
                      {formData?.sections?.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                          {section.capacity && ` (Capacity: ${section.capacity})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

            </FormSection>

            <FormSection title="Assignment Type & Responsibilities" description="Define the teacher's role and responsibilities">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Assignment Type" description="Select the type of teaching assignment">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id="class-teacher"
                        checked={createForm.isClassTeacher}
                        onCheckedChange={(checked) =>
                          setCreateForm({ ...createForm, isClassTeacher: checked })
                        }
                      />
                      <label htmlFor="class-teacher" className="flex-1 cursor-pointer">
                        <div className="font-medium">Class Teacher</div>
                        <div className="text-sm text-gray-500">Primary teacher responsible for the class</div>
                      </label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Checkbox
                        id="subject-teacher"
                        checked={createForm.isSubjectTeacher}
                        onCheckedChange={(checked) =>
                          setCreateForm({ ...createForm, isSubjectTeacher: checked })
                        }
                      />
                      <label htmlFor="subject-teacher" className="flex-1 cursor-pointer">
                        <div className="font-medium">Subject Teacher</div>
                        <div className="text-sm text-gray-500">Teaches specific subjects to this class</div>
                      </label>
                    </div>
                  </div>
                </FormField>

                <FormField label="Permissions" description="Define what the teacher can do">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">Mark Attendance</div>
                        <div className="text-sm text-gray-500">Allow recording student attendance</div>
                      </div>
                      <Switch
                        checked={createForm.canMarkAttendance}
                        onCheckedChange={(checked) =>
                          setCreateForm({ ...createForm, canMarkAttendance: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">Grade Assignments</div>
                        <div className="text-sm text-gray-500">Allow grading student work</div>
                      </div>
                      <Switch
                        checked={createForm.canGradeAssignments}
                        onCheckedChange={(checked) =>
                          setCreateForm({ ...createForm, canGradeAssignments: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium">Manage Classroom</div>
                        <div className="text-sm text-gray-500">Full classroom management access</div>
                      </div>
                      <Switch
                        checked={createForm.canManageClassroom}
                        onCheckedChange={(checked) =>
                          setCreateForm({ ...createForm, canManageClassroom: checked })
                        }
                      />
                    </div>
                  </div>
                </FormField>
              </div>
            </FormSection>

            <FormSection title="Additional Information" description="Optional notes and comments">
              <FormField label="Notes" description="Any additional notes about this assignment">
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  value={createForm.notes || ''}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  placeholder="Enter any additional notes about this assignment..."
                />
              </FormField>
            </FormSection>

          </Form>
          <DialogFooter className="pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
              <Button intent="cancel" onClick={() => setShowCreateModal(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button intent="primary" onClick={handleCreateAssignment} className="w-full sm:w-auto">
                Create Assignment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </PageContainer>
    </Layout>
  );
};

export default ClassAssignments;