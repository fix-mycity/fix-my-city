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
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';
import FeedPage from './pages/FeedPage';

import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

import AdminPortal from './pages/auth/AdminPortal';

// Shared Unified Worker Components
import WorkerList from './components/workers/WorkerList';
import WorkerForm from './components/workers/WorkerForm';

// Worker Role Interface
import WorkerLayout from './layout/WorkerLayout';
import WorkerDashboard from './pages/worker/WorkerDashboard';

// Water Management
import WaterLayout from './layout/WaterLayout';
import WaterDashboard from './pages/waterAuthority/Dashboard';
import ComplaintManagement from './pages/waterAuthority/ComplaintManagement';
import ComplaintDetails from './pages/waterAuthority/ComplaintDetails';
import WorkAssignments from './pages/waterAuthority/WorkAssignments';
import AssignmentDetails from './pages/waterAuthority/AssignmentDetails';
import AssignmentHistory from './pages/waterAuthority/AssignmentHistory';
import WorkerProfile from './pages/waterAuthority/WorkerProfile';
import WaterSupplySchedule from './pages/waterAuthority/WaterSupplySchedule';
import AddSchedule from './pages/waterAuthority/AddSchedule';
import ScheduleDetails from './pages/waterAuthority/ScheduleDetails';
import EditSchedule from './pages/waterAuthority/EditSchedule';
import PipelineManagement from './pages/waterAuthority/PipelineManagement';
import AddPipeline from './pages/waterAuthority/AddPipeline';
import PipelineDetails from './pages/waterAuthority/PipelineDetails';
import EditPipeline from './pages/waterAuthority/EditPipeline';
import InspectionSchedule from './pages/waterAuthority/InspectionSchedule';
import InspectionHistory from './pages/waterAuthority/InspectionHistory';
import WaterTankManagement from './pages/waterAuthority/WaterTankManagement';
import AddTank from './pages/waterAuthority/AddTank';
import TankDetails from './pages/waterAuthority/TankDetails';
import EditTank from './pages/waterAuthority/EditTank';
import TankRefillHistory from './pages/waterAuthority/TankRefillHistory';
import TankMaintenanceHistory from './pages/waterAuthority/TankMaintenanceHistory';
import WaterQuality from './pages/waterAuthority/WaterQuality';
import AddQualityReport from './pages/waterAuthority/AddQualityReport';
import QualityAlerts from './pages/waterAuthority/QualityAlerts';
import QualityReportDetails from './pages/waterAuthority/QualityReportDetails';
import EditQualityReport from './pages/waterAuthority/EditQualityReport';
import MaintenanceManagement from './pages/waterAuthority/MaintenanceManagement';
import AddMaintenance from './pages/waterAuthority/AddMaintenance';
import MaintenanceHistory from './pages/waterAuthority/MaintenanceHistory';
import MaintenanceDetails from './pages/waterAuthority/MaintenanceDetails';
import EditMaintenance from './pages/waterAuthority/EditMaintenance';
import MaintenanceTasks from './pages/waterAuthority/MaintenanceTasks';
import EmergencyShutdown from './pages/waterAuthority/EmergencyShutdown';
import AddEmergency from './pages/waterAuthority/AddEmergency';
import EmergencyHistory from './pages/waterAuthority/EmergencyHistory';
import EmergencyDetails from './pages/waterAuthority/EmergencyDetails';
import EditEmergency from './pages/waterAuthority/EditEmergency';
import NotificationCenter from './pages/waterAuthority/NotificationCenter';
import ReportsDashboard from './pages/waterAuthority/ReportsDashboard';
import CitizenManagement from './pages/waterAuthority/CitizenManagement';
import CitizenDetails from './pages/waterAuthority/CitizenDetails';
import CitizenHistory from './pages/waterAuthority/CitizenHistory';
import Settings from './pages/waterAuthority/Settings';

// Traffic Management Pages
import TrafficLayout from './layout/TrafficLayout';
import TrafficDashboard from './pages/traffic/Dashboard';
import TrafficMap from './pages/traffic/TrafficMap';
import TrafficIncidents from './pages/traffic/TrafficIncidents';

// Waste Management Pages
import WasteLayout from './layout/WasteLayout';
import WasteDashboard from './pages/wasteManagement/Dashboard';
import WasteComplaintManagement from './pages/wasteManagement/ComplaintManagement';
import WasteComplaintDetails from './pages/wasteManagement/ComplaintDetails';
import WasteBinManagement from './pages/wasteManagement/WasteBinManagement';
import WasteBinDetails from './pages/wasteManagement/BinDetails';
import WasteWorkerManagement from './pages/wasteManagement/WorkerManagement';
import WasteWorkerDetails from './pages/wasteManagement/WorkerDetails';
import WasteSuggestions from './pages/wasteManagement/WasteSuggestions';
import WastePosts from './pages/wasteManagement/WastePosts';

// General Management Module
import GeneralLayout from './layout/GeneralLayout';
import GeneralDashboard from './pages/general/GeneralDashboard';
import GeneralComplaintList from './pages/general/GeneralComplaintList';
import GeneralWorkerList from './pages/general/GeneralWorkerList';
import GeneralSuggestions from './pages/general/GeneralSuggestions';
import GeneralPosts from './pages/general/GeneralPosts';

// Super Admin Module
import SuperAdminLayout from './layout/SuperAdminLayout';
import SuperAdminDashboard from './pages/superAdmin/SuperAdminDashboard';
import UserRolePermissionManagement from './pages/superAdmin/UserRolePermissionManagement';
import MasterComplaintsReroute from './pages/superAdmin/MasterComplaintsReroute';

// Emergency Management Module
import EmergencyLayout from './layout/EmergencyLayout';
import EmergencyDashboard from './pages/emergency/EmergencyDashboard';
import EmergencyComplaints from './pages/emergency/EmergencyComplaints';

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

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/verify-otp"
          element={
            <PublicRoute>
              <VerifyOTP />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

        {/* User Application Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Citizen']}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={['Citizen']}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['Citizen', 'Department_Admin', 'Worker', 'Super_Admin', 'Admin']}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />

        {/* Legacy Admin Portal */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <AdminPortal />
            </ProtectedRoute>
          }
        />

        {/* Worker Interface Routes */}
        <Route
          path="/worker/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Worker']}>
              <WorkerLayout activeTab="dashboard">
                <WorkerDashboard />
              </WorkerLayout>
            </ProtectedRoute>
          }
        />

        {/* Water Authority */}
        <Route
          path="/water/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin']}
              requiredPermissions={['dept:water']}
            >
              <WaterLayout activeTab="dashboard">
                <WaterDashboard />
              </WaterLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/water/complaints"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin']}
              requiredPermissions={['dept:water']}
            >
              <WaterLayout activeTab="complaints">
                <ComplaintManagement />
              </WaterLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/water/complaints/:id"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin']}
              requiredPermissions={['dept:water']}
            >
              <WaterLayout activeTab="complaints">
                <ComplaintDetails />
              </WaterLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/water/workers"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin']}
              requiredPermissions={['dept:water']}
            >
              <WaterLayout activeTab="workers">
                <WorkerList department="water" />
              </WaterLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/water/workers/new"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin']}
              requiredPermissions={['dept:water']}
            >
              <WaterLayout activeTab="workers">
                <WorkerForm department="water" />
              </WaterLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/water/workers/:id"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin']}
              requiredPermissions={['dept:water']}
            >
              <WaterLayout activeTab="workers">
                <WorkerProfile />
              </WaterLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/water/workers/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin']}
              requiredPermissions={['dept:water']}
            >
              <WaterLayout activeTab="workers">
                <WorkerForm department="water" />
              </WaterLayout>
            </ProtectedRoute>
          }
        />

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
          path="/water/assignments/history"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="assignments">
                <AssignmentHistory />
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
                <InspectionSchedule />
              </WaterLayout>
            </ProtectedRoute>
          }
        />

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
          path="/water/quality/alerts"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="quality">
                <QualityAlerts />
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
          path="/water/maintenance/history"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:water']}>
              <WaterLayout activeTab="maintenance">
                <MaintenanceHistory />
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

        {/* Traffic Authority */}

        <Route
          path="/traffic/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficLayout>
                <TrafficDashboard />
              </TrafficLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/traffic/incidents"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficLayout>
                <TrafficIncidents />
              </TrafficLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/traffic/workers"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficLayout>
                <WorkerList department="traffic" />
              </TrafficLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/traffic/workers/new"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficLayout>
                <WorkerForm department="traffic" />
              </TrafficLayout>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/traffic/workers/:id" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficLayout>
                <WorkerProfile department="traffic" />
              </TrafficLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/traffic/workers/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficLayout>
                <WorkerForm department="traffic" />
              </TrafficLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/traffic/live-map"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficMap />
            </ProtectedRoute>
          }
        />

        {/* Super Admin Module */}
        <Route
          path="/super-admin"
          element={
            <ProtectedRoute allowedRoles={['Super_Admin', 'Admin']}>
              <SuperAdminLayout>
                <SuperAdminDashboard />
              </SuperAdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Super_Admin', 'Admin']}>
              <SuperAdminLayout>
                <SuperAdminDashboard />
              </SuperAdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/users"
          element={
            <ProtectedRoute allowedRoles={['Super_Admin', 'Admin']}>
              <SuperAdminLayout>
                <UserRolePermissionManagement />
              </SuperAdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/super-admin/complaints"
          element={
            <ProtectedRoute allowedRoles={['Super_Admin', 'Admin']}>
              <SuperAdminLayout>
                <MasterComplaintsReroute />
              </SuperAdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Waste Management Routes */}
        <Route
          path="/waste"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="dashboard">
                <WasteDashboard />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        {/* Emergency Department Module */}
        <Route
          path="/emergency/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}
              requiredPermissions={['dept:emergency']}
            >
              <EmergencyLayout>
                <EmergencyDashboard />
              </EmergencyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="dashboard">
                <WasteDashboard />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency/complaints"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}
              requiredPermissions={['dept:emergency']}
            >
              <EmergencyLayout>
                <EmergencyComplaints />
              </EmergencyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/complaints"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="complaints">
                <WasteComplaintManagement />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency/workers"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}
              requiredPermissions={['dept:emergency']}
            >
              <EmergencyLayout>
                <WorkerList department="emergency" />
              </EmergencyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/complaints/:id"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="complaints">
                <WasteComplaintDetails />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency/workers/new"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}
              requiredPermissions={['dept:emergency']}
            >
              <EmergencyLayout>
                <WorkerForm department="emergency" />
              </EmergencyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/bins"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="bins">
                <WasteBinManagement />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency/workers/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}
              requiredPermissions={['dept:emergency']}
            >
              <EmergencyLayout>
                <WorkerForm department="emergency" />
              </EmergencyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/bins/:id"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="bins">
                <WasteBinDetails />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/emergency/broadcasts"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}
              requiredPermissions={['dept:emergency']}
            >
              <EmergencyLayout>
                <EmergencyDashboard />
              </EmergencyLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/suggestions"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="suggestions">
                <WasteSuggestions />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/workers"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="workers">
                <WorkerList department="waste" />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/workers/new"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="workers">
                <WorkerForm department="waste" />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/workers/create"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="workers">
                <WorkerForm department="waste" />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/workers/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="workers">
                <WorkerForm department="waste" />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/workers/:id"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="workers">
                <WorkerProfile department="waste" />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/posts"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="posts">
                <WastePosts />
              </WasteLayout>
            </ProtectedRoute>
          }
        />

        {/* General Department Module */}
        <Route
          path="/general/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:general']}>
              <GeneralLayout>
                <GeneralDashboard />
              </GeneralLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/general/complaints"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:general']}>
              <GeneralLayout>
                <GeneralComplaintList />
              </GeneralLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/general/workers"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:general']}>
              <GeneralLayout>
                <GeneralWorkerList />
              </GeneralLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/general/workers/new"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:general']}>
              <GeneralLayout>
                <WorkerForm department="general" />
              </GeneralLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/general/workers/:id"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:general']}>
              <GeneralLayout>
                <WorkerProfile department="general" />
              </GeneralLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/general/workers/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:general']}>
              <GeneralLayout>
                <WorkerForm department="general" />
              </GeneralLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/general/suggestions"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:general']}>
              <GeneralLayout>
                <GeneralSuggestions />
              </GeneralLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/general/posts"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:general']}>
              <GeneralLayout>
                <GeneralPosts />
              </GeneralLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/emergency"
          element={
            <ProtectedRoute
              allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}
              requiredPermissions={['dept:emergency']}
            >
              <EmergencyLayout>
                <EmergencyDashboard />
              </EmergencyLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}