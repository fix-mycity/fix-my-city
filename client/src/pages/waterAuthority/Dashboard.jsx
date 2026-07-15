import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/waterAuthority/PageHeader';
import DashboardCards from '../../components/waterAuthority/DashboardCards';
import DashboardCharts from '../../components/waterAuthority/DashboardCharts';
import RecentActivities from '../../components/waterAuthority/RecentActivities';
import QuickActions from '../../components/waterAuthority/QuickActions';
import NotificationPanel from '../../components/waterAuthority/NotificationPanel';
import LoadingSkeleton from '../../components/waterAuthority/LoadingSkeleton';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);

  // Initial loading simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="water-dashboard-page">
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Welcome Header */}
          <PageHeader 
            title="Welcome Back, Jamsheed" 
            subtitle="Water Authority Dashboard" 
            onActionClick={handleRefresh}
            actionLabel="Sync Sensors"
            isLoading={isLoading}
          />

          {/* Quick Stats Grid */}
          <DashboardCards />

          {/* Quick Actions Panel */}
          <QuickActions />

          {/* Operational Charts */}
          <DashboardCharts />

          {/* Bottom Grid with Activities and Bulletins */}
          <div className="water-bottom-grid">
            <RecentActivities />
            <NotificationPanel />
          </div>
        </>
      )}
    </div>
  );
}
