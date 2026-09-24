const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'classroom_complaint_portal';

const studentNames = [
  'Aarav Sharma', 'Aditi Patel', 'Akash Verma', 'Ananya Iyer', 'Aryan Singh',
  'Bhavya Reddy', 'Chetan Kumar', 'Deepika Nair', 'Devansh Gupta', 'Divya Joshi',
  'Eshwar Prasad', 'Gautam Menon', 'Gayatri Rao', 'Harish Chandra', 'Ishaan Malhotra',
  'Janani S.', 'Karthik Raja', 'Kavya Pillai', 'Kiran Das', 'Lakshmi Narayanan',
  'Madhavan K.', 'Manish Tiwari', 'Meera Krishnan', 'Mohit Saxena', 'Naveen Raj',
  'Neha Deshmukh', 'Nikhil Bhat', 'Nithya Murthy', 'Pooja Agarwal', 'Pranav Hegde',
  'Priyanka Roy', 'Rahul Sen', 'Rhea Kapoor', 'Rohan Mehra', 'Sanjay Dutt',
  'Sanjana Bhatt', 'Saravanan M.', 'Shalini Yadav', 'Shreya Ghoshal', 'Siddharth Roy',
  'Sneha Kulkarni', 'Sowmya Raman', 'Subhash Chandra', 'Suresh Raina', 'Swetha Venkatesh',
  'Tarun Vijay', 'Tejaswini Gowda', 'Umang Dave', 'Vaishnavi R.', 'Varun Dhawan',
  'Vigneshwaran P.', 'Vijay Sethi', 'Vinay Kumar', 'Vivek Oberoi', 'Yashaswini K.',
  'Yuvan Shankar', 'Zoya Akhtar'
];

async function seedDatabase() {
  console.log('🚀 Connecting to MySQL to seed classroom_complaint_portal...');
  
  let rootConnection;
  try {
    // 1. Connect without database selected to ensure DB exists
    rootConnection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD
    });

    console.log(`✅ Connected to MySQL server at ${DB_HOST}:${DB_PORT}`);
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database \`${DB_NAME}\` verified/created.`);
    await rootConnection.end();

    // 2. Connect to the specific database
    const db = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME
    });

    console.log('📦 Creating database tables...');

    // Admins
    await db.query(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id VARCHAR(50) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Students
    await db.query(`
      CREATE TABLE IF NOT EXISTS students (
        student_id VARCHAR(50) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        account_status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Staff
    await db.query(`
      CREATE TABLE IF NOT EXISTS staff (
        staff_id VARCHAR(50) NOT NULL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role ENUM('HOD', 'Faculty') NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        account_status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Complaints
    await db.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        complaint_id VARCHAR(20) NOT NULL PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        recipient_id VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        status ENUM('Pending', 'Seen', 'In Progress', 'Replied', 'Resolved') NOT NULL DEFAULT 'Pending',
        resolution_note TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_complaints_student (student_id),
        INDEX idx_complaints_recipient (recipient_id),
        INDEX idx_complaints_status (status),
        CONSTRAINT fk_complaints_student FOREIGN KEY (student_id) REFERENCES students (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_complaints_recipient FOREIGN KEY (recipient_id) REFERENCES staff (staff_id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Messages
    await db.query(`
      CREATE TABLE IF NOT EXISTS messages (
        message_id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id VARCHAR(20) NOT NULL,
        sender_id VARCHAR(50) NOT NULL,
        sender_role ENUM('Student', 'Faculty', 'HOD', 'Admin') NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_messages_complaint (complaint_id),
        CONSTRAINT fk_messages_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (complaint_id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Notifications
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        notification_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        complaint_id VARCHAR(20) DEFAULT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_notifications_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Complaint History
    await db.query(`
      CREATE TABLE IF NOT EXISTS complaint_history (
        history_id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id VARCHAR(20) NOT NULL,
        previous_status VARCHAR(50) DEFAULT NULL,
        new_status VARCHAR(50) NOT NULL,
        changed_by_id VARCHAR(50) NOT NULL,
        changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_history_complaint (complaint_id),
        CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (complaint_id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('✅ Tables created successfully.');

    // 3. Seed Administrator
    console.log('🌱 Seeding Administrator...');
    const adminHash = bcrypt.hashSync('admin123', 10);
    await db.query(`
      INSERT INTO admins (admin_id, name, password_hash)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash);
    `, ['admin', 'System Administrator', adminHash]);
    console.log('✅ Admin account seeded: ID="admin", Password="admin123"');

    // 4. Seed Staff & HOD
    console.log('🌱 Seeding HOD and Faculty staff...');
    const staffMembers = [
      { id: '25abc101', name: 'Jeno Mam', role: 'HOD', password: '101' },
      { id: '25abc102', name: 'Soffi Mam', role: 'Faculty', password: '102' },
      { id: '25abc103', name: 'Jaine Sir', role: 'Faculty', password: '103' },
      { id: '25abc104', name: 'Banumathi Mam', role: 'Faculty', password: '104' },
      { id: '25abc105', name: 'Julli Mam', role: 'Faculty', password: '105' },
      { id: '25abc106', name: 'Joiel Sir', role: 'Faculty', password: '106' }
    ];

    for (const s of staffMembers) {
      const hash = bcrypt.hashSync(s.password, 10);
      await db.query(`
        INSERT INTO staff (staff_id, name, role, password_hash, notifications_enabled, account_status)
        VALUES (?, ?, ?, ?, TRUE, 'active')
        ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), password_hash = VALUES(password_hash);
      `, [s.id, s.name, s.role, hash]);
      console.log(`   - ${s.role}: ${s.name} (ID: ${s.id}, Password: ${s.password})`);
    }

    // 5. Seed 57 Students (25USS101 to 25USS157)
    console.log('🌱 Seeding 57 Pre-seeded Students (25USS101 - 25USS157)...');
    for (let i = 101; i <= 157; i++) {
      const studentId = `25USS${i}`;
      const password = `${i}`;
      const name = studentNames[i - 101] || `Student ${i}`;
      const hash = bcrypt.hashSync(password, 10);

      await db.query(`
        INSERT INTO students (student_id, name, password_hash, account_status)
        VALUES (?, ?, ?, 'active')
        ON DUPLICATE KEY UPDATE name = VALUES(name), password_hash = VALUES(password_hash);
      `, [studentId, name, hash]);
    }
    console.log('✅ 57 Student accounts seeded successfully (25USS101 - 25USS157).');

    // 6. Optional Demo Data: Pre-seed a few sample complaints if complaints table is empty
    const [existingComplaints] = await db.query('SELECT COUNT(*) as count FROM complaints');
    if (existingComplaints[0].count === 0) {
      console.log('🌱 Seeding sample demonstration complaints...');
      
      // CMP001 - Resolved
      await db.query(`
        INSERT INTO complaints (complaint_id, student_id, recipient_id, title, description, status, resolution_note)
        VALUES ('CMP001', '25USS101', '25abc101', 'Broken Projector in Room 304', 'The HDMI connection flickers constantly during morning CS lectures.', 'Resolved', 'Projector HDMI splitter replaced by the technical team. Audio-visual functionality verified.')
      `);
      await db.query(`
        INSERT INTO messages (complaint_id, sender_id, sender_role, message, created_at)
        VALUES 
        ('CMP001', '25USS101', 'Student', 'Respected HOD Mam, the projector in Room 304 is flickering and makes it difficult to follow slides.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
        ('CMP001', '25abc101', 'HOD', 'Thank you for reporting. I have notified the IT maintenance team to inspect the port today.', DATE_SUB(NOW(), INTERVAL 1 DAY))
      `);
      await db.query(`
        INSERT INTO complaint_history (complaint_id, previous_status, new_status, changed_by_id, changed_at)
        VALUES 
        ('CMP001', NULL, 'Pending', '25USS101', DATE_SUB(NOW(), INTERVAL 2 DAY)),
        ('CMP001', 'Pending', 'Seen', '25abc101', DATE_SUB(NOW(), INTERVAL 2 DAY)),
        ('CMP001', 'Seen', 'In Progress', '25abc101', DATE_SUB(NOW(), INTERVAL 1 DAY)),
        ('CMP001', 'In Progress', 'Resolved', '25abc101', NOW())
      `);

      // CMP002 - In Progress
      await db.query(`
        INSERT INTO complaints (complaint_id, student_id, recipient_id, title, description, status)
        VALUES ('CMP002', '25USS102', '25abc102', 'Lab 2 Workstation #14 OS Boot Failure', 'Workstation 14 throws a disk boot error upon startup during Operating Systems lab.', 'In Progress')
      `);
      await db.query(`
        INSERT INTO messages (complaint_id, sender_id, sender_role, message, created_at)
        VALUES 
        ('CMP002', '25USS102', 'Student', 'Soffi Mam, machine 14 is not booting into Ubuntu for OS lab.', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
        ('CMP002', '25abc102', 'Faculty', 'Noted Aditi. Lab assistant Mr. Joseph is re-imaging the dual-boot partition today.', DATE_SUB(NOW(), INTERVAL 3 HOUR))
      `);
      await db.query(`
        INSERT INTO complaint_history (complaint_id, previous_status, new_status, changed_by_id, changed_at)
        VALUES 
        ('CMP002', NULL, 'Pending', '25USS102', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
        ('CMP002', 'Pending', 'Seen', '25abc102', DATE_SUB(NOW(), INTERVAL 4 HOUR)),
        ('CMP002', 'Seen', 'In Progress', '25abc102', DATE_SUB(NOW(), INTERVAL 3 HOUR))
      `);

      // CMP003 - Seen
      await db.query(`
        INSERT INTO complaints (complaint_id, student_id, recipient_id, title, description, status)
        VALUES ('CMP003', '25USS103', '25abc103', 'Air Conditioner Remote Battery Dead in Seminar Hall', 'The AC remote in Seminar Hall 1 has leaked batteries and cannot be operated.', 'Seen')
      `);
      await db.query(`
        INSERT INTO complaint_history (complaint_id, previous_status, new_status, changed_by_id, changed_at)
        VALUES 
        ('CMP003', NULL, 'Pending', '25USS103', DATE_SUB(NOW(), INTERVAL 1 HOUR)),
        ('CMP003', 'Pending', 'Seen', '25abc103', NOW())
      `);

      // Notification
      await db.query(`
        INSERT INTO notifications (user_id, message, complaint_id, is_read)
        VALUES 
        ('25abc103', 'New complaint [CMP003] filed by Student 25USS103', 'CMP003', FALSE),
        ('25USS101', 'Your complaint [CMP001] has been resolved by Jeno Mam', 'CMP001', FALSE)
      `);

      console.log('✅ Sample complaints CMP001, CMP002, CMP003 created.');
    }

    await db.end();
    console.log('\n🎉 Database initialization and seeding completed successfully!');
  } catch (err) {
    console.error('❌ Error seeding database:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('👉 Please make sure your MySQL server is running (e.g. via MySQL Service, XAMPP MySQL, or Docker) and that the credentials in .env match.');
    }
    process.exit(1);
  }
}

seedDatabase();
