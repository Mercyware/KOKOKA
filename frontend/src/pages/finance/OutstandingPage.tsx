import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingDown } from 'lucide-react';
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
} from '@/components/ui';
import {
  getOutstandingInvoices,
  type Invoice,
} from '@/services/financeService';
import { useToast } from '@/hooks/use-toast';

const OutstandingPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [summary, setSummary] = useState<any>(null);

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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getOutstandingInvoices();
      setInvoices(data.invoices);
      setSummary(data.summary);
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
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default OutstandingPage;
