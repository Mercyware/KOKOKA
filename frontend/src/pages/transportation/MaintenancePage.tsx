import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { PageContainer, PageHeader, PageTitle, PageDescription, PageContent } from '@/components/ui/Page';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import { getVehicles, type Vehicle } from '@/services/transportationService';
import { useToast } from '@/hooks/use-toast';

export default function MaintenancePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <Layout>
        <div>Loading maintenance records...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
      <PageHeader>
        <PageTitle>Vehicle Maintenance</PageTitle>
        <PageDescription>
          Track and schedule vehicle maintenance and repairs
        </PageDescription>
      </PageHeader>
      <PageContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Maintenance Records</h2>
            <Button intent="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Maintenance Record
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <p className="text-gray-500 text-center">
                Select a vehicle to view its maintenance records, or click "Add Maintenance Record" to schedule maintenance.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id}>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{vehicle.vehicleNumber}</h3>
                  {vehicle.vehicleName && (
                    <p className="text-sm text-gray-600 mb-3">{vehicle.vehicleName}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    {vehicle.lastServiceDate && (
                      <div>
                        <span className="font-medium">Last Service:</span>{' '}
                        {new Date(vehicle.lastServiceDate).toLocaleDateString()}
                      </div>
                    )}
                    {vehicle.nextServiceDate && (
                      <div>
                        <span className="font-medium">Next Service:</span>{' '}
                        {new Date(vehicle.nextServiceDate).toLocaleDateString()}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Condition:</span>{' '}
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          vehicle.condition === 'EXCELLENT'
                            ? 'bg-green-100 text-green-800'
                            : vehicle.condition === 'GOOD'
                            ? 'bg-blue-100 text-blue-800'
                            : vehicle.condition === 'FAIR'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {vehicle.condition}
                      </span>
                    </div>
                  </div>
                  <Button intent="action" className="w-full mt-4">
                    View Maintenance History
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageContent>
    </PageContainer>
    </Layout>
  );
}
