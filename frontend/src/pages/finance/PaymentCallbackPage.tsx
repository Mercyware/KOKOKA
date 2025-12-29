import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPaystackPayment } from '@/services/financeService';
import { PageContainer, PageHeader, PageTitle, Card, Button } from '@/components/ui';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type PaymentStatus = 'verifying' | 'success' | 'failed';

const PaymentCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authState } = useAuth();
  const isAuthenticated = authState.isAuthenticated;
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const reference = searchParams.get('reference');

    if (!reference) {
      setStatus('failed');
      setErrorMessage('No payment reference found');
      return;
    }

    verifyPayment(reference);
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      const response = await verifyPaystackPayment(reference);

      if (response?.success && response.data) {
        setStatus('success');
        setPaymentDetails(response.data);
      } else {
        setStatus('failed');
        setErrorMessage(response?.message || 'Payment verification failed');
      }
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      setStatus('failed');
      setErrorMessage(error?.message || 'Failed to verify payment');
    }
  };

  const handleViewInvoice = () => {
    if (paymentDetails?.invoiceId) {
      navigate(`/finance/invoices/${paymentDetails.invoiceId}`);
    } else {
      navigate('/finance/invoices');
    }
  };

  const handleViewPayments = () => {
    navigate('/finance/payments');
  };

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>Payment Verification</PageTitle>
      </PageHeader>

      <div className="flex justify-center items-center min-h-[400px]">
        <Card className="max-w-md w-full p-8">
          {status === 'verifying' && (
            <div className="text-center">
              <Loader2 className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
              <p className="text-slate-600">
                Please wait while we verify your payment...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-emerald-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-slate-600 mb-6">
                Your payment has been verified and recorded successfully.
              </p>

              {paymentDetails && (
                <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
                  <div className="space-y-2 text-sm">
                    {paymentDetails.paymentNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Payment Number:</span>
                        <span className="font-medium">{paymentDetails.paymentNumber}</span>
                      </div>
                    )}
                    {paymentDetails.amount && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Amount:</span>
                        <span className="font-medium">
                          KSh {parseFloat(paymentDetails.amount).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {paymentDetails.invoice?.invoiceNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Invoice:</span>
                        <span className="font-medium">
                          {paymentDetails.invoice.invoiceNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Button intent="primary" onClick={handleViewInvoice} className="w-full">
                    View Invoice
                  </Button>
                  <Button intent="action" onClick={handleViewPayments} className="w-full">
                    View All Payments
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  <p>Thank you for your payment! A confirmation email has been sent.</p>
                </div>
              )}
            </div>
          )}

          {status === 'failed' && (
            <div className="text-center">
              <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-900 mb-2">
                Payment Verification Failed
              </h2>
              <p className="text-slate-600 mb-6">
                {errorMessage || 'We could not verify your payment. Please contact support.'}
              </p>

              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Button intent="primary" onClick={() => navigate('/finance/invoices')} className="w-full">
                    Back to Invoices
                  </Button>
                  <Button intent="action" onClick={handleViewPayments} className="w-full">
                    View Payments
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-slate-600">
                  <p>If you believe this is an error, please contact support.</p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
};

export default PaymentCallbackPage;
