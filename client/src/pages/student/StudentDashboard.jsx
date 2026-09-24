import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import MetricCard from '../../components/MetricCard';
import { PlusCircle, Search, MessageSquare, AlertCircle, FileText, CheckCircle2, Clock } from 'lucide-react';

const StudentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesSearch =
      c.complaint_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.recipient_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate metrics
  const totalFiled = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending' || c.status === 'Seen').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress' || c.status === 'Replied').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div>
      {/* Top action bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>My Filed Complaints</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Track resolution status and chat directly with assigned faculty or HOD
          </p>
        </div>
        <Link to="/student/new-complaint" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>File New Complaint</span>
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          title="Total Filed"
          value={totalFiled}
          icon={<FileText size={22} />}
          iconBg="#eef2ff"
          iconColor="#4f46e5"
        />
        <MetricCard
          title="Awaiting Response"
          value={pendingCount}
          icon={<Clock size={22} />}
          iconBg="#fef9c3"
          iconColor="#854d0e"
        />
        <MetricCard
          title="Active Discussion"
          value={inProgressCount}
          icon={<MessageSquare size={22} />}
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

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '240px' }}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by ID (e.g. CMP001), Title, or Recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '0.4rem 0' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Filter Status:</span>
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
              <th>Title</th>
              <th>Recipient</th>
              <th>Status</th>
              <th>Date Filed</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Loading complaints...
                </td>
              </tr>
            ) : filteredComplaints.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  {searchTerm || statusFilter !== 'All' 
                    ? 'No complaints match your filters.' 
                    : 'You have not filed any complaints yet. Click "File New Complaint" to begin.'}
                </td>
              </tr>
            ) : (
              filteredComplaints.map((c) => (
                <tr key={c.complaint_id}>
                  <td style={{ fontWeight: 600, color: '#4f46e5' }}>{c.complaint_id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.description}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.recipient_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.recipient_role}</div>
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Link
                      to={`/student/complaints/${c.complaint_id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      <MessageSquare size={14} />
                      <span>View &amp; Chat</span>
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

export default StudentDashboard;
