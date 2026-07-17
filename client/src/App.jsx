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
import TrafficDashboard from './pages/traffic/TrafficDashboard';
import TrafficWorkers from './pages/traffic/TrafficWorkers';
import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';

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
          path="/reports" 
          element={
            <ProtectedRoute>
              <ReportsPage/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/traffic/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']}>
              <TrafficDashboard/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/traffic/workers" 
          element={
            <ProtectedRoute allowedRoles={['Department_Admin']}>
              <TrafficWorkers/>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}