import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Filter, X, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import {
  getPaymentReport,
  type PaymentReport,
} from '@/services/financeService';
import { getAllClasses, type Class } from '@/services/classService';
import { getAllAcademicYears, type AcademicYear } from '@/services/academicYearService';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';

const PaymentReportPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<PaymentReport | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    classId: 'all',
    academicYear: 'all',
    term: 'all',
    paymentMethod: 'all',
    status: 'COMPLETED',
    groupBy: 'none' as 'none' | 'student' | 'method' | 'academicYear' | 'term' | 'date',
  });

  const formatCurrency = (amount: number) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: settings.currency.code,
        minimumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `${settings.currency.symbol}${amount.toLocaleString()}`;
    }
  };

  useEffect(() => {
    loadDropdownData();
    loadReport();
  }, []);

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

  const loadReport = async () => {
    try {
      setLoading(true);
      setReport(null); // Reset report state

      // Build query params from filters
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.classId && filters.classId !== 'all') params.classId = filters.classId;
      if (filters.academicYear && filters.academicYear !== 'all') params.academicYear = filters.academicYear;
      if (filters.term && filters.term !== 'all') params.term = filters.term;
      if (filters.paymentMethod && filters.paymentMethod !== 'all') params.paymentMethod = filters.paymentMethod;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.groupBy && filters.groupBy !== 'none') params.groupBy = filters.groupBy;

      const data = await getPaymentReport(params);
      setReport(data);
    } catch (error) {
      console.error('Error loading payment report:', error);
      setReport(null); // Ensure report is null on error
      toast({
        title: 'Error',
        description: 'Failed to load payment report. Please try again.',
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
    loadReport();
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      classId: 'all',
      academicYear: 'all',
      term: 'all',
      paymentMethod: 'all',
      status: 'COMPLETED',
      groupBy: 'none',
    });
  };

  const hasActiveFilters =
    filters.startDate !== '' ||
    filters.endDate !== '' ||
    filters.classId !== 'all' ||
    filters.academicYear !== 'all' ||
    filters.term !== 'all' ||
    filters.paymentMethod !== 'all' ||
    filters.groupBy !== 'none';

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/finance/payments')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <PageTitle>Payment Report</PageTitle>
            </div>
            <PageDescription>
              Comprehensive payment analytics and insights
            </PageDescription>
          </div>
          <PageActions>
            <Button intent="action">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
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
                  Report Filters
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

                  {/* Group By */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Group By
                    </label>
                    <Select
                      value={filters.groupBy}
                      onValueChange={(value) => handleFilterChange('groupBy', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="No grouping" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No grouping</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="method">Payment Method</SelectItem>
                        <SelectItem value="academicYear">Academic Year</SelectItem>
                        <SelectItem value="term">Term</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button intent="primary" onClick={applyFilters}>
                    Generate Report
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>

          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading report...</div>
          ) : !report ? (
            <div className="text-center py-12 text-slate-500">No data available</div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Total Payments</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {report.summary.totalPayments}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Total Amount</p>
                        <p className="text-2xl font-bold text-emerald-600">
                          {formatCurrency(report.summary.totalAmount)}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Average Payment</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {formatCurrency(report.summary.averagePayment)}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Top Payers</p>
                        <p className="text-2xl font-bold text-slate-900">
                          {report.topPayers.length}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Payment Method Breakdown */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Method Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Count</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Percentage</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.breakdown.byMethod.map((item) => (
                        <TableRow key={item.method}>
                          <TableCell className="font-medium">
                            {item.method.replace('_', ' ')}
                          </TableCell>
                          <TableCell className="text-right">{item.count}</TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">
                            {formatCurrency(item.amount)}
                          </TableCell>
                          <TableCell className="text-right">{item.percentage}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Top Payers */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Top 10 Payers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Admission No.</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead className="text-right">Payments</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.topPayers.map((payer) => (
                        <TableRow key={payer.studentId}>
                          <TableCell className="font-medium">{payer.studentName}</TableCell>
                          <TableCell>{payer.admissionNumber}</TableCell>
                          <TableCell>{payer.grade}</TableCell>
                          <TableCell className="text-right">{payer.count}</TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">
                            {formatCurrency(payer.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Academic Year Breakdown */}
              {report.breakdown.byAcademicYear.length > 0 && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Academic Year Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Academic Year</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.breakdown.byAcademicYear.map((item) => (
                          <TableRow key={item.academicYear}>
                            <TableCell className="font-medium">{item.academicYear}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                            <TableCell className="text-right font-semibold text-emerald-600">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell className="text-right">{item.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Fee Category Breakdown */}
              {report.breakdown.byFeeCategory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category</TableHead>
                          <TableHead className="text-right">Count</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Percentage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.breakdown.byFeeCategory.map((item) => (
                          <TableRow key={item.category}>
                            <TableCell className="font-medium">{item.category}</TableCell>
                            <TableCell className="text-right">{item.count}</TableCell>
                            <TableCell className="text-right font-semibold text-emerald-600">
                              {formatCurrency(item.amount)}
                            </TableCell>
                            <TableCell className="text-right">{item.percentage}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default PaymentReportPage;
