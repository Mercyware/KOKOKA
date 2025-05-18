import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { StudentClassHistory as StudentClassHistoryType } from '../../types';
import { getStudentClassHistory } from '../../services/studentService';

interface StudentClassHistoryProps {
  studentId: string;
}

const StudentClassHistory: React.FC<StudentClassHistoryProps> = ({ studentId }) => {
  const [classHistory, setClassHistory] = useState<StudentClassHistoryType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClassHistory = async () => {
      try {
        setLoading(true);
        const data = await getStudentClassHistory(studentId);
        setClassHistory(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching class history:', err);
        setError('Failed to load class history. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchClassHistory();
    }
  }, [studentId]);

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

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'MMM dd, yyyy');
  };

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 3 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (classHistory.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="textSecondary" align="center">
            No class history records found for this student.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Class History
        </Typography>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Academic Year</TableCell>
                <TableCell>Class</TableCell>
                <TableCell>Class Arm</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Remarks</TableCell>
                <TableCell>Photo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.academicYear.name}</TableCell>
                  <TableCell>{record.class.name}</TableCell>
                  <TableCell>{record.classArm?.name || 'N/A'}</TableCell>
                  <TableCell>{formatDate(record.startDate)}</TableCell>
                  <TableCell>{formatDate(record.endDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={record.status} 
                      size="small" 
                      color={getStatusColor(record.status) as any}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{record.remarks || 'N/A'}</TableCell>
                  <TableCell>
                    {record.photo ? (
                      <img 
                        src={record.photo} 
                        alt={`Student in ${record.academicYear.name}`} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '50%' }}
                      />
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default StudentClassHistory;
