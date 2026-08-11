import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  activeTab,
  setActiveTab,
  onLogout
}) {
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/waste' },
    { id: 'complaints', label: 'Complaints', icon: 'report_problem', path: '/waste/complaints' },
    { id: 'bins', label: 'Waste Bins', icon: 'delete', path: '/waste/bins' },
    { id: 'workers', label: 'Sanitation Workers', icon: 'group', path: '/waste/workers' },
    { id: 'suggestions', label: 'Suggestions', icon: 'lightbulb', path: '/waste/suggestions' },
    { id: 'posts', label: 'Announcements', icon: 'megaphone', path: '/waste/posts' }
  ];

  const handleNavClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
    if (isMobileOpen) setIsMobileOpen(false);
  };

  return (
    <aside className={`waste-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      <div className="waste-sidebar-logo">
        <div className="waste-sidebar-logo-icon">
          <span className="material-symbols-outlined">delete_sweep</span>
        </div>
        {!isCollapsed && (
          <div>
            <div className="waste-sidebar-title">Waste Authority</div>
            <div className="waste-sidebar-subtitle">Smart Sanitation</div>
          </div>
        )}
      </div>

      <div className="waste-sidebar-nav">
        {!isCollapsed && <div className="waste-nav-section-label">Main Navigation</div>}
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`waste-nav-item ${activeTab === item.id ? 'active' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            {!isCollapsed && <span>{item.label}</span>}
          </button>
        ))}
      </div>

      <div className="waste-sidebar-footer">
        <button
          onClick={onLogout}
          className="waste-nav-item"
          style={{ color: '#fca5a5' }}
          title={isCollapsed ? 'Logout' : ''}
        >
          <span className="material-symbols-outlined">logout</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
