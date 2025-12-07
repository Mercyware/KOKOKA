import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';
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
  DataPagination,
} from '@/components/ui';
import {
  getAllFeeStructures,
  deleteFeeStructure,
  type FeeStructure,
} from '@/services/financeService';
import { useToast } from '@/hooks/use-toast';
import AddFeeStructureDialog from './components/AddFeeStructureDialog';
import EditFeeStructureDialog from './components/EditFeeStructureDialog';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';

const FeeStructuresPage: React.FC = () => {
  const { toast } = useToast();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Dialogs
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedFeeStructure, setSelectedFeeStructure] = useState<FeeStructure | null>(null);

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

  const getFrequencyBadge = (frequency: string) => {
    const colors: Record<string, string> = {
      MONTHLY: 'bg-blue-100 text-blue-800',
      QUARTERLY: 'bg-purple-100 text-purple-800',
      TERMINAL: 'bg-cyan-100 text-cyan-800',
      SEMESTERLY: 'bg-indigo-100 text-indigo-800',
      YEARLY: 'bg-emerald-100 text-emerald-800',
      ONE_TIME: 'bg-gray-100 text-gray-800',
    };

    const labels: Record<string, string> = {
      MONTHLY: 'Monthly',
      QUARTERLY: 'Quarterly',
      TERMINAL: 'Per Term',
      SEMESTERLY: 'Semesterly',
      YEARLY: 'Yearly',
      ONE_TIME: 'One Time',
    };

    return (
      <Badge className={colors[frequency] || 'bg-gray-100 text-gray-800'}>
        {labels[frequency] || frequency.replace('_', ' ')}
      </Badge>
    );
  };

  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await getAllFeeStructures({
        page: currentPage,
        limit: itemsPerPage,
      });

      // Backend returns { feeStructures: [...], pagination: {...} } directly
      setFeeStructures(response.feeStructures || []);
      setTotalItems(response.pagination?.total || 0);
      setTotalPages(response.pagination?.totalPages || 0);
    } catch (error) {
      console.error('Error loading fee structures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fee structures',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEdit = (feeStructure: FeeStructure) => {
    setSelectedFeeStructure(feeStructure);
    setShowEditDialog(true);
  };

  const handleDelete = async (feeStructure: FeeStructure) => {
    if (!confirm(`Are you sure you want to delete "${feeStructure.name}"?`)) {
      return;
    }

    try {
      await deleteFeeStructure(feeStructure.id);
      toast({
        title: 'Success',
        description: 'Fee structure deleted successfully',
      });
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete fee structure',
        variant: 'destructive',
      });
    }
  };

  const handleDialogClose = () => {
    setShowAddDialog(false);
    setShowEditDialog(false);
    setSelectedFeeStructure(null);
    loadData();
  };

  const activeFeeStructures = feeStructures.filter(fs => fs.isActive);
  const inactiveFeeStructures = feeStructures.filter(fs => !fs.isActive);

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <PageTitle>Fee Structures</PageTitle>
            <PageDescription>
              Manage fee types and amounts for your school
            </PageDescription>
          </div>
          <PageActions>
            <Button intent="primary" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </PageActions>
        </PageHeader>

        <PageContent>
          {/* Active Fee Structures */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Active Fee Structures ({activeFeeStructures.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : activeFeeStructures.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No active fee structures found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Grade Level</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeFeeStructures.map((feeStructure) => (
                      <TableRow key={feeStructure.id}>
                        <TableCell className="font-medium">
                          {feeStructure.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {feeStructure.category || 'General'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">
                          {formatCurrency(Number(feeStructure.amount))}
                        </TableCell>
                        <TableCell>
                          {getFrequencyBadge(feeStructure.frequency)}
                        </TableCell>
                        <TableCell>
                          {feeStructure.gradeLevel || 'All Grades'}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-slate-600">
                          {feeStructure.description || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(feeStructure)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(feeStructure)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {!loading && feeStructures.length > 0 && (
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

          {/* Inactive Fee Structures */}
          {inactiveFeeStructures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-500">
                  Inactive Fee Structures ({inactiveFeeStructures.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inactiveFeeStructures.map((feeStructure) => (
                      <TableRow key={feeStructure.id} className="opacity-60">
                        <TableCell className="font-medium">
                          {feeStructure.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {feeStructure.category || 'General'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(Number(feeStructure.amount))}
                        </TableCell>
                        <TableCell>
                          {getFrequencyBadge(feeStructure.frequency)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(feeStructure)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </PageContent>
      </PageContainer>

      {/* Dialogs */}
      {showAddDialog && (
        <AddFeeStructureDialog
          open={showAddDialog}
          onClose={handleDialogClose}
        />
      )}

      {showEditDialog && selectedFeeStructure && (
        <EditFeeStructureDialog
          open={showEditDialog}
          feeStructure={selectedFeeStructure}
          onClose={handleDialogClose}
        />
      )}
    </Layout>
  );
};

export default FeeStructuresPage;
