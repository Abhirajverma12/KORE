const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const queryRoutes = require('./routes/queryRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const mentorRoutes = require('./routes/mentorRoutes');

function createApp() {
  const app = express();

  app.use(
    cors({
      origin: '*',
      credentials: true,
    })
  );

  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'kore-backend-javascript',
      timestamp: new Date().toISOString(),
      modules: {
        aiQueryEngine: 'active',
        mentorMatching: 'active',
        realtimeChat: 'active',
        rbacAuth: 'active',
        razorpayPayments: 'active',
      },
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/queries', queryRoutes);
  app.use('/api/sessions', sessionRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/mentors', mentorRoutes);

  return app;
}

module.exports = { createApp };
