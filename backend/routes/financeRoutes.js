const express = require('express');
const router = express.Router();
const feeStructureController = require('../controllers/feeStructureController');
const invoiceController = require('../controllers/invoiceController');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// ==================== PUBLIC ROUTES (NO AUTH REQUIRED) ====================

// Public invoice view for payment (parents can view without login)
router.get('/invoices/:id/public', invoiceController.getInvoiceByIdPublic);

// Public Paystack payment initialization (for parents)
router.post('/payments/paystack/initialize-public', paymentController.initializePaystackPaymentPublic);

// Public Paystack payment verification (callback after payment)
router.get('/payments/paystack/verify/:reference', paymentController.verifyPaystackPayment);

// Protect all other routes
router.use(authMiddleware.protect);

// ==================== FEE STRUCTURES ====================

// GET all fee structures
router.get('/fee-structures', feeStructureController.getAllFeeStructures);

// GET single fee structure
router.get('/fee-structures/:id', feeStructureController.getFeeStructureById);

// Admin only routes for fee structures
router.post('/fee-structures', roleMiddleware.restrictTo('admin'), feeStructureController.createFeeStructure);
router.put('/fee-structures/:id', roleMiddleware.restrictTo('admin'), feeStructureController.updateFeeStructure);
router.delete('/fee-structures/:id', roleMiddleware.restrictTo('admin'), feeStructureController.deleteFeeStructure);

// ==================== INVOICES ====================

// GET all invoices
router.get('/invoices', invoiceController.getAllInvoices);

// GET outstanding invoices (for debt management)
router.get('/invoices/outstanding', invoiceController.getOutstandingInvoices);

// GET single invoice
router.get('/invoices/:id', invoiceController.getInvoiceById);

// Download invoice PDF
router.get('/invoices/:id/pdf', invoiceController.downloadInvoicePDF);

// Send invoice email
router.post('/invoices/:id/send', invoiceController.sendInvoice);

// Admin only routes for invoices
router.post('/invoices', roleMiddleware.restrictTo('admin'), invoiceController.createInvoice);
router.put('/invoices/:id', roleMiddleware.restrictTo('admin'), invoiceController.updateInvoice);
router.delete('/invoices/:id', roleMiddleware.restrictTo('admin'), invoiceController.deleteInvoice);

// ==================== PAYMENTS ====================

// GET all payments
router.get('/payments', paymentController.getAllPayments);

// GET payment summary/statistics
router.get('/payments/summary', paymentController.getPaymentSummary);

// GET comprehensive payment report
router.get('/payments/report', paymentController.getPaymentReport);

// GET single payment
router.get('/payments/:id', paymentController.getPaymentById);

// Admin only routes for payments
router.post('/payments', roleMiddleware.restrictTo('admin'), paymentController.createPayment);
router.put('/payments/:id', roleMiddleware.restrictTo('admin'), paymentController.updatePayment);
router.delete('/payments/:id', roleMiddleware.restrictTo('admin'), paymentController.deletePayment);

// Paystack payment routes (authenticated)
router.post('/payments/paystack/initialize', paymentController.initializePaystackPayment);

module.exports = router;
