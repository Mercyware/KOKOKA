const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

/**
 * Generate Invoice PDF
 * @param {Object} invoice - Invoice data
 * @param {Object} school - School information
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateInvoicePDF = async (invoice, school) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margin: 50,
        info: {
          Title: `Invoice ${invoice.invoiceNumber}`,
          Author: school.name,
          Subject: 'Invoice',
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
      // Build full address from separate fields
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

      // Invoice Title
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('INVOICE', 50, yPosition, { align: 'center' });
      
      yPosition += 30;

      // Invoice Details (Two columns)
      const leftColumn = 50;
      const rightColumn = 320;

      // Left: Student Information
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .text('Bill To:', leftColumn, yPosition);
      
      yPosition += 15;
      
      doc.fontSize(10)
         .font('Helvetica')
         .text(`${invoice.student.firstName} ${invoice.student.lastName}`, leftColumn, yPosition);
      
      yPosition += 15;
      doc.text(`Admission No: ${invoice.student.admissionNumber}`, leftColumn, yPosition);
      
      if (invoice.student.email) {
        yPosition += 15;
        doc.text(`Email: ${invoice.student.email}`, leftColumn, yPosition);
      }

      if (invoice.student.phone) {
        yPosition += 15;
        doc.text(`Phone: ${invoice.student.phone}`, leftColumn, yPosition);
      }

      // Right: Invoice Details
      const rightYStart = yPosition - (invoice.student.email && invoice.student.phone ? 60 : 45);
      let rightY = rightYStart;

      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Invoice Number:', rightColumn, rightY)
         .font('Helvetica')
         .text(invoice.invoiceNumber, rightColumn + 110, rightY);
      
      rightY += 15;
      doc.font('Helvetica-Bold')
         .text('Invoice Date:', rightColumn, rightY)
         .font('Helvetica')
         .text(new Date(invoice.issueDate).toLocaleDateString(), rightColumn + 110, rightY);
      
      rightY += 15;
      doc.font('Helvetica-Bold')
         .text('Due Date:', rightColumn, rightY)
         .font('Helvetica')
         .text(new Date(invoice.dueDate).toLocaleDateString(), rightColumn + 110, rightY);
      
      rightY += 15;
      doc.font('Helvetica-Bold')
         .text('Academic Year:', rightColumn, rightY)
         .font('Helvetica')
         .text(invoice.academicYear, rightColumn + 110, rightY);
      
      rightY += 15;
      doc.font('Helvetica-Bold')
         .text('Term:', rightColumn, rightY)
         .font('Helvetica')
         .text(invoice.term.replace('TERM_', 'Term '), rightColumn + 110, rightY);

      yPosition = Math.max(yPosition, rightY) + 30;
      drawLine(yPosition);
      yPosition += 20;

      // Invoice Items Table
      const tableTop = yPosition;
      const descCol = 50;
      const qtyCol = 320;
      const priceCol = 390;
      const amountCol = 480;

      // Table Header
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text('Description', descCol, tableTop)
         .text('Qty', qtyCol, tableTop, { width: 50, align: 'center' })
         .text('Unit Price', priceCol, tableTop, { width: 70, align: 'right' })
         .text('Amount', amountCol, tableTop, { width: 65, align: 'right' });

      yPosition = tableTop + 20;
      drawLine(yPosition);
      yPosition += 10;

      // Table Items
      doc.font('Helvetica');
      invoice.items.forEach((item, index) => {
        const itemY = yPosition + (index * 25);
        
        doc.fontSize(9)
           .text(item.description, descCol, itemY, { width: 260 })
           .text(item.quantity.toString(), qtyCol, itemY, { width: 50, align: 'center' })
           .text(`${school.currency || '₦'}${parseFloat(item.unitPrice).toFixed(2)}`, priceCol, itemY, { width: 70, align: 'right' })
           .text(`${school.currency || '₦'}${parseFloat(item.amount).toFixed(2)}`, amountCol, itemY, { width: 65, align: 'right' });
      });

      yPosition += (invoice.items.length * 25) + 10;
      drawLine(yPosition);
      yPosition += 15;

      // Totals
      const totalsX = 400;
      
      doc.fontSize(10)
         .font('Helvetica')
         .text('Subtotal:', totalsX, yPosition)
         .text(`${school.currency || '₦'}${parseFloat(invoice.subtotal).toFixed(2)}`, amountCol, yPosition, { width: 65, align: 'right' });
      
      if (parseFloat(invoice.discount) > 0) {
        yPosition += 15;
        doc.text('Discount:', totalsX, yPosition)
           .text(`-${school.currency || '₦'}${parseFloat(invoice.discount).toFixed(2)}`, amountCol, yPosition, { width: 65, align: 'right' });
      }
      
      if (parseFloat(invoice.tax) > 0) {
        yPosition += 15;
        doc.text('Tax:', totalsX, yPosition)
           .text(`${school.currency || '₦'}${parseFloat(invoice.tax).toFixed(2)}`, amountCol, yPosition, { width: 65, align: 'right' });
      }

      yPosition += 15;
      drawLine(yPosition);
      yPosition += 15;

      // Total
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Total:', totalsX, yPosition)
         .text(`${school.currency || '₦'}${parseFloat(invoice.total).toFixed(2)}`, amountCol, yPosition, { width: 65, align: 'right' });

      // Amount Paid and Balance
      if (parseFloat(invoice.amountPaid) > 0) {
        yPosition += 20;
        doc.fontSize(10)
           .font('Helvetica')
           .text('Amount Paid:', totalsX, yPosition)
           .text(`${school.currency || '₦'}${parseFloat(invoice.amountPaid).toFixed(2)}`, amountCol, yPosition, { width: 65, align: 'right' });
      }

      yPosition += 15;
      doc.fontSize(11)
         .font('Helvetica-Bold')
         .fillColor('#d32f2f')
         .text('Balance Due:', totalsX, yPosition)
         .text(`${school.currency || '₦'}${parseFloat(invoice.balance).toFixed(2)}`, amountCol, yPosition, { width: 65, align: 'right' });
      
      doc.fillColor('#000000');

      yPosition += 40;

      // Payment Information Section
      drawLine(yPosition);
      yPosition += 20;

      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Payment Information', 50, yPosition);
      
      yPosition += 20;

      // Online Payment
      if (school.enableOnlinePayment && process.env.FRONTEND_URL) {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Pay Online:', 50, yPosition);
        
        yPosition += 15;
        
        const paymentUrl = `${process.env.FRONTEND_URL}/finance/invoices/${invoice.id}/pay`;
        doc.fontSize(9)
           .font('Helvetica')
           .fillColor('#1976d2')
           .text(paymentUrl, 50, yPosition, { 
             link: paymentUrl,
             underline: true 
           });
        
        doc.fillColor('#000000');
        yPosition += 25;
      }

      // Bank Details
      if (school.bankName || school.accountNumber) {
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Bank Transfer Details:', 50, yPosition);
        
        yPosition += 15;

        if (school.bankName) {
          doc.fontSize(9)
             .font('Helvetica')
             .text(`Bank Name: ${school.bankName}`, 50, yPosition);
          yPosition += 15;
        }

        if (school.accountNumber) {
          doc.text(`Account Number: ${school.accountNumber}`, 50, yPosition);
          yPosition += 15;
        }

        if (school.accountName) {
          doc.text(`Account Name: ${school.accountName}`, 50, yPosition);
          yPosition += 15;
        }

        if (school.bankBranch) {
          doc.text(`Branch: ${school.bankBranch}`, 50, yPosition);
          yPosition += 15;
        }
      }

      // Notes
      if (invoice.notes) {
        yPosition += 20;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Notes:', 50, yPosition);
        
        yPosition += 15;
        doc.fontSize(9)
           .font('Helvetica')
           .text(invoice.notes, 50, yPosition, { width: 495 });
      }

      // Footer
      yPosition = 750;
      drawLine(yPosition);
      yPosition += 10;

      doc.fontSize(8)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Thank you for your payment!', 50, yPosition, { align: 'center' });
      
      yPosition += 12;
      doc.text(`This is a computer-generated invoice and does not require a signature.`, 50, yPosition, { align: 'center' });

      // Finalize PDF
      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Save PDF to file system
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} filename - File name
 * @returns {Promise<string>} File path
 */
const savePDF = async (pdfBuffer, filename) => {
  const uploadDir = path.join(__dirname, '../uploads/invoices');
  
  // Ensure directory exists
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }

  const filePath = path.join(uploadDir, filename);
  await writeFile(filePath, pdfBuffer);
  
  return filePath;
};

module.exports = {
  generateInvoicePDF,
  savePDF
};
