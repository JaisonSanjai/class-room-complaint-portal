import React, { useState } from 'react';
import { CheckCircle2, X, AlertTriangle } from 'lucide-react';

const ResolutionModal = ({ isOpen, onClose, onConfirm, isSubmitting }) => {
  const [resolutionNote, setResolutionNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!resolutionNote.trim() || resolutionNote.trim().length < 5) {
      setError('Please provide a meaningful resolution note (at least 5 characters).');
      return;
    }
    setError('');
    onConfirm(resolutionNote.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={20} color="#166534" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Mark Complaint as Resolved</h3>
          </div>
          <button onClick={onClose} className="btn-icon" disabled={isSubmitting}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              color: '#92400e'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Important:</strong> Resolving will permanently lock the conversation thread. No further messages can be sent.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Mandatory Resolution Note <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Detail the remedial actions taken to address this complaint (e.g. equipment repaired, schedule updated, policy explained)..."
                value={resolutionNote}
                onChange={(e) => {
                  setResolutionNote(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                required
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                This note will be prominently displayed to the student and recorded permanently in the audit trail.
              </span>
            </div>

            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResolutionModal;
