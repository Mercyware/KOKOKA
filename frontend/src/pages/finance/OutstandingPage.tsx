import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown, Filter, X, DollarSign, Clock } from 'lucide-react';
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
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DataPagination,
} from '@/components/ui';
import {
  getOutstandingInvoices,
  type Invoice,
} from '@/services/financeService';
import { getAllClasses } from '@/services/classService';
import { getAllAcademicYears } from '@/services/academicYearService';
import { useToast } from '@/hooks/use-toast';

const OutstandingPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter states
  const [filters, setFilters] = useState({
    studentName: '',
    classId: 'all',
    academicYear: 'all',
    term: 'all',
    status: 'all',
    minBalance: '',
    maxBalance: '',
    overdueDays: '',
    sortBy: 'dueDate' as 'dueDate' | 'balance' | 'studentName' | 'total',
    sortOrder: 'asc' as 'asc' | 'desc',
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

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
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
      if (filters.academicYear && filters.academicYear !== 'all') params.academicYear = filters.academicYear;
      if (filters.term && filters.term !== 'all') params.term = filters.term;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.minBalance) params.minBalance = parseFloat(filters.minBalance);
      if (filters.maxBalance) params.maxBalance = parseFloat(filters.maxBalance);
      if (filters.overdueDays) params.overdueDays = parseInt(filters.overdueDays);
      if (filters.sortBy) params.sortBy = filters.sortBy;
      if (filters.sortOrder) params.sortOrder = filters.sortOrder;

      const data = await getOutstandingInvoices(params);
      setInvoices(data.invoices);
      setSummary(data.summary);
      setTotalItems(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error loading outstanding invoices:', error);
      toast({
        title: 'Error',
        description: 'Failed to load outstanding invoices',
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
    setCurrentPage(1); // Reset to first page when applying filters
    loadData();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const clearFilters = () => {
    setFilters({
      studentName: '',
      classId: 'all',
      academicYear: 'all',
      term: 'all',
      status: 'all',
      minBalance: '',
      maxBalance: '',
      overdueDays: '',
      sortBy: 'dueDate',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    filters.studentName !== '' ||
    filters.classId !== 'all' ||
    filters.academicYear !== 'all' ||
    filters.term !== 'all' ||
    filters.status !== 'all' ||
    filters.minBalance !== '' ||
    filters.maxBalance !== '' ||
    filters.overdueDays !== '';

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <PageTitle>Outstanding Debt</PageTitle>
            <PageDescription>
              Track unpaid invoices and outstanding balances
            </PageDescription>
          </div>
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
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
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
                        <SelectItem value="all">All Outstanding</SelectItem>
                        <SelectItem value="ISSUED">Issued</SelectItem>
                        <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                        <SelectItem value="OVERDUE">Overdue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Min Balance */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Min Balance
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.minBalance}
                      onChange={(e) => handleFilterChange('minBalance', e.target.value)}
                    />
                  </div>

                  {/* Max Balance */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Max Balance
                    </label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={filters.maxBalance}
                      onChange={(e) => handleFilterChange('maxBalance', e.target.value)}
                    />
                  </div>

                  {/* Overdue Days */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Overdue By (Days)
                    </label>
                    <Input
                      type="number"
                      placeholder="e.g., 30"
                      value={filters.overdueDays}
                      onChange={(e) => handleFilterChange('overdueDays', e.target.value)}
                    />
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Sort By
                    </label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => handleFilterChange('sortBy', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dueDate">Due Date</SelectItem>
                        <SelectItem value="balance">Balance</SelectItem>
                        <SelectItem value="studentName">Student Name</SelectItem>
                        <SelectItem value="total">Total Amount</SelectItem>
                      </SelectContent>
                    </Select>
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

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Outstanding</p>
                      <p className="text-3xl font-bold text-red-600 mt-2">
                        {formatCurrency(summary.totalOutstanding)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Outstanding Invoices</p>
                      <p className="text-3xl font-bold text-primary mt-2">
                        {summary.totalInvoices}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <AlertCircle className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Total Invoiced</p>
                      <p className="text-2xl font-bold text-slate-900 mt-2">
                        {formatCurrency(summary.totalInvoiced)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-slate-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Overdue Invoices</p>
                      <p className="text-2xl font-bold text-amber-600 mt-2">
                        {summary.overdueCount}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Outstanding Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Outstanding Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-emerald-600 text-lg font-semibold">
                    ✓ No outstanding debts!
                  </div>
                  <p className="text-slate-500 mt-2">All invoices are fully paid</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Days Overdue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const daysOverdue = getDaysOverdue(invoice.dueDate);
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell>
                            {invoice.student?.firstName} {invoice.student?.lastName}
                            <div className="text-xs text-slate-500">
                              {invoice.student?.admissionNumber}
                            </div>
                          </TableCell>
                          <TableCell>
                            {invoice.student?.currentClass?.name || '-'}
                          </TableCell>
                          <TableCell>{invoice.term}</TableCell>
                          <TableCell>
                            {new Date(invoice.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Number(invoice.total))}
                          </TableCell>
                          <TableCell className="text-emerald-600">
                            {formatCurrency(Number(invoice.amountPaid))}
                          </TableCell>
                          <TableCell className="font-semibold text-red-600">
                            {formatCurrency(Number(invoice.balance))}
                          </TableCell>
                          <TableCell>
                            {daysOverdue > 0 ? (
                              <Badge className="bg-red-100 text-red-800">
                                {daysOverdue} days
                              </Badge>
                            ) : (
                              <span className="text-slate-500">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {!loading && invoices.length > 0 && (
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

export default OutstandingPage;
