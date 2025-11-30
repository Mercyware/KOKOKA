const { prisma } = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * LearningActivityService
 * Tracks and analyzes all student learning activities
 */
class LearningActivityService {
  /**
   * Track a learning activity
   */
  async trackActivity(data) {
    try {
      const {
        studentId,
        activityType,
        assignmentId = null,
        metadata = {},
        duration = null,
      } = data;

      const activity = await prisma.learningActivity.create({
        data: {
          studentId,
          activityType,
          assignmentId,
          metadata,
          duration,
          timestamp: new Date(),
        },
      });

      logger.info(`Learning activity tracked: ${activityType} for student: ${studentId}`);
      return activity;
    } catch (error) {
      logger.error(`Error tracking learning activity: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get student learning activities
   */
  async getStudentActivities(studentId, filters = {}) {
    try {
      const { activityType, fromDate, toDate, limit = 100, offset = 0 } = filters;

      const where = { studentId };

      if (activityType) {
        where.activityType = activityType;
      }

      if (fromDate || toDate) {
        where.timestamp = {};
        if (fromDate) where.timestamp.gte = new Date(fromDate);
        if (toDate) where.timestamp.lte = new Date(toDate);
      }

      const [activities, total] = await Promise.all([
        prisma.learningActivity.findMany({
          where,
          include: {
            assignment: {
              include: {
                subject: true,
              },
            },
          },
          orderBy: { timestamp: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.learningActivity.count({ where }),
      ]);

      return {
        activities,
        total,
        limit,
        offset,
      };
    } catch (error) {
      logger.error(`Error fetching student activities: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get engagement metrics for a student
   */
  async getEngagementMetrics(studentId, timeRange = 30) {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - timeRange);

      const activities = await prisma.learningActivity.findMany({
        where: {
          studentId,
          timestamp: { gte: fromDate },
        },
        include: {
          assignment: {
            include: {
              subject: true,
            },
          },
        },
      });

      // Calculate metrics
      const totalActivities = activities.length;
      const activeDays = new Set(
        activities.map(a => a.timestamp.toISOString().split('T')[0])
      ).size;

      const activityTypeCount = activities.reduce((acc, activity) => {
        acc[activity.activityType] = (acc[activity.activityType] || 0) + 1;
        return acc;
      }, {});

      const subjectEngagement = activities
        .filter(a => a.assignment?.subject)
        .reduce((acc, activity) => {
          const subjectName = activity.assignment.subject.name;
          acc[subjectName] = (acc[subjectName] || 0) + 1;
          return acc;
        }, {});

      const totalDuration = activities
        .filter(a => a.duration)
        .reduce((sum, a) => sum + a.duration, 0);

      const averageDailyActivities = activeDays > 0
        ? (totalActivities / activeDays).toFixed(2)
        : 0;

      const engagementScore = this.calculateEngagementScore({
        activeDays,
        totalActivities,
        timeRange,
      });

      return {
        timeRange,
        totalActivities,
        activeDays,
        activeRate: ((activeDays / timeRange) * 100).toFixed(2),
        averageDailyActivities: parseFloat(averageDailyActivities),
        totalDuration,
        averageDuration: totalActivities > 0
          ? Math.round(totalDuration / totalActivities)
          : 0,
        activityTypeBreakdown: activityTypeCount,
        subjectEngagement,
        engagementScore: parseFloat(engagementScore),
      };
    } catch (error) {
      logger.error(`Error fetching engagement metrics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Calculate engagement score (0-100)
   */
  calculateEngagementScore(data) {
    const { activeDays, totalActivities, timeRange } = data;

    // Components of engagement score
    const activeRateScore = (activeDays / timeRange) * 40; // 40% weight
    const activityVolumeScore = Math.min((totalActivities / (timeRange * 3)) * 40, 40); // 40% weight
    const consistencyScore = this.calculateConsistencyScore(activeDays, timeRange) * 20; // 20% weight

    return (activeRateScore + activityVolumeScore + consistencyScore).toFixed(2);
  }

  /**
   * Calculate consistency score (0-1)
   */
  calculateConsistencyScore(activeDays, timeRange) {
    // Reward more consistent engagement over time
    const idealPattern = timeRange / 2; // Ideally active half the days
    const deviation = Math.abs(activeDays - idealPattern);
    const maxDeviation = timeRange / 2;

    return Math.max(0, 1 - (deviation / maxDeviation));
  }

  /**
   * Get learning patterns for a student
   */
  async getLearningPatterns(studentId, days = 30) {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const activities = await prisma.learningActivity.findMany({
        where: {
          studentId,
          timestamp: { gte: fromDate },
        },
        orderBy: { timestamp: 'asc' },
      });

      // Analyze patterns
      const hourlyActivity = activities.reduce((acc, activity) => {
        const hour = activity.timestamp.getHours();
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {});

      const weekdayActivity = activities.reduce((acc, activity) => {
        const day = activity.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      }, {});

      const mostActiveHour = Object.entries(hourlyActivity).reduce((max, [hour, count]) => {
        return count > (max.count || 0) ? { hour: parseInt(hour), count } : max;
      }, {});

      const mostActiveDay = Object.entries(weekdayActivity).reduce((max, [day, count]) => {
        return count > (max.count || 0) ? { day, count } : max;
      }, {});

      return {
        hourlyDistribution: hourlyActivity,
        weekdayDistribution: weekdayActivity,
        mostActiveHour: mostActiveHour.hour !== undefined
          ? `${mostActiveHour.hour}:00-${mostActiveHour.hour + 1}:00`
          : 'N/A',
        mostActiveDay: mostActiveDay.day || 'N/A',
        peakEngagementTime: mostActiveHour.hour !== undefined
          ? this.getTimeOfDayCategory(mostActiveHour.hour)
          : 'Unknown',
      };
    } catch (error) {
      logger.error(`Error analyzing learning patterns: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get time of day category
   */
  getTimeOfDayCategory(hour) {
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
  }

  /**
   * Get participation score for a student
   */
  async getParticipationScore(studentId, period = 'current_term') {
    try {
      // Get current academic year/term
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { schoolId: true },
      });

      if (!student) {
        throw new Error('Student not found');
      }

      // Simplified - calculate based on last 30 days
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);

      const [activities, assignments, submissions] = await Promise.all([
        prisma.learningActivity.count({
          where: {
            studentId,
            timestamp: { gte: fromDate },
          },
        }),
        prisma.assignment.count({
          where: {
            schoolId: student.schoolId,
            createdAt: { gte: fromDate },
            status: 'ACTIVE',
          },
        }),
        prisma.assignmentSubmission.count({
          where: {
            studentId,
            submittedAt: { gte: fromDate },
            status: { not: 'DRAFT' },
          },
        }),
      ]);

      const submissionRate = assignments > 0 ? (submissions / assignments) * 100 : 0;
      const activityScore = Math.min((activities / 30) * 10, 100); // Normalize activities

      const participationScore = (submissionRate * 0.6) + (activityScore * 0.4);

      return {
        score: parseFloat(participationScore.toFixed(2)),
        activities,
        assignments,
        submissions,
        submissionRate: parseFloat(submissionRate.toFixed(2)),
        period: 'Last 30 days',
      };
    } catch (error) {
      logger.error(`Error calculating participation score: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get time-on-task analytics
   */
  async getTimeOnTaskAnalytics(studentId, days = 30) {
    try {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      const activities = await prisma.learningActivity.findMany({
        where: {
          studentId,
          timestamp: { gte: fromDate },
          duration: { not: null },
        },
        include: {
          assignment: {
            include: {
              subject: true,
            },
          },
        },
      });

      const totalTime = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
      const averageSessionDuration = activities.length > 0
        ? totalTime / activities.length
        : 0;

      const subjectTime = activities
        .filter(a => a.assignment?.subject)
        .reduce((acc, activity) => {
          const subjectName = activity.assignment.subject.name;
          acc[subjectName] = (acc[subjectName] || 0) + activity.duration;
          return acc;
        }, {});

      const dailyTime = activities.reduce((acc, activity) => {
        const date = activity.timestamp.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + activity.duration;
        return acc;
      }, {});

      const averageDailyTime = Object.keys(dailyTime).length > 0
        ? Object.values(dailyTime).reduce((sum, time) => sum + time, 0) / Object.keys(dailyTime).length
        : 0;

      return {
        totalTime,
        totalHours: (totalTime / 3600).toFixed(2),
        sessions: activities.length,
        averageSessionDuration: Math.round(averageSessionDuration),
        averageDailyTime: Math.round(averageDailyTime),
        subjectTimeBreakdown: subjectTime,
        dailyTimeDistribution: dailyTime,
      };
    } catch (error) {
      logger.error(`Error fetching time-on-task analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get comprehensive learning journey
   */
  async getLearningJourney(studentId, limit = 50) {
    try {
      const activities = await prisma.learningActivity.findMany({
        where: { studentId },
        include: {
          assignment: {
            include: {
              subject: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
        take: limit,
      });

      const journey = activities.map(activity => ({
        id: activity.id,
        type: activity.activityType,
        timestamp: activity.timestamp,
        assignment: activity.assignment ? {
          id: activity.assignment.id,
          title: activity.assignment.title,
          subject: activity.assignment.subject.name,
        } : null,
        metadata: activity.metadata,
        duration: activity.duration,
      }));

      return journey;
    } catch (error) {
      logger.error(`Error fetching learning journey: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk track activities (for batch processing)
   */
  async bulkTrackActivities(activities) {
    try {
      const created = await prisma.learningActivity.createMany({
        data: activities.map(a => ({
          ...a,
          timestamp: a.timestamp || new Date(),
        })),
      });

      logger.info(`Bulk tracked ${created.count} learning activities`);
      return created;
    } catch (error) {
      logger.error(`Error bulk tracking activities: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new LearningActivityService();
