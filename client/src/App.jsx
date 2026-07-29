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
import WorkerProfile from './pages/waterAuthority/WorkerProfile';

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
import WasteCollectionSchedule from './pages/wasteManagement/WasteCollectionSchedule';
import WasteRouteDetails from './pages/wasteManagement/RouteDetails';
import WasteVehicleManagement from './pages/wasteManagement/VehicleManagement';
import WasteVehicleDetails from './pages/wasteManagement/VehicleDetails';
import WasteWorkerManagement from './pages/wasteManagement/WorkerManagement';
import WasteWorkerDetails from './pages/wasteManagement/WorkerDetails';
import WasteMaintenanceManagement from './pages/wasteManagement/MaintenanceManagement';
import WasteMaintenanceDetails from './pages/wasteManagement/MaintenanceDetails';
import WasteNotificationCenter from './pages/wasteManagement/NotificationCenter';
import WasteReportsAnalytics from './pages/wasteManagement/ReportsAnalytics';

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

        {/* Citizen Routes */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Portal */}

        <Route
          path="/admin/portal"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin']}>
              <AdminPortal />
            </ProtectedRoute>
          }
        />

        {/* Worker Portal */}
        <Route
          path="/worker/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Worker']}>
              <WorkerLayout>
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
              <WaterLayout>
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

        {/* Traffic Authority */}

        <Route
          path="/traffic/dashboard"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficLayout>
                <TrafficDashboard/>
              </TrafficLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/traffic/incidents" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']} requiredPermissions={['dept:traffic']}>
              <TrafficLayout>
                <TrafficIncidents/>
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
              <TrafficMap/>
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
          path="/waste/schedules"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="schedules">
                <WasteCollectionSchedule />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/schedules/:id"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="schedules">
                <WasteRouteDetails />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/vehicles"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="vehicles">
                <WasteVehicleManagement />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/vehicles/:id"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="vehicles">
                <WasteVehicleDetails />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/workers"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="workers">
                <WasteWorkerManagement />
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
                <WasteWorkerDetails />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/maintenance"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="maintenance">
                <WasteMaintenanceManagement />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/maintenance/:id"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="maintenance">
                <WasteMaintenanceDetails />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/notifications"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="notifications">
                <WasteNotificationCenter />
              </WasteLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waste/reports"
          element={
            <ProtectedRoute allowedRoles={['Department_Admin', 'Super_Admin', 'Admin']}>
              <WasteLayout activeTab="reports">
                <WasteReportsAnalytics />
              </WasteLayout>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}