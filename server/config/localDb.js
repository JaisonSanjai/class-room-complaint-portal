const bcrypt = require('bcryptjs');

// Pre-seeded Student names
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

// Initialize in-memory tables
const data = {
  admins: [
    {
      admin_id: 'admin',
      name: 'System Administrator',
      password_hash: bcrypt.hashSync('admin123', 10),
      created_at: new Date()
    }
  ],
  staff: [
    { staff_id: '25abc101', name: 'Jeno Mam', role: 'HOD', password_hash: bcrypt.hashSync('101', 10), notifications_enabled: true, account_status: 'active', created_at: new Date() },
    { staff_id: '25abc102', name: 'Soffi Mam', role: 'Faculty', password_hash: bcrypt.hashSync('102', 10), notifications_enabled: true, account_status: 'active', created_at: new Date() },
    { staff_id: '25abc103', name: 'Jaine Sir', role: 'Faculty', password_hash: bcrypt.hashSync('103', 10), notifications_enabled: true, account_status: 'active', created_at: new Date() },
    { staff_id: '25abc104', name: 'Banumathi Mam', role: 'Faculty', password_hash: bcrypt.hashSync('104', 10), notifications_enabled: true, account_status: 'active', created_at: new Date() },
    { staff_id: '25abc105', name: 'Julli Mam', role: 'Faculty', password_hash: bcrypt.hashSync('105', 10), notifications_enabled: true, account_status: 'active', created_at: new Date() },
    { staff_id: '25abc106', name: 'Joiel Sir', role: 'Faculty', password_hash: bcrypt.hashSync('106', 10), notifications_enabled: true, account_status: 'active', created_at: new Date() }
  ],
  students: [],
  complaints: [
    {
      complaint_id: 'CMP001',
      student_id: '25USS101',
      recipient_id: '25abc101',
      title: 'Broken Projector in Room 304',
      description: 'The HDMI connection flickers constantly during morning CS lectures.',
      status: 'Resolved',
      resolution_note: 'Projector HDMI splitter replaced by the technical team. Audio-visual functionality verified.',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      updated_at: new Date()
    },
    {
      complaint_id: 'CMP002',
      student_id: '25USS102',
      recipient_id: '25abc102',
      title: 'Lab 2 Workstation #14 OS Boot Failure',
      description: 'Workstation 14 throws a disk boot error upon startup during Operating Systems lab.',
      status: 'In Progress',
      resolution_note: null,
      created_at: new Date(Date.now() - 5 * 3600 * 1000),
      updated_at: new Date()
    },
    {
      complaint_id: 'CMP003',
      student_id: '25USS103',
      recipient_id: '25abc103',
      title: 'Air Conditioner Remote Battery Dead in Seminar Hall',
      description: 'The AC remote in Seminar Hall 1 has leaked batteries and cannot be operated.',
      status: 'Seen',
      resolution_note: null,
      created_at: new Date(Date.now() - 3600 * 1000),
      updated_at: new Date()
    }
  ],
  messages: [
    {
      message_id: 1,
      complaint_id: 'CMP001',
      sender_id: '25USS101',
      sender_role: 'Student',
      message: 'Respected HOD Mam, the projector in Room 304 is flickering and makes it difficult to follow slides.',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000)
    },
    {
      message_id: 2,
      complaint_id: 'CMP001',
      sender_id: '25abc101',
      sender_role: 'HOD',
      message: 'Thank you for reporting. I have notified the IT maintenance team to inspect the port today.',
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000)
    },
    {
      message_id: 3,
      complaint_id: 'CMP002',
      sender_id: '25USS102',
      sender_role: 'Student',
      message: 'Soffi Mam, machine 14 is not booting into Ubuntu for OS lab.',
      created_at: new Date(Date.now() - 5 * 3600 * 1000)
    },
    {
      message_id: 4,
      complaint_id: 'CMP002',
      sender_id: '25abc102',
      sender_role: 'Faculty',
      message: 'Noted Aditi. Lab assistant Mr. Joseph is re-imaging the dual-boot partition today.',
      created_at: new Date(Date.now() - 3 * 3600 * 1000)
    }
  ],
  notifications: [
    {
      notification_id: 1,
      user_id: '25abc103',
      message: 'New complaint [CMP003] filed by Student 25USS103',
      complaint_id: 'CMP003',
      is_read: false,
      created_at: new Date(Date.now() - 3600 * 1000)
    },
    {
      notification_id: 2,
      user_id: '25USS101',
      message: 'Your complaint [CMP001] has been resolved by Jeno Mam',
      complaint_id: 'CMP001',
      is_read: false,
      created_at: new Date()
    }
  ],
  complaint_history: [
    { history_id: 1, complaint_id: 'CMP001', previous_status: null, new_status: 'Pending', changed_by_id: '25USS101', changed_at: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
    { history_id: 2, complaint_id: 'CMP001', previous_status: 'Pending', new_status: 'Seen', changed_by_id: '25abc101', changed_at: new Date(Date.now() - 2 * 24 * 3600 * 1000) },
    { history_id: 3, complaint_id: 'CMP001', previous_status: 'Seen', new_status: 'In Progress', changed_by_id: '25abc101', changed_at: new Date(Date.now() - 24 * 3600 * 1000) },
    { history_id: 4, complaint_id: 'CMP001', previous_status: 'In Progress', new_status: 'Resolved', changed_by_id: '25abc101', changed_at: new Date() },
    { history_id: 5, complaint_id: 'CMP002', previous_status: null, new_status: 'Pending', changed_by_id: '25USS102', changed_at: new Date(Date.now() - 5 * 3600 * 1000) },
    { history_id: 6, complaint_id: 'CMP002', previous_status: 'Pending', new_status: 'Seen', changed_by_id: '25abc102', changed_at: new Date(Date.now() - 4 * 3600 * 1000) },
    { history_id: 7, complaint_id: 'CMP002', previous_status: 'Seen', new_status: 'In Progress', changed_by_id: '25abc102', changed_at: new Date(Date.now() - 3 * 3600 * 1000) },
    { history_id: 8, complaint_id: 'CMP003', previous_status: null, new_status: 'Pending', changed_by_id: '25USS103', changed_at: new Date(Date.now() - 3600 * 1000) },
    { history_id: 9, complaint_id: 'CMP003', previous_status: 'Pending', new_status: 'Seen', changed_by_id: '25abc103', changed_at: new Date() }
  ]
};

// Seed 57 students (25USS101 to 25USS157)
for (let i = 101; i <= 157; i++) {
  const studentId = `25USS${i}`;
  const password = `${i}`;
  const name = studentNames[i - 101] || `Student ${i}`;
  data.students.push({
    student_id: studentId,
    name,
    password_hash: bcrypt.hashSync(password, 10),
    account_status: 'active',
    created_at: new Date()
  });
}

let messageCounter = 5;
let notifCounter = 3;
let historyCounter = 10;

class LocalDatabase {
  async query(sql, params = []) {
    const trimmed = sql.trim().replace(/\s+/g, ' ');

    // 1. SELECT student_id, name, password_hash, account_status FROM students WHERE student_id = ?
    if (/SELECT .* FROM students WHERE student_id = \?/i.test(trimmed)) {
      const student = data.students.find(s => s.student_id === params[0]);
      return [student ? [student] : [], []];
    }

    // 2. SELECT staff_id, name, role, password_hash, notifications_enabled, account_status FROM staff WHERE staff_id = ? AND role = ?
    if (/SELECT .* FROM staff WHERE staff_id = \? AND role = \?/i.test(trimmed)) {
      const member = data.staff.find(s => s.staff_id === params[0] && s.role === params[1]);
      return [member ? [member] : [], []];
    }

    // 3. SELECT staff_id, name, role, account_status, notifications_enabled FROM staff WHERE staff_id = ?
    if (/SELECT .* FROM staff WHERE staff_id = \?/i.test(trimmed)) {
      const member = data.staff.find(s => s.staff_id === params[0]);
      return [member ? [member] : [], []];
    }

    // 4. SELECT admin_id, name, password_hash FROM admins WHERE admin_id = ?
    if (/SELECT .* FROM admins WHERE admin_id = \?/i.test(trimmed)) {
      const admin = data.admins.find(a => a.admin_id === params[0]);
      return [admin ? [admin] : [], []];
    }

    // 5. Staff list (SELECT staff_id, name, role, notifications_enabled FROM staff WHERE account_status = "active" ...)
    if (/SELECT staff_id, name, role.* FROM staff WHERE account_status = "active"/i.test(trimmed)) {
      let result = data.staff.filter(s => s.account_status === 'active');
      if (params.length > 0) {
        result = result.filter(s => s.role === params[0]);
      }
      return [result, []];
    }

    // 6. Toggle notifications (UPDATE staff SET notifications_enabled = ? WHERE staff_id = ?)
    if (/UPDATE staff SET notifications_enabled = \? WHERE staff_id = \?/i.test(trimmed)) {
      const member = data.staff.find(s => s.staff_id === params[1]);
      if (member) member.notifications_enabled = params[0];
      return [{ affectedRows: member ? 1 : 0 }, []];
    }

    // 7. Get max complaint ID (SELECT complaint_id FROM complaints ORDER BY CAST...)
    if (/SELECT complaint_id FROM complaints ORDER BY/i.test(trimmed)) {
      const sorted = [...data.complaints].sort((a, b) => {
        const numA = parseInt(a.complaint_id.replace('CMP', ''), 10) || 0;
        const numB = parseInt(b.complaint_id.replace('CMP', ''), 10) || 0;
        return numB - numA;
      });
      return [sorted.slice(0, 1), []];
    }

    // 8. INSERT INTO complaints
    if (/INSERT INTO complaints/i.test(trimmed)) {
      const [complaint_id, student_id, recipient_id, title, description] = params;
      const newComplaint = {
        complaint_id,
        student_id,
        recipient_id,
        title,
        description,
        status: 'Pending',
        resolution_note: null,
        created_at: new Date(),
        updated_at: new Date()
      };
      data.complaints.unshift(newComplaint);
      return [{ insertId: complaint_id, affectedRows: 1 }, []];
    }

    // 9. INSERT INTO complaint_history
    if (/INSERT INTO complaint_history/i.test(trimmed)) {
      const [complaint_id, previous_status, new_status, changed_by_id] = params;
      data.complaint_history.unshift({
        history_id: historyCounter++,
        complaint_id,
        previous_status,
        new_status,
        changed_by_id,
        changed_at: new Date()
      });
      return [{ insertId: historyCounter, affectedRows: 1 }, []];
    }

    // 10. INSERT INTO notifications
    if (/INSERT INTO notifications/i.test(trimmed)) {
      const [user_id, message, complaint_id] = params;
      data.notifications.unshift({
        notification_id: notifCounter++,
        user_id,
        message,
        complaint_id,
        is_read: false,
        created_at: new Date()
      });
      return [{ insertId: notifCounter, affectedRows: 1 }, []];
    }

    // 11. SELECT complaints list with JOINs
    if (/SELECT .* FROM complaints c.*LEFT JOIN students/i.test(trimmed)) {
      let results = data.complaints.map(c => {
        const student = data.students.find(s => s.student_id === c.student_id);
        const recipient = data.staff.find(st => st.staff_id === c.recipient_id);
        return {
          complaint_id: c.complaint_id,
          student_id: c.student_id,
          student_name: student ? student.name : c.student_id,
          recipient_id: c.recipient_id,
          recipient_name: recipient ? recipient.name : c.recipient_id,
          recipient_role: recipient ? recipient.role : 'Staff',
          title: c.title,
          description: c.description,
          status: c.status,
          resolution_note: c.resolution_note,
          created_at: c.created_at,
          updated_at: c.updated_at
        };
      });

      // Filter by single complaint_id (WHERE c.complaint_id = ?)
      if (/WHERE c\.complaint_id = \?/i.test(trimmed)) {
        results = results.filter(c => c.complaint_id === params[0]);
        return [results, []];
      }

      // Check role filtering
      if (params.length > 0) {
        let pIndex = 0;
        if (/c\.student_id = \?/i.test(trimmed)) {
          results = results.filter(c => c.student_id === params[pIndex++]);
        } else if (/c\.recipient_id = \?/i.test(trimmed)) {
          results = results.filter(c => c.recipient_id === params[pIndex++]);
        }

        if (/c\.status = \?/i.test(trimmed)) {
          results = results.filter(c => c.status === params[pIndex++]);
        }

        if (/c\.complaint_id LIKE \?/i.test(trimmed)) {
          const rawSearch = params[pIndex] ? params[pIndex].replace(/%/g, '').toLowerCase() : '';
          results = results.filter(c => 
            c.complaint_id.toLowerCase().includes(rawSearch) ||
            c.title.toLowerCase().includes(rawSearch) ||
            c.description.toLowerCase().includes(rawSearch) ||
            c.student_name.toLowerCase().includes(rawSearch) ||
            c.recipient_name.toLowerCase().includes(rawSearch)
          );
        }
      }

      // Sort by created_at DESC
      results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [results, []];
    }

    // 12. Single complaint by ID (SELECT complaint_id, student_id, recipient_id, status FROM complaints WHERE complaint_id = ?)
    if (/SELECT complaint_id, student_id, recipient_id, status FROM complaints WHERE complaint_id = \?/i.test(trimmed)) {
      const c = data.complaints.find(comp => comp.complaint_id === params[0]);
      return [c ? [c] : [], []];
    }

    // 13. UPDATE complaints SET status = "Seen" WHERE complaint_id = ?
    if (/UPDATE complaints SET status = "Seen" WHERE complaint_id = \?/i.test(trimmed)) {
      const c = data.complaints.find(comp => comp.complaint_id === params[0]);
      if (c) c.status = 'Seen';
      return [{ affectedRows: c ? 1 : 0 }, []];
    }

    // 14. UPDATE complaints SET status = "Replied" WHERE complaint_id = ?
    if (/UPDATE complaints SET status = "Replied" WHERE complaint_id = \?/i.test(trimmed)) {
      const c = data.complaints.find(comp => comp.complaint_id === params[0]);
      if (c) c.status = 'Replied';
      return [{ affectedRows: c ? 1 : 0 }, []];
    }

    // 15. UPDATE complaints SET status = ?, resolution_note = ? WHERE complaint_id = ?
    if (/UPDATE complaints SET status = \?, resolution_note = \? WHERE complaint_id = \?/i.test(trimmed)) {
      const c = data.complaints.find(comp => comp.complaint_id === params[2]);
      if (c) {
        c.status = params[0];
        c.resolution_note = params[1];
      }
      return [{ affectedRows: c ? 1 : 0 }, []];
    }

    // 16. UPDATE complaints SET status = ? WHERE complaint_id = ?
    if (/UPDATE complaints SET status = \? WHERE complaint_id = \?/i.test(trimmed)) {
      const c = data.complaints.find(comp => comp.complaint_id === params[1]);
      if (c) c.status = params[0];
      return [{ affectedRows: c ? 1 : 0 }, []];
    }

    // 17. GET messages for complaint
    if (/SELECT .* FROM messages m WHERE m\.complaint_id = \?/i.test(trimmed)) {
      const msgs = data.messages
        .filter(m => m.complaint_id === params[0])
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        .map(m => {
          let sender_name = m.sender_id;
          if (m.sender_role === 'Student') {
            const st = data.students.find(s => s.student_id === m.sender_id);
            if (st) sender_name = st.name;
          } else if (['Faculty', 'HOD'].includes(m.sender_role)) {
            const sf = data.staff.find(s => s.staff_id === m.sender_id);
            if (sf) sender_name = sf.name;
          } else if (m.sender_role === 'Admin') {
            sender_name = 'System Administrator';
          }
          return { ...m, sender_name };
        });
      return [msgs, []];
    }

    // 18. INSERT INTO messages
    if (/INSERT INTO messages/i.test(trimmed)) {
      const [complaint_id, sender_id, sender_role, message] = params;
      const newMsg = {
        message_id: messageCounter++,
        complaint_id,
        sender_id,
        sender_role,
        message,
        created_at: new Date()
      };
      data.messages.push(newMsg);
      return [{ insertId: newMsg.message_id, affectedRows: 1 }, []];
    }

    // 19. Complaint joined details for messaging
    if (/SELECT c\.complaint_id, c\.student_id, c\.recipient_id, c\.status, st\.notifications_enabled/i.test(trimmed)) {
      const c = data.complaints.find(comp => comp.complaint_id === params[0]);
      if (!c) return [[], []];
      const student = data.students.find(s => s.student_id === c.student_id);
      const recipient = data.staff.find(st => st.staff_id === c.recipient_id);
      return [[{
        complaint_id: c.complaint_id,
        student_id: c.student_id,
        recipient_id: c.recipient_id,
        status: c.status,
        notifications_enabled: recipient ? recipient.notifications_enabled : true,
        recipient_name: recipient ? recipient.name : c.recipient_id,
        student_name: student ? student.name : c.student_id
      }], []];
    }

    // 20. Notifications for user
    if (/SELECT notification_id, user_id, message, complaint_id, is_read, created_at FROM notifications WHERE user_id = \?/i.test(trimmed)) {
      const notifs = data.notifications
        .filter(n => n.user_id === params[0])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [notifs, []];
    }

    // 21. Mark notification as read
    if (/UPDATE notifications SET is_read = TRUE WHERE notification_id = \? AND user_id = \?/i.test(trimmed)) {
      const n = data.notifications.find(notif => notif.notification_id == params[0] && notif.user_id === params[1]);
      if (n) n.is_read = true;
      return [{ affectedRows: n ? 1 : 0 }, []];
    }
    if (/UPDATE notifications SET is_read = TRUE WHERE user_id = \?/i.test(trimmed)) {
      data.notifications.filter(notif => notif.user_id === params[0]).forEach(n => n.is_read = true);
      return [{ affectedRows: 1 }, []];
    }

    // 22. General COUNT queries
    if (/SELECT COUNT\(\*\).*FROM students/i.test(trimmed)) {
      return [[{ total_students: data.students.length, count: data.students.length }], []];
    }
    if (/SELECT COUNT\(\*\).*FROM staff WHERE role = "Faculty"/i.test(trimmed)) {
      const cnt = data.staff.filter(s => s.role === 'Faculty').length;
      return [[{ total_faculty: cnt, count: cnt }], []];
    }
    if (/SELECT COUNT\(\*\).*FROM staff WHERE role = "HOD"/i.test(trimmed)) {
      const cnt = data.staff.filter(s => s.role === 'HOD').length;
      return [[{ total_hod: cnt, count: cnt }], []];
    }
    if (/SELECT COUNT\(\*\).*FROM staff/i.test(trimmed)) {
      return [[{ total_staff: data.staff.length, count: data.staff.length }], []];
    }
    if (/SELECT COUNT\(\*\).*FROM complaints/i.test(trimmed)) {
      return [[{ count: data.complaints.length, total: data.complaints.length }], []];
    }
    if (/SELECT status, COUNT\(\*\) AS count FROM complaints GROUP BY status/i.test(trimmed)) {
      const counts = {};
      data.complaints.forEach(c => {
        counts[c.status] = (counts[c.status] || 0) + 1;
      });
      const rows = Object.entries(counts).map(([status, count]) => ({ status, count }));
      return [rows, []];
    }
    if (/SELECT c\.complaint_id, c\.title, c\.status, c\.created_at, s\.name AS student_name/i.test(trimmed)) {
      const recent = data.complaints.slice(0, 5).map(c => {
        const student = data.students.find(s => s.student_id === c.student_id);
        const recipient = data.staff.find(st => st.staff_id === c.recipient_id);
        return {
          complaint_id: c.complaint_id,
          title: c.title,
          status: c.status,
          created_at: c.created_at,
          student_name: student ? student.name : c.student_id,
          recipient_name: recipient ? recipient.name : c.recipient_id
        };
      });
      return [recent, []];
    }

    // 23. Admin Users
    if (/SELECT student_id, name, account_status, created_at FROM students/i.test(trimmed)) {
      let list = [...data.students];
      if (params.length > 0) {
        const search = params[0].replace(/%/g, '').toLowerCase();
        list = list.filter(s => s.student_id.toLowerCase().includes(search) || s.name.toLowerCase().includes(search));
      }
      return [list, []];
    }
    if (/SELECT staff_id, name, role, notifications_enabled, account_status, created_at FROM staff/i.test(trimmed)) {
      let list = [...data.staff];
      if (params.length > 0) {
        const search = params[0].replace(/%/g, '').toLowerCase();
        list = list.filter(st => st.staff_id.toLowerCase().includes(search) || st.name.toLowerCase().includes(search));
      }
      return [list, []];
    }

    // 24. Toggle User Status
    if (/UPDATE students SET account_status = \? WHERE student_id = \?/i.test(trimmed)) {
      const s = data.students.find(stud => stud.student_id === params[1]);
      if (s) s.account_status = params[0];
      return [{ affectedRows: s ? 1 : 0 }, []];
    }
    if (/UPDATE staff SET account_status = \? WHERE staff_id = \?/i.test(trimmed)) {
      const st = data.staff.find(staff => staff.staff_id === params[1]);
      if (st) st.account_status = params[0];
      return [{ affectedRows: st ? 1 : 0 }, []];
    }

    // 25. Audit Logs
    if (/SELECT ch\.history_id, ch\.complaint_id, ch\.previous_status/i.test(trimmed)) {
      let list = data.complaint_history.map(ch => {
        const c = data.complaints.find(comp => comp.complaint_id === ch.complaint_id);
        let changed_by_name = ch.changed_by_id;
        if (ch.changed_by_id === 'admin') changed_by_name = 'System Administrator';
        else if (ch.changed_by_id.startsWith('25USS')) {
          const s = data.students.find(stud => stud.student_id === ch.changed_by_id);
          if (s) changed_by_name = s.name;
        } else if (ch.changed_by_id.startsWith('25abc')) {
          const st = data.staff.find(staff => staff.staff_id === ch.changed_by_id);
          if (st) changed_by_name = st.name;
        }

        return {
          history_id: ch.history_id,
          complaint_id: ch.complaint_id,
          previous_status: ch.previous_status,
          new_status: ch.new_status,
          changed_by_id: ch.changed_by_id,
          changed_at: ch.changed_at,
          complaint_title: c ? c.title : 'Complaint',
          changed_by_name
        };
      });

      if (/ch\.complaint_id = \?/i.test(trimmed)) {
        list = list.filter(item => item.complaint_id === params[0]);
      }
      return [list, []];
    }

    // 26. System Notifications
    if (/SELECT n\.notification_id, n\.user_id, n\.message, n\.complaint_id/i.test(trimmed)) {
      const list = data.notifications.map(n => {
        let user_name = n.user_id;
        if (n.user_id.startsWith('25USS')) {
          const s = data.students.find(stud => stud.student_id === n.user_id);
          if (s) user_name = s.name;
        } else if (n.user_id.startsWith('25abc')) {
          const st = data.staff.find(staff => staff.staff_id === n.user_id);
          if (st) user_name = st.name;
        }
        return {
          notification_id: n.notification_id,
          user_id: n.user_id,
          message: n.message,
          complaint_id: n.complaint_id,
          is_read: n.is_read,
          created_at: n.created_at,
          user_name
        };
      });
      return [list, []];
    }

    // Default catch-all
    return [[], []];
  }

  async getConnection() {
    return {
      query: (sql, params) => this.query(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
}

const localDb = new LocalDatabase();
module.exports = localDb;
