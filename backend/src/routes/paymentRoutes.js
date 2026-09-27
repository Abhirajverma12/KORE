const express = require('express');
const {
  createOrder,
  verifyPayment,
  handleWebhook,
  testMockCheckout,
} = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/create-order', authenticateToken, createOrder);
router.post('/verify', authenticateToken, verifyPayment);
router.post('/test-mock-checkout', authenticateToken, testMockCheckout);
router.post('/webhook', handleWebhook);

module.exports = router;
