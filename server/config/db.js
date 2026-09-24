const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'classroom_complaint_portal',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME || 'classroom_complaint_portal');
    connection.release();
  } catch (err) {
    console.error('⚠️  MySQL Database Connection Warning:', err.message);
    console.error('👉 Ensure MySQL is running on port ' + (process.env.DB_PORT || 3306) + ' and run "npm run seed" if not yet created.');
  }
})();

module.exports = pool;
