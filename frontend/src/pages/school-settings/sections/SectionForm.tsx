import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Layers, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { getSectionById, createSection, updateSection } from '../../../services/sectionService';
import { getAllClasses, Class } from '../../../services/classService';

const SectionForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    classId: '',
    description: '',
    capacity: '',
  });

  useEffect(() => {
    fetchClasses();
    if (isEditMode && id) {
      fetchSection();
    }
  }, [id]);

  const fetchClasses = async () => {
    try {
      const response = await getAllClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchSection = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getSectionById(id);
      if (response.success && response.data) {
        const section = response.data;
        setFormData({
          name: section.name,
          classId: section.classId,
          description: section.description || '',
          capacity: section.capacity ? section.capacity.toString() : '',
        });
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch section',
          variant: "destructive",
        });
        navigate('/school-settings/sections');
      }
    } catch (error) {
      console.error('Error fetching section:', error);
      toast({
        title: "Error",
        description: 'An error occurred while fetching the section',
        variant: "destructive",
      });
      navigate('/school-settings/sections');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: 'Section name is required',
        variant: "destructive",
      });
      return;
    }

    if (!formData.classId) {
      toast({
        title: "Error",
        description: 'Please select a class for this section',
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const sectionData = {
        name: formData.name.trim(),
        classId: formData.classId,
        description: formData.description.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      };

      let response;
      if (isEditMode && id) {
        response = await updateSection(id, sectionData);
      } else {
        response = await createSection(sectionData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Section ${isEditMode ? 'updated' : 'created'} successfully`,
        });
        navigate('/school-settings/sections');
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${isEditMode ? 'update' : 'create'} section`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} section:`, error);
      toast({
        title: "Error",
        description: `An error occurred while ${isEditMode ? 'updating' : 'creating'} the section`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Layers className="h-8 w-8 text-blue-600" />
              {isEditMode ? 'Edit Section' : 'Create New Section'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditMode ? 'Update section information' : 'Add a new section/arm to a class'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/school-settings/sections')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sections
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Section Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Section Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., A, B, Blue, Red, Alpha"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="classId">Class *</Label>
                  <Select
                    value={formData.classId}
                    onValueChange={(value) => handleInputChange('classId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id!}>
                          {cls.name} (Grade {cls.grade})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Section Capacity (Optional)</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange('capacity', e.target.value)}
                    placeholder="Maximum number of students"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of the section"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/school-settings/sections')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? 'Update Section' : 'Create Section'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default SectionForm;
