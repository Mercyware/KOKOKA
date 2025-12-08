import React, { useState, useEffect } from 'react';
import { Plus, ArrowRightLeft } from 'lucide-react';
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
import { getTransactions, getItems, type InventoryTransaction, type InventoryItem } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import TransactionDialog from './components/TransactionDialog';
import { format } from 'date-fns';

const TransactionsPage: React.FC = () => {
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  // Filters
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  // Dialogs
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [selectedItemForTransaction, setSelectedItemForTransaction] = useState<InventoryItem | null>(null);

  const formatCurrency = (amount: number) => {
    const currencyCode = settings.currency.code;
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `${currencyCode} ${amount.toLocaleString()}`;
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedItem, selectedType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, itemsData] = await Promise.all([
        getTransactions({
          itemId: selectedItem && selectedItem !== 'all' ? selectedItem : undefined,
          transactionType: selectedType && selectedType !== 'all' ? selectedType : undefined,
        }),
        getItems({}),
      ]);

      setTransactions(transactionsData.transactions);
      setPagination(transactionsData.pagination);
      setItems(itemsData.items);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load transactions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewTransaction = () => {
    if (items.length === 0) {
      toast({
        title: 'No Items',
        description: 'Please add items first before creating transactions',
        variant: 'destructive',
      });
      return;
    }
    setSelectedItemForTransaction(items[0]);
    setShowTransactionDialog(true);
  };

  const getTransactionBadge = (type: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      PURCHASE: 'success',
      RETURN: 'success',
      DONATION: 'success',
      ISSUE: 'warning',
      WRITE_OFF: 'destructive',
      DISPOSAL: 'destructive',
      ADJUSTMENT: 'default',
      TRANSFER: 'default',
    };

    return (
      <Badge variant={variants[type] || 'default'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <PageTitle>Inventory Transactions</PageTitle>
            <PageDescription>View and manage all inventory stock movements</PageDescription>
          </div>
          <PageActions>
            <Button intent="primary" onClick={handleNewTransaction}>
              <Plus className="w-4 h-4 mr-2" />
              New Transaction
            </Button>
          </PageActions>
        </PageHeader>

        <PageContent>
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={selectedItem} onValueChange={setSelectedItem}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    {items.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} ({item.itemCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Transaction Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PURCHASE">Purchase</SelectItem>
                    <SelectItem value="ISSUE">Issue</SelectItem>
                    <SelectItem value="RETURN">Return</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                    <SelectItem value="WRITE_OFF">Write Off</SelectItem>
                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                    <SelectItem value="DONATION">Donation</SelectItem>
                    <SelectItem value="DISPOSAL">Disposal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History ({transactions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Previous Qty</TableHead>
                      <TableHead>New Qty</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {format(new Date(transaction.transactionDate), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>{getTransactionBadge(transaction.transactionType)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{transaction.item?.name}</div>
                              <div className="text-sm text-gray-500">{transaction.item?.itemCode}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={
                              transaction.transactionType === 'PURCHASE' ||
                              transaction.transactionType === 'RETURN' ||
                              transaction.transactionType === 'DONATION'
                                ? 'text-green-600 font-semibold'
                                : 'text-red-600 font-semibold'
                            }>
                              {transaction.transactionType === 'PURCHASE' ||
                               transaction.transactionType === 'RETURN' ||
                               transaction.transactionType === 'DONATION' ? '+' : '-'}
                              {transaction.quantity} {transaction.item?.unit}
                            </span>
                          </TableCell>
                          <TableCell>{transaction.previousQty}</TableCell>
                          <TableCell className="font-semibold">{transaction.newQty}</TableCell>
                          <TableCell>
                            {transaction.totalAmount ? formatCurrency(transaction.totalAmount) : '-'}
                          </TableCell>
                          <TableCell>
                            {transaction.referenceNumber || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{transaction.user?.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 max-w-xs truncate">
                              {transaction.notes || '-'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </PageContent>

        {/* Transaction Dialog */}
        {showTransactionDialog && selectedItemForTransaction && (
          <TransactionDialog
            open={showTransactionDialog}
            onClose={() => {
              setShowTransactionDialog(false);
              setSelectedItemForTransaction(null);
            }}
            onSuccess={() => {
              loadData();
              setShowTransactionDialog(false);
              setSelectedItemForTransaction(null);
            }}
            item={selectedItemForTransaction}
          />
        )}
      </PageContainer>
    </Layout>
  );
};

export default TransactionsPage;
