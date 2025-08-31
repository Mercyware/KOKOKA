const { PrismaClient } = require('@prisma/client');
const Handlebars = require('handlebars');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

class TemplateService {
  constructor() {
    this.compiledTemplates = new Map();
    this.registerHelpers();
  }

  /**
   * Register Handlebars helpers
   */
  registerHelpers() {
    // Date formatting helper
    Handlebars.registerHelper('formatDate', function(date, format) {
      if (!date) return '';
      
      const d = new Date(date);
      
      switch (format) {
        case 'short':
          return d.toLocaleDateString();
        case 'long':
          return d.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        case 'time':
          return d.toLocaleTimeString();
        case 'datetime':
          return d.toLocaleString();
        default:
          return d.toLocaleDateString();
      }
    });

    // Currency formatting helper
    Handlebars.registerHelper('formatCurrency', function(amount, currency = 'USD') {
      if (amount === null || amount === undefined) return '$0.00';
      
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    });

    // Percentage helper
    Handlebars.registerHelper('formatPercentage', function(value, total) {
      if (!value || !total || total === 0) return '0%';
      return ((value / total) * 100).toFixed(1) + '%';
    });

    // Conditional helper
    Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    });

    // Grade helper
    Handlebars.registerHelper('getGradeLetter', function(percentage) {
      if (percentage >= 90) return 'A';
      if (percentage >= 80) return 'B';
      if (percentage >= 70) return 'C';
      if (percentage >= 60) return 'D';
      return 'F';
    });

    // Capitalize helper
    Handlebars.registerHelper('capitalize', function(str) {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });

    // User display name helper
    Handlebars.registerHelper('userDisplayName', function(user) {
      if (!user) return 'Unknown User';
      return user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
    });
  }

  /**
   * Render template with data
   */
  async renderTemplate(template, data) {
    try {
      const renderedContent = {};

      // Render email content
      if (template.emailSubject) {
        renderedContent.emailSubject = this.renderString(template.emailSubject, data);
      }
      if (template.emailContent) {
        renderedContent.emailContent = this.renderString(template.emailContent, data);
      }
      if (template.emailHtml) {
        renderedContent.emailHtml = this.renderString(template.emailHtml, data);
      }

      // Render SMS content
      if (template.smsContent) {
        renderedContent.smsContent = this.renderString(template.smsContent, data);
      }

      // Render push notification content
      if (template.pushTitle) {
        renderedContent.pushTitle = this.renderString(template.pushTitle, data);
      }
      if (template.pushContent) {
        renderedContent.pushContent = this.renderString(template.pushContent, data);
      }

      // Render in-app content
      if (template.inAppContent) {
        renderedContent.inAppContent = this.renderString(template.inAppContent, data);
      }

      // Use fallback content if channel-specific content not available
      const fallbackContent = {
        title: data.title || template.name,
        message: data.message || this.renderString(template.inAppContent || template.emailContent || '', data)
      };

      return {
        ...renderedContent,
        ...fallbackContent
      };

    } catch (error) {
      logger.error('Error rendering template:', error);
      throw new Error(`Template rendering failed: ${error.message}`);
    }
  }

  /**
   * Render string template with data
   */
  renderString(templateString, data) {
    try {
      const cacheKey = this.hashString(templateString);
      
      let compiledTemplate = this.compiledTemplates.get(cacheKey);
      if (!compiledTemplate) {
        compiledTemplate = Handlebars.compile(templateString);
        this.compiledTemplates.set(cacheKey, compiledTemplate);
      }

      return compiledTemplate(data);
    } catch (error) {
      logger.error('Error rendering string template:', error);
      return templateString; // Return original if compilation fails
    }
  }

  /**
   * Create notification template
   */
  async createTemplate(templateData) {
    try {
      const {
        schoolId = null,
        name,
        description,
        type,
        category,
        emailSubject,
        emailContent,
        emailHtml,
        smsContent,
        pushTitle,
        pushContent,
        inAppContent,
        variables = [],
        isActive = true,
        isSystem = false,
        createdById
      } = templateData;

      // Validate required fields
      if (!name || !type || !category || !createdById) {
        throw new Error('Missing required template fields');
      }

      // Check for duplicate name within school
      const existingTemplate = await prisma.notificationTemplate.findFirst({
        where: {
          schoolId,
          name,
          isActive: true
        }
      });

      if (existingTemplate) {
        throw new Error('Template with this name already exists');
      }

      const template = await prisma.notificationTemplate.create({
        data: {
          schoolId,
          name,
          description,
          type,
          category,
          emailSubject,
          emailContent,
          emailHtml,
          smsContent,
          pushTitle,
          pushContent,
          inAppContent,
          variables: variables,
          isActive,
          isSystem,
          createdById
        }
      });

      return template;

    } catch (error) {
      logger.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Update notification template
   */
  async updateTemplate(id, updateData, schoolId = null) {
    try {
      const where = { id };
      if (schoolId) where.schoolId = schoolId;

      // Don't allow updating system templates
      const existingTemplate = await prisma.notificationTemplate.findUnique({
        where: { id }
      });

      if (existingTemplate?.isSystem) {
        throw new Error('Cannot update system templates');
      }

      const template = await prisma.notificationTemplate.update({
        where,
        data: updateData
      });

      // Clear compiled template cache
      this.compiledTemplates.clear();

      return template;

    } catch (error) {
      logger.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(id, schoolId = null) {
    const where = { id, isActive: true };
    if (schoolId) where.schoolId = schoolId;

    return await prisma.notificationTemplate.findUnique({
      where,
      include: {
        school: true,
        createdBy: true
      }
    });
  }

  /**
   * List templates with filters
   */
  async listTemplates(filters = {}) {
    const {
      schoolId = null,
      type = null,
      category = null,
      isSystem = null,
      search = null,
      page = 1,
      limit = 50
    } = filters;

    const where = { isActive: true };
    
    if (schoolId !== null) where.schoolId = schoolId;
    if (type) where.type = type;
    if (category) where.category = category;
    if (isSystem !== null) where.isSystem = isSystem;
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [templates, total] = await Promise.all([
      prisma.notificationTemplate.findMany({
        where,
        include: {
          school: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.notificationTemplate.count({ where })
    ]);

    return {
      templates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Delete template
   */
  async deleteTemplate(id, schoolId = null) {
    try {
      const where = { id };
      if (schoolId) where.schoolId = schoolId;

      // Don't allow deleting system templates
      const existingTemplate = await prisma.notificationTemplate.findUnique({
        where: { id }
      });

      if (existingTemplate?.isSystem) {
        throw new Error('Cannot delete system templates');
      }

      // Soft delete by marking as inactive
      const template = await prisma.notificationTemplate.update({
        where,
        data: { isActive: false }
      });

      return template;

    } catch (error) {
      logger.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Create default system templates
   */
  async createDefaultTemplates(schoolId, createdById) {
    const defaultTemplates = [
      {
        name: 'Welcome Email',
        description: 'Welcome email for new users',
        type: 'WELCOME',
        category: 'SYSTEM',
        emailSubject: 'Welcome to {{school.name}}!',
        emailContent: `Dear {{userDisplayName user}},

Welcome to {{school.name}}! Your account has been created successfully.

Role: {{capitalize user.role}}
Email: {{user.email}}

You can now log in to access your dashboard and explore the features available to you.

Best regards,
{{school.name}} Administration Team`,
        emailHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2563eb;">Welcome to {{school.name}}!</h2>
  
  <p>Dear {{userDisplayName user}},</p>
  
  <p>Welcome to {{school.name}}! Your account has been created successfully.</p>
  
  <div style="background-color: #f8fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Role:</strong> {{capitalize user.role}}</p>
    <p style="margin: 5px 0;"><strong>Email:</strong> {{user.email}}</p>
  </div>
  
  <p>You can now log in to access your dashboard and explore the features available to you.</p>
  
  <p>Best regards,<br>{{school.name}} Administration Team</p>
</div>`,
        smsContent: 'Welcome to {{school.name}}! Your {{capitalize user.role}} account has been created successfully. Please log in to get started.',
        inAppContent: 'Welcome to {{school.name}}! Your account has been created successfully.',
        pushTitle: 'Welcome!',
        pushContent: 'Your {{school.name}} account is ready!',
        variables: ['user', 'school']
      },
      
      {
        name: 'Attendance Alert',
        description: 'Alert for student attendance issues',
        type: 'ATTENDANCE',
        category: 'ACADEMIC',
        emailSubject: 'Attendance Alert - {{student.firstName}} {{student.lastName}}',
        emailContent: `Dear {{userDisplayName user}},

This is an attendance alert for {{student.firstName}} {{student.lastName}}.

Date: {{formatDate date 'long'}}
Status: {{capitalize status}}
{{#if reason}}
Reason: {{reason}}
{{/if}}

Please contact the school if you have any questions.

Best regards,
{{school.name}}`,
        emailHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #dc2626;">Attendance Alert</h2>
  
  <p>Dear {{userDisplayName user}},</p>
  
  <p>This is an attendance alert for <strong>{{student.firstName}} {{student.lastName}}</strong>.</p>
  
  <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Date:</strong> {{formatDate date 'long'}}</p>
    <p style="margin: 5px 0;"><strong>Status:</strong> {{capitalize status}}</p>
    {{#if reason}}
    <p style="margin: 5px 0;"><strong>Reason:</strong> {{reason}}</p>
    {{/if}}
  </div>
  
  <p>Please contact the school if you have any questions.</p>
  
  <p>Best regards,<br>{{school.name}}</p>
</div>`,
        smsContent: 'Attendance Alert: {{student.firstName}} {{student.lastName}} was {{status}} on {{formatDate date}}. Contact school for details.',
        inAppContent: 'Attendance alert for {{student.firstName}} {{student.lastName}} - {{capitalize status}} on {{formatDate date}}',
        variables: ['user', 'student', 'date', 'status', 'reason', 'school']
      },

      {
        name: 'Grade Published',
        description: 'Notification when grades are published',
        type: 'GRADE_UPDATE',
        category: 'ACADEMIC',
        emailSubject: 'Grade Published - {{assessment.title}}',
        emailContent: `Dear {{userDisplayName user}},

A new grade has been published for {{student.firstName}} {{student.lastName}}.

Assessment: {{assessment.title}}
Subject: {{subject.name}}
Score: {{grade.marksObtained}}/{{grade.totalMarks}} ({{formatPercentage grade.marksObtained grade.totalMarks}})
Grade: {{grade.letterGrade}}

{{#if grade.feedback}}
Teacher Feedback: {{grade.feedback}}
{{/if}}

You can view the detailed results in your parent portal.

Best regards,
{{school.name}}`,
        emailHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #059669;">Grade Published</h2>
  
  <p>Dear {{userDisplayName user}},</p>
  
  <p>A new grade has been published for <strong>{{student.firstName}} {{student.lastName}}</strong>.</p>
  
  <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Assessment:</strong> {{assessment.title}}</p>
    <p style="margin: 5px 0;"><strong>Subject:</strong> {{subject.name}}</p>
    <p style="margin: 5px 0;"><strong>Score:</strong> {{grade.marksObtained}}/{{grade.totalMarks}} ({{formatPercentage grade.marksObtained grade.totalMarks}})</p>
    <p style="margin: 5px 0;"><strong>Grade:</strong> {{grade.letterGrade}}</p>
  </div>
  
  {{#if grade.feedback}}
  <div style="background-color: #fffbeb; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 0;"><strong>Teacher Feedback:</strong></p>
    <p style="margin: 10px 0 0 0;">{{grade.feedback}}</p>
  </div>
  {{/if}}
  
  <p>You can view the detailed results in your parent portal.</p>
  
  <p>Best regards,<br>{{school.name}}</p>
</div>`,
        smsContent: 'Grade Published: {{student.firstName}} scored {{grade.marksObtained}}/{{grade.totalMarks}} ({{grade.letterGrade}}) in {{assessment.title}}.',
        inAppContent: 'New grade: {{student.firstName}} - {{assessment.title}} - {{grade.letterGrade}}',
        variables: ['user', 'student', 'assessment', 'subject', 'grade', 'school']
      },

      {
        name: 'Fee Reminder',
        description: 'Fee payment reminder',
        type: 'FEE_REMINDER',
        category: 'FINANCIAL',
        emailSubject: 'Fee Payment Reminder - {{fee.description}}',
        emailContent: `Dear {{userDisplayName user}},

This is a reminder that a fee payment is due for {{student.firstName}} {{student.lastName}}.

Fee Details:
- Description: {{fee.description}}
- Total Amount: {{formatCurrency fee.totalAmount}}
- Amount Paid: {{formatCurrency fee.amountPaid}}
- Balance Due: {{formatCurrency fee.balance}}
- Due Date: {{formatDate fee.dueDate 'long'}}

Please ensure timely payment to avoid any late fees.

You can make payments through the parent portal or visit the school office.

Best regards,
{{school.name}} Finance Department`,
        emailHtml: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #ea580c;">Fee Payment Reminder</h2>
  
  <p>Dear {{userDisplayName user}},</p>
  
  <p>This is a reminder that a fee payment is due for <strong>{{student.firstName}} {{student.lastName}}</strong>.</p>
  
  <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 15px; margin: 20px 0;">
    <h3 style="margin-top: 0; color: #ea580c;">Fee Details:</h3>
    <p style="margin: 5px 0;"><strong>Description:</strong> {{fee.description}}</p>
    <p style="margin: 5px 0;"><strong>Total Amount:</strong> {{formatCurrency fee.totalAmount}}</p>
    <p style="margin: 5px 0;"><strong>Amount Paid:</strong> {{formatCurrency fee.amountPaid}}</p>
    <p style="margin: 5px 0;"><strong>Balance Due:</strong> {{formatCurrency fee.balance}}</p>
    <p style="margin: 5px 0;"><strong>Due Date:</strong> {{formatDate fee.dueDate 'long'}}</p>
  </div>
  
  <p>Please ensure timely payment to avoid any late fees.</p>
  
  <p>You can make payments through the parent portal or visit the school office.</p>
  
  <p>Best regards,<br>{{school.name}} Finance Department</p>
</div>`,
        smsContent: 'Fee Reminder: {{fee.description}} for {{student.firstName}} - Balance: {{formatCurrency fee.balance}}. Due: {{formatDate fee.dueDate}}',
        inAppContent: 'Fee reminder: {{fee.description}} - {{formatCurrency fee.balance}} due {{formatDate fee.dueDate}}',
        variables: ['user', 'student', 'fee', 'school']
      }
    ];

    const createdTemplates = [];

    for (const templateData of defaultTemplates) {
      try {
        const existing = await prisma.notificationTemplate.findFirst({
          where: {
            schoolId,
            name: templateData.name,
            isActive: true
          }
        });

        if (!existing) {
          const template = await this.createTemplate({
            ...templateData,
            schoolId,
            createdById,
            isSystem: true
          });
          createdTemplates.push(template);
        }
      } catch (error) {
        logger.error(`Error creating default template ${templateData.name}:`, error);
      }
    }

    return createdTemplates;
  }

  /**
   * Get template variables for a specific template type
   */
  getAvailableVariables(templateType, category) {
    const baseVariables = ['school', 'user', 'notification'];
    
    const typeVariables = {
      WELCOME: ['user', 'school'],
      ATTENDANCE: ['user', 'student', 'date', 'status', 'reason', 'school'],
      GRADE_UPDATE: ['user', 'student', 'assessment', 'subject', 'grade', 'school'],
      FEE_REMINDER: ['user', 'student', 'fee', 'school'],
      EXAM_RESULT: ['user', 'student', 'exam', 'results', 'school'],
      ANNOUNCEMENT: ['user', 'announcement', 'school'],
      EVENT: ['user', 'event', 'school'],
      EMERGENCY: ['user', 'emergency', 'school'],
      ASSIGNMENT: ['user', 'student', 'assignment', 'teacher', 'subject', 'school'],
      TIMETABLE_CHANGE: ['user', 'student', 'oldTimetable', 'newTimetable', 'school']
    };

    return [...baseVariables, ...(typeVariables[templateType] || [])];
  }

  /**
   * Simple string hash function
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString();
  }

  /**
   * Preview template with sample data
   */
  async previewTemplate(templateId, schoolId = null) {
    const template = await this.getTemplate(templateId, schoolId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Generate sample data based on template type
    const sampleData = this.generateSampleData(template.type, template.schoolId);
    
    return await this.renderTemplate(template, sampleData);
  }

  /**
   * Generate sample data for template preview
   */
  generateSampleData(templateType, schoolId) {
    const baseSampleData = {
      school: {
        name: 'Sample High School',
        email: 'info@sampleschool.edu',
        phone: '+1 (555) 123-4567'
      },
      user: {
        name: 'John Parent',
        email: 'john.parent@email.com',
        role: 'PARENT'
      },
      student: {
        firstName: 'Alice',
        lastName: 'Johnson',
        admissionNumber: 'SH2024001'
      }
    };

    const typeSampleData = {
      ATTENDANCE: {
        date: new Date(),
        status: 'absent',
        reason: 'Illness'
      },
      GRADE_UPDATE: {
        assessment: { title: 'Mid-term Math Exam' },
        subject: { name: 'Mathematics' },
        grade: {
          marksObtained: 85,
          totalMarks: 100,
          letterGrade: 'B+',
          feedback: 'Good work! Focus on algebra problems for improvement.'
        }
      },
      FEE_REMINDER: {
        fee: {
          description: 'Tuition Fee - Term 1',
          totalAmount: 1500,
          amountPaid: 500,
          balance: 1000,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    };

    return {
      ...baseSampleData,
      ...(typeSampleData[templateType] || {})
    };
  }
}

module.exports = new TemplateService();