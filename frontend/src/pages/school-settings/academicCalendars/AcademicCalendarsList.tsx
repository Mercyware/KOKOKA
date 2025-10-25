import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Calendar, Edit, Trash2, Eye, Loader2, Filter, X, MoreVertical } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import {
  Card,
  CardContent,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import {
  getAllAcademicCalendars,
  deleteAcademicCalendar,
  AcademicCalendar
} from '../../../services/academicCalendarService';
import { getAllAcademicYears } from '../../../services/academicYearService';
import { AcademicYear } from '../../../types';

const AcademicCalendarsList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [academicCalendars, setAcademicCalendars] = useState<AcademicCalendar[]>([]);
  const [filteredCalendars, setFilteredCalendars] = useState<AcademicCalendar[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [calendarToDelete, setCalendarToDelete] = useState<string | null>(null);

  // Filter states
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('all');
  const [selectedTerm, setSelectedTerm] = useState<string>('all');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedAcademicYear, selectedTerm, academicCalendars]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [calendarsResponse, yearsResponse] = await Promise.all([
        getAllAcademicCalendars(),
        getAllAcademicYears()
      ]);

      if (calendarsResponse.success && calendarsResponse.data) {
        setAcademicCalendars(calendarsResponse.data);
        setFilteredCalendars(calendarsResponse.data);
      } else {
        toast({
          title: "Error",
          description: calendarsResponse.message || 'Failed to fetch academic calendars',
          variant: "destructive",
        });
      }

      if (yearsResponse.success && yearsResponse.data) {
        const yearsData = Array.isArray(yearsResponse.data)
          ? yearsResponse.data
          : yearsResponse.data.academicYears || [];
        setAcademicYears(yearsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: 'An error occurred while fetching data',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...academicCalendars];

    if (selectedAcademicYear !== 'all') {
      filtered = filtered.filter(calendar => {
        const yearId = typeof calendar.academicYear === 'string'
          ? calendar.academicYear
          : calendar.academicYear.id;
        return yearId === selectedAcademicYear;
      });
    }

    if (selectedTerm !== 'all') {
      filtered = filtered.filter(calendar =>
        calendar.term.toUpperCase() === selectedTerm.toUpperCase()
      );
    }

    setFilteredCalendars(filtered);
  };

  const clearFilters = () => {
    setSelectedAcademicYear('all');
    setSelectedTerm('all');
  };

  const hasActiveFilters = selectedAcademicYear !== 'all' || selectedTerm !== 'all';

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
        fetchInitialData();
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
          <Button intent="primary" onClick={handleCreateCalendar}>
            <Plus className="h-4 w-4 mr-2" />
            Add Academic Calendar
          </Button>
        </div>


        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by:
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                {/* Academic Year Filter */}
                <div className="w-full sm:w-64">
                  <Select value={selectedAcademicYear} onValueChange={setSelectedAcademicYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Academic Years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Academic Years</SelectItem>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Term Filter */}
                <div className="w-full sm:w-48">
                  <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terms</SelectItem>
                      <SelectItem value="FIRST">First Term</SelectItem>
                      <SelectItem value="SECOND">Second Term</SelectItem>
                      <SelectItem value="THIRD">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters Button */}
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilters}
                    className="w-full sm:w-auto"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                )}
              </div>

              {/* Results Count */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredCalendars.length} of {academicCalendars.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Loading academic calendars...</span>
              </div>
            ) : filteredCalendars.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-xl font-medium text-gray-600 dark:text-gray-400 mb-2">
                  {hasActiveFilters ? 'No calendars match your filters' : 'No academic calendars found'}
                </p>
                <p className="text-gray-500 dark:text-gray-500 mb-4">
                  {hasActiveFilters
                    ? 'Try adjusting your filters or clear them to see all calendars'
                    : 'Get started by creating your first academic calendar'}
                </p>
                {hasActiveFilters ? (
                  <Button onClick={clearFilters} intent="cancel">
                    <X className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={handleCreateCalendar} intent="primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Academic Calendar
                  </Button>
                )}
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
                  {filteredCalendars.map((calendar) => (
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800">
                              <MoreVertical className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleEditCalendar(calendar.id || '')}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setCalendarToDelete(calendar.id || '')}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!calendarToDelete} onOpenChange={(open) => !open && setCalendarToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this academic calendar? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                intent="cancel"
                onClick={() => setCalendarToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                intent="danger"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default AcademicCalendarsList;
