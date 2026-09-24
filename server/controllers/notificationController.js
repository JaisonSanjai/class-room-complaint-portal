const pool = require('../config/db');

// GET /api/notifications - Get all user notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT notification_id, user_id, message, complaint_id, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const unreadCount = rows.filter(n => !n.is_read).length;

    return res.status(200).json({
      success: true,
      unread_count: unreadCount,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Could not fetch notifications.' });
  }
};

// PATCH /api/notifications/:id/read - Mark single as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE notification_id = ? AND user_id = ?',
      [id, userId]
    );

    return res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({ success: false, message: 'Error updating notification.' });
  }
};

// PATCH /api/notifications/read-all - Mark all as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return res.status(500).json({ success: false, message: 'Error updating notifications.' });
  }
};
