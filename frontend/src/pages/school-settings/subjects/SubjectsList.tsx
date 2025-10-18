import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Edit, Trash2, Loader2, Search, MoreVertical } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getAllSubjects, createSubject, updateSubject, deleteSubject, SubjectData } from '../../../services/subjectService';
import { getDepartments, Department } from '../../../services/departmentService';
import { Subject } from '../../../types';

const SubjectsList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<SubjectData>({
    name: '',
    code: '',
    description: '',
    departmentId: undefined,
  });

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await getAllSubjects();
      if (response.success && response.data) {
        setSubjects(response.data);
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to load subjects',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load subjects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await getDepartments();
      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setEditingSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code,
        description: subject.description || '',
        departmentId: subject.departmentId || undefined,
      });
    } else {
      setEditingSubject(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        departmentId: undefined,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingSubject(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      departmentId: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.code) {
      toast({
        title: 'Validation Error',
        description: 'Name and code are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setModalLoading(true);
      let response;

      if (editingSubject) {
        response = await updateSubject(editingSubject.id, formData);
      } else {
        response = await createSubject(formData);
      }

      if (response.success) {
        toast({
          title: 'Success',
          description: `Subject ${editingSubject ? 'updated' : 'created'} successfully`,
        });
        handleCloseModal();
        fetchSubjects();
      } else {
        toast({
          title: 'Error',
          description: response.message || `Failed to ${editingSubject ? 'update' : 'create'} subject`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(`Error ${editingSubject ? 'updating' : 'creating'} subject:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${editingSubject ? 'update' : 'create'} subject`,
        variant: 'destructive',
      });
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!subjectToDelete) return;

    try {
      const response = await deleteSubject(subjectToDelete.id);

      if (response.success) {
        toast({
          title: 'Success',
          description: 'Subject deleted successfully',
        });
        setSubjects(subjects.filter(d => d.id !== subjectToDelete.id));
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete subject',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting subject:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete subject',
        variant: 'destructive',
      });
    } finally {
      setSubjectToDelete(null);
    }
  };

  // Filter subjects based on search
  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (subject.department?.name && subject.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
              <p className="text-sm text-gray-500">
                Manage academic subjects and their details
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
<Button intent="primary" onClick={() => handleOpenModal()} className="flex items-center gap-2">
  <Plus className="h-4 w-4" />
  Add Subject
</Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {subjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {subjects.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Subjects</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {subjects.filter(subject => subject.departmentId).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">With Department</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {subjects.filter(subject => !subject.departmentId).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Independent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {new Set(subjects.filter(subject => subject.departmentId).map(subject => subject.departmentId)).size}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Subjects Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Subjects ({filteredSubjects.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          No subjects found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredSubjects.map((subject) => (
                        <TableRow key={subject.id}>
                          <TableCell className="font-medium">{subject.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{subject.code}</Badge>
                          </TableCell>
                          <TableCell>
                            {subject.department ? (
                              <span className="text-sm text-gray-600">
                                {subject.department.name}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">No department</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {subject.description || 'No description'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleOpenModal(subject)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setSubjectToDelete(subject)}
                                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSubject ? 'Edit Subject' : 'Create New Subject'}
            </DialogTitle>
            <DialogDescription>
              {editingSubject 
                ? 'Update the subject information below.' 
                : 'Fill in the details to create a new subject.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter subject name"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Subject Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Enter subject code (e.g. MATH101)"
                required
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.departmentId || ''}
                onValueChange={(value) => setFormData({ ...formData, departmentId: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department (optional)" />
                </SelectTrigger>
<SelectContent>
  {departments.map((dept) => (
    <SelectItem key={dept.id} value={dept.id}>
      {dept.name} ({dept.code})
    </SelectItem>
  ))}
</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter subject description (optional)"
                rows={3}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" intent="cancel" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" intent="primary" disabled={modalLoading}>
                {modalLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingSubject ? 'Update' : 'Create'} Subject
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!subjectToDelete} onOpenChange={(open) => !open && setSubjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Subject</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{subjectToDelete?.name}"? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              intent="cancel"
              onClick={() => setSubjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              intent="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default SubjectsList;
