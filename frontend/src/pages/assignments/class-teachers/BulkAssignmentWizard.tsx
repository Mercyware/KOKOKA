import React, { useState, useEffect } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Form,
  FormField,
  FormSection,
  Select,
  SelectItem,
  Checkbox,
  Switch,
  FormMessage,
  Toast,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  StatsCard
} from '@/components/ui';
import { Plus, Trash, Users, BookOpen, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import classTeacherService, {
  FormData,
  CreateAssignmentData,
  BulkAssignmentData,
  CopyAssignmentData
} from '@/services/classTeacherService';

interface BulkAssignmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  academicYearId: string;
  onSuccess: () => void;
}

interface BulkAssignmentRow extends CreateAssignmentData {
  id: string;
  staffName?: string;
  className?: string;
  errors?: string[];
}

const BulkAssignmentWizard: React.FC<BulkAssignmentWizardProps> = ({
  open,
  onOpenChange,
  academicYearId,
  onSuccess
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [assignments, setAssignments] = useState<BulkAssignmentRow[]>([]);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyForm, setCopyForm] = useState<CopyAssignmentData>({
    fromAcademicYearId: '',
    toAcademicYearId: academicYearId,
    classIds: []
  });
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (open) {
      loadFormData();
      setStep(1);
      setAssignments([]);
      setResults(null);
    }
  }, [open]);

  const loadFormData = async () => {
    try {
      const data = await classTeacherService.getFormData();
      setFormData(data);
    } catch (err) {
      Toast.error('Failed to load form data');
    }
  };

  const addAssignmentRow = () => {
    const newAssignment: BulkAssignmentRow = {
      id: Date.now().toString(),
      staffId: '',
      classId: '',
      academicYearId,
      isClassTeacher: true,
      isSubjectTeacher: false,
      subjects: [],
      canMarkAttendance: true,
      canGradeAssignments: true,
      canManageClassroom: false,
      notes: ''
    };
    setAssignments([...assignments, newAssignment]);
  };

  const removeAssignmentRow = (id: string) => {
    setAssignments(assignments.filter(a => a.id !== id));
  };

  const updateAssignment = (id: string, field: string, value: any) => {
    setAssignments(assignments.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value };

        // Update display names
        if (field === 'staffId' && formData) {
          const staff = formData.staff.find(s => s.id === value);
          updated.staffName = staff ? `${staff.firstName} ${staff.lastName}` : '';
        }
        if (field === 'classId' && formData) {
          const cls = formData.classes.find(c => c.id === value);
          updated.className = cls ? `${cls.name} - Grade ${cls.grade}` : '';
        }

        return updated;
      }
      return a;
    }));
  };

  const validateAssignments = (): boolean => {
    const updatedAssignments = assignments.map(assignment => {
      const errors: string[] = [];

      if (!assignment.staffId) errors.push('Staff member is required');
      if (!assignment.classId) errors.push('Class is required');

      // Check for duplicates
      const duplicates = assignments.filter(a =>
        a.id !== assignment.id &&
        a.staffId === assignment.staffId &&
        a.classId === assignment.classId
      );
      if (duplicates.length > 0) {
        errors.push('Duplicate assignment');
      }

      if (assignment.isSubjectTeacher && (!assignment.subjects || assignment.subjects.length === 0)) {
        errors.push('At least one subject required for subject teacher');
      }

      return { ...assignment, errors };
    });

    setAssignments(updatedAssignments);
    return updatedAssignments.every(a => !a.errors || a.errors.length === 0);
  };

  const handleCopyFromPreviousYear = async () => {
    try {
      setProcessing(true);
      const result = await classTeacherService.copyAssignments(copyForm);

      // Convert copied assignments to bulk assignment format
      const copiedAssignments: BulkAssignmentRow[] = result.data.copied.map((assignment: any) => ({
        id: Date.now().toString() + Math.random(),
        staffId: assignment.staffId,
        classId: assignment.classId,
        academicYearId,
        isClassTeacher: assignment.isClassTeacher,
        isSubjectTeacher: assignment.isSubjectTeacher,
        subjects: assignment.subjects,
        canMarkAttendance: assignment.canMarkAttendance,
        canGradeAssignments: assignment.canGradeAssignments,
        canManageClassroom: assignment.canManageClassroom,
        notes: assignment.notes,
        staffName: `${assignment.staff.firstName} ${assignment.staff.lastName}`,
        className: `${assignment.class.name} - Grade ${assignment.class.grade}`
      }));

      setAssignments(copiedAssignments);
      setShowCopyModal(false);
      setStep(2);
      Toast.success(`Copied ${copiedAssignments.length} assignments from previous year`);
    } catch (err) {
      Toast.error('Failed to copy assignments');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateAssignments()) {
      Toast.error('Please fix validation errors before submitting');
      return;
    }

    try {
      setProcessing(true);
      const data: BulkAssignmentData = {
        academicYearId,
        assignments: assignments.map(({ id, staffName, className, errors, ...assignment }) => assignment)
      };

      const result = await classTeacherService.bulkCreateAssignments(data);
      setResults(result.data);
      setStep(3);
    } catch (err) {
      Toast.error('Failed to process bulk assignments');
    } finally {
      setProcessing(false);
    }
  };

  const handleFinish = () => {
    onSuccess();
    onOpenChange(false);
    setStep(1);
    setAssignments([]);
    setResults(null);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold">Choose Assignment Method</h3>
        <p className="text-gray-600">
          How would you like to create bulk assignments?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:border-blue-300" onClick={() => setStep(2)}>
          <CardContent className="text-center p-6">
            <Plus className="h-12 w-12 mx-auto mb-4 text-blue-600" />
            <h4 className="font-semibold mb-2">Create New Assignments</h4>
            <p className="text-sm text-gray-600">
              Manually create new assignments from scratch
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:border-green-300" onClick={() => setShowCopyModal(true)}>
          <CardContent className="text-center p-6">
            <Users className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h4 className="font-semibold mb-2">Copy from Previous Year</h4>
            <p className="text-sm text-gray-600">
              Copy assignments from a previous academic year
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Configure Assignments</h3>
        <Button intent="primary" size="sm" leftIcon={<Plus />} onClick={addAssignmentRow}>
          Add Assignment
        </Button>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No assignments added yet.</p>
          <Button intent="primary" size="sm" leftIcon={<Plus />} onClick={addAssignmentRow}>
            Add First Assignment
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment, index) => (
            <Card key={assignment.id} className={assignment.errors && assignment.errors.length > 0 ? 'border-red-300' : ''}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium">Assignment {index + 1}</h4>
                  <Button
                    intent="ghost"
                    size="sm"
                    onClick={() => removeAssignmentRow(assignment.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>

                {assignment.errors && assignment.errors.length > 0 && (
                  <div className="mb-4 space-y-1">
                    {assignment.errors.map((error, i) => (
                      <FormMessage key={i} type="error" message={error} />
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Staff Member" required>
                    <Select
                      value={assignment.staffId}
                      onValueChange={(value) => updateAssignment(assignment.id, 'staffId', value)}
                    >
                      {formData?.staff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.firstName} {staff.lastName} ({staff.employeeId})
                        </SelectItem>
                      ))}
                    </Select>
                  </FormField>

                  <FormField label="Class" required>
                    <Select
                      value={assignment.classId}
                      onValueChange={(value) => updateAssignment(assignment.id, 'classId', value)}
                    >
                      {formData?.classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name} - Grade {cls.grade}
                        </SelectItem>
                      ))}
                    </Select>
                  </FormField>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={assignment.isClassTeacher}
                      onCheckedChange={(checked) => updateAssignment(assignment.id, 'isClassTeacher', checked)}
                    />
                    <label className="text-sm">Class Teacher</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={assignment.canMarkAttendance}
                      onCheckedChange={(checked) => updateAssignment(assignment.id, 'canMarkAttendance', checked)}
                    />
                    <label className="text-sm">Attendance</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={assignment.canGradeAssignments}
                      onCheckedChange={(checked) => updateAssignment(assignment.id, 'canGradeAssignments', checked)}
                    />
                    <label className="text-sm">Grading</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={assignment.canManageClassroom}
                      onCheckedChange={(checked) => updateAssignment(assignment.id, 'canManageClassroom', checked)}
                    />
                    <label className="text-sm">Classroom</label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between items-center pt-4">
            <Button intent="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button intent="cancel" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                intent="primary"
                onClick={handleSubmit}
                loading={processing}
                disabled={assignments.length === 0}
              >
                Create Assignments ({assignments.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
        <h3 className="text-lg font-semibold">Bulk Assignment Complete</h3>
        <p className="text-gray-600">Here are the results of your bulk assignment operation</p>
      </div>

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            title="Successful"
            value={results.successful.length}
            variant="success"
            icon={<CheckCircle />}
          />
          <StatsCard
            title="Failed"
            value={results.failed.length}
            variant="danger"
            icon={<XCircle />}
          />
          <StatsCard
            title="Skipped"
            value={results.skipped.length}
            variant="warning"
            icon={<AlertCircle />}
          />
        </div>
      )}

      {results && (results.failed.length > 0 || results.skipped.length > 0) && (
        <div className="space-y-4">
          {results.failed.length > 0 && (
            <Card>
              <CardHeader>
                <h4 className="font-semibold text-red-600">Failed Assignments</h4>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.failed.map((item: any, index: number) => (
                    <div key={index} className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                      <p className="text-sm text-red-800">{item.error}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.skipped.length > 0 && (
            <Card>
              <CardHeader>
                <h4 className="font-semibold text-yellow-600">Skipped Assignments</h4>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {results.skipped.map((item: any, index: number) => (
                    <div key={index} className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <p className="text-sm text-yellow-800">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button intent="primary" onClick={handleFinish}>
          Finish
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent className="max-w-4xl">
          <ModalHeader>
            <ModalTitle>Bulk Assignment Wizard</ModalTitle>
            <ModalDescription>
              Create multiple class assignments efficiently
            </ModalDescription>
          </ModalHeader>

          <div className="p-6">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </div>
        </ModalContent>
      </Modal>

      {/* Copy from Previous Year Modal */}
      <Modal open={showCopyModal} onOpenChange={setShowCopyModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Copy from Previous Year</ModalTitle>
            <ModalDescription>
              Select which assignments to copy from a previous academic year
            </ModalDescription>
          </ModalHeader>

          <div className="p-6">
            <Form spacing="md">
              <FormField label="Source Academic Year" required>
                <Select
                  value={copyForm.fromAcademicYearId}
                  onValueChange={(value) => setCopyForm({ ...copyForm, fromAcademicYearId: value })}
                >
                  {formData?.academicYears
                    .filter(year => year.id !== academicYearId)
                    .map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                </Select>
              </FormField>

              <FormField
                label="Classes to Copy"
                description="Leave empty to copy all classes"
              >
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData?.classes.map((cls) => (
                    <div key={cls.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={copyForm.classIds?.includes(cls.id) || false}
                        onCheckedChange={(checked) => {
                          const current = copyForm.classIds || [];
                          if (checked) {
                            setCopyForm({ ...copyForm, classIds: [...current, cls.id] });
                          } else {
                            setCopyForm({ ...copyForm, classIds: current.filter(id => id !== cls.id) });
                          }
                        }}
                      />
                      <label className="text-sm">{cls.name} - Grade {cls.grade}</label>
                    </div>
                  ))}
                </div>
              </FormField>
            </Form>
          </div>

          <ModalFooter>
            <Button intent="cancel" onClick={() => setShowCopyModal(false)}>
              Cancel
            </Button>
            <Button
              intent="primary"
              onClick={handleCopyFromPreviousYear}
              loading={processing}
              disabled={!copyForm.fromAcademicYearId}
            >
              Copy Assignments
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BulkAssignmentWizard;