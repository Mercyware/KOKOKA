import api from './api';

// ================================
// TYPES & INTERFACES
// ================================

export interface TransportRoute {
  id: string;
  routeName: string;
  routeNumber?: string;
  description?: string;
  startPoint: string;
  endPoint: string;
  stops: RouteStop[];
  distance?: number;
  estimatedTime?: number;
  fare: number;
  currency: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED';
  isActive: boolean;
  schoolId: string;
  vehicles?: RouteVehicleAssignment[];
  studentAssignments?: StudentTransportAssignment[];
  _count?: {
    studentAssignments: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  name: string;
  time: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleName?: string;
  vehicleType: 'BUS' | 'VAN' | 'CAR' | 'MINIBUS' | 'COACH';
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  registrationNumber?: string;
  seatingCapacity: number;
  currentOccupancy: number;
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  insuranceExpiry?: string;
  roadworthyExpiry?: string;
  gpsEnabled: boolean;
  gpsDeviceId?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE' | 'RETIRED';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NEEDS_REPAIR';
  schoolId: string;
  routeAssignments?: RouteVehicleAssignment[];
  studentAssignments?: StudentTransportAssignment[];
  maintenanceRecords?: VehicleMaintenance[];
  _count?: {
    studentAssignments: number;
    maintenanceRecords: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RouteVehicleAssignment {
  id: string;
  routeId: string;
  route?: TransportRoute;
  vehicleId: string;
  vehicle?: Vehicle;
  dayOfWeek: string[];
  departureTime?: string;
  arrivalTime?: string;
  direction: 'TO_SCHOOL' | 'FROM_SCHOOL' | 'BOTH';
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudentTransportAssignment {
  id: string;
  studentId: string;
  student?: {
    id: string;
    admissionNumber: string;
    firstName: string;
    lastName: string;
    phone?: string;
    currentClass?: {
      id: string;
      name: string;
    };
  };
  routeId: string;
  route?: TransportRoute;
  vehicleId?: string;
  vehicle?: Vehicle;
  pickupPoint: string;
  pickupTime?: string;
  dropoffPoint: string;
  dropoffTime?: string;
  guardianName?: string;
  guardianPhone?: string;
  startDate: string;
  endDate?: string;
  academicYearId?: string;
  academicYear?: {
    id: string;
    name: string;
  };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CANCELLED';
  isActive: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleMaintenance {
  id: string;
  vehicleId: string;
  vehicle?: Vehicle;
  maintenanceType:
    | 'ROUTINE_SERVICE'
    | 'REPAIR'
    | 'INSPECTION'
    | 'OIL_CHANGE'
    | 'TIRE_REPLACEMENT'
    | 'BRAKE_SERVICE'
    | 'ENGINE_REPAIR'
    | 'BODY_WORK'
    | 'ELECTRICAL'
    | 'EMERGENCY'
    | 'OTHER';
  description?: string;
  cost?: number;
  currency: string;
  serviceProvider?: string;
  mechanicName?: string;
  mechanicPhone?: string;
  scheduledDate?: string;
  completedDate?: string;
  nextServiceDate?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'OVERDUE';
  odometerReading?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalRoutes: number;
  activeRoutes: number;
  totalVehicles: number;
  activeVehicles: number;
  totalStudents: number;
  vehicleStats: {
    status: string;
    _count: number;
  }[];
}

// ================================
// API FUNCTIONS - ROUTES
// ================================

export const getRoutes = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  const response = await api.get('/transportation/routes', { params });
  return response.data;
};

export const getRoute = async (id: string) => {
  const response = await api.get(`/transportation/routes/${id}`);
  return response.data;
};

export const createRoute = async (data: Partial<TransportRoute>) => {
  const response = await api.post('/transportation/routes', data);
  return response.data;
};

export const updateRoute = async (id: string, data: Partial<TransportRoute>) => {
  const response = await api.put(`/transportation/routes/${id}`, data);
  return response.data;
};

export const deleteRoute = async (id: string) => {
  const response = await api.delete(`/transportation/routes/${id}`);
  return response.data;
};

// ================================
// API FUNCTIONS - VEHICLES
// ================================

export const getVehicles = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  vehicleType?: string;
  search?: string;
}) => {
  const response = await api.get('/transportation/vehicles', { params });
  return response.data;
};

export const getVehicle = async (id: string) => {
  const response = await api.get(`/transportation/vehicles/${id}`);
  return response.data;
};

export const createVehicle = async (data: Partial<Vehicle>) => {
  const response = await api.post('/transportation/vehicles', data);
  return response.data;
};

export const updateVehicle = async (id: string, data: Partial<Vehicle>) => {
  const response = await api.put(`/transportation/vehicles/${id}`, data);
  return response.data;
};

export const deleteVehicle = async (id: string) => {
  const response = await api.delete(`/transportation/vehicles/${id}`);
  return response.data;
};

// ================================
// API FUNCTIONS - STUDENT ASSIGNMENTS
// ================================

export const getStudentAssignments = async (params?: {
  page?: number;
  limit?: number;
  routeId?: string;
  vehicleId?: string;
  status?: string;
  classId?: string;
  search?: string;
}) => {
  const response = await api.get('/transportation/assignments', { params });
  return response.data;
};

export const getStudentAssignment = async (id: string) => {
  const response = await api.get(`/transportation/assignments/${id}`);
  return response.data;
};

export const createStudentAssignment = async (data: Partial<StudentTransportAssignment>) => {
  const response = await api.post('/transportation/assignments', data);
  return response.data;
};

export const updateStudentAssignment = async (id: string, data: Partial<StudentTransportAssignment>) => {
  const response = await api.put(`/transportation/assignments/${id}`, data);
  return response.data;
};

export const deleteStudentAssignment = async (id: string) => {
  const response = await api.delete(`/transportation/assignments/${id}`);
  return response.data;
};

// ================================
// API FUNCTIONS - MAINTENANCE
// ================================

export const getMaintenanceRecords = async (vehicleId: string, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await api.get(`/transportation/vehicles/${vehicleId}/maintenance`, { params });
  return response.data;
};

export const createMaintenanceRecord = async (data: Partial<VehicleMaintenance>) => {
  const response = await api.post('/transportation/maintenance', data);
  return response.data;
};

export const updateMaintenanceRecord = async (id: string, data: Partial<VehicleMaintenance>) => {
  const response = await api.put(`/transportation/maintenance/${id}`, data);
  return response.data;
};

export const deleteMaintenanceRecord = async (id: string) => {
  const response = await api.delete(`/transportation/maintenance/${id}`);
  return response.data;
};

// ================================
// API FUNCTIONS - DASHBOARD
// ================================

export const getDashboardStats = async () => {
  const response = await api.get('/transportation/dashboard/stats');
  return response.data;
};
