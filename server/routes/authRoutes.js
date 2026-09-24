const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', authController.login);
router.get('/staff-list', authController.getStaffList);

// Protected routes
router.get('/me', authenticateToken, authController.getMe);
router.patch('/toggle-notifications', authenticateToken, authController.toggleNotifications);

module.exports = router;
