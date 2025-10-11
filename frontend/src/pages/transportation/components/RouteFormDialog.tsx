import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button, Input, Label } from '@/components/ui';
import { createRoute, updateRoute, type TransportRoute } from '@/services/transportationService';
import { useToast } from '@/hooks/use-toast';

interface RouteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: TransportRoute | null;
  onSuccess: () => void;
}

export default function RouteFormDialog({ open, onOpenChange, route, onSuccess }: RouteFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    routeName: '',
    routeNumber: '',
    description: '',
    startPoint: '',
    endPoint: '',
    distance: '',
    estimatedTime: '',
    fare: '',
    currency: 'KES',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (route) {
      setFormData({
        routeName: route.routeName || '',
        routeNumber: route.routeNumber || '',
        description: route.description || '',
        startPoint: route.startPoint || '',
        endPoint: route.endPoint || '',
        distance: route.distance?.toString() || '',
        estimatedTime: route.estimatedTime?.toString() || '',
        fare: route.fare?.toString() || '',
        currency: route.currency || 'KES',
        status: route.status || 'ACTIVE',
      });
    } else {
      setFormData({
        routeName: '',
        routeNumber: '',
        description: '',
        startPoint: '',
        endPoint: '',
        distance: '',
        estimatedTime: '',
        fare: '',
        currency: 'KES',
        status: 'ACTIVE',
      });
    }
  }, [route, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.routeName || !formData.startPoint || !formData.endPoint) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        routeName: formData.routeName,
        routeNumber: formData.routeNumber || null,
        description: formData.description || null,
        startPoint: formData.startPoint,
        endPoint: formData.endPoint,
        distance: formData.distance ? parseFloat(formData.distance) : null,
        estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null,
        fare: formData.fare ? parseFloat(formData.fare) : 0,
        currency: formData.currency,
        status: formData.status,
        stops: [],
      };

      if (route) {
        await updateRoute(route.id, data);
        toast({
          title: 'Success',
          description: 'Route updated successfully',
        });
      } else {
        await createRoute(data);
        toast({
          title: 'Success',
          description: 'Route created successfully',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save route',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{route ? 'Edit Route' : 'Add New Route'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="routeName">Route Name *</Label>
              <Input
                id="routeName"
                value={formData.routeName}
                onChange={(e) => setFormData({ ...formData, routeName: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="routeNumber">Route Number</Label>
              <Input
                id="routeNumber"
                value={formData.routeNumber}
                onChange={(e) => setFormData({ ...formData, routeNumber: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="startPoint">Start Point *</Label>
              <Input
                id="startPoint"
                value={formData.startPoint}
                onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="endPoint">End Point *</Label>
              <Input
                id="endPoint"
                value={formData.endPoint}
                onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="distance">Distance (km)</Label>
              <Input
                id="distance"
                type="number"
                step="0.1"
                value={formData.distance}
                onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
              <Input
                id="estimatedTime"
                type="number"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="fare">Fare</Label>
              <Input
                id="fare"
                type="number"
                step="0.01"
                value={formData.fare}
                onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="KES">KES</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
              <Button
                type="button"
                intent="cancel"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" intent="primary" disabled={loading}>
                {loading ? 'Saving...' : route ? 'Update Route' : 'Create Route'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
