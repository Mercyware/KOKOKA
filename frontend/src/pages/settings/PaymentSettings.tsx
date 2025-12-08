import React, { useState, useEffect } from 'react';
import { CreditCard, Building, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import {
  getBanks,
  verifyBankAccount,
  getSubaccount,
  createSubaccount,
  updateSubaccount,
  deleteSubaccount,
  type Bank,
  type SubaccountInfo
} from '@/services/accountingService';

const PaymentSettings: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [subaccountInfo, setSubaccountInfo] = useState<SubaccountInfo | null>(null);
  const [showSetupForm, setShowSetupForm] = useState(false);

  const [formData, setFormData] = useState({
    bankCode: '',
    accountNumber: '',
    accountName: '',
  });

  const [verifiedAccount, setVerifiedAccount] = useState<{
    accountNumber: string;
    accountName: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [banksData, subaccountData] = await Promise.all([
        getBanks(),
        getSubaccount()
      ]);

      setBanks(banksData.banks || []);
      setSubaccountInfo(subaccountData);

      if (!subaccountData.hasSubaccount) {
        setShowSetupForm(true);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load payment settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!formData.bankCode || !formData.accountNumber) {
      toast({
        title: 'Error',
        description: 'Please select a bank and enter account number',
        variant: 'destructive'
      });
      return;
    }

    try {
      setVerifying(true);
      const result = await verifyBankAccount({
        accountNumber: formData.accountNumber,
        bankCode: formData.bankCode
      });

      setVerifiedAccount({
        accountNumber: result.accountDetails.accountNumber,
        accountName: result.accountDetails.accountName
      });

      setFormData(prev => ({
        ...prev,
        accountName: result.accountDetails.accountName
      }));

      toast({
        title: 'Success',
        description: 'Bank account verified successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.response?.data?.message || 'Failed to verify bank account',
        variant: 'destructive'
      });
      setVerifiedAccount(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleCreateSubaccount = async () => {
    if (!verifiedAccount) {
      toast({
        title: 'Error',
        description: 'Please verify your bank account first',
        variant: 'destructive'
      });
      return;
    }

    try {
      setSubmitting(true);
      await createSubaccount({
        accountNumber: formData.accountNumber,
        bankCode: formData.bankCode,
        accountName: formData.accountName
      });

      toast({
        title: 'Success',
        description: 'Payment account created successfully'
      });

      setShowSetupForm(false);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create payment account',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubaccount = async () => {
    if (!confirm('Are you sure you want to remove your payment account? This will prevent online payments.')) {
      return;
    }

    try {
      setSubmitting(true);
      await deleteSubaccount();

      toast({
        title: 'Success',
        description: 'Payment account removed successfully'
      });

      setShowSetupForm(true);
      loadData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove payment account',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subaccount Status */}
      {subaccountInfo?.hasSubaccount && !showSetupForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <CardTitle>Payment Account Active</CardTitle>
                  <CardDescription>Your school can receive online payments</CardDescription>
                </div>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800">Active</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-600">Account Name</Label>
                <p className="font-medium">{subaccountInfo.subaccount?.accountName}</p>
              </div>
              <div>
                <Label className="text-slate-600">Account Number</Label>
                <p className="font-medium">{subaccountInfo.subaccount?.accountNumber}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-sm text-slate-700">Payment Split Configuration</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Your Share</p>
                  <p className="font-semibold text-lg text-emerald-600">90%</p>
                </div>
                <div>
                  <p className="text-slate-600">Platform Fee</p>
                  <p className="font-semibold text-lg text-slate-600">10%</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                intent="cancel"
                onClick={handleDeleteSubaccount}
                disabled={submitting}
              >
                Remove Account
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup Form */}
      {showSetupForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Setup Payment Account</CardTitle>
                <CardDescription>
                  Configure your bank account to receive online payments from students
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Payment Split: 90% School / 10% Platform</p>
                <p>
                  When students make online payments, 90% goes directly to your bank account and 10% goes to the platform.
                  A digital fee is also added to each transaction.
                </p>
              </div>
            </div>

            {/* Bank Selection */}
            <div>
              <Label htmlFor="bankCode">Select Bank *</Label>
              <Select
                value={formData.bankCode}
                onValueChange={(value) => {
                  setFormData({ ...formData, bankCode: value });
                  setVerifiedAccount(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Number */}
            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <div className="flex space-x-2">
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="0123456789"
                  value={formData.accountNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, accountNumber: e.target.value });
                    setVerifiedAccount(null);
                  }}
                  maxLength={10}
                />
                <Button
                  intent="action"
                  onClick={handleVerifyAccount}
                  disabled={!formData.bankCode || !formData.accountNumber || verifying}
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>

            {/* Verified Account Name */}
            {verifiedAccount && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-900">Account Verified</p>
                    <p className="text-sm text-emerald-700 mt-1">
                      {verifiedAccount.accountName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              {subaccountInfo?.hasSubaccount && (
                <Button
                  intent="cancel"
                  onClick={() => setShowSetupForm(false)}
                >
                  Cancel
                </Button>
              )}
              <Button
                intent="primary"
                onClick={handleCreateSubaccount}
                disabled={!verifiedAccount || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Building className="h-4 w-4 mr-2" />
                    Create Payment Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentSettings;
