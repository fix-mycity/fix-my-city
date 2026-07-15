import React from 'react';
import { sidebarItems } from '../../utils/waterMockData';
import { Link } from 'react-router-dom';

export default function Sidebar({ 
  isCollapsed, 
  setIsCollapsed, 
  isMobileOpen, 
  setIsMobileOpen, 
  activeTab, 
  setActiveTab,
  onLogout 
}) {
  const user = {
    username: "Jamsheed K.",
    role: "Water Authority Admin",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100"
  };

  const handleItemClick = (id) => {
    setActiveTab(id);
    setIsMobileOpen(false); // Close mobile drawer on selection
  };

  return (
    <aside className={`water-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="water-sidebar-logo">
        <span className="water-sidebar-logo-icon material-symbols-outlined">water_drop</span>
        <div className="water-sidebar-header-action">
          <span className="water-sidebar-logo-text">Water Authority</span>
          <button 
            className="water-sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span className="material-symbols-outlined">
              {isCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      <nav className="water-sidebar-nav">
        <ul className="water-sidebar-menu">
          {sidebarItems.map((item) => (
            <li key={item.id} className="water-sidebar-item">
              {item.path.startsWith('#') ? (
                <a
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    handleItemClick(item.id);
                  }}
                  className={`water-sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                  title={item.label}
                >
                  <span className="water-sidebar-link-icon material-symbols-outlined">{item.icon}</span>
                  <span className="water-sidebar-link-text">{item.label}</span>
                </a>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => handleItemClick(item.id)}
                  className={`water-sidebar-link ${activeTab === item.id ? 'active' : ''}`}
                  title={item.label}
                >
                  <span className="water-sidebar-link-icon material-symbols-outlined">{item.icon}</span>
                  <span className="water-sidebar-link-text">{item.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="water-sidebar-footer">
        <div className="water-sidebar-user-block">
          <img src={user.avatar} alt="User Profile" className="water-sidebar-avatar" />
          <div className="water-sidebar-user-info">
            <span className="water-sidebar-username">{user.username}</span>
            <span className="water-sidebar-user-role">{user.role}</span>
          </div>
        </div>
        <div className="water-sidebar-actions-row">
          <button className="water-sidebar-footer-btn" title="View Profile">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          <button className="water-sidebar-footer-btn" title="Settings">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button 
            className="water-sidebar-footer-btn logout-btn" 
            onClick={onLogout}
            title="Log Out"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
