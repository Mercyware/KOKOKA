import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Save, ArrowLeft, Loader2 } from 'lucide-react';
import Layout from '../../../components/layout/Layout';
import { getSubjectById, updateSubject, SubjectData } from '../../../services/subjectService';
import { getDepartments, Department } from '../../../services/departmentService';
import { Subject } from '../../../types';

interface FormData {
  name: string;
  code: string;
  description: string;
  departmentId?: string;
}

const EditSubject: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    description: '',
    departmentId: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      fetchSubject();
      fetchDepartments();
    }
  }, [id]);

  const fetchSubject = async () => {
    if (!id) return;

    try {
      setFetchingData(true);
      const response = await getSubjectById(id);
      if (response.success && response.data) {
        const subjectData = response.data;
        setSubject(subjectData);
        setFormData({
          name: subjectData.name,
          code: subjectData.code,
          description: subjectData.description || '',
          departmentId: subjectData.departmentId || undefined,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || 'Subject not found',
          variant: "destructive",
        });
        navigate('/school-settings/subjects');
      }
    } catch (error) {
      console.error('Error fetching subject:', error);
      toast({
        title: "Error",
        description: 'Failed to load subject data',
        variant: "destructive",
      });
      navigate('/school-settings/subjects');
    } finally {
      setFetchingData(false);
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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Subject name is required';
    if (!formData.code?.trim()) newErrors.code = 'Subject code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) return;

    try {
      setLoading(true);
      const subjectData: Partial<SubjectData> = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim() || undefined,
        departmentId: formData.departmentId || undefined,
      };

      const response = await updateSubject(id, subjectData);

      if (response.success) {
        toast({
          title: "Success",
          description: 'Subject updated successfully',
        });
        navigate('/school-settings/subjects');
      } else {
        toast({
          title: "Error",
          description: response.message || 'Failed to update subject',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      toast({
        title: "Error",
        description: 'An error occurred while updating the subject',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <Layout>
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400">Loading subject...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Edit Subject
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Update subject information and settings
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/school-settings/subjects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subjects
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subject Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter subject name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Subject Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                    placeholder="Enter subject code"
                    className={errors.code ? "border-red-500" : ""}
                  />
                  {errors.code && (
                    <p className="text-sm text-red-500">{errors.code}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department (Optional)</Label>
                <Select
                  value={formData.departmentId || ''}
                  onValueChange={(value) => handleInputChange('departmentId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter subject description (optional)"
                  rows={4}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.description.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/school-settings/subjects')}
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update Subject
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

export default EditSubject;
