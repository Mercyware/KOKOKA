// Class data access using Prisma (PostgreSQL)

const { prisma } = require('../config/database');

// Create a new class
async function createClass(data) {
  return await prisma.class.create({
    data: {
      schoolId: data.schoolId,
      name: data.name,
      grade: data.grade ? data.grade.toString() : data.level ? data.level.toString() : '1',
      description: data.description,
      capacity: data.capacity
    }
  });
}

// Get class by ID
async function getClassById(id) {
  return await prisma.class.findUnique({
    where: { id },
    include: {
      students: true,
      school: true,
      createdBy: true
    }
  });
}

// Get all classes for a school
async function getClassesBySchool(schoolId) {
  return await prisma.class.findMany({
    where: { schoolId },
    include: {
      students: true
    }
  });
}

// Update class
async function updateClass(id, data) {
  return await prisma.class.update({
    where: { id },
    data: {
      name: data.name,
      grade: data.grade ? data.grade.toString() : data.level ? data.level.toString() : undefined,
      description: data.description,
      capacity: data.capacity
    }
  });
}

// Delete class
async function deleteClass(id) {
  return await prisma.class.delete({
    where: { id }
  });
}

module.exports = {
  createClass,
  getClassById,
  getClassesBySchool,
  updateClass,
  deleteClass
};
