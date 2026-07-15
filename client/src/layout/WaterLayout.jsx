import React, { useState } from 'react';
import Sidebar from '../components/waterAuthority/Sidebar';
import Topbar from '../components/waterAuthority/Topbar';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import '../styles/waterAuthority.css';

export default function WaterLayout({ children, activeTab: propActiveTab, setActiveTab: propSetActiveTab }) {
  const [localActiveTab, setLocalActiveTab] = useState('dashboard');
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      // Clean up using the exist Redux logout implementation
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out from Water Authority successfully!");
      navigate('/login');
    } catch (err) {
      // If redux fails or not configured for some reason during standalone tests, redirect to login
      toast.success("Logging out...");
      navigate('/login');
    }
  };

  return (
    <div className={`water-layout ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Navigation Drawer */}
      <Sidebar 
        isCollapsed={isCollapsed} 
        setIsCollapsed={setIsCollapsed} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="water-main-wrapper">
        {/* Top Navbar */}
        <Topbar 
          onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          onLogout={handleLogout}
          onNotificationToggle={() => toast.success("Notifications Panel Toggled")}
        />

        {/* Dynamic Page Content */}
        <main className="water-main-content">
          {children}
        </main>

        {/* Footer */}
        <footer className="water-footer">
          <div>
            <span>Fix My City • </span>
            <span style={{ color: 'var(--water-primary-light)', fontWeight: '700' }}>Water Authority Department</span>
          </div>
          <div className="water-footer-right">
            <span>Version 1.0.0 (Phase 1)</span>
            <span>&copy; {new Date().getFullYear()} Municipal Corporation. All Rights Reserved.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
