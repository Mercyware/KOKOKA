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
import { createAllocation, type InventoryItem } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

interface AllocationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: InventoryItem;
}

const AllocationDialog: React.FC<AllocationDialogProps> = ({
  open,
  onClose,
  onSuccess,
  item,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: 0,
    allocatedTo: '',
    allocatedToType: 'STUDENT',
    expectedReturn: '',
    issuedCondition: 'GOOD',
    purpose: '',
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

    if (!formData.allocatedTo) {
      toast({
        title: 'Validation Error',
        description: 'Please enter the recipient name',
        variant: 'destructive',
      });
      return;
    }

    if (formData.quantity > item.quantity) {
      toast({
        title: 'Validation Error',
        description: 'Insufficient stock available',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      await createAllocation({
        ...formData,
        itemId: item.id,
        status: 'ALLOCATED',
      });

      toast({
        title: 'Success',
        description: 'Item allocated successfully',
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating allocation:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to create allocation',
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
          <DialogTitle>Allocate Item</DialogTitle>
          <DialogDescription>
            Allocate {item.name} (Available: {item.quantity} {item.unit})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                max={item.quantity}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Max available: {item.quantity} {item.unit}
              </p>
            </div>

            <div>
              <Label htmlFor="allocatedToType">Allocate To Type *</Label>
              <Select value={formData.allocatedToType} onValueChange={(value) => setFormData({ ...formData, allocatedToType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="DEPARTMENT">Department</SelectItem>
                  <SelectItem value="CLASS">Class</SelectItem>
                  <SelectItem value="HOSTEL">Hostel</SelectItem>
                  <SelectItem value="LABORATORY">Laboratory</SelectItem>
                  <SelectItem value="LIBRARY">Library</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="allocatedTo">Recipient Name *</Label>
              <Input
                id="allocatedTo"
                value={formData.allocatedTo}
                onChange={(e) => setFormData({ ...formData, allocatedTo: e.target.value })}
                placeholder="Enter recipient name or department"
                required
              />
            </div>

            <div>
              <Label htmlFor="issuedCondition">Item Condition</Label>
              <Select value={formData.issuedCondition} onValueChange={(value) => setFormData({ ...formData, issuedCondition: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXCELLENT">Excellent</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="POOR">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expectedReturn">Expected Return Date</Label>
              <Input
                id="expectedReturn"
                type="date"
                value={formData.expectedReturn}
                onChange={(e) => setFormData({ ...formData, expectedReturn: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="e.g., Academic use, Sports training"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any additional notes or instructions"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
              <Button intent="cancel" onClick={onClose} type="button" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button intent="primary" type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Allocating...' : 'Allocate Item'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AllocationDialog;
