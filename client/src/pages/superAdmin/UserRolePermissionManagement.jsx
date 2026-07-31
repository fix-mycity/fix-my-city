import React, { useState, useEffect } from 'react';
import { 
  getSuperAdminUsers, 
  getAllRoles, 
  assignUserRole, 
  getAllPermissions, 
  getUserPermissions, 
  syncUserPermissions 
} from '../../services/superAdminService';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  Key, 
  Check, 
  X, 
  Shield,
  ChevronLeft,
  ChevronRight
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
    'dept:traffic': 'Traffic Department Access',
    'dept:water': 'Water Department Access',
    'dept:waste': 'Waste Department Access',
    'emergency:read': 'Emergency Radar View',
    'emergency:write': 'Emergency Incident Management',
    'emergency:dispatch': 'Taskforce Rapid Dispatch',
    'emergency:broadcast': 'Public Emergency Advisories',
    'dept:emergency': 'Emergency Department Access',
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

  return (
    <div className="space-y-6 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-purple-600" />
            User Directory & Access Rights Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Assign system roles and configure professional access permissions for all municipal accounts.</p>
        </div>

        <span className="px-3.5 py-1.5 text-xs font-extrabold rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
          {totalItems} System Accounts
        </span>
      </div>

      {/* Search & Role Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search by username or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="">All System Roles</option>
            {roles.map(r => (
              <option key={r.id} value={r.role_name}>{r.role_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Classic Enterprise Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-extrabold">
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Assigned Role</th>
                <th className="px-6 py-4">Granted Access Rights</th>
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
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* User Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold text-base shadow-2xs">
                          {u.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-base">{u.first_name} {u.last_name}</div>
                          <div className="text-xs text-slate-500 font-mono">@{u.username} • {u.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Single Main Role Selector (Displaying Active Assigned Role) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="relative inline-block w-56 min-w-[210px]">
                        <select
                          value={u.role_id ? String(u.role_id) : ''}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="w-full bg-white border border-slate-300 hover:border-purple-400 text-slate-900 text-xs font-extrabold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-2xs transition-all"
                        >
                          <option value="" disabled>Select Role...</option>
                          {roles.map(r => (
                            <option key={r.id} value={String(r.id)} className="font-semibold text-slate-900 bg-white">
                              {r.role_name.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Granted Access Badges */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {u.permissions && u.permissions.length > 0 ? (
                          u.permissions.map(p => (
                            <span 
                              key={p.id}
                              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg bg-purple-50 text-purple-900 border border-purple-200 shadow-2xs"
                            >
                              <Shield className="w-3 h-3 text-purple-600" />
                              {formatPermissionName(p.permission_name)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No specific rights assigned</span>
                        )}
                      </div>
                    </td>

                    {/* Single Action Control Button: Manage Permissions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <button
                        onClick={() => handleOpenPermissionsModal(u)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ml-auto shadow-sm hover:shadow-md active:scale-95"
                      >
                        <Key className="w-3.5 h-3.5 text-white" />
                        Manage Permissions
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Enterprise Table Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 text-xs font-medium text-slate-600">
            <div>
              Showing Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-bold text-slate-700"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCTION-READY PERMISSION MODAL DRAWER */}
      {selectedUserForPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto custom-scrollbar">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col my-auto">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-600" />
                  Manage User Permissions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configuring access rights for <span className="text-slate-900 font-bold">{selectedUserForPerms.username}</span> ({selectedUserForPerms.email})
                </p>
              </div>
              <button 
                onClick={() => setSelectedUserForPerms(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Permissions Checkbox List */}
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block sticky top-0 bg-white py-1 z-10">
                Select Permissions to Grant:
              </span>

              {allPermissions.map((perm) => {
                const isSelected = userPermIds.includes(perm.id);
                return (
                  <div
                    key={perm.id}
                    onClick={() => handleTogglePermission(perm.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-50/90 border-purple-300 text-purple-950 shadow-2xs'
                        : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                        {formatPermissionName(perm.permission_name)}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{perm.description || 'System permission constraint'}</div>
                    </div>

                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-colors ${
                      isSelected ? 'bg-purple-600 border-purple-600 text-white shadow-2xs' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 shrink-0">
              <button
                onClick={() => setSelectedUserForPerms(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={isSavingPerms}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
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
