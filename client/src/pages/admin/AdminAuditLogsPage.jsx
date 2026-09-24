import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { ShieldCheck, Bell, History, ArrowRight, Search } from 'lucide-react';

const AdminAuditLogsPage = () => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'notifications'
  const [historyLogs, setHistoryLogs] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      const [histRes, notifRes] = await Promise.all([
        api.get('/admin/audit-logs'),
        api.get('/admin/notifications')
      ]);

      if (histRes.data.success) {
        setHistoryLogs(histRes.data.data);
      }
      if (notifRes.data.success) {
        setSystemNotifications(notifRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching audit data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const filteredHistory = historyLogs.filter((h) => {
    const term = searchTerm.toLowerCase();
    return (
      h.complaint_id.toLowerCase().includes(term) ||
      h.complaint_title?.toLowerCase().includes(term) ||
      h.changed_by_name?.toLowerCase().includes(term) ||
      h.changed_by_id?.toLowerCase().includes(term)
    );
  });

  const filteredNotifications = systemNotifications.filter((n) => {
    const term = searchTerm.toLowerCase();
    return (
      n.message.toLowerCase().includes(term) ||
      n.user_id.toLowerCase().includes(term) ||
      n.user_name?.toLowerCase().includes(term) ||
      n.complaint_id?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>System Audit Trail &amp; Event Logs</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Immutable records of all complaint status transitions and system notifications
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          onClick={() => setActiveTab('history')}
          className={`btn ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem' }}
        >
          <History size={16} />
          <span>Status Change History ({historyLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem' }}
        >
          <Bell size={16} />
          <span>System Notifications Log ({systemNotifications.length})</span>
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="#94a3b8" />
          <input
            type="text"
            className="form-control"
            placeholder="Search by Complaint ID (e.g. CMP001), user name, or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="table-container">
        {activeTab === 'history' ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Complaint ID</th>
                <th>Subject</th>
                <th>Transition</th>
                <th>Changed By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Loading audit trail logs...
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No audit records match the query.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((h) => (
                  <tr key={h.history_id}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{h.history_id}</td>
                    <td style={{ fontWeight: 600, color: '#4f46e5' }}>{h.complaint_id}</td>
                    <td style={{ fontWeight: 500, color: '#1e293b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.complaint_title || 'N/A'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {h.previous_status ? <StatusBadge status={h.previous_status} /> : <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Initial</span>}
                        <ArrowRight size={12} color="#94a3b8" />
                        <StatusBadge status={h.new_status} />
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{h.changed_by_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{h.changed_by_id}</div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(h.changed_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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
                <th>Notif ID</th>
                <th>Recipient User</th>
                <th>Notification Message</th>
                <th>Related Complaint</th>
                <th>Status</th>
                <th>Delivered At</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Loading system notification logs...
                  </td>
                </tr>
              ) : filteredNotifications.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No notification logs found.
                  </td>
                </tr>
              ) : (
                filteredNotifications.map((n) => (
                  <tr key={n.notification_id}>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>#{n.notification_id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{n.user_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{n.user_id}</div>
                    </td>
                    <td style={{ color: '#1e293b', maxWidth: '360px' }}>{n.message}</td>
                    <td style={{ fontWeight: 600, color: '#4f46e5' }}>{n.complaint_id || '—'}</td>
                    <td>
                      <span
                        style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          backgroundColor: n.is_read ? '#f1f5f9' : '#dcfce7',
                          color: n.is_read ? '#64748b' : '#166534'
                        }}
                      >
                        {n.is_read ? 'Read' : 'Unread'}
                      </span>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
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

export default AdminAuditLogsPage;
