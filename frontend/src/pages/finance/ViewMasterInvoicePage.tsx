import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, DollarSign, Users, Edit, Trash2, FileText, Send } from 'lucide-react';
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
  StatusBadge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui';
import { getMasterInvoiceById, deleteMasterInvoice, type MasterInvoice } from '@/services/financeService';
import { useToast } from '@/hooks/use-toast';
import { formatAmount } from '@/lib/currency';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';

const ViewMasterInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<MasterInvoice | null>(null);

  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      const response = await getMasterInvoiceById(id!);

      if (response?.success && response.data) {
        setInvoice(response.data);
      } else {
        toast({
          title: 'Error',
          description: response?.message || 'Failed to load master invoice',
          variant: 'destructive'
        });
        navigate('/finance/master-invoices');
      }
    } catch (error: any) {
      console.error('Error loading master invoice:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load master invoice',
        variant: 'destructive'
      });
      navigate('/finance/master-invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!invoice) return;

    if (!confirm(`Are you sure you want to delete "${invoice.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await deleteMasterInvoice(invoice.id);

      if (response?.success) {
        toast({
          title: 'Success',
          description: 'Master invoice deleted successfully'
        });
        navigate('/finance/master-invoices');
      } else {
        toast({
          title: 'Error',
          description: response?.message || 'Failed to delete master invoice',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete master invoice',
        variant: 'destructive'
      });
    }
  };

  const getScopeDisplay = () => {
    if (!invoice) return '';
    if (invoice.class) {
      return invoice.class.name;
    } else if (invoice.gradeLevel) {
      return `Grade: ${invoice.gradeLevel}`;
    } else {
      return 'All Students';
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
                onClick={() => navigate('/finance/master-invoices')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <PageTitle>{invoice.name}</PageTitle>
                <PageDescription>Master Invoice Details</PageDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                intent="primary"
                onClick={() => navigate(`/finance/master-invoices/${invoice.id}/generate`)}
              >
                <Send className="h-4 w-4 mr-2" />
                Generate Invoices
              </Button>
              <Button
                intent="action"
                onClick={() => navigate(`/finance/master-invoices/${invoice.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                intent="danger"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          {/* Overview Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <StatusBadge variant={invoice.isActive ? 'success' : 'danger'}>
                    {invoice.isActive ? 'Active' : 'Inactive'}
                  </StatusBadge>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Academic Year</div>
                  <div className="font-medium">{invoice.academicYear?.name || 'N/A'}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Term</div>
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {invoice.term.replace('TERM_', 'Term ')}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Scope</div>
                  <div className="font-medium">{getScopeDisplay()}</div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Due Date</div>
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Amount</div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    {formatAmount(Number(invoice.total), settings)}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Generated Invoices</div>
                  <div className="font-semibold text-lg flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className={invoice._count?.childInvoices > 0 ? 'text-primary-600' : ''}>
                      {invoice._count?.childInvoices || 0}
                    </span>
                  </div>
                  {invoice._count?.childInvoices === 0 && (
                    <div className="text-xs text-gray-500 mt-1">Click "Generate Invoices" to create</div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">Created</div>
                  <div className="font-medium">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {invoice.description && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-600 mb-2">Description</div>
                  <div className="text-gray-800">{invoice.description}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Fee Structure</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Mandatory</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.feeStructure?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {item.feeStructure?.category || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatAmount(Number(item.unitPrice), settings)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(Number(item.amount), settings)}
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge variant={item.isMandatory ? 'warning' : 'default'}>
                            {item.isMandatory ? 'Yes' : 'No'}
                          </StatusBadge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Totals */}
              {invoice.items && invoice.items.length > 0 && (
                <div className="mt-6 flex justify-end">
                  <div className="w-full md:w-1/2 lg:w-1/3 space-y-2">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">
                        {formatAmount(Number(invoice.subtotal), settings)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-semibold">
                        {formatAmount(Number(invoice.tax), settings)}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 border-t border-gray-200">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold text-primary-600">
                        {formatAmount(Number(invoice.total), settings)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Child Invoices */}
          {invoice.childInvoices && invoice.childInvoices.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Generated Invoices ({invoice.childInvoices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Admission No.</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.childInvoices.map((childInvoice) => (
                      <TableRow key={childInvoice.id}>
                        <TableCell className="font-medium">
                          {childInvoice.invoiceNumber}
                        </TableCell>
                        <TableCell>
                          {childInvoice.student?.firstName} {childInvoice.student?.lastName}
                        </TableCell>
                        <TableCell>
                          {childInvoice.student?.admissionNumber}
                        </TableCell>
                        <TableCell>
                          <StatusBadge 
                            variant={
                              childInvoice.status === 'PAID' ? 'success' :
                              childInvoice.status === 'PARTIALLY_PAID' ? 'warning' :
                              childInvoice.status === 'OVERDUE' ? 'danger' : 'default'
                            }
                          >
                            {childInvoice.status.replace('_', ' ')}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(Number(childInvoice.total), settings)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatAmount(Number(childInvoice.amountPaid), settings)}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatAmount(Number(childInvoice.balance), settings)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            intent="action"
                            size="sm"
                            onClick={() => navigate(`/finance/invoices/${childInvoice.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default ViewMasterInvoicePage;
