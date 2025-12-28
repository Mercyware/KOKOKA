const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const { requireSchool } = require('../middlewares/schoolMiddleware');
const {
  getAllMasterInvoices,
  getMasterInvoiceById,
  createMasterInvoice,
  updateMasterInvoice,
  deleteMasterInvoice,
  generateChildInvoices,
  getMasterInvoiceStats
} = require('../controllers/masterInvoiceController');

// All routes require authentication and valid school context
router.use(protect);
router.use(requireSchool);

// Get all master invoices
router.get('/', authorize(['admin', 'accountant']), getAllMasterInvoices);

// Get master invoice statistics
router.get('/:id/stats', authorize(['admin', 'accountant']), getMasterInvoiceStats);

// Get single master invoice
router.get('/:id', authorize(['admin', 'accountant']), getMasterInvoiceById);

// Create master invoice
router.post('/', authorize(['admin', 'accountant']), createMasterInvoice);

// Generate child invoices from master
router.post('/:id/generate', authorize(['admin', 'accountant']), generateChildInvoices);

// Update master invoice
router.put('/:id', authorize(['admin', 'accountant']), updateMasterInvoice);

// Delete master invoice
router.delete('/:id', authorize(['admin', 'accountant']), deleteMasterInvoice);

module.exports = router;
