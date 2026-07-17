import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, allowedRoles, requiredPermissions }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Structured role-based authorization check
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  // Permission-based authorization check
  if (requiredPermissions && user) {
    const userPermissions = user.permissions || [];
    const hasRequired = requiredPermissions.every((p) => userPermissions.includes(p));
    if (!hasRequired) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
