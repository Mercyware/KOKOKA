const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('express-async-handler');

const prisma = new PrismaClient();

// Get all staff subject assignments
exports.getAllAssignments = asyncHandler(async (req, res) => {
  try {
    const query = req.query || {};
    const where = {};
    
    if (query.subject) {
      where.subjectId = query.subject;
    }
    if (query.staff) {
      where.staffId = query.staff;
    }

    const assignments = await prisma.teacherSubject.findMany({
      where,
      include: {
        staff: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        subject: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(assignments || []);
  } catch (error) {
    console.error('Error in getAllAssignments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assignment by ID
exports.getAssignmentById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await prisma.teacherSubject.findUnique({
      where: { id },
      include: {
        staff: { include: { user: { select: { name: true, email: true } } } },
        subject: { select: { id: true, name: true, code: true } }
      }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    console.error('Error in getAssignmentById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assignments by teacher/staff
exports.getAssignmentsByTeacher = asyncHandler(async (req, res) => {
  try {
    const { teacherId } = req.params;
    const assignments = await prisma.teacherSubject.findMany({
      where: { staffId: teacherId },
      include: {
        staff: { include: { user: { select: { name: true, email: true } } } },
        subject: { select: { id: true, name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assignments || []);
  } catch (error) {
    console.error('Error in getAssignmentsByTeacher:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assignments by subject
exports.getAssignmentsBySubject = asyncHandler(async (req, res) => {
  try {
    const { subjectId } = req.params;
    const assignments = await prisma.teacherSubject.findMany({
      where: { subjectId },
      include: {
        staff: { include: { user: { select: { name: true, email: true } } } },
        subject: { select: { id: true, name: true, code: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(assignments || []);
  } catch (error) {
    console.error('Error in getAssignmentsBySubject:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Placeholder functions for routes that expect them
exports.getAssignmentsByAcademicYear = asyncHandler(async (req, res) => { res.json([]); });
exports.getAssignmentsByTerm = asyncHandler(async (req, res) => { res.json([]); });
exports.getAssignmentsByClass = asyncHandler(async (req, res) => { res.json([]); });

// Create new assignment
exports.createAssignment = asyncHandler(async (req, res) => {
  try {
    const { teacher, subject } = req.body;
    if (!teacher || !subject) {
      return res.status(400).json({ message: 'Staff and subject are required' });
    }

    const existingAssignment = await prisma.teacherSubject.findUnique({
      where: { staffId_subjectId: { staffId: teacher, subjectId: subject } }
    });

    if (existingAssignment) {
      return res.status(400).json({ message: 'Assignment already exists' });
    }

    const assignment = await prisma.teacherSubject.create({
      data: { staffId: teacher, subjectId: subject, schoolId: req.school?.id || req.body.schoolId },
      include: {
        staff: { include: { user: { select: { name: true, email: true } } } },
        subject: { select: { id: true, name: true, code: true } }
      }
    });
    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error in createAssignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update assignment
exports.updateAssignment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await prisma.teacherSubject.update({
      where: { id },
      data: req.body,
      include: {
        staff: { include: { user: { select: { name: true, email: true } } } },
        subject: { select: { id: true, name: true, code: true } }
      }
    });
    res.json(assignment);
  } catch (error) {
    console.error('Error in updateAssignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete assignment
exports.deleteAssignment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.teacherSubject.delete({ where: { id } });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error in deleteAssignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});