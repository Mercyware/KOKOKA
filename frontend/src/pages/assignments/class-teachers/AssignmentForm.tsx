import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Checkbox,
  Switch,
  FormMessage,
  toast
} from '@/components/ui';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageContent } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import classTeacherService, {
  ClassTeacherAssignment,
  CreateAssignmentData,
  UpdateAssignmentData,
  FormData
} from '@/services/classTeacherService';

interface AssignmentFormProps {
  mode: 'create' | 'edit';
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState<FormData | null>(null);
  const [assignment, setAssignment] = useState<ClassTeacherAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [form, setForm] = useState<CreateAssignmentData | UpdateAssignmentData>({
    staffId: '',
    classId: '',
    academicYearId: '',
    isClassTeacher: true,
    isSubjectTeacher: false,
    subjects: [],
    startDate: '',
    endDate: '',
    canMarkAttendance: true,
    canGradeAssignments: true,
    canManageClassroom: false,
    notes: ''
  });

  useEffect(() => {
    loadFormData();
    if (mode === 'edit' && id) {
      loadAssignment();
    } else {
      setLoading(false);
    }
  }, [mode, id]);

  const loadFormData = async () => {
    try {
      const data = await classTeacherService.getFormData();
      setFormData(data);

      // Set current academic year as default for new assignments
      if (mode === 'create') {
        const currentYear = data.academicYears.find(year => year.isCurrent);
        if (currentYear) {
          setForm(prev => ({ ...prev, academicYearId: currentYear.id }));
        }
      }
    } catch (err) {
      toast.error('Failed to load form data');
    }
  };

  const loadAssignment = async () => {
    if (!id) return;

    try {
      const data = await classTeacherService.getAssignment(id);
      setAssignment(data);

      // Populate form with existing data
      setForm({
        staffId: data.staffId,
        classId: data.classId,
        academicYearId: data.academicYearId,
        isClassTeacher: data.isClassTeacher,
        isSubjectTeacher: data.isSubjectTeacher,
        subjects: data.subjects,
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        status: data.status,
        canMarkAttendance: data.canMarkAttendance,
        canGradeAssignments: data.canGradeAssignments,
        canManageClassroom: data.canManageClassroom,
        notes: data.notes || ''
      });
    } catch (err) {
      toast.error('Failed to load assignment data');
      navigate('/teachers/class-assignments');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (mode === 'create') {
      if (!form.staffId) newErrors.push('Staff member is required');
      if (!form.classId) newErrors.push('Class is required');
      if (!form.academicYearId) newErrors.push('Academic year is required');
    }

    if (form.isSubjectTeacher && (!form.subjects || form.subjects.length === 0)) {
      newErrors.push('At least one subject must be selected for subject teacher assignment');
    }

    if (form.startDate && form.endDate) {
      const start = new Date(form.startDate);
      const end = new Date(form.endDate);
      if (start >= end) {
        newErrors.push('Start date must be before end date');
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (mode === 'create') {
        await classTeacherService.createAssignment(form as CreateAssignmentData);
        toast.success('Assignment created successfully');
      } else if (id) {
        await classTeacherService.updateAssignment(id, form as UpdateAssignmentData);
        toast.success('Assignment updated successfully');
      }
      navigate('/teachers/class-assignments');
    } catch (err) {
      toast.error(`Failed to ${mode} assignment`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/teachers/class-assignments');
  };

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  if (loading || !formData) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex items-center justify-center h-64">
            <div>Loading...</div>
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
      <PageHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              intent="secondary"
              size="sm"
              leftIcon={<ArrowLeft />}
              onClick={() => navigate('/teachers/class-assignments')}
            >
              Back
            </Button>
            <div>
              <PageTitle>
                {mode === 'create' ? 'Create New Assignment' : 'Edit Assignment'}
              </PageTitle>
              <PageDescription>
                {mode === 'create'
                  ? 'Assign a staff member to a class for an academic year'
                  : 'Update assignment details and permissions'
                }
              </PageDescription>
            </div>
          </div>
        </div>
      </PageHeader>

      <PageContent>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Assignment Details</h3>
            </CardHeader>
            <CardContent>
              <Form spacing="lg">
                {/* Error Messages */}
                {errors.length > 0 && (
                  <div className="space-y-2">
                    {errors.map((error, index) => (
                      <FormMessage key={index} type="error" message={error} />
                    ))}
                  </div>
                )}

                <FormSection title="Basic Information">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Academic Year" required>
                      <Select
                        value={form.academicYearId}
                        onValueChange={(value) => updateForm('academicYearId', value)}
                        disabled={mode === 'edit'}
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

                    <FormField label="Class" required>
                      <Select
                        value={form.classId}
                        onValueChange={(value) => updateForm('classId', value)}
                        disabled={mode === 'edit'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} - Grade {cls.grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Staff Member" required>
                      <Select
                        value={form.staffId}
                        onValueChange={(value) => updateForm('staffId', value)}
                        disabled={mode === 'edit'}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select staff member" />
                        </SelectTrigger>
                        <SelectContent>
                          {formData.staff.map((staff) => (
                            <SelectItem key={staff.id} value={staff.id}>
                              {staff.firstName} {staff.lastName} ({staff.employeeId}) - {staff.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormField>

                    {mode === 'edit' && 'status' in form && (
                      <FormField label="Status">
                        <Select
                          value={form.status}
                          onValueChange={(value) => updateForm('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Start Date" description="Optional assignment start date">
                      <Input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => updateForm('startDate', e.target.value)}
                      />
                    </FormField>

                    <FormField label="End Date" description="Optional assignment end date">
                      <Input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => updateForm('endDate', e.target.value)}
                      />
                    </FormField>
                  </div>
                </FormSection>

                <FormSection
                  title="Assignment Type"
                  description="Define the type of teaching assignment"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Teaching Roles">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="isClassTeacher"
                            checked={form.isClassTeacher}
                            onCheckedChange={(checked) => updateForm('isClassTeacher', checked)}
                          />
                          <label htmlFor="isClassTeacher" className="text-sm font-medium">
                            Class Teacher
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id="isSubjectTeacher"
                            checked={form.isSubjectTeacher}
                            onCheckedChange={(checked) => updateForm('isSubjectTeacher', checked)}
                          />
                          <label htmlFor="isSubjectTeacher" className="text-sm font-medium">
                            Subject Teacher
                          </label>
                        </div>
                      </div>
                    </FormField>

                    {form.isSubjectTeacher && (
                      <FormField label="Subjects" description="Select subjects for teaching">
                        <Select
                          value=""
                          onValueChange={(value) => {
                            const currentSubjects = form.subjects || [];
                            if (!currentSubjects.includes(value)) {
                              updateForm('subjects', [...currentSubjects, value]);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject to add" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.subjects
                              .filter(subject => !form.subjects?.includes(subject.id))
                              .map((subject) => (
                                <SelectItem key={subject.id} value={subject.id}>
                                  {subject.name} ({subject.code})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>

                        {form.subjects && form.subjects.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {form.subjects.map((subjectId) => {
                              const subject = formData.subjects.find(s => s.id === subjectId);
                              return subject ? (
                                <div
                                  key={subjectId}
                                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                                >
                                  <span className="text-sm">{subject.name}</span>
                                  <Button
                                    intent="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newSubjects = form.subjects?.filter(id => id !== subjectId) || [];
                                      updateForm('subjects', newSubjects);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ) : null;
                            })}
                          </div>
                        )}
                      </FormField>
                    )}
                  </div>
                </FormSection>

                <FormSection
                  title="Permissions"
                  description="Define what actions this teacher can perform"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Attendance">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={form.canMarkAttendance}
                          onCheckedChange={(checked) => updateForm('canMarkAttendance', checked)}
                        />
                        <label className="text-sm">Can mark attendance</label>
                      </div>
                    </FormField>

                    <FormField label="Grading">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={form.canGradeAssignments}
                          onCheckedChange={(checked) => updateForm('canGradeAssignments', checked)}
                        />
                        <label className="text-sm">Can grade assignments</label>
                      </div>
                    </FormField>

                    <FormField label="Classroom Management">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={form.canManageClassroom}
                          onCheckedChange={(checked) => updateForm('canManageClassroom', checked)}
                        />
                        <label className="text-sm">Can manage classroom</label>
                      </div>
                    </FormField>
                  </div>
                </FormSection>

                <FormSection title="Additional Information">
                  <FormField
                    label="Notes"
                    description="Any additional notes about this assignment"
                  >
                    <Input
                      value={form.notes || ''}
                      onChange={(e) => updateForm('notes', e.target.value)}
                      placeholder="Enter any additional notes..."
                    />
                  </FormField>
                </FormSection>

                {/* Form Actions */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                    <Button
                      intent="cancel"
                      onClick={handleCancel}
                      disabled={submitting}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button
                      intent="primary"
                      onClick={handleSubmit}
                      loading={submitting}
                      loadingText={mode === 'create' ? 'Creating...' : 'Updating...'}
                      className="w-full sm:w-auto"
                    >
                      {mode === 'create' ? 'Create Assignment' : 'Update Assignment'}
                    </Button>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </PageContainer>
    </Layout>
  );
};

export default AssignmentForm;