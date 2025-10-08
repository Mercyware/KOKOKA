import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  PageContainer, PageHeader, PageTitle, PageDescription, PageContent,
  Button, Card, Form, FormField, Input, LoadingSpinner, toast
} from '@/components/ui';
import hostelService, { HostelType, HostelStatus } from '@/services/hostelService';

const AddHostel: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [formData, setFormData] = useState({
    name: '',
    hostelType: 'BOYS' as HostelType,
    gender: 'MALE' as 'MALE' | 'FEMALE' | 'OTHER' | '',
    address: '',
    capacity: 0,
    warden: '',
    wardenContact: '',
    wardenEmail: '',
    facilities: '',
    description: '',
    status: 'ACTIVE' as HostelStatus,
  });

  useEffect(() => {
    if (isEditMode && id) {
      fetchHostelData(id);
    }
  }, [id, isEditMode]);

  const fetchHostelData = async (hostelId: string) => {
    try {
      setInitialLoading(true);
      const response = await hostelService.getHostelById(hostelId);
      const hostel = response.data;

      setFormData({
        name: hostel.name,
        hostelType: hostel.hostelType,
        gender: hostel.gender || '',
        address: hostel.address || '',
        capacity: hostel.capacity,
        warden: hostel.warden || '',
        wardenContact: hostel.wardenContact || '',
        wardenEmail: hostel.wardenEmail || '',
        facilities: hostel.facilities?.join(', ') || '',
        description: hostel.description || '',
        status: hostel.status,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch hostel data',
        variant: "destructive",
      });
      navigate('/hostel');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'capacity' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: 'Please enter hostel name',
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
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        hostelType: formData.hostelType,
        gender: formData.gender || undefined,
        address: formData.address.trim() || undefined,
        capacity: formData.capacity,
        warden: formData.warden.trim() || undefined,
        wardenContact: formData.wardenContact.trim() || undefined,
        wardenEmail: formData.wardenEmail.trim() || undefined,
        facilities: formData.facilities
          ? formData.facilities.split(',').map(f => f.trim()).filter(f => f)
          : [],
        description: formData.description.trim() || undefined,
        status: formData.status,
      };

      if (isEditMode && id) {
        await hostelService.updateHostel(id, payload);
        toast({
          title: "Success",
          description: 'Hostel updated successfully',
        });
      } else {
        await hostelService.createHostel(payload);
        toast({
          title: "Success",
          description: 'Hostel created successfully',
        });
      }

      navigate('/hostel');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} hostel`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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
        <div className="flex items-center gap-4">
          <Button
            intent="cancel"
            onClick={() => navigate('/hostel')}
            className="w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <PageTitle>{isEditMode ? 'Edit Hostel' : 'Add New Hostel'}</PageTitle>
            <PageDescription>
              {isEditMode ? 'Update hostel information' : 'Create a new hostel in your school'}
            </PageDescription>
          </div>
        </div>
      </PageHeader>

      <PageContent>
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              </div>

              <FormField label="Hostel Name" required>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter hostel name"
                  required
                />
              </FormField>

              <FormField label="Hostel Type" required>
                <select
                  name="hostelType"
                  value={formData.hostelType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="BOYS">Boys</option>
                  <option value="GIRLS">Girls</option>
                  <option value="MIXED">Mixed</option>
                  <option value="STAFF">Staff</option>
                </select>
              </FormField>

              <FormField label="Gender">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </FormField>

              <FormField label="Capacity" required>
                <Input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="Total bed capacity"
                  min="1"
                  required
                />
              </FormField>

              <FormField label="Status" required>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </FormField>

              <FormField label="Address" className="md:col-span-2">
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter hostel address"
                />
              </FormField>

              {/* Warden Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Warden Information</h3>
              </div>

              <FormField label="Warden Name">
                <Input
                  name="warden"
                  value={formData.warden}
                  onChange={handleChange}
                  placeholder="Enter warden name"
                />
              </FormField>

              <FormField label="Warden Contact">
                <Input
                  name="wardenContact"
                  value={formData.wardenContact}
                  onChange={handleChange}
                  placeholder="Enter contact number"
                />
              </FormField>

              <FormField label="Warden Email" className="md:col-span-2">
                <Input
                  type="email"
                  name="wardenEmail"
                  value={formData.wardenEmail}
                  onChange={handleChange}
                  placeholder="Enter warden email"
                />
              </FormField>

              {/* Additional Information */}
              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
              </div>

              <FormField
                label="Facilities"
                className="md:col-span-2"
                hint="Enter facilities separated by commas (e.g., WiFi, Laundry, Study Room)"
              >
                <Input
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleChange}
                  placeholder="WiFi, Laundry, Study Room, Recreation Room"
                />
              </FormField>

              <FormField label="Description" className="md:col-span-2">
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter hostel description"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </FormField>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <Button
                type="button"
                intent="cancel"
                onClick={() => navigate('/hostel')}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                intent="primary"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? 'Saving...' : isEditMode ? 'Update Hostel' : 'Create Hostel'}
              </Button>
            </div>
          </form>
        </Card>
      </PageContent>
    </PageContainer>
    </Layout>
  );
};

export default AddHostel;
