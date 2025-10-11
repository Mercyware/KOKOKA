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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { createItem, updateItem, type InventoryItem, type InventoryCategory } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';

interface AddItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: InventoryItem | null;
  categories: InventoryCategory[];
}

const AddItemDialog: React.FC<AddItemDialogProps> = ({
  open,
  onClose,
  onSuccess,
  item,
  categories,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    itemCode: '',
    barcode: '',
    categoryId: '',
    quantity: 0,
    minimumStock: 0,
    maximumStock: 0,
    reorderLevel: 0,
    unit: 'pieces',
    location: '',
    shelf: '',
    bin: '',
    unitPrice: 0,
    currency: 'KES',
    supplierName: '',
    supplierContact: '',
    itemType: 'CONSUMABLE',
    condition: 'GOOD',
    notes: '',
    tags: [] as string[],
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        itemCode: item.itemCode || '',
        barcode: item.barcode || '',
        categoryId: item.categoryId || '',
        quantity: item.quantity || 0,
        minimumStock: item.minimumStock || 0,
        maximumStock: item.maximumStock || 0,
        reorderLevel: item.reorderLevel || 0,
        unit: item.unit || 'pieces',
        location: item.location || '',
        shelf: item.shelf || '',
        bin: item.bin || '',
        unitPrice: item.unitPrice || 0,
        currency: item.currency || 'KES',
        supplierName: item.supplierName || '',
        supplierContact: item.supplierContact || '',
        itemType: item.itemType || 'CONSUMABLE',
        condition: item.condition || 'GOOD',
        notes: item.notes || '',
        tags: item.tags || [],
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.itemCode || !formData.categoryId) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      if (item) {
        await updateItem(item.id, formData);
        toast({
          title: 'Success',
          description: 'Item updated successfully',
        });
      } else {
        await createItem(formData);
        toast({
          title: 'Success',
          description: 'Item created successfully',
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving item:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to save item',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Item' : 'Add New Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update item information' : 'Add a new item to the inventory'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Basic Information */}
            <div className="col-span-2">
              <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
            </div>

            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="itemCode">Item Code *</Label>
              <Input
                id="itemCode"
                value={formData.itemCode}
                onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                required
                disabled={!!item}
              />
            </div>

            <div>
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="categoryId">Category *</Label>
              <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                <SelectTrigger>
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

            <div>
              <Label htmlFor="itemType">Item Type</Label>
              <Select value={formData.itemType} onValueChange={(value) => setFormData({ ...formData, itemType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ASSET">Asset</SelectItem>
                  <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                  <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                  <SelectItem value="FURNITURE">Furniture</SelectItem>
                  <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                  <SelectItem value="SPORTS">Sports</SelectItem>
                  <SelectItem value="LABORATORY">Laboratory</SelectItem>
                  <SelectItem value="OFFICE">Office</SelectItem>
                  <SelectItem value="UNIFORMS">Uniforms</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select value={formData.condition} onValueChange={(value) => setFormData({ ...formData, condition: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EXCELLENT">Excellent</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="FAIR">Fair</SelectItem>
                  <SelectItem value="POOR">Poor</SelectItem>
                  <SelectItem value="DAMAGED">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            {/* Stock Information */}
            <div className="col-span-2 mt-4">
              <h3 className="font-semibold text-lg mb-3">Stock Information</h3>
            </div>

            <div>
              <Label htmlFor="quantity">Current Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., pieces, boxes, kg"
              />
            </div>

            <div>
              <Label htmlFor="minimumStock">Minimum Stock</Label>
              <Input
                id="minimumStock"
                type="number"
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label htmlFor="reorderLevel">Reorder Level</Label>
              <Input
                id="reorderLevel"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Location */}
            <div className="col-span-2 mt-4">
              <h3 className="font-semibold text-lg mb-3">Location</h3>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Store Room A"
              />
            </div>

            <div>
              <Label htmlFor="shelf">Shelf</Label>
              <Input
                id="shelf"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="bin">Bin</Label>
              <Input
                id="bin"
                value={formData.bin}
                onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
              />
            </div>

            {/* Financial */}
            <div className="col-span-2 mt-4">
              <h3 className="font-semibold text-lg mb-3">Financial Information</h3>
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
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              />
            </div>

            {/* Supplier */}
            <div className="col-span-2 mt-4">
              <h3 className="font-semibold text-lg mb-3">Supplier Information</h3>
            </div>

            <div>
              <Label htmlFor="supplierName">Supplier Name</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="supplierContact">Supplier Contact</Label>
              <Input
                id="supplierContact"
                value={formData.supplierContact}
                onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
              <Button intent="cancel" onClick={onClose} type="button" className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button intent="primary" type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Saving...' : item ? 'Update Item' : 'Create Item'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemDialog;
