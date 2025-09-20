import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, X, Save } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Import real services
import { getAllClasses } from '@/services/classService';
import { getAllSubjects } from '@/services/subjectService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { getTeachers, StaffMember } from '@/services/staffService';
import { createClassSubjectHistory, getClassSubjectHistory } from '@/services/classSubjectHistoryService';

// Interface definitions
interface Class {
  id: string;
  name: string;
  grade?: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

// Use StaffMember as Teacher type since teachers are now staff
type Teacher = StaffMember;

interface Assignment {
  id: string;
  className: string;
  subjectName: string;
  academicYear: string;
  teacher: string;
  status: string;
  isCore: boolean;
  hoursPerWeek?: number;
  credits?: number;
}

interface AssignmentFormData {
  classId: string;
  subjectId: string;
  academicYearId: string;
  teacherId?: string;
  isCore: boolean;
  isOptional: boolean;
  credits?: number;
  hoursPerWeek?: number;
  term?: number;
  description?: string;
  status: string;
}

const SimpleClassSubjectHistory: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  // Add Assignment dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AssignmentFormData>({
    classId: '',
    subjectId: '',
    academicYearId: '',
    teacherId: '',
    isCore: true,
    isOptional: false,
    status: 'ACTIVE'
  });
  
  // Reference data
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Function to reload assignments from API
  const reloadAssignments = async () => {
    try {
      const assignmentsRes = await getClassSubjectHistory({ limit: 100 });
      if (assignmentsRes.data) {
        const formattedAssignments = assignmentsRes.data.map((assignment: any) => ({
          id: assignment.id,
          className: assignment.class?.name || 'Unknown Class',
          subjectName: assignment.subject?.name || 'Unknown Subject',
          academicYear: assignment.academicYear?.name || 'Unknown Year',
          teacher: assignment.assignedTeacher?.user?.name || 
                  (assignment.assignedTeacher?.firstName && assignment.assignedTeacher?.lastName 
                    ? `${assignment.assignedTeacher.firstName} ${assignment.assignedTeacher.lastName}` 
                    : 'Not Assigned'),
          status: assignment.status,
          isCore: assignment.isCore,
          hoursPerWeek: assignment.hoursPerWeek,
          credits: assignment.credits
        }));
        setAssignments(formattedAssignments);
        console.log('Reloaded assignments:', formattedAssignments.length);
      } else {
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error reloading assignments:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load reference data from real APIs
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
        
        // Load assignments from API
        await reloadAssignments();
        
        console.log('Loaded reference data:', {
          classes: classesRes.data?.length || 0,
          subjects: subjectsRes.data?.length || 0,
          academicYears: yearsRes.data?.length || 0,
          teachers: teachersRes.data?.length || 0
        });
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Form handlers
  const resetForm = () => {
    setFormData({
      classId: '',
      subjectId: '',
      academicYearId: '',
      teacherId: '',
      isCore: true,
      isOptional: false,
      status: 'ACTIVE'
    });
  };

  const handleAddAssignment = async () => {
    // Validate required fields
    if (!formData.classId || !formData.subjectId || !formData.academicYearId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields (Class, Subject, Academic Year)',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSaving(true);
      
      // Create the assignment using real API
      const result = await createClassSubjectHistory({
        classId: formData.classId,
        subjectId: formData.subjectId,
        academicYearId: formData.academicYearId,
        teacherId: formData.teacherId || undefined,
        isCore: formData.isCore,
        isOptional: formData.isOptional,
        credits: formData.credits || undefined,
        hoursPerWeek: formData.hoursPerWeek || undefined,
        term: formData.term || undefined,
        description: formData.description || undefined,
        status: formData.status
      });

      if (result.success) {
        toast({
          title: 'Success',
          description: 'Assignment created successfully!'
        });

        // Close dialog and reset form
        setShowAddDialog(false);
        resetForm();

        // Reload assignments from API
        await reloadAssignments();

      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create assignment',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create assignment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get teacher name
  const getTeacherName = (teacher: Teacher | undefined): string => {
    if (!teacher) return 'Not Assigned';
    if (teacher.user?.name) return teacher.user.name;
    if (teacher.firstName && teacher.lastName) return `${teacher.firstName} ${teacher.lastName}`;
    return 'Unknown Teacher';
  };

  return (
    <Layout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Class-Subject Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage subject assignments for classes across academic years
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              intent="primary" 
              leftIcon={<Plus />}
              onClick={() => setShowAddDialog(true)}
            >
              Add Assignment
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search assignments..."
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Subject Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading assignments...</p>
              </div>
            ) : assignments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No assignments found. Create your first assignment to get started.
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment: any) => (
                  <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{assignment.className} - {assignment.subjectName}</div>
                      <div className="text-sm text-gray-500">
                        {assignment.academicYear} • Teacher: {assignment.teacher}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {assignment.status}
                      </span>
                      <div className="flex gap-1">
                        <Button size="sm" intent="action" leftIcon={<Eye />} />
                        <Button size="sm" intent="secondary" leftIcon={<Edit />} />
                        <Button size="sm" intent="danger" leftIcon={<Trash2 />} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <p><strong>Component:</strong> SimpleClassSubjectHistory</p>
              <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
              <p><strong>Assignments:</strong> {assignments.length}</p>
              <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Add Assignment Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Subject Assignment</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Required Fields Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class" className="text-sm font-medium">
                    Class <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} {cls.grade && `(Grade ${cls.grade})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium">
                    Subject <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.subjectId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, subjectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="academicYear" className="text-sm font-medium">
                    Academic Year <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.academicYearId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, academicYearId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
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

                <div className="space-y-2">
                  <Label htmlFor="teacher" className="text-sm font-medium">
                    Teacher (Optional)
                  </Label>
                  <Select
                    value={formData.teacherId || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, teacherId: value === 'none' ? '' : value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No teacher assigned</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {getTeacherName(teacher)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject Type and Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Subject Type</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isCore"
                        checked={formData.isCore}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, isCore: !!checked }))
                        }
                      />
                      <Label htmlFor="isCore" className="text-sm">
                        Core Subject
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="isOptional"
                        checked={formData.isOptional}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, isOptional: !!checked }))
                        }
                      />
                      <Label htmlFor="isOptional" className="text-sm">
                        Optional Subject
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="term" className="text-sm font-medium">
                    Term (Optional)
                  </Label>
                  <Select
                    value={formData.term?.toString() || 'none'}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, term: value === 'none' ? undefined : parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific term</SelectItem>
                      <SelectItem value="1">Term 1</SelectItem>
                      <SelectItem value="2">Term 2</SelectItem>
                      <SelectItem value="3">Term 3</SelectItem>
                      <SelectItem value="4">Term 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="credits" className="text-sm font-medium">
                    Credits (Optional)
                  </Label>
                  <Input
                    id="credits"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g., 3"
                    value={formData.credits || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      credits: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hoursPerWeek" className="text-sm font-medium">
                    Hours per Week (Optional)
                  </Label>
                  <Input
                    id="hoursPerWeek"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g., 5"
                    value={formData.hoursPerWeek || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      hoursPerWeek: e.target.value ? parseFloat(e.target.value) : undefined 
                    }))}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Additional notes or description..."
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  intent="cancel"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  intent="primary"
                  onClick={handleAddAssignment}
                  disabled={saving || !formData.classId || !formData.subjectId || !formData.academicYearId}
                  loading={saving}
                  loadingText="Creating..."
                  leftIcon={<Save />}
                >
                  Create Assignment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default SimpleClassSubjectHistory;