import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';

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

  const [searchVal, setSearchVal] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;

    let targetPath = '/water/complaints';
    if (location.pathname.includes('/worker')) {
      targetPath = '/worker/tasks';
    } else if (location.pathname.includes('/water/workers')) {
      targetPath = '/water/workers';
    } else if (location.pathname.includes('/water/assignments')) {
      targetPath = '/water/assignments';
    }

    navigate(`${targetPath}?search=${encodeURIComponent(searchVal.trim())}`);
  };

  const { user: reduxUser } = useSelector((state) => state.auth);

  const displayUser = {
    username: reduxUser?.username || "Jamsheed K.",
    role: reduxUser?.role === "Department_Admin" ? "Water Authority Admin" : (reduxUser?.role || "Water Authority Admin"),
    avatar: reduxUser?.avatar_url || "https://www.shutterstock.com/shutterstock/photos/2436095397/display_1500/stock-vector-user-glyph-vector-icon-isolated-user-stock-vector-icon-for-web-mobile-app-and-ui-design-2436095397.jpg"
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
        <form onSubmit={handleSearchSubmit} className="water-topbar-search">
          <span className="water-topbar-search-icon material-symbols-outlined">search</span>
          <input
            type="text"
            placeholder="Search complaints, pipe IDs, workers..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
        </form>
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
          <img src={displayUser.avatar} alt="Profile Avatar" />
          <div className="water-topbar-profile-info">
            <span className="water-topbar-username">{displayUser.username}</span>
            <span className="water-topbar-userrole">{displayUser.role}</span>
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
