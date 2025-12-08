import api from './api';

// ==================== TYPES ====================

export interface AccountingCategory {
  id: string;
  schoolId: string;
  name: string;
  type: 'INCOME' | 'EXPENDITURE';
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeTransaction {
  id: string;
  schoolId: string;
  categoryId: string;
  paymentId?: string;
  amount: number;
  date: string;
  description: string;
  source: string;
  reference?: string;
  notes?: string;
  totalAmount?: number;
  platformFee?: number;
  platformFeePercentage?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  category?: AccountingCategory;
  payment?: any;
}

export interface ExpenditureTransaction {
  id: string;
  schoolId: string;
  categoryId: string;
  amount: number;
  date: string;
  description: string;
  payee: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  receiptUrl?: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  category?: AccountingCategory;
}

export interface AccountingSummary {
  totalIncome: number;
  totalExpenditure: number;
  netIncome: number;
  incomeByCategory: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
  }>;
  expenditureByCategory: Array<{
    categoryId: string;
    categoryName: string;
    amount: number;
    count: number;
  }>;
}

export interface SubaccountInfo {
  hasSubaccount: boolean;
  subaccount?: {
    subaccountCode: string;
    accountName: string;
    accountNumber: string;
    bankCode: string;
  };
}

export interface Bank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
}

// ==================== CATEGORIES ====================

export const getCategories = async (type?: 'INCOME' | 'EXPENDITURE') => {
  const params = type ? { type } : {};
  const response = await api.get('/accounting/categories', { params });
  return response.data;
};

export const createCategory = async (data: {
  name: string;
  type: 'INCOME' | 'EXPENDITURE';
  description?: string;
}) => {
  const response = await api.post('/accounting/categories', data);
  return response.data;
};

// ==================== INCOME ====================

export const getIncomeTransactions = async (params?: {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  source?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/accounting/income', { params });
  return response.data;
};

export const createIncomeTransaction = async (data: {
  categoryId: string;
  amount: number;
  date?: string;
  description: string;
  source: string;
  reference?: string;
  notes?: string;
}) => {
  const response = await api.post('/accounting/income', data);
  return response.data;
};

// ==================== EXPENDITURE ====================

export const getExpenditureTransactions = async (params?: {
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  payee?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api.get('/accounting/expenditure', { params });
  return response.data;
};

export const createExpenditureTransaction = async (data: {
  categoryId: string;
  amount: number;
  date?: string;
  description: string;
  payee: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  receiptUrl?: string;
}) => {
  const response = await api.post('/accounting/expenditure', data);
  return response.data;
};

export const updateExpenditureTransaction = async (id: string, data: {
  status?: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED' | 'CANCELLED';
  notes?: string;
}) => {
  const response = await api.put(`/accounting/expenditure/${id}`, data);
  return response.data;
};

// ==================== SUMMARY ====================

export const getAccountingSummary = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get('/accounting/summary', { params });
  return response.data;
};

// ==================== SUBACCOUNT ====================

export const getBanks = async (): Promise<{ success: boolean; banks: Bank[] }> => {
  const response = await api.get('/schools/settings/banks');
  return response.data;
};

export const verifyBankAccount = async (data: {
  accountNumber: string;
  bankCode: string;
}): Promise<{ success: boolean; accountDetails: { accountNumber: string; accountName: string; bankId: number } }> => {
  const response = await api.post('/schools/settings/verify-bank', data);
  return response.data;
};

export const getSubaccount = async (): Promise<SubaccountInfo> => {
  const response = await api.get('/schools/settings/subaccount');
  return response.data;
};

export const createSubaccount = async (data: {
  accountNumber: string;
  bankCode: string;
  accountName: string;
}) => {
  const response = await api.post('/schools/settings/subaccount', data);
  return response.data;
};

export const updateSubaccount = async (data: {
  accountNumber?: string;
  bankCode?: string;
  accountName?: string;
}) => {
  const response = await api.put('/schools/settings/subaccount', data);
  return response.data;
};

export const deleteSubaccount = async () => {
  const response = await api.delete('/schools/settings/subaccount');
  return response.data;
};
