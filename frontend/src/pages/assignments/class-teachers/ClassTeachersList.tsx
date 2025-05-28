import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import Layout from '../../../components/layout/Layout';
import classTeacherService, { ClassTeacherResponse } from '../../../services/classTeacherService';
import * as academicYearService from '../../../services/academicYearService';
import { useAuth } from '../../../contexts/AuthContext';

// Define the shape of the API response
interface AcademicYear {
  _id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isCurrent?: boolean;
  description?: string;
  school: string;
}

const ClassTeachersList: React.FC = () => {
  const [classTeachers, setClassTeachers] = useState<ClassTeacherResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const navigate = useNavigate();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === 'admin' || authState.user?.role === 'superadmin';

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const response = await academicYearService.getAllAcademicYears();
        const years = response.data || [];
        setAcademicYears(years as unknown as AcademicYear[]);
        
        // Find current academic year
        const currentYear = years.find((year) => year.isCurrent) as unknown as AcademicYear;
        if (currentYear) {
          setSelectedAcademicYear(currentYear._id);
          fetchClassTeachers(currentYear._id);
        } else if (years.length > 0) {
          const firstYear = years[0] as unknown as AcademicYear;
          setSelectedAcademicYear(firstYear._id);
          fetchClassTeachers(firstYear._id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Failed to fetch academic years');
        setLoading(false);
      }
    };

    fetchAcademicYears();
  }, []);

  const fetchClassTeachers = async (academicYearId: string) => {
    try {
      setLoading(true);
      const data = await classTeacherService.getClassTeachersByAcademicYear(academicYearId);
      setClassTeachers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch class teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleAcademicYearChange = (event: SelectChangeEvent) => {
    const yearId = event.target.value;
    setSelectedAcademicYear(yearId);
    fetchClassTeachers(yearId);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this class teacher assignment?')) {
      try {
        await classTeacherService.deleteClassTeacher(id);
        setClassTeachers(classTeachers.filter(ct => ct._id !== id));
      } catch (err) {
        setError('Failed to delete class teacher assignment');
      }
    }
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Class Teachers
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/assignments/class-teachers/create')}
            >
              Assign Class Teacher
            </Button>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="academic-year-label">Academic Year</InputLabel>
            <Select
              labelId="academic-year-label"
              value={selectedAcademicYear}
              label="Academic Year"
              onChange={handleAcademicYearChange}
            >
              {academicYears.map((year) => (
                <MenuItem key={year._id} value={year._id}>
                  {year.name} {year.isCurrent ? '(Current)' : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : classTeachers.length === 0 ? (
          <Alert severity="info">No class teacher assignments found for the selected academic year.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Section/Arm</TableCell>
                  <TableCell>Assigned Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                  {isAdmin && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {classTeachers.map((classTeacher) => (
                  <TableRow key={classTeacher._id}>
                    <TableCell>
                      {classTeacher.teacher.user.name}
                    </TableCell>
                    <TableCell>{classTeacher.class.name}</TableCell>
                    <TableCell>{classTeacher.classArm.name}</TableCell>
                    <TableCell>
                      {new Date(classTeacher.assignedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {classTeacher.isActive ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell>{classTeacher.remarks || '-'}</TableCell>
                    {isAdmin && (
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => navigate(`/assignments/class-teachers/edit/${classTeacher._id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(classTeacher._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Layout>
  );
};

export default ClassTeachersList;
