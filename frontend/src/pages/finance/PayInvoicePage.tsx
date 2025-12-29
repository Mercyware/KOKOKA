import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from '@/components/ui';
import { getInvoiceById, initializePaystackPayment, type Invoice } from '@/services/financeService';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import { toast } from 'react-hot-toast';

export default function PayInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSchoolSettings();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const data = await getInvoiceById(id!);
      setInvoice(data);
    } catch (error: any) {
      console.error('Error fetching invoice:', error);
      toast.error(error.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePayOnline = async () => {
    if (!invoice) return;

    try {
      setProcessing(true);
      // Initialize Paystack payment
      const response = await initializePaystackPayment({
        invoiceId: invoice.id,
        amount: invoice.balance,
        email: invoice.student.email || '', // Student's email for payment receipt
      });

      // Redirect to Paystack checkout
      if (response.data?.authorization_url) {
        window.location.href = response.data.authorization_url;
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <PageContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </PageContent>
      </PageContainer>
    );
  }

  if (!invoice) {
    return (
      <PageContainer>
        <PageContent>
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Not Found</h3>
              <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist or has been removed.</p>
              <Button intent="primary" onClick={() => navigate('/finance/invoices')}>
                Back to Invoices
              </Button>
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    );
  }

  // Extract currency symbol - settings.currency might be an object or string
  const currencySymbol = typeof settings?.currency === 'object' 
    ? settings.currency.symbol 
    : (settings?.currency || invoice.school?.currency || '₦');

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Pay Invoice</PageTitle>
        <PageDescription>
          Complete payment for {invoice.invoiceNumber}
        </PageDescription>
      </PageHeader>

      <PageContent>
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Invoice Number</p>
                  <p className="font-semibold">{invoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Student</p>
                  <p className="font-semibold">
                    {invoice.student.firstName} {invoice.student.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{invoice.student.admissionNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Invoice Date</p>
                  <p className="font-semibold">
                    {new Date(invoice.invoiceDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="font-semibold">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="font-semibold text-lg">
                    {currencySymbol}{parseFloat(invoice.total.toString()).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount Due</p>
                  <p className="font-semibold text-lg text-red-600">
                    {currencySymbol}{parseFloat(invoice.balance.toString()).toFixed(2)}
                  </p>
                </div>
              </div>

              {invoice.balance <= 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">✓ This invoice has been fully paid</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Options */}
          {invoice.balance > 0 && (
            <>
              {/* Online Payment */}
              {invoice.school?.enableOnlinePayment && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pay Online</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Pay securely using your debit card, credit card, or bank account.
                    </p>
                    <Button
                      intent="primary"
                      onClick={handlePayOnline}
                      disabled={processing}
                      className="w-full sm:w-auto"
                    >
                      {processing ? 'Processing...' : `Pay ${currencySymbol}${parseFloat(invoice.balance.toString()).toFixed(2)} Now`}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Bank Transfer */}
              {invoice.school?.bankName && (
                <Card>
                  <CardHeader>
                    <CardTitle>Bank Transfer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-gray-600 mb-4">
                      Make a bank transfer to the following account:
                    </p>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      {invoice.school?.bankName && (
                        <div>
                          <p className="text-sm text-gray-600">Bank Name</p>
                          <p className="font-semibold">{invoice.school.bankName}</p>
                        </div>
                      )}
                      {invoice.school?.accountNumber && (
                        <div>
                          <p className="text-sm text-gray-600">Account Number</p>
                          <p className="font-semibold font-mono text-lg">{invoice.school.accountNumber}</p>
                        </div>
                      )}
                      {invoice.school?.accountName && (
                        <div>
                          <p className="text-sm text-gray-600">Account Name</p>
                          <p className="font-semibold">{invoice.school.accountName}</p>
                        </div>
                      )}
                      {invoice.school?.bankBranch && (
                        <div>
                          <p className="text-sm text-gray-600">Branch</p>
                          <p className="font-semibold">{invoice.school.bankBranch}</p>
                        </div>
                      )}
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Important:</strong> Please use <strong>{invoice.invoiceNumber}</strong> as your payment reference.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              intent="cancel"
              onClick={() => navigate(`/finance/invoices/${invoice.id}`)}
            >
              View Invoice Details
            </Button>
            <Button
              intent="action"
              onClick={() => navigate('/finance/invoices')}
            >
              Back to Invoices
            </Button>
          </div>
        </div>
      </PageContent>
    </PageContainer>
  );
}
