import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Save, Plus, X } from 'lucide-react';
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

interface CurriculumTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    gradeLevel: number;
    hoursPerWeek: number;
    isCore: boolean;
  }>;
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

const CreateCurriculum: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CurriculumFormData>({
    name: '',
    description: '',
    version: '1.0',
    type: '',
    status: 'DRAFT',
    startYear: new Date().getFullYear(),
    endYear: null,
  });
  
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [templates, setTemplates] = useState<CurriculumTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
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
  ];

  useEffect(() => {
    fetchSubjects();
    fetchTemplates();
  }, []);

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

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/curricula/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleInputChange = (field: keyof CurriculumFormData, value: string | number | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (templateId && templateId !== 'none') {
      const template = templates.find(t => t.id === templateId);
      if (template) {
        setFormData(prev => ({
          ...prev,
          type: template.type,
          description: prev.description || template.description,
        }));
        
        // Auto-select subjects from template
        const templateSubjectIds = template.subjects.map(s => s.subjectId);
        setSelectedSubjects(templateSubjectIds);
      }
    } else {
      setSelectedSubjects([]);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
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

    setLoading(true);

    try {
      // Create curriculum
      const curriculumResponse = await fetch('/api/curricula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!curriculumResponse.ok) {
        const errorData = await curriculumResponse.json();
        throw new Error(errorData.message || 'Failed to create curriculum');
      }

      const curriculumData = await curriculumResponse.json();
      const curriculumId = curriculumData.curriculum.id;

      // Add subjects to curriculum if any selected
      if (selectedSubjects.length > 0) {
        const subjectPromises = selectedSubjects.map(subjectId =>
          fetch(`/api/curricula/${curriculumId}/subjects`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              subjectId,
              gradeLevel: 1, // Default grade level
              hoursPerWeek: 4, // Default hours per week
              isCore: true, // Default to core subject
              isOptional: false,
            }),
          })
        );

        await Promise.all(subjectPromises);
      }

      toast({
        title: "Success",
        description: "Curriculum created successfully.",
      });

      navigate('/school-settings/curricula');
    } catch (error: any) {
      console.error('Error creating curriculum:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create curriculum. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear + i);

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Curriculum</h1>
          <p className="text-gray-600 mt-2">Set up a new curriculum program for your school</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Start with Template (Optional)</CardTitle>
              <CardDescription>
                Choose a pre-configured template to get started quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template or start from scratch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Start from scratch</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the fundamental details for your curriculum
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
                    onValueChange={(value) => handleInputChange('startYear', parseInt(value))}
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
            </CardContent>
          </Card>

          {/* Subject Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects (Optional)</CardTitle>
              <CardDescription>
                Select subjects to include in this curriculum. You can modify these later.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subjects.length === 0 ? (
                <Alert>
                  <BookOpen className="h-4 w-4" />
                  <AlertDescription>
                    No subjects available. You can add subjects to this curriculum later.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject) => (
                      <Badge
                        key={subject.id}
                        variant={selectedSubjects.includes(subject.id) ? 'default' : 'outline'}
                        className="cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSubjectToggle(subject.id)}
                      >
                        {selectedSubjects.includes(subject.id) ? (
                          <X className="h-3 w-3 mr-1" />
                        ) : (
                          <Plus className="h-3 w-3 mr-1" />
                        )}
                        {subject.name}
                      </Badge>
                    ))}
                  </div>
                  
                  {selectedSubjects.length > 0 && (
                    <div className="text-sm text-gray-600">
                      {selectedSubjects.length} subjects selected
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/school-settings/curricula')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="h-4 w-4" />
              )}
              Create Curriculum
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCurriculum;
