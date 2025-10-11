import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button, Input, Label } from '@/components/ui';
import {
  createStudentAssignment,
  updateStudentAssignment,
  getRoutes,
  getVehicles,
  type StudentTransportAssignment,
  type TransportRoute,
  type Vehicle
} from '@/services/transportationService';
import { getStudents } from '@/services/studentService';
import { getActiveAcademicYear } from '@/services/academicYearService';
import { useToast } from '@/hooks/use-toast';

interface StudentAssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: StudentTransportAssignment | null;
  onSuccess: () => void;
}

export default function StudentAssignmentFormDialog({
  open,
  onOpenChange,
  assignment,
  onSuccess
}: StudentAssignmentFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<TransportRoute | null>(null);

  const [formData, setFormData] = useState({
    studentId: '',
    routeId: '',
    vehicleId: '',
    pickupPoint: '',
    pickupTime: '',
    dropoffPoint: '',
    dropoffTime: '',
    guardianName: '',
    guardianPhone: '',
    startDate: '',
    endDate: '',
    academicYearId: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED',
  });

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  useEffect(() => {
    if (assignment) {
      setFormData({
        studentId: assignment.studentId || '',
        routeId: assignment.routeId || '',
        vehicleId: assignment.vehicleId || '',
        pickupPoint: assignment.pickupPoint || '',
        pickupTime: assignment.pickupTime || '',
        dropoffPoint: assignment.dropoffPoint || '',
        dropoffTime: assignment.dropoffTime || '',
        guardianName: assignment.guardianName || '',
        guardianPhone: assignment.guardianPhone || '',
        startDate: assignment.startDate ? assignment.startDate.split('T')[0] : '',
        endDate: assignment.endDate ? assignment.endDate.split('T')[0] : '',
        academicYearId: assignment.academicYearId || '',
        status: assignment.status || 'ACTIVE',
      });
    } else {
      setFormData({
        studentId: '',
        routeId: '',
        vehicleId: '',
        pickupPoint: '',
        pickupTime: '',
        dropoffPoint: '',
        dropoffTime: '',
        guardianName: '',
        guardianPhone: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        academicYearId: '',
        status: 'ACTIVE',
      });
    }
  }, [assignment, open]);

  const loadData = async () => {
    try {
      const [studentsRes, routesRes, vehiclesRes, academicYearRes] = await Promise.all([
        getStudents({ limit: 1000 }),
        getRoutes({ limit: 100 }),
        getVehicles({ limit: 100 }),
        getActiveAcademicYear(),
      ]);

      setStudents(studentsRes.students || []);
      setRoutes(routesRes.routes || []);
      setVehicles(vehiclesRes.vehicles || []);

      if (academicYearRes.academicYear && !assignment) {
        setFormData(prev => ({ ...prev, academicYearId: academicYearRes.academicYear.id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    if (formData.routeId) {
      const route = routes.find(r => r.id === formData.routeId);
      setSelectedRoute(route || null);

      if (route && !assignment) {
        setFormData(prev => ({
          ...prev,
          pickupPoint: route.startPoint,
          dropoffPoint: route.endPoint,
        }));
      }
    }
  }, [formData.routeId, routes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId || !formData.routeId || !formData.pickupPoint || !formData.dropoffPoint || !formData.startDate) {
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
        studentId: formData.studentId,
        routeId: formData.routeId,
        vehicleId: formData.vehicleId || null,
        pickupPoint: formData.pickupPoint,
        pickupTime: formData.pickupTime || null,
        dropoffPoint: formData.dropoffPoint,
        dropoffTime: formData.dropoffTime || null,
        guardianName: formData.guardianName || null,
        guardianPhone: formData.guardianPhone || null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        academicYearId: formData.academicYearId || null,
        status: formData.status,
      };

      if (assignment) {
        await updateStudentAssignment(assignment.id, data);
        toast({
          title: 'Success',
          description: 'Student assignment updated successfully',
        });
      } else {
        await createStudentAssignment(data);
        toast({
          title: 'Success',
          description: 'Student assignment created successfully',
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save student assignment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{assignment ? 'Edit Student Assignment' : 'Assign Student to Transport'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student & Route Selection */}
          <div>
            <h3 className="text-lg font-medium mb-3">Student & Route</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="studentId">Student *</Label>
                <select
                  id="studentId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName} ({student.admissionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="routeId">Route *</Label>
                <select
                  id="routeId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                  required
                >
                  <option value="">Select Route</option>
                  {routes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.routeName} ({route.routeNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <Label htmlFor="vehicleId">Vehicle (Optional)</Label>
                <select
                  id="vehicleId"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.vehicleId}
                  onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.filter(v => v.status === 'ACTIVE').map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicleNumber} - {vehicle.vehicleName || vehicle.vehicleType}
                      ({vehicle.currentOccupancy}/{vehicle.seatingCapacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pickup & Dropoff Details */}
          <div>
            <h3 className="text-lg font-medium mb-3">Pickup & Dropoff</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickupPoint">Pickup Point *</Label>
                <Input
                  id="pickupPoint"
                  value={formData.pickupPoint}
                  onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="pickupTime">Pickup Time</Label>
                <Input
                  id="pickupTime"
                  type="time"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="dropoffPoint">Dropoff Point *</Label>
                <Input
                  id="dropoffPoint"
                  value={formData.dropoffPoint}
                  onChange={(e) => setFormData({ ...formData, dropoffPoint: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="dropoffTime">Dropoff Time</Label>
                <Input
                  id="dropoffTime"
                  type="time"
                  value={formData.dropoffTime}
                  onChange={(e) => setFormData({ ...formData, dropoffTime: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Guardian Contact */}
          <div>
            <h3 className="text-lg font-medium mb-3">Guardian Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guardianName">Guardian Name</Label>
                <Input
                  id="guardianName"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="guardianPhone">Guardian Phone</Label>
                <Input
                  id="guardianPhone"
                  value={formData.guardianPhone}
                  onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Period & Status */}
          <div>
            <h3 className="text-lg font-medium mb-3">Period & Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="CANCELLED">Cancelled</option>
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
                {loading ? 'Saving...' : assignment ? 'Update Assignment' : 'Assign Student'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
