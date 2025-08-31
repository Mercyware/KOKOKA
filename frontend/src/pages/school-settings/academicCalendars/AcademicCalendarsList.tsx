import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Calendar, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { 
  getAllAcademicCalendars, 
  deleteAcademicCalendar,
  AcademicCalendar
} from '../../../services/academicCalendarService';

const AcademicCalendarsList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [academicCalendars, setAcademicCalendars] = useState<AcademicCalendar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [calendarToDelete, setCalendarToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAcademicCalendars();
  }, []);

  const fetchAcademicCalendars = async () => {
    setLoading(true);
    try {
      const response = await getAllAcademicCalendars();
      if (response.success && response.data) {
        setAcademicCalendars(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch academic calendars',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching academic calendars:', error);
      toast({
        title: "Error",
        description: 'An error occurred while fetching academic calendars',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCalendar = () => {
    navigate('/school-settings/academic-calendars/create');
  };

  const handleEditCalendar = (id: string) => {
    navigate(`/school-settings/academic-calendars/edit/${id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!calendarToDelete) return;

    try {
      const response = await deleteAcademicCalendar(calendarToDelete);
      if (response.success) {
        toast({
          title: "Success",
          description: 'Academic calendar deleted successfully',
        });
        fetchAcademicCalendars();
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to delete academic calendar',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting academic calendar:', error);
      toast({
        title: "Error",
        description: 'An error occurred while deleting the academic calendar',
        variant: "destructive",
      });
    } finally {
      setCalendarToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  const getAcademicYearName = (academicYear: string | { id: string; name: string }) => {
    if (typeof academicYear === 'string') {
      return academicYear;
    }
    return academicYear.name;
  };

  const getTermBadgeVariant = (term: string) => {
    switch (term.toLowerCase()) {
      case 'first':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'second':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'third':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              Academic Calendars
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage academic calendar schedules and holidays
            </p>
          </div>
          <Button onClick={handleCreateCalendar} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Academic Calendar
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Loading academic calendars...</span>
              </div>
            ) : academicCalendars.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                  No academic calendars found
                </p>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  Get started by creating your first academic calendar
                </p>
                <Button onClick={handleCreateCalendar} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Academic Calendar
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Holidays</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {academicCalendars.map((calendar) => (
                    <TableRow key={calendar.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="font-medium">
                        {getAcademicYearName(calendar.academicYear)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getTermBadgeVariant(calendar.term)}>
                          {calendar.term} Term
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(calendar.startDate)}</TableCell>
                      <TableCell>{formatDate(calendar.endDate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          {calendar.holidays.length} holidays
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCalendar(calendar.id || '')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => setCalendarToDelete(calendar.id || '')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this academic calendar? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setCalendarToDelete(null)}>
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteConfirm}
                                  className="bg-red-600 hover:bg-red-700"
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
        {academicCalendars.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {academicCalendars.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Calendars</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {academicCalendars.reduce((total, calendar) => total + calendar.holidays.length, 0)}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Holidays</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {new Set(academicCalendars.map(calendar => calendar.term)).size}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Terms</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AcademicCalendarsList;
