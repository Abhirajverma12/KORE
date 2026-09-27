const crypto = require('crypto');
const Razorpay = require('razorpay');
const { PrismaClient } = require('@prisma/client');
const { config } = require('../config');

const prisma = new PrismaClient();

let razorpayInstance = null;
try {
  if (config.razorpayKeyId && config.razorpayKeySecret) {
    razorpayInstance = new Razorpay({
      key_id: config.razorpayKeyId,
      key_secret: config.razorpayKeySecret,
    });
  }
} catch (e) {
  console.warn('Razorpay SDK init fallback:', e.message);
}

async function createSessionOrder(params) {
  const { sessionId, amount, currency = 'INR' } = params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { mentor: true, mentee: true },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  const amountInPaise = Math.round(amount * 100);
  const receipt = `rcpt_sess_${sessionId.slice(-8)}_${Date.now().toString().slice(-4)}`;

  let razorpayOrderId = `order_${sessionId.slice(0, 8)}_${Date.now()}`;

  if (razorpayInstance) {
    try {
      const order = await razorpayInstance.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          sessionId,
          menteeId: session.menteeId,
          mentorId: session.mentorId,
          topic: session.topic,
        },
      });
      razorpayOrderId = order.id;
    } catch (err) {
      console.warn('Razorpay live order creation fallback to test order ID:', err.message);
    }
  }

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: {
      razorpayOrderId,
      amount,
      currency,
      status: 'PENDING',
    },
  });

  return {
    orderId: razorpayOrderId,
    amount: amountInPaise,
    currency,
    keyId: config.razorpayKeyId,
    session: updatedSession,
  };
}

function generateExpectedSignature(orderId, paymentId, secret = config.razorpayKeySecret) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

async function verifyAndUnlockPayment(params) {
  const { sessionId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { mentor: true, mentee: true },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status === 'PAID') {
    return { success: true, message: 'Session already paid and unlocked', session };
  }

  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(body)
    .digest('hex');

  const signatureBuffer = Buffer.from(razorpaySignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  const isValid =
    signatureBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!isValid) {
    throw new Error('Invalid payment signature verification failed. Unauthorized transaction.');
  }

  const unlockedSession = await prisma.session.update({
    where: { id: sessionId },
    data: {
      status: 'PAID',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    },
    include: {
      mentor: { select: { id: true, name: true, email: true, avatarUrl: true } },
      mentee: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
  });

  await prisma.message.create({
    data: {
      sessionId,
      senderId: session.mentorId,
      text: `Payment confirmed! Mentorship session "${session.topic}" is now active. Feel free to introduce your background and share your questions!`,
    },
  });

  return {
    success: true,
    message: 'Payment verified successfully. Mentorship session is unlocked.',
    session: unlockedSession,
  };
}

async function processRazorpayWebhook(payload, signature) {
  const expectedSignature = crypto
    .createHmac('sha256', config.razorpayWebhookSecret)
    .update(JSON.stringify(payload))
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new Error('Invalid webhook signature');
  }

  const event = payload.event;
  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
    const orderId = paymentEntity?.order_id || paymentEntity?.id;
    const paymentId = paymentEntity?.id;

    if (orderId) {
      const session = await prisma.session.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (session && session.status !== 'PAID') {
        await prisma.session.update({
          where: { id: session.id },
          data: {
            status: 'PAID',
            razorpayPaymentId: paymentId,
          },
        });
      }
    }
  }

  return { received: true };
}

module.exports = {
  createSessionOrder,
  generateExpectedSignature,
  verifyAndUnlockPayment,
  processRazorpayWebhook,
};
