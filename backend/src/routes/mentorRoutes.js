const express = require('express');
const { getMentors, getMentorProfile, updateMentorProfile } = require('../controllers/mentorController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', getMentors);
router.get('/:id', getMentorProfile);
router.put('/profile', authenticateToken, requireRole(['mentor']), updateMentorProfile);

module.exports = router;
