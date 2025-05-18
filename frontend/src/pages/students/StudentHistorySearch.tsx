import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Pagination,
  SelectChangeEvent,
  Chip
} from '@mui/material';
import { Link } from 'react-router-dom';
import { searchStudentsByAcademicYearAndClass } from '../../services/studentService';
import { getAllAcademicYears } from '../../services/academicYearService';
import classService from '../../services/classService';
import { AcademicYear, Class, Student } from '../../types';

interface SearchResult {
  student: Student;
  class: {
    id: string;
    name: string;
    level: number;
  };
  classArm?: {
    id: string;
    name: string;
  };
  academicYear: {
    id: string;
    name: string;
  };
  status: string;
}

interface PaginatedResults {
  results: SearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const StudentHistorySearch: React.FC = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<{
    total: number;
    pages: number;
    limit: number;
  }>({
    total: 0,
    pages: 0,
    limit: 10
  });

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        const data = await getAllAcademicYears();
        setAcademicYears(data.data || []);
      } catch (err) {
        console.error('Error fetching academic years:', err);
        setError('Failed to load academic years. Please try again later.');
      }
    };

    const fetchClasses = async () => {
      try {
        const data = await classService.getClasses();
        setClasses(data.classes || []);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to load classes. Please try again later.');
      }
    };

    fetchAcademicYears();
    fetchClasses();
  }, []);

  const handleAcademicYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedAcademicYear(event.target.value);
  };

  const handleClassChange = (event: SelectChangeEvent<string>) => {
    setSelectedClass(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    handleSearch(value);
  };

  const handleSearch = async (currentPage = page) => {
    if (!selectedAcademicYear) {
      setError('Please select an academic year');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        academicYear: selectedAcademicYear,
        page: currentPage,
        limit: 10
      };

      if (selectedClass) {
        params.class = selectedClass;
      }

      const data = await searchStudentsByAcademicYearAndClass(params) as PaginatedResults;
      
      setSearchResults(data.results || []);
      setPagination({
        total: data.pagination.total,
        pages: data.pagination.pages,
        limit: data.pagination.limit
      });
    } catch (err) {
      console.error('Error searching students:', err);
      setError('Failed to search students. Please try again later.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'transferred':
        return 'warning';
      case 'withdrawn':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student History Search
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Search for students by academic year and class to see who was in a particular class during a specific academic year.
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel id="academic-year-label">Academic Year *</InputLabel>
                  <Select
                    labelId="academic-year-label"
                    id="academic-year"
                    value={selectedAcademicYear}
                    label="Academic Year *"
                    onChange={handleAcademicYearChange}
                  >
                    {academicYears.map((year) => (
                      <MenuItem key={year.id} value={year.id}>
                        {year.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <FormControl fullWidth>
                  <InputLabel id="class-label">Class (Optional)</InputLabel>
                  <Select
                    labelId="class-label"
                    id="class"
                    value={selectedClass}
                    label="Class (Optional)"
                    onChange={handleClassChange}
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleSearch(1)}
                  disabled={loading || !selectedAcademicYear}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {searchResults.length > 0 ? (
          <>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Admission Number</TableCell>
                    <TableCell>Class</TableCell>
                    <TableCell>Class Arm</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((result) => (
                    <TableRow key={result.student.id}>
                      <TableCell>
                        {result.student.firstName} {result.student.lastName}
                      </TableCell>
                      <TableCell>{result.student.admissionNumber}</TableCell>
                      <TableCell>{result.class.name}</TableCell>
                      <TableCell>{result.classArm?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={result.status}
                          size="small"
                          color={getStatusColor(result.status) as any}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          component={Link}
                          to={`/students/${result.student.id}`}
                          size="small"
                          variant="outlined"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.pages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
              Showing {searchResults.length} of {pagination.total} results
            </Typography>
          </>
        ) : (
          !loading && !error && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="textSecondary">
                {selectedAcademicYear
                  ? 'No students found. Try different search criteria.'
                  : 'Select an academic year to search for students.'}
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Container>
  );
};

export default StudentHistorySearch;
