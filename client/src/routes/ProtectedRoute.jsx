import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, allowedRoles, requiredPermissions }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Structured role-based authorization check
  if (allowedRoles && user) {
    const isRoleAllowed = allowedRoles.includes(user.role) || user.role === 'Super_Admin' || user.role === 'Admin';
    if (!isRoleAllowed) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Permission-based authorization check
  if (requiredPermissions && user) {
    // Super_Admin and Admin have universal access across department modules
    if (user.role !== 'Super_Admin' && user.role !== 'Admin') {
      const userPermissions = user.permissions || [];
      const hasRequired = requiredPermissions.every((p) => userPermissions.includes(p));
      if (!hasRequired && userPermissions.length > 0) {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return children;
}
