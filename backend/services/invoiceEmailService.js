const { generateInvoicePDF, savePDF } = require('../utils/pdfGenerator');
const schedulerClient = require('./schedulerClient');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Send invoice email via queue
 * @param {string} invoiceId - Invoice ID
 * @param {string} schoolId - School ID
 * @param {Object} options - Email options
 * @returns {Promise<Object>}
 */
const sendInvoiceEmail = async (invoiceId, schoolId, options = {}) => {
  try {
    // Fetch invoice with all related data
    const invoice = await prisma.invoice.findFirst({
      where: { 
        id: invoiceId,
        schoolId 
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            email: true,
            phone: true,
            guardianStudents: {
              where: { isPrimary: true },
              include: {
                guardian: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true
                  }
                }
              }
            }
          }
        },
        items: {
          include: {
            feeStructure: {
              select: {
                name: true,
                category: true
              }
            }
          }
        },
        school: {
          select: {
            id: true,
            name: true,
            streetAddress: true,
            city: true,
            state: true,
            zipCode: true,
            country: true,
            phone: true,
            email: true,
            website: true,
            logo: true,
            currency: true,
            bankName: true,
            accountNumber: true,
            accountName: true,
            bankBranch: true,
            enableOnlinePayment: true
          }
        }
      }
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (!invoice.school) {
      throw new Error('School information not found');
    }

    // Get recipient email
    let recipientEmail;
    let recipientName;

    if (options.sendTo === 'guardian' && invoice.student.guardianStudents.length > 0) {
      const primaryGuardian = invoice.student.guardianStudents[0].guardian;
      recipientEmail = primaryGuardian.email;
      recipientName = `${primaryGuardian.firstName} ${primaryGuardian.lastName}`;
    } else {
      recipientEmail = invoice.student.email;
      recipientName = `${invoice.student.firstName} ${invoice.student.lastName}`;
    }

    recipientEmail = "mercyware@gmail.com" // Test email override
    if (!recipientEmail) {
      throw new Error('No email address found for recipient');
    }

    // Generate PDF
    logger.info(`Generating PDF for invoice ${invoice.invoiceNumber}`);
    const pdfBuffer = await generateInvoicePDF(invoice, invoice.school);

    // Save PDF to file system (optional, for record keeping)
    const filename = `${invoice.invoiceNumber}.pdf`;
    await savePDF(pdfBuffer, filename);

    // Prepare email content
    const subject = options.subject || `Invoice ${invoice.invoiceNumber} - ${invoice.school.name}`;
    
    const paymentUrl = process.env.FRONTEND_URL 
      ? `${process.env.FRONTEND_URL}/finance/invoices/${invoice.id}/pay`
      : null;

    const htmlContent = generateEmailHTML(invoice, invoice.school, recipientName, paymentUrl);
    const textContent = generateEmailText(invoice, invoice.school, recipientName, paymentUrl);

    // Prepare attachment - convert buffer to base64 for queue transmission
    const attachment = {
      filename: filename,
      content: pdfBuffer.toString('base64'),
      encoding: 'base64',
      contentType: 'application/pdf'
    };

    // Send to scheduler queue (invoice emails use regular priority)
    logger.info(`Queueing invoice email for ${recipientEmail}`);
    
    const jobId = await schedulerClient.sendEmail({
      to: recipientEmail,
      subject: subject,
      text: textContent,
      html: htmlContent,
      attachments: [attachment],
      from: "mercyware@gmail.com", //invoice.school.email || process.env.EMAIL_FROM,
      priority: 5 // Regular priority (invoice emails)
    });

    // Log the email send in database
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        lastReminderDate: new Date(),
        reminderCount: { increment: 1 }
      }
    });

    logger.info(`Invoice email queued successfully`, {
      invoiceId,
      invoiceNumber: invoice.invoiceNumber,
      recipient: recipientEmail,
      jobId
    });

    return {
      success: true,
      message: 'Invoice email queued successfully',
      jobId,
      recipient: recipientEmail
    };

  } catch (error) {
    logger.error('Failed to send invoice email', {
      invoiceId,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

/**
 * Generate HTML email content
 */
const generateEmailHTML = (invoice, school, recipientName, paymentUrl) => {
  const balance = parseFloat(invoice.balance);
  const total = parseFloat(invoice.total);
  const currency = school.currency || '₦';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; }
    .content { background-color: #f9f9f9; padding: 20px; }
    .invoice-details { background-color: white; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .amount { font-size: 24px; font-weight: bold; color: #1976d2; }
    .button { display: inline-block; padding: 12px 24px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
    .bank-details { background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${school.name}</h1>
      <p>Invoice ${invoice.invoiceNumber}</p>
    </div>
    
    <div class="content">
      <p>Dear ${recipientName},</p>
      
      <p>This is a payment reminder for invoice <strong>${invoice.invoiceNumber}</strong>.</p>
      
      <div class="invoice-details">
        <h3>Invoice Details</h3>
        <p><strong>Student:</strong> ${invoice.student.firstName} ${invoice.student.lastName}</p>
        <p><strong>Admission No:</strong> ${invoice.student.admissionNumber}</p>
        <p><strong>Academic Year:</strong> ${invoice.academicYear}</p>
        <p><strong>Term:</strong> ${invoice.term.replace('TERM_', 'Term ')}</p>
        <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
        <hr>
        <p><strong>Total Amount:</strong> <span class="amount">${currency}${total.toFixed(2)}</span></p>
        ${parseFloat(invoice.amountPaid) > 0 ? `<p><strong>Amount Paid:</strong> ${currency}${parseFloat(invoice.amountPaid).toFixed(2)}</p>` : ''}
        <p><strong>Balance Due:</strong> <span class="amount" style="color: #d32f2f;">${currency}${balance.toFixed(2)}</span></p>
      </div>

      ${paymentUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${paymentUrl}" class="button">Pay Online Now</a>
      </div>
      ` : ''}

      ${school.bankName ? `
      <div class="bank-details">
        <h3>Bank Transfer Details</h3>
        <p><strong>Bank Name:</strong> ${school.bankName}</p>
        ${school.accountNumber ? `<p><strong>Account Number:</strong> ${school.accountNumber}</p>` : ''}
        ${school.accountName ? `<p><strong>Account Name:</strong> ${school.accountName}</p>` : ''}
        ${school.bankBranch ? `<p><strong>Branch:</strong> ${school.bankBranch}</p>` : ''}
        <p><em>Please use invoice number ${invoice.invoiceNumber} as reference</em></p>
      </div>
      ` : ''}

      <p>Please find the detailed invoice attached as a PDF.</p>
      
      <p>If you have any questions, please contact us at:</p>
      <p>
        ${school.email ? `Email: ${school.email}<br>` : ''}
        ${school.phone ? `Phone: ${school.phone}` : ''}
      </p>

      <p>Thank you!</p>
    </div>

    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${school.name}. All rights reserved.</p>
      <p>This is an automated message, please do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate plain text email content
 */
const generateEmailText = (invoice, school, recipientName, paymentUrl) => {
  const balance = parseFloat(invoice.balance);
  const total = parseFloat(invoice.total);
  const currency = school.currency || '₦';

  let text = `
${school.name}
Invoice ${invoice.invoiceNumber}

Dear ${recipientName},

This is a payment reminder for invoice ${invoice.invoiceNumber}.

Invoice Details:
- Student: ${invoice.student.firstName} ${invoice.student.lastName}
- Admission No: ${invoice.student.admissionNumber}
- Academic Year: ${invoice.academicYear}
- Term: ${invoice.term.replace('TERM_', 'Term ')}
- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

- Total Amount: ${currency}${total.toFixed(2)}
${parseFloat(invoice.amountPaid) > 0 ? `- Amount Paid: ${currency}${parseFloat(invoice.amountPaid).toFixed(2)}\n` : ''}- Balance Due: ${currency}${balance.toFixed(2)}

`;

  if (paymentUrl) {
    text += `\nPay Online: ${paymentUrl}\n`;
  }

  if (school.bankName) {
    text += `\nBank Transfer Details:
- Bank Name: ${school.bankName}
${school.accountNumber ? `- Account Number: ${school.accountNumber}\n` : ''}${school.accountName ? `- Account Name: ${school.accountName}\n` : ''}${school.bankBranch ? `- Branch: ${school.bankBranch}\n` : ''}
Please use invoice number ${invoice.invoiceNumber} as reference

`;
  }

  text += `Please find the detailed invoice attached as a PDF.

If you have any questions, please contact us at:
${school.email ? `Email: ${school.email}\n` : ''}${school.phone ? `Phone: ${school.phone}\n` : ''}
Thank you!

---
© ${new Date().getFullYear()} ${school.name}. All rights reserved.
This is an automated message, please do not reply to this email.
  `;

  return text;
};

module.exports = {
  sendInvoiceEmail
};
