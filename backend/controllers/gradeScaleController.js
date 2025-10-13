const { prisma } = require('../config/database');

// Create grade scale
const createGradeScale = async (req, res) => {
  try {
    const { name, gradeRanges } = req.body;
    const schoolId = req.school.id;

    // Validate grade ranges
    if (!gradeRanges || gradeRanges.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Grade ranges are required'
      });
    }

    // Validate that grade ranges don't overlap
    const sortedRanges = gradeRanges.sort((a, b) => b.minScore - a.minScore);
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      if (sortedRanges[i].minScore <= sortedRanges[i + 1].maxScore) {
        return res.status(400).json({
          success: false,
          message: 'Grade ranges cannot overlap'
        });
      }
    }

    // Deactivate other grade scales
    await prisma.gradeScale.updateMany({
      where: { schoolId },
      data: { isActive: false }
    });

    const gradeScale = await prisma.gradeScale.create({
      data: {
        schoolId,
        name,
        isActive: true,
        gradeRanges: {
          create: gradeRanges
        }
      },
      include: {
        gradeRanges: true
      }
    });

    res.json({
      success: true,
      data: gradeScale,
      message: 'Grade scale created successfully'
    });

  } catch (error) {
    console.error('Error creating grade scale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create grade scale'
    });
  }
};

// Get active grade scale
const getActiveGradeScale = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const gradeScale = await prisma.gradeScale.findFirst({
      where: { schoolId, isActive: true },
      include: {
        gradeRanges: {
          orderBy: { minScore: 'desc' }
        }
      }
    });

    if (!gradeScale) {
      return res.status(404).json({
        success: false,
        message: 'No active grade scale found'
      });
    }

    res.json({
      success: true,
      data: gradeScale
    });

  } catch (error) {
    console.error('Error fetching grade scale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grade scale'
    });
  }
};

// Get all grade scales for the school
const getAllGradeScales = async (req, res) => {
  try {
    const schoolId = req.school.id;

    const gradeScales = await prisma.gradeScale.findMany({
      where: { schoolId },
      include: {
        gradeRanges: {
          orderBy: { minScore: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: gradeScales
    });

  } catch (error) {
    console.error('Error fetching grade scales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grade scales'
    });
  }
};

// Update grade scale
const updateGradeScale = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, gradeRanges } = req.body;
    const schoolId = req.school.id;

    // Check if grade scale exists and belongs to school
    const existingGradeScale = await prisma.gradeScale.findFirst({
      where: { id, schoolId }
    });

    if (!existingGradeScale) {
      return res.status(404).json({
        success: false,
        message: 'Grade scale not found'
      });
    }

    // Validate grade ranges if provided
    if (gradeRanges && gradeRanges.length > 0) {
      const sortedRanges = gradeRanges.sort((a, b) => b.minScore - a.minScore);
      for (let i = 0; i < sortedRanges.length - 1; i++) {
        if (sortedRanges[i].minScore <= sortedRanges[i + 1].maxScore) {
          return res.status(400).json({
            success: false,
            message: 'Grade ranges cannot overlap'
          });
        }
      }
    }

    const updateData = { name };

    const gradeScale = await prisma.gradeScale.update({
      where: { id },
      data: updateData,
      include: {
        gradeRanges: {
          orderBy: { minScore: 'desc' }
        }
      }
    });

    // Update grade ranges if provided
    if (gradeRanges && gradeRanges.length > 0) {
      // Delete existing ranges
      await prisma.gradeRange.deleteMany({
        where: { gradeScaleId: id }
      });

      // Create new ranges
      await prisma.gradeRange.createMany({
        data: gradeRanges.map(range => ({
          gradeScaleId: id,
          ...range
        }))
      });
    }

    // Fetch updated grade scale with ranges
    const updatedGradeScale = await prisma.gradeScale.findUnique({
      where: { id },
      include: {
        gradeRanges: {
          orderBy: { minScore: 'desc' }
        }
      }
    });

    res.json({
      success: true,
      data: updatedGradeScale,
      message: 'Grade scale updated successfully'
    });

  } catch (error) {
    console.error('Error updating grade scale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update grade scale'
    });
  }
};

// Set active grade scale
const setActiveGradeScale = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    // Check if grade scale exists and belongs to school
    const gradeScale = await prisma.gradeScale.findFirst({
      where: { id, schoolId }
    });

    if (!gradeScale) {
      return res.status(404).json({
        success: false,
        message: 'Grade scale not found'
      });
    }

    // Deactivate all other grade scales
    await prisma.gradeScale.updateMany({
      where: { schoolId },
      data: { isActive: false }
    });

    // Activate the selected grade scale
    await prisma.gradeScale.update({
      where: { id },
      data: { isActive: true }
    });

    res.json({
      success: true,
      message: 'Grade scale activated successfully'
    });

  } catch (error) {
    console.error('Error setting active grade scale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set active grade scale'
    });
  }
};

// Delete grade scale
const deleteGradeScale = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.school.id;

    // Check if grade scale exists and belongs to school
    const gradeScale = await prisma.gradeScale.findFirst({
      where: { id, schoolId }
    });

    if (!gradeScale) {
      return res.status(404).json({
        success: false,
        message: 'Grade scale not found'
      });
    }

    // Check if grade scale is being used in results
    const resultsCount = await prisma.result.count({
      where: { gradeScaleId: id }
    });

    if (resultsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete grade scale that is being used in results'
      });
    }

    // Delete the grade scale (cascade will delete ranges)
    await prisma.gradeScale.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Grade scale deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting grade scale:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete grade scale'
    });
  }
};

// Get default grade scales templates
const getDefaultGradeScales = async (req, res) => {
  try {
    const defaultScales = [
      {
        name: 'Primary School Grading (100%)',
        gradeRanges: [
          { grade: 'A', minScore: 90, maxScore: 100, gradePoint: 4.0, remark: 'Excellent', color: '#10B981' },
          { grade: 'B', minScore: 80, maxScore: 89, gradePoint: 3.0, remark: 'Very Good', color: '#3B82F6' },
          { grade: 'C', minScore: 70, maxScore: 79, gradePoint: 2.5, remark: 'Good', color: '#F59E0B' },
          { grade: 'D', minScore: 60, maxScore: 69, gradePoint: 2.0, remark: 'Fair', color: '#EF4444' },
          { grade: 'F', minScore: 0, maxScore: 59, gradePoint: 0.0, remark: 'Poor', color: '#6B7280' }
        ]
      },
      {
        name: 'Secondary School Grading (WAEC/NECO)',
        gradeRanges: [
          { grade: 'A1', minScore: 90, maxScore: 100, gradePoint: 4.0, remark: 'Excellent', color: '#10B981' },
          { grade: 'A2', minScore: 85, maxScore: 89, gradePoint: 3.8, remark: 'Very Good', color: '#059669' },
          { grade: 'B1', minScore: 80, maxScore: 84, gradePoint: 3.5, remark: 'Good', color: '#3B82F6' },
          { grade: 'B2', minScore: 75, maxScore: 79, gradePoint: 3.2, remark: 'Good', color: '#2563EB' },
          { grade: 'C1', minScore: 70, maxScore: 74, gradePoint: 3.0, remark: 'Credit', color: '#F59E0B' },
          { grade: 'C2', minScore: 65, maxScore: 69, gradePoint: 2.5, remark: 'Credit', color: '#D97706' },
          { grade: 'C3', minScore: 60, maxScore: 64, gradePoint: 2.2, remark: 'Credit', color: '#B45309' },
          { grade: 'D', minScore: 50, maxScore: 59, gradePoint: 2.0, remark: 'Pass', color: '#EF4444' },
          { grade: 'F', minScore: 0, maxScore: 49, gradePoint: 0.0, remark: 'Fail', color: '#6B7280' }
        ]
      },
      {
        name: 'Cambridge Assessment Scale',
        gradeRanges: [
          { grade: 'A*', minScore: 90, maxScore: 100, gradePoint: 4.0, remark: 'Exceptional', color: '#10B981' },
          { grade: 'A', minScore: 80, maxScore: 89, gradePoint: 3.7, remark: 'Excellent', color: '#059669' },
          { grade: 'B', minScore: 70, maxScore: 79, gradePoint: 3.3, remark: 'Good', color: '#3B82F6' },
          { grade: 'C', minScore: 60, maxScore: 69, gradePoint: 3.0, remark: 'Satisfactory', color: '#F59E0B' },
          { grade: 'D', minScore: 50, maxScore: 59, gradePoint: 2.5, remark: 'Pass', color: '#EF4444' },
          { grade: 'E', minScore: 40, maxScore: 49, gradePoint: 2.0, remark: 'Borderline', color: '#DC2626' },
          { grade: 'F', minScore: 0, maxScore: 39, gradePoint: 0.0, remark: 'Fail', color: '#6B7280' }
        ]
      },
      {
        name: 'American GPA Scale (4.0)',
        gradeRanges: [
          { grade: 'A+', minScore: 97, maxScore: 100, gradePoint: 4.0, remark: 'Outstanding', color: '#10B981' },
          { grade: 'A', minScore: 93, maxScore: 96, gradePoint: 4.0, remark: 'Excellent', color: '#059669' },
          { grade: 'A-', minScore: 90, maxScore: 92, gradePoint: 3.7, remark: 'Very Good', color: '#3B82F6' },
          { grade: 'B+', minScore: 87, maxScore: 89, gradePoint: 3.3, remark: 'Good', color: '#2563EB' },
          { grade: 'B', minScore: 83, maxScore: 86, gradePoint: 3.0, remark: 'Good', color: '#F59E0B' },
          { grade: 'B-', minScore: 80, maxScore: 82, gradePoint: 2.7, remark: 'Fair', color: '#D97706' },
          { grade: 'C+', minScore: 77, maxScore: 79, gradePoint: 2.3, remark: 'Satisfactory', color: '#B45309' },
          { grade: 'C', minScore: 73, maxScore: 76, gradePoint: 2.0, remark: 'Satisfactory', color: '#EF4444' },
          { grade: 'C-', minScore: 70, maxScore: 72, gradePoint: 1.7, remark: 'Below Average', color: '#DC2626' },
          { grade: 'D', minScore: 60, maxScore: 69, gradePoint: 1.0, remark: 'Poor', color: '#B91C1C' },
          { grade: 'F', minScore: 0, maxScore: 59, gradePoint: 0.0, remark: 'Fail', color: '#6B7280' }
        ]
      }
    ];

    res.json({
      success: true,
      data: defaultScales
    });

  } catch (error) {
    console.error('Error fetching default grade scales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch default grade scales'
    });
  }
};

module.exports = {
  createGradeScale,
  getActiveGradeScale,
  getAllGradeScales,
  updateGradeScale,
  setActiveGradeScale,
  deleteGradeScale,
  getDefaultGradeScales
};