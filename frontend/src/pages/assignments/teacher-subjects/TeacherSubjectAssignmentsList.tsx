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
  Grid,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import Layout from '../../../components/layout/Layout';
import * as teacherSubjectService from '../../../services/teacherSubjectService';
import { TeacherSubjectAssignmentResponse } from '../../../services/teacherSubjectService';
import * as academicYearService from '../../../services/academicYearService';
import * as classService from '../../../services/classService';
import * as subjectService from '../../../services/subjectService';
import { useAuth } from '../../../contexts/AuthContext';

// Define the shape of the API responses
interface AcademicYear {
  _id: string;
  name: string;
  isActive: boolean;
  isCurrent?: boolean;
}

interface Class {
  _id: string;
  name: string;
  level: number;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Teacher {
  _id: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  employeeId: string;
}

const TeacherSubjectAssignmentsList: React.FC = () => {
  const [assignments, setAssignments] = useState<TeacherSubjectAssignmentResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [filterByTeacher, setFilterByTeacher] = useState<boolean>(false);
  
  const navigate = useNavigate();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === 'admin' || authState.user?.role === 'superadmin';
  const isTeacher = authState.user?.role === 'teacher';
  // Handle the case where teacherId might not be directly on the user object
  const teacherId = isTeacher && authState.user ? (authState.user as any).teacherId || '' : '';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch academic years
        const academicYearsResponse = await academicYearService.getAllAcademicYears();
        const years = academicYearsResponse.data || [];
        setAcademicYears(years as unknown as AcademicYear[]);
        
        // Find current academic year
        const currentYear = years.find((year) => year.isCurrent) as unknown as AcademicYear;
        if (currentYear) {
          setSelectedAcademicYear(currentYear._id);
        } else if (years.length > 0) {
          const firstYear = years[0] as unknown as AcademicYear;
          setSelectedAcademicYear(firstYear._id);
        }

        // Fetch classes
        const classesResponse = await classService.getClasses();
        const classesData = classesResponse.data || [];
        setClasses(classesData as unknown as Class[]);

        // Fetch subjects
        const subjectsResponse = await subjectService.getAllSubjects();
        const subjectsData = subjectsResponse.data || [];
        setSubjects(subjectsData as unknown as Subject[]);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch initial data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchAssignments();
    }
  }, [selectedAcademicYear, selectedClass, selectedSubject, filterByTeacher, teacherId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      let response;
      if (isTeacher && filterByTeacher) {
        // If logged in as teacher and filter is on, show only their assignments
        response = await teacherSubjectService.getTeacherSubjectAssignmentsByTeacher(
          teacherId,
          selectedAcademicYear
        );
      } else {
        // Otherwise fetch based on filters
        response = await teacherSubjectService.getTeacherSubjectAssignments({
          academicYear: selectedAcademicYear,
          class: selectedClass || undefined,
          subject: selectedSubject || undefined,
          teacher: filterByTeacher && isTeacher ? teacherId : undefined
        });
      }
      
      // Check if response has data property (ApiResponse structure)
      if (response && response.data) {
        setAssignments(response.data);
      } else {
        // Fallback in case the response is directly the data array
        setAssignments(response);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch teacher subject assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAcademicYearChange = (event: SelectChangeEvent) => {
    setSelectedAcademicYear(event.target.value);
  };

  const handleClassChange = (event: SelectChangeEvent) => {
    setSelectedClass(event.target.value);
  };

  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSelectedSubject(event.target.value);
  };

  const toggleTeacherFilter = () => {
    setFilterByTeacher(!filterByTeacher);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this teacher subject assignment?')) {
      try {
        await teacherSubjectService.deleteTeacherSubjectAssignment(id);
        setAssignments(assignments.filter(assignment => assignment._id !== id));
      } catch (err) {
        setError('Failed to delete teacher subject assignment');
      }
    }
  };

  const clearFilters = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setFilterByTeacher(false);
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Teacher Subject Assignments
          </Typography>
          {isAdmin && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/assignments/teacher-subjects/create')}
            >
              Assign Subject to Teacher
            </Button>
          )}
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
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
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="class-label">Filter by Class</InputLabel>
              <Select
                labelId="class-label"
                value={selectedClass}
                label="Filter by Class"
                onChange={handleClassChange}
                displayEmpty
              >
                <MenuItem value="">All Classes</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls._id} value={cls._id}>
                    {cls.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="subject-label">Filter by Subject</InputLabel>
              <Select
                labelId="subject-label"
                value={selectedSubject}
                label="Filter by Subject"
                onChange={handleSubjectChange}
                displayEmpty
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject._id} value={subject._id}>
                    {subject.name} ({subject.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex', alignItems: 'center' }}>
            {isTeacher && (
              <Button
                variant={filterByTeacher ? "contained" : "outlined"}
                color="primary"
                startIcon={<FilterIcon />}
                onClick={toggleTeacherFilter}
                sx={{ mr: 1 }}
              >
                My Subjects
              </Button>
            )}
            {(selectedClass || selectedSubject || filterByTeacher) && (
              <Button
                variant="outlined"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : assignments.length === 0 ? (
          <Alert severity="info">No teacher subject assignments found with the selected filters.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Classes</TableCell>
                  <TableCell>Assigned Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Remarks</TableCell>
                  {isAdmin && <TableCell align="center">Actions</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment._id}>
                    <TableCell>
                      {assignment.teacher.user.name}
                    </TableCell>
                    <TableCell>
                      {assignment.subject.name} ({assignment.subject.code})
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {assignment.classes.map((classItem: any) => (
                          <Chip 
                            key={classItem.class._id} 
                            label={classItem.class.name} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.assignedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {assignment.isActive ? 'Active' : 'Inactive'}
                    </TableCell>
                    <TableCell>{assignment.remarks || '-'}</TableCell>
                    {isAdmin && (
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => navigate(`/assignments/teacher-subjects/edit/${assignment._id}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDelete(assignment._id)}
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

export default TeacherSubjectAssignmentsList;
