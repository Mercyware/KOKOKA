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
import { createTransaction, type InventoryItem } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

interface TransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: InventoryItem;
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({
  open,
  onClose,
  onSuccess,
  item,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transactionType: 'ISSUE',
    quantity: 0,
    unitPrice: item.unitPrice,
    referenceNumber: '',
    supplierName: '',
    recipientName: '',
    recipientType: '',
    reason: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.quantity || formData.quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      await createTransaction({
        ...formData,
        itemId: item.id,
      });

      toast({
        title: 'Success',
        description: 'Transaction recorded successfully',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create transaction',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Transaction</DialogTitle>
          <DialogDescription>
            Record a transaction for {item.name} (Current Stock: {item.quantity} {item.unit})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Select value={formData.transactionType} onValueChange={(value) => setFormData({ ...formData, transactionType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE">Purchase (Add Stock)</SelectItem>
                  <SelectItem value="ISSUE">Issue (Remove Stock)</SelectItem>
                  <SelectItem value="RETURN">Return (Add Stock)</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  <SelectItem value="WRITE_OFF">Write Off</SelectItem>
                  <SelectItem value="TRANSFER">Transfer</SelectItem>
                  <SelectItem value="DONATION">Donation (Add Stock)</SelectItem>
                  <SelectItem value="DISPOSAL">Disposal (Remove Stock)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="unitPrice">Unit Price</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="e.g., PO-2025-0001"
              />
            </div>

            {(formData.transactionType === 'PURCHASE' || formData.transactionType === 'DONATION') && (
              <div>
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input
                  id="supplierName"
                  value={formData.supplierName}
                  onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                />
              </div>
            )}

            {(formData.transactionType === 'ISSUE' || formData.transactionType === 'TRANSFER') && (
              <>
                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="recipientType">Recipient Type</Label>
                  <Select value={formData.recipientType} onValueChange={(value) => setFormData({ ...formData, recipientType: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="TEACHER">Teacher</SelectItem>
                      <SelectItem value="STAFF">Staff</SelectItem>
                      <SelectItem value="DEPARTMENT">Department</SelectItem>
                      <SelectItem value="CLASS">Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {formData.transactionType === 'ADJUSTMENT' && (
              <div className="col-span-2">
                <Label htmlFor="reason">Reason for Adjustment</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Stock count correction"
                />
              </div>
            )}

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
              <Button intent="cancel" onClick={onClose} type="button" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button intent="primary" type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Recording...' : 'Record Transaction'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;
