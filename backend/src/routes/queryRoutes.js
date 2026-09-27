const express = require('express');
const { enhanceAndMatch, getQueryHistory, getQueryById } = require('../controllers/queryController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/enhance-and-match', optionalAuth, enhanceAndMatch);
router.get('/history', authenticateToken, getQueryHistory);
router.get('/:id', optionalAuth, getQueryById);

module.exports = router;
