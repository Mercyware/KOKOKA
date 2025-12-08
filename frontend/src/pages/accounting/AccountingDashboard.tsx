import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  Button,
  Input,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { useSchoolSettings } from '@/contexts/SchoolSettingsContext';
import { getAccountingSummary, type AccountingSummary } from '@/services/accountingService';

const AccountingDashboard: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { settings } = useSchoolSettings();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadSummary();
  }, [dateRange.startDate, dateRange.endDate]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;

      const data = await getAccountingSummary(params);
      setSummary(data.summary);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load accounting summary',
        variant: 'destructive'
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

  return (
    <Layout>
      <PageContainer>
        <PageHeader>
          <div>
            <PageTitle>Accounting Dashboard</PageTitle>
            <PageDescription>Financial overview and money flow tracking</PageDescription>
          </div>
        </PageHeader>

        <PageContent>
          {/* Date Range Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4">
                <Calendar className="h-5 w-5 text-slate-600" />
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Start Date</label>
                    <Input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">End Date</label>
                    <Input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                  </div>
                </div>
                {(dateRange.startDate || dateRange.endDate) && (
                  <Button
                    variant="outline"
                    onClick={() => setDateRange({ startDate: '', endDate: '' })}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Income */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Income</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">
                      {formatCurrency(summary?.totalIncome || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <ArrowUpRight className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-start text-emerald-600 hover:text-emerald-700"
                  onClick={() => navigate('/accounting/income')}
                >
                  View Details →
                </Button>
              </CardContent>
            </Card>

            {/* Total Expenditure */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Expenditure</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatCurrency(summary?.totalExpenditure || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <ArrowDownRight className="h-6 w-6 text-red-600" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 w-full justify-start text-red-600 hover:text-red-700"
                  onClick={() => navigate('/accounting/expenditure')}
                >
                  View Details →
                </Button>
              </CardContent>
            </Card>

            {/* Net Income */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Net Income</p>
                    <p className={`text-2xl font-bold mt-1 ${(summary?.netIncome || 0) >= 0 ? 'text-primary' : 'text-red-600'}`}>
                      {formatCurrency(summary?.netIncome || 0)}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${(summary?.netIncome || 0) >= 0 ? 'bg-primary/10' : 'bg-red-100'}`}>
                    <DollarSign className={`h-6 w-6 ${(summary?.netIncome || 0) >= 0 ? 'text-primary' : 'text-red-600'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  <span>Income by Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.incomeByCategory && summary.incomeByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {summary.incomeByCategory.map((item) => (
                      <div key={item.categoryId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{item.categoryName}</p>
                          <p className="text-sm text-slate-600">{item.count} transactions</p>
                        </div>
                        <p className="font-semibold text-emerald-600">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No income transactions</p>
                )}
              </CardContent>
            </Card>

            {/* Expenditure Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Expenditure by Category</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.expenditureByCategory && summary.expenditureByCategory.length > 0 ? (
                  <div className="space-y-3">
                    {summary.expenditureByCategory.map((item) => (
                      <div key={item.categoryId} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{item.categoryName}</p>
                          <p className="text-sm text-slate-600">{item.count} transactions</p>
                        </div>
                        <p className="font-semibold text-red-600">
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-500 py-8">No expenditure transactions</p>
                )}
              </CardContent>
            </Card>
          </div>
        </PageContent>
      </PageContainer>
    </Layout>
  );
};

export default AccountingDashboard;
