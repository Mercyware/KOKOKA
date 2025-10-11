import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Plus, MapPin, Edit, Trash2 } from 'lucide-react';
import { getRoutes, deleteRoute, type TransportRoute } from '@/services/transportationService';
import { useToast } from '@/hooks/use-toast';
import RouteFormDialog from './RouteFormDialog';

export default function RoutesTab() {
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await getRoutes();
      setRoutes(response.routes || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch routes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = () => {
    setSelectedRoute(null);
    setDialogOpen(true);
  };

  const handleEditRoute = (route: TransportRoute) => {
    setSelectedRoute(route);
    setDialogOpen(true);
  };

  const handleDeleteRoute = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      await deleteRoute(id);
      toast({
        title: 'Success',
        description: 'Route deleted successfully',
      });
      fetchRoutes();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete route',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading routes...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Transport Routes</h2>
          <Button intent="primary" onClick={handleAddRoute}>
            <Plus className="h-4 w-4 mr-2" />
            Add Route
          </Button>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Card key={route.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {route.routeName}
              </CardTitle>
              {route.routeNumber && (
                <CardDescription>Route #{route.routeNumber}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">From:</span> {route.startPoint}
                </div>
                <div>
                  <span className="font-medium">To:</span> {route.endPoint}
                </div>
                {route.distance && (
                  <div>
                    <span className="font-medium">Distance:</span> {route.distance} km
                  </div>
                )}
                {route.fare && (
                  <div>
                    <span className="font-medium">Fare:</span> {route.currency} {route.fare}
                  </div>
                )}
                {route._count && (
                  <div>
                    <span className="font-medium">Students:</span> {route._count.studentAssignments}
                  </div>
                )}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded ${
                      route.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {route.status}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      intent="action"
                      size="sm"
                      onClick={() => handleEditRoute(route)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      intent="danger"
                      size="sm"
                      onClick={() => handleDeleteRoute(route.id)}
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

        {routes.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              No routes found. Click "Add Route" to create one.
            </CardContent>
          </Card>
        )}
      </div>

      <RouteFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        route={selectedRoute}
        onSuccess={fetchRoutes}
      />
    </>
  );
}
