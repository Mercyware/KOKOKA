import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { SubjectAssignment, CreateSubjectAssignmentData, UpdateSubjectAssignmentData } from '@/services/subjectAssignmentService';

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

interface SubjectAssignmentFormProps {
  assignment?: SubjectAssignment;
  staff: Staff[];
  subjects: Subject[];
  classes: Class[];
  sections: Section[];
  academicYears: AcademicYear[];
  onSubmit: (data: CreateSubjectAssignmentData | UpdateSubjectAssignmentData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export const SubjectAssignmentForm: React.FC<SubjectAssignmentFormProps> = ({
  assignment,
  staff,
  subjects,
  classes,
  sections,
  academicYears,
  onSubmit,
  onCancel,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    staffId: assignment?.staffId || '',
    subjectId: assignment?.subjectId || '',
    classId: assignment?.classId || '',
    academicYearId: assignment?.academicYearId || '',
    sectionId: assignment?.sectionId || '',
    startDate: assignment?.startDate ? new Date(assignment.startDate).toISOString().split('T')[0] : '',
    endDate: assignment?.endDate ? new Date(assignment.endDate).toISOString().split('T')[0] : '',
    hoursPerWeek: assignment?.hoursPerWeek?.toString() || '',
    term: assignment?.term?.toString() || '',
    isMainTeacher: assignment?.isMainTeacher ?? true,
    canGrade: assignment?.canGrade ?? true,
    canMarkAttendance: assignment?.canMarkAttendance ?? true,
    notes: assignment?.notes || '',
    description: assignment?.description || '',
    status: assignment?.status || 'ACTIVE'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set current academic year as default if creating new assignment
    if (!isEdit && !formData.academicYearId) {
      const currentYear = academicYears.find(year => year.isCurrent);
      if (currentYear) {
        setFormData(prev => ({ ...prev, academicYearId: currentYear.id }));
      }
    }
  }, [academicYears, isEdit, formData.academicYearId]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = {
        ...formData,
        hoursPerWeek: formData.hoursPerWeek ? parseInt(formData.hoursPerWeek.toString()) : undefined,
        term: formData.term && formData.term !== 'all' ? parseInt(formData.term.toString()) : undefined,
        sectionId: formData.sectionId && formData.sectionId !== 'all' ? formData.sectionId : null,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        notes: formData.notes || undefined,
        description: formData.description || undefined
      };

      // Remove empty strings and null values
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null) {
          delete submitData[key];
        }
      });

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return formData.staffId && formData.subjectId && formData.classId && formData.academicYearId;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Core Assignment Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="staffId">Teacher *</Label>
          <Select
            value={formData.staffId}
            onValueChange={(value) => handleChange('staffId', value)}
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent>
              {staff?.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} ({teacher.employeeId})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subjectId">Subject *</Label>
          <Select
            value={formData.subjectId}
            onValueChange={(value) => handleChange('subjectId', value)}
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects?.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name} ({subject.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="classId">Class *</Label>
          <Select
            value={formData.classId}
            onValueChange={(value) => handleChange('classId', value)}
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes?.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name} (Grade {cls.grade})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sectionId">Section</Label>
          <Select
            value={formData.sectionId}
            onValueChange={(value) => handleChange('sectionId', value)}
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue placeholder="Entire Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Entire Class</SelectItem>
              {sections?.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  Section {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-gray-500">Leave empty to assign to entire class</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="academicYearId">Academic Year *</Label>
          <Select
            value={formData.academicYearId}
            onValueChange={(value) => handleChange('academicYearId', value)}
            disabled={isEdit}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Academic Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears?.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name} {year.isCurrent && '(Current)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isEdit && (
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Schedule and Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="hoursPerWeek">Hours per Week</Label>
          <Input
            id="hoursPerWeek"
            type="number"
            value={formData.hoursPerWeek}
            onChange={(e) => handleChange('hoursPerWeek', e.target.value)}
            min="1"
            max="40"
            placeholder="e.g., 5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="term">Term</Label>
          <Select
            value={formData.term}
            onValueChange={(value) => handleChange('term', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Terms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Terms</SelectItem>
              <SelectItem value="1">Term 1</SelectItem>
              <SelectItem value="2">Term 2</SelectItem>
              <SelectItem value="3">Term 3</SelectItem>
              <SelectItem value="4">Term 4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>

      {/* Permissions */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Permissions</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMainTeacher"
              checked={formData.isMainTeacher}
              onCheckedChange={(checked) => handleChange('isMainTeacher', checked)}
            />
            <Label htmlFor="isMainTeacher" className="text-sm font-normal">
              Main Teacher
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="canGrade"
              checked={formData.canGrade}
              onCheckedChange={(checked) => handleChange('canGrade', checked)}
            />
            <Label htmlFor="canGrade" className="text-sm font-normal">
              Can Grade
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="canMarkAttendance"
              checked={formData.canMarkAttendance}
              onCheckedChange={(checked) => handleChange('canMarkAttendance', checked)}
            />
            <Label htmlFor="canMarkAttendance" className="text-sm font-normal">
              Can Mark Attendance
            </Label>
          </div>
        </div>
      </div>

      {/* Notes and Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of the assignment"
            rows={3}
            maxLength={500}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Additional notes or comments"
            rows={3}
            maxLength={1000}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
        <Button
          type="button"
          intent="cancel"
          onClick={onCancel}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          intent="primary"
          disabled={!validateForm() || loading}
          className="w-full sm:w-auto"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Assignment' : 'Create Assignment'}
        </Button>
      </div>
    </form>
  );
};