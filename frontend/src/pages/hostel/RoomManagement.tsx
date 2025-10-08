import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { DoorOpen, Plus, Search, Filter, Bed, Users } from 'lucide-react';
import {
  PageContainer, PageHeader, PageTitle, PageDescription, PageContent,
  Button, Card, LoadingSpinner, toast,
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui';
import hostelService, { Hostel, HostelRoom, RoomType, RoomStatus } from '@/services/hostelService';

const RoomManagement: React.FC = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostelId, setSelectedHostelId] = useState<string>('');
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    roomNumber: '',
    floor: 0,
    roomType: 'STANDARD' as RoomType,
    capacity: 1,
    facilities: '',
    status: 'AVAILABLE' as RoomStatus,
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostelId) {
      fetchRooms(selectedHostelId);
    }
  }, [selectedHostelId]);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const response = await hostelService.getAllHostels({ status: 'ACTIVE' });
      const hostelsList = response.hostels;
      setHostels(hostelsList);

      if (hostelsList.length > 0) {
        setSelectedHostelId(hostelsList[0].id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch hostels',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async (hostelId: string) => {
    try {
      setLoading(true);
      const response = await hostelService.getHostelRooms(hostelId);
      setRooms(response.rooms);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch rooms',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.roomNumber.trim()) {
      toast({
        title: "Error",
        description: 'Please enter room number',
        variant: "destructive",
      });
      return;
    }

    if (formData.capacity <= 0) {
      toast({
        title: "Error",
        description: 'Capacity must be greater than 0',
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        roomNumber: formData.roomNumber.trim(),
        floor: formData.floor || undefined,
        roomType: formData.roomType,
        capacity: formData.capacity,
        facilities: formData.facilities
          ? formData.facilities.split(',').map(f => f.trim()).filter(f => f)
          : [],
        status: formData.status,
        hostelId: selectedHostelId,
      };

      await hostelService.createRoom(payload);
      toast({
        title: "Success",
        description: 'Room added successfully',
      });
      setShowAddModal(false);
      resetForm();
      fetchRooms(selectedHostelId);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to add room',
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      floor: 0,
      roomType: 'STANDARD',
      capacity: 1,
      facilities: '',
      status: 'AVAILABLE',
    });
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'OCCUPIED': return 'bg-blue-100 text-blue-800';
      case 'UNDER_MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'RESERVED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoomTypeLabel = (type: RoomType) => {
    return type.replace(/_/g, ' ');
  };

  if (loading && hostels.length === 0) {
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
            <PageTitle>Room Management</PageTitle>
            <PageDescription>Manage hostel rooms and their availability</PageDescription>
          </div>
          <Button
            intent="primary"
            onClick={() => setShowAddModal(true)}
            disabled={!selectedHostelId}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Room
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        {/* Hostel Selection */}
        {hostels.length > 0 ? (
          <>
            <Card className="p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Hostel</label>
              <select
                value={selectedHostelId}
                onChange={(e) => setSelectedHostelId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hostels.map((hostel) => (
                  <option key={hostel.id} value={hostel.id}>
                    {hostel.name} ({hostel.hostelType})
                  </option>
                ))}
              </select>
            </Card>

            {/* Room Statistics */}
            {selectedHostelId && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Rooms</p>
                      <p className="text-2xl font-bold text-gray-900">{rooms.length}</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DoorOpen className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Available</p>
                      <p className="text-2xl font-bold text-green-600">
                        {rooms.filter(r => r.status === 'AVAILABLE').length}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-lg">
                      <DoorOpen className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Occupied</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {rooms.filter(r => r.status === 'OCCUPIED').length}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Capacity</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {rooms.reduce((sum, r) => sum + r.capacity, 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Bed className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Rooms List */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
              </div>
            ) : rooms.length === 0 ? (
              <Card className="p-12">
                <div className="text-center">
                  <DoorOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No rooms found</h3>
                  <p className="text-gray-600 mb-6">Get started by adding rooms to this hostel</p>
                  <Button intent="primary" onClick={() => setShowAddModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Room
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <Card key={room.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Room {room.roomNumber}
                        </h3>
                        {room.floor !== null && room.floor !== undefined && (
                          <p className="text-sm text-gray-600">Floor {room.floor}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                        {room.status}
                      </span>
                    </div>

                    <div className="mb-3">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {getRoomTypeLabel(room.roomType)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-200 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Capacity</p>
                        <p className="text-lg font-semibold text-gray-900">{room.capacity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Occupied</p>
                        <p className="text-lg font-semibold text-blue-600">{room.occupiedBeds}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Available</p>
                        <p className="text-lg font-semibold text-green-600">{room.availableBeds}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Occupancy</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {room.capacity > 0 ? Math.round((room.occupiedBeds / room.capacity) * 100) : 0}%
                        </p>
                      </div>
                    </div>

                    {room.facilities && room.facilities.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Facilities</p>
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.slice(0, 3).map((facility, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {facility}
                            </span>
                          ))}
                          {room.facilities.length > 3 && (
                            <span className="px-2 py-0.5 bg-gray-50 text-gray-700 rounded text-xs">
                              +{room.facilities.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <DoorOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hostels found</h3>
              <p className="text-gray-600 mb-6">Create a hostel first before adding rooms</p>
              <Button intent="primary" onClick={() => navigate('/hostel/add')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Hostel
              </Button>
            </div>
          </Card>
        )}
      </PageContent>

      {/* Add Room Modal */}
      {showAddModal && (
        <Dialog open={showAddModal} onOpenChange={(open) => {
          if (!open) {
            setShowAddModal(false);
            resetForm();
          }
        }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddRoom}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  placeholder="e.g., 101, A-12"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) || 0 })}
                  placeholder="Floor number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="SINGLE">Single</option>
                  <option value="DOUBLE">Double</option>
                  <option value="TRIPLE">Triple</option>
                  <option value="QUAD">Quad</option>
                  <option value="DORMITORY">Dormitory</option>
                  <option value="STANDARD">Standard</option>
                  <option value="DELUXE">Deluxe</option>
                  <option value="SUITE">Suite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  placeholder="Number of beds"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as RoomStatus })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="RESERVED">Reserved</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facilities
                </label>
                <input
                  type="text"
                  value={formData.facilities}
                  onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                  placeholder="WiFi, AC, Attached Bathroom (comma separated)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Enter facilities separated by commas</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <Button
                type="button"
                intent="cancel"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button type="submit" intent="primary" className="w-full sm:w-auto">
                Add Room
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

export default RoomManagement;
