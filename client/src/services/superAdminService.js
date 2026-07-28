import axiosInstance from '../api/axiosInstance';

// Master Summary
export const getMasterSummary = () => axiosInstance.get('/city/super-admin/dashboard/summary');

// Users Directory
export const getSuperAdminUsers = (params) => axiosInstance.get('/city/super-admin/users', { params });

// Roles & Permissions Management
export const getAllRoles = () => axiosInstance.get('/roles');
export const createRole = (data) => axiosInstance.post('/roles', data);
export const deleteRole = (roleId) => axiosInstance.delete(`/roles/${roleId}`);
export const assignUserRole = (userId, roleId) => axiosInstance.post('/roles/assign-role', { user_id: userId, role_id: roleId });

export const getAllPermissions = () => axiosInstance.get('/permissions');
export const createPermission = (data) => axiosInstance.post('/permissions', data);
export const deletePermission = (permissionId) => axiosInstance.delete(`/permissions/${permissionId}`);
export const getUserPermissions = (userId) => axiosInstance.get(`/permissions/users/${userId}`);
export const syncUserPermissions = (userId, permissionIds) => axiosInstance.post(`/permissions/users/${userId}/batch`, { permission_ids: permissionIds });

// Master Complaints & Rerouting
export const getAllComplaints = (params) => axiosInstance.get('/city/complaints/', { params });
export const rerouteComplaint = (complaintId, targetDepartment, adminNotes = '') => 
  axiosInstance.post(`/city/super-admin/complaints/${complaintId}/reroute`, { target_department: targetDepartment, admin_notes: adminNotes });
