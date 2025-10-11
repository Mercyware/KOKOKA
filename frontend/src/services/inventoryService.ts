import api from './api';

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  parent?: InventoryCategory;
  children?: InventoryCategory[];
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  itemCode: string;
  barcode?: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  quantity: number;
  minimumStock: number;
  maximumStock?: number;
  reorderLevel?: number;
  unit: string;
  location?: string;
  shelf?: string;
  bin?: string;
  unitPrice: number;
  totalValue: number;
  currency: string;
  supplierName?: string;
  supplierContact?: string;
  itemType: string;
  status: string;
  condition: string;
  expiryDate?: string;
  warrantyExpiry?: string;
  notes?: string;
  tags?: string[];
  imageUrl?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    transactions: number;
    allocations: number;
  };
}

export interface InventoryTransaction {
  id: string;
  transactionType: string;
  quantity: number;
  unitPrice?: number;
  totalAmount?: number;
  itemId: string;
  item?: {
    id: string;
    name: string;
    itemCode: string;
    unit: string;
  };
  previousQty: number;
  newQty: number;
  referenceType?: string;
  referenceId?: string;
  referenceNumber?: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  supplierName?: string;
  recipientName?: string;
  recipientType?: string;
  recipientId?: string;
  reason?: string;
  notes?: string;
  transactionDate: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAllocation {
  id: string;
  itemId: string;
  item?: {
    id: string;
    name: string;
    itemCode: string;
    unit: string;
  };
  quantity: number;
  allocatedTo: string;
  allocatedToType: string;
  allocatedToId?: string;
  allocationDate: string;
  expectedReturn?: string;
  actualReturn?: string;
  status: string;
  issuedCondition: string;
  returnCondition?: string;
  allocatedBy: string;
  allocatedByUser?: {
    id: string;
    name: string;
    email: string;
  };
  purpose?: string;
  notes?: string;
  returnNotes?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  overview: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    activeAllocations: number;
  };
  recentTransactions: InventoryTransaction[];
  itemsByCategory: any[];
  itemsByType: any[];
}

// ================================
// CATEGORIES
// ================================

export const getCategories = async (): Promise<InventoryCategory[]> => {
  const response = await api.get('/inventory/categories');
  return response.data;
};

export const getCategory = async (id: string): Promise<InventoryCategory> => {
  const response = await api.get(`/inventory/categories/${id}`);
  return response.data;
};

export const createCategory = async (data: Partial<InventoryCategory>): Promise<InventoryCategory> => {
  const response = await api.post('/inventory/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<InventoryCategory>): Promise<InventoryCategory> => {
  const response = await api.put(`/inventory/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`/inventory/categories/${id}`);
};

// ================================
// ITEMS
// ================================

export const getItems = async (params?: {
  categoryId?: string;
  status?: string;
  itemType?: string;
  search?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}): Promise<{ items: InventoryItem[]; pagination: any }> => {
  const response = await api.get('/inventory/items', { params });
  return response.data;
};

export const getItem = async (id: string): Promise<InventoryItem> => {
  const response = await api.get(`/inventory/items/${id}`);
  return response.data;
};

export const createItem = async (data: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await api.post('/inventory/items', data);
  return response.data;
};

export const updateItem = async (id: string, data: Partial<InventoryItem>): Promise<InventoryItem> => {
  const response = await api.put(`/inventory/items/${id}`, data);
  return response.data;
};

export const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`/inventory/items/${id}`);
};

// ================================
// TRANSACTIONS
// ================================

export const getTransactions = async (params?: {
  itemId?: string;
  transactionType?: string;
  page?: number;
  limit?: number;
}): Promise<{ transactions: InventoryTransaction[]; pagination: any }> => {
  const response = await api.get('/inventory/transactions', { params });
  return response.data;
};

export const createTransaction = async (data: Partial<InventoryTransaction>): Promise<InventoryTransaction> => {
  const response = await api.post('/inventory/transactions', data);
  return response.data;
};

// ================================
// ALLOCATIONS
// ================================

export const getAllocations = async (params?: {
  itemId?: string;
  status?: string;
  allocatedToType?: string;
  page?: number;
  limit?: number;
}): Promise<{ allocations: InventoryAllocation[]; pagination: any }> => {
  const response = await api.get('/inventory/allocations', { params });
  return response.data;
};

export const getAllocation = async (id: string): Promise<InventoryAllocation> => {
  const response = await api.get(`/inventory/allocations/${id}`);
  return response.data;
};

export const createAllocation = async (data: Partial<InventoryAllocation>): Promise<InventoryAllocation> => {
  const response = await api.post('/inventory/allocations', data);
  return response.data;
};

export const updateAllocation = async (id: string, data: Partial<InventoryAllocation>): Promise<InventoryAllocation> => {
  const response = await api.put(`/inventory/allocations/${id}`, data);
  return response.data;
};

export const deleteAllocation = async (id: string): Promise<void> => {
  await api.delete(`/inventory/allocations/${id}`);
};

// ================================
// DASHBOARD
// ================================

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/inventory/dashboard');
  return response.data;
};
