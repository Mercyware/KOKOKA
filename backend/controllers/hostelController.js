const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all hostels with pagination and filtering
exports.getAllHostels = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = 'name', order = 'asc', status, hostelType, search } = req.query;

    const where = {
      schoolId: req.school.id,
    };

    if (status) where.status = status;
    if (hostelType) where.hostelType = hostelType;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [hostels, total] = await Promise.all([
      prisma.hostel.findMany({
        where,
        include: {
          warden: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              phone: true,
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          rooms: {
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              status: true,
            },
          },
          allocations: {
            where: { status: 'ACTIVE' },
            select: {
              id: true,
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { [sort]: order },
        skip,
        take: parseInt(limit),
      }),
      prisma.hostel.count({ where }),
    ]);

    res.json({
      success: true,
      hostels,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get hostel by ID
exports.getHostelById = async (req, res) => {
  try {
    const hostelId = req.params.id;

    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
      include: {
        warden: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        rooms: {
          include: {
            allocations: {
              where: { status: 'ACTIVE' },
              include: {
                student: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    admissionNumber: true,
                    gender: true,
                  },
                },
              },
            },
          },
        },
        allocations: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
                gender: true,
              },
            },
            room: {
              select: {
                id: true,
                roomNumber: true,
                roomType: true,
              },
            },
          },
        },
        fees: true,
      },
    });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    res.json({ success: true, hostel });
  } catch (error) {
    console.error('Error fetching hostel:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create new hostel
exports.createHostel = async (req, res) => {
  try {
    const {
      name,
      hostelType,
      gender,
      address,
      capacity,
      wardenId,
      facilities,
      description,
      status,
    } = req.body;

    const hostel = await prisma.hostel.create({
      data: {
        name,
        hostelType,
        gender: gender || null,
        address,
        capacity: parseInt(capacity),
        availableBeds: parseInt(capacity),
        occupiedBeds: 0,
        wardenId: wardenId || null,
        facilities: facilities || [],
        description,
        status: status || 'ACTIVE',
        schoolId: req.school.id,
      },
      include: {
        warden: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeId: true,
            phone: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Hostel created successfully',
      hostel,
    });
  } catch (error) {
    console.error('Error creating hostel:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update hostel
exports.updateHostel = async (req, res) => {
  try {
    const hostelId = req.params.id;
    const {
      name,
      hostelType,
      gender,
      address,
      capacity,
      warden,
      wardenContact,
      wardenEmail,
      facilities,
      description,
      status,
    } = req.body;

    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
      include: { allocations: { where: { status: 'ACTIVE' } } },
    });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    // Check if reducing capacity below current occupancy
    if (capacity && parseInt(capacity) < hostel.occupiedBeds) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce capacity below current occupancy (${hostel.occupiedBeds} students)`,
      });
    }

    const updatedHostel = await prisma.hostel.update({
      where: { id: hostelId },
      data: {
        name: name || hostel.name,
        hostelType: hostelType || hostel.hostelType,
        gender: gender !== undefined ? gender : hostel.gender,
        address: address !== undefined ? address : hostel.address,
        capacity: capacity ? parseInt(capacity) : hostel.capacity,
        availableBeds: capacity ? parseInt(capacity) - hostel.occupiedBeds : hostel.availableBeds,
        warden: warden !== undefined ? warden : hostel.warden,
        wardenContact: wardenContact !== undefined ? wardenContact : hostel.wardenContact,
        wardenEmail: wardenEmail !== undefined ? wardenEmail : hostel.wardenEmail,
        facilities: facilities !== undefined ? facilities : hostel.facilities,
        description: description !== undefined ? description : hostel.description,
        status: status || hostel.status,
      },
    });

    res.json({
      success: true,
      message: 'Hostel updated successfully',
      hostel: updatedHostel,
    });
  } catch (error) {
    console.error('Error updating hostel:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete hostel
exports.deleteHostel = async (req, res) => {
  try {
    const hostelId = req.params.id;

    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
      include: {
        allocations: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!hostel) {
      return res.status(404).json({ success: false, message: 'Hostel not found' });
    }

    if (hostel.allocations.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete hostel with active allocations. Please deallocate all students first.',
      });
    }

    await prisma.hostel.delete({
      where: { id: hostelId },
    });

    res.json({ success: true, message: 'Hostel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hostel:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all rooms for a hostel
exports.getHostelRooms = async (req, res) => {
  try {
    const { hostelId } = req.params;
    const { page = 1, limit = 20, status, roomType } = req.query;

    const where = {
      hostelId,
    };

    if (status) where.status = status;
    if (roomType) where.roomType = roomType;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [rooms, total] = await Promise.all([
      prisma.hostelRoom.findMany({
        where,
        include: {
          allocations: {
            where: { status: 'ACTIVE' },
            include: {
              student: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  admissionNumber: true,
                },
              },
            },
          },
        },
        orderBy: { roomNumber: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.hostelRoom.count({ where }),
    ]);

    res.json({
      success: true,
      rooms,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching hostel rooms:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create hostel room
exports.createRoom = async (req, res) => {
  try {
    const { hostelId, roomNumber, floor, roomType, capacity, facilities } = req.body;

    const room = await prisma.hostelRoom.create({
      data: {
        roomNumber,
        floor: floor ? parseInt(floor) : null,
        roomType: roomType || 'STANDARD',
        capacity: parseInt(capacity),
        availableBeds: parseInt(capacity),
        occupiedBeds: 0,
        facilities: facilities || [],
        status: 'AVAILABLE',
        hostelId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room,
    });
  } catch (error) {
    console.error('Error creating room:', error);

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A room with this number already exists in this hostel',
      });
    }

    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all allocations with filtering
exports.getAllAllocations = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, hostelId, studentId } = req.query;

    const where = {
      schoolId: req.school.id,
    };

    if (status) where.status = status;
    if (hostelId) where.hostelId = hostelId;
    if (studentId) where.studentId = studentId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [allocations, total] = await Promise.all([
      prisma.hostelAllocation.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              admissionNumber: true,
              gender: true,
              email: true,
              phone: true,
            },
          },
          hostel: {
            select: {
              id: true,
              name: true,
              hostelType: true,
            },
          },
          room: {
            select: {
              id: true,
              roomNumber: true,
              roomType: true,
              floor: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.hostelAllocation.count({ where }),
    ]);

    res.json({
      success: true,
      allocations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Allocate student to hostel room
exports.allocateStudent = async (req, res) => {
  try {
    const { studentId, hostelId, roomId, bedNumber, startDate, endDate, academicYearId, remarks } = req.body;

    // Check if student already has active allocation
    const existingAllocation = await prisma.hostelAllocation.findFirst({
      where: {
        studentId,
        status: 'ACTIVE',
      },
    });

    if (existingAllocation) {
      return res.status(400).json({
        success: false,
        message: 'Student already has an active hostel allocation',
      });
    }

    // Check room availability
    const room = await prisma.hostelRoom.findUnique({
      where: { id: roomId },
    });

    if (!room || room.availableBeds <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Room is not available or fully occupied',
      });
    }

    // Create allocation
    const allocation = await prisma.hostelAllocation.create({
      data: {
        studentId,
        hostelId,
        roomId,
        bedNumber: bedNumber || `B${room.occupiedBeds + 1}`,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        status: 'ACTIVE',
        academicYearId: academicYearId || null,
        remarks,
        schoolId: req.school.id,
      },
    });

    // Update room occupancy
    await prisma.hostelRoom.update({
      where: { id: roomId },
      data: {
        occupiedBeds: { increment: 1 },
        availableBeds: { decrement: 1 },
        status: room.availableBeds - 1 === 0 ? 'OCCUPIED' : 'AVAILABLE',
      },
    });

    // Update hostel occupancy
    await prisma.hostel.update({
      where: { id: hostelId },
      data: {
        occupiedBeds: { increment: 1 },
        availableBeds: { decrement: 1 },
      },
    });

    const fullAllocation = await prisma.hostelAllocation.findUnique({
      where: { id: allocation.id },
      include: {
        student: true,
        hostel: true,
        room: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Student allocated successfully',
      allocation: fullAllocation,
    });
  } catch (error) {
    console.error('Error allocating student:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Deallocate student from hostel
exports.deallocateStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const allocation = await prisma.hostelAllocation.findUnique({
      where: { id },
    });

    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Allocation not found' });
    }

    if (allocation.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Allocation is not active' });
    }

    // Update allocation status
    await prisma.hostelAllocation.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endDate: new Date(),
      },
    });

    // Update room occupancy
    await prisma.hostelRoom.update({
      where: { id: allocation.roomId },
      data: {
        occupiedBeds: { decrement: 1 },
        availableBeds: { increment: 1 },
        status: 'AVAILABLE',
      },
    });

    // Update hostel occupancy
    await prisma.hostel.update({
      where: { id: allocation.hostelId },
      data: {
        occupiedBeds: { decrement: 1 },
        availableBeds: { increment: 1 },
      },
    });

    res.json({
      success: true,
      message: 'Student deallocated successfully',
    });
  } catch (error) {
    console.error('Error deallocating student:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get hostel statistics
exports.getHostelStats = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const [
      totalHostels,
      totalRooms,
      totalCapacity,
      totalOccupied,
      activeAllocations,
      hostelBreakdown,
    ] = await Promise.all([
      prisma.hostel.count({ where: { schoolId, status: 'ACTIVE' } }),
      prisma.hostelRoom.count({ where: { hostel: { schoolId } } }),
      prisma.hostel.aggregate({
        where: { schoolId },
        _sum: { capacity: true },
      }),
      prisma.hostel.aggregate({
        where: { schoolId },
        _sum: { occupiedBeds: true },
      }),
      prisma.hostelAllocation.count({
        where: { schoolId, status: 'ACTIVE' },
      }),
      prisma.hostel.findMany({
        where: { schoolId },
        select: {
          id: true,
          name: true,
          hostelType: true,
          capacity: true,
          occupiedBeds: true,
          availableBeds: true,
        },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        totalHostels,
        totalRooms,
        totalCapacity: totalCapacity._sum.capacity || 0,
        totalOccupied: totalOccupied._sum.occupiedBeds || 0,
        totalAvailable: (totalCapacity._sum.capacity || 0) - (totalOccupied._sum.occupiedBeds || 0),
        activeAllocations,
        occupancyRate: totalCapacity._sum.capacity
          ? ((totalOccupied._sum.occupiedBeds || 0) / totalCapacity._sum.capacity) * 100
          : 0,
        hostelBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching hostel stats:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get hostel fees
exports.getHostelFees = async (req, res) => {
  try {
    const { hostelId, academicYearId } = req.query;

    const where = {
      school: { id: req.school.id },
    };

    if (hostelId) where.hostelId = hostelId;
    if (academicYearId) where.academicYearId = academicYearId;

    const fees = await prisma.hostelFee.findMany({
      where,
      include: {
        hostel: {
          select: {
            id: true,
            name: true,
          },
        },
        academicYear: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({ success: true, fees });
  } catch (error) {
    console.error('Error fetching hostel fees:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create or update hostel fee
exports.upsertHostelFee = async (req, res) => {
  try {
    const { id, hostelId, roomType, amount, currency, frequency, securityDeposit, admissionFee, description, academicYearId, status } = req.body;

    if (id) {
      // Update existing fee
      const fee = await prisma.hostelFee.update({
        where: { id },
        data: {
          amount: parseFloat(amount),
          currency: currency || 'KES',
          frequency,
          securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
          admissionFee: admissionFee ? parseFloat(admissionFee) : null,
          description: description || null,
          status,
        },
      });

      return res.json({ success: true, message: 'Fee updated successfully', fee });
    } else {
      // Create new fee
      const fee = await prisma.hostelFee.create({
        data: {
          hostelId,
          roomType,
          amount: parseFloat(amount),
          currency: currency || 'KES',
          frequency: frequency || 'MONTHLY',
          securityDeposit: securityDeposit ? parseFloat(securityDeposit) : null,
          admissionFee: admissionFee ? parseFloat(admissionFee) : null,
          description: description || null,
          status: status || 'ACTIVE',
          academicYearId: academicYearId || null,
          schoolId: req.school.id,
        },
      });

      return res.status(201).json({ success: true, message: 'Fee created successfully', fee });
    }
  } catch (error) {
    console.error('Error upserting hostel fee:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
