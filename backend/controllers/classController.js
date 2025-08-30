const {
  createClass,
  getClassById,
  getClassesBySchool,
  updateClass,
  deleteClass
} = require('../models/Class');

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
    const classes = await getClassesBySchool(schoolId);

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
    const classObj = await getClassById(req.params.id);

    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.json({
      success: true,
      data: classObj
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
    console.log('Creating class with data:', req.body);
    console.log('School context:', req.school);

    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const schoolId = req.school.id;
    
    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({
        success: false,
        message: 'Class name is required'
      });
    }

    if (!req.body.grade) {
      return res.status(400).json({
        success: false,
        message: 'Grade level is required'
      });
    }
    
    // Check for duplicate class name in the same school
    const existingClass = await getClassesBySchool(schoolId);
    const isDuplicate = existingClass.some(cls => 
      cls.name.toLowerCase() === req.body.name.toLowerCase()
    );

    if (isDuplicate) {
      return res.status(400).json({
        success: false,
        message: 'A class with this name already exists in your school'
      });
    }

    const classObj = await createClass({
      schoolId: schoolId,
      name: req.body.name,
      grade: parseInt(req.body.grade || req.body.level || '1'), // Ensure integer conversion
      description: req.body.description,
      capacity: req.body.capacity
    });

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: classObj
    });
  } catch (error) {
    console.error('Error creating class:', error);
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
    const classId = req.params.id;
    
    // Get the current class to verify it exists
    const currentClass = await getClassById(classId);
    if (!currentClass) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Check for duplicate class name in the same school (excluding current class)
    if (req.body.name) {
      const existingClasses = await getClassesBySchool(currentClass.schoolId);
      const isDuplicate = existingClasses.some(cls => 
        cls.name.toLowerCase() === req.body.name.toLowerCase() && cls.id !== classId
      );

      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          message: 'A class with this name already exists in your school'
        });
      }
    }

    const classObj = await updateClass(classId, {
      name: req.body.name,
      grade: req.body.grade ? parseInt(req.body.grade) : req.body.level ? parseInt(req.body.level) : undefined,
      description: req.body.description,
      capacity: req.body.capacity
    });

    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classObj
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
    const classObj = await deleteClass(req.params.id);

    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

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

const {
  getSubjectById,
  addClassToSubject,
  removeClassFromSubject
} = require('../models/Subject');

// Note: Subject-Class relationships are handled through TeacherSubject and ClassTeacher models
// These operations would need to be implemented through those relationships if needed
exports.addSubjectToClass = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Subject-Class relationships are managed through teacher assignments'
  });
};

exports.removeSubjectFromClass = async (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Subject-Class relationships are managed through teacher assignments'
  });
};

// Get classes by academic year (Prisma)
exports.getClassesByAcademicYear = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const { academicYearId } = req.params;
    // Assuming academicYearId is a field in the Class model
    const classes = await getClassesBySchool(req.school.id);
    const filtered = classes.filter(cls => cls.academicYearId === academicYearId);

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get class arms (Prisma)
exports.getClassArms = async (req, res) => {
  try {
    const classObj = await getClassById(req.params.id);

    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    // Assuming classArms is a relation in Prisma schema
    res.json({
      success: true,
      data: classObj.classArms || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Bulk update class grades
exports.bulkUpdateGrades = async (req, res) => {
  try {
    if (!req.school || !req.school.id) {
      return res.status(400).json({
        success: false,
        message: 'School context not found'
      });
    }

    const { updates } = req.body;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required and must not be empty'
      });
    }

    // Validate all updates first
    for (const update of updates) {
      if (!update.id || !update.grade) {
        return res.status(400).json({
          success: false,
          message: 'Each update must have an id and grade'
        });
      }
    }

    const schoolId = req.school.id;
    const updatedClasses = [];

    // Process each update
    for (const update of updates) {
      try {
        // Verify class belongs to the school
        const existingClass = await getClassById(update.id);
        if (!existingClass) {
          return res.status(404).json({
            success: false,
            message: `Class with ID ${update.id} not found`
          });
        }

        if (existingClass.schoolId !== schoolId) {
          return res.status(403).json({
            success: false,
            message: `Class with ID ${update.id} does not belong to your school`
          });
        }

        // Update the class grade
        const updatedClass = await updateClass(update.id, {
          grade: update.grade.toString()
        });

        updatedClasses.push({
          id: updatedClass.id,
          name: updatedClass.name,
          grade: updatedClass.grade
        });
      } catch (error) {
        console.error(`Error updating class ${update.id}:`, error);
        return res.status(500).json({
          success: false,
          message: `Failed to update class ${update.id}: ${error.message}`
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully updated ${updatedClasses.length} classes`,
      data: updatedClasses
    });
  } catch (error) {
    console.error('Error in bulk update grades:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
