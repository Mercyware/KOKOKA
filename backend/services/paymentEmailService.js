const schedulerClient = require('./schedulerClient');
const { prisma } = require('../config/database');
const { generatePaymentReceiptPDF } = require('./paymentReceiptPdf');

/**
 * Send payment confirmation email to parent/student
 * @param {Object} payment - Payment object with all details
 * @param {Object} invoice - Invoice object
 * @param {Object} student - Student object with email
 * @param {Object} school - School object
 */
async function sendPaymentConfirmation(payment, invoice, student, school) {
  try {
    console.log('📧 sendPaymentConfirmation called with:', {
      paymentId: payment?.id,
      invoiceId: invoice?.id,
      studentId: student?.id,
      schoolId: school?.id
    });

    // Build recipient email - prefer primary guardian email if available, fallback to student
    const guardianEmail = student.guardianStudents?.[0]?.guardian?.email;
    const recipientEmail = guardianEmail || student.email;
    
    console.log('📧 Guardian email:', guardianEmail);
    console.log('📧 Recipient email:', recipientEmail);
    
    if (!recipientEmail) {
      console.warn(`⚠️ No email found for student ${student.id} to send payment confirmation`);
      return null;
    }

    // Format currency - use 'NGN ' prefix for Nigerian Naira to avoid encoding issues
    let currencySymbol = 'NGN ';
    if (school.currency) {
      if (typeof school.currency === 'object' && school.currency.symbol) {
        // If it's the Naira symbol or NGN, use 'NGN ' prefix
        if (school.currency.symbol === '₦' || school.currency.symbol === 'NGN') {
          currencySymbol = 'NGN ';
        } else {
          currencySymbol = school.currency.symbol;
        }
      } else if (typeof school.currency === 'string') {
        // If it's a string like '₦' or 'NGN', use 'NGN ' prefix
        if (school.currency === '₦' || school.currency === 'NGN') {
          currencySymbol = 'NGN ';
        } else {
          currencySymbol = school.currency;
        }
      }
    }
    console.log('📧 Currency symbol:', currencySymbol);
    
    // Calculate status based on balance
    const invoiceStatus = parseFloat(invoice.balance) === 0 ? 'PAID IN FULL' : 'PARTIALLY PAID';
    console.log('📧 Invoice status:', invoiceStatus, 'Balance:', invoice.balance);
    
    // Build email content
    const emailSubject = `Payment Confirmation - ${invoice.invoiceNumber}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          .details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #4CAF50; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #666; }
          .detail-value { color: #333; }
          .amount { font-size: 24px; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Payment Successful</h1>
          </div>
          
          <div class="content">
            <div class="success-icon">✅</div>
            
            <p>Dear Parent/Guardian,</p>
            
            <p>We are pleased to confirm that we have received your payment for <strong>${student.firstName} ${student.lastName}</strong>.</p>
            
            <div class="amount">${currencySymbol}${parseFloat(payment.amount).toFixed(2)}</div>
            
            <div class="details">
              <h3 style="margin-top: 0; color: #4CAF50;">Payment Details</h3>
              
              <div class="detail-row">
                <span class="detail-label">Payment Number:</span>
                <span class="detail-value">${payment.paymentNumber}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Invoice Number:</span>
                <span class="detail-value">${invoice.invoiceNumber}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Student:</span>
                <span class="detail-value">${student.firstName} ${student.lastName} (${student.admissionNumber})</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">${currencySymbol}${parseFloat(payment.amount).toFixed(2)}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${new Date(payment.paymentDate).toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${payment.paymentMethod === 'CARD' ? 'Online Payment' : payment.paymentMethod}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Transaction Reference:</span>
                <span class="detail-value">${payment.referenceNumber}</span>
              </div>
              
              ${invoice.balance > 0 ? `
              <div class="detail-row">
                <span class="detail-label">Remaining Balance:</span>
                <span class="detail-value" style="color: #ff9800; font-weight: bold;">${currencySymbol}${parseFloat(invoice.balance).toFixed(2)}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Invoice Status:</span>
                <span class="detail-value" style="color: #ff9800; font-weight: bold;">PARTIALLY PAID</span>
              </div>
              ` : `
              <div class="detail-row">
                <span class="detail-label">Invoice Status:</span>
                <span class="detail-value" style="color: #4CAF50; font-weight: bold;">PAID IN FULL ✓</span>
              </div>
              `}
            </div>
            
            <p style="margin-top: 30px;">This payment receipt serves as confirmation of your transaction. Please keep this email for your records.</p>
            
            ${invoice.balance > 0 ? `
            <p style="color: #ff9800;">
              <strong>Note:</strong> There is a remaining balance of ${currencySymbol}${parseFloat(invoice.balance).toFixed(2)} on this invoice. 
              You can make another payment anytime using your payment link.
            </p>
            ` : ''}
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/finance/invoices/${invoice.id}/pay" class="button">View Invoice</a>
            </div>
            
            <p>If you have any questions or concerns about this payment, please contact the school office.</p>
            
            <p>Thank you for your prompt payment.</p>
            
            <p>Best regards,<br>
            <strong>${school.name}</strong></p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; ${new Date().getFullYear()} ${school.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log('📧 Email HTML generated, length:', emailHtml.length);
    console.log('📧 Generating PDF receipt...');

    // Generate PDF receipt
    let pdfAttachment = null;
    try {
      // Enrich payment object with invoice data for PDF
      const enrichedPayment = {
        ...payment,
        invoice: invoice,
        student: student
      };
      console.log('📧 Enriched payment data for PDF:', {
        invoiceTotal: invoice.total,
        invoiceBalance: invoice.balance,
        invoiceAmountPaid: invoice.amountPaid
      });
      const pdfBuffer = await generatePaymentReceiptPDF(enrichedPayment, school);
      pdfAttachment = {
        filename: `Payment_Receipt_${payment.paymentNumber}.pdf`,
        content: pdfBuffer.toString('base64'),
        encoding: 'base64',
        contentType: 'application/pdf'
      };
      console.log('📧 PDF receipt generated successfully, size:', pdfBuffer.length, 'bytes');
    } catch (pdfError) {
      console.error('❌ Error generating PDF receipt:', pdfError);
      // Continue without PDF attachment
    }

    console.log('📧 Sending to scheduler service...');

    // Send via scheduler service
    const jobId = await schedulerClient.sendEmail({
      to: recipientEmail,
      subject: emailSubject,
      html: emailHtml,
      attachments: pdfAttachment ? [pdfAttachment] : [],
      priority: 5, // Regular priority for confirmations
    });

    console.log(`✅ Payment confirmation email queued for ${recipientEmail}, Job ID: ${jobId}`);
    return jobId;

  } catch (error) {
    console.error('❌ Error sending payment confirmation email:', error);
    console.error('Error stack:', error.stack);
    throw error;
  }
}

module.exports = {
  sendPaymentConfirmation
};
