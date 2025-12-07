import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ArrowLeft, Users, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  RadioGroup,
  RadioGroupItem,
  SearchableSelect,
} from '@/components/ui';
import { createInvoice, getAllFeeStructures, type FeeStructure } from '@/services/financeService';
import { getStudents } from '@/services/studentService';
import { getAllClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import { formatAmount } from '@/lib/currency';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  admissionNumber: string;
}

interface Class {
  id: string;
  name: string;
  level: string;
}

interface AcademicYear {
  id: string;
  name: string;
}

interface InvoiceItem {
  feeStructureId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

const CreateInvoicePage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  // Invoice type: 'single' or 'class'
  const [invoiceType, setInvoiceType] = useState<'single' | 'class'>('single');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const [formData, setFormData] = useState({
    studentId: '',
    academicYear: '',
    term: 'TERM_1',
    dueDate: '',
    notes: '',
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      feeStructureId: 'none',
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    },
  ]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      loadStudentsByClass(selectedClassId);
    }
  }, [selectedClassId]);

  // Load fee structures when academic year or class changes
  useEffect(() => {
    if (formData.academicYear) {
      loadFeeStructures();
    }
  }, [formData.academicYear, selectedClassId]);

  const loadInitialData = async () => {
    try {
      const [classesResponse, academicYearsResponse] = await Promise.all([
        getAllClasses(),
        getAllAcademicYears(),
      ]);

      if (classesResponse?.success && classesResponse.data) {
        setClasses(Array.isArray(classesResponse.data) ? classesResponse.data : []);
      }

      if (academicYearsResponse?.success && academicYearsResponse.data?.academicYears) {
        const years = academicYearsResponse.data.academicYears;
        setAcademicYears(years);

        // Set the first academic year as default if no year is selected
        if (years.length > 0 && !formData.academicYear) {
          setFormData(prev => ({ ...prev, academicYear: years[0].name }));
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    }
  };

  const loadFeeStructures = async () => {
    try {
      // Find academicYearId from academicYear name
      const selectedAcademicYear = academicYears.find(y => y.name === formData.academicYear);
      if (!selectedAcademicYear) return;

      // Find the selected class to get its ID
      const selectedClass = selectedClassId ? classes.find(c => c.id === selectedClassId) : null;

      const params: any = {
        isActive: true,
        academicYearId: selectedAcademicYear.id,
      };

      // Add gradeLevel filter if a class is selected
      if (selectedClass) {
        params.gradeLevel = selectedClass.id;
      }

      const feesResponse = await getAllFeeStructures(params);

      // Fee structures API returns array directly, not wrapped in { success, data }
      if (feesResponse) {
        if (Array.isArray(feesResponse)) {
          setFeeStructures(feesResponse);
        } else if (feesResponse?.success && feesResponse.data) {
          setFeeStructures(Array.isArray(feesResponse.data) ? feesResponse.data : []);
        }
      }
    } catch (error) {
      console.error('Error loading fee structures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fee structures',
        variant: 'destructive',
      });
    }
  };

  const loadStudentsByClass = async (classId: string) => {
    try {
      const studentsResponse = await getStudents({ class: classId, limit: 1000 });

      if (studentsResponse?.success && studentsResponse.data) {
        setStudents(Array.isArray(studentsResponse.data) ? studentsResponse.data : []);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    }
  };

  const handleFeeStructureChange = (index: number, feeStructureId: string) => {
    const newItems = [...items];
    const feeStructure = feeStructures.find((f) => f.id === feeStructureId);

    if (feeStructure) {
      newItems[index] = {
        feeStructureId,
        description: feeStructure.name,
        quantity: 1,
        unitPrice: Number(feeStructure.amount),
        amount: Number(feeStructure.amount),
      };
    } else {
      newItems[index].feeStructureId = feeStructureId;
    }

    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
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
      },
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

    if (!formData.dueDate) {
      toast({
        title: 'Validation Error',
        description: 'Please select a due date',
        variant: 'destructive',
      });
      return;
    }

    if (items.some((item) => !item.feeStructureId || item.feeStructureId === 'none')) {
      toast({
        title: 'Validation Error',
        description: 'Please select a fee structure for all items',
        variant: 'destructive',
      });
      return;
    }

    // Validate based on invoice type
    if (invoiceType === 'single') {
      if (!formData.studentId) {
        toast({
          title: 'Validation Error',
          description: 'Please select a student',
          variant: 'destructive',
        });
        return;
      }
      await createSingleInvoice();
    } else {
      if (!selectedClassId) {
        toast({
          title: 'Validation Error',
          description: 'Please select a class',
          variant: 'destructive',
        });
        return;
      }
      await createBulkInvoices();
    }
  };

  const createSingleInvoice = async () => {
    try {
      setLoading(true);
      await createInvoice({
        ...formData,
        items: items.map((item) => ({
          feeStructureId: item.feeStructureId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      });

      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });

      navigate('/finance/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createBulkInvoices = async () => {
    try {
      setLoading(true);

      if (students.length === 0) {
        toast({
          title: 'Error',
          description: 'No students found in the selected class',
          variant: 'destructive',
        });
        return;
      }

      const invoiceItems = items.map((item) => ({
        feeStructureId: item.feeStructureId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
      }));

      // Create invoices in batches of 10 for better performance
      const batchSize = 10;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);

        const promises = batch.map((student) =>
          createInvoice({
            studentId: student.id,
            academicYear: formData.academicYear,
            term: formData.term,
            dueDate: formData.dueDate,
            notes: formData.notes,
            items: invoiceItems,
          })
        );

        const results = await Promise.allSettled(promises);

        results.forEach((result) => {
          if (result.status === 'fulfilled') {
            successCount++;
          } else {
            errorCount++;
            console.error('Failed to create invoice:', result.reason);
          }
        });

        // Update progress
        toast({
          title: 'Progress',
          description: `Created ${successCount} of ${students.length} invoices...`,
        });
      }

      toast({
        title: 'Completed',
        description: `Successfully created ${successCount} invoices${errorCount > 0 ? `. ${errorCount} failed.` : ''}`,
        variant: errorCount > 0 ? 'destructive' : 'default',
      });

      navigate('/finance/invoices');
    } catch (error) {
      console.error('Error creating bulk invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/finance/invoices')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Invoices
            </Button>
            <PageTitle>Create Invoice</PageTitle>
            <PageDescription>Generate invoices for students</PageDescription>
          </div>
        </PageHeader>

        <PageContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Invoice Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={invoiceType}
                    onValueChange={(value: 'single' | 'class') => {
                      setInvoiceType(value);
                      setFormData({ ...formData, studentId: '' });
                      setSelectedClassId('');
                      setStudents([]);
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <RadioGroupItem value="single" id="single" />
                      <Label htmlFor="single" className="flex items-center cursor-pointer">
                        <User className="h-4 w-4 mr-2 text-primary" />
                        Single Student Invoice
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="class" id="class" />
                      <Label htmlFor="class" className="flex items-center cursor-pointer">
                        <Users className="h-4 w-4 mr-2 text-secondary" />
                        Bulk Class Invoice
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Invoice Details Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {invoiceType === 'class' ? (
                      <>
                        <div>
                          <Label htmlFor="class">Class *</Label>
                          <Select
                            value={selectedClassId}
                            onValueChange={setSelectedClassId}
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
                          {selectedClassId && students.length > 0 && (
                            <p className="text-sm text-slate-600 mt-1">
                              {students.length} student(s) will receive this invoice
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="classFilter">Filter by Class (Optional)</Label>
                          <Select
                            value={selectedClassId}
                            onValueChange={setSelectedClassId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select class to filter students" />
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

                        <div>
                          <Label htmlFor="student">Student *</Label>
                          <Select
                            value={formData.studentId}
                            onValueChange={(value) =>
                              setFormData({ ...formData, studentId: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                            <SelectContent>
                              {students.length === 0 ? (
                                <div className="px-2 py-1 text-sm text-slate-500">
                                  {selectedClassId ? 'Loading students...' : 'Select a class first'}
                                </div>
                              ) : (
                                students.map((student) => (
                                  <SelectItem key={student.id} value={student.id}>
                                    {student.firstName} {student.lastName} ({student.admissionNumber})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="academicYear">Academic Year *</Label>
                      <Select
                        value={formData.academicYear}
                        onValueChange={(value) => setFormData({ ...formData, academicYear: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.name}>
                              {year.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="term">Term *</Label>
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

                    <div>
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData({ ...formData, dueDate: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        type="text"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Optional notes for this invoice"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Items Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Invoice Items</CardTitle>
                    <Button type="button" intent="action" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-slate-200 rounded-lg bg-slate-50"
                      >
                        <div className="md:col-span-4">
                          <Label>Fee Structure *</Label>
                          <SearchableSelect
                            value={item.feeStructureId === 'none' ? '' : item.feeStructureId}
                            onValueChange={(value) => handleFeeStructureChange(index, value || 'none')}
                            placeholder="Select fee structure"
                            searchPlaceholder="Search fee structures..."
                            emptyMessage="No fee structures found"
                            options={feeStructures.map((fee) => ({
                              value: fee.id,
                              label: `${fee.name} - ${formatAmount(Number(fee.amount), settings.currency.code)} (${fee.frequency})`,
                            }))}
                          />
                        </div>

                        <div className="md:col-span-3">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(index, 'description', e.target.value)
                            }
                            placeholder="Description"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)
                            }
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>

                        <div className="md:col-span-1 flex items-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="md:col-span-12">
                          <div className="text-sm font-semibold text-slate-700">
                            Amount: {formatAmount(item.amount, settings.currency.code)}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-end pt-4 border-t border-slate-200">
                      <div className="text-right">
                        <div className="text-sm text-slate-600">
                          Total Amount {invoiceType === 'class' && students.length > 0 && `per student`}
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {formatAmount(calculateTotal(), settings.currency.code)}
                        </div>
                        {invoiceType === 'class' && students.length > 0 && (
                          <div className="text-sm text-slate-600 mt-1">
                            Total for all students: {formatAmount(calculateTotal() * students.length, settings.currency.code)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  type="button"
                  intent="cancel"
                  className="w-full sm:w-auto"
                  onClick={() => navigate('/finance/invoices')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  intent="primary"
                  className="w-full sm:w-auto"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : invoiceType === 'class' ? `Create ${students.length} Invoices` : 'Create Invoice'}
                </Button>
              </div>
            </div>
          </form>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default CreateInvoicePage;
