const { prisma } = require('../config/database');

// Get all classes for a school
exports.getAllClasses = async (req, res) => {
  try {
    console.log('=== GET /api/classes request ===');
    console.log('Headers:', JSON.stringify({
      'x-school-subdomain': req.headers['x-school-subdomain'],
      'host': req.headers.host,
      'origin': req.headers.origin,
      'authorization': req.headers.authorization ? 'Bearer [PRESENT]' : 'MISSING'
    }, null, 2));
    console.log('School context:', req.school);
    
    if (!req.school || !req.school.id) {
      console.log('Missing school context in classes request');
      
      return res.status(400).json({
        success: false,
        message: 'School context not found',
        debug: {
          hasSchool: !!req.school,
          hasSchoolId: !!req.school?.id,
          schoolData: req.school,
          headers: req.headers['x-school-subdomain'],
          host: req.headers.host,
          endpoint: '/api/classes',
          timestamp: new Date().toISOString()
        }
      });
    }
    
    const schoolId = req.school.id;
    console.log('Fetching classes for school ID:', schoolId);
    
    const classes = await prisma.class.findMany({
      where: { schoolId },
      select: {
        id: true,
        name: true,
        grade: true,
        capacity: true,
        description: true,
        schoolId: true,
        createdAt: true,
        updatedAt: true,
        students: {
          select: {
            id: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Found ${classes.length} classes for school ${schoolId}`);

    // Transform classes to include section and totalStudents
    const transformedClasses = classes.map(classItem => {
      // Extract section from class name (e.g., "Grade 1A" -> section = "A")
      const section = classItem.name.match(/([A-Z])$/)?.[1] || 'A';
      
      return {
        id: classItem.id,
        name: classItem.name,
        grade: classItem.grade,
        section: section,
        capacity: classItem.capacity,
        description: classItem.description,
        totalStudents: classItem.students.length,
        schoolId: classItem.schoolId,
        createdAt: classItem.createdAt,
        updatedAt: classItem.updatedAt
      };
    });

    console.log('Transformed classes:', transformedClasses.map(c => ({ id: c.id, name: c.name, grade: c.grade })));

    res.json({
      success: true,
      data: transformedClasses
    });
  } catch (error) {
    console.error('Error in getAllClasses:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get class by ID
exports.getClassById = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const classData = await prisma.class.findFirst({
      where: { 
        id: req.params.id,
        schoolId: req.school.id
      },
      include: {
        students: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        }
      }
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new class
exports.createClass = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const { name, grade, capacity, description } = req.body;

    // Check if class with same name exists
    const existingClass = await prisma.class.findFirst({
      where: { 
        name,
        schoolId: req.school.id
      }
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class with this name already exists'
      });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        grade,
        capacity,
        description,
        schoolId: req.school.id
      }
    });

    res.status(201).json({
      success: true,
      data: newClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Update class
exports.updateClass = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const { name, grade, capacity, description } = req.body;

    // Check if class exists
    const existingClass = await prisma.class.findFirst({
      where: { 
        id: req.params.id,
        schoolId: req.school.id
      }
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if another class with same name exists
    if (name && name !== existingClass.name) {
      const duplicateName = await prisma.class.findFirst({
        where: { 
          name,
          schoolId: req.school.id,
          id: { not: req.params.id }
        }
      });

      if (duplicateName) {
        return res.status(400).json({
          success: false,
          message: 'Class with this name already exists'
        });
      }
    }

    const updatedClass = await prisma.class.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(grade && { grade }),
        ...(capacity && { capacity }),
        ...(description !== undefined && { description })
      }
    });

    res.json({
      success: true,
      data: updatedClass
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    // Check if class exists
    const existingClass = await prisma.class.findFirst({
      where: { 
        id: req.params.id,
        schoolId: req.school.id
      }
    });

    if (!existingClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check if there are students in this class
    const studentCount = await prisma.student.count({
      where: { currentClassId: req.params.id }
    });

    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete class with students. Please reassign students first.'
      });
    }

    await prisma.class.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get classes by academic year
exports.getClassesByAcademicYear = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const classes = await prisma.class.findMany({
      where: { 
        schoolId: req.school.id
        // Note: In current schema, classes are not directly linked to academic years
        // This might need to be implemented differently based on your requirements
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Add subject to class (placeholder - requires TeacherSubject relationship)
exports.addSubjectToClass = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: 'This feature is not yet implemented with Prisma schema'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Remove subject from class (placeholder)
exports.removeSubjectFromClass = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: 'This feature is not yet implemented with Prisma schema'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Bulk update grades (placeholder)
exports.bulkUpdateGrades = async (req, res) => {
  try {
    res.status(501).json({
      success: false,
      message: 'This feature is not yet implemented with Prisma schema'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get students for a specific class
exports.getClassStudents = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const classId = req.params.id;
    const schoolId = req.school.id;

    // First verify the class belongs to the school
    const classData = await prisma.class.findFirst({
      where: { 
        id: classId,
        schoolId: schoolId
      }
    });

    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Get students for this class
    const students = await prisma.student.findMany({
      where: { 
        currentClassId: classId,
        schoolId: schoolId
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
        photo: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { admissionNumber: 'asc' },
        { firstName: 'asc' }
      ]
    });

    // Transform to match expected frontend interface
    const transformedStudents = students.map(student => ({
      ...student,
      rollNumber: student.admissionNumber, // Map admissionNumber to rollNumber for frontend compatibility
      profilePhoto: student.photo
    }));

    res.json({
      success: true,
      data: transformedStudents
    });
  } catch (error) {
    console.error('Error fetching class students:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all classes with their sections for a school
exports.getClassesWithSections = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }
    
    const schoolId = req.school.id;
    
    // Get all classes for the school
    const classes = await prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' }
    });

    // Get all sections for the school
    const sections = await prisma.section.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' }
    });

    // Create all possible class-section combinations
    const classSections = [];
    classes.forEach(classItem => {
      sections.forEach(section => {
        classSections.push({
          class: {
            id: classItem.id,
            name: classItem.name,
            level: classItem.grade // Use grade as level since level field doesn't exist in schema
          },
          section: {
            id: section.id,
            name: section.name
          }
        });
      });
    });

    res.json({
      success: true,
      data: classSections
    });
  } catch (error) {
    console.error('Error fetching classes with sections:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
