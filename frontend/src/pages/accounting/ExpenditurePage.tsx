import React, { useState, useEffect } from 'react';
import { Plus, Download, Calendar, Filter, TrendingDown, CheckCircle, Clock, XCircle } from 'lucide-react';
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
  Badge,
  DataPagination,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import {
  getExpenditureTransactions,
  getCategories,
  type ExpenditureTransaction,
  type AccountingCategory,
} from '@/services/accountingService';
import { format } from 'date-fns';
import AddExpenditureDialog from './components/AddExpenditureDialog';

const ExpenditurePage: React.FC = () => {
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<ExpenditureTransaction[]>([]);
  const [categories, setCategories] = useState<AccountingCategory[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedStatus, startDate, endDate, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expenditureResponse, categoriesResponse] = await Promise.all([
        getExpenditureTransactions({
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          status: selectedStatus === 'all' ? undefined : selectedStatus,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: currentPage,
        }),
        getCategories({ type: 'EXPENDITURE' }),
      ]);

      setTransactions(expenditureResponse.transactions);
      setPagination(expenditureResponse.pagination);
      setCategories(categoriesResponse.categories);
    } catch (error: any) {
      console.error('Error fetching expenditure data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load expenditure transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleExport = () => {
    toast({
      title: 'Coming Soon',
      description: 'Export functionality will be available soon',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Approved
        </Badge>;
      case 'PAID':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>;
      case 'PENDING':
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-700 border-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalExpenditure = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <PageTitle>Expenditure Transactions</PageTitle>
            <PageDescription>Track all expenses and payments</PageDescription>
          </div>
          <PageActions>
            <Button intent="primary" size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expenditure
            </Button>
            <Button intent="action" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </PageActions>
        </PageHeader>

        <PageContent>
          {/* Summary Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total Expenditure</p>
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenditure)}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedStatus('all');
                      setStartDate('');
                      setEndDate('');
                    }}
                    className="w-full"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingDown className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No expenditure transactions found</p>
                  <p className="text-sm text-slate-500">
                    Create expenditure transactions to track your expenses
                  </p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Vendor/Recipient</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.category.name}</Badge>
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {transaction.description}
                          </TableCell>
                          <TableCell>{transaction.vendor || '-'}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {transaction.reference || '-'}
                          </TableCell>
                          <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">
                            {formatCurrency(parseFloat(transaction.amount.toString()))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-4">
                      <DataPagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={setCurrentPage}
                      />
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </PageContent>

        {/* Add Expenditure Dialog */}
        <AddExpenditureDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onSuccess={fetchData}
        />
      </PageContainer>
    </Layout>
  );
};

export default ExpenditurePage;
