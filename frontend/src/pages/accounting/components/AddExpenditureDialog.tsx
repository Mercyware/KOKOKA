import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { useToast } from '@/hooks/use-toast';
import { getCategories, createExpenditureTransaction, type AccountingCategory } from '@/services/accountingService';

interface AddExpenditureDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddExpenditureDialog: React.FC<AddExpenditureDialogProps> = ({ open, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<AccountingCategory[]>([]);
  const [formData, setFormData] = useState({
    categoryId: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    payee: '',
    paymentMethod: 'CASH',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const response = await getCategories({ type: 'EXPENDITURE' });
      setCategories(response.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId || !formData.amount || !formData.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createExpenditureTransaction({
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        date: formData.date,
        description: formData.description,
        payee: formData.payee || undefined,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        notes: formData.notes || undefined,
      });

      toast({
        title: 'Success',
        description: 'Expenditure transaction created successfully',
      });

      // Reset form
      setFormData({
        categoryId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        payee: '',
        paymentMethod: 'CASH',
        reference: '',
        notes: '',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating expenditure:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create expenditure transaction',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Expenditure Transaction</DialogTitle>
          <DialogDescription>
            Record a new expense or payment transaction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <Label htmlFor="categoryId">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleChange('categoryId', value)}>
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div>
              <Label htmlFor="amount">
                Amount <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                required
              />
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date">
                Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                required
              />
            </div>

            {/* Payee/Recipient */}
            <div>
              <Label htmlFor="payee">
                Payee/Recipient <span className="text-red-500">*</span>
              </Label>
              <Input
                id="payee"
                type="text"
                placeholder="e.g., ABC Supplies"
                value={formData.payee}
                onChange={(e) => handleChange('payee', e.target.value)}
                required
              />
            </div>

            {/* Payment Method */}
            <div>
              <Label htmlFor="paymentMethod">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => handleChange('paymentMethod', value)}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reference */}
            <div>
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                type="text"
                placeholder="e.g., INV-2024-001"
                value={formData.reference}
                onChange={(e) => handleChange('reference', e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Describe the expense..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" intent="cancel" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" intent="primary" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Expenditure
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenditureDialog;
