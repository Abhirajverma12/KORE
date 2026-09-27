const { PrismaClient } = require('@prisma/client');
const { config } = require('../src/config');
const {
  createSessionOrder,
  generateExpectedSignature,
  verifyAndUnlockPayment,
} = require('../src/services/paymentService');

const prisma = new PrismaClient();

async function runPaymentAndCryptoTests() {
  console.log('\n--- 🧪 TEST SUITE: Razorpay Cryptographic Verification (Pure JS) ---');

  const mentee = await prisma.user.findFirst({ where: { role: 'mentee' } });
  const mentor = await prisma.user.findFirst({ where: { role: 'mentor' } });

  if (!mentee || !mentor) {
    throw new Error('Seed data missing for payment tests');
  }

  const session = await prisma.session.create({
    data: {
      menteeId: mentee.id,
      mentorId: mentor.id,
      status: 'PENDING',
      topic: 'Payment Test Verification Session',
      amount: 2500,
      currency: 'INR',
    },
  });

  const orderResult = await createSessionOrder({
    sessionId: session.id,
    amount: session.amount,
  });

  const paymentId = `pay_test_${Date.now()}`;
  const validSignature = generateExpectedSignature(orderResult.orderId, paymentId, config.razorpayKeySecret);

  console.log(`[Test 1] Testing tamper rejection (invalid signature)...`);
  try {
    const tamperedSignature = '0000000000000000000000000000000000000000000000000000000000000000';
    await verifyAndUnlockPayment({
      sessionId: session.id,
      razorpayOrderId: orderResult.orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: tamperedSignature,
    });
    throw new Error('FAILED: Tampered signature was incorrectly accepted!');
  } catch (err) {
    console.log('  ✅ Tampered signature was correctly rejected with error:', err.message);
  }

  console.log(`[Test 2] Testing valid HMAC-SHA256 signature verification...`);
  const unlockResult = await verifyAndUnlockPayment({
    sessionId: session.id,
    razorpayOrderId: orderResult.orderId,
    razorpayPaymentId: paymentId,
    razorpaySignature: validSignature,
  });

  if (!unlockResult.success || unlockResult.session.status !== 'PAID') {
    throw new Error('Failed to unlock session with valid cryptographic signature');
  }

  console.log('  ✅ Valid signature accepted and session status transitioned to PAID.');

  await prisma.message.deleteMany({ where: { sessionId: session.id } });
  await prisma.session.delete({ where: { id: session.id } });

  console.log('  🎉 All Razorpay Signature Verification JS tests PASSED!\n');
}

module.exports = { runPaymentAndCryptoTests };
