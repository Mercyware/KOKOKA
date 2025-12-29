import { get, post, put, del } from './api';
import { ApiResponse } from '../types';

// ==================== TYPES ====================

export interface FeeStructure {
  id: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  description?: string;
  amount: number;
  frequency: 'MONTHLY' | 'QUARTERLY' | 'TERMINAL' | 'SEMESTERLY' | 'YEARLY' | 'ONE_TIME';
  isActive: boolean;
  gradeLevel?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  academicYear?: {
    id: string;
    name: string;
  };
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  schoolId: string;
  studentId: string;
  masterInvoiceId?: string;
  academicYear: string;
  term: string;
  issueDate: string;
  dueDate: string;
  status: 'DRAFT' | 'ISSUED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  hasCustomItems: boolean;
  discountReason?: string;
  lastReminderDate?: string;
  reminderCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    email?: string;
    phone?: string;
    currentClass?: {
      name: string;
    };
  };
  masterInvoice?: {
    id: string;
    name: string;
    academicYear?: {
      name: string;
    };
  };
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface MasterInvoice {
  id: string;
  schoolId: string;
  name: string;
  description?: string;
  academicYearId: string;
  term: string;
  gradeLevel?: string;
  classId?: string;
  dueDate: string;
  isActive: boolean;
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  academicYear?: {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
  };
  class?: {
    id: string;
    name: string;
    grade: string;
  };
  items?: MasterInvoiceItem[];
  childInvoices?: Invoice[];
  _count?: {
    childInvoices: number;
  };
}

export interface MasterInvoiceItem {
  id: string;
  masterInvoiceId: string;
  feeStructureId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  isMandatory: boolean;
  feeStructure?: {
    name: string;
    category?: string;
    amount?: number;
  };
}

export interface CreateMasterInvoiceData {
  name: string;
  description?: string;
  academicYearId: string;
  term: string;
  gradeLevel?: string;
  classId?: string;
  dueDate: string;
  items: {
    feeStructureId?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    isMandatory?: boolean;
  }[];
}

export interface GenerateChildInvoicesData {
  studentIds?: string[];
  applyToAll?: boolean;
}

export interface MasterInvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalBalance: number;
  statusBreakdown: {
    DRAFT: number;
    ISSUED: number;
    PARTIAL: number;
    PAID: number;
    OVERDUE: number;
    CANCELLED: number;
  };
  collectionRate: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  feeStructureId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  feeStructure?: {
    name: string;
    category?: string;
  };
}

export interface Payment {
  id: string;
  paymentNumber: string;
  schoolId: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY' | 'CHEQUE';
  referenceNumber?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  notes?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    email?: string;
    phone?: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    academicYear: string;
    term: string;
    total: number;
    balance: number;
    items?: InvoiceItem[];
  };
}

export interface PaymentSummary {
  totalPayments: number;
  totalAmount: number;
  byMethod: {
    method: string;
    count: number;
    amount: number;
  }[];
}

export interface PaymentReport {
  summary: {
    totalPayments: number;
    totalAmount: number;
    averagePayment: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  breakdown: {
    byMethod: {
      method: string;
      count: number;
      amount: number;
      percentage: number;
    }[];
    byAcademicYear: {
      academicYear: string;
      count: number;
      amount: number;
      percentage: number;
    }[];
    byTerm: {
      term: string;
      count: number;
      amount: number;
      percentage: number;
    }[];
    byFeeCategory: {
      category: string;
      count: number;
      amount: number;
      percentage: number;
    }[];
  };
  topPayers: {
    studentId: string;
    studentName: string;
    admissionNumber: string;
    grade: string;
    count: number;
    amount: number;
  }[];
  dailyCollections: {
    date: string;
    count: number;
    amount: number;
  }[];
  groupedData?: any;
  payments: {
    id: string;
    paymentNumber: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber?: string;
    status: string;
    student: {
      id: string;
      name: string;
      admissionNumber: string;
      grade: string;
    };
    invoice: {
      invoiceNumber: string;
      academicYear: string;
      term: string;
      total: number;
    } | null;
  }[];
}

export interface CreateInvoiceData {
  studentId: string;
  academicYear: string;
  term: string;
  dueDate: string;
  items: {
    feeStructureId?: string;
    description: string;
    quantity?: number;
    unitPrice: number;
    amount: number;
  }[];
  discount?: number;
  tax?: number;
  notes?: string;
}

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY' | 'CHEQUE';
  paymentDate?: string;
  referenceNumber?: string;
  notes?: string;
}

// ==================== FEE STRUCTURES ====================

export const getAllFeeStructures = async (params?: {
  isActive?: boolean;
  academicYearId?: string;
  gradeLevel?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{
  feeStructures: FeeStructure[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>> => {
  return await get<{
    feeStructures: FeeStructure[];
    pagination?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>('/finance/fee-structures', params);
};

export const getFeeStructureById = async (id: string): Promise<ApiResponse<FeeStructure>> => {
  return await get<FeeStructure>(`/finance/fee-structures/${id}`);
};

export const createFeeStructure = async (data: Omit<FeeStructure, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<FeeStructure>> => {
  return await post<FeeStructure>('/finance/fee-structures', data);
};

export const updateFeeStructure = async (id: string, data: Partial<Omit<FeeStructure, 'id' | 'schoolId' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<FeeStructure>> => {
  return await put<FeeStructure>(`/finance/fee-structures/${id}`, data);
};

export const deleteFeeStructure = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  return await del<{ message: string }>(`/finance/fee-structures/${id}`);
};

// ==================== INVOICES ====================

export const getAllInvoices = async (params?: {
  status?: string;
  studentId?: string;
  academicYear?: string;
  term?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ invoices: Invoice[]; pagination: any }>> => {
  return await get<{ invoices: Invoice[]; pagination: any }>('/finance/invoices', params);
};

export const getInvoiceById = async (id: string): Promise<ApiResponse<Invoice>> => {
  return await get<Invoice>(`/finance/invoices/${id}`);
};

export const createInvoice = async (data: CreateInvoiceData): Promise<ApiResponse<Invoice>> => {
  return await post<Invoice>('/finance/invoices', data);
};

export const updateInvoice = async (id: string, data: {
  dueDate?: string;
  discount?: number;
  tax?: number;
  notes?: string;
  status?: string;
}): Promise<ApiResponse<Invoice>> => {
  return await put<Invoice>(`/finance/invoices/${id}`, data);
};

export const deleteInvoice = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  return await del<{ message: string }>(`/finance/invoices/${id}`);
};

export const sendInvoiceEmail = async (
  id: string,
  sendTo: 'student' | 'guardian' = 'student'
): Promise<ApiResponse<{ message: string; jobId: string; recipient: string }>> => {
  return await post<{ message: string; jobId: string; recipient: string }>(
    `/finance/invoices/${id}/send`,
    { sendTo }
  );
};

export const downloadInvoicePDF = (id: string): string => {
  const token = localStorage.getItem('token');
  const schoolSubdomain = localStorage.getItem('schoolSubdomain');
  return `${import.meta.env.VITE_API_URL}/finance/invoices/${id}/pdf?token=${token}&subdomain=${schoolSubdomain}`;
};

export const getOutstandingInvoices = async (params?: {
  studentId?: string;
  studentName?: string;
  classId?: string;
  academicYear?: string;
  term?: string;
  status?: string;
  minBalance?: number;
  maxBalance?: number;
  overdueDays?: number;
  sortBy?: 'dueDate' | 'balance' | 'studentName' | 'total';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{
  invoices: Invoice[];
  summary: {
    totalInvoices: number;
    totalOutstanding: number;
    totalInvoiced: number;
    totalPaid: number;
    overdueCount: number;
    byStatus: {
      status: string;
      count: number;
      totalBalance: number;
    }[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}>> => {
  return await get<{
    invoices: Invoice[];
    summary: {
      totalInvoices: number;
      totalOutstanding: number;
      totalInvoiced: number;
      totalPaid: number;
      overdueCount: number;
      byStatus: {
        status: string;
        count: number;
        totalBalance: number;
      }[];
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>('/finance/invoices/outstanding', params);
};

// ==================== PAYMENTS ====================

export const getAllPayments = async (params?: {
  status?: string;
  studentId?: string;
  invoiceId?: string;
  paymentMethod?: string;
  studentName?: string;
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  term?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ payments: Payment[]; pagination: any }>> => {
  return await get<{ payments: Payment[]; pagination: any }>('/finance/payments', params);
};

export const getPaymentById = async (id: string): Promise<ApiResponse<Payment>> => {
  return await get<Payment>(`/finance/payments/${id}`);
};

export const createPayment = async (data: CreatePaymentData): Promise<ApiResponse<Payment>> => {
  return await post<Payment>('/finance/payments', data);
};

export const updatePayment = async (id: string, data: {
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
  status?: string;
}): Promise<ApiResponse<Payment>> => {
  return await put<Payment>(`/finance/payments/${id}`, data);
};

export const deletePayment = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  return await del<{ message: string }>(`/finance/payments/${id}`);
};

export const getPaymentSummary = async (params?: {
  startDate?: string;
  endDate?: string;
  academicYear?: string;
}): Promise<ApiResponse<PaymentSummary>> => {
  return await get<PaymentSummary>('/finance/payments/summary', params);
};

export const getPaymentReport = async (params?: {
  startDate?: string;
  endDate?: string;
  academicYear?: string;
  term?: string;
  studentId?: string;
  classId?: string;
  paymentMethod?: string;
  status?: string;
  groupBy?: 'none' | 'student' | 'method' | 'academicYear' | 'term' | 'date';
}): Promise<ApiResponse<PaymentReport>> => {
  return await get<PaymentReport>('/finance/payments/report', params);
};

// ==================== PAYSTACK PAYMENTS ====================

export const initializePaystackPayment = async (data: {
  invoiceId: string;
  amount: number;
  email: string;
}): Promise<ApiResponse<{
  authorization_url: string;
  access_code: string;
  reference: string;
}>> => {
  return await post<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }>('/finance/payments/paystack/initialize', data);
};

export const verifyPaystackPayment = async (reference: string): Promise<ApiResponse<{
  message: string;
  payment: Payment;
}>> => {
  return await get<{
    message: string;
    payment: Payment;
  }>(`/finance/payments/paystack/verify/${reference}`);
};

// ==================== MASTER INVOICES ====================

export const getAllMasterInvoices = async (params?: {
  isActive?: boolean;
  academicYearId?: string;
  classId?: string;
  gradeLevel?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{
  masterInvoices: MasterInvoice[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}>> => {
  return await get<{
    masterInvoices: MasterInvoice[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>('/finance/master-invoices', params);
};

export const getMasterInvoiceById = async (id: string): Promise<ApiResponse<MasterInvoice>> => {
  return await get<MasterInvoice>(`/finance/master-invoices/${id}`);
};

export const createMasterInvoice = async (data: CreateMasterInvoiceData): Promise<ApiResponse<MasterInvoice>> => {
  return await post<MasterInvoice>('/finance/master-invoices', data);
};

export const updateMasterInvoice = async (
  id: string,
  data: Partial<Omit<CreateMasterInvoiceData, 'academicYearId' | 'term'>> & { isActive?: boolean }
): Promise<ApiResponse<MasterInvoice>> => {
  return await put<MasterInvoice>(`/finance/master-invoices/${id}`, data);
};

export const deleteMasterInvoice = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  return await del<{ message: string }>(`/finance/master-invoices/${id}`);
};

export const generateChildInvoices = async (
  masterInvoiceId: string,
  data: GenerateChildInvoicesData
): Promise<ApiResponse<{
  message: string;
  generated: number;
  skipped: number;
  invoices: Invoice[];
}>> => {
  return await post<{
    message: string;
    generated: number;
    skipped: number;
    invoices: Invoice[];
  }>(`/finance/master-invoices/${masterInvoiceId}/generate`, data);
};

export const getMasterInvoiceStats = async (masterInvoiceId: string): Promise<ApiResponse<MasterInvoiceStats>> => {
  return await get<MasterInvoiceStats>(`/finance/master-invoices/${masterInvoiceId}/stats`);
};
