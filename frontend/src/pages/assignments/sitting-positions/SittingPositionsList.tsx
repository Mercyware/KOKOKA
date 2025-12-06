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
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import Layout from '../../../components/layout/Layout';
import sittingPositionService, { 
  SittingPositionResponse, 
  ClassroomLayoutResponse 
} from '../../../services/sittingPositionService';
import * as academicYearService from '../../../services/academicYearService';
import * as classService from '../../../services/classService';
import * as classArmService from '../../../services/classArmService';
import { useAuth } from '../../../contexts/AuthContext';

// Define the shape of the API responses
interface AcademicYear {
  _id: string;
  name: string;
  isActive: boolean;
  isCurrent?: boolean;
}

interface Term {
  _id: string;
  name: string;
  academicYear: string;
  isActive: boolean;
  isCurrent?: boolean;
}

interface Class {
  _id: string;
  name: string;
  level: number;
}

interface ClassArm {
  _id: string;
  name: string;
}

const SittingPositionsList: React.FC = () => {
  const [sittingPositions, setSittingPositions] = useState<SittingPositionResponse[]>([]);
  const [classroomLayout, setClassroomLayout] = useState<ClassroomLayoutResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classArms, setClassArms] = useState<ClassArm[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');
  const [selectedTerm, setSelectedTerm] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedClassArm, setSelectedClassArm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const navigate = useNavigate();
  const { authState } = useAuth();
  const isAdmin = authState.user?.role === 'admin' || authState.user?.role === 'superadmin';
  const isTeacher = authState.user?.role === 'teacher';
  const canEdit = isAdmin || isTeacher;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch academic years
        const academicYearsResponse = await academicYearService.getAllAcademicYears();
        const years = academicYearsResponse.data?.academicYears || [];
        setAcademicYears(years as unknown as AcademicYear[]);
        
        // Find current academic year
        const currentYear = years.find((year) => year.isCurrent) as unknown as AcademicYear;
        if (currentYear) {
          setSelectedAcademicYear(currentYear._id);
          await fetchTerms(currentYear._id);
        } else if (years.length > 0) {
          const firstYear = years[0] as unknown as AcademicYear;
          setSelectedAcademicYear(firstYear._id);
          await fetchTerms(firstYear._id);
        }

        // Fetch classes
        const classesResponse = await classService.getClasses();
        const classesData = classesResponse.data || [];
        setClasses(classesData as unknown as Class[]);
        
        if (classesData.length > 0) {
          const firstClass = classesData[0] as unknown as Class;
          setSelectedClass(firstClass._id);
          await fetchClassArms(firstClass._id);
        }
      } catch (err) {
        setError('Failed to fetch initial data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchTerms = async (academicYearId: string) => {
    try {
      // Since we don't have termService, we'll use a placeholder
      // In a real implementation, you would call the actual service
      // const termsResponse = await termService.getTermsByAcademicYear(academicYearId);
      
      // For now, we'll just set an empty array
      const termsData: Term[] = [];
      setTerms(termsData);
      
      // Find current term
      const currentTerm = termsData.find((term: Term) => term.isCurrent);
      if (currentTerm) {
        setSelectedTerm(currentTerm._id);
      } else if (termsData.length > 0) {
        setSelectedTerm(termsData[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch terms');
    }
  };

  const fetchClassArms = async (classId: string) => {
    try {
      // Since we don't have the exact method, we'll use a placeholder
      // In a real implementation, you would call the actual service
      // const classArmsResponse = await classArmService.getClassArmsByClass(classId);
      
      // For now, we'll just set an empty array
      const classArmsData: ClassArm[] = [];
      setClassArms(classArmsData);
      
      if (classArmsData.length > 0) {
        setSelectedClassArm(classArmsData[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch class arms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      fetchClassArms(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedAcademicYear && selectedTerm && selectedClass && selectedClassArm) {
      fetchSittingPositions();
    }
  }, [selectedAcademicYear, selectedTerm, selectedClass, selectedClassArm, viewMode]);

  const fetchSittingPositions = async () => {
    try {
      setLoading(true);
      
      if (viewMode === 'list') {
        const data = await sittingPositionService.getSittingPositionsByClassAndArm(
          selectedClass,
          selectedClassArm
        );
        setSittingPositions(data);
        setClassroomLayout(null);
      } else {
        const layout = await sittingPositionService.getClassroomLayout(
          selectedClass,
          selectedClassArm,
          selectedTerm
        );
        setClassroomLayout(layout);
        setSittingPositions([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch sitting positions');
    } finally {
      setLoading(false);
    }
  };

  const handleAcademicYearChange = (event: SelectChangeEvent) => {
    const yearId = event.target.value;
    setSelectedAcademicYear(yearId);
    fetchTerms(yearId);
  };

  const handleTermChange = (event: SelectChangeEvent) => {
    setSelectedTerm(event.target.value);
  };

  const handleClassChange = (event: SelectChangeEvent) => {
    setSelectedClass(event.target.value);
  };

  const handleClassArmChange = (event: SelectChangeEvent) => {
    setSelectedClassArm(event.target.value);
  };

  const handleViewModeChange = () => {
    const newMode = viewMode === 'list' ? 'grid' : 'list';
    setViewMode(newMode);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this sitting position assignment?')) {
      try {
        await sittingPositionService.deleteSittingPosition(id);
        setSittingPositions(sittingPositions.filter(sp => sp._id !== id));
      } catch (err) {
        setError('Failed to delete sitting position assignment');
      }
    }
  };

  const renderListView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Student</TableCell>
            <TableCell>Row</TableCell>
            <TableCell>Column</TableCell>
            <TableCell>Position Number</TableCell>
            <TableCell>Assigned Date</TableCell>
            <TableCell>Status</TableCell>
            {canEdit && <TableCell align="center">Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {sittingPositions.map((position) => (
            <TableRow key={position._id}>
              <TableCell>
                {position.student.firstName} {position.student.lastName} ({position.student.admissionNumber})
              </TableCell>
              <TableCell>{position.row}</TableCell>
              <TableCell>{position.column}</TableCell>
              <TableCell>{position.positionNumber}</TableCell>
              <TableCell>
                {new Date(position.assignedDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {position.isActive ? 'Active' : 'Inactive'}
              </TableCell>
              {canEdit && (
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton
                      onClick={() => navigate(`/assignments/sitting-positions/edit/${position._id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton
                      onClick={() => handleDelete(position._id)}
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
  );

  const renderGridView = () => {
    if (!classroomLayout) {
      return <Alert severity="info">No classroom layout available.</Alert>;
    }

    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          Classroom Layout ({classroomLayout.rows} rows × {classroomLayout.columns} columns)
        </Typography>
        <Paper sx={{ p: 2, overflow: 'auto' }}>
          <Grid container spacing={1}>
            {Array.from({ length: classroomLayout.rows }).map((_, rowIndex) => (
              <Grid item xs={12} key={`row-${rowIndex}`}>
                <Grid container spacing={1}>
                  {Array.from({ length: classroomLayout.columns }).map((_, colIndex) => {
                    const student = classroomLayout.layout[rowIndex][colIndex];
                    return (
                      <Grid item xs={2} key={`cell-${rowIndex}-${colIndex}`}>
                        <Card 
                          sx={{ 
                            height: 100, 
                            bgcolor: student ? '#e3f2fd' : '#f5f5f5',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <CardActionArea 
                            onClick={() => {
                              if (student && canEdit) {
                                navigate(`/assignments/sitting-positions/edit/${student._id}`);
                              } else if (canEdit) {
                                navigate(`/assignments/sitting-positions/create?row=${rowIndex + 1}&column=${colIndex + 1}&class=${selectedClass}&classArm=${selectedClassArm}&academicYear=${selectedAcademicYear}&term=${selectedTerm}`);
                              }
                            }}
                          >
                            <CardContent sx={{ p: 1, textAlign: 'center' }}>
                              {student ? (
                                <>
                                  <Typography variant="body2" noWrap>
                                    {student.student.firstName} {student.student.lastName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {student.student.admissionNumber}
                                  </Typography>
                                  <Typography variant="caption" color="primary">
                                    Position: {student.positionNumber}
                                  </Typography>
                                </>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Empty
                                </Typography>
                              )}
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    );
  };

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Sitting Positions
          </Typography>
          <Box>
            <Tooltip title={viewMode === 'list' ? 'Grid View' : 'List View'}>
              <IconButton 
                onClick={handleViewModeChange}
                sx={{ mr: 1 }}
              >
                {viewMode === 'list' ? <GridViewIcon /> : <ViewListIcon />}
              </IconButton>
            </Tooltip>
            {canEdit && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => navigate('/assignments/sitting-positions/create')}
              >
                Assign Sitting Position
              </Button>
            )}
          </Box>
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
              <InputLabel id="term-label">Term</InputLabel>
              <Select
                labelId="term-label"
                value={selectedTerm}
                label="Term"
                onChange={handleTermChange}
              >
                {terms.map((term) => (
                  <MenuItem key={term._id} value={term._id}>
                    {term.name} {term.isCurrent ? '(Current)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel id="class-label">Class</InputLabel>
              <Select
                labelId="class-label"
                value={selectedClass}
                label="Class"
                onChange={handleClassChange}
              >
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
              <InputLabel id="class-arm-label">Section/Arm</InputLabel>
              <Select
                labelId="class-arm-label"
                value={selectedClassArm}
                label="Section/Arm"
                onChange={handleClassArmChange}
              >
                {classArms.map((arm) => (
                  <MenuItem key={arm._id} value={arm._id}>
                    {arm.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : viewMode === 'list' ? (
          sittingPositions.length === 0 ? (
            <Alert severity="info">No sitting positions found for the selected class and section.</Alert>
          ) : (
            renderListView()
          )
        ) : (
          renderGridView()
        )}
      </Box>
    </Layout>
  );
};

export default SittingPositionsList;
