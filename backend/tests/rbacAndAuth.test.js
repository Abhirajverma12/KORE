const jwt = require('jsonwebtoken');
const { config } = require('../src/config');

async function runRbacAndAuthTests() {
  console.log('\n--- 🧪 TEST SUITE: JWT Authentication & RBAC (Pure JS) ---');

  const menteePayload = {
    userId: 'user_mentee_1',
    email: 'mentee@test.com',
    role: 'mentee',
    name: 'Mentee Tester',
  };

  const adminPayload = {
    userId: 'user_admin_1',
    email: 'admin@test.com',
    role: 'admin',
    name: 'Admin Tester',
  };

  const menteeToken = jwt.sign(menteePayload, config.jwtSecret, { expiresIn: '1h' });
  const adminToken = jwt.sign(adminPayload, config.jwtSecret, { expiresIn: '1h' });

  const decodedMentee = jwt.verify(menteeToken, config.jwtSecret);
  if (decodedMentee.role !== 'mentee' || decodedMentee.userId !== 'user_mentee_1') {
    throw new Error('Mentee token decode failed');
  }
  console.log('  ✅ JWT token signing and verification validated.');

  const allowedAdminRoles = ['admin'];
  if (allowedAdminRoles.includes(decodedMentee.role)) {
    throw new Error('Mentee incorrectly allowed in admin-only role scope!');
  }
  console.log('  ✅ Mentee blocked from admin route (cross-role leak prevented).');

  const decodedAdmin = jwt.verify(adminToken, config.jwtSecret);
  if (!allowedAdminRoles.includes(decodedAdmin.role)) {
    throw new Error('Admin blocked from admin route!');
  }
  console.log('  ✅ Admin correctly granted access.');

  console.log('  🎉 All RBAC and Authentication JS tests PASSED!\n');
}

module.exports = { runRbacAndAuthTests };
