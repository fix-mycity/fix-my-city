import React, { useState, useEffect } from 'react';
import { 
  getSuperAdminUsers, 
  getAllRoles, 
  assignUserRole, 
  getAllPermissions, 
  getUserPermissions, 
  syncUserPermissions 
} from '../../services/superAdminService';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  Key, 
  Check, 
  X, 
  ChevronRight,
  Shield,
  UserCheck
} from 'lucide-react';

// Professional Human-Readable Permission Formatter
const formatPermissionName = (permName) => {
  if (!permName) return '';
  const map = {
    'admin:all': 'Full System Access (Root)',
    'traffic:read': 'Traffic Operations View',
    'traffic:write': 'Traffic Incidents Control',
    'water:read': 'Water Authority View',
    'water:write': 'Water Infrastructure Control',
    'waste:read': 'Waste Management View',
    'waste:write': 'Sanitation Operations Control',
    'worker:create': 'Field Worker Onboarding',
    'worker:read': 'Worker Directory View',
    'worker:update': 'Worker Profile Management',
    'complaint:read': 'Complaints Directory Access',
    'complaint:write': 'Complaint Filing & Updates',
    'complaint:reroute': 'Cross-Department Transfer',
    'dept:traffic': 'Traffic Department Right',
    'dept:water': 'Water Department Right',
    'dept:waste': 'Waste Department Right',
  };

  if (map[permName]) return map[permName];

  return permName
    .replace(/_/g, ' ')
    .replace(/:/g, ' - ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
};

export default function UserRolePermissionManagement() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Permission Batch Modal State
  const [selectedUserForPerms, setSelectedUserForPerms] = useState(null);
  const [userPermIds, setUserPermIds] = useState([]);
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const fetchInitialData = async () => {
    try {
      const [rolesRes, permsRes] = await Promise.all([getAllRoles(), getAllPermissions()]);
      setRoles(rolesRes.data.data || []);
      setAllPermissions(permsRes.data.data || []);
    } catch (err) {
      console.error("Error loading master roles/permissions:", err);
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const res = await getSuperAdminUsers(params);
      setUsers(res.data.items || []);
      setTotalPages(res.data.total_pages || 1);
      setTotalItems(res.data.total_items || 0);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not retrieve user directory.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    if (!newRoleId) return;
    try {
      const res = await assignUserRole(userId, parseInt(newRoleId));
      if (res.data.success) {
        toast.success("User role updated successfully!");
        fetchUsers();
      } else {
        toast.error(res.data.message || "Failed to update role");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to assign role.");
    }
  };

  const handleQuickAddPermission = async (user, permissionId) => {
    if (!permissionId) return;
    try {
      const res = await axiosInstance.post(`/permissions/users/${user.id}/permissions/${permissionId}`);
      if (res.data.success) {
        toast.success(`Permission granted to ${user.username}`);
        fetchUsers();
      } else {
        toast.error(res.data.message || "Could not add permission");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to grant permission.");
    }
  };

  const handleQuickRemovePermission = async (user, permissionId) => {
    try {
      const res = await axiosInstance.delete(`/permissions/users/${user.id}/permissions/${permissionId}`);
      if (res.data.success) {
        toast.success(`Permission revoked from ${user.username}`);
        fetchUsers();
      } else {
        toast.error(res.data.message || "Could not revoke permission");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to revoke permission.");
    }
  };

  const handleOpenPermissionsModal = (user) => {
    setSelectedUserForPerms(user);
    const existingIds = (user.permissions || []).map(p => p.id);
    setUserPermIds(existingIds);
  };

  const handleTogglePermission = (permId) => {
    setUserPermIds(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedUserForPerms) return;
    setIsSavingPerms(true);
    try {
      const res = await syncUserPermissions(selectedUserForPerms.id, userPermIds);
      if (res.data.success) {
        toast.success(`Permissions updated for ${selectedUserForPerms.username}`);
        setSelectedUserForPerms(null);
        fetchUsers();
      } else {
        toast.error(res.data.message || "Failed to update permissions.");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to sync permissions.");
    } finally {
      setIsSavingPerms(false);
    }
  };

  const getRoleBadgeStyle = (roleName) => {
    if (roleName === 'Super_Admin' || roleName === 'Admin') return 'bg-purple-100 text-purple-900 border-purple-300 font-extrabold';
    if (roleName === 'Department_Admin') return 'bg-blue-100 text-blue-900 border-blue-300 font-bold';
    if (roleName === 'Worker') return 'bg-indigo-100 text-indigo-900 border-indigo-300 font-bold';
    return 'bg-slate-100 text-slate-800 border-slate-300 font-semibold';
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            User Directory & Access Rights Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Assign system roles and configure professional access permissions for all municipal staff.</p>
        </div>

        <span className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          {totalItems} User Accounts
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All System Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.role_name}>{r.role_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Assigned Role (Dropdown)</th>
                <th className="px-6 py-4">Granted Access Rights & Quick Add</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-purple-600">sync</span>
                    <p className="font-medium text-xs">Loading user directory...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <p className="font-bold text-slate-800 text-base">No Users Found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting search parameters.</p>
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const assignedPermIds = (u.permissions || []).map(p => p.id);
                  const availableToGrant = allPermissions.filter(p => !assignedPermIds.includes(p.id));

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* User Details */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-base shadow-sm">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-base">{u.first_name} {u.last_name}</div>
                            <div className="text-xs text-slate-500 font-mono">@{u.username} • {u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* User Role Selection Dropdown */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <div className="relative inline-block w-full max-w-[170px]">
                            <select
                              value={u.role_id ? String(u.role_id) : ''}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="w-full bg-slate-100 border border-slate-300 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
                            >
                              <option value="" disabled>Select Role...</option>
                              {roles.map(r => (
                                <option key={r.id} value={String(r.id)}>
                                  {r.role_name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <span className={`block px-2 py-0.5 text-[10px] rounded-md border w-max ${getRoleBadgeStyle(u.role_name)}`}>
                            Active: {u.role_name}
                          </span>
                        </div>
                      </td>

                      {/* Granted Access Rights & Inline Add Dropdown */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {/* Granted Badges */}
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {u.permissions && u.permissions.length > 0 ? (
                              u.permissions.map(p => (
                                <span 
                                  key={p.id}
                                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs"
                                >
                                  <Shield className="w-3 h-3 text-purple-600" />
                                  {formatPermissionName(p.permission_name)}
                                  <button
                                    onClick={() => handleQuickRemovePermission(u, p.id)}
                                    className="hover:text-rose-600 text-purple-400 font-bold ml-1 transition-colors"
                                    title="Revoke Permission"
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">No specific rights assigned</span>
                            )}
                          </div>

                          {/* Quick Assign Permission Dropdown */}
                          <div className="flex items-center gap-2 pt-1">
                            <select
                              onChange={(e) => {
                                handleQuickAddPermission(u, e.target.value);
                                e.target.value = "";
                              }}
                              className="text-xs bg-slate-50 border border-slate-300 text-slate-800 font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs"
                            >
                              <option value="">+ Assign Access Right...</option>
                              {availableToGrant.map(p => (
                                <option key={p.id} value={p.id}>
                                  Grant: {formatPermissionName(p.permission_name)} ({p.description || 'Permission'})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        <button
                          onClick={() => handleOpenPermissionsModal(u)}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 hover:border-purple-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ml-auto shadow-sm"
                        >
                          <Key className="w-3.5 h-3.5 text-purple-600" />
                          Manage All
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PERMISSION MODAL */}
      {selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-600" />
                  Manage User Access Rights
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  User: <span className="text-slate-900 font-bold">{selectedUserForPerms.username}</span> ({selectedUserForPerms.email})
                </p>
              </div>
              <button 
                onClick={() => setSelectedUserForPerms(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Select Access Rights to Grant:
              </span>

              {allPermissions.map((perm) => {
                const isSelected = userPermIds.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission(perm.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-300 text-purple-900'
                        : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        {formatPermissionName(perm.permission_name)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{perm.description || 'System permission constraint'}</div>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setSelectedUserForPerms(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={isSavingPerms}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSavingPerms ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
