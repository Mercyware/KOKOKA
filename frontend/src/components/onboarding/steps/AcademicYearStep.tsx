import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { StepComponentProps } from '../OnboardingWizard';
import { Button, DatePicker, Input, Label, Alert, AlertDescription, useToast } from '@/components/ui';
import * as academicYearService from '@/services/academicYearService';

const AcademicYearStep: React.FC<StepComponentProps> = ({ onComplete }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string | Date | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Academic year name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      if (formData.endDate <= formData.startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await academicYearService.createAcademicYear({
        name: formData.name,
        startDate: formData.startDate?.toISOString().split('T')[0] || '',
        endDate: formData.endDate?.toISOString().split('T')[0] || '',
        isCurrent: true, // Set as current year
      });

      if (response.success) {
        toast({
          title: 'Academic Year Created',
          description: 'Your academic year has been set up successfully.',
        });
        onComplete?.(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create academic year',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Store form data and enable navigation when form is valid
  const [canProceed, setCanProceed] = React.useState(false);

  React.useEffect(() => {
    const isValid = Boolean(
      formData.name.trim() &&
      formData.startDate &&
      formData.endDate &&
      formData.endDate > formData.startDate
    );
    setCanProceed(isValid);
  }, [formData]);

  // Set default dates (current year September to next year June)
  React.useEffect(() => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    setFormData({
      name: `${currentYear}/${nextYear}`,
      startDate: new Date(currentYear, 8, 1), // September 1st
      endDate: new Date(nextYear, 5, 30), // June 30th
    });
  }, []);

  return (
    <div className="space-y-6">
      <Alert>
        <CalendarIcon className="h-4 w-4" />
        <AlertDescription>
          The academic year defines the period for which students are enrolled, classes are
          conducted, and academic activities are tracked.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">
            Academic Year Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            placeholder="e.g., 2024/2025"
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">
            Typically formatted as "YYYY/YYYY" (e.g., 2024/2025)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">
              Start Date <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              value={formData.startDate}
              onChange={(date) => handleChange('startDate', date)}
              placeholder="Select start date"
              className={errors.startDate ? 'border-red-500' : ''}
            />
            {errors.startDate && (
              <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="endDate">
              End Date <span className="text-red-500">*</span>
            </Label>
            <DatePicker
              value={formData.endDate}
              onChange={(date) => handleChange('endDate', date)}
              placeholder="Select end date"
              fromDate={formData.startDate}
              className={errors.endDate ? 'border-red-500' : ''}
            />
            {errors.endDate && (
              <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-800 dark:text-cyan-200">
            <p className="font-medium mb-1">Tip:</p>
            <p>
              You can add multiple academic years later. This first one will be set as the current
              active year for your school.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {canProceed ? (
              <span className="text-green-600 dark:text-green-400">✓ Ready to proceed</span>
            ) : (
              <span>Please fill in all required fields</span>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={loading || !canProceed}
            className="text-sm"
          >
            {loading ? 'Saving...' : 'Save Academic Year'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AcademicYearStep;
