const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// GET payment gateway settings (public keys only)
router.get('/payment-gateways', settingsController.getPaymentGatewaySettings);

module.exports = router;
