import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { createVehicle, updateVehicle, type Vehicle } from '@/services/transportationService';
import { useToast } from '@/hooks/use-toast';

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle?: Vehicle | null;
  onSuccess: () => void;
}

export default function VehicleFormDialog({ open, onOpenChange, vehicle, onSuccess }: VehicleFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    vehicleName: '',
    vehicleType: 'BUS' as 'BUS' | 'VAN' | 'CAR' | 'MINIBUS' | 'COACH',
    make: '',
    model: '',
    year: '',
    color: '',
    registrationNumber: '',
    seatingCapacity: '',
    driverName: '',
    driverPhone: '',
    driverLicense: '',
    lastServiceDate: '',
    nextServiceDate: '',
    insuranceExpiry: '',
    roadworthyExpiry: '',
    gpsEnabled: false,
    gpsDeviceId: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED',
    condition: 'GOOD' as 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NEEDS_REPAIR',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        vehicleNumber: vehicle.vehicleNumber || '',
        vehicleName: vehicle.vehicleName || '',
        vehicleType: vehicle.vehicleType || 'BUS',
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year?.toString() || '',
        color: vehicle.color || '',
        registrationNumber: vehicle.registrationNumber || '',
        seatingCapacity: vehicle.seatingCapacity?.toString() || '',
        driverName: vehicle.driverName || '',
        driverPhone: vehicle.driverPhone || '',
        driverLicense: vehicle.driverLicense || '',
        lastServiceDate: vehicle.lastServiceDate ? vehicle.lastServiceDate.split('T')[0] : '',
        nextServiceDate: vehicle.nextServiceDate ? vehicle.nextServiceDate.split('T')[0] : '',
        insuranceExpiry: vehicle.insuranceExpiry ? vehicle.insuranceExpiry.split('T')[0] : '',
        roadworthyExpiry: vehicle.roadworthyExpiry ? vehicle.roadworthyExpiry.split('T')[0] : '',
        gpsEnabled: vehicle.gpsEnabled || false,
        gpsDeviceId: vehicle.gpsDeviceId || '',
        status: vehicle.status || 'ACTIVE',
        condition: vehicle.condition || 'GOOD',
      });
    } else {
      setFormData({
        vehicleNumber: '',
        vehicleName: '',
        vehicleType: 'BUS',
        make: '',
        model: '',
        year: '',
        color: '',
        registrationNumber: '',
        seatingCapacity: '',
        driverName: '',
        driverPhone: '',
        driverLicense: '',
        lastServiceDate: '',
        nextServiceDate: '',
        insuranceExpiry: '',
        roadworthyExpiry: '',
        gpsEnabled: false,
        gpsDeviceId: '',
        status: 'ACTIVE',
        condition: 'GOOD',
      });
    }
  }, [vehicle, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vehicleNumber || !formData.vehicleType) {
      toast({
        title: 'Error',
        description: 'Vehicle number and type are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data = {
        vehicleNumber: formData.vehicleNumber,
        vehicleName: formData.vehicleName || null,
        vehicleType: formData.vehicleType,
        make: formData.make || null,
        model: formData.model || null,
        year: formData.year ? parseInt(formData.year) : null,
        color: formData.color || null,
        registrationNumber: formData.registrationNumber || null,
        seatingCapacity: formData.seatingCapacity ? parseInt(formData.seatingCapacity) : 0,
        driverName: formData.driverName || null,
        driverPhone: formData.driverPhone || null,
        driverLicense: formData.driverLicense || null,
        lastServiceDate: formData.lastServiceDate || null,
        nextServiceDate: formData.nextServiceDate || null,
        insuranceExpiry: formData.insuranceExpiry || null,
        roadworthyExpiry: formData.roadworthyExpiry || null,
        gpsEnabled: formData.gpsEnabled,
        gpsDeviceId: formData.gpsDeviceId || null,
        status: formData.status,
        condition: formData.condition,
      };

      if (vehicle) {
        await updateVehicle(vehicle.id, data);
        toast({
          title: 'Success',
          description: 'Vehicle updated successfully',
        });
      } else {
        await createVehicle(data);
        toast({
          title: 'Success',
          description: 'Vehicle created successfully',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save vehicle',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
                <Input
                  id="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="vehicleName">Vehicle Name</Label>
                <Input
                  id="vehicleName"
                  value={formData.vehicleName}
                  onChange={(e) => setFormData({ ...formData, vehicleName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="vehicleType">Vehicle Type *</Label>
                <select
                  id="vehicleType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value as any })}
                  required
                >
                  <option value="BUS">Bus</option>
                  <option value="VAN">Van</option>
                  <option value="MINIBUS">Minibus</option>
                  <option value="CAR">Car</option>
                  <option value="COACH">Coach</option>
                </select>
              </div>

              <div>
                <Label htmlFor="seatingCapacity">Seating Capacity</Label>
                <Input
                  id="seatingCapacity"
                  type="number"
                  value={formData.seatingCapacity}
                  onChange={(e) => setFormData({ ...formData, seatingCapacity: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="registrationNumber">Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Driver Information */}
          <div>
            <h3 className="text-lg font-medium mb-3">Driver Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="driverName">Driver Name</Label>
                <Input
                  id="driverName"
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="driverPhone">Driver Phone</Label>
                <Input
                  id="driverPhone"
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="driverLicense">Driver License</Label>
                <Input
                  id="driverLicense"
                  value={formData.driverLicense}
                  onChange={(e) => setFormData({ ...formData, driverLicense: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Service & Compliance */}
          <div>
            <h3 className="text-lg font-medium mb-3">Service & Compliance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastServiceDate">Last Service Date</Label>
                <Input
                  id="lastServiceDate"
                  type="date"
                  value={formData.lastServiceDate}
                  onChange={(e) => setFormData({ ...formData, lastServiceDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="nextServiceDate">Next Service Date</Label>
                <Input
                  id="nextServiceDate"
                  type="date"
                  value={formData.nextServiceDate}
                  onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="roadworthyExpiry">Roadworthy Expiry</Label>
                <Input
                  id="roadworthyExpiry"
                  type="date"
                  value={formData.roadworthyExpiry}
                  onChange={(e) => setFormData({ ...formData, roadworthyExpiry: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* GPS & Status */}
          <div>
            <h3 className="text-lg font-medium mb-3">GPS & Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gpsDeviceId">GPS Device ID</Label>
                <Input
                  id="gpsDeviceId"
                  value={formData.gpsDeviceId}
                  onChange={(e) => setFormData({ ...formData, gpsDeviceId: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="gpsEnabled"
                  checked={formData.gpsEnabled}
                  onChange={(e) => setFormData({ ...formData, gpsEnabled: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="gpsEnabled">GPS Enabled</Label>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                  <option value="RETIRED">Retired</option>
                </select>
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <select
                  id="condition"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                >
                  <option value="EXCELLENT">Excellent</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                  <option value="POOR">Poor</option>
                  <option value="NEEDS_REPAIR">Needs Repair</option>
                </select>
              </div>
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
                {loading ? 'Saving...' : vehicle ? 'Update Vehicle' : 'Create Vehicle'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
