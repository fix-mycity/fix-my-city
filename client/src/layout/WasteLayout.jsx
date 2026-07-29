import React, { useState } from 'react';
import Sidebar from '../components/wasteManagement/Sidebar';
import Topbar from '../components/wasteManagement/Topbar';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../features/auth/authThunks';
import { toast } from 'react-hot-toast';
import '../styles/wasteManagement.css';

export default function WasteLayout({ children, activeTab: propActiveTab, setActiveTab: propSetActiveTab }) {
  const [localActiveTab, setLocalActiveTab] = useState('dashboard');
  const activeTab = propActiveTab || localActiveTab;
  const setActiveTab = propSetActiveTab || setLocalActiveTab;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out from Waste Authority successfully!");
      navigate('/login');
    } catch (err) {
      toast.success("Logging out...");
      navigate('/login');
    }
  };

  return (
    <div className={`waste-layout ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="waste-main-wrapper">
        {/* Topbar */}
        <Topbar
          onMenuToggle={() => setIsMobileOpen(!isMobileOpen)}
          onLogout={handleLogout}
          onNotificationToggle={() => toast.success("Notifications Panel Toggled")}
        />

        {/* Dynamic Page Content */}
        <main className="waste-main-content">
          {children}
        </main>

        {/* Footer */}
        <footer className="waste-footer">
          <div>
            <span>Fix My City • </span>
            <span style={{ color: 'var(--waste-primary-light)', fontWeight: '700' }}>Waste Management Department</span>
          </div>
          <div>
            <span>Version 1.0.0 (Phase 1)</span>
            <span style={{ marginLeft: '1rem' }}>&copy; {new Date().getFullYear()} Municipal Corporation.</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
