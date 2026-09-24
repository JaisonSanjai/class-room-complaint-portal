const pool = require('../config/db');

// GET /api/messages/:complaint_id - Get all messages for a complaint
exports.getMessages = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const userRole = req.user.role;
    const userId = req.user.id;

    // Check complaint existence & permissions
    const [complaintRows] = await pool.query(
      'SELECT complaint_id, student_id, recipient_id, status FROM complaints WHERE complaint_id = ?',
      [complaint_id]
    );

    if (complaintRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const complaint = complaintRows[0];

    // Access authorization
    if (userRole === 'Student' && complaint.student_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this conversation.' });
    }
    if ((userRole === 'Faculty' || userRole === 'HOD') && complaint.recipient_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this conversation.' });
    }

    const [messages] = await pool.query(
      `SELECT 
        m.message_id,
        m.complaint_id,
        m.sender_id,
        m.sender_role,
        m.message,
        m.created_at,
        CASE 
          WHEN m.sender_role = 'Student' THEN (SELECT name FROM students WHERE student_id = m.sender_id)
          WHEN m.sender_role IN ('Faculty', 'HOD') THEN (SELECT name FROM staff WHERE staff_id = m.sender_id)
          WHEN m.sender_role = 'Admin' THEN (SELECT name FROM admins WHERE admin_id = m.sender_id)
          ELSE m.sender_id
        END AS sender_name
       FROM messages m
       WHERE m.complaint_id = ?
       ORDER BY m.created_at ASC`,
      [complaint_id]
    );

    return res.status(200).json({
      success: true,
      count: messages.length,
      is_locked: complaint.status === 'Resolved',
      data: messages
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ success: false, message: 'Error retrieving conversation.' });
  }
};

// POST /api/messages/:complaint_id - Send plain text message
exports.sendMessage = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { complaint_id } = req.params;
    const { message } = req.body;
    const sender_id = req.user.id;
    const sender_role = req.user.role;

    // Plain text validation: disallow empty or excessively long inputs
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty.' });
    }

    // Strip HTML tags to strictly enforce plain text messaging
    const sanitizedMessage = message.replace(/<[^>]*>?/gm, '').trim();

    if (sanitizedMessage.length === 0) {
      return res.status(400).json({ success: false, message: 'Only valid plain text messages are permitted.' });
    }

    // Check complaint
    const [complaintRows] = await connection.query(
      `SELECT 
        c.complaint_id, 
        c.student_id, 
        c.recipient_id, 
        c.status,
        st.notifications_enabled,
        st.name as recipient_name,
        s.name as student_name
       FROM complaints c
       LEFT JOIN staff st ON c.recipient_id = st.staff_id
       LEFT JOIN students s ON c.student_id = s.student_id
       WHERE c.complaint_id = ?`,
      [complaint_id]
    );

    if (complaintRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const complaint = complaintRows[0];

    // Check if Resolved -> Thread permanently locked
    if (complaint.status === 'Resolved') {
      return res.status(403).json({
        success: false,
        message: 'This complaint has been Resolved. The conversation thread is permanently locked.'
      });
    }

    // Permission checks
    if (sender_role === 'Student' && complaint.student_id !== sender_id) {
      return res.status(403).json({ success: false, message: 'You can only message in your own complaints.' });
    }
    if ((sender_role === 'Faculty' || sender_role === 'HOD') && complaint.recipient_id !== sender_id) {
      return res.status(403).json({ success: false, message: 'You can only message in complaints addressed to you.' });
    }
    if (sender_role === 'Admin') {
      return res.status(403).json({ success: false, message: 'Admin has read-only access to complaint conversations.' });
    }

    await connection.beginTransaction();

    // Insert message
    const [insertResult] = await connection.query(
      `INSERT INTO messages (complaint_id, sender_id, sender_role, message)
       VALUES (?, ?, ?, ?)`,
      [complaint_id, sender_id, sender_role, sanitizedMessage]
    );

    // Auto-update status rule:
    // "Auto-update status to Replied if recipient responds via chat while not in progress."
    let statusUpdated = false;
    if ((sender_role === 'Faculty' || sender_role === 'HOD') && complaint.status !== 'In Progress') {
      const prev = complaint.status;
      if (prev !== 'Replied') {
        await connection.query(
          'UPDATE complaints SET status = "Replied" WHERE complaint_id = ?',
          [complaint_id]
        );

        await connection.query(
          `INSERT INTO complaint_history (complaint_id, previous_status, new_status, changed_by_id)
           VALUES (?, ?, 'Replied', ?)`,
          [complaint_id, prev, sender_id]
        );
        statusUpdated = true;
      }
    }

    // In-app notifications
    if (sender_role === 'Student') {
      // Notify staff recipient if enabled
      if (complaint.notifications_enabled) {
        await connection.query(
          `INSERT INTO notifications (user_id, message, complaint_id)
           VALUES (?, ?, ?)`,
          [
            complaint.recipient_id,
            `Student ${sender_id} (${complaint.student_name}) replied to complaint [${complaint_id}]`,
            complaint_id
          ]
        );
      }
    } else {
      // Staff replied -> Notify Student
      await connection.query(
        `INSERT INTO notifications (user_id, message, complaint_id)
         VALUES (?, ?, ?)`,
        [
          complaint.student_id,
          `${complaint.recipient_name} (${sender_role}) replied to your complaint [${complaint_id}]`,
          complaint_id
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Message sent.',
      data: {
        message_id: insertResult.insertId,
        complaint_id,
        sender_id,
        sender_role,
        sender_name: req.user.name,
        message: sanitizedMessage,
        created_at: new Date(),
        status_updated_to_replied: statusUpdated
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error sending message:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  } finally {
    connection.release();
  }
};
