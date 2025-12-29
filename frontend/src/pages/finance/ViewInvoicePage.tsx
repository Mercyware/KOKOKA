import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Mail, CreditCard, Banknote } from 'lucide-react';
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
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { getInvoiceById, sendInvoiceEmail, downloadInvoicePDF, type Invoice } from '@/services/financeService';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import { formatAmount } from '@/lib/currency';
import { RecordPaymentDialog } from './components/RecordPaymentDialog';
import { PaystackPaymentDialog } from './components/PaystackPaymentDialog';

const ViewInvoicePage: React.FC = () => {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [paystackPaymentOpen, setPaystackPaymentOpen] = useState(false);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      const response = await getInvoiceById(invoiceId);

      if (response?.success && response.data) {
        setInvoice(response.data);
      } else if (response) {
        // API returns invoice directly
        setInvoice(response as any);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to load invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-slate-100 text-slate-800',
      ISSUED: 'bg-blue-100 text-blue-800',
      PARTIALLY_PAID: 'bg-yellow-100 text-yellow-800',
      PAID: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge className={styles[status] || 'bg-slate-100 text-slate-800'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!invoice) return;
    const pdfUrl = downloadInvoicePDF(invoice.id);
    window.open(pdfUrl, '_blank');
  };

  const handleSendEmail = async () => {
    if (!invoice) return;

    try {
      setSending(true);
      const response = await sendInvoiceEmail(invoice.id, 'student');

      if (response?.success) {
        toast({
          title: 'Success',
          description: `Invoice sent to ${response.data.recipient}`,
        });
      } else {
        toast({
          title: 'Error',
          description: response?.message || 'Failed to send invoice',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error sending invoice:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to send invoice',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <PageContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-slate-600">Loading invoice...</div>
            </div>
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
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-slate-600 mb-4">Invoice not found</div>
              <Button onClick={() => navigate('/finance/invoices')}>
                Back to Invoices
              </Button>
            </div>
          </PageContent>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex items-center justify-between w-full">
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
              <PageTitle>Invoice {invoice.invoiceNumber}</PageTitle>
              <PageDescription>
                {invoice.student?.firstName} {invoice.student?.lastName} - {invoice.academicYear} {invoice.term}
              </PageDescription>
            </div>
            <div className="flex gap-2 print:hidden">
              {Number(invoice.balance) > 0 && (
                <>
                  <Button intent="primary" size="sm" onClick={() => setPaystackPaymentOpen(true)}>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay Online
                  </Button>
                  <Button intent="action" size="sm" onClick={() => setRecordPaymentOpen(true)}>
                    <Banknote className="h-4 w-4 mr-2" />
                    Record Payment
                  </Button>
                </>
              )}
              <Button intent="action" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button intent="action" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button 
                intent="action" 
                size="sm" 
                onClick={handleSendEmail}
                disabled={sending}
              >
                <Mail className="h-4 w-4 mr-2" />
                {sending ? 'Sending...' : 'Email'}
              </Button>
            </div>
          </div>
        </PageHeader>

        <PageContent>
          <div className="max-w-4xl mx-auto">
            {/* Invoice Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-2">Invoice Details</h3>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-slate-600">Invoice #:</span>{' '}
                        <span className="font-medium">{invoice.invoiceNumber}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-600">Status:</span>{' '}
                        {getStatusBadge(invoice.status)}
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-600">Issue Date:</span>{' '}
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-600">Due Date:</span>{' '}
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-slate-600 mb-2">Student Details</h3>
                    <div className="space-y-1">
                      <div className="text-sm">
                        <span className="text-slate-600">Name:</span>{' '}
                        <span className="font-medium">
                          {invoice.student?.firstName} {invoice.student?.lastName}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-600">Admission #:</span>{' '}
                        {invoice.student?.admissionNumber}
                      </div>
                      {invoice.student?.currentClass && (
                        <div className="text-sm">
                          <span className="text-slate-600">Class:</span>{' '}
                          {invoice.student.currentClass.name}
                        </div>
                      )}
                      <div className="text-sm">
                        <span className="text-slate-600">Academic Year:</span>{' '}
                        {invoice.academicYear}
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-600">Term:</span> {invoice.term}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.description}</div>
                          {item.feeStructure && (
                            <div className="text-sm text-slate-500">
                              {item.feeStructure.name}
                              {item.feeStructure.category && ` - ${item.feeStructure.category}`}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatAmount(Number(item.unitPrice), settings.currency.code)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatAmount(Number(item.amount), settings.currency.code)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 border-t pt-4">
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal:</span>
                        <span>{formatAmount(Number(invoice.subtotal), settings.currency.code)}</span>
                      </div>
                      {Number(invoice.discount) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Discount:</span>
                          <span className="text-red-600">
                            -{formatAmount(Number(invoice.discount), settings.currency.code)}
                          </span>
                        </div>
                      )}
                      {Number(invoice.tax) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Tax:</span>
                          <span>{formatAmount(Number(invoice.tax), settings.currency.code)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>{formatAmount(Number(invoice.total), settings.currency.code)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Amount Paid:</span>
                        <span className="text-green-600">
                          {formatAmount(Number(invoice.amountPaid), settings.currency.code)}
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Balance Due:</span>
                        <span className={Number(invoice.balance) > 0 ? 'text-red-600' : 'text-green-600'}>
                          {formatAmount(Number(invoice.balance), settings.currency.code)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.paymentNumber}</TableCell>
                          <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                          <TableCell>{payment.paymentMethod.replace('_', ' ')}</TableCell>
                          <TableCell>{payment.referenceNumber || '-'}</TableCell>
                          <TableCell className="text-right">
                            {formatAmount(Number(payment.amount), settings.currency.code)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                payment.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-800'
                                  : payment.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {invoice.notes && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{invoice.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </PageContent>
      </PageContainer>

      {/* Payment Dialogs */}
      {invoice && (
        <>
          <RecordPaymentDialog
            open={recordPaymentOpen}
            onClose={() => setRecordPaymentOpen(false)}
            invoice={invoice}
            onPaymentRecorded={loadInvoice}
          />
          <PaystackPaymentDialog
            open={paystackPaymentOpen}
            onClose={() => setPaystackPaymentOpen(false)}
            invoice={invoice}
            onPaymentInitiated={loadInvoice}
          />
        </>
      )}
    </Layout>
  );
};

export default ViewInvoicePage;
