import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Save, ArrowLeft, Plus, Trash2, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { get } from '../../../services/api';
import {
  getAcademicCalendarById,
  createAcademicCalendar,
  updateAcademicCalendar,
  AcademicCalendar,
  Holiday,
} from '../../../services/academicCalendarService';

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const AcademicCalendarForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [formData, setFormData] = useState<Partial<AcademicCalendar>>({
    academicYear: '',
    term: 'FIRST',
    startDate: '',
    endDate: '',
    holidays: [],
  });
  const [holidayDialogOpen, setHolidayDialogOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState<Partial<Holiday>>({
    name: '',
    date: '',
    description: '',
  });
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);

  useEffect(() => {
    fetchAcademicYears();
    if (isEditMode) {
      fetchAcademicCalendar();
    }
  }, [id]);

  useEffect(() => {
    console.log('Academic years state updated:', academicYears);
  }, [academicYears]);

  const fetchAcademicYears = async () => {
    try {
      console.log('Fetching academic years...');
      const response = await get<AcademicYear[]>('/academic-years');
      console.log('Academic years response:', response);
      if (response.success && response.data) {
        console.log('Academic years loaded:', response.data);
        setAcademicYears(response.data);
      } else {
        console.log('Failed to fetch academic years:', response.message);
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch academic years',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      toast({
        title: "Error",
        description: 'An error occurred while fetching academic years',
        variant: "destructive",
      });
    }
  };

  const fetchAcademicCalendar = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getAcademicCalendarById(id);
      if (response.success && response.data) {
        const calendar = response.data;
        setFormData({
          ...calendar,
          academicYear: typeof calendar.academicYear === 'string' 
            ? calendar.academicYear 
            : calendar.academicYear.id,
        });

        if (typeof calendar.academicYear !== 'string') {
          const yearId = calendar.academicYear.id;
          const year = academicYears.find(y => y.id === yearId);
          if (year) {
            setSelectedAcademicYear(year);
          }
        }
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch academic calendar',
          variant: "destructive",
        });
        navigate('/academics/academic-calendars');
      }
    } catch (error) {
      console.error('Error fetching academic calendar:', error);
      toast({
        title: "Error",
        description: 'An error occurred while fetching the academic calendar',
        variant: "destructive",
      });
      navigate('/academics/academic-calendars');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AcademicCalendar, value: string) => {
    console.log(`handleInputChange called: ${field} = ${value}`);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('Updated form data:', newData);
      return newData;
    });

    if (field === 'academicYear') {
      const year = academicYears.find(y => y.id === value);
      console.log('Selected academic year:', year);
      setSelectedAcademicYear(year || null);
    }
  };

  const handleHolidayInputChange = (field: keyof Holiday, value: string) => {
    setNewHoliday(prev => ({ ...prev, [field]: value }));
  };

  const handleAddHoliday = () => {
    if (!newHoliday.name || !newHoliday.date) {
      toast({
        title: "Error",
        description: 'Holiday name and date are required',
        variant: "destructive",
      });
      return;
    }

    if (formData.startDate && formData.endDate) {
      const holidayDate = new Date(newHoliday.date);
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (holidayDate < startDate || holidayDate > endDate) {
        toast({
          title: "Error",
          description: 'Holiday date must be within the calendar period',
          variant: "destructive",
        });
        return;
      }
    }

    const updatedHolidays = [...(formData.holidays || []), newHoliday as Holiday];
    setFormData(prev => ({ ...prev, holidays: updatedHolidays }));

    setNewHoliday({
      name: '',
      date: '',
      description: '',
    });

    setHolidayDialogOpen(false);
  };

  const handleRemoveHoliday = (index: number) => {
    const updatedHolidays = [...(formData.holidays || [])];
    updatedHolidays.splice(index, 1);
    setFormData(prev => ({ ...prev, holidays: updatedHolidays }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    console.log('Form data:', formData);
    console.log('Is edit mode:', isEditMode);

    if (!formData.academicYear || formData.academicYear === '' || !formData.term || !formData.startDate || !formData.endDate) {
      console.log('Validation failed: Missing required fields');
      console.log('academicYear:', formData.academicYear);
      console.log('term:', formData.term);
      console.log('startDate:', formData.startDate);
      console.log('endDate:', formData.endDate);
      toast({
        title: "Error",
        description: 'Please fill in all required fields',
        variant: "destructive",
      });
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (startDate > endDate) {
      toast({
        title: "Error",
        description: 'Start date cannot be after end date',
        variant: "destructive",
      });
      return;
    }

    if (selectedAcademicYear) {
      const academicYearStartDate = new Date(selectedAcademicYear.startDate);
      const academicYearEndDate = new Date(selectedAcademicYear.endDate);

      if (startDate < academicYearStartDate || endDate > academicYearEndDate) {
        toast({
          title: "Error",
          description: 'Calendar dates must be within the academic year period',
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const schoolId = user.school;

      if (!schoolId) {
        toast({
          title: "Error",
          description: 'School information not found',
          variant: "destructive",
        });
        return;
      }

      // Transform the data to match the backend expectations
      const calendarData = {
        academicYearId: formData.academicYear as string,
        term: formData.term as string,
        startDate: formData.startDate as string,
        endDate: formData.endDate as string,
        holidays: formData.holidays || [],
      };

      console.log('Calendar data to be sent:', calendarData);

      let response;
      if (isEditMode && id) {
        console.log('Calling updateAcademicCalendar API');
        response = await updateAcademicCalendar(id, calendarData);
      } else {
        console.log('Calling createAcademicCalendar API');
        response = await createAcademicCalendar(calendarData);
      }

      console.log('API response:', response);

      if (response.success) {
        toast({
          title: "Success",
          description: `Academic calendar ${isEditMode ? 'updated' : 'created'} successfully`,
        });
        navigate('/academics/academic-calendars');
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${isEditMode ? 'update' : 'create'} academic calendar`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} academic calendar:`, error);
      toast({
        title: "Error",
        description: `An error occurred while ${isEditMode ? 'updating' : 'creating'} the academic calendar`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
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
              <CalendarIcon className="h-8 w-8 text-blue-600" />
              {isEditMode ? 'Edit Academic Calendar' : 'Create Academic Calendar'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditMode ? 'Update calendar information' : 'Add a new academic calendar with schedules and holidays'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/academics/academic-calendars')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to List
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading...</span>
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Calendar Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="academicYear">Academic Year *</Label>
                    <Select
                      value={typeof formData.academicYear === 'string' ? formData.academicYear : formData.academicYear?.id || ''}
                      onValueChange={(value) => handleInputChange('academicYear', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term">Term *</Label>
                    <Select
                      value={formData.term || 'FIRST'}
                      onValueChange={(value) => handleInputChange('term', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIRST">First Term</SelectItem>
                        <SelectItem value="SECOND">Second Term</SelectItem>
                        <SelectItem value="THIRD">Third Term</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formatDateForInput(formData.startDate || '')}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formatDateForInput(formData.endDate || '')}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Holidays</h3>
                    <Dialog open={holidayDialogOpen} onOpenChange={setHolidayDialogOpen}>
                      <DialogTrigger asChild>
                        <Button type="button" variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Holiday
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Holiday</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="holidayName">Holiday Name *</Label>
                            <Input
                              id="holidayName"
                              value={newHoliday.name || ''}
                              onChange={(e) => handleHolidayInputChange('name', e.target.value)}
                              placeholder="Enter holiday name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="holidayDate">Holiday Date *</Label>
                            <Input
                              id="holidayDate"
                              type="date"
                              value={formatDateForInput(newHoliday.date || '')}
                              onChange={(e) => handleHolidayInputChange('date', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="holidayDescription">Description (Optional)</Label>
                            <Input
                              id="holidayDescription"
                              value={newHoliday.description || ''}
                              onChange={(e) => handleHolidayInputChange('description', e.target.value)}
                              placeholder="Enter description"
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setHolidayDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="button" onClick={handleAddHoliday}>
                              Add Holiday
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="space-y-2">
                    {formData.holidays && formData.holidays.length > 0 ? (
                      formData.holidays.map((holiday, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{holiday.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(holiday.date)}
                              {holiday.description && ` - ${holiday.description}`}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleRemoveHoliday(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No holidays added yet</p>
                        <p className="text-sm">Click "Add Holiday" to get started</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/academics/academic-calendars')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Update Calendar' : 'Create Calendar'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AcademicCalendarForm;
