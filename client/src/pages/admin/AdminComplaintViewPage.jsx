import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ChatThread from '../../components/ChatThread';
import { ArrowLeft, CheckCircle2, Lock, Calendar, User, BookOpen, ShieldCheck, History, ArrowRight } from 'lucide-react';

const AdminComplaintViewPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [complaintRes, historyRes] = await Promise.all([
          api.get(`/complaints/${id}`),
          api.get(`/admin/audit-logs?complaint_id=${id}`)
        ]);

        if (complaintRes.data.success) {
          setComplaint(complaintRes.data.data);
        }
        if (historyRes.data.success) {
          setHistory(historyRes.data.data);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Could not load complaint trail.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading complaint audit view...</div>;
  }

  if (error || !complaint) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Inspection Error</h3>
        <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>{error || 'Complaint not found.'}</p>
        <Link to="/admin/complaints" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Complaints Directory</span>
        </Link>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved';

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/admin/complaints" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to All Complaints</span>
        </Link>
      </div>

      {/* Admin Notice */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        fontSize: '0.825rem',
        color: '#475569'
      }}>
        <ShieldCheck size={20} color="#4f46e5" style={{ flexShrink: 0 }} />
        <div>
          <strong>Administrator Audit Mode:</strong> You are viewing this complaint and its conversation with read-only audit permissions. Senders and recipients are immutable.
        </div>
      </div>

      {/* Prominent Resolution Note Banner if Resolved */}
      {isResolved && complaint.resolution_note && (
        <div className="resolution-banner">
          <div className="icon">
            <CheckCircle2 size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h4>Complaint Resolved &bull; Mandatory Resolution Note Recorded</h4>
            <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {complaint.resolution_note}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#15803d' }}>
              <Lock size={12} />
              <span>Grievance concluded. Thread locked permanently.</span>
            </div>
          </div>
        </div>
      )}

      {/* Overview Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5' }}>{complaint.complaint_id}</span>
              <StatusBadge status={complaint.status} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>{complaint.title}</h2>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.825rem', color: '#64748b', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <User size={16} color="#6366f1" />
              <span>Student: <strong>{complaint.student_name}</strong> ({complaint.student_id})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookOpen size={16} color="#6366f1" />
              <span>Staff Recipient: <strong>{complaint.recipient_name}</strong> ({complaint.recipient_role})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={16} color="#6366f1" />
              <span>Filed: {new Date(complaint.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            Complaint Description
          </h4>
          <p style={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {complaint.description}
          </p>
        </div>
      </div>

      {/* Two-Way Chat Conversation */}
      <div style={{ marginBottom: '1.5rem' }}>
        <ChatThread
          complaintId={complaint.complaint_id}
          isResolved={isResolved}
        />
      </div>

      {/* Status History Trail */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="#6366f1" />
            <h3 className="card-title">Complaint Status Change History Log</h3>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Transition</th>
                <th>Changed By</th>
                <th>User ID</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8' }}>
                    No recorded status transitions.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr key={h.history_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {h.previous_status ? <StatusBadge status={h.previous_status} /> : <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Initial</span>}
                        <ArrowRight size={12} color="#94a3b8" />
                        <StatusBadge status={h.new_status} />
                      </div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{h.changed_by_name}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{h.changed_by_id}</td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(h.changed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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

export default AdminComplaintViewPage;
