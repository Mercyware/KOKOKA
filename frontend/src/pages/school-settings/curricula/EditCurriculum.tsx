import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Save, Plus, X, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface CurriculumSubject {
  id: string;
  subjectId: string;
  subject: Subject;
  gradeLevel: number;
  term?: number;
  hoursPerWeek: number;
  isCore: boolean;
  isOptional: boolean;
}

interface CurriculumData {
  id: string;
  name: string;
  description?: string;
  version: string;
  type: string;
  status: string;
  startYear?: number;
  endYear?: number;
  subjects: CurriculumSubject[];
  createdAt: string;
  updatedAt: string;
}

interface CurriculumFormData {
  name: string;
  description: string;
  version: string;
  type: string;
  status: string;
  startYear: number | null;
  endYear: number | null;
}

const EditCurriculum: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [curriculum, setCurriculum] = useState<CurriculumData | null>(null);
  const [formData, setFormData] = useState<CurriculumFormData>({
    name: '',
    description: '',
    version: '',
    type: '',
    status: '',
    startYear: null,
    endYear: null,
  });
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const curriculumTypes = [
    { value: 'STANDARD', label: 'Standard Curriculum' },
    { value: 'CAMBRIDGE', label: 'Cambridge International' },
    { value: 'IB', label: 'International Baccalaureate' },
    { value: 'NATIONAL', label: 'National Curriculum' },
    { value: 'STEM', label: 'STEM Focus' },
    { value: 'ARTS', label: 'Arts Focus' },
    { value: 'VOCATIONAL', label: 'Vocational Training' },
    { value: 'CUSTOM', label: 'Custom Curriculum' },
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'UNDER_REVIEW', label: 'Under Review' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  useEffect(() => {
    if (id) {
      fetchCurriculum();
      fetchSubjects();
    }
  }, [id]);

  useEffect(() => {
    if (curriculum && subjects.length > 0) {
      const assignedSubjectIds = curriculum.subjects.map(cs => cs.subjectId);
      const available = subjects.filter(subject => !assignedSubjectIds.includes(subject.id));
      setAvailableSubjects(available);
    }
  }, [curriculum, subjects]);

  const fetchCurriculum = async () => {
    try {
      const response = await fetch(`/api/curricula/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch curriculum');
      }

      const data = await response.json();
      const curriculumData = data.curriculum;
      
      setCurriculum(curriculumData);
      setFormData({
        name: curriculumData.name,
        description: curriculumData.description || '',
        version: curriculumData.version,
        type: curriculumData.type,
        status: curriculumData.status,
        startYear: curriculumData.startYear,
        endYear: curriculumData.endYear,
      });
    } catch (error) {
      console.error('Error fetching curriculum:', error);
      toast({
        title: "Error",
        description: "Failed to fetch curriculum details.",
        variant: "destructive",
      });
      navigate('/school-settings/curricula');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/subjects?limit=1000', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleInputChange = (field: keyof CurriculumFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Curriculum name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Curriculum type is required';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    }

    if (formData.startYear && formData.endYear && formData.startYear >= formData.endYear) {
      newErrors.endYear = 'End year must be after start year';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/curricula/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update curriculum');
      }

      toast({
        title: "Success",
        description: "Curriculum updated successfully.",
      });

      // Refresh curriculum data
      await fetchCurriculum();
    } catch (error: any) {
      console.error('Error updating curriculum:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update curriculum. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubject = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/curricula/${id}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          subjectId,
          gradeLevel: 1,
          hoursPerWeek: 4,
          isCore: true,
          isOptional: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add subject');
      }

      toast({
        title: "Success",
        description: "Subject added to curriculum successfully.",
      });

      // Refresh curriculum data
      await fetchCurriculum();
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: "Error",
        description: "Failed to add subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveSubject = async (curriculumSubjectId: string, subjectName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${subjectName}" from this curriculum?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/curricula/${id}/subjects/${curriculumSubjectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove subject');
      }

      toast({
        title: "Success",
        description: "Subject removed from curriculum successfully.",
      });

      // Refresh curriculum data
      await fetchCurriculum();
    } catch (error) {
      console.error('Error removing subject:', error);
      toast({
        title: "Error",
        description: "Failed to remove subject. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear + i);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading curriculum...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertDescription>
            Curriculum not found. Please check the URL and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/school-settings/curricula')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Curricula
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Curriculum</h1>
          <p className="text-gray-600 mt-2">Update your curriculum settings and subjects</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the fundamental details for your curriculum
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Curriculum Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Primary School Curriculum 2024"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="version">Version *</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => handleInputChange('version', e.target.value)}
                    placeholder="e.g., 1.0, 2024.1"
                    className={errors.version ? 'border-red-500' : ''}
                  />
                  {errors.version && (
                    <p className="text-red-500 text-sm mt-1">{errors.version}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the curriculum goals, target students, and key features..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Curriculum Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select curriculum type" />
                    </SelectTrigger>
                    <SelectContent>
                      {curriculumTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1">{errors.type}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startYear">Start Year</Label>
                  <Select
                    value={formData.startYear?.toString() || ''}
                    onValueChange={(value) => handleInputChange('startYear', value ? parseInt(value) : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select start year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="endYear">End Year (Optional)</Label>
                  <Select
                    value={formData.endYear?.toString() || ''}
                    onValueChange={(value) => handleInputChange('endYear', value ? parseInt(value) : null)}
                  >
                    <SelectTrigger className={errors.endYear ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select end year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No end year</SelectItem>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.endYear && (
                    <p className="text-red-500 text-sm mt-1">{errors.endYear}</p>
                  )}
                </div>
              </div>

              {/* Save Basic Information */}
              <div className="flex justify-end pt-4 border-t">
                <Button type="submit" disabled={saving} className="flex items-center gap-2">
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Current Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Current Subjects ({curriculum.subjects.length})</CardTitle>
            <CardDescription>
              Subjects currently included in this curriculum
            </CardDescription>
          </CardHeader>
          <CardContent>
            {curriculum.subjects.length === 0 ? (
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertDescription>
                  No subjects added to this curriculum yet.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {curriculum.subjects.map((curriculumSubject) => (
                  <div
                    key={curriculumSubject.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{curriculumSubject.subject.name}</h4>
                      <div className="text-sm text-gray-600">
                        Grade Level: {curriculumSubject.gradeLevel} • 
                        {curriculumSubject.hoursPerWeek} hours/week • 
                        {curriculumSubject.isCore ? 'Core' : 'Elective'} Subject
                        {curriculumSubject.term && ` • Term ${curriculumSubject.term}`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubject(curriculumSubject.id, curriculumSubject.subject.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Add Subjects</CardTitle>
            <CardDescription>
              Add new subjects to this curriculum
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableSubjects.length === 0 ? (
              <Alert>
                <BookOpen className="h-4 w-4" />
                <AlertDescription>
                  All available subjects have been added to this curriculum.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {availableSubjects.map((subject) => (
                    <Badge
                      key={subject.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => handleAddSubject(subject.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {subject.name}
                    </Badge>
                  ))}
                </div>
                
                <div className="text-sm text-gray-600">
                  Click on a subject to add it to this curriculum
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Curriculum Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Curriculum Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Created:</strong> {formatDate(curriculum.createdAt)}
              </div>
              <div>
                <strong>Last Updated:</strong> {formatDate(curriculum.updatedAt)}
              </div>
              <div>
                <strong>Total Subjects:</strong> {curriculum.subjects.length}
              </div>
              <div>
                <strong>Curriculum ID:</strong> {curriculum.id}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditCurriculum;
