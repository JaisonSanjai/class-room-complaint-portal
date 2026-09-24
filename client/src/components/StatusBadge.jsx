import React from 'react';
import { Clock, Eye, Activity, MessageSquare, CheckCircle2 } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'Pending':
        return {
          className: 'pending',
          icon: <Clock size={12} />,
          label: 'Pending'
        };
      case 'Seen':
        return {
          className: 'seen',
          icon: <Eye size={12} />,
          label: 'Seen'
        };
      case 'In Progress':
        return {
          className: 'in-progress',
          icon: <Activity size={12} />,
          label: 'In Progress'
        };
      case 'Replied':
        return {
          className: 'replied',
          icon: <MessageSquare size={12} />,
          label: 'Replied'
        };
      case 'Resolved':
        return {
          className: 'resolved',
          icon: <CheckCircle2 size={12} />,
          label: 'Resolved'
        };
      default:
        return {
          className: 'pending',
          icon: <Clock size={12} />,
          label: status || 'Unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <span className={`status-badge ${config.className}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
