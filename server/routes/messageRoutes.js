const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(authenticateToken);

// View messages in a complaint thread
router.get('/:complaint_id', messageController.getMessages);

// Send message (Student, Faculty, HOD - Admin has read-only access)
router.post('/:complaint_id', authorizeRoles('Student', 'Faculty', 'HOD'), messageController.sendMessage);

module.exports = router;
