import React from 'react';
import { notificationsData } from '../../utils/waterMockData';

export default function NotificationPanel() {
  return (
    <div className="water-panel">
      <div className="water-panel-header">
        <h3 className="water-panel-header-title">
          <span className="material-symbols-outlined">notifications_active</span>
          Department Bulletins
        </h3>
        <button className="water-btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
          Mark All Read
        </button>
      </div>
      <div className="water-panel-body">
        {notificationsData.map((notif) => (
          <div key={notif.id} className={`water-notif-item ${notif.type}`}>
            <span className="water-notif-icon material-symbols-outlined">{notif.icon}</span>
            <div className="water-notif-details">
              <span className="water-notif-title">{notif.title}</span>
              <span className="water-notif-msg">{notif.message}</span>
              <span className="water-notif-time">{notif.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
