import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Send, Lock, MessageSquare } from 'lucide-react';

const ChatThread = ({ complaintId, isResolved, onMessageSent }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/messages/${complaintId}`);
      if (res.data.success) {
        setMessages(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching chat:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 6000); // 6s live polling
    return () => clearInterval(interval);
  }, [complaintId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || isResolved) return;

    try {
      setSending(true);
      setError('');
      const res = await api.post(`/messages/${complaintId}`, {
        message: newMessage.trim()
      });

      if (res.data.success) {
        setNewMessage('');
        await fetchMessages();
        if (onMessageSent) {
          onMessageSent(res.data.data);
        }
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const isSenderMe = (msg) => {
    return msg.sender_id === user.id;
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="#6366f1" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Direct Conversation Thread</span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {messages.length} message{messages.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Messages Feed */}
      <div className="chat-messages">
        {loading && messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', margin: 'auto' }}>
            No messages sent yet. Use the field below to begin communication.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = isSenderMe(msg);
            return (
              <div
                key={msg.message_id}
                className={`message-bubble ${isMe ? 'outgoing' : 'incoming'}`}
              >
                <div className="message-meta">
                  <span className="message-sender">
                    {isMe ? 'You' : msg.sender_name || msg.sender_id}
                  </span>
                  <span className="message-role-tag">
                    {msg.sender_role}
                  </span>
                  <span className="message-time">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="message-text">{msg.message}</div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Notice */}
      {error && (
        <div style={{ padding: '0.4rem 1rem', background: '#fee2e2', color: '#b91c1c', fontSize: '0.75rem' }}>
          {error}
        </div>
      )}

      {/* Footer / Input or Locked Banner */}
      <div className="chat-footer">
        {isResolved ? (
          <div className="chat-locked-notice">
            <Lock size={16} />
            <span>Complaint is <strong>Resolved</strong>. This conversation thread is permanently locked.</span>
          </div>
        ) : user.role === 'Admin' ? (
          <div className="chat-locked-notice">
            <Lock size={16} />
            <span>Administrator view: Read-only access to conversation trail.</span>
          </div>
        ) : (
          <form onSubmit={handleSend} style={{ display: 'flex', width: '100%', gap: '0.75rem' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Type your message here (plain text only)..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              maxLength={1000}
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={sending || !newMessage.trim()}
              style={{ padding: '0.65rem 1.25rem' }}
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatThread;
