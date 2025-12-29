import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Users, CheckCircle2 } from 'lucide-react';
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
  Checkbox,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui';
import { 
  getMasterInvoiceById, 
  generateChildInvoices, 
  type MasterInvoice 
} from '@/services/financeService';
import { getStudents, type Student } from '@/services/studentService';
import { useToast } from '@/hooks/use-toast';
import { formatAmount } from '@/lib/currency';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';

const GenerateChildInvoicesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [invoice, setInvoice] = useState<MasterInvoice | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [sendEmailToParent, setSendEmailToParent] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // First, get the master invoice to know the filters
      const invoiceResponse = await getMasterInvoiceById(id!);
      
      console.log('Invoice Response:', invoiceResponse);

      if (!invoiceResponse?.success || !invoiceResponse.data) {
        toast({
          title: 'Error',
          description: invoiceResponse?.message || 'Failed to load master invoice',
          variant: 'destructive'
        });
        navigate('/finance/master-invoices');
        return;
      }

      setInvoice(invoiceResponse.data);

      // Now fetch students with appropriate filters
      const studentFilters: any = {
        status: 'ACTIVE',
        limit: 1000
      };

      // If master invoice has a specific class, filter by it
      if (invoiceResponse.data.classId) {
        studentFilters.class = invoiceResponse.data.classId;
      }

      const studentsResponse = await getStudents(studentFilters);
      
      console.log('Students Response:', studentsResponse);
      console.log('Student Filters Used:', studentFilters);

      if (studentsResponse?.success && studentsResponse.data) {
        const allStudents = studentsResponse.data.students || studentsResponse.data || [];
        
        console.log('All Students Count:', allStudents.length);
        if (allStudents.length > 0) {
          console.log('Sample Student Object:', allStudents[0]);
        }
        
        setStudents(allStudents);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load data',
        variant: 'destructive'
      });
      navigate('/finance/master-invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudents(new Set(students.map(s => s.id)));
    } else {
      setSelectedStudents(new Set());
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedStudents);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedStudents(newSelected);
    setSelectAll(newSelected.size === students.length);
  };

  const handleGenerate = async () => {
    if (selectedStudents.size === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one student',
        variant: 'destructive'
      });
      return;
    }

    if (!confirm(`Generate invoices for ${selectedStudents.size} student(s)?`)) {
      return;
    }

    try {
      setGenerating(true);
      const response = await generateChildInvoices(id!, {
        studentIds: Array.from(selectedStudents),
        applyToAll: false,
        sendEmailToParent,
      });

      if (response?.success) {
        toast({
          title: 'Success',
          description: `Successfully generated ${response.data?.generated || selectedStudents.size} invoice(s)`
        });
        navigate(`/finance/master-invoices/${id}`);
      } else {
        toast({
          title: 'Error',
          description: response?.message || 'Failed to generate invoices',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error generating invoices:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to generate invoices',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <PageContent>
            <div className="text-center py-12">Loading...</div>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  if (!invoice) {
    return (
      <Layout>
        <PageContainer>
          <PageContent>
            <div className="text-center py-12 text-gray-500">Master invoice not found</div>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                intent="cancel"
                onClick={() => navigate(`/finance/master-invoices/${id}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <PageTitle>Generate Invoices</PageTitle>
                <PageDescription>
                  Select students to generate invoices for: {invoice.name}
                </PageDescription>
              </div>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          {/* Summary Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Invoice Template</div>
                  <div className="font-medium">{invoice.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Amount</div>
                  <div className="font-semibold text-lg">
                    {formatAmount(Number(invoice.total), settings)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Eligible Students</div>
                  <div className="font-medium">{students.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Selected</div>
                  <div className="font-medium text-primary-600">{selectedStudents.size}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Students</CardTitle>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                    Select All ({students.length})
                  </label>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No eligible students found for this master invoice
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedStudents.has(student.id)}
                              onCheckedChange={(checked) => 
                                handleSelectStudent(student.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {student.admissionNumber}
                          </TableCell>
                          <TableCell>
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.currentClass?.name || 'N/A'}</TableCell>
                          <TableCell className="text-gray-600">{student.email || '-'}</TableCell>
                          <TableCell className="text-gray-600">{student.phone || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Email Option */}
                  <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sendEmailToParent"
                        checked={sendEmailToParent}
                        onCheckedChange={(checked) => setSendEmailToParent(checked as boolean)}
                      />
                      <label
                        htmlFor="sendEmailToParent"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Send invoices to parents/guardians via email immediately
                      </label>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 ml-6">
                      When checked, all generated invoices will be queued for email delivery to the students' guardians
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t">
                    <Button 
                      intent="cancel" 
                      className="w-full sm:w-auto"
                      onClick={() => navigate(`/finance/master-invoices/${id}`)}
                      disabled={generating}
                    >
                      Cancel
                    </Button>
                    <Button 
                      intent="primary" 
                      className="w-full sm:w-auto"
                      onClick={handleGenerate}
                      disabled={selectedStudents.size === 0 || generating}
                    >
                      {generating ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Generate {selectedStudents.size} Invoice{selectedStudents.size !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default GenerateChildInvoicesPage;
