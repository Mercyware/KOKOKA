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
  Chip,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import { Link } from 'react-router-dom';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getStudents, searchStudentsByAcademicYearAndClass } from '../../services/studentService';
import { getAllAcademicYears } from '../../services/academicYearService';
import classService from '../../services/classService';
import classArmService from '../../services/classArmService';
import houseService from '../../services/houseService';
import { AcademicYear, Class, ClassArm, House, Student } from '../../types';

interface SearchResult {
  student: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    fullName?: string;
  };
  class?: {
    id: string;
    name: string;
  };
  classArm?: {
    id: string;
    name: string;
  };
  academicYear?: {
    id: string;
    name: string;
  };
  house?: {
    id: string;
    name: string;
  };
  status?: string;
}

interface PaginatedResults {
  students?: Student[];
  results?: SearchResult[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

const StudentFilterList: React.FC = () => {
  // State for filter options
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  
  // State for selected filters
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedClassArm, setSelectedClassArm] = useState<string>('');
  const [selectedHouse, setSelectedHouse] = useState<string>('');
  const [searchName, setSearchName] = useState<string>('');
  
  // State for results and UI
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

  // Fetch filter options on component mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        setLoading(true);
        
        // Fetch academic years
        const academicYearsData = await getAllAcademicYears();
        setAcademicYears(academicYearsData.data || []);
        
        // Fetch classes
        const classesData = await classService.getClasses();
        setClasses(classesData.data || []);
        
        // Fetch class arms
        const classArmsData = await classArmService.getClassArms();
        setClassArms(classArmsData);
        
        // Fetch houses
        const housesData = await houseService.getHouses();
        setHouses(housesData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching filter options:', err);
        setError('Failed to load filter options. Please try again later.');
        setLoading(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Handle filter changes
  const handleAcademicYearChange = (event: SelectChangeEvent<string>) => {
    setSelectedAcademicYear(event.target.value);
  };

  const handleClassChange = (event: SelectChangeEvent<string>) => {
    setSelectedClass(event.target.value);
    // Reset class arm when class changes
    setSelectedClassArm('');
  };

  const handleClassArmChange = (event: SelectChangeEvent<string>) => {
    setSelectedClassArm(event.target.value);
  };

  const handleHouseChange = (event: SelectChangeEvent<string>) => {
    setSelectedHouse(event.target.value);
  };

  const handleSearchNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchName(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    handleSearch(value);
  };

  const clearFilters = () => {
    setSelectedAcademicYear('');
    setSelectedClass('');
    setSelectedClassArm('');
    setSelectedHouse('');
    setSearchName('');
    setPage(1);
  };

  const handleSearch = async (currentPage = page) => {
    try {
      setLoading(true);
      setError(null);

      // If academic year is selected, use the student class history search
      if (selectedAcademicYear) {
        const params: any = {
          academicYear: selectedAcademicYear,
          page: currentPage,
          limit: 10
        };

        if (selectedClass) {
          params.class = selectedClass;
        }

        if (selectedClassArm) {
          params.classArm = selectedClassArm;
        }

        const data = await searchStudentsByAcademicYearAndClass(params) as PaginatedResults;
        
        // Filter by house and name if needed
        let filteredResults = data.results || [];
        
        if (selectedHouse || searchName) {
          // We need to fetch full student details for each result to filter by house
          const studentIds = filteredResults.map(result => result.student.id);
          
          if (studentIds.length > 0) {
            const studentsData = await getStudents({
              page: 1,
              limit: 1000, // Large limit to get all students
              search: searchName
            }) as PaginatedResults;
            
            const studentsMap = new Map();
            studentsData.students?.forEach(student => {
              studentsMap.set(student.id, student);
            });
            
            filteredResults = filteredResults.filter(result => {
              const student = studentsMap.get(result.student.id);
              
              // Filter by house if selected
              if (selectedHouse && student?.house !== selectedHouse) {
                return false;
              }
              
              // Filter by name if provided
              if (searchName && !student) {
                return false;
              }
              
              return true;
            });
          } else {
            filteredResults = [];
          }
        }
        
        setSearchResults(filteredResults);
        setPagination({
          total: filteredResults.length,
          pages: Math.ceil(filteredResults.length / 10),
          limit: 10
        });
      } else {
        // Use regular student search if no academic year is selected
        const params: any = {
          page: currentPage,
          limit: 10
        };

        if (selectedClass) {
          params.class = selectedClass;
        }

        if (selectedHouse) {
          params.house = selectedHouse;
        }

        if (searchName) {
          params.search = searchName;
        }

        const data = await getStudents(params) as PaginatedResults;
        
        // Convert to SearchResult format
        const formattedResults: SearchResult[] = data.students?.map(student => ({
          student: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            admissionNumber: student.admissionNumber,
            fullName: student.fullName
          },
          class: typeof student.class === 'string' 
            ? undefined 
            : { id: (student.class as any).id, name: (student.class as any).name },
          classArm: typeof student.classArm === 'string'
            ? undefined
            : student.classArm as any,
          house: typeof student.house === 'string'
            ? undefined
            : student.house as any,
          status: student.status
        })) || [];
        
        setSearchResults(formattedResults);
        setPagination({
          total: data.pagination.total,
          pages: data.pagination.pages,
          limit: data.pagination.limit
        });
      }
    } catch (err) {
      console.error('Error searching students:', err);
      setError('Failed to search students. Please try again later.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string = 'active') => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'transferred':
        return 'warning';
      case 'expelled':
        return 'error';
      case 'graduated':
        return 'info';
      case 'suspended':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Student Filter
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          Search and filter students by name, session, class, class arm, and house.
        </Typography>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Search by Name or Admission Number"
                  variant="outlined"
                  value={searchName}
                  onChange={handleSearchNameChange}
                  placeholder="Enter student name or admission number"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="academic-year-label">Academic Year/Session</InputLabel>
                  <Select
                    labelId="academic-year-label"
                    id="academic-year"
                    value={selectedAcademicYear}
                    label="Academic Year/Session"
                    onChange={handleAcademicYearChange}
                  >
                    <MenuItem value="">All Academic Years</MenuItem>
                    {academicYears.map((year) => (
                      <MenuItem key={year.id} value={year.id}>
                        {year.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="class-label">Class</InputLabel>
                  <Select
                    labelId="class-label"
                    id="class"
                    value={selectedClass}
                    label="Class"
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
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="class-arm-label">Class Arm</InputLabel>
                  <Select
                    labelId="class-arm-label"
                    id="class-arm"
                    value={selectedClassArm}
                    label="Class Arm"
                    onChange={handleClassArmChange}
                    disabled={!selectedClass}
                  >
                    <MenuItem value="">All Class Arms</MenuItem>
                    {classArms
                      .filter(arm => !selectedClass || (arm as any).class === selectedClass)
                      .map((arm) => (
                        <MenuItem key={arm.id} value={arm.id}>
                          {arm.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="house-label">House</InputLabel>
                  <Select
                    labelId="house-label"
                    id="house"
                    value={selectedHouse}
                    label="House"
                    onChange={handleHouseChange}
                  >
                    <MenuItem value="">All Houses</MenuItem>
                    {houses.map((house) => (
                      <MenuItem key={house.id} value={house.id}>
                        {house.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                >
                  Clear Filters
                </Button>
                
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleSearch(1)}
                  disabled={loading}
                  startIcon={<FilterListIcon />}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Apply Filters'}
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
                    <TableCell>House</TableCell>
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
                      <TableCell>{result.class?.name || 'N/A'}</TableCell>
                      <TableCell>{result.classArm?.name || 'N/A'}</TableCell>
                      <TableCell>{result.house?.name || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={result.status || 'active'}
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
                No students found. Try different search criteria or click "Apply Filters" to search.
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Container>
  );
};

export default StudentFilterList;
