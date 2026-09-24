import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import MetricCard from '../../components/MetricCard';
import StatusBadge from '../../components/StatusBadge';
import { 
  Users, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Clock, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading administrative analytics...</div>;
  }

  const {
    total_students = 0,
    total_staff = 0,
    total_faculty = 0,
    total_hod = 0,
    total_complaints = 0,
    status_counts = {},
    recent_complaints = []
  } = stats || {};

  return (
    <div>
      {/* Title & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Department Administrative Dashboard</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            System-wide statistics, audit tracking, and complaint management
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/complaints" className="btn btn-secondary">
            <span>View All Complaints</span>
          </Link>
          <Link to="/admin/users" className="btn btn-primary">
            <span>Manage Accounts</span>
          </Link>
        </div>
      </div>

      {/* Top Core Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Students"
          value={total_students}
          icon={<GraduationCap size={22} />}
          iconBg="#eef2ff"
          iconColor="#4f46e5"
        />
        <MetricCard
          title="Staff &amp; Faculty"
          value={total_staff}
          icon={<Briefcase size={22} />}
          iconBg="#f3e8ff"
          iconColor="#7c3aed"
        />
        <MetricCard
          title="Total Complaints"
          value={total_complaints}
          icon={<FileText size={22} />}
          iconBg="#e0f2fe"
          iconColor="#0284c7"
        />
        <MetricCard
          title="Audit Trail Logs"
          value="100% Active"
          icon={<ShieldCheck size={22} />}
          iconBg="#dcfce7"
          iconColor="#166534"
        />
      </div>

      {/* Status Breakdown Section */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <h3 className="card-title">Complaint Status Distribution</h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Across all students &amp; staff</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', background: '#fef9c3', borderRadius: '8px', border: '1px solid #fde047' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#854d0e', textTransform: 'uppercase' }}>Pending</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#854d0e', marginTop: '0.25rem' }}>
              {status_counts['Pending'] || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a16207', marginTop: '0.25rem' }}>Awaiting first view</div>
          </div>

          <div style={{ padding: '1rem', background: '#f3e8ff', borderRadius: '8px', border: '1px solid #d8b4fe' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b21a8', textTransform: 'uppercase' }}>Seen</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#6b21a8', marginTop: '0.25rem' }}>
              {status_counts['Seen'] || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7e22ce', marginTop: '0.25rem' }}>Viewed by recipient</div>
          </div>

          <div style={{ padding: '1rem', background: '#ffedd5', borderRadius: '8px', border: '1px solid #fed7aa' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9a3412', textTransform: 'uppercase' }}>In Progress</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#9a3412', marginTop: '0.25rem' }}>
              {status_counts['In Progress'] || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#c2410c', marginTop: '0.25rem' }}>Active remedial action</div>
          </div>

          <div style={{ padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1e40af', textTransform: 'uppercase' }}>Replied</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e40af', marginTop: '0.25rem' }}>
              {status_counts['Replied'] || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#1d4ed8', marginTop: '0.25rem' }}>Staff response sent</div>
          </div>

          <div style={{ padding: '1rem', background: '#dcfce7', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#166534', textTransform: 'uppercase' }}>Resolved</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#166534', marginTop: '0.25rem' }}>
              {status_counts['Resolved'] || 0}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '0.25rem' }}>Locked with note</div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Complaint Submissions</h3>
          <Link to="/admin/complaints" style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Student</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Audit</th>
              </tr>
            </thead>
            <tbody>
              {recent_complaints.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No complaints registered in the system yet.
                  </td>
                </tr>
              ) : (
                recent_complaints.map((c) => (
                  <tr key={c.complaint_id}>
                    <td style={{ fontWeight: 600, color: '#4f46e5' }}>{c.complaint_id}</td>
                    <td style={{ fontWeight: 500, color: '#1e293b' }}>{c.title}</td>
                    <td>{c.student_name}</td>
                    <td>{c.recipient_name}</td>
                    <td><StatusBadge status={c.status} /></td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/admin/complaints/${c.complaint_id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
