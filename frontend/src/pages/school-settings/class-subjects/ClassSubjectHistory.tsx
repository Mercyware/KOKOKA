import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Eye, Edit, Trash2, Copy, BookOpen, Users, Calendar, GraduationCap, Clock } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import {
  ClassSubjectHistory,
  ClassSubjectHistoryFilters,
  CreateClassSubjectHistoryData,
  getClassSubjectHistory,
  createClassSubjectHistory,
  updateClassSubjectHistory,
  deleteClassSubjectHistory,
  copyAssignments,
  getStatusColor,
  getStatusLabel
} from '@/services/classSubjectHistoryService';

import { getAllClasses } from '@/services/classService';
import { getAllSubjects } from '@/services/subjectService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { getTeachers, StaffMember } from '@/services/staffService';
import { Class, Subject, AcademicYear } from '@/types';

// Use StaffMember as Teacher type since teachers are now staff
type Teacher = StaffMember;

const ClassSubjectHistoryPage: React.FC = () => {
  const { toast } = useToast();
  
  // State management
  const [assignments, setAssignments] = useState<ClassSubjectHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<ClassSubjectHistoryFilters>({
    page: 1,
    limit: 20
  });
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  
  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<ClassSubjectHistory | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form validation
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  
  // Form data
  const [formData, setFormData] = useState<CreateClassSubjectHistoryData>({
    classId: '',
    subjectId: '',
    academicYearId: '',
    isCore: true,
    isOptional: false,
    status: 'ACTIVE'
  });
  
  // Copy form data
  const [copyData, setCopyData] = useState({
    fromAcademicYearId: '',
    toAcademicYearId: '',
    selectedClasses: [] as string[]
  });
  
  // Reference data
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [classesRes, subjectsRes, yearsRes, teachersRes] = await Promise.all([
          getAllClasses(),
          getAllSubjects(),
          getAllAcademicYears(),
          getTeachers()
        ]);
        
        setClasses(classesRes.data || []);
        setSubjects(subjectsRes.data || []);
        setAcademicYears(yearsRes.data || []);
        setTeachers(teachersRes.data || []);
      } catch (error) {
        console.error('Error loading reference data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load reference data',
          variant: 'destructive'
        });
      }
    };
    
    loadReferenceData();
  }, []);

  // Load assignments
  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getClassSubjectHistory({
        ...filters,
        ...(searchTerm && { 
          // For search, we'll search across multiple fields on the backend
          search: searchTerm 
        })
      });
      
      setAssignments((response as any).data || []);
      setPagination((response as any).pagination || {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      });
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError('Failed to load class-subject assignments');
      toast({
        title: 'Error',
        description: 'Failed to load assignments',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedLoad = setTimeout(() => {
      loadAssignments();
    }, 300);
    
    return () => clearTimeout(delayedLoad);
  }, [filters, searchTerm]);

  // Handle form submission
  const handleSubmit = async () => {
    // Reset previous errors
    setFormErrors({});
    
    // Validate required fields
    const errors: {[key: string]: string} = {};
    if (!formData.classId) errors.classId = 'Class is required';
    if (!formData.subjectId) errors.subjectId = 'Subject is required';  
    if (!formData.academicYearId) errors.academicYearId = 'Academic Year is required';
    
    // Additional validation
    if (formData.credits && (formData.credits < 0 || formData.credits > 10)) {
      errors.credits = 'Credits must be between 0 and 10';
    }
    if (formData.hoursPerWeek && (formData.hoursPerWeek < 1 || formData.hoursPerWeek > 40)) {
      errors.hoursPerWeek = 'Hours per week must be between 1 and 40';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors and try again',
        variant: 'destructive'
      });
      return;
    }

    setFormLoading(true);
    try {
      if (showEditDialog && selectedAssignment) {
        await updateClassSubjectHistory(selectedAssignment.id, formData);
        toast({
          title: 'Success',
          description: 'Assignment updated successfully'
        });
      } else {
        await createClassSubjectHistory(formData);
        toast({
          title: 'Success',
          description: 'Assignment created successfully'
        });
      }
      
      setShowCreateDialog(false);
      setShowEditDialog(false);
      resetForm();
      loadAssignments();
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save assignment';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }
    
    try {
      await deleteClassSubjectHistory(id);
      toast({
        title: 'Success',
        description: 'Assignment deleted successfully'
      });
      loadAssignments();
    } catch (error: any) {
      console.error('Error deleting assignment:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete assignment',
        variant: 'destructive'
      });
    }
  };

  // Handle copy assignments
  const handleCopyAssignments = async () => {
    try {
      const response = await copyAssignments({
        fromAcademicYearId: copyData.fromAcademicYearId,
        toAcademicYearId: copyData.toAcademicYearId,
        classIds: copyData.selectedClasses.length > 0 ? copyData.selectedClasses : undefined
      });
      
      toast({
        title: 'Success',
        description: `${response.data.copied} assignments copied successfully`
      });
      setShowCopyDialog(false);
      setCopyData({
        fromAcademicYearId: '',
        toAcademicYearId: '',
        selectedClasses: []
      });
      loadAssignments();
    } catch (error: any) {
      console.error('Error copying assignments:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to copy assignments',
        variant: 'destructive'
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      classId: '',
      subjectId: '',
      academicYearId: '',
      isCore: true,
      isOptional: false,
      status: 'ACTIVE'
    });
    setFormErrors({});
    setSelectedAssignment(null);
  };

  // Open edit dialog
  const handleEdit = (assignment: ClassSubjectHistory) => {
    setSelectedAssignment(assignment);
    setFormData({
      classId: assignment.classId,
      subjectId: assignment.subjectId,
      academicYearId: assignment.academicYearId,
      isCore: assignment.isCore,
      isOptional: assignment.isOptional,
      credits: assignment.credits || undefined,
      hoursPerWeek: assignment.hoursPerWeek || undefined,
      term: assignment.term || undefined,
      semester: assignment.semester || undefined,
      teacherId: assignment.teacherId || undefined,
      status: assignment.status,
      description: assignment.description || undefined,
      passingGrade: assignment.passingGrade || undefined
    });
    setShowEditDialog(true);
  };

  // Handle view
  const handleView = (assignment: ClassSubjectHistory) => {
    setSelectedAssignment(assignment);
    setShowViewDialog(true);
  };

  // Filter handlers
  const handleFilterChange = (key: keyof ClassSubjectHistoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  // Get teacher name
  const getTeacherName = (teacher: any): string => {
    if (teacher?.user?.name) {
      return teacher.user.name;
    }
    if (teacher?.firstName && teacher?.lastName) {
      return `${teacher.firstName} ${teacher.lastName}`;
    }
    return 'Not Assigned';
  };

  return (
    <Layout>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            Class-Subject Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage subject assignments for classes across academic years. Create and track which subjects are taught in each class.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            intent="secondary" 
            onClick={() => setShowCopyDialog(true)} 
            leftIcon={<Copy />}
            className="shadow-sm"
          >
            Copy Assignments
          </Button>
          <Button 
            intent="primary" 
            onClick={() => setShowCreateDialog(true)} 
            leftIcon={<Plus />}
            className="shadow-sm font-medium"
          >
            Add Assignment
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search classes or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Class Filter */}
            <Select
              value={filters.classId || 'all'}
              onValueChange={(value) => handleFilterChange('classId', value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subject Filter */}
            <Select
              value={filters.subjectId || 'all'}
              onValueChange={(value) => handleFilterChange('subjectId', value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Academic Year Filter */}
            <Select
              value={filters.academicYearId || 'all'}
              onValueChange={(value) => handleFilterChange('academicYearId', value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name} {year.isCurrent && '(Current)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value === "all" ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card className="p-6">
          <div className="text-center">Loading assignments...</div>
        </Card>
      ) : error ? (
        <Card className="p-6">
          <div className="text-center text-red-600">{error}</div>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead className="text-center">Hours/Week</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No assignments found. Create your first assignment to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="font-medium">{assignment.class?.name}</div>
                        <div className="text-sm text-gray-500">{assignment.class?.grade}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{assignment.subject?.name}</div>
                        <div className="text-sm text-gray-500">{assignment.subject?.code}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {assignment.academicYear?.isCurrent && (
                            <Badge variant="outline" className="text-xs">Current</Badge>
                          )}
                          <span className="text-sm">{assignment.academicYear?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {assignment.isCore && (
                            <Badge variant="outline" className="text-xs">Core</Badge>
                          )}
                          {assignment.isOptional && (
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{getTeacherName(assignment.assignedTeacher)}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        {assignment.hoursPerWeek || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusLabel(assignment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            intent="action"
                            onClick={() => handleView(assignment)}
                            leftIcon={<Eye />}
                          />
                          <Button
                            size="sm"
                            intent="secondary"
                            onClick={() => handleEdit(assignment)}
                            leftIcon={<Edit />}
                          />
                          <Button
                            size="sm"
                            intent="danger"
                            onClick={() => handleDelete(assignment.id)}
                            leftIcon={<Trash2 />}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} assignments
          </div>
          <div className="flex gap-2">
            <Button
              intent="secondary"
              disabled={pagination.page === 1}
              onClick={() => handleFilterChange('page', pagination.page - 1)}
            >
              Previous
            </Button>
            <Button
              intent="secondary"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handleFilterChange('page', pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowCreateDialog(false);
          setShowEditDialog(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              {showEditDialog ? (
                <>
                  <Edit className="h-5 w-5 text-blue-600" />
                  Edit Assignment
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 text-blue-600" />
                  Create New Assignment
                </>
              )}
            </DialogTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {showEditDialog 
                ? 'Update the assignment details below' 
                : 'Assign a subject to a class for a specific academic year'
              }
            </p>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Class *</Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, classId: value }));
                      if (formErrors.classId) {
                        setFormErrors(prev => ({ ...prev, classId: '' }));
                      }
                    }}
                    disabled={showEditDialog}
                  >
                    <SelectTrigger className={formErrors.classId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            {cls.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.classId && (
                    <p className="text-sm text-red-500">{formErrors.classId}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Subject *</Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, subjectId: value }));
                      if (formErrors.subjectId) {
                        setFormErrors(prev => ({ ...prev, subjectId: '' }));
                      }
                    }}
                    disabled={showEditDialog}
                  >
                    <SelectTrigger className={formErrors.subjectId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            {subject.name} ({subject.code})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.subjectId && (
                    <p className="text-sm text-red-500">{formErrors.subjectId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Academic Year *</Label>
                  <Select
                    value={formData.academicYearId}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, academicYearId: value }));
                      if (formErrors.academicYearId) {
                        setFormErrors(prev => ({ ...prev, academicYearId: '' }));
                      }
                    }}
                    disabled={showEditDialog}
                  >
                    <SelectTrigger className={formErrors.academicYearId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {year.name} {year.isCurrent && <Badge variant="outline" className="text-xs">Current</Badge>}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.academicYearId && (
                    <p className="text-sm text-red-500">{formErrors.academicYearId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Teacher</Label>
                  <Select
                    value={formData.teacherId || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, teacherId: value === 'none' ? undefined : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2 text-gray-500">
                          <GraduationCap className="h-4 w-4" />
                          No teacher assigned
                        </div>
                      </SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-500" />
                            {getTeacherName(teacher)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Subject Classification */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Subject Classification
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    checked={formData.isCore}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCore: !!checked }))}
                    id="isCore"
                  />
                  <Label htmlFor="isCore" className="font-medium cursor-pointer">Core Subject</Label>
                  <div className="text-xs text-gray-500 ml-auto">Mandatory</div>
                </div>

                <div className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    checked={formData.isOptional}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOptional: !!checked }))}
                    id="isOptional"
                  />
                  <Label htmlFor="isOptional" className="font-medium cursor-pointer">Optional Subject</Label>
                  <div className="text-xs text-gray-500 ml-auto">Elective</div>
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Academic Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Credits</Label>
                  <Input
                    type="number"
                    value={formData.credits || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, credits: e.target.value ? parseInt(e.target.value) : undefined }))}
                    placeholder="Enter credits"
                    min="0"
                    max="10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Hours per Week</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.hoursPerWeek || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, hoursPerWeek: e.target.value ? parseInt(e.target.value) : undefined }))}
                      placeholder="Enter hours"
                      min="1"
                      max="40"
                      className="pr-12"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Term</Label>
                  <Select
                    value={formData.term?.toString() || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, term: value === 'none' ? undefined : parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific term</SelectItem>
                      <SelectItem value="1">Term 1</SelectItem>
                      <SelectItem value="2">Term 2</SelectItem>
                      <SelectItem value="3">Term 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status and Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={formData.status || 'ACTIVE'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                          Inactive
                        </div>
                      </SelectItem>
                      <SelectItem value="COMPLETED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="CANCELLED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Cancelled
                        </div>
                      </SelectItem>
                      <SelectItem value="SUSPENDED">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          Suspended
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value || undefined }))}
                    placeholder="Enter a detailed description of this assignment (optional)"
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button 
              intent="cancel" 
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                resetForm();
              }}
              disabled={formLoading}
              className="min-w-20"
            >
              Cancel
            </Button>
            <Button
              intent="primary"
              onClick={handleSubmit}
              disabled={!formData.classId || !formData.subjectId || !formData.academicYearId || formLoading}
              className="min-w-20"
            >
              {formLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {showEditDialog ? 'Updating...' : 'Creating...'}
                </>
              ) : showEditDialog ? (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Update Assignment
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Class</Label>
                  <div className="mt-1">
                    <div className="font-medium">{selectedAssignment.class?.name}</div>
                    <div className="text-sm text-gray-500">{selectedAssignment.class?.grade}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Subject</Label>
                  <div className="mt-1">
                    <div className="font-medium">{selectedAssignment.subject?.name}</div>
                    <div className="text-sm text-gray-500">{selectedAssignment.subject?.code}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Academic Year</Label>
                  <div className="mt-1">
                    {selectedAssignment.academicYear?.name}
                    {selectedAssignment.academicYear?.isCurrent && (
                      <Badge variant="outline" className="ml-2 text-xs">Current</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedAssignment.status)}>
                      {getStatusLabel(selectedAssignment.status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Teacher</Label>
                  <div className="mt-1">{getTeacherName(selectedAssignment.assignedTeacher)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Type</Label>
                  <div className="mt-1 flex gap-1">
                    {selectedAssignment.isCore && (
                      <Badge variant="outline" className="text-xs">Core</Badge>
                    )}
                    {selectedAssignment.isOptional && (
                      <Badge variant="outline" className="text-xs">Optional</Badge>
                    )}
                  </div>
                </div>
                {selectedAssignment.credits && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Credits</Label>
                    <div className="mt-1">{selectedAssignment.credits}</div>
                  </div>
                )}
                {selectedAssignment.hoursPerWeek && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Hours per Week</Label>
                    <div className="mt-1">{selectedAssignment.hoursPerWeek}</div>
                  </div>
                )}
                {selectedAssignment.term && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Term</Label>
                    <div className="mt-1">Term {selectedAssignment.term}</div>
                  </div>
                )}
                {selectedAssignment.passingGrade && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Passing Grade</Label>
                    <div className="mt-1">{selectedAssignment.passingGrade}</div>
                  </div>
                )}
              </div>
              {selectedAssignment.description && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Description</Label>
                  <div className="mt-1 text-sm">{selectedAssignment.description}</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Created</Label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedAssignment.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Last Updated</Label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedAssignment.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button intent="cancel" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
            {selectedAssignment && (
              <Button intent="secondary" onClick={() => {
                handleEdit(selectedAssignment);
                setShowViewDialog(false);
              }}>
                Edit Assignment
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy Assignments Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Copy Assignments</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>From Academic Year *</Label>
              <Select
                value={copyData.fromAcademicYearId}
                onValueChange={(value) => setCopyData(prev => ({ ...prev, fromAcademicYearId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name} {year.isCurrent && '(Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>To Academic Year *</Label>
              <Select
                value={copyData.toAcademicYearId}
                onValueChange={(value) => setCopyData(prev => ({ ...prev, toAcademicYearId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id} disabled={year.id === copyData.fromAcademicYearId}>
                      {year.name} {year.isCurrent && '(Current)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Classes (Optional)</Label>
              <div className="text-sm text-gray-500 mb-2">
                Leave empty to copy all classes, or select specific classes:
              </div>
              <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-2">
                {classes.map((cls) => (
                  <div key={cls.id} className="flex items-center space-x-2">
                    <Checkbox
                      checked={copyData.selectedClasses.includes(cls.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCopyData(prev => ({
                            ...prev,
                            selectedClasses: [...prev.selectedClasses, cls.id]
                          }));
                        } else {
                          setCopyData(prev => ({
                            ...prev,
                            selectedClasses: prev.selectedClasses.filter(id => id !== cls.id)
                          }));
                        }
                      }}
                    />
                    <Label className="text-sm">{cls.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button intent="cancel" onClick={() => setShowCopyDialog(false)}>
              Cancel
            </Button>
            <Button
              intent="primary"
              onClick={handleCopyAssignments}
              disabled={!copyData.fromAcademicYearId || !copyData.toAcademicYearId || copyData.fromAcademicYearId === copyData.toAcademicYearId}
            >
              Copy Assignments
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </Layout>
  );
};

export default ClassSubjectHistoryPage;
