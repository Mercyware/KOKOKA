const express = require('express');
const {
  uploadDocument,
  getDocuments,
  getDocument,
  downloadDocument,
  updateDocument,
  deleteDocument,
  verifyDocument,
  getDocumentStats
} = require('../controllers/documentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Protect all routes
router.use(protect);

// Document management routes
router.route('/')
  .get(getDocuments)
  .post(uploadDocument);

router.route('/upload')
  .post(uploadDocument);

router.route('/stats')
  .get(authorize('admin', 'principal'), getDocumentStats);

router.route('/:id')
  .get(getDocument)
  .put(updateDocument)
  .delete(deleteDocument);

router.route('/:id/download')
  .get(downloadDocument);

router.route('/:id/verify')
  .put(authorize('admin', 'principal'), verifyDocument);

module.exports = router;