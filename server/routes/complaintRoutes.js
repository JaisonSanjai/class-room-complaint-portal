const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All complaint routes require valid authentication
router.use(authenticateToken);

// Student files complaint
router.post('/', authorizeRoles('Student'), complaintController.createComplaint);

// Get list of complaints (filtered automatically by role inside controller)
router.get('/', complaintController.getComplaints);

// Get single complaint details (and auto-update to 'Seen' if opened by recipient)
router.get('/:id', complaintController.getComplaintById);

// Update complaint status (Faculty, HOD, Admin)
router.patch('/:id/status', authorizeRoles('Faculty', 'HOD', 'Admin'), complaintController.updateComplaintStatus);

module.exports = router;
