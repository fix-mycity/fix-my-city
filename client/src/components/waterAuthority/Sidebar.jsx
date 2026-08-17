import React from 'react';
import { sidebarItems } from '../../utils/waterMockData';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DepartmentSwitcher from '../shared/DepartmentSwitcher';

export default function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  activeTab,
  setActiveTab,
  onLogout
}) {
  const { user: reduxUser } = useSelector((state) => state.auth);

  const displayUser = {
    username: reduxUser?.username || "Jamsheed K.",
    role: reduxUser?.role === "Department_Admin" ? "Water Authority Admin" : (reduxUser?.role || "Water Authority Admin"),
    avatar: reduxUser?.avatar_url || "https://www.shutterstock.com/shutterstock/photos/2436095397/display_1500/stock-vector-user-glyph-vector-icon-isolated-user-stock-vector-icon-for-web-mobile-app-and-ui-design-2436095397.jpg"
  };

  const workerSidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/worker/dashboard' },
    { id: 'tasks', label: 'My Tasks', icon: 'engineering', path: '/worker/tasks' },
    { id: 'history', label: 'Task History', icon: 'history', path: '/worker/history' }
  ];

  const itemsToRender = reduxUser?.role === "Worker" ? workerSidebarItems : sidebarItems;

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

      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <DepartmentSwitcher />
        </div>
      )}

      <nav className="water-sidebar-nav">
        <ul className="water-sidebar-menu">
          {itemsToRender.map((item) => (
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
          <img src={displayUser.avatar} alt="User Profile" className="water-sidebar-avatar" />
          <div className="water-sidebar-user-info">
            <span className="water-sidebar-username">{displayUser.username}</span>
            <span className="water-sidebar-user-role">{displayUser.role}</span>
          </div>
        </div>
        <div className="water-sidebar-actions-row">
          <button className="water-sidebar-footer-btn" title="View Profile">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          <Link to="/water/settings" onClick={() => handleItemClick('settings')} className="water-sidebar-footer-btn" title="Settings">
            <span className="material-symbols-outlined">settings</span>
          </Link>
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
