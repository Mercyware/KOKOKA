import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import Layout from '../../components/layout/Layout';
import { getStaffMembers, deleteStaffMember, StaffMember, StaffFilterOptions } from '../../services/staffService';
import { getDepartments, Department } from '../../services/departmentService';


const StaffList: React.FC = () => {
  const navigate = useNavigate();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch staff members
        const staffResponse = await getStaffMembers({});
        setStaffMembers(staffResponse.data || []);
        
        // Fetch departments
        const departmentsResponse = await getDepartments();
        setDepartments(departmentsResponse.departments || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterTypeChange = (event: SelectChangeEvent) => {
    setFilterType(event.target.value);
    setPage(0);
  };

  const handleFilterDepartmentChange = (event: SelectChangeEvent) => {
    setFilterDepartment(event.target.value);
    setPage(0);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const filterOptions: StaffFilterOptions = {
        staffType: filterType !== 'all' ? filterType : undefined,
        department: filterDepartment !== 'all' ? filterDepartment : undefined,
        search: searchTerm || undefined,
      };
      const response = await getStaffMembers(filterOptions);
      setStaffMembers(response.data || []);
    } catch (error) {
      console.error('Error refreshing staff members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = () => {
    navigate('/staff/create');
  };

  const handleViewStaff = (id: string) => {
    navigate(`/staff/${id}`);
  };

  const handleEditStaff = (id: string) => {
    navigate(`/staff/edit/${id}`);
  };

  const handleDeleteClick = (staff: StaffMember) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    try {
      setLoading(true);
      await deleteStaffMember(staffToDelete.id);

      // Remove the staff member from the list
      setStaffMembers((prev) => prev.filter((s) => s.id !== staffToDelete.id));
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    } catch (error) {
      console.error('Error deleting staff member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setStaffToDelete(null);
  };

  // Prepare departments for filter dropdown
  const departmentOptions = [
    { id: 'all', name: 'All Departments' },
    ...departments
  ];

  // Filter staff members based on search term and filters
  const filteredStaffMembers = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || staff.staffType === filterType;
    const matchesDepartment = filterDepartment === 'all' || staff.department.id === filterDepartment;

    return matchesSearch && matchesType && matchesDepartment;
  });

  // Paginate staff members
  const paginatedStaffMembers = filteredStaffMembers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              Staff Members
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateStaff}
            >
              Add Staff Member
            </Button>
          </Box>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: '100%', sm: '300px' } }}
              />
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Staff Type</InputLabel>
                <Select
                  value={filterType}
                  onChange={handleFilterTypeChange}
                  label="Staff Type"
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="teacher">Teacher</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="cashier">Cashier</MenuItem>
                  <MenuItem value="librarian">Librarian</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDepartment}
                  onChange={handleFilterDepartmentChange}
                  label="Department"
                >
                  {departmentOptions.map((department) => (
                    <MenuItem key={department.id} value={department.id === 'all' ? 'all' : department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Button
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Employee ID</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedStaffMembers.length > 0 ? (
                        paginatedStaffMembers.map((staff) => (
                          <TableRow key={staff.id}>
                            <TableCell>{staff.employeeId}</TableCell>
                            <TableCell>{staff.user.name}</TableCell>
                            <TableCell>{staff.user.email}</TableCell>
                            <TableCell>{staff.department.name}</TableCell>
                            <TableCell>{staff.position}</TableCell>
                            <TableCell>
                              <Chip
                                label={staff.staffType.charAt(0).toUpperCase() + staff.staffType.slice(1)}
                                color={
                                  staff.staffType === 'teacher' ? 'primary' :
                                  staff.staffType === 'admin' ? 'secondary' :
                                  'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={staff.status === 'active' ? 'Active' : 'Inactive'}
                                color={staff.status === 'active' ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                color="info"
                                onClick={() => handleViewStaff(staff.id)}
                                title="View Details"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditStaff(staff.id)}
                                title="Edit"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteClick(staff)}
                                title="Delete"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} align="center">
                            {searchTerm || filterType !== 'all' || filterDepartment !== 'all'
                              ? 'No staff members found matching your search criteria'
                              : 'No staff members available'}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredStaffMembers.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </Paper>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the staff member "{staffToDelete?.user.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default StaffList;
