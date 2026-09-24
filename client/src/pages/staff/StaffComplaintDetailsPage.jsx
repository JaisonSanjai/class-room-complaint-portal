import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ChatThread from '../../components/ChatThread';
import ResolutionModal from '../../components/ResolutionModal';
import { ArrowLeft, CheckCircle2, Lock, Calendar, User, Activity, AlertCircle } from 'lucide-react';

const StaffComplaintDetailsPage = () => {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchComplaintDetails = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      if (res.data.success) {
        setComplaint(res.data.data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not access complaint.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  const handleStatusChange = async (newStatus, resolutionNote = null) => {
    try {
      setUpdatingStatus(true);
      const payload = { status: newStatus };
      if (resolutionNote) {
        payload.resolution_note = resolutionNote;
      }

      const res = await api.patch(`/complaints/${id}/status`, payload);
      if (res.data.success) {
        setIsModalOpen(false);
        await fetchComplaintDetails();
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading complaint #{id}...</div>;
  }

  if (error || !complaint) {
    return (
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center' }}>
        <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Access Restricted</h3>
        <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>{error || 'Complaint not found.'}</p>
        <Link to="/staff/dashboard" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Return to Staff Dashboard</span>
        </Link>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved';

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/staff/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Assigned Complaints</span>
        </Link>
      </div>

      {/* Prominent Resolution Banner */}
      {isResolved && complaint.resolution_note && (
        <div className="resolution-banner">
          <div className="icon">
            <CheckCircle2 size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h4>Resolved Grievance &bull; Mandatory Resolution Note Recorded</h4>
            <p style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {complaint.resolution_note}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.75rem', color: '#15803d' }}>
              <Lock size={12} />
              <span>Conversation thread is closed permanently. Status logged in audit history.</span>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Info & Status Actions Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#4f46e5' }}>{complaint.complaint_id}</span>
              <StatusBadge status={complaint.status} />
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 600 }}>{complaint.title}</h2>
          </div>

          {/* Status Progression Controls */}
          {!isResolved && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {complaint.status !== 'In Progress' && (
                <button
                  onClick={() => handleStatusChange('In Progress')}
                  disabled={updatingStatus}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', borderColor: '#fed7aa', color: '#9a3412', backgroundColor: '#fff7ed' }}
                  title="Mark complaint as actively being worked on"
                >
                  <Activity size={14} />
                  <span>Mark In Progress</span>
                </button>
              )}

              <button
                onClick={() => setIsModalOpen(true)}
                disabled={updatingStatus}
                className="btn btn-success"
                style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
                title="Mark this complaint as resolved with mandatory notes"
              >
                <CheckCircle2 size={14} />
                <span>Mark Resolved</span>
              </button>
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div style={{ display: 'flex', gap: '1.75rem', fontSize: '0.825rem', color: '#64748b', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <User size={16} color="#6366f1" />
            <span>Filing Student: <strong>{complaint.student_name}</strong> ({complaint.student_id})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Calendar size={16} color="#6366f1" />
            <span>Assigned: {new Date(complaint.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
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

      {/* Two-Way Chat Conversation Thread */}
      <ChatThread
        complaintId={complaint.complaint_id}
        isResolved={isResolved}
        onMessageSent={() => fetchComplaintDetails()}
      />

      {/* Mandatory Resolution Note Modal */}
      <ResolutionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={(note) => handleStatusChange('Resolved', note)}
        isSubmitting={updatingStatus}
      />
    </div>
  );
};

export default StaffComplaintDetailsPage;
