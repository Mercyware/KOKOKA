import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { UserCheck, Plus, Search, Filter, X } from 'lucide-react';
import {
  PageContainer, PageHeader, PageTitle, PageDescription, PageContent,
  Button, Card, LoadingSpinner, toast,
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui';
import hostelService, {
  HostelAllocation, Hostel, HostelRoom, AllocationStatus
} from '@/services/hostelService';
import { getStudents } from '@/services/studentService';

const Allocations: React.FC = () => {
  const [allocations, setAllocations] = useState<HostelAllocation[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [filterHostel, setFilterHostel] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<AllocationStatus | ''>('ACTIVE');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    studentId: '',
    hostelId: '',
    roomId: '',
    bedNumber: '',
    startDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, [filterHostel, filterStatus]);

  useEffect(() => {
    if (formData.hostelId) {
      fetchRooms(formData.hostelId);
    } else {
      setRooms([]);
    }
  }, [formData.hostelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocationsResponse, hostelsResponse, studentsResponse] = await Promise.all([
        hostelService.getAllAllocations({
          hostelId: filterHostel || undefined,
          status: filterStatus || undefined,
        }),
        hostelService.getAllHostels({ status: 'ACTIVE' }),
        getStudents({ limit: 1000 }),
      ]);

      setAllocations(allocationsResponse.allocations);
      setHostels(hostelsResponse.hostels);
      setStudents(studentsResponse.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch data',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (hostelId: string) => {
    try {
      const response = await hostelService.getHostelRooms(hostelId);
      // Filter only available or partially occupied rooms
      const availableRooms = response.rooms.filter(
        (room: HostelRoom) => room.availableBeds > 0
      );
      setRooms(availableRooms);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch rooms',
        variant: "destructive",
      });
    }
  };

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentId || !formData.hostelId || !formData.roomId) {
      toast({
        title: "Error",
        description: 'Please fill all required fields',
        variant: "destructive",
      });
      return;
    }

    try {
      await hostelService.allocateStudent({
        studentId: formData.studentId,
        hostelId: formData.hostelId,
        roomId: formData.roomId,
        bedNumber: formData.bedNumber || undefined,
        startDate: formData.startDate,
        remarks: formData.remarks || undefined,
      });

      toast({
        title: "Success",
        description: 'Student allocated successfully',
      });
      setShowAllocateModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to allocate student',
        variant: "destructive",
      });
    }
  };

  const handleDeallocate = async (id: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to deallocate ${studentName}?`)) {
      return;
    }

    try {
      await hostelService.deallocateStudent(id);
      toast({
        title: "Success",
        description: 'Student deallocated successfully',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to deallocate student',
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      studentId: '',
      hostelId: '',
      roomId: '',
      bedNumber: '',
      startDate: new Date().toISOString().split('T')[0],
      remarks: '',
    });
  };

  const getStatusColor = (status: AllocationStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'TRANSFERRED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAllocations = allocations.filter((allocation) => {
    const studentName = `${allocation.student?.firstName} ${allocation.student?.lastName}`.toLowerCase();
    const admissionNumber = allocation.student?.admissionNumber?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();

    return studentName.includes(search) || admissionNumber.includes(search);
  });

  // Get unallocated students
  const allocatedStudentIds = allocations
    .filter(a => a.status === 'ACTIVE')
    .map(a => a.studentId);
  const unallocatedStudents = students.filter(
    s => !allocatedStudentIds.includes(s.id)
  );

  if (loading) {
    return (
      <Layout>
        <PageContainer>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </PageContainer>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageContainer>
      <PageHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <PageTitle>Student Allocations</PageTitle>
            <PageDescription>Manage student hostel room assignments</PageDescription>
          </div>
          <Button
            intent="primary"
            onClick={() => setShowAllocateModal(true)}
            disabled={hostels.length === 0}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Allocate Student
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or admission number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Hostel</label>
              <select
                value={filterHostel}
                onChange={(e) => setFilterHostel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Hostels</option>
                {hostels.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as AllocationStatus | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="TRANSFERRED">Transferred</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{allocations.length}</p>
              <p className="text-sm text-gray-600">Total Allocations</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {allocations.filter(a => a.status === 'ACTIVE').length}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {allocations.filter(a => a.status === 'COMPLETED').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{unallocatedStudents.length}</p>
              <p className="text-sm text-gray-600">Unallocated Students</p>
            </div>
          </Card>
        </div>

        {/* Allocations List */}
        {filteredAllocations.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <UserCheck className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No allocations found</h3>
              <p className="text-gray-600 mb-6">Start by allocating students to hostel rooms</p>
              <Button intent="primary" onClick={() => setShowAllocateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Allocate Student
              </Button>
            </div>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Hostel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Bed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAllocations.map((allocation) => (
                  <tr key={allocation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {allocation.student?.firstName} {allocation.student?.lastName}
                        </div>
                        {allocation.student?.admissionNumber && (
                          <div className="text-xs text-gray-500">
                            {allocation.student.admissionNumber}
                          </div>
                        )}
                        {allocation.student?.class && (
                          <div className="text-xs text-gray-500">
                            {allocation.student.class.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{allocation.hostel?.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Room {allocation.room?.roomNumber}
                      </div>
                      <div className="text-xs text-gray-500">{allocation.room?.roomType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {allocation.bedNumber || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(allocation.startDate).toLocaleDateString()}
                      </div>
                      {allocation.endDate && (
                        <div className="text-xs text-gray-500">
                          to {new Date(allocation.endDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(allocation.status)}`}>
                        {allocation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {allocation.status === 'ACTIVE' && (
                        <Button
                          intent="danger"
                          size="sm"
                          onClick={() => handleDeallocate(
                            allocation.id,
                            `${allocation.student?.firstName} ${allocation.student?.lastName}`
                          )}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Deallocate
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PageContent>

      {/* Allocate Student Modal */}
      {showAllocateModal && (
        <Dialog open={showAllocateModal} onOpenChange={(open) => {
          if (!open) {
            setShowAllocateModal(false);
            resetForm();
          }
        }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Allocate Student to Hostel</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAllocate}>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Student</option>
                  {unallocatedStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.firstName} {student.lastName}
                      {student.admissionNumber && ` (${student.admissionNumber})`}
                      {student.class && ` - ${student.class.name}`}
                    </option>
                  ))}
                </select>
                {unallocatedStudents.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">All students are already allocated</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hostel <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.hostelId}
                  onChange={(e) => setFormData({ ...formData, hostelId: e.target.value, roomId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Hostel</option>
                  {hostels.map((hostel) => (
                    <option key={hostel.id} value={hostel.id}>
                      {hostel.name} ({hostel.availableBeds} beds available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={!formData.hostelId}
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.roomNumber} - {room.roomType} ({room.availableBeds} beds available)
                    </option>
                  ))}
                </select>
                {formData.hostelId && rooms.length === 0 && (
                  <p className="text-xs text-red-500 mt-1">No available rooms in this hostel</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bed Number</label>
                <input
                  type="text"
                  value={formData.bedNumber}
                  onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                  placeholder="e.g., B1, B2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Any additional notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <Button
                type="button"
                intent="cancel"
                onClick={() => {
                  setShowAllocateModal(false);
                  resetForm();
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" intent="primary" className="w-full sm:w-auto">
                Allocate Student
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      )}
    </PageContainer>
    </Layout>
  );
};

export default Allocations;
