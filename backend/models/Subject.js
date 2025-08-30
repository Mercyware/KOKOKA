// Subject data access using Prisma (PostgreSQL)

const { prisma } = require('../config/database');

// Get subject by ID
async function getSubjectById(id) {
  return await prisma.subject.findUnique({
    where: { id },
    include: {
      classes: true
    }
  });
}

// Add class to subject's classes relation
async function addClassToSubject(subjectId, classId) {
  return await prisma.subject.update({
    where: { id: subjectId },
    data: {
      classes: {
        connect: { id: classId }
      }
    }
  });
}

// Remove class from subject's classes relation
async function removeClassFromSubject(subjectId, classId) {
  return await prisma.subject.update({
    where: { id: subjectId },
    data: {
      classes: {
        disconnect: { id: classId }
      }
    }
  });
}

module.exports = {
  getSubjectById,
  addClassToSubject,
  removeClassFromSubject
};
