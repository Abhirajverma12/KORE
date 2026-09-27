const express = require('express');
const {
  createSession,
  getSession,
  getSessionChatMessages,
  getUserSessions,
  completeSession,
} = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, createSession);
router.get('/', authenticateToken, getUserSessions);
router.get('/:id', authenticateToken, getSession);
router.get('/:id/messages', authenticateToken, getSessionChatMessages);
router.patch('/:id/complete', authenticateToken, completeSession);

module.exports = router;
