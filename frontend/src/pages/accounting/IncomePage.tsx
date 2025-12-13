import React, { useState, useEffect } from 'react';
import { Plus, Download, Calendar, Filter, TrendingUp } from 'lucide-react';
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
  getIncomeTransactions,
  getCategories,
  createIncomeTransaction,
  type IncomeTransaction,
  type AccountingCategory,
} from '@/services/accountingService';
import { format } from 'date-fns';

const IncomePage: React.FC = () => {
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<IncomeTransaction[]>([]);
  const [categories, setCategories] = useState<AccountingCategory[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, startDate, endDate, currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incomeResponse, categoriesResponse] = await Promise.all([
        getIncomeTransactions({
          categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: currentPage,
        }),
        getCategories({ type: 'INCOME' }),
      ]);

      setTransactions(incomeResponse.transactions);
      setPagination(incomeResponse.pagination);
      setCategories(categoriesResponse.categories);
    } catch (error: any) {
      console.error('Error fetching income data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load income transactions',
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

  const totalIncome = transactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <PageTitle>Income Transactions</PageTitle>
            <PageDescription>Track all income and revenue</PageDescription>
          </div>
          <PageActions>
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
                  <p className="text-sm text-slate-600 mb-1">Total Income</p>
                  <p className="text-3xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-2">No income transactions found</p>
                  <p className="text-sm text-slate-500">
                    Income will be recorded automatically from student payments
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
                        <TableHead>Source</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Platform Fee</TableHead>
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
                          <TableCell>{transaction.source || '-'}</TableCell>
                          <TableCell className="font-mono text-sm">
                            {transaction.reference || '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600">
                            {formatCurrency(parseFloat(transaction.amount.toString()))}
                          </TableCell>
                          <TableCell className="text-right text-sm text-slate-600">
                            {transaction.platformFee
                              ? formatCurrency(parseFloat(transaction.platformFee.toString()))
                              : '-'}
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
      </PageContainer>
    </Layout>
  );
};

export default IncomePage;
