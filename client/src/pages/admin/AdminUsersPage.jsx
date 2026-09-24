import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, UserX, UserCheck, Search, Shield, GraduationCap, Briefcase } from 'lucide-react';

const AdminUsersPage = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' | 'staff'
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      if (res.data.success) {
        setStudents(res.data.data.students);
        setStaff(res.data.data.staff);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user_id, current_status, user_type) => {
    const newStatus = current_status === 'active' ? 'suspended' : 'active';
    const confirmMsg = `Are you sure you want to ${newStatus.toUpperCase()} account ${user_id}? ${
      newStatus === 'suspended' ? 'The user will be immediately blocked from logging in.' : 'The user will regain login access.'
    }`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setUpdatingId(user_id);
      const res = await api.patch(`/admin/users/${user_id}/status`, {
        user_type,
        status: newStatus
      });

      if (res.data.success) {
        if (user_type === 'student') {
          setStudents((prev) =>
            prev.map((s) => (s.student_id === user_id ? { ...s, account_status: newStatus } : s))
          );
        } else {
          setStaff((prev) =>
            prev.map((st) => (st.staff_id === user_id ? { ...st, account_status: newStatus } : st))
          );
        }
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update account status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStudents = students.filter((s) => {
    const term = searchTerm.toLowerCase();
    return s.student_id.toLowerCase().includes(term) || s.name.toLowerCase().includes(term);
  });

  const filteredStaff = staff.filter((st) => {
    const term = searchTerm.toLowerCase();
    return st.staff_id.toLowerCase().includes(term) || st.name.toLowerCase().includes(term) || st.role.toLowerCase().includes(term);
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>User Account Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Inspect account credentials, manage privileges, and activate or suspend access
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('students')}
          className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem' }}
        >
          <GraduationCap size={16} />
          <span>Pre-seeded Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`btn ${activeTab === 'staff' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem' }}
        >
          <Briefcase size={16} />
          <span>Faculty &amp; HOD ({staff.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            className="form-control"
            placeholder={activeTab === 'students' ? 'Search by Student ID (e.g. 25USS101) or Name...' : 'Search by Staff ID (e.g. 25abc101) or Name...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>
      </div>

      {/* Table Area */}
      <div className="table-container">
        {activeTab === 'students' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Full Name</th>
                <th>Access Status</th>
                <th>Registered</th>
                <th style={{ textAlign: 'right' }}>Security Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Loading student accounts...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No students match search criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.student_id}>
                    <td style={{ fontWeight: 600, color: '#4f46e5' }}>{s.student_id}</td>
                    <td style={{ fontWeight: 500, color: '#1e293b' }}>{s.name}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: s.account_status === 'active' ? '#dcfce7' : '#fee2e2',
                          color: s.account_status === 'active' ? '#166534' : '#b91c1c'
                        }}
                      >
                        {s.account_status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(s.student_id, s.account_status, 'student')}
                        disabled={updatingId === s.student_id}
                        className={`btn ${s.account_status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {s.account_status === 'active' ? (
                          <>
                            <UserX size={12} />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={12} />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Notification Alerts</th>
                <th>Access Status</th>
                <th style={{ textAlign: 'right' }}>Security Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Loading staff members...
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No staff match search criteria.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((st) => (
                  <tr key={st.staff_id}>
                    <td style={{ fontWeight: 600, color: '#4f46e5' }}>{st.staff_id}</td>
                    <td style={{ fontWeight: 500, color: '#1e293b' }}>{st.name}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: st.role === 'HOD' ? '#f3e8ff' : '#eff6ff',
                          color: st.role === 'HOD' ? '#6b21a8' : '#1e40af'
                        }}
                      >
                        {st.role}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: st.notifications_enabled ? '#166534' : '#64748b' }}>
                      {st.notifications_enabled ? 'Enabled' : 'Muted'}
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: st.account_status === 'active' ? '#dcfce7' : '#fee2e2',
                          color: st.account_status === 'active' ? '#166534' : '#b91c1c'
                        }}
                      >
                        {st.account_status === 'active' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleStatus(st.staff_id, st.account_status, 'staff')}
                        disabled={updatingId === st.staff_id}
                        className={`btn ${st.account_status === 'active' ? 'btn-danger' : 'btn-success'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {st.account_status === 'active' ? (
                          <>
                            <UserX size={12} />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <UserCheck size={12} />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
