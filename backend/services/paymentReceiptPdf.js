const PDFDocument = require('pdfkit');

/**
 * Generate Payment Receipt PDF
 * @param {Object} payment - Payment data with related invoice and student
 * @param {Object} school - School information
 * @returns {Promise<Buffer>} PDF buffer
 */
const generatePaymentReceiptPDF = async (payment, school) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: {
          Title: `Payment Receipt ${payment.paymentNumber}`,
          Author: school.name,
          Subject: 'Payment Receipt',
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Helper function for drawing lines
      const drawLine = (y) => {
        doc.moveTo(50, y).lineTo(545, y).stroke();
      };

      // Header - School Logo and Info
      let yPosition = 50;

      // School Name (Large)
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(school.name, 50, yPosition, { align: 'center' });
      
      yPosition += 35;

      // School Details
      const addressParts = [
        school.streetAddress,
        school.city,
        school.state,
        school.zipCode,
        school.country
      ].filter(Boolean);
      const fullAddress = addressParts.join(', ');
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(fullAddress, 50, yPosition, { align: 'center' });
      
      if (school.phone || school.email) {
        yPosition += 15;
        const contactInfo = [school.phone, school.email].filter(Boolean).join(' | ');
        doc.text(contactInfo, 50, yPosition, { align: 'center' });
      }

      if (school.website) {
        yPosition += 15;
        doc.text(school.website, 50, yPosition, { align: 'center' });
      }

      yPosition += 30;
      drawLine(yPosition);
      yPosition += 20;

      // Receipt Title with Success Badge
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#22c55e')
         .text('✓ PAYMENT RECEIPT', 50, yPosition, { align: 'center' });
      
      doc.fillColor('#000000');
      yPosition += 35;

      // Payment Status Badge
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#ffffff')
         .rect(220, yPosition - 5, 155, 22)
         .fill('#22c55e')
         .fillColor('#ffffff')
         .text('PAYMENT SUCCESSFUL', 220, yPosition, { width: 155, align: 'center' });
      
      doc.fillColor('#000000');
      yPosition += 30;

      // Payment Details (Two columns)
      const leftColumn = 50;
      const rightColumn = 320;

      // Left: Student Information
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('Received From:', leftColumn, yPosition);
      
      yPosition += 15;
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`${payment.student.firstName} ${payment.student.lastName}`, leftColumn, yPosition);
      
      yPosition += 15;
      doc.text(`Admission No: ${payment.student.admissionNumber}`, leftColumn, yPosition);

      // Right: Payment Details
      const rightYStart = yPosition - 30;
      let rightY = rightYStart;

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Receipt Number:', rightColumn, rightY)
         .font('Helvetica')
         .text(payment.paymentNumber, rightColumn + 110, rightY);
      
      rightY += 15;
      doc.font('Helvetica-Bold')
         .text('Payment Date:', rightColumn, rightY)
         .font('Helvetica')
         .text(new Date(payment.paymentDate).toLocaleDateString(), rightColumn + 110, rightY);
      
      rightY += 15;
      doc.font('Helvetica-Bold')
         .text('Payment Method:', rightColumn, rightY)
         .font('Helvetica')
         .text(payment.paymentMethod.replace('_', ' '), rightColumn + 110, rightY);
      
      if (payment.referenceNumber) {
        rightY += 15;
        doc.font('Helvetica-Bold')
           .text('Reference:', rightColumn, rightY)
           .font('Helvetica')
           .text(payment.referenceNumber, rightColumn + 110, rightY);
      }

      yPosition = Math.max(yPosition, rightY) + 30;
      drawLine(yPosition);
      yPosition += 20;

      // Payment Amount Section
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Payment Details', 50, yPosition);
      
      yPosition += 25;

      // Amount box
      doc.roundedRect(50, yPosition, 495, 80, 5)
         .lineWidth(2)
         .strokeColor('#22c55e')
         .stroke();

      yPosition += 20;

      doc.fontSize(11)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Amount Paid:', 70, yPosition);
      
      yPosition += 25;

      const currency = school.currency?.symbol || school.currency || '₦';
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#22c55e')
         .text(`${currency}${parseFloat(payment.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 70, yPosition);
      
      doc.fillColor('#000000');
      yPosition += 60;

      // Invoice Information
      if (payment.invoice) {
        drawLine(yPosition);
        yPosition += 20;

        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Invoice Information', 50, yPosition);
        
        yPosition += 20;

        const infoLeft = 50;
        const infoRight = 320;

        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Invoice Number:', infoLeft, yPosition)
           .font('Helvetica')
           .text(payment.invoice.invoiceNumber, infoLeft + 120, yPosition);
        
        doc.font('Helvetica-Bold')
           .text('Invoice Date:', infoRight, yPosition)
           .font('Helvetica')
           .text(new Date(payment.invoice.issueDate).toLocaleDateString(), infoRight + 90, yPosition);

        yPosition += 20;

        doc.font('Helvetica-Bold')
           .text('Invoice Total:', infoLeft, yPosition)
           .font('Helvetica')
           .text(`${currency}${parseFloat(payment.invoice.total).toFixed(2)}`, infoLeft + 120, yPosition);
        
        doc.font('Helvetica-Bold')
           .text('Total Paid:', infoRight, yPosition)
           .font('Helvetica')
           .text(`${currency}${parseFloat(payment.invoice.amountPaid).toFixed(2)}`, infoRight + 90, yPosition);

        yPosition += 20;

        const balance = parseFloat(payment.invoice.balance);
        doc.font('Helvetica-Bold')
           .text('Remaining Balance:', infoLeft, yPosition)
           .font('Helvetica')
           .fillColor(balance > 0 ? '#d32f2f' : '#22c55e')
           .text(`${currency}${balance.toFixed(2)}`, infoLeft + 120, yPosition);
        
        doc.fillColor('#000000');

        yPosition += 20;

        doc.font('Helvetica-Bold')
           .text('Status:', infoRight, yPosition)
           .font('Helvetica')
           .fillColor(balance === 0 ? '#22c55e' : '#f59e0b')
           .text(balance === 0 ? 'PAID IN FULL' : 'PARTIALLY PAID', infoRight + 90, yPosition);
        
        doc.fillColor('#000000');
        yPosition += 30;
      }

      // Notes Section
      if (payment.notes) {
        drawLine(yPosition);
        yPosition += 20;

        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('Notes:', 50, yPosition);
        
        yPosition += 15;
        doc.fontSize(9)
           .font('Helvetica')
           .text(payment.notes, 50, yPosition, { width: 495 });
        
        yPosition += 30;
      }

      // Thank You Message
      yPosition = Math.max(yPosition, 650);
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#22c55e')
         .text('Thank you for your payment!', 50, yPosition, { align: 'center' });
      
      doc.fillColor('#000000');
      yPosition += 30;

      // Footer
      drawLine(yPosition);
      yPosition += 10;

      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`This is an official payment receipt issued by ${school.name}`, 50, yPosition, { align: 'center' });
      
      yPosition += 12;
      doc.text(`Generated on ${new Date().toLocaleString()}`, 50, yPosition, { align: 'center' });
      
      yPosition += 12;
      doc.text('This is a computer-generated document and does not require a signature.', 50, yPosition, { align: 'center' });

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generatePaymentReceiptPDF
};
