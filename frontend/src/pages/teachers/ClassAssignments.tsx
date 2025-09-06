import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Users, Calendar, GraduationCap } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  StatusBadge,
  Form,
  FormField,
  FormSection,
  FormMessage,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import classTeacherService, {
  ClassTeacherAssignment,
  CreateAssignmentData,
  FormData,
  Teacher,
  Class as ClassType,
  AcademicYear
} from '@/services/classTeacherService';

interface Filters {
  academicYearId: string;
  teacherId: string;
  classId: string;
  search: string;
}

const ClassAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<ClassTeacherAssignment[]>([]);
  const [formData, setFormData] = useState<FormData>({ classes: [], academicYears: [], teachers: [] });
  const [filters, setFilters] = useState<Filters>({
    academicYearId: '',
    teacherId: '',
    classId: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState<CreateAssignmentData>({
    teacherId: '',
    classId: '',
    academicYearId: '',
    isClassTeacher: true,
    isSubjectTeacher: false,
    canMarkAttendance: true,
    canGradeAssignments: true,
    canManageClassroom: false
  });
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [filters]);

  useEffect(() => {
    if (createFormData.classId && createFormData.academicYearId) {
      loadAvailableTeachers();
    }
  }, [createFormData.classId, createFormData.academicYearId]);

  // Debug effect to monitor showCreateForm state
  useEffect(() => {
    console.log('dialogOpen changed:', dialogOpen);
  }, [dialogOpen]);

  const loadInitialData = async () => {
    try {
      const data = await classTeacherService.getFormData();
      setFormData(data);
      
      // Set current academic year as default filter
      const currentYear = data.academicYears.find(year => year.isCurrent);
      if (currentYear) {
        setFilters(prev => ({ ...prev, academicYearId: currentYear.id }));
        setCreateFormData(prev => ({ ...prev, academicYearId: currentYear.id }));
      }
    } catch (error: any) {
      console.error('Error loading initial data:', error);
      setErrors([`Failed to load initial data: ${error?.message || 'Unknown error'}`]);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const filtersToApply = {
        ...(filters.academicYearId && { academicYearId: filters.academicYearId }),
        ...(filters.teacherId && { teacherId: filters.teacherId }),
        ...(filters.classId && { classId: filters.classId })
      };
      
      const response = await classTeacherService.getAssignments(filtersToApply);
      let filteredAssignments = response.data || [];

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredAssignments = filteredAssignments.filter((assignment: ClassTeacherAssignment) =>
          `${assignment.teacher.firstName} ${assignment.teacher.lastName}`.toLowerCase().includes(searchTerm) ||
          assignment.teacher.employeeId.toLowerCase().includes(searchTerm) ||
          assignment.class.name.toLowerCase().includes(searchTerm) ||
          assignment.class.grade.toLowerCase().includes(searchTerm)
        );
      }

      setAssignments(filteredAssignments);
    } catch (error: any) {
      console.error('Error loading assignments:', error);
      setErrors([`Failed to load assignments: ${error?.response?.data?.message || error?.message || 'Unknown error'}`]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableTeachers = async () => {
    try {
      if (createFormData.classId && createFormData.academicYearId) {
        const teachers = await classTeacherService.getAvailableTeachers(
          createFormData.classId,
          createFormData.academicYearId
        );
        setAvailableTeachers(teachers);
      }
    } catch (error) {
      console.error('Error loading available teachers:', error);
      setAvailableTeachers([]);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    // Convert "all" to empty string for API calls
    const filterValue = value === 'all' ? '' : value;
    setFilters(prev => ({ ...prev, [key]: filterValue }));
  };

  // Helper function to convert internal state to display value
  const getDisplayValue = (filterValue: string): string => {
    return filterValue === '' ? 'all' : filterValue;
  };

  const clearFilters = () => {
    const currentYear = formData.academicYears.find(year => year.isCurrent);
    setFilters({
      academicYearId: currentYear?.id || '',
      teacherId: '',
      classId: '',
      search: ''
    });
  };

  const handleCreateFormChange = (key: keyof CreateAssignmentData, value: any) => {
    setCreateFormData(prev => ({ ...prev, [key]: value }));
    setErrors([]);
  };

  const handleCreateAssignment = async () => {
    try {
      setCreating(true);
      setErrors([]);

      // Validate data
      const validationErrors = classTeacherService.validateAssignmentData(createFormData);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      await classTeacherService.createAssignment(createFormData);
      
      // Reset form and reload data
      setCreateFormData({
        teacherId: '',
        classId: '',
        academicYearId: formData.academicYears.find(y => y.isCurrent)?.id || '',
        isClassTeacher: true,
        isSubjectTeacher: false,
        canMarkAttendance: true,
        canGradeAssignments: true,
        canManageClassroom: false
      });
      setDialogOpen(false);
      await loadAssignments();
    } catch (error: any) {
      setErrors([error.response?.data?.message || 'Error creating assignment']);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await classTeacherService.deleteAssignment(id);
      await loadAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
    }
  };

  const getStatusVariant = (status: ClassTeacherAssignment['status']) => {
    const statusInfo = classTeacherService.formatStatus(status);
    return statusInfo.color as any;
  };

  const filteredClasses = createFormData.academicYearId 
    ? formData.classes 
    : formData.classes;

  const filteredTeachers = createFormData.classId && createFormData.academicYearId
    ? availableTeachers
    : formData.teachers;

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Teacher Assignments</h1>
          <p className="text-gray-600">Manage teacher-class assignments per academic year</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              intent="primary"
              leftIcon={<Plus />}
            >
              Assign Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Assign Teacher to Class</DialogTitle>
              <DialogDescription>
                Create a new teacher-class assignment for the selected academic year.
              </DialogDescription>
            </DialogHeader>
            
            {formData.academicYears.length === 0 || formData.classes.length === 0 || formData.teachers.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-yellow-800">
                  Unable to load form data. Please ensure you have:
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  {formData.academicYears.length === 0 && <li>Academic years configured</li>}
                  {formData.classes.length === 0 && <li>Classes created</li>}
                  {formData.teachers.length === 0 && <li>Teachers/staff added to the system</li>}
                </ul>
              </div>
            ) : (
              <Form spacing="md">
                {errors.length > 0 && (
                  <FormMessage type="error" message={errors.join(', ')} />
                )}
                
                <FormSection title="Assignment Details">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Academic Year" required>
                      <Select
                        value={createFormData.academicYearId}
                        onValueChange={(value) => handleCreateFormChange('academicYearId', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Academic Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.academicYears.map(year => (
                            <SelectItem key={year.id} value={year.id}>
                              {classTeacherService.getAcademicYearDisplay(year)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    
                    <FormField label="Class" required>
                      <Select
                        value={createFormData.classId}
                        onValueChange={(value) => handleCreateFormChange('classId', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Class" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredClasses.map(cls => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {classTeacherService.getClassDisplayName(cls)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                    
                    <FormField label="Teacher" required>
                      <Select
                        value={createFormData.teacherId}
                        onValueChange={(value) => handleCreateFormChange('teacherId', value)}
                        required
                        disabled={!createFormData.classId || !createFormData.academicYearId}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Teacher" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredTeachers.map(teacher => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {classTeacherService.getTeacherDisplayName(teacher)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </FormSection>

                <FormSection title="Assignment Type & Permissions">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={createFormData.isClassTeacher}
                          onChange={(e) => handleCreateFormChange('isClassTeacher', e.target.checked)}
                          className="mr-2"
                        />
                        Class Teacher
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={createFormData.isSubjectTeacher}
                          onChange={(e) => handleCreateFormChange('isSubjectTeacher', e.target.checked)}
                          className="mr-2"
                        />
                        Subject Teacher
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={createFormData.canMarkAttendance}
                          onChange={(e) => handleCreateFormChange('canMarkAttendance', e.target.checked)}
                          className="mr-2"
                        />
                        Can Mark Attendance
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={createFormData.canGradeAssignments}
                          onChange={(e) => handleCreateFormChange('canGradeAssignments', e.target.checked)}
                          className="mr-2"
                        />
                        Can Grade Assignments
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={createFormData.canManageClassroom}
                          onChange={(e) => handleCreateFormChange('canManageClassroom', e.target.checked)}
                          className="mr-2"
                          disabled={!createFormData.isClassTeacher}
                        />
                        Can Manage Classroom
                      </label>
                    </div>
                  </div>
                </FormSection>

                <FormSection title="Additional Information">
                  <FormField label="Notes">
                    <textarea
                      value={createFormData.notes || ''}
                      onChange={(e) => handleCreateFormChange('notes', e.target.value)}
                      placeholder="Additional notes about this assignment..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </FormField>
                </FormSection>
              </Form>
            )}
            
            <DialogFooter>
              <Button
                intent="cancel"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                intent="primary"
                onClick={handleCreateAssignment}
                loading={creating}
                loadingText="Creating Assignment..."
                disabled={formData.academicYears.length === 0 || formData.classes.length === 0 || formData.teachers.length === 0}
              >
                Create Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                placeholder="Search teachers, classes..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                leftIcon={<Search />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <Select
                value={getDisplayValue(filters.academicYearId)}
                onValueChange={(value) => handleFilterChange('academicYearId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {formData.academicYears.map(year => (
                    <SelectItem key={year.id} value={year.id}>
                      {classTeacherService.getAcademicYearDisplay(year)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher
              </label>
              <Select
                value={getDisplayValue(filters.teacherId)}
                onValueChange={(value) => handleFilterChange('teacherId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Teachers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teachers</SelectItem>
                  {formData.teachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {classTeacherService.getTeacherDisplayName(teacher)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <Select
                value={getDisplayValue(filters.classId)}
                onValueChange={(value) => handleFilterChange('classId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {formData.classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {classTeacherService.getClassDisplayName(cls)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button intent="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">
            Teacher-Class Assignments ({assignments.length})
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600 mb-4">
                {Object.values(filters).some(f => f) ? 
                  "No assignments match your current filters." : 
                  "Start by assigning teachers to classes."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map(assignment => (
                <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold">
                            {classTeacherService.getTeacherFullName(assignment.teacher)}
                          </span>
                          <span className="text-gray-500">({assignment.teacher.employeeId})</span>
                        </div>
                        <StatusBadge variant={getStatusVariant(assignment.status)}>
                          {classTeacherService.formatStatus(assignment.status).label}
                        </StatusBadge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>
                            <strong>Class:</strong> {classTeacherService.getClassDisplayName(assignment.class)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            <strong>Academic Year:</strong> {assignment.academicYear.name}
                          </span>
                        </div>
                        <div>
                          <strong>Type:</strong> {classTeacherService.getAssignmentTypeLabel(assignment)}
                        </div>
                      </div>

                      <div className="mt-2 text-sm">
                        <strong>Permissions:</strong> {
                          classTeacherService.getPermissionsSummary(assignment).join(', ') || 'None'
                        }
                      </div>

                      {assignment.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Notes:</strong> {assignment.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        intent="action"
                        size="sm"
                        leftIcon={<Edit2 />}
                        onClick={() => {
                          // TODO: Implement edit functionality
                          console.log('Edit assignment:', assignment.id);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        intent="danger"
                        size="sm"
                        leftIcon={<Trash2 />}
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </Layout>
  );
};

export default ClassAssignments;