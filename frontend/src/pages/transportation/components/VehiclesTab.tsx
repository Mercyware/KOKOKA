import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Plus, Car, Edit, Trash2 } from 'lucide-react';
import { getVehicles, deleteVehicle, type Vehicle } from '@/services/transportationService';
import { useToast } from '@/hooks/use-toast';
import VehicleFormDialog from './VehicleFormDialog';

export default function VehiclesTab() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await getVehicles();
      setVehicles(response.vehicles || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch vehicles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setSelectedVehicle(null);
    setDialogOpen(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogOpen(true);
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) {
      return;
    }

    try {
      await deleteVehicle(id);
      toast({
        title: 'Success',
        description: 'Vehicle deleted successfully',
      });
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete vehicle',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading vehicles...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Vehicles</h2>
          <Button intent="primary" onClick={handleAddVehicle}>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((vehicle) => (
          <Card key={vehicle.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {vehicle.vehicleNumber}
              </CardTitle>
              {vehicle.vehicleName && (
                <CardDescription>{vehicle.vehicleName}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {vehicle.vehicleType}
                </div>
                {vehicle.make && vehicle.model && (
                  <div>
                    <span className="font-medium">Model:</span> {vehicle.make} {vehicle.model}
                  </div>
                )}
                {vehicle.registrationNumber && (
                  <div>
                    <span className="font-medium">Registration:</span> {vehicle.registrationNumber}
                  </div>
                )}
                <div>
                  <span className="font-medium">Capacity:</span> {vehicle.currentOccupancy}/{vehicle.seatingCapacity}
                </div>
                {vehicle.driverName && (
                  <div>
                    <span className="font-medium">Driver:</span> {vehicle.driverName}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex gap-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        vehicle.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : vehicle.status === 'MAINTENANCE'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {vehicle.status}
                    </span>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      {vehicle.condition}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      intent="action"
                      size="sm"
                      onClick={() => handleEditVehicle(vehicle)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      intent="danger"
                      size="sm"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

        {vehicles.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              No vehicles found. Click "Add Vehicle" to create one.
            </CardContent>
          </Card>
        )}
      </div>

      <VehicleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicle={selectedVehicle}
        onSuccess={fetchVehicles}
      />
    </>
  );
}
