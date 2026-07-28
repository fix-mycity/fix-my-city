import React from 'react';

export default function NotificationPanel({ notifications = [] }) {
  return (
    <div className="water-panel">
      <div className="water-panel-header">
        <h3 className="water-panel-header-title">
          <span className="material-symbols-outlined">notifications_active</span>
          Department Bulletins
        </h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>System Bulletins</span>
      </div>
      <div className="water-panel-body">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div key={notif.id || notif.title} className={`water-notif-item ${notif.type || 'info'}`}>
              <span className="water-notif-icon material-symbols-outlined">{notif.icon || 'notifications'}</span>
              <div className="water-notif-details">
                <span className="water-notif-title">{notif.title}</span>
                <span className="water-notif-msg">{notif.message}</span>
                <span className="water-notif-time">{notif.time || 'Today'}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
            No active department bulletins.
          </div>
        )}
      </div>
    </div>
  );
}

