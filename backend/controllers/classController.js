const { prisma } = require('../config/database');

// Get all classes for a school
exports.getAllClasses = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }
    
    const schoolId = req.school.id;
    const classes = await prisma.class.findMany({
      where: { schoolId },
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
