import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, allowedRoles, requiredPermissions }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Structured role-based authorization check (easy to extend later)
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  // Permission Check for hybrid/super users
  if (requiredPermissions && user.permissions) {
     const hasAllPermissions = requiredPermissions.every(perm => user.permissions.includes(perm));
     if (!hasAllPermissions) {
        return <Navigate to="/dashboard" replace />;
     }
  }

  return children;
}
