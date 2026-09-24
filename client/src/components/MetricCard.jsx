import React from 'react';

const MetricCard = ({ title, value, icon, iconBg = '#eef2ff', iconColor = '#6366f1' }) => {
  return (
    <div className="metric-card">
      <div className="metric-info">
        <span className="metric-title">{title}</span>
        <span className="metric-value">{value}</span>
      </div>
      <div 
        className="metric-icon-box" 
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        {icon}
      </div>
    </div>
  );
};

export default MetricCard;
