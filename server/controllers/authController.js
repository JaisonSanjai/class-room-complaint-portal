const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { role, id, password } = req.body;

    if (!role || !id || !password) {
      return res.status(400).json({
        success: false,
        message: 'Role, ID/Username, and Password are all required.'
      });
    }

    const trimmedId = id.trim();
    const cleanPassword = password.trim();

    let user = null;
    let userRole = role;

    if (role === 'Student') {
      const [rows] = await pool.query(
        'SELECT student_id, name, password_hash, account_status FROM students WHERE student_id = ?',
        [trimmedId]
      );
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid Student ID or password.' });
      }
      user = rows[0];
      if (user.account_status === 'suspended') {
        return res.status(403).json({ success: false, message: 'Your student account is suspended. Please contact administration.' });
      }
      user.id = user.student_id;
    } else if (role === 'Faculty' || role === 'HOD') {
      const [rows] = await pool.query(
        'SELECT staff_id, name, role, password_hash, notifications_enabled, account_status FROM staff WHERE staff_id = ? AND role = ?',
        [trimmedId, role]
      );
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: `Invalid ${role} selection or password.` });
      }
      user = rows[0];
      if (user.account_status === 'suspended') {
        return res.status(403).json({ success: false, message: `Your ${role} account is suspended. Please contact administration.` });
      }
      user.id = user.staff_id;
      userRole = user.role;
    } else if (role === 'Admin') {
      const [rows] = await pool.query(
        'SELECT admin_id, name, password_hash FROM admins WHERE admin_id = ?',
        [trimmedId]
      );
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid Admin credentials.' });
      }
      user = rows[0];
      user.id = user.admin_id;
      userRole = 'Admin';
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported role specified.' });
    }

    // Verify Password
    const isPasswordValid = await bcrypt.compare(cleanPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Please verify your password.' });
    }

    // Generate JWT
    const payload = {
      id: user.id,
      role: userRole,
      name: user.name
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'classroom_complaint_portal_secret_key_2026_jwt',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        role: userRole,
        name: user.name,
        notifications_enabled: user.notifications_enabled !== undefined ? Boolean(user.notifications_enabled) : true
      }
    });

  } catch (error) {
    console.error('Error in auth login:', error);
    return res.status(500).json({ success: false, message: 'Server error during authentication.' });
  }
};

// GET /api/auth/staff-list
exports.getStaffList = async (req, res) => {
  try {
    const { role } = req.query;
    let query = 'SELECT staff_id, name, role, notifications_enabled FROM staff WHERE account_status = "active"';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY role DESC, name ASC';

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching staff list:', error);
    return res.status(500).json({ success: false, message: 'Could not load staff list.' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
};

// PATCH /api/auth/toggle-notifications
exports.toggleNotifications = async (req, res) => {
  try {
    if (req.user.role !== 'Faculty' && req.user.role !== 'HOD') {
      return res.status(403).json({ success: false, message: 'Only Faculty and HOD can toggle notifications.' });
    }

    // Toggle current state
    const [current] = await pool.query('SELECT notifications_enabled FROM staff WHERE staff_id = ?', [req.user.id]);
    if (current.length === 0) {
      return res.status(404).json({ success: false, message: 'Staff member not found.' });
    }

    const newState = !Boolean(current[0].notifications_enabled);
    await pool.query('UPDATE staff SET notifications_enabled = ? WHERE staff_id = ?', [newState, req.user.id]);

    return res.status(200).json({
      success: true,
      message: `Notifications turned ${newState ? 'ON' : 'OFF'}.`,
      notifications_enabled: newState
    });
  } catch (error) {
    console.error('Error toggling notifications:', error);
    return res.status(500).json({ success: false, message: 'Could not update notification settings.' });
  }
};
