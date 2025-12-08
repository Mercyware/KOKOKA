import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
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
import { getItems, getCategories, type InventoryItem, type InventoryCategory } from '@/services/inventoryService';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import AddItemDialog from './components/AddItemDialog';

const ItemsPage: React.FC = () => {
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [pagination, setPagination] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showLowStock, setShowLowStock] = useState(false);

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

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
  }, [selectedCategory, selectedStatus, selectedType, showLowStock]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData] = await Promise.all([
        getItems({
          categoryId: selectedCategory && selectedCategory !== 'all' ? selectedCategory : undefined,
          status: selectedStatus && selectedStatus !== 'all' ? selectedStatus : undefined,
          itemType: selectedType && selectedType !== 'all' ? selectedType : undefined,
          lowStock: showLowStock || undefined,
          search: searchQuery || undefined,
        }),
        getCategories(),
      ]);

      setItems(itemsData.items);
      setPagination(itemsData.pagination);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadData();
  };

  const handleAddItem = () => {
    setSelectedItem(null);
    setShowAddDialog(true);
  };

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAddDialog(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'destructive'> = {
      ACTIVE: 'success',
      LOW_STOCK: 'warning',
      OUT_OF_STOCK: 'destructive',
      DISCONTINUED: 'default',
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
            <PageTitle>Inventory Items</PageTitle>
            <PageDescription>Manage all inventory items and stock levels</PageDescription>
          </div>
          <PageActions>
            <Button intent="primary" onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </PageActions>
        </PageHeader>

        <PageContent>
          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by name, code, or barcode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
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
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                    <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ASSET">Asset</SelectItem>
                    <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                    <SelectItem value="EQUIPMENT">Equipment</SelectItem>
                    <SelectItem value="FURNITURE">Furniture</SelectItem>
                    <SelectItem value="ELECTRONICS">Electronics</SelectItem>
                    <SelectItem value="SPORTS">Sports</SelectItem>
                    <SelectItem value="LABORATORY">Laboratory</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center mt-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLowStock}
                    onChange={(e) => setShowLowStock(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Show only low stock items</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                          No items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.itemCode}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.name}</div>
                              {item.location && (
                                <div className="text-sm text-gray-500">
                                  {item.location}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{item.category?.name}</TableCell>
                          <TableCell>{item.itemType}</TableCell>
                          <TableCell>
                            <div>
                              <div className={item.quantity <= item.minimumStock ? 'text-orange-600 font-semibold' : ''}>
                                {item.quantity} {item.unit}
                              </div>
                              <div className="text-xs text-gray-500">
                                Min: {item.minimumStock}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(item.totalValue)}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>{getConditionBadge(item.condition)}</TableCell>
                          <TableCell>
                            <Button
                              intent="action"
                              size="sm"
                              onClick={() => handleEditItem(item)}
                            >
                              Edit
                            </Button>
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

        {/* Add/Edit Dialog */}
        {showAddDialog && (
          <AddItemDialog
            open={showAddDialog}
            onClose={() => {
              setShowAddDialog(false);
              setSelectedItem(null);
            }}
            onSuccess={() => {
              loadData();
              setShowAddDialog(false);
              setSelectedItem(null);
            }}
            item={selectedItem}
            categories={categories}
          />
        )}
      </PageContainer>
    </Layout>
  );
};

export default ItemsPage;
