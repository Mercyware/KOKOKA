import React, { useState, useEffect } from 'react';
import { Plus, CreditCard, Filter, X, FileBarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import {
  PageContainer,
  PageHeader,
  PageTitle,
  PageDescription,
  PageActions,
  PageContent,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DataPagination,
} from '@/components/ui';
import {
  getAllPayments,
  type Payment,
} from '@/services/financeService';
import { getAllClasses, type Class } from '@/services/classService';
import { getAllAcademicYears, type AcademicYear } from '@/services/academicYearService';
import { useToast } from '@/hooks/use-toast';

const PaymentsPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    studentName: '',
    classId: 'all',
    paymentMethod: 'all',
    status: 'all',
    academicYear: 'all',
    term: 'all',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `KES ${amount.toLocaleString()}`;
    }
  };

  const getMethodBadge = (method: string) => {
    const styles: Record<string, string> = {
      CASH: 'bg-green-100 text-green-800',
      BANK_TRANSFER: 'bg-blue-100 text-blue-800',
      CARD: 'bg-purple-100 text-purple-800',
      MOBILE_MONEY: 'bg-indigo-100 text-indigo-800',
      CHEQUE: 'bg-amber-100 text-amber-800',
    };

    return (
      <Badge className={styles[method] || 'bg-gray-100 text-gray-800'}>
        {method.replace('_', ' ')}
      </Badge>
    );
  };

  useEffect(() => {
    loadDropdownData();
  }, []);

  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage]);

  const loadDropdownData = async () => {
    try {
      const [classesResponse, yearsResponse] = await Promise.all([
        getAllClasses(),
        getAllAcademicYears()
      ]);
      setClasses(classesResponse.data || []);
      setAcademicYears(yearsResponse.data?.academicYears || []);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Build query params from filters
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (filters.studentName) params.studentName = filters.studentName;
      if (filters.classId && filters.classId !== 'all') params.classId = filters.classId;
      if (filters.paymentMethod && filters.paymentMethod !== 'all') params.paymentMethod = filters.paymentMethod;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.academicYear && filters.academicYear !== 'all') params.academicYear = filters.academicYear;
      if (filters.term && filters.term !== 'all') params.term = filters.term;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.minAmount) params.minAmount = parseFloat(filters.minAmount);
      if (filters.maxAmount) params.maxAmount = parseFloat(filters.maxAmount);

      const data = await getAllPayments(params);
      setPayments(data.payments);
      setTotalItems(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setCurrentPage(1);
    loadData();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      studentName: '',
      classId: 'all',
      paymentMethod: 'all',
      status: 'all',
      academicYear: 'all',
      term: 'all',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
  };

  const hasActiveFilters =
    filters.studentName !== '' ||
    filters.classId !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.status !== 'all' ||
    filters.academicYear !== 'all' ||
    filters.term !== 'all' ||
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.minAmount !== '' ||
    filters.maxAmount !== '';

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <PageTitle>Payments</PageTitle>
            <PageDescription>
              View and record student payments
            </PageDescription>
          </div>
          <PageActions>
            <Button
              intent="action"
              onClick={() => navigate('/finance/payment-report')}
            >
              <FileBarChart className="h-4 w-4 mr-2" />
              View Report
            </Button>
          </PageActions>
        </PageHeader>

        <PageContent>
          {/* Filter Section */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-primary" />
                  Filters
                </CardTitle>
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {showFilters ? 'Hide' : 'Show'} Filters
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showFilters && (
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Student Name */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Student Name
                    </label>
                    <Input
                      placeholder="Search by name..."
                      value={filters.studentName}
                      onChange={(e) => handleFilterChange('studentName', e.target.value)}
                    />
                  </div>

                  {/* Class */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Class
                    </label>
                    <Select
                      value={filters.classId}
                      onValueChange={(value) => handleFilterChange('classId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Payment Method
                    </label>
                    <Select
                      value={filters.paymentMethod}
                      onValueChange={(value) => handleFilterChange('paymentMethod', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All methods</SelectItem>
                        <SelectItem value="CASH">Cash</SelectItem>
                        <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                        <SelectItem value="CARD">Card</SelectItem>
                        <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                        <SelectItem value="CHEQUE">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Status
                    </label>
                    <Select
                      value={filters.status}
                      onValueChange={(value) => handleFilterChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Academic Year */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Academic Year
                    </label>
                    <Select
                      value={filters.academicYear}
                      onValueChange={(value) => handleFilterChange('academicYear', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All years" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All years</SelectItem>
                        {academicYears.map((year) => (
                          <SelectItem key={year.id} value={year.name}>
                            {year.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Term */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Term
                    </label>
                    <Select
                      value={filters.term}
                      onValueChange={(value) => handleFilterChange('term', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All terms" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All terms</SelectItem>
                        <SelectItem value="TERM_1">Term 1</SelectItem>
                        <SelectItem value="TERM_2">Term 2</SelectItem>
                        <SelectItem value="TERM_3">Term 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    />
                  </div>

                  {/* Min Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Min Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    />
                  </div>

                  {/* Max Amount */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max Amount
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button intent="primary" onClick={applyFilters}>
                    Apply Filters
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Payments Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                {hasActiveFilters ? 'Filtered Payments' : 'Recent Payments'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No payments found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment #</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.paymentNumber}
                        </TableCell>
                        <TableCell>
                          {payment.student?.firstName} {payment.student?.lastName}
                          <div className="text-xs text-slate-500">
                            {payment.student?.admissionNumber}
                          </div>
                        </TableCell>
                        <TableCell>{payment.invoice?.invoiceNumber}</TableCell>
                        <TableCell className="font-semibold text-emerald-600">
                          {formatCurrency(Number(payment.amount))}
                        </TableCell>
                        <TableCell>
                          {getMethodBadge(payment.paymentMethod)}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">
                          {payment.referenceNumber || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              payment.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-800'
                            }
                          >
                            {payment.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {!loading && payments.length > 0 && (
                <DataPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onPageChange={handlePageChange}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />
              )}
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default PaymentsPage;
