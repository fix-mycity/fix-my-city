import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/wasteManagement/PageHeader';
import DashboardCards from '../../components/wasteManagement/DashboardCards';
import DashboardCharts from '../../components/wasteManagement/DashboardCharts';
import RecentActivities from '../../components/wasteManagement/RecentActivities';
import QuickActions from '../../components/wasteManagement/QuickActions';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import AddComplaintModal from '../../components/wasteManagement/AddComplaintModal';
import AddBinModal from '../../components/wasteManagement/AddBinModal';
import AddVehicleModal from '../../components/wasteManagement/AddVehicleModal';
import AddScheduleModal from '../../components/wasteManagement/AddScheduleModal';
import AddWorkerModal from '../../components/wasteManagement/AddWorkerModal';

import { getWasteDashboardSummary } from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  // Quick Action Modal States
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await getWasteDashboardSummary();
      setSummary(res.data);
    } catch (err) {
      console.error("Waste Dashboard fetch error:", err);
      toast.error("Failed to fetch live waste management metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
    toast.success("Dashboard metrics synced.");
  };

  return (
    <div className="waste-dashboard-page">
      {isLoading && !summary ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Welcome Header */}
          <PageHeader
            title="Waste Management Dashboard"
            subtitle="Live Sanitation Operations, Smart Bin Tracking & Citizen Complaints"
            onActionClick={handleRefresh}
            actionLabel="Sync Live Data"
            isLoading={isLoading}
          />

          {/* 7 Quick Stats Grid */}
          <DashboardCards summary={summary} />

          {/* Quick Actions Panel */}
          <QuickActions
            onAddComplaint={() => setIsComplaintModalOpen(true)}
            onAddBin={() => setIsBinModalOpen(true)}
            onAddVehicle={() => setIsVehicleModalOpen(true)}
            onCreateSchedule={() => setIsScheduleModalOpen(true)}
            onAddWorker={() => setIsWorkerModalOpen(true)}
          />

          {/* 4 Operational Charts */}
          <DashboardCharts summary={summary} />

          {/* Recent Operations & Activity Feeds */}
          <RecentActivities summary={summary} />

          {/* Action Modals */}
          <AddComplaintModal
            isOpen={isComplaintModalOpen}
            onClose={() => setIsComplaintModalOpen(false)}
            onSuccess={loadDashboardData}
          />

          <AddBinModal
            isOpen={isBinModalOpen}
            onClose={() => setIsBinModalOpen(false)}
            onSuccess={loadDashboardData}
          />

          <AddVehicleModal
            isOpen={isVehicleModalOpen}
            onClose={() => setIsVehicleModalOpen(false)}
            onSuccess={loadDashboardData}
          />

          <AddScheduleModal
            isOpen={isScheduleModalOpen}
            onClose={() => setIsScheduleModalOpen(false)}
            onSuccess={loadDashboardData}
          />

          <AddWorkerModal
            isOpen={isWorkerModalOpen}
            onClose={() => setIsWorkerModalOpen(false)}
            onSuccess={loadDashboardData}
          />
        </>
      )}
    </div>
  );
}
