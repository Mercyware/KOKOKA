import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  DragIndicator,
  Visibility,
  Edit,
  Save,
  Cancel,
  ViewModule,
  ViewStream,
  ArrowForward,
  ArrowDownward,
} from '@mui/icons-material';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult,
  DroppableProvided,
  DroppableStateSnapshot,
  DraggableProvided,
  DraggableStateSnapshot,
} from '@hello-pangea/dnd';
import { getAllClasses, bulkUpdateClassGrades } from '../../services/classService';
import { Class } from '../../types';

interface ClassVisualizationProps {
  onClassEdit?: (classItem: Class) => void;
}

interface GradeGroup {
  grade: string;
  classes: Class[];
}

const ClassesVisualization: React.FC<ClassVisualizationProps> = ({ onClassEdit }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [gradeGroups, setGradeGroups] = useState<GradeGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDragEnabled, setIsDragEnabled] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isVerticalView, setIsVerticalView] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [pendingChanges, setPendingChanges] = useState<{ id: string; grade: string }[]>([]);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Organize classes into grade groups whenever classes change
  useEffect(() => {
    organizeClassesByGrade();
  }, [classes]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await getAllClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load classes',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const organizeClassesByGrade = () => {
    if (classes.length === 0) {
      setGradeGroups([]);
      return;
    }

    // Group classes by grade
    const groupedClasses = classes.reduce((groups: { [key: string]: Class[] }, classItem) => {
      const grade = classItem.grade?.toString() || 'Unassigned';
      if (!groups[grade]) {
        groups[grade] = [];
      }
      groups[grade].push(classItem);
      return groups;
    }, {});

    // Convert to array and sort by grade
    const gradeGroupsArray: GradeGroup[] = Object.entries(groupedClasses)
      .map(([grade, classes]) => ({ grade, classes }))
      .sort((a, b) => {
        // Handle numeric grades
        const aNum = parseInt(a.grade);
        const bNum = parseInt(b.grade);
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        
        // Handle mixed numeric and non-numeric grades
        if (!isNaN(aNum) && isNaN(bNum)) return -1;
        if (isNaN(aNum) && !isNaN(bNum)) return 1;
        
        // Handle non-numeric grades alphabetically
        return a.grade.localeCompare(b.grade);
      });

    setGradeGroups(gradeGroupsArray);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    // If dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceGrade = source.droppableId;
    const destinationGrade = destination.droppableId;
    const classId = draggableId;

    // Create a copy of grade groups for manipulation
    const newGradeGroups = [...gradeGroups];
    
    // Find source and destination groups
    const sourceGroupIndex = newGradeGroups.findIndex(group => group.grade === sourceGrade);
    const destinationGroupIndex = newGradeGroups.findIndex(group => group.grade === destinationGrade);
    
    if (sourceGroupIndex === -1 || destinationGroupIndex === -1) {
      return;
    }

    const sourceGroup = newGradeGroups[sourceGroupIndex];
    const destinationGroup = newGradeGroups[destinationGroupIndex];

    // Find the class being moved
    const classIndex = sourceGroup.classes.findIndex(c => c.id === classId);
    if (classIndex === -1) {
      return;
    }

    const [movedClass] = sourceGroup.classes.splice(classIndex, 1);
    
    // Update the class grade
    const updatedClass = { ...movedClass, grade: destinationGrade };
    
    // Add to destination group
    destinationGroup.classes.splice(destination.index, 0, updatedClass);

    // Update state
    setGradeGroups(newGradeGroups);
    
    // Track changes
    const existingChangeIndex = pendingChanges.findIndex(change => change.id === classId);
    const newChanges = [...pendingChanges];
    
    if (existingChangeIndex >= 0) {
      newChanges[existingChangeIndex] = { id: classId, grade: destinationGrade };
    } else {
      newChanges.push({ id: classId, grade: destinationGrade });
    }
    
    setPendingChanges(newChanges);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) {
      setHasChanges(false);
      return;
    }

    try {
      const response = await bulkUpdateClassGrades(pendingChanges);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: `Successfully updated ${pendingChanges.length} class grades`,
          severity: 'success',
        });
        
        // Update local classes state
        const updatedClasses = classes.map(classItem => {
          const change = pendingChanges.find(c => c.id === classItem.id);
          return change ? { ...classItem, grade: change.grade } : classItem;
        });
        
        setClasses(updatedClasses);
        setPendingChanges([]);
        setHasChanges(false);
        setIsDragEnabled(false);
        
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to update class grades',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while saving changes',
        severity: 'error',
      });
    }
  };

  const handleCancelChanges = () => {
    setConfirmDialogOpen(true);
  };

  const confirmCancelChanges = () => {
    // Reset to original state
    fetchClasses();
    setPendingChanges([]);
    setHasChanges(false);
    setIsDragEnabled(false);
    setConfirmDialogOpen(false);
  };

  const handleToggleDragMode = () => {
    if (isDragEnabled && hasChanges) {
      setConfirmDialogOpen(true);
    } else {
      setIsDragEnabled(!isDragEnabled);
      if (hasChanges && !isDragEnabled) {
        setPendingChanges([]);
        setHasChanges(false);
        fetchClasses();
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getGradeColor = (grade: string) => {
    const colors = [
      '#e3f2fd', '#f3e5f5', '#e8f5e8', '#fff3e0',
      '#fce4ec', '#e0f2f1', '#f1f8e9', '#fff8e1',
      '#e8eaf6', '#fafafa', '#ffebee', '#e0f7fa'
    ];
    
    const index = parseInt(grade) || grade.charCodeAt(0);
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography>Loading classes...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Class Grade Visualization</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* View Toggle */}
          <Tooltip title={isVerticalView ? "Switch to horizontal view" : "Switch to vertical view"}>
            <IconButton onClick={() => setIsVerticalView(!isVerticalView)}>
              {isVerticalView ? <ViewStream /> : <ViewModule />}
            </IconButton>
          </Tooltip>

          {/* Drag Mode Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={isDragEnabled}
                onChange={handleToggleDragMode}
                color="primary"
              />
            }
            label="Edit Mode"
          />

          {/* Save/Cancel Actions */}
          {hasChanges && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSaveChanges}
                size="small"
              >
                Save Changes
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Cancel />}
                onClick={handleCancelChanges}
                size="small"
              >
                Cancel
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* Help Text */}
      {isDragEnabled && (
        <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="body2">
            <strong>Edit Mode:</strong> Drag and drop classes between grades to reorganize them. 
            Click "Save Changes" when done or "Cancel" to discard changes.
          </Typography>
        </Paper>
      )}

      {/* Visualization */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: isVerticalView ? 'column' : 'row',
            gap: isVerticalView ? 2 : 1.5,
            overflowX: isVerticalView ? 'visible' : 'auto',
            minHeight: isVerticalView ? 'auto' : '300px',
            maxHeight: isVerticalView ? 'none' : '500px',
            position: 'relative',
            justifyContent: isVerticalView ? 'flex-start' : 'center',
            alignItems: isVerticalView ? 'stretch' : 'flex-start',
          }}
        >
          {gradeGroups.map((gradeGroup, index) => (
            <React.Fragment key={gradeGroup.grade}>
              <Box 
                sx={{ 
                  minWidth: isVerticalView ? '100%' : '220px',
                  maxWidth: isVerticalView ? '100%' : '280px',
                  flex: isVerticalView ? 'none' : '1',
                  position: 'relative',
                }}
              >
                {/* Grade Header */}
                <Paper
                  sx={{
                    p: 1.5,
                    mb: 1.5,
                    bgcolor: getGradeColor(gradeGroup.grade),
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    Grade {gradeGroup.grade}
                  </Typography>
                  <Chip
                    label={`${gradeGroup.classes.length} class${gradeGroup.classes.length !== 1 ? 'es' : ''}`}
                    size="small"
                    variant="outlined"
                  />
                </Paper>

                {/* Classes Droppable Area */}
                <Droppable droppableId={gradeGroup.grade} isDropDisabled={!isDragEnabled}>
                  {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      sx={{
                        minHeight: isVerticalView ? '120px' : '160px',
                        maxHeight: isVerticalView ? '200px' : '280px',
                        overflowY: 'auto',
                        p: 1,
                        bgcolor: snapshot.isDraggingOver ? 'action.hover' : 'transparent',
                        borderRadius: 1,
                        border: snapshot.isDraggingOver ? '2px dashed' : '2px solid transparent',
                        borderColor: snapshot.isDraggingOver ? 'primary.main' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {gradeGroup.classes.map((classItem, classIndex) => (
                        <Draggable
                          key={classItem.id}
                          draggableId={classItem.id!}
                          index={classIndex}
                          isDragDisabled={!isDragEnabled}
                        >
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              sx={{
                                mb: 1.5,
                                cursor: isDragEnabled ? 'grab' : 'default',
                                transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                                boxShadow: snapshot.isDragging ? 4 : 1,
                                '&:hover': {
                                  boxShadow: 2,
                                },
                              }}
                            >
                              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 'medium', fontSize: '0.9rem' }}>
                                      {classItem.name}
                                    </Typography>
                                    {classItem.description && (
                                      <Typography 
                                        variant="body2" 
                                        color="text.secondary" 
                                        sx={{ 
                                          mt: 0.5, 
                                          fontSize: '0.75rem',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          whiteSpace: 'nowrap'
                                        }}
                                      >
                                        {classItem.description}
                                      </Typography>
                                    )}
                                    {classItem.capacity && (
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                        Cap: {classItem.capacity}
                                      </Typography>
                                    )}
                                  </Box>
                                  
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    {/* Edit Button */}
                                    {onClassEdit && (
                                      <Tooltip title="Edit Class">
                                        <IconButton
                                          size="small"
                                          onClick={() => onClassEdit(classItem)}
                                          sx={{ p: 0.5 }}
                                        >
                                          <Edit fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    
                                    {/* Drag Handle */}
                                    {isDragEnabled && (
                                      <Box
                                        {...provided.dragHandleProps}
                                        sx={{ 
                                          ml: 0.5,
                                          cursor: 'grab',
                                          '&:active': { cursor: 'grabbing' }
                                        }}
                                      >
                                        <DragIndicator color="action" fontSize="small" />
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {/* Empty State */}
                      {gradeGroup.classes.length === 0 && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '80px',
                            color: 'text.secondary',
                            fontStyle: 'italic',
                            fontSize: '0.8rem',
                          }}
                        >
                          No classes
                        </Box>
                      )}
                    </Box>
                  )}
                </Droppable>
              </Box>

              {/* Connection Arrow */}
              {index < gradeGroups.length - 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...(isVerticalView
                      ? {
                          height: '40px',
                          width: '100%',
                          flexDirection: 'column',
                        }
                      : {
                          width: '60px',
                          height: '100%',
                          minHeight: '200px',
                          flexDirection: 'row',
                          flexShrink: 0,
                        }),
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: '50%',
                      width: 36,
                      height: 36,
                      boxShadow: 2,
                      ...(isVerticalView
                        ? {
                            transform: 'rotate(90deg)',
                          }
                        : {}),
                    }}
                  >
                    {isVerticalView ? <ArrowDownward fontSize="small" /> : <ArrowForward fontSize="small" />}
                  </Box>
                  
                  {/* Flow line */}
                  <Box
                    sx={{
                      bgcolor: 'primary.main',
                      opacity: 0.3,
                      ...(isVerticalView
                        ? {
                            width: '2px',
                            height: '16px',
                            marginTop: '-18px',
                            marginBottom: '-18px',
                          }
                        : {
                            height: '2px',
                            width: '24px',
                            marginLeft: '-18px',
                            marginRight: '-18px',
                          }),
                    }}
                  />
                </Box>
              )}
            </React.Fragment>
          ))}
        </Box>
      </DragDropContext>

      {/* Empty State */}
      {gradeGroups.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No classes found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create some classes to see the grade visualization
          </Typography>
        </Paper>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes. Are you sure you want to discard them?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Keep Changes</Button>
          <Button onClick={confirmCancelChanges} color="error" autoFocus>
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClassesVisualization;
