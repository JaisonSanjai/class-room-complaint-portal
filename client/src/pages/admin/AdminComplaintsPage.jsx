import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { Search, Eye, Filter, ArrowUpDown } from 'lucide-react';

const AdminComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filtered = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      c.complaint_id.toLowerCase().includes(term) ||
      c.title.toLowerCase().includes(term) ||
      c.student_name?.toLowerCase().includes(term) ||
      c.student_id?.toLowerCase().includes(term) ||
      c.recipient_name?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Department Grievance Directory</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Full system-wide visibility across all student submissions and staff assignments
          </p>
        </div>
      </div>

      {/* Filter and Search Box */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '260px' }}>
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              className="form-control"
              placeholder="Search by ID, title, student name, roll number, or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', padding: '0.4rem 0' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Status:</span>
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

      {/* Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student Details</th>
              <th>Assigned Recipient</th>
              <th>Title &amp; Summary</th>
              <th>Status</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Audit Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  Loading all department complaints...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No complaints found matching criteria.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.complaint_id}>
                  <td style={{ fontWeight: 600, color: '#4f46e5' }}>{c.complaint_id}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.student_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.student_id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.recipient_name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.recipient_role} ({c.recipient_id})</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{c.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                      to={`/admin/complaints/${c.complaint_id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={13} />
                      <span>Inspect Trail</span>
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

export default AdminComplaintsPage;
