const pool = require('../config/db');

// GET /api/admin/stats - System-wide dashboard metrics
exports.getStats = async (req, res) => {
  try {
    // Total Students
    const [[{ total_students }]] = await pool.query('SELECT COUNT(*) AS total_students FROM students');

    // Total Staff (Faculty + HOD)
    const [[{ total_faculty }]] = await pool.query('SELECT COUNT(*) AS total_faculty FROM staff WHERE role = "Faculty"');
    const [[{ total_hod }]] = await pool.query('SELECT COUNT(*) AS total_hod FROM staff WHERE role = "HOD"');

    // Total Complaints & Status Breakdown
    const [statusCounts] = await pool.query(`
      SELECT 
        status, 
        COUNT(*) AS count 
      FROM complaints 
      GROUP BY status
    `);

    const statusMap = {
      'Pending': 0,
      'Seen': 0,
      'In Progress': 0,
      'Replied': 0,
      'Resolved': 0
    };

    let total_complaints = 0;
    statusCounts.forEach(row => {
      if (statusMap[row.status] !== undefined) {
        statusMap[row.status] = row.count;
      }
      total_complaints += row.count;
    });

    // Recent 5 complaints for preview
    const [recentComplaints] = await pool.query(`
      SELECT 
        c.complaint_id,
        c.title,
        c.status,
        c.created_at,
        s.name AS student_name,
        st.name AS recipient_name
      FROM complaints c
      LEFT JOIN students s ON c.student_id = s.student_id
      LEFT JOIN staff st ON c.recipient_id = st.staff_id
      ORDER BY c.created_at DESC
      LIMIT 5
    `);

    return res.status(200).json({
      success: true,
      data: {
        total_students,
        total_staff: total_faculty + total_hod,
        total_faculty,
        total_hod,
        total_complaints,
        status_counts: statusMap,
        recent_complaints: recentComplaints
      }
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin statistics.' });
  }
};

// GET /api/admin/users - List all students and staff
exports.getUsers = async (req, res) => {
  try {
    const { type, search } = req.query; // type: 'all' | 'students' | 'staff'

    let students = [];
    let staff = [];

    if (type !== 'staff') {
      let studentQuery = 'SELECT student_id, name, account_status, created_at FROM students WHERE 1=1';
      const studentParams = [];
      if (search && search.trim() !== '') {
        studentQuery += ' AND (student_id LIKE ? OR name LIKE ?)';
        studentParams.push(`%${search.trim()}%`, `%${search.trim()}%`);
      }
      studentQuery += ' ORDER BY student_id ASC';
      const [rows] = await pool.query(studentQuery, studentParams);
      students = rows;
    }

    if (type !== 'students') {
      let staffQuery = 'SELECT staff_id, name, role, notifications_enabled, account_status, created_at FROM staff WHERE 1=1';
      const staffParams = [];
      if (search && search.trim() !== '') {
        staffQuery += ' AND (staff_id LIKE ? OR name LIKE ?)';
        staffParams.push(`%${search.trim()}%`, `%${search.trim()}%`);
      }
      staffQuery += ' ORDER BY staff_id ASC';
      const [rows] = await pool.query(staffQuery, staffParams);
      staff = rows;
    }

    return res.status(200).json({
      success: true,
      data: {
        students,
        staff
      }
    });

  } catch (error) {
    console.error('Error retrieving users:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve user accounts.' });
  }
};

// PATCH /api/admin/users/:user_id/status - Toggle activate/suspend user
exports.toggleUserStatus = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { user_type, status } = req.body; // user_type: 'student' | 'staff', status: 'active' | 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be "active" or "suspended".' });
    }

    if (user_type === 'student') {
      const [result] = await pool.query(
        'UPDATE students SET account_status = ? WHERE student_id = ?',
        [status, user_id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Student account not found.' });
      }
    } else if (user_type === 'staff') {
      const [result] = await pool.query(
        'UPDATE staff SET account_status = ? WHERE staff_id = ?',
        [status, user_id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Staff account not found.' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user_type. Specify "student" or "staff".' });
    }

    return res.status(200).json({
      success: true,
      message: `Account status for ${user_id} updated to "${status}".`
    });

  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ success: false, message: 'Failed to update account status.' });
  }
};

// GET /api/admin/audit-logs - Full complaint status change history logs
exports.getAuditLogs = async (req, res) => {
  try {
    const { complaint_id } = req.query;
    let query = `
      SELECT 
        ch.history_id,
        ch.complaint_id,
        ch.previous_status,
        ch.new_status,
        ch.changed_by_id,
        ch.changed_at,
        c.title AS complaint_title,
        CASE
          WHEN ch.changed_by_id = 'admin' THEN 'System Administrator'
          WHEN ch.changed_by_id LIKE '25USS%' THEN (SELECT name FROM students WHERE student_id = ch.changed_by_id)
          WHEN ch.changed_by_id LIKE '25abc%' THEN (SELECT name FROM staff WHERE staff_id = ch.changed_by_id)
          ELSE ch.changed_by_id
        END AS changed_by_name
      FROM complaint_history ch
      LEFT JOIN complaints c ON ch.complaint_id = c.complaint_id
      WHERE 1=1
    `;
    const params = [];

    if (complaint_id) {
      query += ' AND ch.complaint_id = ?';
      params.push(complaint_id);
    }

    query += ' ORDER BY ch.changed_at DESC LIMIT 100';

    const [rows] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve audit trail.' });
  }
};

// GET /api/admin/notifications - System-wide notifications view for audit
exports.getSystemNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        n.notification_id,
        n.user_id,
        n.message,
        n.complaint_id,
        n.is_read,
        n.created_at,
        CASE
          WHEN n.user_id LIKE '25USS%' THEN (SELECT name FROM students WHERE student_id = n.user_id)
          WHEN n.user_id LIKE '25abc%' THEN (SELECT name FROM staff WHERE staff_id = n.user_id)
          ELSE n.user_id
        END AS user_name
      FROM notifications n
      ORDER BY n.created_at DESC
      LIMIT 100
    `);

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching system notifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve system notifications.' });
  }
};
