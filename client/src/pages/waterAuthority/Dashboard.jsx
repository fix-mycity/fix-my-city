import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/waterAuthority/PageHeader';
import DashboardCards from '../../components/waterAuthority/DashboardCards';
import DashboardCharts from '../../components/waterAuthority/DashboardCharts';
import RecentActivities from '../../components/waterAuthority/RecentActivities';
import QuickActions from '../../components/waterAuthority/QuickActions';
import NotificationPanel from '../../components/waterAuthority/NotificationPanel';
import LoadingSkeleton from '../../components/waterAuthority/LoadingSkeleton';

import { getDashboardSummary, getComplaints } from '../../services/waterComplaintService';
import { getWorkers } from '../../services/workerService';
import { getNotifications } from '../../services/notificationService';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, compRes, workRes, notifRes] = await Promise.allSettled([
        getDashboardSummary(),
        getComplaints({ page_size: 100 }),
        getWorkers({ page_size: 100 }),
        getNotifications({ page_size: 10 })
      ]);

      if (sumRes.status === 'fulfilled') {
        setSummary(sumRes.value.data);
      }
      if (compRes.status === 'fulfilled') {
        setComplaints(compRes.value.data.items || compRes.value.data || []);
      }
      if (workRes.status === 'fulfilled') {
        setWorkers(workRes.value.data.items || workRes.value.data || []);
      }
      if (notifRes.status === 'fulfilled') {
        setNotifications(notifRes.value.data.items || notifRes.value.data || []);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to refresh live dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
  };

  return (
    <div className="water-dashboard-page">
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Welcome Header */}
          <PageHeader
            title="Water Authority Dashboard"
            subtitle="Live Operational Monitoring & Citizen Complaints"
            onActionClick={handleRefresh}
            actionLabel="Sync Live Data"
            isLoading={isLoading}
          />

          {/* Quick Stats Grid */}
          <DashboardCards summary={summary} complaints={complaints} workers={workers} />

          {/* Quick Actions Panel */}
          <QuickActions />

          {/* Operational Charts */}
          <DashboardCharts summary={summary} complaints={complaints} workers={workers} />

          {/* Bottom Grid with Activities and Bulletins */}
          <div className="water-bottom-grid">
            <RecentActivities complaints={complaints} />
            <NotificationPanel notifications={notifications} />
          </div>
        </>
      )}
    </div>
  );
}

