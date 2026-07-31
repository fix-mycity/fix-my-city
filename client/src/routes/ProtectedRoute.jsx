import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute({ children, allowedRoles, requiredPermissions }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Super_Admin and Admin roles have master access to all protected routes automatically
  if (user && (user.role === 'Super_Admin' || user.role === 'Admin')) {
    return children;
  }

  // Structured role-based authorization check
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  // Permission-based authorization check (supporting strings and object schemas)
  if (requiredPermissions && user) {
    const rawPerms = user.permissions || [];
    const userPermissions = rawPerms.map(p => (typeof p === 'string' ? p : p.permission_name));
    
    const hasRequired = requiredPermissions.every((reqPerm) => {
      if (userPermissions.includes(reqPerm) || userPermissions.includes('admin:all')) {
        return true;
      }
      // If reqPerm is e.g. 'dept:water', check if user has 'water:read' or 'water:write'
      if (reqPerm.startsWith('dept:')) {
        const deptKey = reqPerm.replace('dept:', '');
        return userPermissions.some(up => up.startsWith(deptKey));
      }
      return false;
    });

    if (!hasRequired) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}
