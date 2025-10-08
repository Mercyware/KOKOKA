import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { DollarSign, Plus, Edit2, Save, X } from 'lucide-react';
import {
  PageContainer, PageHeader, PageTitle, PageDescription, PageContent,
  Button, Card, LoadingSpinner, toast
} from '@/components/ui';
import hostelService, { HostelFee, Hostel, RoomType, FeeFrequency } from '@/services/hostelService';

interface FeeFormData {
  id?: string;
  hostelId: string;
  roomType: RoomType;
  amount: number;
  currency: string;
  frequency: FeeFrequency;
  securityDeposit: number;
  admissionFee: number;
  description: string;
}

const HostelFees: React.FC = () => {
  const [fees, setFees] = useState<HostelFee[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedHostel, setSelectedHostel] = useState<string>('');

  const [formData, setFormData] = useState<FeeFormData>({
    hostelId: '',
    roomType: 'STANDARD',
    amount: 0,
    currency: 'KES',
    frequency: 'MONTHLY',
    securityDeposit: 0,
    admissionFee: 0,
    description: '',
  });

  useEffect(() => {
    fetchHostels();
  }, []);

  useEffect(() => {
    if (selectedHostel) {
      fetchFees(selectedHostel);
    } else {
      fetchAllFees();
    }
  }, [selectedHostel]);

  const fetchHostels = async () => {
    try {
      const response = await hostelService.getAllHostels({ status: 'ACTIVE' });
      const hostelsList = response.hostels;
      setHostels(hostelsList);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch hostels',
        variant: "destructive",
      });
    }
  };

  const fetchAllFees = async () => {
    try {
      setLoading(true);
      const response = await hostelService.getHostelFees();
      setFees(response.fees);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch fees',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFees = async (hostelId: string) => {
    try {
      setLoading(true);
      const response = await hostelService.getHostelFees({ hostelId });
      setFees(response.fees);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to fetch fees',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    if (!selectedHostel) {
      toast({
        title: "Error",
        description: 'Please select a hostel first',
        variant: "destructive",
      });
      return;
    }

    setFormData({
      hostelId: selectedHostel,
      roomType: 'STANDARD',
      amount: 0,
      currency: 'KES',
      frequency: 'MONTHLY',
      securityDeposit: 0,
      admissionFee: 0,
      description: '',
    });
    setEditingId('new');
  };

  const handleEdit = (fee: HostelFee) => {
    setFormData({
      id: fee.id,
      hostelId: fee.hostelId,
      roomType: fee.roomType,
      amount: fee.amount,
      currency: fee.currency,
      frequency: fee.frequency,
      securityDeposit: fee.securityDeposit || 0,
      admissionFee: fee.admissionFee || 0,
      description: fee.description || '',
    });
    setEditingId(fee.id);
  };

  const handleSave = async () => {
    if (formData.amount <= 0) {
      toast({
        title: "Error",
        description: 'Amount must be greater than 0',
        variant: "destructive",
      });
      return;
    }

    try {
      await hostelService.upsertHostelFee({
        hostelId: formData.hostelId,
        roomType: formData.roomType,
        amount: formData.amount,
        currency: formData.currency,
        frequency: formData.frequency,
        securityDeposit: formData.securityDeposit || undefined,
        admissionFee: formData.admissionFee || undefined,
        description: formData.description || undefined,
      });

      toast({
        title: "Success",
        description: 'Fee saved successfully',
      });
      setEditingId(null);
      if (selectedHostel) {
        fetchFees(selectedHostel);
      } else {
        fetchAllFees();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to save fee',
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      hostelId: '',
      roomType: 'STANDARD',
      amount: 0,
      currency: 'KES',
      frequency: 'MONTHLY',
      securityDeposit: 0,
      admissionFee: 0,
      description: '',
    });
  };

  const getRoomTypeLabel = (type: RoomType) => {
    return type.replace(/_/g, ' ');
  };

  const getFrequencyLabel = (frequency: FeeFrequency) => {
    return frequency.charAt(0) + frequency.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  const formatCurrency = (amount: number, currency?: string) => {
    const currencyCode = currency || 'KES';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      // Fallback for invalid currency codes
      return `${currencyCode} ${amount.toLocaleString()}`;
    }
  };

  if (loading && fees.length === 0) {
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
            <PageTitle>Hostel Fees Management</PageTitle>
            <PageDescription>Configure fees for different room types</PageDescription>
          </div>
          <Button
            intent="primary"
            onClick={handleAddNew}
            disabled={!selectedHostel || editingId !== null}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Fee Structure
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        {/* Hostel Filter */}
        <Card className="p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Hostel</label>
          <select
            value={selectedHostel}
            onChange={(e) => setSelectedHostel(e.target.value)}
            className="w-full md:w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Hostels</option>
            {hostels.map((hostel) => (
              <option key={hostel.id} value={hostel.id}>
                {hostel.name}
              </option>
            ))}
          </select>
        </Card>

        {/* New Fee Form */}
        {editingId === 'new' && (
          <Card className="p-6 mb-6 border-2 border-blue-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Fee Structure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.roomType}
                  onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="KES">KES (Kenya Shilling)</option>
                  <option value="USD">USD (US Dollar)</option>
                  <option value="GBP">GBP (British Pound)</option>
                  <option value="EUR">EUR (Euro)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as FeeFrequency })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="QUARTERLY">Quarterly</option>
                  <option value="SEMESTERLY">Semesterly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="ONE_TIME">One Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                <input
                  type="number"
                  value={formData.securityDeposit}
                  onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admission Fee</label>
                <input
                  type="number"
                  value={formData.admissionFee}
                  onChange={(e) => setFormData({ ...formData, admissionFee: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional description or notes"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <Button intent="primary" onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button intent="cancel" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Fees List */}
        {fees.length === 0 && !editingId ? (
          <Card className="p-12">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No fee structures found</h3>
              <p className="text-gray-600 mb-6">Start by adding fee structures for different room types</p>
              <Button intent="primary" onClick={handleAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Fee Structure
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {fees.map((fee) => (
              <Card key={fee.id} className="p-6">
                {editingId === fee.id ? (
                  // Edit Mode
                  <>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Fee Structure</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Room Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.roomType}
                          onChange={(e) => setFormData({ ...formData, roomType: e.target.value as RoomType })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          disabled
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
                          Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Frequency <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.frequency}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value as FeeFrequency })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="MONTHLY">Monthly</option>
                          <option value="QUARTERLY">Quarterly</option>
                          <option value="SEMESTERLY">Semesterly</option>
                          <option value="YEARLY">Yearly</option>
                          <option value="ONE_TIME">One Time</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                        <input
                          type="number"
                          value={formData.securityDeposit}
                          onChange={(e) => setFormData({ ...formData, securityDeposit: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admission Fee</label>
                        <input
                          type="number"
                          value={formData.admissionFee}
                          onChange={(e) => setFormData({ ...formData, admissionFee: parseFloat(e.target.value) || 0 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button intent="primary" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button intent="cancel" onClick={handleCancel}>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  // View Mode
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {fee.hostel?.name || 'Unknown Hostel'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {getRoomTypeLabel(fee.roomType)} Room
                        </p>
                      </div>
                      <Button
                        intent="action"
                        size="sm"
                        onClick={() => handleEdit(fee)}
                        disabled={editingId !== null}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Base Fee</p>
                        <p className="text-xl font-bold text-gray-900">
                          {formatCurrency(fee.amount, fee.currency)}
                        </p>
                        <p className="text-xs text-gray-500">{getFrequencyLabel(fee.frequency)}</p>
                      </div>

                      {fee.securityDeposit && fee.securityDeposit > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Security Deposit</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {formatCurrency(fee.securityDeposit, fee.currency)}
                          </p>
                        </div>
                      )}

                      {fee.admissionFee && fee.admissionFee > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Admission Fee</p>
                          <p className="text-lg font-semibold text-purple-600">
                            {formatCurrency(fee.admissionFee, fee.currency)}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total Initial Cost</p>
                        <p className="text-lg font-semibold text-green-600">
                          {formatCurrency(
                            fee.amount + (fee.securityDeposit || 0) + (fee.admissionFee || 0),
                            fee.currency
                          )}
                        </p>
                      </div>
                    </div>

                    {fee.description && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600">{fee.description}</p>
                      </div>
                    )}
                  </>
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

export default HostelFees;
