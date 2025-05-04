// This service would typically integrate with an SMS provider like Twilio, Nexmo, etc.
// For this example, we'll create a mock implementation

// Configuration for SMS service
const SMS_CONFIG = {
  apiKey: process.env.SMS_API_KEY || 'mock-api-key',
  apiSecret: process.env.SMS_API_SECRET || 'mock-api-secret',
  from: process.env.SMS_FROM || 'School',
  provider: process.env.SMS_PROVIDER || 'twilio'
};

// Send SMS
exports.sendSMS = async (options) => {
  try {
    const { to, message } = options;
    
    // Validate required fields
    if (!to) {
      throw new Error('Recipient phone number is required');
    }
    
    if (!message) {
      throw new Error('SMS message is required');
    }
    
    // In a real implementation, this would call the SMS provider's API
    // For now, we'll simulate a response
    
    if (process.env.NODE_ENV === 'production') {
      // In production, make actual API call to SMS provider
      // This is a placeholder for the actual implementation
      
      // Example for Twilio
      if (SMS_CONFIG.provider === 'twilio') {
        const accountSid = SMS_CONFIG.apiKey;
        const authToken = SMS_CONFIG.apiSecret;
        const client = require('twilio')(accountSid, authToken);
        
        const result = await client.messages.create({
          body: message,
          from: SMS_CONFIG.from,
          to: to
        });
        
        console.log(`SMS sent: ${result.sid}`);
        return result;
      }
      
      // Example for Nexmo/Vonage
      else if (SMS_CONFIG.provider === 'nexmo') {
        const Nexmo = require('nexmo');
        const nexmo = new Nexmo({
          apiKey: SMS_CONFIG.apiKey,
          apiSecret: SMS_CONFIG.apiSecret
        });
        
        const result = await new Promise((resolve, reject) => {
          nexmo.message.sendSms(
            SMS_CONFIG.from,
            to,
            message,
            (err, responseData) => {
              if (err) {
                reject(err);
              } else {
                resolve(responseData);
              }
            }
          );
        });
        
        console.log(`SMS sent: ${result.messages[0]['message-id']}`);
        return result;
      }
      
      // Add more providers as needed
      
      throw new Error(`Unsupported SMS provider: ${SMS_CONFIG.provider}`);
    } else {
      // In development/testing, return mock response
      console.log(`[MOCK SMS] To: ${to}, Message: ${message}`);
      
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
        to,
        provider: SMS_CONFIG.provider
      };
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw new Error(`Failed to send SMS: ${error.message}`);
  }
};

// Send welcome SMS
exports.sendWelcomeSMS = async (user) => {
  try {
    const { phone, name, role } = user;
    
    if (!phone) {
      throw new Error('Phone number is required');
    }
    
    const message = `Welcome to School Management System, ${name}! Your account has been created successfully as a ${role}.`;
    
    return await this.sendSMS({
      to: phone,
      message
    });
  } catch (error) {
    console.error('Error sending welcome SMS:', error);
    throw new Error(`Failed to send welcome SMS: ${error.message}`);
  }
};

// Send password reset SMS
exports.sendPasswordResetSMS = async (user, resetToken) => {
  try {
    const { phone, name } = user;
    
    if (!phone) {
      throw new Error('Phone number is required');
    }
    
    const message = `Hello ${name}, your password reset code is: ${resetToken}. This code will expire in 10 minutes.`;
    
    return await this.sendSMS({
      to: phone,
      message
    });
  } catch (error) {
    console.error('Error sending password reset SMS:', error);
    throw new Error(`Failed to send password reset SMS: ${error.message}`);
  }
};

// Send notification SMS
exports.sendNotificationSMS = async (user, notification) => {
  try {
    const { phone, name } = user;
    const { title, message } = notification;
    
    if (!phone) {
      throw new Error('Phone number is required');
    }
    
    const smsMessage = `${title}: ${message}`;
    
    return await this.sendSMS({
      to: phone,
      message: smsMessage
    });
  } catch (error) {
    console.error('Error sending notification SMS:', error);
    throw new Error(`Failed to send notification SMS: ${error.message}`);
  }
};

// Send attendance alert SMS
exports.sendAttendanceAlertSMS = async (parent, student, date, status) => {
  try {
    const { phone } = parent;
    const { name } = student;
    
    if (!phone) {
      throw new Error('Phone number is required');
    }
    
    const formattedDate = new Date(date).toLocaleDateString();
    let message;
    
    switch (status) {
      case 'absent':
        message = `Attendance Alert: ${name} was absent from school on ${formattedDate}. Please contact the school for more information.`;
        break;
      case 'late':
        message = `Attendance Alert: ${name} arrived late to school on ${formattedDate}.`;
        break;
      default:
        message = `Attendance Update: ${name}'s attendance status for ${formattedDate} is ${status}.`;
    }
    
    return await this.sendSMS({
      to: phone,
      message
    });
  } catch (error) {
    console.error('Error sending attendance alert SMS:', error);
    throw new Error(`Failed to send attendance alert SMS: ${error.message}`);
  }
};

// Send exam results SMS
exports.sendExamResultsSMS = async (parent, student, exam, results) => {
  try {
    const { phone } = parent;
    const { name } = student;
    const { title, subject } = exam;
    const { score, grade, totalMarks } = results;
    
    if (!phone) {
      throw new Error('Phone number is required');
    }
    
    const percentage = ((score / totalMarks) * 100).toFixed(2);
    const message = `Exam Results: ${name} scored ${score}/${totalMarks} (${percentage}%, Grade: ${grade}) in the ${title} exam for ${subject}.`;
    
    return await this.sendSMS({
      to: phone,
      message
    });
  } catch (error) {
    console.error('Error sending exam results SMS:', error);
    throw new Error(`Failed to send exam results SMS: ${error.message}`);
  }
};

// Send fee reminder SMS
exports.sendFeeReminderSMS = async (parent, student, feeDetails) => {
  try {
    const { phone } = parent;
    const { name } = student;
    const { description, balance, dueDate } = feeDetails;
    
    if (!phone) {
      throw new Error('Phone number is required');
    }
    
    const formattedDueDate = new Date(dueDate).toLocaleDateString();
    const message = `Fee Reminder: Payment of $${balance} for ${description} for ${name} is due on ${formattedDueDate}. Please ensure timely payment.`;
    
    return await this.sendSMS({
      to: phone,
      message
    });
  } catch (error) {
    console.error('Error sending fee reminder SMS:', error);
    throw new Error(`Failed to send fee reminder SMS: ${error.message}`);
  }
};

// Verify SMS configuration
exports.verifySMSConfig = async () => {
  try {
    // In a real implementation, this would verify the SMS provider's credentials
    // For now, we'll just return true in development and check in production
    
    if (process.env.NODE_ENV === 'production') {
      // Example for Twilio
      if (SMS_CONFIG.provider === 'twilio') {
        const accountSid = SMS_CONFIG.apiKey;
        const authToken = SMS_CONFIG.apiSecret;
        const client = require('twilio')(accountSid, authToken);
        
        // Check if credentials are valid by fetching account info
        const account = await client.api.accounts(accountSid).fetch();
        return account.status === 'active';
      }
      
      // Example for Nexmo/Vonage
      else if (SMS_CONFIG.provider === 'nexmo') {
        // Nexmo doesn't have a simple verification method
        // We'll assume it's configured correctly if the credentials are provided
        return !!(SMS_CONFIG.apiKey && SMS_CONFIG.apiSecret);
      }
      
      return false;
    } else {
      console.log('SMS service verification skipped in development mode');
      return true;
    }
  } catch (error) {
    console.error('SMS service verification failed:', error);
    return false;
  }
};

module.exports = exports;
