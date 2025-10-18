import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layers, Edit, Trash2, Loader2, Search, MoreVertical } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getSections, createSection, updateSection, deleteSection, Section } from '../../../services/sectionService';

const SectionsList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      console.log('Fetching sections...');
      const response = await getSections();
      console.log('Sections response:', response);
      
      if (response.success && response.data) {
        console.log('Setting sections:', response.data || []);
        setSections(response.data || []);
      } else {
        console.log('Sections request failed:', response);
        setSections([]); // Ensure sections is always an array
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch sections',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections([]); // Ensure sections is always an array
      toast({
        title: "Error",
        description: 'An error occurred while fetching sections',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!sectionToDelete) return;

    try {
      const response = await deleteSection(sectionToDelete);
      if (response.success) {
        toast({
          title: "Success",
          description: 'Section deleted successfully',
        });
        fetchSections();
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to delete section',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: "Error",
        description: 'An error occurred while deleting the section',
        variant: "destructive",
      });
    } finally {
      setSectionToDelete(null);
    }
  };

  // Modal handlers
  const handleOpenModal = (mode: 'create' | 'edit', section?: Section) => {
    setModalMode(mode);
    setSelectedSection(section || null);
    
    if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        capacity: '',
      });
    } else if (section) {
      setFormData({
        name: section.name,
        description: section.description || '',
        capacity: section.capacity ? section.capacity.toString() : '',
      });
    }
    
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSection(null);
    setFormData({
      name: '',
      description: '',
      capacity: '',
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: 'Section name is required',
        variant: "destructive",
      });
      return;
    }

    setModalLoading(true);
    try {
      const sectionData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      };

      let response;
      if (modalMode === 'create') {
        response = await createSection(sectionData);
      } else if (selectedSection?.id) {
        response = await updateSection(selectedSection.id, sectionData);
      }

      if (response?.success) {
        toast({
          title: "Success",
          description: `Section ${modalMode === 'create' ? 'created' : 'updated'} successfully`,
        });
        handleCloseModal();
        fetchSections();
      } else {
        throw new Error(response?.error || `Failed to ${modalMode} section`);
      }
    } catch (error: any) {
      console.error(`Error ${modalMode} section:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${modalMode} section`,
        variant: "destructive",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const filteredSections = (sections || []).filter(section =>
    section.name && section.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="h-8 w-8 text-blue-600" />
              Arms/Sections Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage class sections and arms for better student organization
            </p>
          </div>
          <Button
            intent="primary"
            onClick={() => handleOpenModal('create')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Section
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Sections</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search sections..."
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
                <span className="ml-2 text-lg">Loading sections...</span>
              </div>
            ) : filteredSections.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {searchTerm ? 'No sections found' : 'No sections yet'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms' 
                    : 'Get started by creating your first section'
                  }
                </p>
                {!searchTerm && (
                  <Button
                    intent="primary"
                    onClick={() => handleOpenModal('create')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Section
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section Name</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSections.map((section) => (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium">
                          <Badge variant="outline">{section.name}</Badge>
                        </TableCell>
                        <TableCell>{section.capacity || 'No limit'}</TableCell>
                        <TableCell>{section.description || 'No description'}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleOpenModal('edit', section)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => section.id && setSectionToDelete(section.id)}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {modalMode === 'create' ? 'Create New Section' : 'Edit Section'}
              </DialogTitle>
              <DialogDescription>
                {modalMode === 'create' 
                  ? 'Add a new section to organize your students better.'
                  : 'Update the section information.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Section Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., A, B, Red, Blue"
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
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="Max students"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the section"
                    rows={3}
                  />
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  intent="cancel"
                  onClick={handleCloseModal}
                  disabled={modalLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  intent="primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {modalMode === 'create' ? 'Creating...' : 'Updating...'}
                    </>
                  ) : (
                    modalMode === 'create' ? 'Create Section' : 'Update Section'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!sectionToDelete} onOpenChange={(open) => !open && setSectionToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Section</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this section? This action cannot be undone and will remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                intent="cancel"
                onClick={() => setSectionToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                intent="danger"
                onClick={handleDeleteSection}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default SectionsList;
