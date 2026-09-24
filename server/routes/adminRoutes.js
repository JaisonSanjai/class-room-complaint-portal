const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All admin routes strictly require Admin role
router.use(authenticateToken, authorizeRoles('Admin'));

// Admin Dashboard stats
router.get('/stats', adminController.getStats);

// User accounts management
router.get('/users', adminController.getUsers);
router.patch('/users/:user_id/status', adminController.toggleUserStatus);

// Audit trails & Logs
router.get('/audit-logs', adminController.getAuditLogs);
router.get('/notifications', adminController.getSystemNotifications);

module.exports = router;
