import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, CalendarDays, Edit, Trash2, CheckCircle, Loader2, Clock, Save, AlertTriangle, X } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { get, del, put, post } from '../../../services/api';
import { AcademicYear } from '../../../types';

interface FormData {
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  schoolId?: string;
}

const AcademicYearsList: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearToDelete, setYearToDelete] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [showActiveWarning, setShowActiveWarning] = useState(false);
  
  // Form data
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
    fetchAcademicYears();
  }, []);

  // Auto-generate academic year name when dates change (only in create mode)
  useEffect(() => {
    if (formData.startDate && formData.endDate && !editingYear) {
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
  }, [formData.startDate, formData.endDate, editingYear]);

  const resetForm = () => {
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      schoolId: authState.user?.school,
    });
    setErrors({});
    setIsDuplicate(false);
    setShowActiveWarning(false);
    setEditingYear(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (year: AcademicYear) => {
    // Find the most current data for this year from state
    const currentYear = academicYears.find(y => y.id === year.id) || year;
    
    setEditingYear(currentYear);
    setFormData({
      name: currentYear.name,
      startDate: new Date(currentYear.startDate).toISOString().split('T')[0],
      endDate: new Date(currentYear.endDate).toISOString().split('T')[0],
      isCurrent: currentYear.isCurrent,
      description: currentYear.description || '',
      schoolId: currentYear.schoolId,
    });
    setErrors({});
    setIsDuplicate(false);
    setShowActiveWarning(false);
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const fetchAcademicYears = async () => {
    setLoading(true);
    try {
      const response = await get<AcademicYear[]>('/academic-years');
      if (response.data) {
        setAcademicYears(response.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      toast({
        title: "Error",
        description: 'Failed to load academic years',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkDuplicateName = async (name: string, excludeId?: string): Promise<boolean> => {
    if (!name.trim()) return false;
    
    try {
      const token = localStorage.getItem('token');
      const school = authState.user?.school;
      let url = `/api/academic-years/check-name?name=${encodeURIComponent(name)}&school=${encodeURIComponent(school || '')}`;
      
      if (excludeId) {
        url += `&excludeId=${encodeURIComponent(excludeId)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      return data.exists || false;
    } catch (error) {
      console.error('Error checking duplicate name:', error);
      return false;
    }
  };

  const calculateDurationInMonths = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    return diffMonths;
  };

  const handleNameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      name: value,
    }));

    if (value.trim()) {
      const excludeId = editingYear?.id;
      const isDuplicate = await checkDuplicateName(value, excludeId);
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

    if (name === 'startDate' && value && !formData.endDate && !editingYear) {
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

    setModalLoading(true);

    try {
      const dataToSubmit = {
        name: formData.name?.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        isCurrent: formData.isCurrent,
        description: formData.description?.trim() || '',
        schoolId: authState.user?.school,
      };

      let response;
      if (editingYear) {
        response = await put(`/academic-years/${editingYear.id}`, dataToSubmit);
      } else {
        response = await post('/academic-years', dataToSubmit);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Academic year ${editingYear ? 'updated' : 'created'} successfully`,
        });

        // Update local state immediately to prevent stale data issues
        if (editingYear) {
          // Update the existing year in the local state
          const updatedYear = {
            ...editingYear,
            ...dataToSubmit,
            id: editingYear.id,
            // Use server response data if available
            ...(response.data || {}),
          };
          
          setAcademicYears(prevYears =>
            prevYears.map(year =>
              year.id === editingYear.id ? updatedYear : year
            )
          );
          
          // Also update the editing year reference
          setEditingYear(updatedYear);
        } else {
          // For create, we still need to fetch to get the new ID and any server-generated data
          await fetchAcademicYears();
        }
        
        // Refresh from server to ensure data consistency (but local state is already updated)
        if (editingYear) {
          fetchAcademicYears(); // Don't await this for edit operations
        }
        
        closeModals();
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${editingYear ? 'update' : 'create'} academic year`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${editingYear ? 'updating' : 'creating'} academic year:`, error);
      toast({
        title: "Error",
        description: `An error occurred while ${editingYear ? 'updating' : 'creating'} the academic year`,
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!yearToDelete) return;

    try {
      const response = await del(`/academic-years/${yearToDelete}`);
      if (response.success) {
        toast({
          title: "Success",
          description: 'Academic year deleted successfully',
        });
        setAcademicYears(academicYears.filter(year => year.id !== yearToDelete));
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to delete academic year',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting academic year:', error);
      toast({
        title: "Error",
        description: 'An error occurred while deleting the academic year',
        variant: "destructive",
      });
    } finally {
      setYearToDelete(null);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      const response = await put(`/academic-years/${id}/set-active`, {});
      if (response.success) {
        toast({
          title: "Success",
          description: 'Academic year set as active successfully',
        });
        setAcademicYears(prevYears =>
          prevYears.map(year => ({
            ...year,
            isCurrent: year.id === id,
          }))
        );
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to set academic year as active',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error setting academic year as active:', error);
      toast({
        title: "Error",
        description: 'An error occurred while setting the academic year as active',
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string | Date) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadgeVariant = (isCurrent: boolean) => {
    return isCurrent 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const calculateDuration = (startDate: string | Date, endDate: string | Date) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
      return `${diffMonths} months`;
    } catch (error) {
      return 'N/A';
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
              Academic Years
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage academic year periods and settings
            </p>
          </div>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Academic Year
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Loading academic years...</span>
              </div>
            ) : academicYears.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                  No academic years found
                </p>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  Get started by creating your first academic year
                </p>
                <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Academic Year
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicYears.map((year) => (
                    <TableRow key={year.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-medium">{year.name}</TableCell>
                      <TableCell>{formatDate(year.startDate)}</TableCell>
                      <TableCell>{formatDate(year.endDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                          {calculateDuration(year.startDate, year.endDate)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {year.isCurrent ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetActive(year.id)}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Set Current
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {year.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(year)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                disabled={year.isCurrent}
                                onClick={() => setYearToDelete(year.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this academic year? This action cannot be undone.
                                  {year.isCurrent && " You cannot delete the current academic year."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setYearToDelete(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteConfirm}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={year.isCurrent}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {academicYears.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {academicYears.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Years</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {academicYears.filter(year => year.isCurrent).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {academicYears.filter(year => {
                    const endDate = new Date(year.endDate);
                    return endDate > new Date();
                  }).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {academicYears.filter(year => {
                    const endDate = new Date(year.endDate);
                    return endDate < new Date();
                  }).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create/Edit Academic Year Modal */}
        <Dialog open={showCreateModal || showEditModal} onOpenChange={closeModals}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                {editingYear ? 'Edit Academic Year' : 'Create New Academic Year'}
              </DialogTitle>
              <DialogDescription>
                {editingYear 
                  ? 'Update academic year information and settings' 
                  : 'Set up a new academic year with dates and settings'}
              </DialogDescription>
            </DialogHeader>

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
                      <span className="text-sm font-medium">
                        This will be set as the current academic year
                      </span>
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

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModals}
                  disabled={modalLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={modalLoading || isDuplicate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {editingYear ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingYear ? 'Update Academic Year' : 'Create Academic Year'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

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

export default AcademicYearsList;
