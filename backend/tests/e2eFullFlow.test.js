const http = require('http');
const { createApp } = require('../src/app');
const { config } = require('../src/config');
const { generateExpectedSignature } = require('../src/services/paymentService');

async function runE2E() {
  console.log('===========================================================');
  console.log('  🧪 KORE E2E SYSTEM INTEGRATION VERIFICATION (PURE JS)   ');
  console.log('===========================================================');

  const app = createApp();
  const server = http.createServer(app);
  const testPort = 5098;

  await new Promise((resolve) => server.listen(testPort, '127.0.0.1', resolve));
  const baseUrl = `http://127.0.0.1:${testPort}/api`;

  try {
    console.log('[Step 1] Verifying Backend Health API...');
    const healthRes = await fetch(`${baseUrl}/health`).then((r) => r.json());
    if (healthRes.status !== 'ok') throw new Error('Health check failed');
    console.log('  ✅ Backend Health check OK. Modules active:', Object.keys(healthRes.modules).join(', '));

    console.log('\n[Step 2] Authenticating Mentee (alex@example.com)...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'alex@example.com', password: 'password123' }),
    }).then((r) => r.json());

    if (!loginRes.token) throw new Error('Mentee login failed: ' + JSON.stringify(loginRes));
    const menteeToken = loginRes.token;
    console.log('  ✅ Mentee authenticated successfully. User ID:', loginRes.user.id);

    console.log('\n[Step 3] Submitting Natural Language Query to AI Matching Engine...');
    const queryText = 'I am preparing for a Staff System Design interview focusing on Kafka streaming and Redis cache invalidation at scale.';
    const matchRes = await fetch(`${baseUrl}/queries/enhance-and-match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${menteeToken}`,
      },
      body: JSON.stringify({ rawText: queryText }),
    }).then((r) => r.json());

    if (!matchRes.intent || !matchRes.matches || matchRes.matches.length === 0) {
      throw new Error('Matching API failed: ' + JSON.stringify(matchRes));
    }
    console.log('  ✅ AI Extracted Intent:', JSON.stringify(matchRes.intent.summaryIntent));
    console.log(`  ✅ Extracted Skills: [${matchRes.intent.primarySkills.join(', ')}] | Caliber: ${matchRes.intent.seniorityLevel}`);
    console.log(`  ✅ Ranked ${matchRes.matches.length} mentors. #1: ${matchRes.matches[0].name} (${matchRes.matches[0].matchScore}% match)`);

    const topMentor = matchRes.matches[0];

    console.log(`\n[Step 4] Booking session with Top Mentor (${topMentor.name})...`);
    const sessionRes = await fetch(`${baseUrl}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${menteeToken}`,
      },
      body: JSON.stringify({
        mentorUserId: topMentor.userId,
        queryId: matchRes.queryId,
        topic: matchRes.intent.summaryIntent,
      }),
    }).then((r) => r.json());

    if (!sessionRes.session || sessionRes.session.status !== 'PENDING') {
      throw new Error('Session creation failed: ' + JSON.stringify(sessionRes));
    }
    const session = sessionRes.session;
    console.log(`  ✅ Session created with ID: ${session.id}, Amount: ₹${session.amount}, Status: ${session.status}`);

    console.log('\n[Step 5] Initializing Razorpay Payment Order...');
    const orderRes = await fetch(`${baseUrl}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${menteeToken}`,
      },
      body: JSON.stringify({ sessionId: session.id }),
    }).then((r) => r.json());

    if (!orderRes.orderId) throw new Error('Order creation failed: ' + JSON.stringify(orderRes));
    console.log(`  ✅ Razorpay Order ID created: ${orderRes.orderId}`);

    console.log('\n[Step 6] Testing HMAC-SHA256 Server Payment Verification...');
    const paymentId = `pay_e2e_${Date.now()}`;
    const validSignature = generateExpectedSignature(orderRes.orderId, paymentId, config.razorpayKeySecret);

    const verifyRes = await fetch(`${baseUrl}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${menteeToken}`,
      },
      body: JSON.stringify({
        sessionId: session.id,
        razorpayOrderId: orderRes.orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: validSignature,
      }),
    }).then((r) => r.json());

    if (!verifyRes.success || verifyRes.session.status !== 'PAID') {
      throw new Error('Payment verification failed: ' + JSON.stringify(verifyRes));
    }
    console.log('  ✅ Server verified HMAC signature and flipped session status to PAID.');

    console.log('\n[Step 7] Testing RBAC Security Isolation...');
    const forbiddenRes = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${menteeToken}` },
    });
    if (forbiddenRes.status !== 403) {
      throw new Error(`Expected 403 Forbidden for mentee accessing admin, got ${forbiddenRes.status}`);
    }
    console.log('  ✅ RBAC Guard successfully blocked mentee from accessing Admin routes (HTTP 403).');

    console.log('\n[Step 8] Authenticating Admin and retrieving Platform Metrics...');
    const adminLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@kore.ai', password: 'password123' }),
    }).then((r) => r.json());

    const adminMetrics = await fetch(`${baseUrl}/admin/metrics`, {
      headers: { Authorization: `Bearer ${adminLogin.token}` },
    }).then((r) => r.json());

    console.log('  ✅ Admin metrics retrieved successfully:');
    console.log(`     • Total Queries: ${adminMetrics.metrics.totalQueries}`);
    console.log(`     • Gross GMV Revenue: ₹${adminMetrics.metrics.totalGMV.toLocaleString()}`);
    console.log(`     • Conversion Rate: ${adminMetrics.metrics.conversionRate}%`);
    console.log(`     • Paid Sessions: ${adminMetrics.metrics.paidSessions}`);

    console.log('\n===========================================================');
    console.log('  🎉 COMPLETE JS E2E WORKFLOW VERIFICATION PASSED 100%!  ');
    console.log('===========================================================');
  } finally {
    server.close();
  }
}

runE2E().catch((err) => {
  console.error('❌ E2E Verification failed:', err);
  process.exit(1);
});
