import React from 'react';
import { sidebarItems } from '../../utils/waterMockData';
import { Link } from 'react-router-dom';
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

      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <DepartmentSwitcher />
        </div>
      )}

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
    </aside>
  );
}
