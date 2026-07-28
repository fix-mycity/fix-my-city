import React from 'react';

export default function RecentActivities({ complaints = [] }) {
  const activities = complaints.slice(0, 5).map((c) => ({
    id: c.id,
    time: c.created_at ? new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently',
    type: c.status === 'COMPLETED' ? 'supply' : 'complaint',
    text: `Complaint #${c.complaint_number} logged by ${c.citizen_name || 'Citizen'}: ${c.title}`,
    status: c.status || 'NEW',
    icon: c.status === 'COMPLETED' ? 'check_circle' : 'report_problem'
  }));

  return (
    <div className="water-panel">
      <div className="water-panel-header">
        <h3 className="water-panel-header-title">
          <span className="material-symbols-outlined">history</span>
          Recent Operations Log
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Live Database Log</span>
      </div>
      <div className="water-panel-body">
        {activities.length > 0 ? (
          activities.map((act) => (
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
          ))
        ) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            No recent activity logged yet.
          </div>
        )}
      </div>
    </div>
  );
}

