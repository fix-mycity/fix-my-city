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
