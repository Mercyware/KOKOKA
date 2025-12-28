import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { createMasterInvoice, getAllFeeStructures, type FeeStructure } from '@/services/financeService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { getAllClasses } from '@/services/classService';
import { useToast } from '@/hooks/use-toast';
import { formatAmount } from '@/lib/currency';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';

interface MasterInvoiceItem {
  feeStructureId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isMandatory: boolean;
}

const CreateMasterInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    academicYearId: '',
    term: 'TERM_1',
    scope: 'all', // all, class, grade
    classId: '',
    gradeLevel: '',
    dueDate: ''
  });

  const [items, setItems] = useState<MasterInvoiceItem[]>([
    {
      feeStructureId: 'none',
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      isMandatory: true
    }
  ]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (formData.academicYearId) {
      loadFeeStructures();
    }
  }, [formData.academicYearId, formData.classId]);

  const loadInitialData = async () => {
    try {
      const [academicYearsResponse, classesResponse] = await Promise.all([
        getAllAcademicYears(),
        getAllClasses()
      ]);

      if (academicYearsResponse?.success && academicYearsResponse.data?.academicYears) {
        const years = academicYearsResponse.data.academicYears;
        setAcademicYears(years);

        // Set current academic year as default
        const currentYear = years.find((y: any) => y.isCurrent);
        if (currentYear && !formData.academicYearId) {
          setFormData(prev => ({ ...prev, academicYearId: currentYear.id }));
        }
      }

      if (classesResponse?.success && classesResponse.data) {
        setClasses(Array.isArray(classesResponse.data) ? classesResponse.data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    }
  };

  const loadFeeStructures = async () => {
    try {
      const selectedAcademicYear = academicYears.find(y => y.id === formData.academicYearId);
      if (!selectedAcademicYear) return;

      const params: any = {
        isActive: true,
        academicYearId: selectedAcademicYear.id
      };

      // Filter by class level if class is selected
      if (formData.scope === 'class' && formData.classId) {
        const selectedClass = classes.find(c => c.id === formData.classId);
        if (selectedClass) {
          params.gradeLevel = selectedClass.level;
        }
      }

      const feesResponse = await getAllFeeStructures(params);

      if (feesResponse?.feeStructures) {
        setFeeStructures(feesResponse.feeStructures);
      }
    } catch (error) {
      console.error('Error loading fee structures:', error);
    }
  };

  const handleFeeStructureChange = (index: number, feeStructureId: string) => {
    const newItems = [...items];
    const feeStructure = feeStructures.find(f => f.id === feeStructureId);

    if (feeStructure) {
      newItems[index] = {
        feeStructureId,
        description: feeStructure.name,
        quantity: 1,
        unitPrice: Number(feeStructure.amount),
        amount: Number(feeStructure.amount),
        isMandatory: true
      };
    } else {
      newItems[index].feeStructureId = feeStructureId;
    }

    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof MasterInvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate amount if quantity or unitPrice changed
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].amount = newItems[index].quantity * newItems[index].unitPrice;
    }

    setItems(newItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        feeStructureId: 'none',
        description: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        isMandatory: true
      }
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a name for the master invoice',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.academicYearId) {
      toast({
        title: 'Validation Error',
        description: 'Please select an academic year',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.dueDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select a due date',
        variant: 'destructive'
      });
      return;
    }

    if (formData.scope === 'class' && !formData.classId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a class',
        variant: 'destructive'
      });
      return;
    }

    if (formData.scope === 'grade' && !formData.gradeLevel.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a grade level',
        variant: 'destructive'
      });
      return;
    }

    const validItems = items.filter(
      item => item.feeStructureId !== 'none' || item.description.trim()
    );

    if (validItems.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one fee item',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      const data: any = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        academicYearId: formData.academicYearId,
        term: formData.term,
        dueDate: formData.dueDate,
        items: validItems.map(item => ({
          feeStructureId: item.feeStructureId !== 'none' ? item.feeStructureId : undefined,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
          isMandatory: item.isMandatory
        }))
      };

      // Add scope-specific fields
      if (formData.scope === 'class') {
        data.classId = formData.classId;
        const selectedClass = classes.find(c => c.id === formData.classId);
        if (selectedClass) {
          data.gradeLevel = selectedClass.level;
        }
      } else if (formData.scope === 'grade') {
        data.gradeLevel = formData.gradeLevel;
      }

      const response = await createMasterInvoice(data);

      if (response?.success) {
        toast({
          title: 'Success',
          description: 'Master invoice created successfully'
        });
        navigate('/finance/master-invoices');
      } else {
        toast({
          title: 'Error',
          description: response?.message || 'Failed to create master invoice',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error creating master invoice:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create master invoice',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex items-center gap-4">
            <Button
              intent="cancel"
              onClick={() => navigate('/finance/master-invoices')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <PageTitle>Create Master Invoice</PageTitle>
              <PageDescription>
                Create an invoice template to generate bulk invoices for students
              </PageDescription>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Template Name *</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Primary 1 Term 1 Fees 2024/2025"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Optional description of this invoice template"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Academic Year *</Label>
                        <Select
                          value={formData.academicYearId}
                          onValueChange={(value) => setFormData({ ...formData, academicYearId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Term *</Label>
                        <Select
                          value={formData.term}
                          onValueChange={(value) => setFormData({ ...formData, term: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TERM_1">Term 1</SelectItem>
                            <SelectItem value="TERM_2">Term 2</SelectItem>
                            <SelectItem value="TERM_3">Term 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Due Date *</Label>
                      <Input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Scope */}
                <Card>
                  <CardHeader>
                    <CardTitle>Apply To</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Scope *</Label>
                      <Select
                        value={formData.scope}
                        onValueChange={(value) => setFormData({ ...formData, scope: value, classId: '', gradeLevel: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Students</SelectItem>
                          <SelectItem value="class">Specific Class</SelectItem>
                          <SelectItem value="grade">Grade Level</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.scope === 'class' && (
                      <div>
                        <Label>Class *</Label>
                        <Select
                          value={formData.classId}
                          onValueChange={(value) => setFormData({ ...formData, classId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {formData.scope === 'grade' && (
                      <div>
                        <Label>Grade Level *</Label>
                        <Input
                          value={formData.gradeLevel}
                          onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                          placeholder="e.g., Primary 1, JSS 1"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Fee Items */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Fee Items</CardTitle>
                      <Button type="button" intent="primary" size="sm" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {items.map((item, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Item {index + 1}</h4>
                          {items.length > 1 && (
                            <Button
                              type="button"
                              intent="danger"
                              size="sm"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <Label>Fee Structure</Label>
                            <Select
                              value={item.feeStructureId}
                              onValueChange={(value) => handleFeeStructureChange(index, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Custom Fee</SelectItem>
                                {feeStructures.map((fee) => (
                                  <SelectItem key={fee.id} value={fee.id}>
                                    {fee.name} - {formatAmount(Number(fee.amount), settings)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="col-span-2">
                            <Label>Description</Label>
                            <Input
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              placeholder="Fee description"
                            />
                          </div>

                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                            />
                          </div>

                          <div>
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div className="col-span-2">
                            <Label>Amount</Label>
                            <Input
                              type="number"
                              value={item.amount}
                              readOnly
                              className="bg-gray-50"
                            />
                          </div>

                          <div className="col-span-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={item.isMandatory}
                                onChange={(e) => handleItemChange(index, 'isMandatory', e.target.checked)}
                                className="rounded"
                              />
                              <span className="text-sm">Mandatory fee (cannot be removed per student)</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button
                    type="button"
                    intent="cancel"
                    onClick={() => navigate('/finance/master-invoices')}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    intent="primary"
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? 'Creating...' : 'Create Master Invoice'}
                  </Button>
                </div>
              </div>

              {/* Summary Sidebar */}
              <div>
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-600">Total Items</div>
                      <div className="text-2xl font-bold">{items.filter(i => i.description).length}</div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="text-sm text-gray-600">Total Amount</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {formatAmount(calculateTotal(), settings)}
                      </div>
                    </div>

                    {formData.scope !== 'all' && (
                      <div className="border-t pt-4">
                        <div className="text-sm text-gray-600">Applies To</div>
                        <div className="font-medium">
                          {formData.scope === 'class' && formData.classId
                            ? classes.find(c => c.id === formData.classId)?.name || 'Select a class'
                            : formData.scope === 'grade' && formData.gradeLevel
                            ? `Grade: ${formData.gradeLevel}`
                            : 'Not specified'}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4 text-xs text-gray-500">
                      After creating this template, you can generate individual invoices for students
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default CreateMasterInvoicePage;
