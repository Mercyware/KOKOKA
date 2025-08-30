import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, School, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getClassById, createClass, updateClass, Class } from '../../../services/classService';

const ClassForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    grade: 1,
    description: '',
    capacity: '',
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchClass();
    }
  }, [id]);

  const fetchClass = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const response = await getClassById(id);
      if (response.success && response.data) {
        const cls = response.data;
        setFormData({
          name: cls.name,
          grade: cls.grade,
          description: cls.description || '',
          capacity: cls.capacity ? cls.capacity.toString() : '',
        });
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to fetch class',
          variant: "destructive",
        });
        navigate('/school-settings/classes');
      }
    } catch (error) {
      console.error('Error fetching class:', error);
      toast({
        title: "Error",
        description: 'An error occurred while fetching the class',
        variant: "destructive",
      });
      navigate('/school-settings/classes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: 'Class name is required',
        variant: "destructive",
      });
      return;
    }

    if (formData.grade < 1) {
      toast({
        title: "Error",
        description: 'Grade level must be at least 1',
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const classData = {
        name: formData.name.trim(),
        grade: formData.grade,
        description: formData.description.trim() || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      };

      let response;
      if (isEditMode && id) {
        response = await updateClass(id, classData);
      } else {
        response = await createClass(classData);
      }

      if (response.success) {
        toast({
          title: "Success",
          description: `Class ${isEditMode ? 'updated' : 'created'} successfully`,
        });
        navigate('/school-settings/classes');
      } else {
        toast({
          title: "Error",
          description: response.message || `Failed to ${isEditMode ? 'update' : 'create'} class`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} class:`, error);
      toast({
        title: "Error",
        description: `An error occurred while ${isEditMode ? 'updating' : 'creating'} the class`,
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
              <School className="h-8 w-8 text-blue-600" />
              {isEditMode ? 'Edit Class' : 'Create New Class'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isEditMode ? 'Update class information' : 'Add a new class to your school'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/school-settings/classes')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="grade">Grade Level *</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="1"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity">Class Capacity (Optional)</Label>
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
                  placeholder="Brief description of the class"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/school-settings/classes')}
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
                      {isEditMode ? 'Update Class' : 'Create Class'}
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

export default ClassForm;
