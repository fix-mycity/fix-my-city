import React from 'react';

export default function DashboardCard({ title, count, description, icon, trend, trendType, color }) {
  const getTrendIcon = (type) => {
    switch (type) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      case 'warning': return 'warning';
      case 'danger': return 'dangerous';
      default: return 'remove';
    }
  };

  return (
    <div className="water-card">
      <div className="water-card-header">
        <span className="water-card-title">{title}</span>
        <div className={`water-card-icon-container ${color}`}>
          <span className="water-card-icon material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="water-card-body">
        <div className="water-card-count">{count}</div>
        <span className="water-card-subtitle">{description}</span>
      </div>
      <div className="water-card-footer">
        <span className={`water-card-trend ${trendType}`}>
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
            {getTrendIcon(trendType)}
          </span>
          {trend}
        </span>
      </div>
    </div>
  );
}
