const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ================================
// ROUTES
// ================================

// Get all routes
exports.getRoutes = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    const where = {
      schoolId: req.school.id,
    };

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { routeName: { contains: search, mode: 'insensitive' } },
        { routeNumber: { contains: search, mode: 'insensitive' } },
        { startPoint: { contains: search, mode: 'insensitive' } },
        { endPoint: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [routes, total] = await Promise.all([
      prisma.transportRoute.findMany({
        where,
        include: {
          vehicles: {
            include: {
              vehicle: true,
            },
          },
          studentAssignments: {
            where: { isActive: true },
          },
          _count: {
            select: {
              studentAssignments: true,
            },
          },
        },
        orderBy: { routeName: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.transportRoute.count({ where }),
    ]);

    res.json({
      success: true,
      routes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get a single route
exports.getRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.transportRoute.findFirst({
      where: {
        id,
        schoolId: req.school.id,
      },
      include: {
        vehicles: {
          include: {
            vehicle: true,
          },
        },
        studentAssignments: {
          include: {
            student: {
              select: {
                id: true,
                admissionNumber: true,
                firstName: true,
                lastName: true,
                currentClass: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            vehicle: true,
          },
        },
      },
    });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    res.json({ success: true, route });
  } catch (error) {
    console.error('Error fetching route:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a new route
exports.createRoute = async (req, res) => {
  try {
    const {
      routeName,
      routeNumber,
      description,
      startPoint,
      endPoint,
      stops,
      distance,
      estimatedTime,
      fare,
      currency,
      status,
    } = req.body;

    if (!routeName || !startPoint || !endPoint) {
      return res.status(400).json({
        success: false,
        message: 'Route name, start point, and end point are required',
      });
    }

    const route = await prisma.transportRoute.create({
      data: {
        routeName,
        routeNumber,
        description,
        startPoint,
        endPoint,
        stops: stops || [],
        distance: distance ? parseFloat(distance) : null,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
        fare: fare ? parseFloat(fare) : 0,
        currency: currency || 'KES',
        status: status || 'ACTIVE',
        isActive: true,
        schoolId: req.school.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Route created successfully',
      route,
    });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a route
exports.updateRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      routeName,
      routeNumber,
      description,
      startPoint,
      endPoint,
      stops,
      distance,
      estimatedTime,
      fare,
      currency,
      status,
      isActive,
    } = req.body;

    const existingRoute = await prisma.transportRoute.findFirst({
      where: { id, schoolId: req.school.id },
    });

    if (!existingRoute) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    const route = await prisma.transportRoute.update({
      where: { id },
      data: {
        ...(routeName && { routeName }),
        ...(routeNumber !== undefined && { routeNumber }),
        ...(description !== undefined && { description }),
        ...(startPoint && { startPoint }),
        ...(endPoint && { endPoint }),
        ...(stops !== undefined && { stops }),
        ...(distance !== undefined && { distance: distance ? parseFloat(distance) : null }),
        ...(estimatedTime !== undefined && { estimatedTime: estimatedTime ? parseInt(estimatedTime) : null }),
        ...(fare !== undefined && { fare: parseFloat(fare) }),
        ...(currency && { currency }),
        ...(status && { status }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      message: 'Route updated successfully',
      route,
    });
  } catch (error) {
    console.error('Error updating route:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a route
exports.deleteRoute = async (req, res) => {
  try {
    const { id } = req.params;

    const route = await prisma.transportRoute.findFirst({
      where: { id, schoolId: req.school.id },
      include: {
        studentAssignments: {
          where: { isActive: true },
        },
      },
    });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    if (route.studentAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete route with active student assignments',
      });
    }

    await prisma.transportRoute.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Route deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting route:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ================================
// VEHICLES
// ================================

// Get all vehicles
exports.getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, vehicleType, search } = req.query;

    const where = {
      schoolId: req.school.id,
    };

    if (status) where.status = status;
    if (vehicleType) where.vehicleType = vehicleType;
    if (search) {
      where.OR = [
        { vehicleNumber: { contains: search, mode: 'insensitive' } },
        { vehicleName: { contains: search, mode: 'insensitive' } },
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { driverName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        include: {
          routeAssignments: {
            where: { isActive: true },
            include: {
              route: true,
            },
          },
          _count: {
            select: {
              studentAssignments: true,
              maintenanceRecords: true,
            },
          },
        },
        orderBy: { vehicleNumber: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.vehicle.count({ where }),
    ]);

    res.json({
      success: true,
      vehicles,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get a single vehicle
exports.getVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id,
        schoolId: req.school.id,
      },
      include: {
        routeAssignments: {
          include: {
            route: true,
          },
        },
        studentAssignments: {
          where: { isActive: true },
          include: {
            student: {
              select: {
                id: true,
                admissionNumber: true,
                firstName: true,
                lastName: true,
                currentClass: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            route: true,
          },
        },
        maintenanceRecords: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({ success: true, vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a new vehicle
exports.createVehicle = async (req, res) => {
  try {
    const {
      vehicleNumber,
      vehicleName,
      vehicleType,
      make,
      model,
      year,
      color,
      registrationNumber,
      seatingCapacity,
      driverName,
      driverPhone,
      driverLicense,
      lastServiceDate,
      nextServiceDate,
      insuranceExpiry,
      roadworthyExpiry,
      gpsEnabled,
      gpsDeviceId,
      status,
      condition,
    } = req.body;

    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number and vehicle type are required',
      });
    }

    // Check if vehicle number already exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { vehicleNumber },
    });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number already exists',
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleNumber,
        vehicleName,
        vehicleType,
        make,
        model,
        year: year ? parseInt(year) : null,
        color,
        registrationNumber,
        seatingCapacity: seatingCapacity ? parseInt(seatingCapacity) : 0,
        currentOccupancy: 0,
        driverName,
        driverPhone,
        driverLicense,
        lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
        nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,
        roadworthyExpiry: roadworthyExpiry ? new Date(roadworthyExpiry) : null,
        gpsEnabled: gpsEnabled || false,
        gpsDeviceId,
        status: status || 'ACTIVE',
        condition: condition || 'GOOD',
        schoolId: req.school.id,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      vehicle,
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a vehicle
exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingVehicle = await prisma.vehicle.findFirst({
      where: { id, schoolId: req.school.id },
    });

    if (!existingVehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    // If updating vehicle number, check uniqueness
    if (updateData.vehicleNumber && updateData.vehicleNumber !== existingVehicle.vehicleNumber) {
      const duplicate = await prisma.vehicle.findUnique({
        where: { vehicleNumber: updateData.vehicleNumber },
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle number already exists',
        });
      }
    }

    // Prepare update data
    const data = {};
    if (updateData.vehicleNumber) data.vehicleNumber = updateData.vehicleNumber;
    if (updateData.vehicleName !== undefined) data.vehicleName = updateData.vehicleName;
    if (updateData.vehicleType) data.vehicleType = updateData.vehicleType;
    if (updateData.make !== undefined) data.make = updateData.make;
    if (updateData.model !== undefined) data.model = updateData.model;
    if (updateData.year !== undefined) data.year = updateData.year ? parseInt(updateData.year) : null;
    if (updateData.color !== undefined) data.color = updateData.color;
    if (updateData.registrationNumber !== undefined) data.registrationNumber = updateData.registrationNumber;
    if (updateData.seatingCapacity !== undefined) data.seatingCapacity = parseInt(updateData.seatingCapacity);
    if (updateData.driverName !== undefined) data.driverName = updateData.driverName;
    if (updateData.driverPhone !== undefined) data.driverPhone = updateData.driverPhone;
    if (updateData.driverLicense !== undefined) data.driverLicense = updateData.driverLicense;
    if (updateData.lastServiceDate !== undefined) data.lastServiceDate = updateData.lastServiceDate ? new Date(updateData.lastServiceDate) : null;
    if (updateData.nextServiceDate !== undefined) data.nextServiceDate = updateData.nextServiceDate ? new Date(updateData.nextServiceDate) : null;
    if (updateData.insuranceExpiry !== undefined) data.insuranceExpiry = updateData.insuranceExpiry ? new Date(updateData.insuranceExpiry) : null;
    if (updateData.roadworthyExpiry !== undefined) data.roadworthyExpiry = updateData.roadworthyExpiry ? new Date(updateData.roadworthyExpiry) : null;
    if (updateData.gpsEnabled !== undefined) data.gpsEnabled = updateData.gpsEnabled;
    if (updateData.gpsDeviceId !== undefined) data.gpsDeviceId = updateData.gpsDeviceId;
    if (updateData.status) data.status = updateData.status;
    if (updateData.condition) data.condition = updateData.condition;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle,
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a vehicle
exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findFirst({
      where: { id, schoolId: req.school.id },
      include: {
        studentAssignments: {
          where: { isActive: true },
        },
      },
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    if (vehicle.studentAssignments.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete vehicle with active student assignments',
      });
    }

    await prisma.vehicle.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Vehicle deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ================================
// STUDENT ASSIGNMENTS
// ================================

// Get all student transport assignments
exports.getStudentAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 50, routeId, vehicleId, status, classId, search } = req.query;

    const where = {
      schoolId: req.school.id,
    };

    if (routeId) where.routeId = routeId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;
    if (search) {
      where.student = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { admissionNumber: { contains: search, mode: 'insensitive' } },
        ],
      };
    }
    if (classId) {
      where.student = {
        ...where.student,
        currentClassId: classId,
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [assignments, total] = await Promise.all([
      prisma.studentTransportAssignment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              admissionNumber: true,
              firstName: true,
              lastName: true,
              phone: true,
              currentClass: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          route: true,
          vehicle: true,
          academicYear: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.studentTransportAssignment.count({ where }),
    ]);

    res.json({
      success: true,
      assignments,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get a single student assignment
exports.getStudentAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.studentTransportAssignment.findFirst({
      where: {
        id,
        schoolId: req.school.id,
      },
      include: {
        student: {
          include: {
            currentClass: true,
            guardianStudents: {
              include: {
                guardian: true,
              },
            },
          },
        },
        route: true,
        vehicle: true,
        academicYear: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    res.json({ success: true, assignment });
  } catch (error) {
    console.error('Error fetching student assignment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a new student transport assignment
exports.createStudentAssignment = async (req, res) => {
  try {
    const {
      studentId,
      routeId,
      vehicleId,
      pickupPoint,
      pickupTime,
      dropoffPoint,
      dropoffTime,
      guardianName,
      guardianPhone,
      startDate,
      endDate,
      academicYearId,
      status,
    } = req.body;

    if (!studentId || !routeId || !pickupPoint || !dropoffPoint || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Student, route, pickup point, dropoff point, and start date are required',
      });
    }

    // Verify student exists
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        schoolId: req.school.id,
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Verify route exists
    const route = await prisma.transportRoute.findFirst({
      where: {
        id: routeId,
        schoolId: req.school.id,
      },
    });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found' });
    }

    // If vehicle specified, verify it exists and update occupancy
    if (vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: {
          id: vehicleId,
          schoolId: req.school.id,
        },
      });

      if (!vehicle) {
        return res.status(404).json({ success: false, message: 'Vehicle not found' });
      }

      if (vehicle.currentOccupancy >= vehicle.seatingCapacity) {
        return res.status(400).json({
          success: false,
          message: 'Vehicle is at full capacity',
        });
      }
    }

    const assignment = await prisma.studentTransportAssignment.create({
      data: {
        studentId,
        routeId,
        vehicleId,
        pickupPoint,
        pickupTime,
        dropoffPoint,
        dropoffTime,
        guardianName,
        guardianPhone,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        academicYearId,
        status: status || 'ACTIVE',
        isActive: true,
        schoolId: req.school.id,
      },
      include: {
        student: true,
        route: true,
        vehicle: true,
      },
    });

    // Update vehicle occupancy if assigned
    if (vehicleId) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { currentOccupancy: { increment: 1 } },
      });
    }

    res.status(201).json({
      success: true,
      message: 'Student transport assignment created successfully',
      assignment,
    });
  } catch (error) {
    console.error('Error creating student assignment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a student transport assignment
exports.updateStudentAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingAssignment = await prisma.studentTransportAssignment.findFirst({
      where: { id, schoolId: req.school.id },
    });

    if (!existingAssignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // If changing vehicle, update occupancy
    const oldVehicleId = existingAssignment.vehicleId;
    const newVehicleId = updateData.vehicleId;

    // Prepare update data
    const data = {};
    if (updateData.routeId) data.routeId = updateData.routeId;
    if (updateData.vehicleId !== undefined) data.vehicleId = updateData.vehicleId;
    if (updateData.pickupPoint) data.pickupPoint = updateData.pickupPoint;
    if (updateData.pickupTime !== undefined) data.pickupTime = updateData.pickupTime;
    if (updateData.dropoffPoint) data.dropoffPoint = updateData.dropoffPoint;
    if (updateData.dropoffTime !== undefined) data.dropoffTime = updateData.dropoffTime;
    if (updateData.guardianName !== undefined) data.guardianName = updateData.guardianName;
    if (updateData.guardianPhone !== undefined) data.guardianPhone = updateData.guardianPhone;
    if (updateData.startDate) data.startDate = new Date(updateData.startDate);
    if (updateData.endDate !== undefined) data.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    if (updateData.academicYearId !== undefined) data.academicYearId = updateData.academicYearId;
    if (updateData.status) data.status = updateData.status;
    if (updateData.isActive !== undefined) data.isActive = updateData.isActive;

    const assignment = await prisma.studentTransportAssignment.update({
      where: { id },
      data,
      include: {
        student: true,
        route: true,
        vehicle: true,
      },
    });

    // Update vehicle occupancy if changed
    if (oldVehicleId !== newVehicleId) {
      if (oldVehicleId) {
        await prisma.vehicle.update({
          where: { id: oldVehicleId },
          data: { currentOccupancy: { decrement: 1 } },
        });
      }
      if (newVehicleId) {
        await prisma.vehicle.update({
          where: { id: newVehicleId },
          data: { currentOccupancy: { increment: 1 } },
        });
      }
    }

    res.json({
      success: true,
      message: 'Student transport assignment updated successfully',
      assignment,
    });
  } catch (error) {
    console.error('Error updating student assignment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a student transport assignment
exports.deleteStudentAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.studentTransportAssignment.findFirst({
      where: { id, schoolId: req.school.id },
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Update vehicle occupancy if assigned
    if (assignment.vehicleId) {
      await prisma.vehicle.update({
        where: { id: assignment.vehicleId },
        data: { currentOccupancy: { decrement: 1 } },
      });
    }

    await prisma.studentTransportAssignment.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Student transport assignment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting student assignment:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ================================
// VEHICLE MAINTENANCE
// ================================

// Get maintenance records for a vehicle
exports.getMaintenanceRecords = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const where = {
      vehicleId,
      vehicle: {
        schoolId: req.school.id,
      },
    };

    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      prisma.vehicleMaintenance.findMany({
        where,
        include: {
          vehicle: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.vehicleMaintenance.count({ where }),
    ]);

    res.json({
      success: true,
      records,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create a maintenance record
exports.createMaintenanceRecord = async (req, res) => {
  try {
    const {
      vehicleId,
      maintenanceType,
      description,
      cost,
      currency,
      serviceProvider,
      mechanicName,
      mechanicPhone,
      scheduledDate,
      completedDate,
      nextServiceDate,
      status,
      odometerReading,
      notes,
    } = req.body;

    if (!vehicleId || !maintenanceType) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle and maintenance type are required',
      });
    }

    // Verify vehicle exists
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        schoolId: req.school.id,
      },
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    const record = await prisma.vehicleMaintenance.create({
      data: {
        vehicleId,
        maintenanceType,
        description,
        cost: cost ? parseFloat(cost) : null,
        currency: currency || 'KES',
        serviceProvider,
        mechanicName,
        mechanicPhone,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        completedDate: completedDate ? new Date(completedDate) : null,
        nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
        status: status || 'SCHEDULED',
        odometerReading: odometerReading ? parseInt(odometerReading) : null,
        notes,
      },
      include: {
        vehicle: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Maintenance record created successfully',
      record,
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update a maintenance record
exports.updateMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingRecord = await prisma.vehicleMaintenance.findFirst({
      where: {
        id,
        vehicle: {
          schoolId: req.school.id,
        },
      },
    });

    if (!existingRecord) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    // Prepare update data
    const data = {};
    if (updateData.maintenanceType) data.maintenanceType = updateData.maintenanceType;
    if (updateData.description !== undefined) data.description = updateData.description;
    if (updateData.cost !== undefined) data.cost = updateData.cost ? parseFloat(updateData.cost) : null;
    if (updateData.currency) data.currency = updateData.currency;
    if (updateData.serviceProvider !== undefined) data.serviceProvider = updateData.serviceProvider;
    if (updateData.mechanicName !== undefined) data.mechanicName = updateData.mechanicName;
    if (updateData.mechanicPhone !== undefined) data.mechanicPhone = updateData.mechanicPhone;
    if (updateData.scheduledDate !== undefined) data.scheduledDate = updateData.scheduledDate ? new Date(updateData.scheduledDate) : null;
    if (updateData.completedDate !== undefined) data.completedDate = updateData.completedDate ? new Date(updateData.completedDate) : null;
    if (updateData.nextServiceDate !== undefined) data.nextServiceDate = updateData.nextServiceDate ? new Date(updateData.nextServiceDate) : null;
    if (updateData.status) data.status = updateData.status;
    if (updateData.odometerReading !== undefined) data.odometerReading = updateData.odometerReading ? parseInt(updateData.odometerReading) : null;
    if (updateData.notes !== undefined) data.notes = updateData.notes;

    const record = await prisma.vehicleMaintenance.update({
      where: { id },
      data,
      include: {
        vehicle: true,
      },
    });

    res.json({
      success: true,
      message: 'Maintenance record updated successfully',
      record,
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete a maintenance record
exports.deleteMaintenanceRecord = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await prisma.vehicleMaintenance.findFirst({
      where: {
        id,
        vehicle: {
          schoolId: req.school.id,
        },
      },
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Maintenance record not found' });
    }

    await prisma.vehicleMaintenance.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Maintenance record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const [
      totalRoutes,
      activeRoutes,
      totalVehicles,
      activeVehicles,
      totalStudents,
      vehicleStats,
    ] = await Promise.all([
      prisma.transportRoute.count({ where: { schoolId } }),
      prisma.transportRoute.count({ where: { schoolId, status: 'ACTIVE' } }),
      prisma.vehicle.count({ where: { schoolId } }),
      prisma.vehicle.count({ where: { schoolId, status: 'ACTIVE' } }),
      prisma.studentTransportAssignment.count({ where: { schoolId, isActive: true } }),
      prisma.vehicle.groupBy({
        by: ['status'],
        where: { schoolId },
        _count: true,
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalRoutes,
        activeRoutes,
        totalVehicles,
        activeVehicles,
        totalStudents,
        vehicleStats,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
