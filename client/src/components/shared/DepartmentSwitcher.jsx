import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldAlert, Droplet, Car, Shield, ChevronDown } from 'lucide-react';

export default function DepartmentSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth || {});

  if (!user) return null;

  const rawPerms = user.permissions || [];
  const userPerms = rawPerms.map(p => (typeof p === 'string' ? p : p.permission_name));
  const isRootAdmin = user.role === 'Super_Admin' || user.role === 'Admin' || userPerms.includes('admin:all');

  // Available department destinations based on granted permissions
  const availableDepts = [];

  if (isRootAdmin) {
    availableDepts.push({
      id: 'super-admin',
      name: 'Super Admin Portal',
      path: '/super-admin/dashboard',
      icon: Shield,
      badge: 'Root'
    });
  }

  if (isRootAdmin || userPerms.includes('dept:traffic') || userPerms.includes('traffic:read') || userPerms.includes('traffic:write')) {
    availableDepts.push({
      id: 'traffic',
      name: 'Traffic Control',
      path: '/traffic/dashboard',
      icon: Car,
      badge: 'Traffic'
    });
  }

  if (isRootAdmin || userPerms.includes('dept:water') || userPerms.includes('water:read') || userPerms.includes('water:write')) {
    availableDepts.push({
      id: 'water',
      name: 'Water Authority',
      path: '/water/dashboard',
      icon: Droplet,
      badge: 'Water'
    });
  }

  if (isRootAdmin || userPerms.includes('dept:emergency') || userPerms.includes('emergency:read') || userPerms.includes('emergency:write') || userPerms.includes('emergency:dispatch')) {
    availableDepts.push({
      id: 'emergency',
      name: 'Emergency Command',
      path: '/emergency/dashboard',
      icon: ShieldAlert,
      badge: 'Emergency'
    });
  }

  // Determine active department based on URL route
  const currentPath = location.pathname;
  let activeDeptId = availableDepts[0]?.id || '';
  if (currentPath.includes('/traffic')) activeDeptId = 'traffic';
  else if (currentPath.includes('/water')) activeDeptId = 'water';
  else if (currentPath.includes('/emergency')) activeDeptId = 'emergency';
  else if (currentPath.includes('/super-admin')) activeDeptId = 'super-admin';

  // If user only has access to 1 department, show clean static indicator
  if (availableDepts.length <= 1) {
    const activeDept = availableDepts[0];
    if (!activeDept) return null;
    const Icon = activeDept.icon;
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-xs font-bold shadow-2xs">
        <Icon className="w-4 h-4 text-purple-400 shrink-0" />
        <span className="truncate">{activeDept.name}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5 font-sans">
      <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block px-1">
        Department Selector ({availableDepts.length} Authorized)
      </label>
      <div className="relative">
        <select
          value={activeDeptId}
          onChange={(e) => {
            const selected = availableDepts.find(d => d.id === e.target.value);
            if (selected) navigate(selected.path);
          }}
          className="w-full bg-slate-800 hover:bg-slate-700/80 border border-purple-500/40 text-white text-xs font-bold rounded-xl px-3 py-2.5 appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm transition-all"
        >
          {availableDepts.map((d) => (
            <option key={d.id} value={d.id} className="bg-slate-900 text-white font-semibold py-1">
              {d.name}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-purple-400 absolute right-3 top-3 pointer-events-none" />
      </div>
    </div>
  );
}
