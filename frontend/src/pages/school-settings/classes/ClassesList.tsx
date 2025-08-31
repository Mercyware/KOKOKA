import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, School, Edit, Trash2, Loader2, Search, Save, List, Workflow } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import ClassesVisualization from '../../../components/classes/ClassesVisualization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { getAllClasses, deleteClass, createClass, updateClass } from '../../../services/classService';
import { Class } from '../../../types';

const ClassesList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'visualization'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: 1,
    description: '',
    capacity: '',
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await getAllClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch classes',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: 'An error occurred while fetching classes',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClass = () => {
    setEditingClass(null);
    setFormData({
      name: '',
      grade: 1,
      description: '',
      capacity: '',
    });
    setAddModalOpen(true);
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      grade: typeof cls.grade === 'string' ? parseInt(cls.grade) || 1 : cls.grade || 1,
      description: cls.description || '',
      capacity: cls.capacity ? cls.capacity.toString() : '',
    });
    setEditModalOpen(true);
  };

  const handleEditFromVisualization = (classItem: Class) => {
    handleEditClass(classItem);
  };

  const handleCloseModal = () => {
    setAddModalOpen(false);
    setEditModalOpen(false);
    setEditingClass(null);
    setFormData({
      name: '',
      grade: 1,
      description: '',
      capacity: '',
    });
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: 'Class name is required',
        variant: "destructive",
      });
      return;
    }

    // Check for duplicate class names (except when editing the same class)
    const isDuplicate = classes.some(cls => 
      cls.name.toLowerCase() === formData.name.trim().toLowerCase() && 
      cls.id !== editingClass?.id
    );

    if (isDuplicate) {
      toast({
        title: "Error",
        description: 'A class with this name already exists',
        variant: "destructive",
      });
      return;
    }

    setFormLoading(true);
    try {
      // Compute grade automatically for new classes
      let gradeToUse = formData.grade;
      
      if (!editingClass) {
        // For new classes, find the next available grade
        const existingGrades = classes
          .map(cls => parseInt(cls.grade?.toString() || '0'))
          .filter(grade => !isNaN(grade))
          .sort((a, b) => a - b);
        
        gradeToUse = existingGrades.length > 0 ? Math.max(...existingGrades) + 1 : 1;
      }

      const classData = {
        name: formData.name.trim(),
        grade: gradeToUse.toString(),
        level: gradeToUse, // Add level for compatibility
        school: '', // Will be set by backend
        description: formData.description.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      };

      let response;
      if (editingClass) {
        response = await updateClass(editingClass.id!, classData);
      } else {
        response = await createClass(classData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Class ${editingClass ? 'updated' : 'created'} successfully`,
        });
        fetchClasses();
        handleCloseModal();
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${editingClass ? 'update' : 'create'} class`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${editingClass ? 'updating' : 'creating'} class:`, error);
      toast({
        title: "Error",
        description: `An error occurred while ${editingClass ? 'updating' : 'creating'} the class`,
        variant: "destructive",
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    setDeleteLoading(id);
    try {
      const response = await deleteClass(id);
      if (response.success) {
        toast({
          title: "Success",
          description: 'Class deleted successfully',
        });
        fetchClasses();
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to delete class',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast({
        title: "Error",
        description: 'An error occurred while deleting the class',
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.grade && cls.grade.toString().includes(searchTerm))
  );

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <School className="h-8 w-8 text-blue-600" />
              Classes Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage school classes and grade levels
            </p>
          </div>
          <Button
            onClick={handleAddClass}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Class
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'visualization')}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Class Visualization
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <Card>
          <CardHeader>
            <CardTitle>All Classes</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search classes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-lg">Loading classes...</span>
              </div>
            ) : filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <School className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No classes found' : 'No classes yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Get started by creating your first class'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    onClick={handleAddClass}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Class
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class Name</TableHead>
                      <TableHead>Grade Level</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell className="font-medium">{cls.name}</TableCell>
                        <TableCell>{cls.grade}</TableCell>
                        <TableCell>{cls.capacity || 'No limit'}</TableCell>
                        <TableCell>{cls.description || 'No description'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClass(cls)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  disabled={deleteLoading === cls.id}
                                >
                                  {deleteLoading === cls.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Class</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete the class "{cls.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => cls.id && handleDeleteClass(cls.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

          </TabsContent>

          <TabsContent value="visualization" className="mt-6">
            <ClassesVisualization onClassEdit={handleEditFromVisualization} />
          </TabsContent>
        </Tabs>

        {/* Add Class Modal */}
        <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Add a new class to your school. The grade level will be automatically assigned based on existing classes.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Grade 1, Form 1, Class A"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="Max students"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the class"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModal}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={formLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Class
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Class Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update the class information below. Class names must be unique within your school.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Class Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Grade 1, Form 1, Class A"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-grade">Grade Level *</Label>
                    <Input
                      id="edit-grade"
                      type="number"
                      min="1"
                      value={formData.grade}
                      onChange={(e) => handleInputChange('grade', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-capacity">Capacity</Label>
                    <Input
                      id="edit-capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', e.target.value)}
                      placeholder="Max students"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the class"
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCloseModal}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={formLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Class
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default ClassesList;
