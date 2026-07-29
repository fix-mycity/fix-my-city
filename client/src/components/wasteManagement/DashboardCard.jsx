import React from 'react';

export default function DashboardCard({ title, count, description, icon, trend, trendType, color }) {
  const colorMap = {
    emerald: { bg: '#ecfdf5', color: '#10b981' },
    blue: { bg: '#eff6ff', color: '#3b82f6' },
    amber: { bg: '#fffbeb', color: '#f59e0b' },
    red: { bg: '#fef2f2', color: '#ef4444' },
    purple: { bg: '#faf5ff', color: '#a855f7' },
    cyan: { bg: '#ecfeff', color: '#06b6d4' },
    teal: { bg: '#f0fdf4', color: '#047857' }
  };

  const style = colorMap[color] || colorMap.emerald;

  return (
    <div className="waste-card">
      <div className="waste-card-top">
        <span className="waste-card-title">{title}</span>
        <div className="waste-card-icon" style={{ backgroundColor: style.bg, color: style.color }}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div className="waste-card-count">{count}</div>
      <div className="waste-card-footer">
        {trend && <span className={`waste-card-trend ${trendType || 'up'}`}>{trend}</span>}
        <span>{description}</span>
      </div>
    </div>
  );
}
