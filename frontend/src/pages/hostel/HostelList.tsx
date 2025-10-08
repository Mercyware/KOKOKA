import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import {
  Home, Users, Bed, Plus, Search, Filter,
  Edit, Trash2, Eye, TrendingUp, Building
} from 'lucide-react';
import {
  PageContainer, PageHeader, PageTitle, PageDescription, PageContent,
  Button, Card, LoadingSpinner, toast
} from '@/components/ui';
import hostelService, { Hostel, HostelStats, HostelType, HostelStatus } from '@/services/hostelService';

const HostelList: React.FC = () => {
  const navigate = useNavigate();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [stats, setStats] = useState<HostelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<HostelStatus | ''>('');
  const [filterType, setFilterType] = useState<HostelType | ''>('');

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hostelsResponse, statsResponse] = await Promise.all([
        hostelService.getAllHostels({
          status: filterStatus || undefined,
          hostelType: filterType || undefined,
          search: searchTerm || undefined,
        }),
        hostelService.getHostelStats(),
      ]);

      setHostels(hostelsResponse.hostels);
      setStats(statsResponse.stats);
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

  const handleSearch = () => {
    fetchData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This will also delete all rooms and allocations.`)) {
      return;
    }

    try {
      await hostelService.deleteHostel(id);
      toast({
        title: "Success",
        description: 'Hostel deleted successfully',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to delete hostel',
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: HostelStatus) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      case 'UNDER_MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: HostelType) => {
    switch (type) {
      case 'BOYS': return 'bg-blue-100 text-blue-800';
      case 'GIRLS': return 'bg-pink-100 text-pink-800';
      case 'MIXED': return 'bg-purple-100 text-purple-800';
      case 'STAFF': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            <PageTitle>Hostel Management</PageTitle>
            <PageDescription>Manage hostels, rooms, and student allocations</PageDescription>
          </div>
          <Button
            intent="primary"
            onClick={() => navigate('/hostel/add')}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hostel
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Hostels</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalHostels}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Rooms</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalRooms}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Home className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalCapacity}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Bed className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.occupancyRate}%</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button intent="action" onClick={handleSearch}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as HostelType | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="BOYS">Boys</option>
                <option value="GIRLS">Girls</option>
                <option value="MIXED">Mixed</option>
                <option value="STAFF">Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as HostelStatus | '')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Hostels List */}
        {hostels.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No hostels found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first hostel</p>
              <Button intent="primary" onClick={() => navigate('/hostel/add')}>
                <Plus className="w-4 h-4 mr-2" />
                Add Hostel
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {hostels.map((hostel) => (
              <Card key={hostel.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{hostel.name}</h3>
                    <div className="flex gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(hostel.hostelType)}`}>
                        {hostel.hostelType}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hostel.status)}`}>
                        {hostel.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/hostel/${hostel.id}`)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/hostel/edit/${hostel.id}`)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(hostel.id, hostel.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {hostel.description && (
                  <p className="text-sm text-gray-600 mb-4">{hostel.description}</p>
                )}

                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-t border-b border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{hostel.capacity}</p>
                    <p className="text-xs text-gray-600">Total Beds</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{hostel.occupiedBeds}</p>
                    <p className="text-xs text-gray-600">Occupied</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{hostel.availableBeds}</p>
                    <p className="text-xs text-gray-600">Available</p>
                  </div>
                </div>

                {hostel.warden && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Warden</p>
                    <p className="text-sm text-gray-900">
                      {hostel.warden.firstName} {hostel.warden.lastName}
                      {hostel.warden.employeeId && ` (${hostel.warden.employeeId})`}
                    </p>
                    {hostel.warden.phone && (
                      <p className="text-xs text-gray-600">{hostel.warden.phone}</p>
                    )}
                    {hostel.warden.user?.email && (
                      <p className="text-xs text-gray-600">{hostel.warden.user.email}</p>
                    )}
                  </div>
                )}

                {hostel.facilities && hostel.facilities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Facilities</p>
                    <div className="flex flex-wrap gap-1">
                      {hostel.facilities.slice(0, 5).map((facility, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {facility}
                        </span>
                      ))}
                      {hostel.facilities.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          +{hostel.facilities.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </PageContainer>
    </Layout>
  );
};

export default HostelList;
