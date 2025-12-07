import React, { useState, useEffect } from 'react';
import { Plus, CreditCard } from 'lucide-react';
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
} from '@/components/ui';
import {
  getAllPayments,
  type Payment,
} from '@/services/financeService';
import { useToast } from '@/hooks/use-toast';

const PaymentsPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

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
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getAllPayments({ limit: 50 });
      setPayments(data.payments);
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
        </PageHeader>

        <PageContent>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Recent Payments
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
            </CardContent>
          </Card>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default PaymentsPage;
