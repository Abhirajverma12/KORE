const express = require('express');
const {
  getMetrics,
  getAllQueries,
  getAllSessions,
  getAllUsers,
} = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken, requireRole(['admin']));

router.get('/metrics', getMetrics);
router.get('/queries', getAllQueries);
router.get('/sessions', getAllSessions);
router.get('/users', getAllUsers);

module.exports = router;
