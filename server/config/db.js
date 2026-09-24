const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const localDb = require('./localDb');

dotenv.config();

let isMySQLConnected = false;

const mysqlPool = mysql.createPool({
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

// Check MySQL connection on launch
(async () => {
  try {
    const connection = await mysqlPool.getConnection();
    isMySQLConnected = true;
    console.log('✅ Connected to MySQL Database Server (localhost:3306).');
    connection.release();
  } catch (err) {
    isMySQLConnected = false;
    console.log('----------------------------------------------------');
    console.log('ℹ️  MySQL Server (localhost:3306) is not currently running.');
    console.log('⚡ Seamlessly activated Local Storage Engine with all 57 students, 6 staff & demo data.');
    console.log('👉 You can test and use all portal features right away in your browser!');
    console.log('----------------------------------------------------');
  }
})();

// Dual-mode Proxy (Delegates to MySQL when available, or Local DB otherwise)
const dbProxy = {
  async query(sql, params) {
    if (isMySQLConnected) {
      try {
        return await mysqlPool.query(sql, params);
      } catch (err) {
        console.warn('MySQL query error, using local fallback:', err.message);
        return await localDb.query(sql, params);
      }
    }
    return await localDb.query(sql, params);
  },

  async getConnection() {
    if (isMySQLConnected) {
      try {
        return await mysqlPool.getConnection();
      } catch (err) {
        return await localDb.getConnection();
      }
    }
    return await localDb.getConnection();
  }
};

module.exports = dbProxy;
