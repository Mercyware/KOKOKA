import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { getStudentAssignments, deleteStudentAssignment, type StudentTransportAssignment } from '@/services/transportationService';
import { useToast } from '@/hooks/use-toast';
import StudentAssignmentFormDialog from './StudentAssignmentFormDialog';

export default function AssignmentsTab() {
  const [assignments, setAssignments] = useState<StudentTransportAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<StudentTransportAssignment | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await getStudentAssignments({ limit: 50 });
      setAssignments(response.assignments || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch assignments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = () => {
    setSelectedAssignment(null);
    setDialogOpen(true);
  };

  const handleEditAssignment = (assignment: StudentTransportAssignment) => {
    setSelectedAssignment(assignment);
    setDialogOpen(true);
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      await deleteStudentAssignment(id);
      toast({
        title: 'Success',
        description: 'Assignment deleted successfully',
      });
      fetchAssignments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete assignment',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div>Loading assignments...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Student Transport Assignments</h2>
          <Button intent="primary" onClick={handleAddAssignment}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Student
          </Button>
        </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Student</th>
                  <th className="px-4 py-3 text-left font-medium">Class</th>
                  <th className="px-4 py-3 text-left font-medium">Route</th>
                  <th className="px-4 py-3 text-left font-medium">Vehicle</th>
                  <th className="px-4 py-3 text-left font-medium">Pickup Point</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {assignment.student && (
                        <div>
                          <div className="font-medium">
                            {assignment.student.firstName} {assignment.student.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {assignment.student.admissionNumber}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {assignment.student?.currentClass?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {assignment.route?.routeName || '-'}
                    </td>
                    <td className="px-4 py-3">
                      {assignment.vehicle?.vehicleNumber || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div>{assignment.pickupPoint}</div>
                        {assignment.pickupTime && (
                          <div className="text-xs text-gray-500">{assignment.pickupTime}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          assignment.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          intent="action"
                          size="sm"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          intent="danger"
                          size="sm"
                          onClick={() => handleDeleteAssignment(assignment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

        {assignments.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-gray-500">
              No student transport assignments found. Click "Assign Student" to create one.
            </CardContent>
          </Card>
        )}
      </div>

      <StudentAssignmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        assignment={selectedAssignment}
        onSuccess={fetchAssignments}
      />
    </>
  );
}
