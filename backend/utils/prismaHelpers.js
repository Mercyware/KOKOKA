const { prisma } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * PRISMA HELPER UTILITIES
 * These utilities help migrate from Mongoose to Prisma by providing
 * common database operations and data transformations
 */

// Helper function to handle Prisma connection errors
const handlePrismaError = (error) => {
  console.error('Prisma Error:', error);
  
  // Handle common Prisma errors
  if (error.code === 'P2002') {
    const field = error.meta?.target?.[0] || 'field';
    throw new Error(`${field} already exists`);
  }
  
  if (error.code === 'P2025') {
    throw new Error('Record not found');
  }
  
  if (error.code === 'P2003') {
    throw new Error('Foreign key constraint failed');
  }
  
  throw error;
};

// Helper to transform Mongoose-style queries to Prisma
const transformQuery = (mongooseQuery) => {
  const prismaQuery = {};
  
  for (const [key, value] of Object.entries(mongooseQuery)) {
    if (key === '$or') {
      prismaQuery.OR = value.map(transformQuery);
    } else if (key === '$and') {
      prismaQuery.AND = value.map(transformQuery);
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (value.$regex) {
        prismaQuery[key] = {
          contains: value.$regex.replace(/^\^|\$$/g, ''),
          mode: value.$options?.includes('i') ? 'insensitive' : 'sensitive'
        };
      } else if (value.$in) {
        prismaQuery[key] = { in: value.$in };
      } else if (value.$ne) {
        prismaQuery[key] = { not: value.$ne };
      } else if (value.$gt) {
        prismaQuery[key] = { gt: value.$gt };
      } else if (value.$gte) {
        prismaQuery[key] = { gte: value.$gte };
      } else if (value.$lt) {
        prismaQuery[key] = { lt: value.$lt };
      } else if (value.$lte) {
        prismaQuery[key] = { lte: value.$lte };
      } else {
        prismaQuery[key] = value;
      }
    } else {
      prismaQuery[key] = value;
    }
  }
  
  return prismaQuery;
};

// Helper to transform sort options from Mongoose to Prisma
const transformSort = (sort) => {
  if (!sort) return undefined;
  
  if (typeof sort === 'string') {
    const direction = sort.startsWith('-') ? 'desc' : 'asc';
    const field = sort.replace(/^-/, '');
    return { [field]: direction };
  }
  
  if (typeof sort === 'object') {
    const orderBy = {};
    for (const [key, value] of Object.entries(sort)) {
      orderBy[key] = value === -1 || value === 'desc' ? 'desc' : 'asc';
    }
    return orderBy;
  }
  
  return undefined;
};

// User-related helpers
const userHelpers = {
  // Hash password before saving
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },
  
  // Compare password
  comparePassword: async (enteredPassword, hashedPassword) => {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  },
  
  // Create user with hashed password
  create: async (userData) => {
    try {
      if (userData.password) {
        userData.passwordHash = await userHelpers.hashPassword(userData.password);
        delete userData.password;
      }
      
      return await prisma.user.create({
        data: userData,
        include: {
          school: true,
          student: true,
          staff: true,
          guardian: true
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  // Find user by email with password
  findByEmailWithPassword: async (email) => {
    try {
      return await prisma.user.findUnique({
        where: { email },
        include: {
          school: true,
          student: true,
          staff: true,
          guardian: true
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  // Update user
  update: async (id, updateData) => {
    try {
      if (updateData.password) {
        updateData.passwordHash = await userHelpers.hashPassword(updateData.password);
        delete updateData.password;
      }
      
      return await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          school: true,
          student: true,
          staff: true,
          guardian: true
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
};

// School-related helpers
const schoolHelpers = {
  // Create school with slug generation
  create: async (schoolData) => {
    try {
      const slugify = require('slugify');
      
      if (!schoolData.slug && schoolData.name) {
        schoolData.slug = slugify(schoolData.name, { lower: true });
      }
      
      if (!schoolData.subdomain && schoolData.name) {
        schoolData.subdomain = schoolData.name.toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '')
          .substring(0, 63);
      }
      
      return await prisma.school.create({
        data: schoolData
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  // Find school by subdomain
  findBySubdomain: async (subdomain) => {
    try {
      return await prisma.school.findUnique({
        where: { subdomain }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
};

// Student-related helpers
const studentHelpers = {
  // Create student with unique admission number check
  create: async (studentData) => {
    try {
      return await prisma.student.create({
        data: studentData,
        include: {
          school: true,
          currentClass: true,
          house: true,
          user: true
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  // Find students with filters and pagination
  findMany: async (filters = {}, options = {}) => {
    try {
      const { page = 1, limit = 10, sort, populate } = options;
      const skip = (page - 1) * limit;
      
      const include = {
        school: true,
        currentClass: true,
        house: true,
        user: true
      };
      
      if (populate?.includes('grades')) {
        include.grades = { include: { assessment: true } };
      }
      
      if (populate?.includes('attendance')) {
        include.attendance = true;
      }
      
      return await prisma.student.findMany({
        where: transformQuery(filters),
        include,
        orderBy: transformSort(sort),
        skip,
        take: limit
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  // Find student by admission number within school
  findByAdmissionNumber: async (admissionNumber, schoolId) => {
    try {
      return await prisma.student.findFirst({
        where: {
          admissionNumber,
          schoolId
        },
        include: {
          school: true,
          currentClass: true,
          house: true,
          user: true
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
};

// Teacher-related helpers (using Staff model with type TEACHER)
const teacherHelpers = {
  create: async (teacherData) => {
    try {
      return await prisma.staff.create({
        data: {
          ...teacherData,
          type: 'TEACHER'
        },
        include: {
          school: true,
          user: true,
          department: true
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  findMany: async (filters = {}, options = {}) => {
    try {
      const { page = 1, limit = 10, sort } = options;
      const skip = (page - 1) * limit;
      
      return await prisma.staff.findMany({
        where: {
          ...transformQuery(filters),
          type: 'TEACHER'
        },
        include: {
          school: true,
          user: true,
          department: true,
          teacherSubjects: {
            include: { subject: true }
          }
        },
        orderBy: transformSort(sort),
        skip,
        take: limit
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
};

// Assessment and Grade helpers
const assessmentHelpers = {
  create: async (assessmentData) => {
    try {
      return await prisma.assessment.create({
        data: assessmentData,
        include: {
          school: true,
          subject: true,
          class: true,
          staff: true,
          grades: true
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  findMany: async (filters = {}, options = {}) => {
    try {
      const { page = 1, limit = 10, sort } = options;
      const skip = (page - 1) * limit;
      
      return await prisma.assessment.findMany({
        where: transformQuery(filters),
        include: {
          school: true,
          subject: true,
          class: true,
          staff: true,
          grades: {
            include: {
              student: true
            }
          }
        },
        orderBy: transformSort(sort),
        skip,
        take: limit
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
};

const gradeHelpers = {
  create: async (gradeData) => {
    try {
      return await prisma.grade.create({
        data: gradeData,
        include: {
          student: true,
          assessment: true,
          gradedBy: true
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  findMany: async (filters = {}, options = {}) => {
    try {
      const { page = 1, limit = 10, sort } = options;
      const skip = (page - 1) * limit;
      
      return await prisma.grade.findMany({
        where: transformQuery(filters),
        include: {
          student: true,
          assessment: {
            include: {
              subject: true,
              class: true
            }
          },
          gradedBy: true
        },
        orderBy: transformSort(sort),
        skip,
        take: limit
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
};

// Attendance helpers
const attendanceHelpers = {
  create: async (attendanceData) => {
    try {
      return await prisma.attendance.create({
        data: attendanceData,
        include: {
          student: true,
          class: true,
          markedBy: true
        }
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  findMany: async (filters = {}, options = {}) => {
    try {
      const { page = 1, limit = 10, sort } = options;
      const skip = (page - 1) * limit;
      
      return await prisma.attendance.findMany({
        where: transformQuery(filters),
        include: {
          student: true,
          class: true,
          markedBy: true
        },
        orderBy: transformSort(sort),
        skip,
        take: limit
      });
    } catch (error) {
      handlePrismaError(error);
    }
  },
  
  // Helper to mark attendance for multiple students
  markBulkAttendance: async (attendanceRecords) => {
    try {
      return await prisma.attendance.createMany({
        data: attendanceRecords,
        skipDuplicates: true
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }
};

// Generic CRUD helpers for other models
const createCRUDHelpers = (modelName) => {
  const model = prisma[modelName];
  
  return {
    create: async (data) => {
      try {
        return await model.create({ data });
      } catch (error) {
        handlePrismaError(error);
      }
    },
    
    findMany: async (filters = {}, options = {}) => {
      try {
        const { page = 1, limit = 10, sort, include } = options;
        const skip = (page - 1) * limit;
        
        return await model.findMany({
          where: transformQuery(filters),
          include,
          orderBy: transformSort(sort),
          skip,
          take: limit
        });
      } catch (error) {
        handlePrismaError(error);
      }
    },
    
    findById: async (id, include) => {
      try {
        return await model.findUnique({
          where: { id },
          include
        });
      } catch (error) {
        handlePrismaError(error);
      }
    },
    
    update: async (id, data) => {
      try {
        return await model.update({
          where: { id },
          data
        });
      } catch (error) {
        handlePrismaError(error);
      }
    },
    
    delete: async (id) => {
      try {
        return await model.delete({
          where: { id }
        });
      } catch (error) {
        handlePrismaError(error);
      }
    },
    
    count: async (filters = {}) => {
      try {
        return await model.count({
          where: transformQuery(filters)
        });
      } catch (error) {
        handlePrismaError(error);
      }
    }
  };
};

module.exports = {
  prisma,
  handlePrismaError,
  transformQuery,
  transformSort,
  userHelpers,
  schoolHelpers,
  studentHelpers,
  teacherHelpers,
  assessmentHelpers,
  gradeHelpers,
  attendanceHelpers,
  createCRUDHelpers,
  
  // Export common model helpers
  classHelpers: createCRUDHelpers('class'),
  subjectHelpers: createCRUDHelpers('subject'),
  departmentHelpers: createCRUDHelpers('department'),
  houseHelpers: createCRUDHelpers('house'),
  sectionHelpers: createCRUDHelpers('section'),
  academicYearHelpers: createCRUDHelpers('academicYear'),
  termHelpers: createCRUDHelpers('term'),
  guardianHelpers: createCRUDHelpers('guardian'),
  documentHelpers: createCRUDHelpers('document')
};