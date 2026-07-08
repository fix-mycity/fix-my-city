import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PublicRoute({ children }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (isAuthenticated) {
    // Structured role-based redirecting (easy to extend later)
    if (user?.role === 'admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    // Default dashboard for citizens
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
