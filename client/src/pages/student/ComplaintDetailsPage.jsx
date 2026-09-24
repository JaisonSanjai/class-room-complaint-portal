import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ChatThread from '../../components/ChatThread';
import { ArrowLeft, CheckCircle2, Lock, Calendar, User, BookOpen } from 'lucide-react';

const ComplaintDetailsPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchComplaintDetails = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading complaint #{id}...</div>;
  }

  if (error || !complaint) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Unable to Access Complaint</h3>
        <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>{error || 'Complaint not found or unauthorized.'}</p>
        <Link to="/student/dashboard" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/student/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Complaints</span>
        </Link>
      </div>

      {/* Prominent Resolution Note Banner (Displayed at the top once Resolved) */}
      {isResolved && complaint.resolution_note && (
        <div className="resolution-banner">
          <div className="icon">
            <CheckCircle2 size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h4>Complaint Resolved &bull; Official Staff Resolution Note</h4>
            <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {complaint.resolution_note}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#15803d' }}>
              <Lock size={12} />
              <span>This grievance is officially concluded and closed. Conversation thread is locked.</span>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Overview Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5' }}>{complaint.complaint_id}</span>
              <StatusBadge status={complaint.status} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>{complaint.title}</h2>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BookOpen size={16} color="#6366f1" />
              <span>Recipient: <strong>{complaint.recipient_name}</strong> ({complaint.recipient_role})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Calendar size={16} color="#6366f1" />
              <span>Filed: {new Date(complaint.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            Description
          </h4>
          <p style={{ color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {complaint.description}
          </p>
        </div>
      </div>

      {/* Two-Way Chat Conversation */}
      <ChatThread
        complaintId={complaint.complaint_id}
        isResolved={isResolved}
        onMessageSent={() => fetchComplaintDetails()}
      />
    </div>
  );
};

export default ComplaintDetailsPage;
