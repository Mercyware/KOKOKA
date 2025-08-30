import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Edit, Trash2, User, Mail, Phone, Grid, List, Eye, Loader2, X, Building, Users, UserCheck, Award, Calendar, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import Layout from '../../components/layout/Layout';
import { getStaffMembers, deleteStaffMember, StaffMember, StaffFilterOptions } from '../../services/staffService';
import { getDepartments, Department } from '../../services/departmentService';

const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [filters, setFilters] = useState<StaffFilterOptions>({});
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Fetch staff members and departments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch staff members
        const staffResponse = await getStaffMembers(filters);
        setStaffMembers(staffResponse.data || []);

        // Fetch departments
        const departmentsResponse = await getDepartments();
        setDepartments(departmentsResponse.departments || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch staff data. Please try again later.');
        setStaffMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Apply filter
  const applyFilter = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (value === undefined || value === '') {
      delete newFilters[key as keyof StaffFilterOptions];
    }
    setFilters(newFilters);

    // Update active filters
    if (value !== undefined && value !== '') {
      if (!activeFilters.includes(key)) {
        setActiveFilters([...activeFilters, key]);
      }
    } else {
      setActiveFilters(activeFilters.filter(filter => filter !== key));
    }
  };

  // Clear filter
  const clearFilter = (key: string) => {
    const newFilters = { ...filters };
    delete newFilters[key as keyof StaffFilterOptions];
    setFilters(newFilters);
    setActiveFilters(activeFilters.filter(filter => filter !== key));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
    setActiveFilters([]);
    setSearchTerm('');
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilter('search', value || undefined);
  };

  // Navigation handlers
  const handleCreateStaff = () => {
    navigate('/staff/create');
  };

  const handleViewStaff = (id: string) => {
    navigate(`/staff/${id}`);
  };

  const handleEditStaff = (id: string) => {
    navigate(`/staff/edit/${id}`);
  };

  const handleDeleteStaff = async (staff: StaffMember) => {
    if (window.confirm(`Are you sure you want to delete ${staff.firstName} ${staff.lastName}?`)) {
      try {
        await deleteStaffMember(staff.id);
        setStaffMembers(prev => prev.filter(s => s.id !== staff.id));
      } catch (err) {
        console.error('Error deleting staff member:', err);
        alert('Failed to delete staff member. Please try again.');
      }
    }
  };

  // Format staff name
  const formatStaffName = (staff: StaffMember) => {
    const parts = [staff.firstName, staff.middleName, staff.lastName].filter(Boolean);
    return parts.map(part => part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : '').join(' ');
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'retired':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Get staff type badge variant
  const getStaffTypeBadgeVariant = (staffType: string) => {
    switch (staffType.toLowerCase()) {
      case 'teacher':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'administrator':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const renderCardView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading staff members...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <span className="font-semibold">Error:</span> {error}
          </div>
          <Button onClick={() => setFilters({ ...filters })}>
            Retry
          </Button>
        </Card>
      );
    }

    if (staffMembers.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-4">No staff members found matching your criteria.</p>
          {activeFilters.length > 0 && (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          )}
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {staffMembers.map((staff) => (
          <Card key={staff.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{formatStaffName(staff)}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {staff.position}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className={getStatusBadgeVariant(staff.status)}>
                  {staff.status.replace('_', ' ').charAt(0).toUpperCase() + staff.status.replace('_', ' ').slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{staff.user.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{staff.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{staff.department?.name || 'N/A'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
                <Badge variant="outline" className={getStaffTypeBadgeVariant(staff.staffType)}>
                  {staff.staffType.charAt(0).toUpperCase() + staff.staffType.slice(1)}
                </Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ID: {staff.employeeId}
                </span>
              </div>

              <div className="flex space-x-2 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleViewStaff(staff.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleEditStaff(staff.id)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteStaff(staff)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderTableView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading staff members...</span>
        </div>
      );
    }

    if (error) {
      return (
        <Card className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <span className="font-semibold">Error:</span> {error}
          </div>
          <Button onClick={() => setFilters({ ...filters })}>
            Retry
          </Button>
        </Card>
      );
    }

    if (staffMembers.length === 0) {
      return (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-4">No staff members found matching your criteria.</p>
          {activeFilters.length > 0 && (
            <Button variant="outline" onClick={clearAllFilters}>
              Clear all filters
            </Button>
          )}
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead className="hidden md:table-cell">Employee ID</TableHead>
                <TableHead className="hidden lg:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Department</TableHead>
                <TableHead className="text-center">Staff Type</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">{formatStaffName(staff)}</p>
                        <p className="text-sm text-gray-500">{staff.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{staff.employeeId}</TableCell>
                  <TableCell className="hidden lg:table-cell">{staff.user.email}</TableCell>
                  <TableCell className="hidden lg:table-cell">{staff.department?.name || 'N/A'}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={getStaffTypeBadgeVariant(staff.staffType)}>
                      {staff.staffType.charAt(0).toUpperCase() + staff.staffType.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <Badge variant="secondary" className={getStatusBadgeVariant(staff.status)}>
                      {staff.status.replace('_', ' ').charAt(0).toUpperCase() + staff.status.replace('_', ' ').slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewStaff(staff.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEditStaff(staff.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteStaff(staff)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Staff Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage staff members and their information</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateStaff}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search staff by name, email, or employee ID..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
              <div className="flex space-x-2">
                <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={activeFilters.length > 0 ? "default" : "outline"}
                      className={`flex items-center space-x-2 ${activeFilters.length > 0
                        ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                      } transition-colors duration-200`}
                    >
                      <Filter className={`h-4 w-4 ${activeFilters.length > 0 ? "animate-pulse" : ""}`} />
                      <span>Filter</span>
                      {activeFilters.length > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-1 bg-white text-blue-800 dark:bg-blue-200 dark:text-blue-900 font-bold"
                        >
                          {activeFilters.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 max-h-[80vh] overflow-y-auto">
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

                      {/* Status Filter */}
                      <div className="space-y-2">
                        <Label htmlFor="status-filter" className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-gray-500" />
                          <span>Status</span>
                        </Label>
                        <Select
                          value={filters.status || ''}
                          onValueChange={(value) => applyFilter('status', value || undefined)}
                        >
                          <SelectTrigger id="status-filter">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="ON_LEAVE">On Leave</SelectItem>
                            <SelectItem value="TERMINATED">Terminated</SelectItem>
                            <SelectItem value="RETIRED">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Department Filter */}
                      <div className="space-y-2">
                        <Label htmlFor="department-filter" className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span>Department</span>
                        </Label>
                        <Select
                          value={filters.department || ''}
                          onValueChange={(value) => applyFilter('department', value || undefined)}
                        >
                          <SelectTrigger id="department-filter">
                            <SelectValue placeholder="All Departments" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Staff Type Filter */}
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span>Staff Type</span>
                        </Label>
                        <Select
                          value={filters.staffType || ''}
                          onValueChange={(value) => applyFilter('staffType', value || undefined)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TEACHER">Teacher</SelectItem>
                            <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                            <SelectItem value="LIBRARIAN">Librarian</SelectItem>
                            <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                            <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                            <SelectItem value="SECURITY">Security</SelectItem>
                            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                            <SelectItem value="COUNSELOR">Counselor</SelectItem>
                            <SelectItem value="NURSE">Nurse</SelectItem>
                            <SelectItem value="GENERAL">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters Summary */}
        {activeFilters.length > 0 && (
          <Card className="mb-4 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 mr-2">
                  <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-blue-700 dark:text-blue-300">Active Filters:</span>
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {activeFilters.map(filter => {
                    let displayName = filter;
                    let displayValue = '';

                    if (filter === 'status' && filters.status) {
                      displayValue = filters.status.replace('_', ' ').charAt(0).toUpperCase() + filters.status.replace('_', ' ').slice(1);
                    } else if (filter === 'department' && filters.department) {
                      const dept = departments.find(d => d.id === filters.department);
                      displayValue = dept ? dept.name : filters.department;
                    } else if (filter === 'staffType' && filters.staffType) {
                      displayName = 'Staff Type';
                      displayValue = filters.staffType.charAt(0).toUpperCase() + filters.staffType.slice(1);
                    }

                    return (
                      <Badge
                        key={filter}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      >
                        <span className="font-medium">{displayName}:</span> {displayValue}
                        <X
                          className="h-3 w-3 cursor-pointer ml-1"
                          onClick={() => clearFilter(filter)}
                        />
                      </Badge>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs h-7 border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  Clear all filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Staff List */}
        {viewMode === 'cards' ? renderCardView() : renderTableView()}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{staffMembers.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {staffMembers.filter(s => s.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Staff</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {staffMembers.filter(s => s.staffType === 'TEACHER').length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Teachers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {departments.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default StaffList;
