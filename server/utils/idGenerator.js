const pool = require('../config/db');

/**
 * Generates the next sequential Complaint ID formatted as CMP001, CMP002, etc.
 * Uses a transactional row lock or query to determine the latest sequence number.
 */
async function generateNextComplaintId(connection = null) {
  const db = connection || pool;
  
  const [rows] = await db.query(`
    SELECT complaint_id 
    FROM complaints 
    ORDER BY CAST(SUBSTRING(complaint_id, 4) AS UNSIGNED) DESC 
    LIMIT 1
  `);

  if (!rows || rows.length === 0) {
    return 'CMP001';
  }

  const lastId = rows[0].complaint_id;
  const match = lastId.match(/^CMP(\d+)$/);
  
  if (!match) {
    return 'CMP001';
  }

  const nextNum = parseInt(match[1], 10) + 1;
  const padded = String(nextNum).padStart(3, '0');
  return `CMP${padded}`;
}

module.exports = {
  generateNextComplaintId
};
