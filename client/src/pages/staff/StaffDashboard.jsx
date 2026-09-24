import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import MetricCard from '../../components/MetricCard';
import { Search, MessageSquare, Bell, BellOff, Clock, Activity, CheckCircle2, FileText } from 'lucide-react';

const StaffDashboard = () => {
  const { user, toggleStaffNotifications } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [toggling, setToggling] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching staff complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleToggleAlerts = async () => {
    try {
      setToggling(true);
      await toggleStaffNotifications();
    } catch (err) {
      alert('Could not update notification preferences.');
    } finally {
      setToggling(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch =
      c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate metrics
  const totalAssigned = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const seenCount = complaints.filter((c) => c.status === 'Seen').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Replied').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div>
      {/* Header & Notification Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            {user?.role === 'HOD' ? 'HOD Grievance Desk' : 'Faculty Grievance Desk'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Complaints explicitly directed to {user?.name} ({user?.role})
          </p>
        </div>

        {/* In-App Notifications Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#ffffff', padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: '0.8rem', color: '#475569' }}>
            In-App Alerts: <strong>{user?.notifications_enabled ? 'Active' : 'Muted'}</strong>
          </div>
          <button
            onClick={handleToggleAlerts}
            disabled={toggling}
            className={`btn ${user?.notifications_enabled ? 'btn-secondary' : 'btn-primary'}`}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            {user?.notifications_enabled ? <BellOff size={14} /> : <Bell size={14} />}
            <span>{user?.notifications_enabled ? 'Turn OFF' : 'Turn ON'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Assigned"
          value={totalAssigned}
          icon={<FileText size={22} />}
          iconBg="#eef2ff"
          iconColor="#4f46e5"
        />
        <MetricCard
          title="Pending (Unseen)"
          value={pendingCount}
          icon={<Clock size={22} />}
          iconBg="#fef9c3"
          iconColor="#854d0e"
        />
        <MetricCard
          title="In Progress / Replied"
          value={inProgressCount}
          icon={<Activity size={22} />}
          iconBg="#ffedd5"
          iconColor="#9a3412"
        />
        <MetricCard
          title="Resolved"
          value={resolvedCount}
          icon={<CheckCircle2 size={22} />}
          iconBg="#dcfce7"
          iconColor="#166534"
        />
      </div>

      {/* Filters and Search */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '240px' }}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by ID, Student Name, Roll No, or Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '0.4rem 0' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Filter:</span>
            {['All', 'Pending', 'Seen', 'In Progress', 'Replied', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.75rem',
                  borderRadius: '9999px',
                  fontWeight: 500,
                  backgroundColor: statusFilter === st ? '#4f46e5' : '#f1f5f9',
                  color: statusFilter === st ? '#ffffff' : '#475569'
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Title</th>
              <th>Status</th>
              <th>Date Assigned</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Loading assigned complaints...
                </td>
              </tr>
            ) : filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  {searchTerm || statusFilter !== 'All' 
                    ? 'No complaints match the filter query.' 
                    : 'No complaints currently assigned to you.'}
                </td>
              </tr>
            ) : (
              filteredComplaints.map((c) => (
                <tr key={c.complaint_id}>
                  <td style={{ fontWeight: 600, color: '#4f46e5' }}>{c.complaint_id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.student_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.student_id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '360px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description}
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/staff/complaints/${c.complaint_id}`}
                      className="btn btn-primary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      <MessageSquare size={14} />
                      <span>Respond &amp; Manage</span>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffDashboard;
