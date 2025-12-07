import React, { useState } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { createPayment, type Invoice } from '@/services/financeService';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import { formatAmount } from '@/lib/currency';

interface RecordPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  invoice: Invoice;
  onPaymentRecorded: () => void;
}

export const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({
  open,
  onClose,
  invoice,
  onPaymentRecorded,
}) => {
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: invoice.balance.toString(),
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: '',
  });

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

    try {
      setLoading(true);
      await createPayment({
        invoiceId: invoice.id,
        amount,
        paymentMethod: formData.paymentMethod as any,
        paymentDate: formData.paymentDate,
        referenceNumber: formData.referenceNumber || undefined,
        notes: formData.notes || undefined,
      });

      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });

      onPaymentRecorded();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record payment',
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
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Invoice: {invoice.invoiceNumber} - Balance: {formatAmount(Number(invoice.balance), settings.currency.code)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
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
            </div>

            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" intent="cancel" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" intent="primary" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
