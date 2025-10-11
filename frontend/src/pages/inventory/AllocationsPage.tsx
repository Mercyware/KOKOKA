import React, { useState, useEffect } from 'react';
import { Plus, UserCog } from 'lucide-react';
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
import { getAllocations, getItems, updateAllocation, type InventoryAllocation, type InventoryItem } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';
import AllocationDialog from './components/AllocationDialog';
import { format } from 'date-fns';

const AllocationsPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [allocations, setAllocations] = useState<InventoryAllocation[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  // Filters
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');

  // Dialogs
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [selectedItemForAllocation, setSelectedItemForAllocation] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedItem, selectedStatus, selectedType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allocationsData, itemsData] = await Promise.all([
        getAllocations({
          itemId: selectedItem && selectedItem !== 'all' ? selectedItem : undefined,
          status: selectedStatus && selectedStatus !== 'all' ? selectedStatus : undefined,
          allocatedToType: selectedType && selectedType !== 'all' ? selectedType : undefined,
        }),
        getItems({}),
      ]);

      setAllocations(allocationsData.allocations);
      setPagination(allocationsData.pagination);
      setItems(itemsData.items);
    } catch (error) {
      console.error('Error loading allocations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load allocations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewAllocation = () => {
    if (items.length === 0) {
      toast({
        title: 'No Items',
        description: 'Please add items first before creating allocations',
        variant: 'destructive',
      });
      return;
    }
    setSelectedItemForAllocation(items[0]);
    setShowAllocationDialog(true);
  };

  const handleReturnItem = async (allocation: InventoryAllocation) => {
    try {
      await updateAllocation(allocation.id, {
        status: 'RETURNED',
        actualReturn: new Date().toISOString(),
        returnCondition: 'GOOD',
      });

      toast({
        title: 'Success',
        description: 'Item marked as returned',
      });

      loadData();
    } catch (error) {
      console.error('Error returning item:', error);
      toast({
        title: 'Error',
        description: 'Failed to return item',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      ALLOCATED: 'warning',
      RETURNED: 'success',
      OVERDUE: 'destructive',
      LOST: 'destructive',
      DAMAGED: 'destructive',
      CANCELLED: 'default',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getConditionBadge = (condition: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      EXCELLENT: 'success',
      GOOD: 'success',
      FAIR: 'warning',
      POOR: 'warning',
      DAMAGED: 'destructive',
    };

    return (
      <Badge variant={variants[condition] || 'default'}>
        {condition}
      </Badge>
    );
  };

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <PageTitle>Inventory Allocations</PageTitle>
            <PageDescription>Track items allocated to students, teachers, and departments</PageDescription>
          </div>
          <PageActions>
            <Button intent="primary" onClick={handleNewAllocation}>
              <Plus className="w-4 h-4 mr-2" />
              New Allocation
            </Button>
          </PageActions>
        </PageHeader>

        <PageContent>
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="ALLOCATED">Allocated</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="LOST">Lost</SelectItem>
                    <SelectItem value="DAMAGED">Damaged</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="STAFF">Staff</SelectItem>
                    <SelectItem value="DEPARTMENT">Department</SelectItem>
                    <SelectItem value="CLASS">Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Allocations Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Allocations ({allocations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Allocated To</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Allocation Date</TableHead>
                      <TableHead>Expected Return</TableHead>
                      <TableHead>Actual Return</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allocations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                          No allocations found
                        </TableCell>
                      </TableRow>
                    ) : (
                      allocations.map((allocation) => (
                        <TableRow key={allocation.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{allocation.item?.name}</div>
                              <div className="text-sm text-gray-500">{allocation.item?.itemCode}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{allocation.allocatedTo}</div>
                              <div className="text-sm text-gray-500">{allocation.purpose}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{allocation.allocatedToType}</Badge>
                          </TableCell>
                          <TableCell>
                            {allocation.quantity} {allocation.item?.unit}
                          </TableCell>
                          <TableCell>
                            {format(new Date(allocation.allocationDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            {allocation.expectedReturn
                              ? format(new Date(allocation.expectedReturn), 'MMM dd, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {allocation.actualReturn
                              ? format(new Date(allocation.actualReturn), 'MMM dd, yyyy')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {allocation.returnCondition
                              ? getConditionBadge(allocation.returnCondition)
                              : getConditionBadge(allocation.issuedCondition)}
                          </TableCell>
                          <TableCell>{getStatusBadge(allocation.status)}</TableCell>
                          <TableCell>
                            {allocation.status === 'ALLOCATED' && (
                              <Button
                                intent="action"
                                size="sm"
                                onClick={() => handleReturnItem(allocation)}
                              >
                                Mark Returned
                              </Button>
                            )}
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

        {/* Allocation Dialog */}
        {showAllocationDialog && selectedItemForAllocation && (
          <AllocationDialog
            open={showAllocationDialog}
            onClose={() => {
              setShowAllocationDialog(false);
              setSelectedItemForAllocation(null);
            }}
            onSuccess={() => {
              loadData();
              setShowAllocationDialog(false);
              setSelectedItemForAllocation(null);
            }}
            item={selectedItemForAllocation}
          />
        )}
      </PageContainer>
    </Layout>
  );
};

export default AllocationsPage;
