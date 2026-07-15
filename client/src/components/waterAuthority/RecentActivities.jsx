import React from 'react';
import { recentActivities } from '../../utils/waterMockData';

export default function RecentActivities() {
  return (
    <div className="water-panel">
      <div className="water-panel-header">
        <h3 className="water-panel-header-title">
          <span className="material-symbols-outlined">history</span>
          Recent Operations Log
        </h3>
        <button className="water-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
          View Log
        </button>
      </div>
      <div className="water-panel-body">
        {recentActivities.map((act) => (
          <div key={act.id} className="water-activity-item">
            <div className={`water-activity-icon-dot ${act.type}`}>
              <span className="material-symbols-outlined">{act.icon}</span>
            </div>
            <div className="water-activity-info">
              <span className="water-activity-text">{act.text}</span>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.15rem' }}>
                <span className="water-activity-time">{act.time}</span>
                <span className={`water-activity-status ${act.status}`}>{act.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
