const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class NotificationPreferencesService {
  /**
   * Get user's notification preferences
   */
  async getUserPreferences(userId) {
    try {
      let preferences = await prisma.userNotificationPreferences.findUnique({
        where: { userId },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true }
          }
        }
      });

      // Create default preferences if they don't exist
      if (!preferences) {
        preferences = await this.createDefaultPreferences(userId);
      }

      return preferences;

    } catch (error) {
      logger.error('Error getting user preferences:', error);
      throw error;
    }
  }

  /**
   * Create default notification preferences for user
   */
  async createDefaultPreferences(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, email: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const defaultPreferences = this.getDefaultPreferencesForRole(user.role);

      const preferences = await prisma.userNotificationPreferences.create({
        data: {
          userId,
          ...defaultPreferences
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true }
          }
        }
      });

      logger.info(`Created default preferences for user ${userId} with role ${user.role}`);
      return preferences;

    } catch (error) {
      logger.error('Error creating default preferences:', error);
      throw error;
    }
  }

  /**
   * Get default preferences based on user role
   */
  getDefaultPreferencesForRole(role) {
    const baseDefaults = {
      isEnabled: true,
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      inAppEnabled: true,
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '07:00',
      quietHoursDays: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
    };

    const roleSpecificPreferences = {
      STUDENT: {
        preferences: {
          ACADEMIC: {
            GRADE_UPDATE: { email: true, sms: false, push: true, inApp: true },
            ASSIGNMENT: { email: true, sms: false, push: true, inApp: true },
            EXAM_RESULT: { email: true, sms: true, push: true, inApp: true },
            ATTENDANCE: { email: false, sms: false, push: true, inApp: true },
            TIMETABLE_CHANGE: { email: false, sms: false, push: true, inApp: true }
          },
          ADMINISTRATIVE: {
            ANNOUNCEMENT: { email: true, sms: false, push: true, inApp: true },
            EVENT: { email: true, sms: false, push: true, inApp: true },
            FEE_REMINDER: { email: true, sms: true, push: true, inApp: true }
          },
          SYSTEM: {
            WELCOME: { email: true, sms: false, push: false, inApp: true },
            PASSWORD_RESET: { email: true, sms: true, push: false, inApp: false }
          }
        }
      },

      PARENT: {
        smsEnabled: true, // Parents typically want SMS alerts
        preferences: {
          ACADEMIC: {
            GRADE_UPDATE: { email: true, sms: true, push: true, inApp: true },
            ASSIGNMENT: { email: true, sms: false, push: true, inApp: true },
            EXAM_RESULT: { email: true, sms: true, push: true, inApp: true },
            ATTENDANCE: { email: true, sms: true, push: true, inApp: true },
            DISCIPLINARY: { email: true, sms: true, push: true, inApp: true }
          },
          FINANCIAL: {
            FEE_REMINDER: { email: true, sms: true, push: true, inApp: true }
          },
          HEALTH: {
            HEALTH: { email: true, sms: true, push: true, inApp: true }
          },
          SAFETY: {
            EMERGENCY: { email: true, sms: true, push: true, inApp: true },
            TRANSPORT: { email: false, sms: true, push: true, inApp: true }
          }
        }
      },

      TEACHER: {
        preferences: {
          ACADEMIC: {
            ASSIGNMENT: { email: true, sms: false, push: true, inApp: true },
            TIMETABLE_CHANGE: { email: true, sms: false, push: true, inApp: true },
            EXAM_RESULT: { email: false, sms: false, push: true, inApp: true }
          },
          ADMINISTRATIVE: {
            ANNOUNCEMENT: { email: true, sms: false, push: true, inApp: true },
            EVENT: { email: true, sms: false, push: true, inApp: true }
          },
          SYSTEM: {
            SYSTEM: { email: true, sms: false, push: true, inApp: true }
          }
        }
      },

      ADMIN: {
        preferences: {
          SYSTEM: {
            SYSTEM: { email: true, sms: true, push: true, inApp: true },
            EMERGENCY: { email: true, sms: true, push: true, inApp: true }
          },
          ADMINISTRATIVE: {
            ANNOUNCEMENT: { email: true, sms: false, push: true, inApp: true }
          },
          FINANCIAL: {
            FEE_REMINDER: { email: false, sms: false, push: false, inApp: true }
          }
        }
      },

      PRINCIPAL: {
        preferences: {
          SYSTEM: {
            SYSTEM: { email: true, sms: true, push: true, inApp: true },
            EMERGENCY: { email: true, sms: true, push: true, inApp: true }
          },
          ADMINISTRATIVE: {
            ANNOUNCEMENT: { email: true, sms: false, push: true, inApp: true }
          },
          ACADEMIC: {
            DISCIPLINARY: { email: true, sms: true, push: true, inApp: true }
          }
        }
      }
    };

    const roleDefaults = roleSpecificPreferences[role] || roleSpecificPreferences.STUDENT;
    
    return {
      ...baseDefaults,
      ...roleDefaults
    };
  }

  /**
   * Update user's notification preferences
   */
  async updateUserPreferences(userId, updates) {
    try {
      // Validate updates
      this.validatePreferencesUpdate(updates);

      const preferences = await prisma.userNotificationPreferences.upsert({
        where: { userId },
        update: updates,
        create: {
          userId,
          ...this.getDefaultPreferencesForRole('STUDENT'), // Default fallback
          ...updates
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true }
          }
        }
      });

      logger.info(`Updated notification preferences for user ${userId}`);
      return preferences;

    } catch (error) {
      logger.error('Error updating user preferences:', error);
      throw error;
    }
  }

  /**
   * Validate preferences update data
   */
  validatePreferencesUpdate(updates) {
    const allowedFields = [
      'isEnabled',
      'emailEnabled',
      'smsEnabled', 
      'pushEnabled',
      'inAppEnabled',
      'preferences',
      'quietHoursEnabled',
      'quietHoursStart',
      'quietHoursEnd',
      'quietHoursDays'
    ];

    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));
    if (invalidFields.length > 0) {
      throw new Error(`Invalid preference fields: ${invalidFields.join(', ')}`);
    }

    // Validate time format for quiet hours
    if (updates.quietHoursStart && !this.isValidTimeFormat(updates.quietHoursStart)) {
      throw new Error('Invalid quiet hours start time format (expected HH:MM)');
    }

    if (updates.quietHoursEnd && !this.isValidTimeFormat(updates.quietHoursEnd)) {
      throw new Error('Invalid quiet hours end time format (expected HH:MM)');
    }

    // Validate days array
    if (updates.quietHoursDays && !this.isValidDaysArray(updates.quietHoursDays)) {
      throw new Error('Invalid quiet hours days format');
    }
  }

  /**
   * Validate time format (HH:MM)
   */
  isValidTimeFormat(time) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Validate days array
   */
  isValidDaysArray(days) {
    if (!Array.isArray(days)) return false;
    
    const validDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days.every(day => validDays.includes(day));
  }

  /**
   * Get notification preferences for a specific notification type/category
   */
  async getPreferencesForNotification(userId, notificationType, notificationCategory) {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      if (!preferences || !preferences.isEnabled) {
        return {
          email: false,
          sms: false,
          push: false,
          inApp: false
        };
      }

      // Get type-specific preferences
      const typePreferences = preferences.preferences?.[notificationCategory]?.[notificationType] || {};
      
      return {
        email: preferences.emailEnabled && (typePreferences.email !== false),
        sms: preferences.smsEnabled && (typePreferences.sms !== false),
        push: preferences.pushEnabled && (typePreferences.push !== false),
        inApp: preferences.inAppEnabled && (typePreferences.inApp !== false)
      };

    } catch (error) {
      logger.error('Error getting preferences for notification:', error);
      
      // Return default (all enabled) if there's an error
      return {
        email: true,
        sms: true,
        push: true,
        inApp: true
      };
    }
  }

  /**
   * Update preference for specific notification type/category
   */
  async updateNotificationTypePreference(userId, notificationCategory, notificationType, channelPreferences) {
    try {
      const currentPreferences = await this.getUserPreferences(userId);
      
      // Deep merge preferences
      const preferences = currentPreferences.preferences || {};
      
      if (!preferences[notificationCategory]) {
        preferences[notificationCategory] = {};
      }
      
      preferences[notificationCategory][notificationType] = {
        ...preferences[notificationCategory][notificationType],
        ...channelPreferences
      };

      return await this.updateUserPreferences(userId, { preferences });

    } catch (error) {
      logger.error('Error updating notification type preference:', error);
      throw error;
    }
  }

  /**
   * Reset preferences to defaults for user
   */
  async resetToDefaults(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      const defaultPreferences = this.getDefaultPreferencesForRole(user.role);

      const preferences = await prisma.userNotificationPreferences.upsert({
        where: { userId },
        update: defaultPreferences,
        create: {
          userId,
          ...defaultPreferences
        },
        include: {
          user: {
            select: { id: true, email: true, name: true, role: true }
          }
        }
      });

      logger.info(`Reset preferences to defaults for user ${userId}`);
      return preferences;

    } catch (error) {
      logger.error('Error resetting preferences to defaults:', error);
      throw error;
    }
  }

  /**
   * Enable/disable all notifications for user
   */
  async toggleAllNotifications(userId, enabled) {
    try {
      const preferences = await this.updateUserPreferences(userId, { isEnabled: enabled });
      
      logger.info(`${enabled ? 'Enabled' : 'Disabled'} all notifications for user ${userId}`);
      return preferences;

    } catch (error) {
      logger.error('Error toggling all notifications:', error);
      throw error;
    }
  }

  /**
   * Enable/disable specific channel for user
   */
  async toggleChannel(userId, channel, enabled) {
    try {
      const channelField = `${channel.toLowerCase()}Enabled`;
      const updates = {};
      updates[channelField] = enabled;

      const preferences = await this.updateUserPreferences(userId, updates);
      
      logger.info(`${enabled ? 'Enabled' : 'Disabled'} ${channel} notifications for user ${userId}`);
      return preferences;

    } catch (error) {
      logger.error(`Error toggling ${channel} notifications:`, error);
      throw error;
    }
  }

  /**
   * Set quiet hours for user
   */
  async setQuietHours(userId, quietHoursData) {
    try {
      const { enabled, startTime, endTime, days } = quietHoursData;

      const updates = {
        quietHoursEnabled: enabled
      };

      if (enabled) {
        updates.quietHoursStart = startTime;
        updates.quietHoursEnd = endTime;
        updates.quietHoursDays = days;
      }

      const preferences = await this.updateUserPreferences(userId, updates);
      
      logger.info(`Updated quiet hours for user ${userId}: ${enabled ? 'enabled' : 'disabled'}`);
      return preferences;

    } catch (error) {
      logger.error('Error setting quiet hours:', error);
      throw error;
    }
  }

  /**
   * Get all users who should receive a specific notification type
   */
  async getUsersForNotification(schoolId, notificationType, notificationCategory, targetUsers = null) {
    try {
      const whereCondition = {
        schoolId,
        isActive: true
      };

      // If specific users are targeted, filter by them
      if (targetUsers && targetUsers.length > 0) {
        whereCondition.id = { in: targetUsers };
      }

      const users = await prisma.user.findMany({
        where: whereCondition,
        include: {
          notificationPreferences: true,
          student: true,
          staff: true
        }
      });

      // Filter users based on their preferences
      const eligibleUsers = [];

      for (const user of users) {
        const prefs = await this.getPreferencesForNotification(
          user.id, 
          notificationType, 
          notificationCategory
        );

        // Check if user has at least one enabled channel
        const hasEnabledChannel = prefs.email || prefs.sms || prefs.push || prefs.inApp;
        
        if (hasEnabledChannel) {
          eligibleUsers.push({
            ...user,
            channelPreferences: prefs
          });
        }
      }

      return eligibleUsers;

    } catch (error) {
      logger.error('Error getting users for notification:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences summary for school admin
   */
  async getSchoolPreferencesSummary(schoolId) {
    try {
      const users = await prisma.user.findMany({
        where: { schoolId, isActive: true },
        include: {
          notificationPreferences: true
        }
      });

      const summary = {
        totalUsers: users.length,
        enabledUsers: 0,
        channelStats: {
          email: 0,
          sms: 0,
          push: 0,
          inApp: 0
        },
        roleStats: {},
        quietHoursUsers: 0
      };

      for (const user of users) {
        const prefs = user.notificationPreferences;
        
        if (prefs?.isEnabled !== false) {
          summary.enabledUsers++;
        }

        if (prefs) {
          if (prefs.emailEnabled) summary.channelStats.email++;
          if (prefs.smsEnabled) summary.channelStats.sms++;
          if (prefs.pushEnabled) summary.channelStats.push++;
          if (prefs.inAppEnabled) summary.channelStats.inApp++;
          if (prefs.quietHoursEnabled) summary.quietHoursUsers++;
        }

        // Role statistics
        if (!summary.roleStats[user.role]) {
          summary.roleStats[user.role] = 0;
        }
        summary.roleStats[user.role]++;
      }

      return summary;

    } catch (error) {
      logger.error('Error getting school preferences summary:', error);
      throw error;
    }
  }

  /**
   * Bulk update preferences for multiple users
   */
  async bulkUpdatePreferences(userIds, updates) {
    try {
      this.validatePreferencesUpdate(updates);

      const results = [];

      for (const userId of userIds) {
        try {
          const preferences = await this.updateUserPreferences(userId, updates);
          results.push({ userId, success: true, preferences });
        } catch (error) {
          results.push({ userId, success: false, error: error.message });
        }
      }

      const successCount = results.filter(r => r.success).length;
      
      logger.info(`Bulk updated preferences for ${successCount}/${userIds.length} users`);
      
      return {
        total: userIds.length,
        successful: successCount,
        failed: userIds.length - successCount,
        results
      };

    } catch (error) {
      logger.error('Error in bulk update preferences:', error);
      throw error;
    }
  }

  /**
   * Get template preferences for role
   */
  getTemplatePreferencesForRole(role) {
    const roleDefaults = this.getDefaultPreferencesForRole(role);
    return {
      role,
      ...roleDefaults
    };
  }

  /**
   * Export user preferences
   */
  async exportUserPreferences(userId) {
    try {
      const preferences = await this.getUserPreferences(userId);
      
      return {
        userId: preferences.userId,
        exportedAt: new Date().toISOString(),
        preferences: {
          global: {
            enabled: preferences.isEnabled,
            channels: {
              email: preferences.emailEnabled,
              sms: preferences.smsEnabled,
              push: preferences.pushEnabled,
              inApp: preferences.inAppEnabled
            },
            quietHours: {
              enabled: preferences.quietHoursEnabled,
              start: preferences.quietHoursStart,
              end: preferences.quietHoursEnd,
              days: preferences.quietHoursDays
            }
          },
          detailed: preferences.preferences
        }
      };

    } catch (error) {
      logger.error('Error exporting user preferences:', error);
      throw error;
    }
  }
}

module.exports = new NotificationPreferencesService();