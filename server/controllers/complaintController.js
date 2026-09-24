const pool = require('../config/db');
const { generateNextComplaintId } = require('../utils/idGenerator');

// POST /api/complaints - Student submits complaint
exports.createComplaint = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { title, description, recipient_id } = req.body;
    const student_id = req.user.id;

    if (!title || !description || !recipient_id) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and target recipient are required.'
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Title must be at least 3 characters.' });
    }

    if (description.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a more detailed description (at least 10 characters).' });
    }

    // Verify recipient is an active staff member (Faculty or HOD)
    const [staffRows] = await connection.query(
      'SELECT staff_id, name, role, notifications_enabled, account_status FROM staff WHERE staff_id = ?',
      [recipient_id]
    );

    if (staffRows.length === 0) {
      return res.status(400).json({ success: false, message: 'Selected staff recipient was not found.' });
    }

    const recipient = staffRows[0];
    if (recipient.account_status === 'suspended') {
      return res.status(400).json({ success: false, message: 'Selected staff recipient account is suspended.' });
    }

    await connection.beginTransaction();

    // Generate sequential Complaint ID (e.g. CMP001, CMP002)
    const complaint_id = await generateNextComplaintId(connection);

    // Insert complaint
    await connection.query(
      `INSERT INTO complaints (complaint_id, student_id, recipient_id, title, description, status)
       VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [complaint_id, student_id, recipient_id, title.trim(), description.trim()]
    );

    // Record initial history
    await connection.query(
      `INSERT INTO complaint_history (complaint_id, previous_status, new_status, changed_by_id)
       VALUES (?, NULL, 'Pending', ?)`,
      [complaint_id, student_id]
    );

    // Notify recipient if notifications are enabled
    if (recipient.notifications_enabled) {
      await connection.query(
        `INSERT INTO notifications (user_id, message, complaint_id)
         VALUES (?, ?, ?)`,
        [
          recipient.staff_id,
          `New complaint [${complaint_id}] submitted by Student ${student_id} (${req.user.name}): "${title.trim().substring(0, 40)}"`,
          complaint_id
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully.',
      data: {
        complaint_id,
        student_id,
        recipient_id,
        recipient_name: recipient.name,
        recipient_role: recipient.role,
        title: title.trim(),
        description: description.trim(),
        status: 'Pending'
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating complaint:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit complaint. ' + error.message });
  } finally {
    connection.release();
  }
};

// GET /api/complaints - View complaints based on role
exports.getComplaints = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;
    const { status, search } = req.query;

    let query = `
      SELECT 
        c.complaint_id,
        c.student_id,
        s.name AS student_name,
        c.recipient_id,
        st.name AS recipient_name,
        st.role AS recipient_role,
        c.title,
        c.description,
        c.status,
        c.resolution_note,
        c.created_at,
        c.updated_at
      FROM complaints c
      LEFT JOIN students s ON c.student_id = s.student_id
      LEFT JOIN staff st ON c.recipient_id = st.staff_id
      WHERE 1=1
    `;
    const params = [];

    // Role-based filtering
    if (userRole === 'Student') {
      query += ' AND c.student_id = ?';
      params.push(userId);
    } else if (userRole === 'Faculty' || userRole === 'HOD') {
      query += ' AND c.recipient_id = ?';
      params.push(userId);
    } // Admin sees all complaints

    // Status filter
    if (status && status !== 'All') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    // Search query filter
    if (search && search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      query += ` AND (
        c.complaint_id LIKE ? OR 
        c.title LIKE ? OR 
        c.description LIKE ? OR 
        c.student_id LIKE ? OR 
        s.name LIKE ? OR 
        st.name LIKE ?
      )`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY c.created_at DESC';

    const [rows] = await pool.query(query, params);
    return res.status(200).json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve complaints.' });
  }
};

// GET /api/complaints/:id - View single complaint details
exports.getComplaintById = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    const [rows] = await connection.query(
      `SELECT 
        c.complaint_id,
        c.student_id,
        s.name AS student_name,
        c.recipient_id,
        st.name AS recipient_name,
        st.role AS recipient_role,
        c.title,
        c.description,
        c.status,
        c.resolution_note,
        c.created_at,
        c.updated_at
      FROM complaints c
      LEFT JOIN students s ON c.student_id = s.student_id
      LEFT JOIN staff st ON c.recipient_id = st.staff_id
      WHERE c.complaint_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const complaint = rows[0];

    // Authorization check
    if (userRole === 'Student' && complaint.student_id !== userId) {
      return res.status(403).json({ success: false, message: 'You are only authorized to view your own complaints.' });
    }
    if ((userRole === 'Faculty' || userRole === 'HOD') && complaint.recipient_id !== userId) {
      return res.status(403).json({ success: false, message: 'You are only authorized to view complaints addressed to you.' });
    }

    // Auto-update to 'Seen' if opened by recipient while Pending
    if ((userRole === 'Faculty' || userRole === 'HOD') && complaint.recipient_id === userId && complaint.status === 'Pending') {
      await connection.beginTransaction();

      await connection.query(
        'UPDATE complaints SET status = "Seen" WHERE complaint_id = ?',
        [id]
      );

      await connection.query(
        `INSERT INTO complaint_history (complaint_id, previous_status, new_status, changed_by_id)
         VALUES (?, 'Pending', 'Seen', ?)`,
        [id, userId]
      );

      // In-app notification for the student
      await connection.query(
        `INSERT INTO notifications (user_id, message, complaint_id)
         VALUES (?, ?, ?)`,
        [
          complaint.student_id,
          `Your complaint [${id}] has been viewed and marked as "Seen" by ${req.user.name}.`,
          id
        ]
      );

      await connection.commit();
      complaint.status = 'Seen';
    }

    return res.status(200).json({ success: true, data: complaint });

  } catch (error) {
    await connection.rollback();
    console.error('Error fetching complaint details:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving complaint details.' });
  } finally {
    connection.release();
  }
};

// PATCH /api/complaints/:id/status - Update complaint status
exports.updateComplaintStatus = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status: new_status, resolution_note } = req.body;
    const userRole = req.user.role;
    const userId = req.user.id;

    const allowedStatuses = ['Pending', 'Seen', 'In Progress', 'Replied', 'Resolved'];
    if (!new_status || !allowedStatuses.includes(new_status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    // Fetch existing complaint
    const [rows] = await connection.query(
      'SELECT complaint_id, student_id, recipient_id, status FROM complaints WHERE complaint_id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const complaint = rows[0];

    // Authorization check: Only assigned recipient or Admin can change status
    if (userRole !== 'Admin' && complaint.recipient_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned staff recipient or Administrator can update the complaint status.'
      });
    }

    // Already resolved validation
    if (complaint.status === 'Resolved' && userRole !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'This complaint is already Resolved and cannot be reopened by staff.'
      });
    }

    // Mandatory Resolution Note validation
    if (new_status === 'Resolved') {
      if (!resolution_note || resolution_note.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'A mandatory resolution note (minimum 5 characters) is required to mark this complaint as Resolved.'
        });
      }
    }

    const previous_status = complaint.status;

    await connection.beginTransaction();

    if (new_status === 'Resolved') {
      await connection.query(
        'UPDATE complaints SET status = ?, resolution_note = ? WHERE complaint_id = ?',
        [new_status, resolution_note.trim(), id]
      );
    } else {
      await connection.query(
        'UPDATE complaints SET status = ? WHERE complaint_id = ?',
        [new_status, id]
      );
    }

    // Record audit history
    await connection.query(
      `INSERT INTO complaint_history (complaint_id, previous_status, new_status, changed_by_id)
       VALUES (?, ?, ?, ?)`,
      [id, previous_status, new_status, userId]
    );

    // Notify Student
    await connection.query(
      `INSERT INTO notifications (user_id, message, complaint_id)
       VALUES (?, ?, ?)`,
      [
        complaint.student_id,
        new_status === 'Resolved' 
          ? `Your complaint [${id}] has been marked as RESOLVED by ${req.user.name}. Resolution Note provided.` 
          : `Status for your complaint [${id}] updated to "${new_status}" by ${req.user.name}.`,
        id
      ]
    );

    await connection.commit();

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to ${new_status}.`,
      data: {
        complaint_id: id,
        previous_status,
        new_status,
        resolution_note: new_status === 'Resolved' ? resolution_note.trim() : null
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating status:', error);
    return res.status(500).json({ success: false, message: 'Could not update status. ' + error.message });
  } finally {
    connection.release();
  }
};
