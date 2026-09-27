const { PrismaClient } = require('@prisma/client');
const {
  createSessionOrder,
  verifyAndUnlockPayment,
  processRazorpayWebhook,
  generateExpectedSignature,
} = require('../services/paymentService');

const prisma = new PrismaClient();

async function createOrder(req, res) {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const orderData = await createSessionOrder({
      sessionId: session.id,
      amount: session.amount,
      currency: session.currency,
    });

    res.json(orderData);
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment order' });
  }
}

async function verifyPayment(req, res) {
  try {
    const { sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!sessionId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        error: 'Missing required parameters: sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature',
      });
    }

    const result = await verifyAndUnlockPayment({
      sessionId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    res.json(result);
  } catch (error) {
    console.error('Payment verification failed:', error);
    res.status(400).json({ error: error.message || 'Payment signature verification failed' });
  }
}

async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing x-razorpay-signature header' });
    }

    const result = await processRazorpayWebhook(req.body, signature);
    res.json(result);
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(400).json({ error: error.message });
  }
}

async function testMockCheckout(req, res) {
  try {
    const { sessionId } = req.body;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    let orderId = session.razorpayOrderId;
    if (!orderId) {
      const orderData = await createSessionOrder({
        sessionId: session.id,
        amount: session.amount,
        currency: session.currency,
      });
      orderId = orderData.orderId;
    }

    const paymentId = `pay_mock_${Date.now()}`;
    const validSignature = generateExpectedSignature(orderId, paymentId);

    const result = await verifyAndUnlockPayment({
      sessionId: session.id,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSignature,
    });

    res.json({
      ...result,
      mockDetails: {
        orderId,
        paymentId,
        signature: validSignature,
      },
    });
  } catch (error) {
    console.error('Mock checkout error:', error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createOrder,
  verifyPayment,
  handleWebhook,
  testMockCheckout,
};
