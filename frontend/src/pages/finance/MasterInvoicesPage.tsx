import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Users, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageContent,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatusBadge,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui';
import { getAllMasterInvoices, deleteMasterInvoice, getMasterInvoiceStats, type MasterInvoice } from '@/services/financeService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { getAllClasses } from '@/services/classService';
import { useToast } from '@/hooks/use-toast';
import { formatAmount } from '@/lib/currency';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';

const MasterInvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(false);
  const [masterInvoices, setMasterInvoices] = useState<MasterInvoice[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Filters
  const [filters, setFilters] = useState({
    isActive: 'true',
    academicYearId: 'all',
    classId: 'all',
    search: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadMasterInvoices();
  }, [filters, pagination.page]);

  const loadInitialData = async () => {
    try {
      const [academicYearsResponse, classesResponse] = await Promise.all([
        getAllAcademicYears(),
        getAllClasses()
      ]);

      if (academicYearsResponse?.success && academicYearsResponse.data?.academicYears) {
        setAcademicYears(academicYearsResponse.data.academicYears);
      }

      if (classesResponse?.success && classesResponse.data) {
        setClasses(Array.isArray(classesResponse.data) ? classesResponse.data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadMasterInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (filters.isActive && filters.isActive !== 'all') {
        params.isActive = filters.isActive === 'true';
      }

      if (filters.academicYearId && filters.academicYearId !== 'all') {
        params.academicYearId = filters.academicYearId;
      }

      if (filters.classId && filters.classId !== 'all') {
        params.classId = filters.classId;
      }

      const response = await getAllMasterInvoices(params);

      if (response?.success && response.data) {
        setMasterInvoices(response.data.masterInvoices || []);
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages
          }));
        }
      }
    } catch (error) {
      console.error('Error loading master invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load master invoices',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await deleteMasterInvoice(id);

      if (response?.success) {
        toast({
          title: 'Success',
          description: 'Master invoice deleted successfully'
        });
        loadMasterInvoices();
      } else {
        toast({
          title: 'Error',
          description: response?.message || 'Failed to delete master invoice',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete master invoice',
        variant: 'destructive'
      });
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getScopeDisplay = (invoice: MasterInvoice) => {
    if (invoice.class) {
      return invoice.class.name;
    } else if (invoice.gradeLevel) {
      return `Grade: ${invoice.gradeLevel}`;
    } else {
      return 'All Students';
    }
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div className="flex items-center justify-between">
            <div>
              <PageTitle>Master Invoices</PageTitle>
              <PageDescription>
                Create invoice templates and generate bulk invoices for classes
              </PageDescription>
            </div>
            <Button
              intent="primary"
              onClick={() => navigate('/finance/master-invoices/create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Master Invoice
            </Button>
          </div>
        </PageHeader>

        <PageContent>
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={filters.isActive}
                    onValueChange={(value) => handleFilterChange('isActive', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Academic Year</Label>
                  <Select
                    value={filters.academicYearId}
                    onValueChange={(value) => handleFilterChange('academicYearId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All years" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Class</Label>
                  <Select
                    value={filters.classId}
                    onValueChange={(value) => handleFilterChange('classId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    intent="cancel"
                    className="w-full"
                    onClick={() => {
                      setFilters({
                        isActive: 'true',
                        academicYearId: 'all',
                        classId: 'all',
                        search: ''
                      });
                      setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Master Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : masterInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No master invoices found. Create one to get started.
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Scope</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Child Invoices</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.name}</TableCell>
                          <TableCell>{invoice.academicYear?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {invoice.term.replace('TERM_', 'Term ')}
                            </span>
                          </TableCell>
                          <TableCell>{getScopeDisplay(invoice)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatAmount(Number(invoice.total), settings)}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              <span>{invoice._count?.childInvoices || 0}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <StatusBadge variant={invoice.isActive ? 'success' : 'danger'}>
                              {invoice.isActive ? 'Active' : 'Inactive'}
                            </StatusBadge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                intent="action"
                                size="sm"
                                onClick={() => navigate(`/finance/master-invoices/${invoice.id}`)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                intent="action"
                                size="sm"
                                onClick={() => navigate(`/finance/master-invoices/${invoice.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                intent="danger"
                                size="sm"
                                onClick={() => handleDelete(invoice.id, invoice.name)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Showing {masterInvoices.length} of {pagination.total} master invoices
                      </div>
                      <div className="flex gap-2">
                        <Button
                          intent="cancel"
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={pagination.page === 1}
                        >
                          Previous
                        </Button>
                        <span className="px-4 py-2 text-sm">
                          Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <Button
                          intent="cancel"
                          size="sm"
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={pagination.page >= pagination.totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default MasterInvoicesPage;
