import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, Check, BellOff, ExternalLink } from 'lucide-react';

const Navbar = ({ title }) => {
  const { user, toggleStaffNotifications } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [toggling, setToggling] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = async () => {
    try {
      setToggling(true);
      await toggleStaffNotifications();
    } catch (err) {
      alert('Could not update notification preferences.');
    } finally {
      setToggling(false);
    }
  };

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      markAsRead(item.notification_id);
    }
    if (item.complaint_id) {
      setShowNotifications(false);
      if (user.role === 'Student') {
        navigate(`/student/complaints/${item.complaint_id}`);
      } else if (user.role === 'Faculty' || user.role === 'HOD') {
        navigate(`/staff/complaints/${item.complaint_id}`);
      } else if (user.role === 'Admin') {
        navigate(`/admin/complaints/${item.complaint_id}`);
      }
    }
  };

  return (
    <header className="top-navbar">
      <div className="page-title">{title}</div>

      <div className="navbar-actions" ref={dropdownRef}>
        {/* Faculty / HOD Notification Toggle Button */}
        {(user?.role === 'Faculty' || user?.role === 'HOD') && (
          <button
            onClick={handleToggleNotifications}
            disabled={toggling}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
            title="Toggle whether you receive in-app notifications"
          >
            {user.notifications_enabled ? (
              <>
                <Bell size={14} color="#166534" />
                <span>Alerts: <strong>ON</strong></span>
              </>
            ) : (
              <>
                <BellOff size={14} color="#94a3b8" />
                <span style={{ color: '#64748b' }}>Alerts: <strong>OFF</strong></span>
              </>
            )}
          </button>
        )}

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="btn-icon"
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: showNotifications ? '#f1f5f9' : 'transparent',
              color: '#475569'
            }}
            title="In-App Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  borderRadius: '9999px',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 0 2px #ffffff'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown */}
          {showNotifications && (
            <div className="notification-popover">
              <div className="notification-header">
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  Notifications {unreadCount > 0 && `(${unreadCount} new)`}
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 500 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.notification_id}
                      onClick={() => handleNotificationClick(n)}
                      className={`notification-item ${!n.is_read ? 'unread' : ''}`}
                      style={{ cursor: n.complaint_id ? 'pointer' : 'default' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ color: '#1e293b', fontWeight: n.is_read ? 400 : 600 }}>
                          {n.message}
                        </span>
                        {n.complaint_id && (
                          <ExternalLink size={12} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                        )}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &bull; {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
