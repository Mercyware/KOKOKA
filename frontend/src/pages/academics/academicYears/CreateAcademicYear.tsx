import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { format } from 'date-fns';
import { Save, ArrowLeft, CalendarDays, Loader2, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { post } from '../../../services/api';

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  schoolId?: string;
}

const CreateAcademicYear: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showActiveWarning, setShowActiveWarning] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    schoolId: authState.user?.school,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const startYear = new Date(formData.startDate).getFullYear();
      const endYear = new Date(formData.endDate).getFullYear();
      
      if (startYear === endYear) {
        setFormData(prev => ({
          ...prev,
          name: `${startYear}`
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          name: `${startYear}-${endYear}`
        }));
      }
    }
  }, [formData.startDate, formData.endDate]);

  const checkDuplicateName = async (name: string): Promise<boolean> => {
    if (!name.trim()) return false;
    
    try {
      const token = localStorage.getItem('token');
      const school = authState.user?.school;
      const response = await fetch(
        `/api/academic-years/check-name?name=${encodeURIComponent(name)}&school=${encodeURIComponent(school || '')}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('Error checking duplicate name:', error);
      return false;
    }
  };

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      name: value,
    }));

    if (value.trim()) {
      const isDuplicate = await checkDuplicateName(value);
      setIsDuplicate(isDuplicate);
      
      if (isDuplicate) {
        setErrors(prev => ({
          ...prev,
          name: 'Academic year name already exists',
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          name: '',
        }));
      }
    } else {
      setErrors(prev => ({
        ...prev,
        name: '',
      }));
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'startDate' && value && !formData.endDate) {
      const startDate = new Date(value);
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);
      
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0],
      }));
    }

    setErrors(prev => ({
      ...prev,
      [name]: '',
      dateRange: '',
    }));
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    if (checked) {
      setShowActiveWarning(true);
      return;
    }

    setFormData(prev => ({
      ...prev,
      isCurrent: checked,
    }));
  };

  const handleActiveConfirm = () => {
    setFormData(prev => ({
      ...prev,
      isCurrent: true,
    }));
    setShowActiveWarning(false);
  };

  const calculateDurationInMonths = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    return diffMonths;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Academic year name is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';

    if (formData.startDate && formData.endDate) {
      if (formData.startDate >= formData.endDate) {
        newErrors.endDate = 'End date must be after start date';
      }

      const durationInMonths = calculateDurationInMonths(formData.startDate, formData.endDate);
      if (durationInMonths < 6) {
        newErrors.dateRange = 'Academic year must be at least 6 months long';
      } else if (durationInMonths > 24) {
        newErrors.dateRange = 'Academic year cannot be longer than 2 years';
      }

      const now = new Date();
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(now.getFullYear() - 2);
      const fiveYearsFromNow = new Date();
      fiveYearsFromNow.setFullYear(now.getFullYear() + 5);

      if (startDate < twoYearsAgo) {
        newErrors.startDate = 'Start date cannot be more than 2 years in the past';
      }
      
      if (endDate > fiveYearsFromNow) {
        newErrors.endDate = 'End date cannot be more than 5 years in the future';
      }
    }

    if (formData.name && formData.name.length > 100) {
      newErrors.name = 'Academic year name cannot exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error",
        description: 'Please fix the errors in the form',
        variant: "destructive",
      });
      return;
    }

    if (isDuplicate) {
      toast({
        title: "Error",
        description: 'Please choose a different academic year name',
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const dataToSubmit = {
        name: formData.name?.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        description: formData.description?.trim() || '',
        schoolId: authState.user?.school,
      };

      const response = await post('/academic-years', dataToSubmit);

      if (response.success) {
        toast({
          title: "Success",
          description: 'Academic year created successfully',
        });

        setTimeout(() => {
          navigate('/academics/academic-years');
        }, 2000);
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to create academic year',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error creating academic year:', error);
      toast({
        title: "Error",
        description: 'An error occurred while creating the academic year',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDurationInfo = () => {
    if (formData.startDate && formData.endDate) {
      const months = calculateDurationInMonths(formData.startDate, formData.endDate);
      return `Duration: ${months} months`;
    }
    return '';
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM yyyy');
    } catch (error) {
      return '';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="h-8 w-8 text-blue-600" />
              Create New Academic Year
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Set up a new academic year with dates and settings
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/academics/academic-years')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Academic Year Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Academic Year Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g., 2023-2024"
                  className={errors.name || isDuplicate ? "border-red-500" : ""}
                />
                {(errors.name || isDuplicate) && (
                  <p className="text-sm text-red-500">{errors.name || 'This name already exists'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleDateChange}
                    className={errors.startDate ? "border-red-500" : ""}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-red-500">{errors.startDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleDateChange}
                    min={formData.startDate || undefined}
                    className={errors.endDate ? "border-red-500" : ""}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-red-500">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {(formData.startDate && formData.endDate) && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {getDurationInfo()}
                    </Badge>
                    <Badge variant="outline" className="text-purple-600 border-purple-300">
                      <CalendarDays className="h-3 w-3 mr-1" />
                      {formatDateForDisplay(formData.startDate)} - {formatDateForDisplay(formData.endDate)}
                    </Badge>
                  </div>
                  {errors.dateRange && (
                    <p className="text-sm text-red-500">{errors.dateRange}</p>
                  )}
                </div>
              )}

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="isCurrent">Set as Current Academic Year</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Setting this as current will deactivate all other academic years for your school
                    </p>
                  </div>
                  <Switch
                    id="isCurrent"
                    checked={formData.isCurrent}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>

                {formData.isCurrent && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">This will be set as the current academic year</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleTextFieldChange}
                  placeholder="Optional description for this academic year..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                <div className="flex justify-between items-center">
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/academics/academic-years')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || isDuplicate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Academic Year
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Active Academic Year Warning Dialog */}
        <Dialog open={showActiveWarning} onOpenChange={setShowActiveWarning}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Set as Current Academic Year?
              </DialogTitle>
              <DialogDescription>
                Setting this academic year as current will automatically deactivate all other academic years for your school. 
                Only one academic year can be current at a time. Are you sure you want to continue?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActiveWarning(false)}>
                Cancel
              </Button>
              <Button onClick={handleActiveConfirm} className="bg-blue-600 hover:bg-blue-700">
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CreateAcademicYear;
