import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { fetchCurrentUser } from './features/auth/authThunks';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import UserDashboard from './pages/UserDashboard';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AdminPortal from './pages/auth/AdminPortal';

// Water Management Pages
import WaterLayout from './layout/WaterLayout';
import WaterDashboard from './pages/waterAuthority/Dashboard';
import ComplaintManagement from './pages/waterAuthority/ComplaintManagement';
import ComplaintDetails from './pages/waterAuthority/ComplaintDetails';
import WorkerManagement from './pages/waterAuthority/WorkerManagement';
import AddWorker from './pages/waterAuthority/AddWorker';
import EditWorker from './pages/waterAuthority/EditWorker';
import WorkerProfile from './pages/waterAuthority/WorkerProfile';

// Water Supply Schedules Pages
import WaterSupplySchedule from './pages/waterAuthority/WaterSupplySchedule';
import ScheduleDetails from './pages/waterAuthority/ScheduleDetails';
import AddSchedule from './pages/waterAuthority/AddSchedule';
import EditSchedule from './pages/waterAuthority/EditSchedule';


// Water Pipeline Management Pages
import PipelineManagement from './pages/waterAuthority/PipelineManagement';
import PipelineDetails from './pages/waterAuthority/PipelineDetails';
import AddPipeline from './pages/waterAuthority/AddPipeline';
import EditPipeline from './pages/waterAuthority/EditPipeline';
import InspectionHistory from './pages/waterAuthority/InspectionHistory';
import MaintenanceHistory from './pages/waterAuthority/MaintenanceHistory';

// Water Tank Management Pages
import WaterTankManagement from './pages/waterAuthority/WaterTankManagement';
import TankDetails from './pages/waterAuthority/TankDetails';
import AddTank from './pages/waterAuthority/AddTank';
import EditTank from './pages/waterAuthority/EditTank';
import TankRefillHistory from './pages/waterAuthority/TankRefillHistory';
import TankMaintenanceHistory from './pages/waterAuthority/TankMaintenanceHistory';

// Water Quality Monitoring Pages
import WaterQuality from './pages/waterAuthority/WaterQuality';
import QualityReportDetails from './pages/waterAuthority/QualityReportDetails';
import AddQualityReport from './pages/waterAuthority/AddQualityReport';
import EditQualityReport from './pages/waterAuthority/EditQualityReport';
import InspectionSchedule from './pages/waterAuthority/InspectionSchedule';
import QualityAlerts from './pages/waterAuthority/QualityAlerts';

// Water Maintenance Management Pages
import MaintenanceManagement from './pages/waterAuthority/MaintenanceManagement';
import MaintenanceDetails from './pages/waterAuthority/MaintenanceDetails';
import AddMaintenance from './pages/waterAuthority/AddMaintenance';
import EditMaintenance from './pages/waterAuthority/EditMaintenance';
import MaintenanceTasks from './pages/waterAuthority/MaintenanceTasks';
// Water Emergency Shutdown Pages
import EmergencyShutdown from './pages/waterAuthority/EmergencyShutdown';
import EmergencyDetails from './pages/waterAuthority/EmergencyDetails';
import AddEmergency from './pages/waterAuthority/AddEmergency';
import EditEmergency from './pages/waterAuthority/EditEmergency';
import EmergencyHistory from './pages/waterAuthority/EmergencyHistory';

// Water Work Assignments Pages
import WorkAssignments from './pages/waterAuthority/WorkAssignments';
import AssignmentDetails from './pages/waterAuthority/AssignmentDetails';
import AssignmentHistory from './pages/waterAuthority/AssignmentHistory';
import NotificationCenter from './pages/waterAuthority/NotificationCenter';

// Water Reports & Analytics Pages
import ReportsDashboard from './pages/waterAuthority/ReportsDashboard';
import ComplaintReports from './pages/waterAuthority/ComplaintReports';
import WorkerReports from './pages/waterAuthority/WorkerReports';
import SupplyReports from './pages/waterAuthority/SupplyReports';
import PipelineReports from './pages/waterAuthority/PipelineReports';
import TankReports from './pages/waterAuthority/TankReports';
import WaterQualityReports from './pages/waterAuthority/WaterQualityReports';
import MaintenanceReports from './pages/waterAuthority/MaintenanceReports';
import EmergencyReports from './pages/waterAuthority/EmergencyReports';
import NotificationReports from './pages/waterAuthority/NotificationReports';

// Water Citizen Management & Settings Pages
import CitizenManagement from './pages/waterAuthority/CitizenManagement';
import CitizenDetails from './pages/waterAuthority/CitizenDetails';
import CitizenHistory from './pages/waterAuthority/CitizenHistory';
import Settings from './pages/waterAuthority/Settings';
import DepartmentProfile from './pages/waterAuthority/DepartmentProfile';
import NotificationSettings from './pages/waterAuthority/NotificationSettings';
import DashboardSettings from './pages/waterAuthority/DashboardSettings';

// Worker Portal Pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import MyTasks from './pages/worker/MyTasks';
import TaskDetails from './pages/worker/TaskDetails';
import TaskHistory from './pages/worker/TaskHistory';

// Traffic Management Pages
import TrafficDashboard from './pages/traffic/TrafficDashboard';
import TrafficWorkers from './pages/traffic/TrafficWorkers';

export default function App() {
  const dispatch = useDispatch();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentUser()).finally(() => {
      setAuthChecked(true);
    });
  }, [dispatch]);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOTP/></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword/></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute><ResetPassword/></PublicRoute>} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <UserDashboard/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/portal" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin']}>
              <AdminPortal />
            </ProtectedRoute>
          } 
        />
        
        {/* Water Authority Routes */}
        <Route 
          path="/water/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout>
                <WaterDashboard />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/complaints" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="complaints">
                <ComplaintManagement />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/complaints/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="complaints">
                <ComplaintDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/workers" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="workers">
                <WorkerManagement />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/workers/new" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="workers">
                <AddWorker />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/workers/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="workers">
                <WorkerProfile />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/workers/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="workers">
                <EditWorker />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Water Supply Schedule Routes */}
        <Route 
          path="/water/supply" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="supply">
                <WaterSupplySchedule />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/supply/new" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="supply">
                <AddSchedule />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/supply/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="supply">
                <ScheduleDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/supply/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="supply">
                <EditSchedule />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Pipeline Management Routes */}
        <Route 
          path="/water/pipelines" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="pipelines">
                <PipelineManagement />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/pipelines/new" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="pipelines">
                <AddPipeline />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/pipelines/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="pipelines">
                <PipelineDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/pipelines/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="pipelines">
                <EditPipeline />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/pipelines/:id/inspection" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="pipelines">
                <InspectionHistory />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/pipelines/:id/maintenance" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="pipelines">
                <MaintenanceHistory />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Water Tank Management Routes */}
        <Route 
          path="/water/tanks" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="tanks">
                <WaterTankManagement />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/tanks/new" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="tanks">
                <AddTank />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/tanks/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="tanks">
                <TankDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/tanks/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="tanks">
                <EditTank />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/tanks/:id/refill" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="tanks">
                <TankRefillHistory />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/tanks/:id/maintenance" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="tanks">
                <TankMaintenanceHistory />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Water Quality Monitoring Routes */}
        <Route 
          path="/water/quality" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="quality">
                <WaterQuality />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/quality/new" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="quality">
                <AddQualityReport />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/quality/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="quality">
                <QualityReportDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/quality/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="quality">
                <EditQualityReport />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/quality/inspection" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="quality">
                <InspectionSchedule />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/quality/alerts" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="quality">
                <QualityAlerts />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Water Maintenance Management Routes */}
        <Route 
          path="/water/maintenance" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="maintenance">
                <MaintenanceManagement />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/maintenance/new" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="maintenance">
                <AddMaintenance />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/maintenance/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="maintenance">
                <MaintenanceDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/maintenance/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="maintenance">
                <EditMaintenance />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/maintenance/:id/tasks" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="maintenance">
                <MaintenanceTasks />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/maintenance/:id/history" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="maintenance">
                <MaintenanceHistory />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Water Emergency Shutdown Routes */}
        <Route 
          path="/water/emergency" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="emergency">
                <EmergencyShutdown />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/emergency/new" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="emergency">
                <AddEmergency />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/emergency/history" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="emergency">
                <EmergencyHistory />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/emergency/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="emergency">
                <EmergencyDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/emergency/:id/edit" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="emergency">
                <EditEmergency />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Water Notification Center Routes */}
        <Route 
          path="/water/notifications" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="notifications">
                <NotificationCenter />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Water Reports & Analytics Routes */}
        <Route 
          path="/water/reports" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <ReportsDashboard />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/reports/complaints" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <ComplaintReports />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/reports/workers" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <WorkerReports />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/reports/supply" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <SupplyReports />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/reports/pipelines" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <PipelineReports />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/reports/tanks" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <TankReports />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/reports/quality" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <WaterQualityReports />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/reports/maintenance" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <MaintenanceReports />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/reports/emergency" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <EmergencyReports />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/reports/notifications" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="reports">
                <NotificationReports />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Water Citizen Management Routes */}
        <Route 
          path="/water/citizens" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="citizens">
                <CitizenManagement />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/citizens/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="citizens">
                <CitizenDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/citizens/:id/history" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="citizens">
                <CitizenHistory />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Water Department Settings Routes */}
        <Route 
          path="/water/settings" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="settings">
                <Settings />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/settings/profile" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="settings">
                <DepartmentProfile />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/settings/notifications" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="settings">
                <NotificationSettings />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/settings/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="settings">
                <DashboardSettings />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Work Assignment Routes (Admins) */}
        <Route 
          path="/water/assignments" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="assignments">
                <WorkAssignments />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/assignments/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="assignments">
                <AssignmentDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/water/assignments/history" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="assignments">
                <AssignmentHistory />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Worker Portal Routes */}
        <Route 
          path="/worker/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Worker']}>
              <WaterLayout activeTab="dashboard">
                <WorkerDashboard />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/worker/tasks" 
          element={
            <ProtectedRoute allowedRoles={['Worker']}>
              <WaterLayout activeTab="tasks">
                <MyTasks />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/worker/tasks/:id" 
          element={
            <ProtectedRoute allowedRoles={['Worker']}>
              <WaterLayout activeTab="tasks">
                <TaskDetails />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/worker/history" 
          element={
            <ProtectedRoute allowedRoles={['Worker']}>
              <WaterLayout activeTab="history">
                <TaskHistory />
              </WaterLayout>
            </ProtectedRoute>
          } 
        />

        {/* Traffic Authority Routes */}
        <Route 
          path="/traffic/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficDashboard/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/traffic/workers" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficWorkers/>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
