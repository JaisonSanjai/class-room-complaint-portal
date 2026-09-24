import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { ArrowLeft, Send, AlertCircle, HelpCircle } from 'lucide-react';

const NewComplaintPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [recipientId, setRecipientId] = useState('');
  const [staffList, setStaffList] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await api.get('/auth/staff-list');
        if (res.data.success) {
          setStaffList(res.data.data);
          if (res.data.data.length > 0) {
            setRecipientId(res.data.data[0].staff_id);
          }
        }
      } catch (err) {
        console.error('Failed to load staff list:', err);
        setError('Could not retrieve available faculty and HOD recipients.');
      } finally {
        setLoadingStaff(false);
      }
    };

    fetchStaff();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !recipientId) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post('/complaints', {
        title: title.trim(),
        description: description.trim(),
        recipient_id: recipientId
      });

      if (res.data.success) {
        navigate(`/student/complaints/${res.data.data.complaint_id}`);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to submit complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/student/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to My Complaints</span>
        </Link>
      </div>

      <div className="card">
        <div className="card-header" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '1.25rem' }}>File a Classroom Grievance</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.2rem' }}>
              Your complaint will be assigned directly to your chosen staff recipient.
            </p>
          </div>
        </div>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#b91c1c',
            fontSize: '0.85rem',
            marginBottom: '1.25rem'
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Target Recipient Dropdown (Strictly 1 recipient) */}
          <div className="form-group">
            <label className="form-label">
              Target Recipient (HOD or Faculty Member) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              className="form-select"
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              disabled={loadingStaff || submitting}
              required
            >
              {loadingStaff ? (
                <option value="">Loading faculty &amp; HOD options...</option>
              ) : (
                staffList.map((s) => (
                  <option key={s.staff_id} value={s.staff_id}>
                    [{s.role}] {s.name} ({s.staff_id})
                  </option>
                ))
              )}
            </select>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Strictly one recipient per grievance. You can select either the HOD or a specific faculty member.
            </span>
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Complaint Subject / Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Broken Projector in Room 304, Lab PC 12 Keyboard Damaged"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              maxLength={150}
              required
            />
          </div>

          {/* Detailed Description */}
          <div className="form-group">
            <label className="form-label">
              Detailed Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="form-control"
              rows="6"
              placeholder="Provide specific details regarding the issue: classroom/hall number, nature of problem, time noticed, and its impact on lectures..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              required
            />
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Minimum 10 characters. Plain text only.
            </span>
          </div>

          {/* Rules box */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.85rem',
            marginBottom: '1.5rem',
            fontSize: '0.775rem',
            color: '#64748b'
          }}>
            <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <HelpCircle size={14} color="#6366f1" /> Workflow Notice:
            </div>
            <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
              <li>An auto-generated sequence ID (e.g. <code>CMP001</code>) will be assigned.</li>
              <li>Once submitted, you can participate in a dedicated two-way chat thread until marked <strong>Resolved</strong>.</li>
              <li>Filed complaints cannot be deleted or modified.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <Link to="/student/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || loadingStaff}
            >
              <Send size={16} />
              <span>{submitting ? 'Submitting Grievance...' : 'Submit Complaint'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewComplaintPage;
