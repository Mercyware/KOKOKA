import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from '@/components/ui';
import { initializePaystackPayment, type Invoice } from '@/services/financeService';
import { getPaymentGatewaySettings } from '@/services/settingsService';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import { formatAmount } from '@/lib/currency';
import { ExternalLink, AlertCircle } from 'lucide-react';

interface PaystackPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  onPaymentInitiated: () => void;
}

export const PaystackPaymentDialog: React.FC<PaystackPaymentDialogProps> = ({
  open,
  onClose,
  invoice,
  onPaymentInitiated,
}) => {
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(false);
  const [paystackEnabled, setPaystackEnabled] = useState(true);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [formData, setFormData] = useState({
    amount: invoice.balance.toString(),
    email: invoice.student?.email || '',
  });

  useEffect(() => {
    if (open) {
      checkPaystackConfiguration();
    }
  }, [open]);

  const checkPaystackConfiguration = async () => {
    try {
      setCheckingConfig(true);
      const response = await getPaymentGatewaySettings();

      if (response?.success && response.data?.paystack) {
        setPaystackEnabled(response.data.paystack.enabled);
      } else {
        setPaystackEnabled(false);
      }
    } catch (error) {
      console.error('Error checking Paystack configuration:', error);
      setPaystackEnabled(false);
    } finally {
      setCheckingConfig(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: 'Error',
        description: 'Amount must be greater than zero',
        variant: 'destructive',
      });
      return;
    }

    if (amount > Number(invoice.balance)) {
      toast({
        title: 'Error',
        description: `Amount cannot exceed balance (${formatAmount(Number(invoice.balance), settings.currency.code)})`,
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email) {
      toast({
        title: 'Error',
        description: 'Email is required for online payment',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await initializePaystackPayment({
        invoiceId: invoice.id,
        amount,
        email: formData.email,
      });

      if (response?.success && response.data?.authorization_url) {
        // Redirect to Paystack payment page in the same window
        window.location.href = response.data.authorization_url;
      } else {
        toast({
          title: 'Error',
          description: 'Failed to initialize payment',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error initializing payment:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Failed to initialize payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Online with Paystack</DialogTitle>
          <DialogDescription>
            Invoice: {invoice.invoiceNumber} - Balance: {formatAmount(Number(invoice.balance), settings.currency.code)}
          </DialogDescription>
        </DialogHeader>

        {checkingConfig ? (
          <div className="py-8 text-center text-slate-600">
            Checking payment gateway configuration...
          </div>
        ) : !paystackEnabled ? (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-900 mb-1">
                    Paystack Not Configured
                  </h4>
                  <p className="text-sm text-amber-800">
                    Online payment is currently unavailable. Please contact the administrator to configure Paystack.
                  </p>
                  <div className="mt-3 text-xs text-amber-700 bg-amber-100 rounded p-2">
                    <strong>Administrator:</strong> Add the following to your .env file:
                    <pre className="mt-1 font-mono">
PAYSTACK_SECRET_KEY=sk_test_your_secret_key{'\n'}
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key
                    </pre>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" intent="cancel" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  You will be redirected to Paystack's secure payment page to complete your payment.
                </p>
              </div>

              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={Number(invoice.balance)}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
                <p className="text-sm text-slate-600 mt-1">
                  Partial payments are allowed
                </p>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Payment receipt will be sent here"
                  required
                />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" intent="cancel" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" intent="primary" disabled={loading}>
                <ExternalLink className="h-4 w-4 mr-2" />
                {loading ? 'Initializing...' : 'Pay with Paystack'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
