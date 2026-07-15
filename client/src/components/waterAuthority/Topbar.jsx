import React, { useState } from 'react';

export default function Topbar({ 
  onMenuToggle, 
  onLogout,
  onNotificationToggle 
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const user = {
    username: "Jamsheed K.",
    role: "Water Authority Admin",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"
  };

  return (
    <header className="water-topbar">
      <div className="water-topbar-left">
        <button 
          className="water-mobile-toggle" 
          onClick={onMenuToggle}
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="water-topbar-title">
          <span className="water-topbar-dept">Municipality Services</span>
          <span className="water-topbar-logo-lbl">Fix My City</span>
        </div>
        <div className="water-topbar-search">
          <span className="water-topbar-search-icon material-symbols-outlined">search</span>
          <input type="text" placeholder="Search complaints, pipe IDs, workers..." />
        </div>
      </div>

      <div className="water-topbar-right">
        <div className="water-topbar-date">
          <span className="material-symbols-outlined">calendar_today</span>
          <span>{currentDate}</span>
        </div>

        <button 
          className="water-topbar-badge-btn" 
          onClick={onNotificationToggle}
          title="Toggle Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="water-topbar-badge"></span>
        </button>

        <div 
          className="water-topbar-profile"
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
        >
          <img src={user.avatar} alt="Profile Avatar" />
          <div className="water-topbar-profile-info">
            <span className="water-topbar-username">{user.username}</span>
            <span className="water-topbar-userrole">{user.role}</span>
          </div>
          <span className="material-symbols-outlined">arrow_drop_down</span>
          
          {profileDropdownOpen && (
            <div className="water-profile-dropdown">
              <button className="water-profile-dropdown-item">
                <span className="material-symbols-outlined">account_circle</span>
                My Profile
              </button>
              <button className="water-profile-dropdown-item">
                <span className="material-symbols-outlined">settings</span>
                Settings
              </button>
              <button className="water-profile-dropdown-item">
                <span className="material-symbols-outlined">help</span>
                Help Center
              </button>
              <button 
                className="water-profile-dropdown-item logout"
                onClick={onLogout}
              >
                <span className="material-symbols-outlined">logout</span>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
