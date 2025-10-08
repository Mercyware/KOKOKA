import api from './api';

// Enums matching backend
export enum HostelType {
  BOYS = 'BOYS',
  GIRLS = 'GIRLS',
  MIXED = 'MIXED',
  STAFF = 'STAFF'
}

export enum HostelStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  CLOSED = 'CLOSED'
}

export enum RoomType {
  SINGLE = 'SINGLE',
  DOUBLE = 'DOUBLE',
  TRIPLE = 'TRIPLE',
  QUAD = 'QUAD',
  DORMITORY = 'DORMITORY',
  STANDARD = 'STANDARD',
  DELUXE = 'DELUXE',
  SUITE = 'SUITE'
}

export enum RoomStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  UNDER_MAINTENANCE = 'UNDER_MAINTENANCE',
  RESERVED = 'RESERVED'
}

export enum AllocationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  TRANSFERRED = 'TRANSFERRED'
}

export enum FeeFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMESTERLY = 'SEMESTERLY',
  YEARLY = 'YEARLY',
  ONE_TIME = 'ONE_TIME'
}

// Interfaces
export interface Hostel {
  id: string;
  name: string;
  hostelType: HostelType;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  capacity: number;
  occupiedBeds: number;
  availableBeds: number;
  wardenId?: string;
  warden?: {
    id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    phone?: string;
    user?: {
      email: string;
    };
  };
  facilities: string[];
  description?: string;
  status: HostelStatus;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  rooms?: HostelRoom[];
  allocations?: HostelAllocation[];
  _count?: {
    rooms: number;
    allocations: number;
  };
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  floor?: number;
  roomType: RoomType;
  capacity: number;
  occupiedBeds: number;
  availableBeds: number;
  facilities: string[];
  status: RoomStatus;
  hostelId: string;
  hostel?: Hostel;
  allocations?: HostelAllocation[];
}

export interface HostelAllocation {
  id: string;
  studentId: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber?: string;
    gender?: string;
    class?: {
      id: string;
      name: string;
    };
  };
  hostelId: string;
  hostel?: Hostel;
  roomId: string;
  room?: HostelRoom;
  bedNumber?: string;
  startDate: string;
  endDate?: string;
  status: AllocationStatus;
  academicYearId?: string;
  academicYear?: {
    id: string;
    name: string;
  };
  remarks?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostelFee {
  id: string;
  hostelId: string;
  hostel?: Hostel;
  roomType: RoomType;
  amount: number;
  currency: string;
  frequency: FeeFrequency;
  securityDeposit?: number;
  admissionFee?: number;
  description?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostelStats {
  totalHostels: number;
  totalRooms: number;
  totalCapacity: number;
  totalOccupied: number;
  totalAvailable: number;
  occupancyRate: number;
  hostelBreakdown: Array<{
    hostelId: string;
    name: string;
    capacity: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  }>;
}

// API Functions
export const hostelService = {
  // Hostel CRUD
  getAllHostels: async (params?: {
    page?: number;
    limit?: number;
    status?: HostelStatus;
    hostelType?: HostelType;
    search?: string;
  }) => {
    const response = await api.get('/hostel/hostels', { params });
    return response.data;
  },

  getHostelById: async (id: string) => {
    const response = await api.get(`/hostel/hostels/${id}`);
    return response.data;
  },

  createHostel: async (data: {
    name: string;
    hostelType: HostelType;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    address?: string;
    capacity: number;
    wardenId?: string;
    facilities?: string[];
    description?: string;
    status?: HostelStatus;
  }) => {
    const response = await api.post('/hostel/hostels', data);
    return response.data;
  },

  updateHostel: async (id: string, data: Partial<Hostel>) => {
    const response = await api.put(`/hostel/hostels/${id}`, data);
    return response.data;
  },

  deleteHostel: async (id: string) => {
    const response = await api.delete(`/hostel/hostels/${id}`);
    return response.data;
  },

  // Room operations
  getHostelRooms: async (hostelId: string) => {
    const response = await api.get(`/hostel/hostels/${hostelId}/rooms`);
    return response.data;
  },

  createRoom: async (data: {
    roomNumber: string;
    floor?: number;
    roomType: RoomType;
    capacity: number;
    facilities?: string[];
    status?: RoomStatus;
    hostelId: string;
  }) => {
    const response = await api.post('/hostel/rooms', data);
    return response.data;
  },

  // Allocation operations
  getAllAllocations: async (params?: {
    page?: number;
    limit?: number;
    hostelId?: string;
    studentId?: string;
    status?: AllocationStatus;
    academicYearId?: string;
  }) => {
    const response = await api.get('/hostel/allocations', { params });
    return response.data;
  },

  allocateStudent: async (data: {
    studentId: string;
    hostelId: string;
    roomId: string;
    bedNumber?: string;
    startDate: string;
    endDate?: string;
    academicYearId?: string;
    remarks?: string;
  }) => {
    const response = await api.post('/hostel/allocations', data);
    return response.data;
  },

  deallocateStudent: async (id: string) => {
    const response = await api.put(`/hostel/allocations/${id}/deallocate`);
    return response.data;
  },

  // Statistics
  getHostelStats: async () => {
    const response = await api.get('/hostel/stats');
    return response.data;
  },

  // Fee operations
  getHostelFees: async (params?: {
    hostelId?: string;
    roomType?: RoomType;
  }) => {
    const response = await api.get('/hostel/fees', { params });
    return response.data;
  },

  upsertHostelFee: async (data: {
    hostelId: string;
    roomType: RoomType;
    amount: number;
    currency?: string;
    frequency: FeeFrequency;
    securityDeposit?: number;
    admissionFee?: number;
    description?: string;
  }) => {
    const response = await api.post('/hostel/fees', data);
    return response.data;
  },
};

export default hostelService;
