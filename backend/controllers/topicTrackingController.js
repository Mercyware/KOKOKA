const { prisma } = require('../config/database');
const asyncHandler = require('express-async-handler');

// ==================== CLASS TOPIC COVERAGE ====================

// @desc    Get topics for a class and subject
// @route   GET /api/topic-tracking/class/:classId/subject/:subjectId/topics
// @access  Private (Teacher/Admin)
exports.getClassTopics = asyncHandler(async (req, res) => {
  const { classId, subjectId } = req.params;
  const { academicYearId, termId } = req.query;

  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  // Get curriculum for the class
  const classCurriculum = await prisma.classCurriculum.findFirst({
    where: {
      classId,
      academicYearId: academicYearId || undefined,
      status: 'ACTIVE'
    },
    include: {
      curriculum: {
        include: {
          subjects: {
            where: { subjectId },
            include: {
              topics: {
                include: {
                  concepts: true,
                  classTopicCoverage: {
                    where: {
                      classId,
                      termId: termId || undefined
                    }
                  }
                },
                orderBy: { displayOrder: 'asc' }
              }
            }
          }
        }
      }
    }
  });

  if (!classCurriculum) {
    return res.json({
      success: true,
      data: [],
      message: 'No curriculum assigned to this class'
    });
  }

  const topics = classCurriculum.curriculum.subjects[0]?.topics || [];

  res.json({
    success: true,
    data: topics,
    message: `Retrieved ${topics.length} topics`
  });
});

// @desc    Update topic coverage for a class
// @route   PUT /api/topic-tracking/class/:classId/topic/:topicId/coverage
// @access  Private (Teacher/Admin)
exports.updateTopicCoverage = asyncHandler(async (req, res) => {
  const { classId, topicId } = req.params;
  const { status, startDate, endDate, plannedHours, actualHours, notes, resources, subjectId, termId, academicYearId } = req.body;

  if (!req.school) {
    return res.status(404).json({
      success: false,
      message: 'School not found or inactive'
    });
  }

  // Find existing coverage or create new
  let coverage = await prisma.classTopicCoverage.findUnique({
    where: {
      classId_topicId_academicYearId_termId: {
        classId,
        topicId,
        academicYearId,
        termId: termId || null
      }
    }
  });

  const teacherId = req.user.staff?.id;

  if (coverage) {
    coverage = await prisma.classTopicCoverage.update({
      where: { id: coverage.id },
      data: {
        status: status || coverage.status,
        startDate: startDate ? new Date(startDate) : coverage.startDate,
        endDate: endDate ? new Date(endDate) : coverage.endDate,
        plannedHours: plannedHours !== undefined ? plannedHours : coverage.plannedHours,
        actualHours: actualHours !== undefined ? actualHours : coverage.actualHours,
        notes: notes !== undefined ? notes : coverage.notes,
        resources: resources || coverage.resources,
        teacherId: teacherId || coverage.teacherId
      },
      include: {
        topic: {
          include: {
            concepts: true
          }
        }
      }
    });
  } else {
    coverage = await prisma.classTopicCoverage.create({
      data: {
        classId,
        topicId,
        subjectId,
        termId: termId || null,
        academicYearId,
        teacherId,
        status: status || 'NOT_STARTED',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        plannedHours,
        actualHours,
        notes,
        resources
      },
      include: {
        topic: {
          include: {
            concepts: true
          }
        }
      }
    });
  }

  res.json({
    success: true,
    data: coverage,
    message: 'Topic coverage updated successfully'
  });
});

// @desc    Get coverage summary for a class
// @route   GET /api/topic-tracking/class/:classId/coverage-summary
// @access  Private (Teacher/Admin)
exports.getClassCoverageSummary = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { academicYearId, termId } = req.query;

  const coverages = await prisma.classTopicCoverage.findMany({
    where: {
      classId,
      academicYearId: academicYearId || undefined,
      termId: termId || undefined
    },
    include: {
      topic: {
        include: {
          curriculumSubject: {
            include: {
              subject: true
            }
          }
        }
      }
    }
  });

  // Calculate statistics by subject
  const subjectStats = {};

  coverages.forEach(coverage => {
    const subjectId = coverage.topic.curriculumSubject.subjectId;
    const subjectName = coverage.topic.curriculumSubject.subject.name;

    if (!subjectStats[subjectId]) {
      subjectStats[subjectId] = {
        subjectId,
        subjectName,
        totalTopics: 0,
        notStarted: 0,
        inProgress: 0,
        completed: 0,
        totalPlannedHours: 0,
        totalActualHours: 0
      };
    }

    const stats = subjectStats[subjectId];
    stats.totalTopics++;
    stats[coverage.status === 'NOT_STARTED' ? 'notStarted' :
          coverage.status === 'IN_PROGRESS' ? 'inProgress' : 'completed']++;
    stats.totalPlannedHours += coverage.plannedHours || 0;
    stats.totalActualHours += coverage.actualHours || 0;
  });

  res.json({
    success: true,
    data: {
      bySubject: Object.values(subjectStats),
      coverages
    },
    message: 'Coverage summary retrieved successfully'
  });
});

// ==================== STUDENT TOPIC PROGRESS ====================

// @desc    Get student progress for all topics
// @route   GET /api/topic-tracking/student/:studentId/progress
// @access  Private (Student/Teacher/Admin)
exports.getStudentTopicProgress = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { subjectId } = req.query;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      currentClass: true
    }
  });

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  const whereClause = {
    studentId,
    classId: student.currentClassId
  };

  if (subjectId) {
    whereClause.topic = {
      curriculumSubject: {
        subjectId
      }
    };
  }

  const progress = await prisma.studentTopicProgress.findMany({
    where: whereClause,
    include: {
      topic: {
        include: {
          curriculumSubject: {
            include: {
              subject: true
            }
          },
          concepts: true
        }
      },
      conceptMastery: {
        include: {
          concept: true,
          evidence: {
            orderBy: { timestamp: 'desc' },
            take: 5
          }
        }
      }
    },
    orderBy: [
      { topic: { curriculumSubject: { subject: { name: 'asc' } } } },
      { topic: { displayOrder: 'asc' } }
    ]
  });

  // Calculate overall statistics
  const stats = {
    totalTopics: progress.length,
    notStarted: progress.filter(p => p.status === 'NOT_STARTED').length,
    inProgress: progress.filter(p => p.status === 'IN_PROGRESS').length,
    mastered: progress.filter(p => p.status === 'MASTERED').length,
    struggling: progress.filter(p => p.status === 'STRUGGLING').length,
    averageProgress: progress.length > 0
      ? progress.reduce((sum, p) => sum + p.progressPercent, 0) / progress.length
      : 0
  };

  res.json({
    success: true,
    data: {
      progress,
      statistics: stats
    },
    message: `Retrieved progress for ${progress.length} topics`
  });
});

// @desc    Update student topic progress
// @route   PUT /api/topic-tracking/student/:studentId/topic/:topicId/progress
// @access  Private (Teacher/Admin)
exports.updateStudentTopicProgress = asyncHandler(async (req, res) => {
  const { studentId, topicId } = req.params;
  const { status, progressPercent, notes } = req.body;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { currentClassId: true }
  });

  if (!student || !student.currentClassId) {
    return res.status(404).json({
      success: false,
      message: 'Student or class not found'
    });
  }

  let progress = await prisma.studentTopicProgress.findUnique({
    where: {
      studentId_topicId_classId: {
        studentId,
        topicId,
        classId: student.currentClassId
      }
    }
  });

  if (progress) {
    progress = await prisma.studentTopicProgress.update({
      where: { id: progress.id },
      data: {
        status: status || progress.status,
        progressPercent: progressPercent !== undefined ? progressPercent : progress.progressPercent,
        notes: notes !== undefined ? notes : progress.notes,
        lastActivity: new Date(),
        attemptsCount: progress.attemptsCount + 1
      },
      include: {
        topic: {
          include: {
            concepts: true
          }
        }
      }
    });
  } else {
    progress = await prisma.studentTopicProgress.create({
      data: {
        studentId,
        topicId,
        classId: student.currentClassId,
        status: status || 'IN_PROGRESS',
        progressPercent: progressPercent || 0,
        notes,
        lastActivity: new Date(),
        attemptsCount: 1
      },
      include: {
        topic: {
          include: {
            concepts: true
          }
        }
      }
    });
  }

  res.json({
    success: true,
    data: progress,
    message: 'Student topic progress updated successfully'
  });
});

// @desc    Record mastery evidence
// @route   POST /api/topic-tracking/student/:studentId/concept/:conceptId/evidence
// @access  Private (Teacher/System)
exports.recordMasteryEvidence = asyncHandler(async (req, res) => {
  const { studentId, conceptId } = req.params;
  const { sourceType, sourceId, score, maxScore, weight, aiAnalysis } = req.body;

  // Find or create concept mastery record
  let mastery = await prisma.studentConceptMastery.findUnique({
    where: {
      studentId_conceptId: {
        studentId,
        conceptId
      }
    }
  });

  if (!mastery) {
    mastery = await prisma.studentConceptMastery.create({
      data: {
        studentId,
        conceptId,
        masteryLevel: 0,
        status: 'NOVICE',
        lastAssessed: new Date(),
        evidenceCount: 0
      }
    });
  }

  // Record evidence
  const evidence = await prisma.masteryEvidence.create({
    data: {
      masteryId: mastery.id,
      sourceType,
      sourceId,
      score,
      maxScore,
      weight: weight || 1.0,
      aiAnalysis: aiAnalysis || null,
      timestamp: new Date()
    }
  });

  // Recalculate mastery level
  const allEvidence = await prisma.masteryEvidence.findMany({
    where: { masteryId: mastery.id },
    orderBy: { timestamp: 'desc' }
  });

  // Calculate weighted average (more weight on recent attempts)
  let totalWeight = 0;
  let weightedSum = 0;
  allEvidence.forEach((ev, index) => {
    const recencyWeight = Math.pow(0.9, index); // Recent evidence weighted more
    const evidenceWeight = ev.weight * recencyWeight;
    const percentage = (ev.score / ev.maxScore) * 100;
    weightedSum += percentage * evidenceWeight;
    totalWeight += evidenceWeight;
  });

  const newMasteryLevel = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Determine status
  let status = 'NOVICE';
  if (newMasteryLevel >= 90) status = 'MASTERED';
  else if (newMasteryLevel >= 75) status = 'ADVANCED';
  else if (newMasteryLevel >= 60) status = 'PROFICIENT';
  else if (newMasteryLevel >= 40) status = 'DEVELOPING';

  // Determine trend
  let trend = 'STABLE';
  if (allEvidence.length >= 3) {
    const recent = allEvidence.slice(0, 3).reduce((sum, ev) => sum + (ev.score / ev.maxScore), 0) / 3;
    const older = allEvidence.slice(3, 6).reduce((sum, ev) => sum + (ev.score / ev.maxScore), 0) / Math.min(3, allEvidence.length - 3);
    if (recent > older + 0.1) trend = 'IMPROVING';
    else if (recent < older - 0.1) trend = 'DECLINING';
  }

  // Update mastery
  mastery = await prisma.studentConceptMastery.update({
    where: { id: mastery.id },
    data: {
      masteryLevel: newMasteryLevel,
      status,
      trend,
      lastAssessed: new Date(),
      evidenceCount: allEvidence.length
    },
    include: {
      concept: true,
      evidence: {
        orderBy: { timestamp: 'desc' },
        take: 10
      }
    }
  });

  res.json({
    success: true,
    data: {
      mastery,
      evidence
    },
    message: 'Mastery evidence recorded successfully'
  });
});

// @desc    Get concept mastery for a student
// @route   GET /api/topic-tracking/student/:studentId/concept-mastery
// @access  Private
exports.getStudentConceptMastery = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { topicId } = req.query;

  const whereClause = { studentId };
  if (topicId) {
    whereClause.concept = {
      topicId
    };
  }

  const masteryRecords = await prisma.studentConceptMastery.findMany({
    where: whereClause,
    include: {
      concept: {
        include: {
          topic: {
            include: {
              curriculumSubject: {
                include: {
                  subject: true
                }
              }
            }
          }
        }
      },
      evidence: {
        orderBy: { timestamp: 'desc' },
        take: 5
      }
    },
    orderBy: { lastAssessed: 'desc' }
  });

  // Calculate statistics
  const stats = {
    totalConcepts: masteryRecords.length,
    mastered: masteryRecords.filter(m => m.status === 'MASTERED').length,
    advanced: masteryRecords.filter(m => m.status === 'ADVANCED').length,
    proficient: masteryRecords.filter(m => m.status === 'PROFICIENT').length,
    developing: masteryRecords.filter(m => m.status === 'DEVELOPING').length,
    novice: masteryRecords.filter(m => m.status === 'NOVICE').length,
    averageMastery: masteryRecords.length > 0
      ? masteryRecords.reduce((sum, m) => sum + m.masteryLevel, 0) / masteryRecords.length
      : 0,
    improving: masteryRecords.filter(m => m.trend === 'IMPROVING').length,
    declining: masteryRecords.filter(m => m.trend === 'DECLINING').length
  };

  res.json({
    success: true,
    data: {
      masteryRecords,
      statistics: stats
    },
    message: `Retrieved mastery for ${masteryRecords.length} concepts`
  });
});

module.exports = exports;
