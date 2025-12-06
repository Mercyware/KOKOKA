import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, User, Mail, Phone, Grid, List, Eye, Loader2, X, ChevronDown, Save, BookOpen, Home, Calendar, Percent, Award, Globe, Users, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DatePicker } from '@/components/ui/date-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { getStudents, StudentFilters } from '@/services/studentService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { getAllClasses } from '@/services/classService';
import { getHouses } from '@/services/houseService';
import { getSections } from '@/services/sectionService';
import { Student, Class, House } from '@/types';

interface StudentsManagerProps {
  onAddStudent: () => void;
  onViewStudent: (studentId: string) => void;
  onEditStudent: (studentId: string) => void;
}

const StudentsManager = ({ onAddStudent, onViewStudent, onEditStudent }: StudentsManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1
  });

  // Filter states
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    limit: 10,
    sort: 'firstName',
    order: 'asc'
  });
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [savedFilters, setSavedFilters] = useState<{ name: string, filters: StudentFilters }[]>([]);
  const [academicYears, setAcademicYears] = useState<{ id: string, name: string }[]>([]);
  const [sections, setSections] = useState<{ id: string, name: string }[]>([]);
  const [newFilterName, setNewFilterName] = useState('');
  const [activeFilterCategory, setActiveFilterCategory] = useState<string>('basic');
  const [filterValues, setFilterValues] = useState<StudentFilters>({}); // New state for filter form values

  // Fetch classes, houses, and academic years on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const classesResponse = await getAllClasses();
        setClasses(Array.isArray(classesResponse.data) ? classesResponse.data : []);
        console.log('Classes fetched:', classesResponse);

        const housesResponse = await getHouses();
        console.log('Houses response:', housesResponse);
        // Check if housesResponse is an array or has a data property
        if (Array.isArray(housesResponse)) {
          setHouses(housesResponse);
          console.log('Houses set from array:', housesResponse);
        } else {
          const housesData = Array.isArray(housesResponse.data) ? housesResponse.data : [];
          setHouses(housesData);
          console.log('Houses set from data property:', housesData);
        }

        const academicYearsResponse = await getAllAcademicYears();
        const academicYearsData = Array.isArray(academicYearsResponse.data) ? academicYearsResponse.data : [];
        setAcademicYears(
          academicYearsData.map((y: any) => ({
            id: y.id || y._id,
            name: y.name
          }))
        );

        // Load saved filters from localStorage
        const savedFiltersString = localStorage.getItem('studentFilters');
        if (savedFiltersString) {
          setSavedFilters(JSON.parse(savedFiltersString));
        }

        // Fetch sections
        const sectionsResponse = await getSections();
        if (sectionsResponse.success && sectionsResponse.data) {
          const sectionsData = Array.isArray(sectionsResponse.data)
            ? sectionsResponse.data
            : sectionsResponse.data.data || [];

          setSections(
            sectionsData.map((s: any) => ({
              id: s.id || s._id,
              name: s.name
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    fetchData();
  }, []);

  // Fetch students when filters change
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        // If search term is provided, add it to filters
        const searchFilters = { ...filters };
        if (searchTerm) {
          searchFilters.search = searchTerm;
        }

        const response = await getStudents(searchFilters);
        setStudents(response.data || []);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          limit: response.count || 10,
          pages: response.totalPages || 1
        });
      } catch (err: any) {
        console.error('Error fetching students:', err);
        if (err.response?.status === 401) {
          setError('Authentication required. Please log in to view students.');
        } else {
          setError('Failed to fetch students. Please try again later.');
        }
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search to avoid too many API calls
    const timer = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, searchTerm]);

  // Apply filter
  const applyFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));

    // Add to active filters if not already there
    if (!activeFilters.includes(key) && value !== undefined && value !== '') {
      setActiveFilters([...activeFilters, key]);
    } else if (value === undefined || value === '') {
      // Remove from active filters if value is cleared
      setActiveFilters(activeFilters.filter(filter => filter !== key));
    }
  };

  // Apply range filter
  const applyRangeFilter = (minKey: string, maxKey: string, minValue: any, maxValue: any) => {
    const newFilters = { ...filters };

    if (minValue !== undefined && minValue !== '') {
      newFilters[minKey as keyof StudentFilters] = minValue;
    } else {
      delete newFilters[minKey as keyof StudentFilters];
    }

    if (maxValue !== undefined && maxValue !== '') {
      newFilters[maxKey as keyof StudentFilters] = maxValue;
    } else {
      delete newFilters[maxKey as keyof StudentFilters];
    }

    setFilters(newFilters);

    // Update active filters
    const activeFiltersCopy = [...activeFilters];
    if (minValue !== undefined && minValue !== '') {
      if (!activeFiltersCopy.includes(minKey)) {
        activeFiltersCopy.push(minKey);
      }
    } else {
      const index = activeFiltersCopy.indexOf(minKey);
      if (index !== -1) {
        activeFiltersCopy.splice(index, 1);
      }
    }

    if (maxValue !== undefined && maxValue !== '') {
      if (!activeFiltersCopy.includes(maxKey)) {
        activeFiltersCopy.push(maxKey);
      }
    } else {
      const index = activeFiltersCopy.indexOf(maxKey);
      if (index !== -1) {
        activeFiltersCopy.splice(index, 1);
      }
    }

    setActiveFilters(activeFiltersCopy);
  };

  // Save current filters
  const saveCurrentFilters = () => {
    if (!newFilterName.trim()) return;

    const newSavedFilters = [
      ...savedFilters,
      { name: newFilterName, filters: { ...filters } }
    ];

    setSavedFilters(newSavedFilters);
    setNewFilterName('');

    // Save to localStorage
    localStorage.setItem('studentFilters', JSON.stringify(newSavedFilters));
  };

  // Load saved filter
  const loadSavedFilter = (savedFilter: { name: string, filters: StudentFilters }) => {
    setFilters(savedFilter.filters);

    // Update active filters
    const newActiveFilters: string[] = [];
    Object.entries(savedFilter.filters).forEach(([key, value]) => {
      if (key !== 'page' && key !== 'limit' && key !== 'sort' && key !== 'order' && value !== undefined && value !== '') {
        newActiveFilters.push(key);
      }
    });

    setActiveFilters(newActiveFilters);
    setFilterMenuOpen(false);
  };

  // Delete saved filter
  const deleteSavedFilter = (index: number) => {
    const newSavedFilters = [...savedFilters];
    newSavedFilters.splice(index, 1);
    setSavedFilters(newSavedFilters);

    // Save to localStorage
    localStorage.setItem('studentFilters', JSON.stringify(newSavedFilters));
  };

  // Clear filter
  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof StudentFilters];
    setFilters(newFilters);
    setActiveFilters(activeFilters.filter(filter => filter !== key));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sort: 'firstName',
      order: 'asc'
    });
    setActiveFilters([]);
    setSearchTerm('');
  };

  // Set active filter category
  const setFilterCategory = (category: string) => {
    setActiveFilterCategory(category);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Format student name
  const formatStudentName = (student: Student) => {
    const capitalize = (str: string) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
    return [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .map((str = '') => capitalize(str))
      .join(' ');
  };

  // Get student class and section name
  const getStudentClass = (student: Student) => {
    let classInfo = '';
    
    // Get class name - check multiple possible properties
    const currentClass = (student as any).currentClass?.name;
    if (currentClass) {
      classInfo = currentClass;
    } else if (typeof student.class === 'string') {
      classInfo = student.class;
    } else if (student.class && typeof student.class === 'object') {
      classInfo = (student.class as any).name || '';
    }
    
    // Add section name if available
    const sectionName = (student as any).currentSection?.name || (student as any).section?.name;
    if (sectionName) {
      classInfo = classInfo ? `${classInfo} - ${sectionName}` : sectionName;
    }
    
    return classInfo || 'N/A';
  };

  // Get student email
  const getStudentEmail = (student: Student) => {
    return student.email || 'N/A';
  };

  // Get student phone
  const getStudentPhone = (student: Student) => {
    return student.phone || student.contactInfo?.phone || '-';
  };

  // Get student status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'graduated':
        return 'bg-siohioma-primary/10 text-siohioma-primary dark:bg-siohioma-primary/20 dark:text-siohioma-primary';
      case 'transferred':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderCardView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading students...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-red-500 mb-6">
            <span className="font-semibold">Error:</span> {error}
          </div>
          <div className="flex gap-3 justify-center">
            {error.includes('Authentication') ? (
              <Button intent="primary" onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            ) : (
              <Button intent="secondary" onClick={() => setFilters({ ...filters })}>
                Retry
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-4">No students found matching your criteria.</p>
          {activeFilters.length > 0 && (
            <Button variant="outline" intent="cancel" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          )}
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student, index) => (
          <div
            key={student.id || index}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow duration-200"
          >
            {/* Header with Avatar, Name and Status */}
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-full flex-shrink-0">
                <User className="h-7 w-7 text-cyan-500 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                    {formatStudentName(student)}
                  </h3>
                  <Badge className="bg-green-50 text-green-700 border-green-200 text-xs px-2 py-0.5 flex-shrink-0">
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getStudentClass(student)}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-2 mb-5">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400 truncate">{getStudentEmail(student)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">{getStudentPhone(student)}</span>
              </div>
            </div>

            {/* Metrics - Side by Side */}
            <div className="flex items-center gap-8 mb-5">
              {student.averageGrade && (
                <div>
                  <p className="text-4xl font-bold text-cyan-500 dark:text-cyan-400">
                    {student.averageGrade.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">GPA</p>
                </div>
              )}
              {student.attendancePercentage && (
                <div>
                  <p className="text-4xl font-bold text-green-500 dark:text-green-400">
                    {student.attendancePercentage.toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Attendance</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewStudent(student._id || student.id)}
                className="flex-1"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditStudent(student._id || student.id)}
                className="flex-1"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTableView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading students...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="text-red-500 mb-6">
            <span className="font-semibold">Error:</span> {error}
          </div>
          <div className="flex gap-3 justify-center">
            {error.includes('Authentication') ? (
              <Button intent="primary" onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
            ) : (
              <Button intent="secondary" onClick={() => setFilters({ ...filters })}>
                Retry
              </Button>
            )}
          </div>
        </div>
      );
    }

    if (students.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-4">No students found matching your criteria.</p>
          {activeFilters.length > 0 && (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          )}
        </Card>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden md:table-cell">Class & Section</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Phone</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <User className="h-4 w-4 text-siohioma-primary dark:text-siohioma-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{formatStudentName(student)}</p>
                        <Badge variant="outline" className={getStatusBadgeVariant(student.status)}>
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{getStudentClass(student)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{getStudentEmail(student)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{getStudentPhone(student)}</TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewStudent(student._id || student.id)} // Use onViewStudent prop
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditStudent(student._id || student.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
      </div>
    );
  };

  // Handler for filter form changes
  const handleFilterValueChange = (key: keyof StudentFilters, value: any) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  // Handler for applying filters when filter button is clicked
  const handleApplyFilters = () => {
    // Merge filterValues into filters, reset page to 1
    setFilters((prev) => ({ ...prev, ...filterValues, page: 1 }));
    setFilterMenuOpen(false);
  };

  // Show ViewStudent component when a student is selected
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage student information and academic records</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {pagination.total || 0} Total Students
              </span>
              {activeFilters.length > 0 && (
                <span className="flex items-center gap-1">
                  <Filter className="h-4 w-4" />
                  {activeFilters.length} Active Filters
                </span>
              )}
            </div>
          </div>
          <Button intent="primary" onClick={onAddStudent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            <Input
              placeholder="Search students by name, email, or admission number..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-12 h-12 text-base border-gray-300 dark:border-gray-600 focus:border-siohioma-primary focus:ring-2 focus:ring-siohioma-primary/20 dark:focus:ring-siohioma-primary/30"
            />
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Filters */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Select value={filters.status || 'all'} onValueChange={(value) => applyFilter('status', value === 'all' ? undefined : value)}>
                <SelectTrigger className="h-10 min-w-[140px] border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.class || 'all'} onValueChange={(value) => applyFilter('class', value === 'all' ? undefined : value)}>
                <SelectTrigger className="h-10 min-w-[140px] border-gray-300 dark:border-gray-600">
                  <SelectValue placeholder="Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center gap-3">
              {/* Advanced Filter Button */}
              <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
                <PopoverTrigger asChild>
                  {activeFilters.length > 0 ? (
                    <Button
                      intent="action"
                      className="h-10 gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Advanced</span>
                      <Badge className="ml-1 bg-white/20 text-white border-white/30">
                        {activeFilters.length}
                      </Badge>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="h-10 gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline">Advanced</span>
                    </Button>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-96 max-h-[80vh] overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Filters</h4>
                      {activeFilters.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearAllFilters}
                          className="h-8 text-xs"
                        >
                          Clear all
                        </Button>
                      )}
                    </div>

                    {/* Filter Categories */}
                    <div className="flex space-x-1 border-b pb-2">
                      <Button
                        variant={activeFilterCategory === 'basic' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterCategory('basic')}
                        className="flex items-center gap-1"
                      >
                        <User className="h-3 w-3" />
                        <span>Basic</span>
                      </Button>
                      <Button
                        variant={activeFilterCategory === 'academic' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterCategory('academic')}
                        className="flex items-center gap-1"
                      >
                        <BookOpen className="h-3 w-3" />
                        <span>Academic</span>
                      </Button>
                      <Button
                        variant={activeFilterCategory === 'personal' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterCategory('personal')}
                        className="flex items-center gap-1"
                      >
                        <Home className="h-3 w-3" />
                        <span>Personal</span>
                      </Button>
                      <Button
                        variant={activeFilterCategory === 'saved' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setFilterCategory('saved')}
                        className="flex items-center gap-1"
                      >
                        <Save className="h-3 w-3" />
                        <span>Saved</span>
                      </Button>
                    </div>

                    {/* Basic Filters */}
                    {activeFilterCategory === 'basic' && (
                      <div className="space-y-4">
                        {/* Status Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="status-filter" className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span>Status</span>
                          </Label>
                          <Select
                            value={filters.status || 'all'}
                            onValueChange={(value) => applyFilter('status', value === 'all' ? undefined : value)}
                          >
                            <SelectTrigger id="status-filter">
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Statuses</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="graduated">Graduated</SelectItem>
                              <SelectItem value="transferred">Transferred</SelectItem>
                              <SelectItem value="suspended">Suspended</SelectItem>
                              <SelectItem value="expelled">Expelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Gender Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="gender-filter" className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>Gender</span>
                          </Label>
                          <Select
                            value={filters.gender || 'all'}
                            onValueChange={(value) => applyFilter('gender', value === 'all' ? undefined : value)}
                          >
                            <SelectTrigger id="gender-filter">
                              <SelectValue placeholder="All Genders" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Genders</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Class Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="class-filter" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span>Class</span>
                          </Label>
                          <Select
                            value={filters.class || 'all'}
                            onValueChange={(value) => applyFilter('class', value === 'all' ? undefined : value)}
                          >
                            <SelectTrigger id="class-filter">
                              <SelectValue placeholder="All Classes" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Classes</SelectItem>
                              {classes.map((classItem) => (
                                <SelectItem key={classItem.id} value={classItem.id}>
                                  {classItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Section Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="section-filter" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span>Section</span>
                          </Label>
                          <Select
                            value={filters.section || 'all'}
                            onValueChange={(value) => applyFilter('section', value === 'all' ? undefined : value)}
                          >
                            <SelectTrigger id="section-filter">
                              <SelectValue placeholder="All Sections" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Sections</SelectItem>
                              {sections.map((sectionItem) => (
                                <SelectItem key={sectionItem.id} value={sectionItem.id}>
                                  {sectionItem.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* House Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="house-filter" className="flex items-center gap-2">
                            <Home className="h-4 w-4 text-gray-500" />
                            <span>House</span>
                          </Label>
                          <Select
                            value={filters.house || 'all'}
                            onValueChange={(value) => applyFilter('house', value === 'all' ? undefined : value)}
                          >
                            <SelectTrigger id="house-filter">
                              <SelectValue placeholder="All Houses" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Houses</SelectItem>
                              {houses && houses.length > 0 ? (
                                houses.map((houseItem) => (
                                  <SelectItem
                                    key={houseItem.id}
                                    value={houseItem.id}
                                  >
                                    {houseItem.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="no-houses" disabled>
                                  No houses available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                      </div>
                    )}

                    {/* Academic Filters */}
                    {activeFilterCategory === 'academic' && (
                      <div className="space-y-4">
                        {/* Academic Year Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="academic-year-filter" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Academic Year</span>
                          </Label>
                          <Select
                            value={filters.academicYear || 'all'}
                            onValueChange={(value) => applyFilter('academicYear', value === 'all' ? undefined : value)}
                          >
                            <SelectTrigger id="academic-year-filter">
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
                        {/* GPA Range Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-gray-500" />
                            <span>GPA Range</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="gpa-min" className="text-xs">Min</Label>
                              <Input
                                id="gpa-min"
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="0.0"
                                value={filters.minGPA || ''}
                                onChange={(e) => applyRangeFilter('minGPA', 'maxGPA', e.target.value, filters.maxGPA)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="gpa-max" className="text-xs">Max</Label>
                              <Input
                                id="gpa-max"
                                type="number"
                                min="0"
                                max="5"
                                step="0.1"
                                placeholder="5.0"
                                value={filters.maxGPA || ''}
                                onChange={(e) => applyRangeFilter('minGPA', 'maxGPA', filters.minGPA, e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Attendance Range Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-gray-500" />
                            <span>Attendance Range (%)</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="attendance-min" className="text-xs">Min</Label>
                              <Input
                                id="attendance-min"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="0"
                                value={filters.minAttendance || ''}
                                onChange={(e) => applyRangeFilter('minAttendance', 'maxAttendance', e.target.value, filters.maxAttendance)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="attendance-max" className="text-xs">Max</Label>
                              <Input
                                id="attendance-max"
                                type="number"
                                min="0"
                                max="100"
                                placeholder="100"
                                value={filters.maxAttendance || ''}
                                onChange={(e) => applyRangeFilter('minAttendance', 'maxAttendance', filters.minAttendance, e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Admission Date Range Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span>Admission Date Range</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="admission-date-from" className="text-xs">From</Label>
                              <DatePicker
                                value={filters.admissionDateFrom ? new Date(filters.admissionDateFrom) : undefined}
                                onChange={(date) => applyFilter('admissionDateFrom', date ? date.toISOString().split('T')[0] : undefined)}
                                placeholder="From date"
                                className="mt-1 w-full"
                              />
                            </div>
                            <div>
                              <Label htmlFor="admission-date-to" className="text-xs">To</Label>
                              <DatePicker
                                value={filters.admissionDateTo ? new Date(filters.admissionDateTo) : undefined}
                                onChange={(date) => applyFilter('admissionDateTo', date ? date.toISOString().split('T')[0] : undefined)}
                                placeholder="To date"
                                className="mt-1 w-full"
                                disabled={(date) => filters.admissionDateFrom ? date < new Date(filters.admissionDateFrom) : false}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Personal Filters */}
                    {activeFilterCategory === 'personal' && (
                      <div className="space-y-4">
                        {/* Age Range Filter */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>Age Range</span>
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="age-min" className="text-xs">Min</Label>
                              <Input
                                id="age-min"
                                type="number"
                                min="0"
                                placeholder="0"
                                value={filters.minAge || ''}
                                onChange={(e) => applyRangeFilter('minAge', 'maxAge', e.target.value, filters.maxAge)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label htmlFor="age-max" className="text-xs">Max</Label>
                              <Input
                                id="age-max"
                                type="number"
                                min="0"
                                placeholder="25"
                                value={filters.maxAge || ''}
                                onChange={(e) => applyRangeFilter('minAge', 'maxAge', filters.minAge, e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Nationality Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="nationality-filter" className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span>Nationality</span>
                          </Label>
                          <Input
                            id="nationality-filter"
                            placeholder="Enter nationality"
                            value={filters.nationality || ''}
                            onChange={(e) => applyFilter('nationality', e.target.value || undefined)}
                          />
                        </div>

                        {/* Religion Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="religion-filter" className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <span>Religion</span>
                          </Label>
                          <Input
                            id="religion-filter"
                            placeholder="Enter religion"
                            value={filters.religion || ''}
                            onChange={(e) => applyFilter('religion', e.target.value || undefined)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Saved Filters */}
                    {activeFilterCategory === 'saved' && (
                      <div className="space-y-4">
                        {/* Save Current Filter */}
                        <div className="space-y-2">
                          <Label htmlFor="save-filter-name" className="flex items-center gap-2">
                            <Save className="h-4 w-4 text-gray-500" />
                            <span>Save Current Filter</span>
                          </Label>
                          <div className="flex space-x-2">
                            <Input
                              id="save-filter-name"
                              placeholder="Filter name"
                              value={newFilterName}
                              onChange={(e) => setNewFilterName(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={saveCurrentFilters}
                              disabled={!newFilterName.trim()}
                            >
                              Save
                            </Button>
                          </div>
                        </div>

                        {/* Saved Filters List */}
                        {savedFilters.length > 0 ? (
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-gray-500" />
                              <span>Saved Filters</span>
                            </Label>
                            <div className="space-y-2">
                              {savedFilters.map((savedFilter, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                  <span className="font-medium">{savedFilter.name}</span>
                                  <div className="flex space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => loadSavedFilter(savedFilter)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => deleteSavedFilter(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500">
                            <p>No saved filters yet</p>
                            <p className="text-sm">Save your current filters to quickly access them later</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Add Apply Filters button at the bottom of the PopoverContent */}
                  <div className="flex justify-end pt-4">
                    <Button size="sm" className="w-full" onClick={handleApplyFilters}>
                      Apply Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* View Toggle */}
              <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg overflow-hidden h-10">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'cards'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title="Card View"
                >
                  <Grid className="h-4 w-4" />
                  <span className="hidden md:inline">Cards</span>
                </button>
                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600"></div>
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title="Table View"
                >
                  <List className="h-4 w-4" />
                  <span className="hidden md:inline">Table</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {activeFilters.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Active Filters:</span>
            </div>
            <div className="flex flex-wrap gap-2 flex-1">
              {activeFilters.map(filter => {
                // Format the filter name for display
                let displayName = filter;
                let displayValue = '';

                // Get the value for display
                if (filter === 'academicYear' && filters.academicYear) {
                  displayName = 'Academic Year';
                  const year = academicYears.find(y => y.id === filters.academicYear);
                  displayValue = year ? year.name : filters.academicYear;
                } else if (filter === 'status' && filters.status) {
                  displayValue = filters.status.charAt(0).toUpperCase() + filters.status.slice(1);
                } else if (filter === 'gender' && filters.gender) {
                  displayValue = filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1);
                } else if (filter === 'class' && filters.class) {
                  const classItem = classes.find(c => c.id === filters.class);
                  displayValue = classItem ? classItem.name : filters.class;
                } else if (filter === 'section' && filters.section) {
                  displayName = 'Section';
                  const sectionItem = sections.find(s => s.id === filters.section);
                  displayValue = sectionItem ? sectionItem.name : filters.section;
                } else if (filter === 'house' && filters.house) {
                  const houseItem = houses.find(h =>
                    (h.id && h.id === filters.house) ||
                    ((h as any)._id && (h as any)._id === filters.house) ||
                    `house-${h.name}` === filters.house
                  );
                  displayValue = houseItem ? houseItem.name : filters.house;
                } else if (filter === 'admissionDateFrom' && filters.admissionDateFrom) {
                  displayName = 'Admission From';
                  displayValue = new Date(filters.admissionDateFrom).toLocaleDateString();
                } else if (filter === 'admissionDateTo' && filters.admissionDateTo) {
                  displayName = 'Admission To';
                  displayValue = new Date(filters.admissionDateTo).toLocaleDateString();
                } else if (filter === 'minGPA' && filters.minGPA) {
                  displayName = 'Min GPA';
                  displayValue = filters.minGPA.toString();
                } else if (filter === 'maxGPA' && filters.maxGPA) {
                  displayName = 'Max GPA';
                  displayValue = filters.maxGPA.toString();
                } else if (filter === 'minAttendance' && filters.minAttendance) {
                  displayName = 'Min Attendance';
                  displayValue = `${filters.minAttendance}%`;
                } else if (filter === 'maxAttendance' && filters.maxAttendance) {
                  displayName = 'Max Attendance';
                  displayValue = `${filters.maxAttendance}%`;
                } else if (filter === 'minAge' && filters.minAge) {
                  displayName = 'Min Age';
                  displayValue = filters.minAge.toString();
                } else if (filter === 'maxAge' && filters.maxAge) {
                  displayName = 'Max Age';
                  displayValue = filters.maxAge.toString();
                } else if (filter === 'nationality' && filters.nationality) {
                  displayName = 'Nationality';
                  displayValue = filters.nationality;
                } else if (filter === 'religion' && filters.religion) {
                  displayName = 'Religion';
                  displayValue = filters.religion;
                } else if (filter === 'sort' && filters.sort) {
                  // Don't show sort in the summary
                  return null;
                }

                return (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="flex items-center gap-1 px-3 py-1 bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                  >
                    <span className="font-medium">{displayName}:</span> {displayValue}
                    <X
                      className="h-3 w-3 ml-1 hover:text-red-500"
                      onClick={() => clearFilter(filter)}
                    />
                  </Badge>
                );
              })}
            </div>
            <Button
              intent="cancel"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}

      {/* Students List */}
      {viewMode === 'cards' ? renderCardView() : renderTableView()}

      {/* Quick Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Statistics</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-3">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pagination.total || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-3">
              <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {students.length > 0
                ? (students.reduce((sum, student) => sum + (student.attendancePercentage || 0), 0) / students.length).toFixed(1)
                : 'N/A'}%
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Attendance</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-3">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {students.length > 0
                ? (students.reduce((sum, student) => sum + (student.averageGrade || 0), 0) / students.length).toFixed(1)
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg. GPA</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-3">
              <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {students.filter(s => {
                const admissionDate = new Date(s.admissionDate);
                const now = new Date();
                return admissionDate.getMonth() === now.getMonth() &&
                  admissionDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">New This Month</p>
          </div>
        </div>
      </div>

      {/* Page Size Selector */}
      {!loading && students.length > 0 && (
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Items per page:</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => {
                applyFilter('limit', parseInt(value));
                applyFilter('page', 1); // Reset to first page when changing page size
              }}
            >
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && students.length > 0 && pagination.pages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} students
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilter('page', pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {/* Show first page */}
              {pagination.page > 3 && (
                <>
                  <Button
                    variant={pagination.page === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyFilter('page', 1)}
                  >
                    1
                  </Button>
                  {pagination.page > 4 && <span className="px-2 text-gray-400">...</span>}
                </>
              )}

              {/* Show pages around current page */}
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                let pageNum;
                if (pagination.pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.pages - 2) {
                  pageNum = pagination.pages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }

                if (pageNum < 1 || pageNum > pagination.pages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyFilter('page', pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              {/* Show last page */}
              {pagination.page < pagination.pages - 2 && (
                <>
                  {pagination.page < pagination.pages - 3 && <span className="px-2 text-gray-400">...</span>}
                  <Button
                    variant={pagination.page === pagination.pages ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyFilter('page', pagination.pages)}
                  >
                    {pagination.pages}
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => applyFilter('page', pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsManager;
