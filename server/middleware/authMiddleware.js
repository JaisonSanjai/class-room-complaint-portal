const jwt = require('jsonwebtoken');
const pool = require('../config/db');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'classroom_complaint_portal_secret_key_2026_jwt');

    // Verify account status from database
    if (decoded.role === 'Student') {
      const [students] = await pool.query('SELECT student_id, name, account_status FROM students WHERE student_id = ?', [decoded.id]);
      if (students.length === 0) {
        return res.status(401).json({ success: false, message: 'User account not found.' });
      }
      if (students[0].account_status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Your account has been suspended by the administrator.' });
      }
      req.user = { id: students[0].student_id, role: 'Student', name: students[0].name };
    } else if (decoded.role === 'Faculty' || decoded.role === 'HOD') {
      const [staff] = await pool.query('SELECT staff_id, name, role, account_status, notifications_enabled FROM staff WHERE staff_id = ?', [decoded.id]);
      if (staff.length === 0) {
        return res.status(401).json({ success: false, message: 'Staff account not found.' });
      }
      if (staff[0].account_status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Your staff account has been suspended by the administrator.' });
      }
      req.user = { 
        id: staff[0].staff_id, 
        role: staff[0].role, 
        name: staff[0].name,
        notifications_enabled: Boolean(staff[0].notifications_enabled)
      };
    } else if (decoded.role === 'Admin') {
      const [admins] = await pool.query('SELECT admin_id, name FROM admins WHERE admin_id = ?', [decoded.id]);
      if (admins.length === 0) {
        return res.status(401).json({ success: false, message: 'Admin account not found.' });
      }
      req.user = { id: admins[0].admin_id, role: 'Admin', name: admins[0].name };
    } else {
      return res.status(403).json({ success: false, message: 'Invalid role specified in token.' });
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(403).json({ success: false, message: 'Invalid or malformed authentication token.' });
  }
}

module.exports = {
  authenticateToken
};
