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
  items?: InvoiceItem[];
  payments?: Payment[];
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

export const getAllFeeStructures = async (params?: { isActive?: boolean }): Promise<ApiResponse<FeeStructure[]>> => {
  return await get<FeeStructure[]>('/finance/fee-structures', params);
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

export const getOutstandingInvoices = async (params?: {
  studentId?: string;
}): Promise<ApiResponse<{
  invoices: Invoice[];
  summary: {
    totalInvoices: number;
    totalOutstanding: number;
  };
}>> => {
  return await get<{
    invoices: Invoice[];
    summary: {
      totalInvoices: number;
      totalOutstanding: number;
    };
  }>('/finance/invoices/outstanding', params);
};

// ==================== PAYMENTS ====================

export const getAllPayments = async (params?: {
  status?: string;
  studentId?: string;
  invoiceId?: string;
  paymentMethod?: string;
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
