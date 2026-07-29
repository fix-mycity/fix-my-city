import React from 'react';
import { useSelector } from 'react-redux';

export default function Topbar({ onMenuToggle, onLogout, onNotificationToggle }) {
  const user = useSelector((state) => state.auth?.user);
  const userName = user?.username || user?.first_name || 'Sanitation Admin';
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="waste-topbar">
      <div className="waste-topbar-left">
        <button onClick={onMenuToggle} className="waste-menu-toggle" title="Toggle Navigation">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
            Waste Management Module
          </span>
        </div>
      </div>

      <div className="waste-topbar-right">
        <button 
          onClick={onNotificationToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', color: '#64748b', display: 'flex', alignItems: 'center' }}
          title="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
        </button>

        <div className="waste-user-profile">
          <div className="waste-user-avatar">{initial}</div>
          <div className="waste-user-info">
            <span className="waste-user-name">{userName}</span>
            <span className="waste-user-role">Department Officer</span>
          </div>
        </div>
      </div>
    </header>
  );
}
