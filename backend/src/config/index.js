const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  jwtSecret: process.env.JWT_SECRET || 'kore-jwt-super-secure-secret-key-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_kore_platform_key',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'kore_secret_test_key_secure_123',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'kore_webhook_secret_key_456',
};

module.exports = { config };
