import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardHeader,
  CardTitle,
  CardContent,
  Input, 
  Form, 
  FormField,
  PageContainer,
  PageHeader,
  PageTitle,
  PageContent,
  StatusBadge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription
} from '@/components/ui';
import { Plus, Edit, Trash2, Copy } from 'lucide-react';
import resultService, { GradeScale, GradeRange } from '@/services/resultService';
import { toast } from '@/components/ui/use-toast';

// Using imported types from resultService

interface DefaultGradeScale {
  name: string;
  gradeRanges: Omit<GradeRange, 'id'>[];
}

export default function GradeScaleManagement() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gradeScales, setGradeScales] = useState<GradeScale[]>([]);
  const [defaultScales, setDefaultScales] = useState<DefaultGradeScale[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingScale, setEditingScale] = useState<GradeScale | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    gradeRanges: [] as Omit<GradeRange, 'id'>[]
  });

  useEffect(() => {
    loadGradeScales();
    loadDefaultScales();
  }, []);

  const loadGradeScales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/results/grade-scales');
      setGradeScales(response.data.data);
    } catch (error) {
      console.error('Error loading grade scales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultScales = async () => {
    try {
      const response = await api.get('/results/grade-scales/defaults');
      setDefaultScales(response.data.data);
    } catch (error) {
      console.error('Error loading default scales:', error);
    }
  };

  const handleCreateFromDefault = (defaultScale: DefaultGradeScale) => {
    setFormData({
      name: defaultScale.name,
      gradeRanges: [...defaultScale.gradeRanges]
    });
    setEditingScale(null);
    setShowCreateForm(true);
  };

  const handleEditScale = (scale: GradeScale) => {
    setFormData({
      name: scale.name,
      gradeRanges: scale.gradeRanges.map(range => ({
        grade: range.grade,
        minScore: range.minScore,
        maxScore: range.maxScore,
        gradePoint: range.gradePoint,
        remark: range.remark,
        color: range.color
      }))
    });
    setEditingScale(scale);
    setShowCreateForm(true);
  };

  const handleAddGradeRange = () => {
    setFormData(prev => ({
      ...prev,
      gradeRanges: [
        ...prev.gradeRanges,
        {
          grade: '',
          minScore: 0,
          maxScore: 100,
          gradePoint: 0,
          remark: '',
          color: '#6B7280'
        }
      ]
    }));
  };

  const handleRemoveGradeRange = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gradeRanges: prev.gradeRanges.filter((_, i) => i !== index)
    }));
  };

  const handleGradeRangeChange = (index: number, field: keyof Omit<GradeRange, 'id'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      gradeRanges: prev.gradeRanges.map((range, i) => 
        i === index ? { ...range, [field]: value } : range
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name for the grade scale');
      return;
    }

    if (formData.gradeRanges.length === 0) {
      alert('Please add at least one grade range');
      return;
    }

    // Validate grade ranges don't overlap
    const sortedRanges = [...formData.gradeRanges].sort((a, b) => b.minScore - a.minScore);
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      if (sortedRanges[i].minScore <= sortedRanges[i + 1].maxScore) {
        alert('Grade ranges cannot overlap. Please adjust the score ranges.');
        return;
      }
    }

    try {
      setSaving(true);
      
      if (editingScale) {
        await api.put(`/results/grade-scales/${editingScale.id}`, formData);
      } else {
        await api.post('/results/grade-scales', formData);
      }

      alert(`Grade scale ${editingScale ? 'updated' : 'created'} successfully!`);
      setShowCreateForm(false);
      setEditingScale(null);
      setFormData({ name: '', gradeRanges: [] });
      loadGradeScales();

    } catch (error) {
      console.error('Error saving grade scale:', error);
      alert('Failed to save grade scale');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (scaleId: string) => {
    try {
      await api.put(`/results/grade-scales/${scaleId}/activate`);
      alert('Grade scale activated successfully!');
      loadGradeScales();
    } catch (error) {
      console.error('Error activating grade scale:', error);
      alert('Failed to activate grade scale');
    }
  };

  const handleDelete = async (scaleId: string) => {
    if (!confirm('Are you sure you want to delete this grade scale? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/results/grade-scales/${scaleId}`);
      alert('Grade scale deleted successfully!');
      loadGradeScales();
    } catch (error) {
      console.error('Error deleting grade scale:', error);
      alert('Failed to delete grade scale. It may be in use.');
    }
  };

  const getGradeColor = (color: string) => ({
    backgroundColor: color,
    color: ['#F59E0B', '#EF4444', '#DC2626', '#B91C1C'].includes(color) ? 'white' : 'white'
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Grade Scale Management</PageTitle>
        <Button
          intent="primary"
          onClick={() => {
            setFormData({ name: '', gradeRanges: [] });
            setEditingScale(null);
            setShowCreateForm(true);
          }}
        >
          Create New Scale
        </Button>
      </PageHeader>

      <PageContent>
        {showCreateForm && (
          <Card className="mb-6">
            <Card.Header>
              <Card.Title>
                {editingScale ? 'Edit Grade Scale' : 'Create New Grade Scale'}
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <form onSubmit={handleSubmit} className="space-y-6">
                <FormField label="Grade Scale Name" required>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter grade scale name (e.g., Primary School Grading)"
                  />
                </FormField>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Grade Ranges
                    </label>
                    <Button
                      type="button"
                      intent="action"
                      onClick={handleAddGradeRange}
                    >
                      Add Grade Range
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {formData.gradeRanges.map((range, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Grade Range {index + 1}</h4>
                          <Button
                            type="button"
                            intent="danger"
                            size="sm"
                            onClick={() => handleRemoveGradeRange(index)}
                          >
                            Remove
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Grade
                            </label>
                            <Input
                              type="text"
                              value={range.grade}
                              onChange={(e) => handleGradeRangeChange(index, 'grade', e.target.value)}
                              placeholder="A"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Min Score
                            </label>
                            <Input
                              type="number"
                              value={range.minScore}
                              onChange={(e) => handleGradeRangeChange(index, 'minScore', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Max Score
                            </label>
                            <Input
                              type="number"
                              value={range.maxScore}
                              onChange={(e) => handleGradeRangeChange(index, 'maxScore', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="100"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Grade Point
                            </label>
                            <Input
                              type="number"
                              step="0.1"
                              value={range.gradePoint}
                              onChange={(e) => handleGradeRangeChange(index, 'gradePoint', parseFloat(e.target.value) || 0)}
                              min="0"
                              max="4"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Remark
                            </label>
                            <Input
                              type="text"
                              value={range.remark}
                              onChange={(e) => handleGradeRangeChange(index, 'remark', e.target.value)}
                              placeholder="Excellent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Color
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={range.color}
                                onChange={(e) => handleGradeRangeChange(index, 'color', e.target.value)}
                                className="w-full h-10 rounded border border-gray-300"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Preview */}
                        <div className="mt-3 p-2 bg-gray-50 rounded">
                          <div className="flex items-center gap-2">
                            <span 
                              className="px-2 py-1 rounded text-sm font-medium"
                              style={getGradeColor(range.color)}
                            >
                              {range.grade}
                            </span>
                            <span className="text-sm text-gray-600">
                              {range.minScore}-{range.maxScore}% • {range.gradePoint} GP • {range.remark}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    intent="cancel"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    intent="primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : (editingScale ? 'Update' : 'Create')} Grade Scale
                  </Button>
                </div>
              </form>
            </Card.Content>
          </Card>
        )}

        {/* Default Grade Scales */}
        {!showCreateForm && (
          <Card className="mb-6">
            <Card.Header>
              <Card.Title>Create from Template</Card.Title>
              <div className="text-sm text-gray-600">
                Choose from pre-defined grade scales or create your own custom scale
              </div>
            </Card.Header>
            <Card.Content>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {defaultScales.map((scale, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium mb-2">{scale.name}</h3>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {scale.gradeRanges.map((range, rangeIndex) => (
                        <span
                          key={rangeIndex}
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={getGradeColor(range.color)}
                        >
                          {range.grade}
                        </span>
                      ))}
                    </div>
                    <Button
                      intent="primary"
                      size="sm"
                      onClick={() => handleCreateFromDefault(scale)}
                      className="w-full"
                    >
                      Use This Template
                    </Button>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}

        {/* Existing Grade Scales */}
        <Card>
          <Card.Header>
            <Card.Title>Existing Grade Scales</Card.Title>
          </Card.Header>
          <Card.Content>
            {loading ? (
              <div className="text-center py-8">Loading grade scales...</div>
            ) : gradeScales.length > 0 ? (
              <div className="space-y-4">
                {gradeScales.map((scale) => (
                  <div key={scale.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-lg">{scale.name}</h3>
                        <div className="text-sm text-gray-600">
                          Created: {new Date(scale.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge
                          variant={scale.isActive ? "success" : "secondary"}
                        >
                          {scale.isActive ? "Active" : "Inactive"}
                        </StatusBadge>
                        <div className="flex gap-2">
                          {!scale.isActive && (
                            <Button
                              intent="action"
                              size="sm"
                              onClick={() => handleSetActive(scale.id)}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            intent="primary"
                            size="sm"
                            onClick={() => handleEditScale(scale)}
                          >
                            Edit
                          </Button>
                          <Button
                            intent="danger"
                            size="sm"
                            onClick={() => handleDelete(scale.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Grade Ranges Display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {scale.gradeRanges.map((range, index) => (
                        <div key={index} className="bg-gray-50 rounded p-2">
                          <div className="flex items-center justify-between">
                            <span
                              className="px-2 py-1 rounded text-sm font-medium"
                              style={getGradeColor(range.color)}
                            >
                              {range.grade}
                            </span>
                            <span className="text-xs text-gray-600">
                              {range.gradePoint} GP
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {range.minScore}%-{range.maxScore}% • {range.remark}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Grade Scales</h3>
                <p className="text-gray-500 mb-4">No grade scales have been created yet.</p>
                <Button
                  intent="primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Your First Grade Scale
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
      </PageContent>
    </PageContainer>
  );
}