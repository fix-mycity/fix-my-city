import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../features/auth/authThunks';
import { toast } from 'react-hot-toast';

export default function AdminPortal() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const rawPerms = user?.permissions || [];
  const permissions = rawPerms.map(p => (typeof p === 'string' ? p : p.permission_name));
  
  const isRootAdmin = user?.role === 'Super_Admin' || user?.role === 'Admin' || permissions.includes('admin:all');

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully!");
      navigate('/login');
    } catch (err) {
      toast.error(err || "Logout failed.");
    }
  };

  const handleCardClick = (dept) => {
    if (dept === 'water') {
      navigate('/water/dashboard');
    } else if (dept === 'traffic') {
      navigate('/traffic/dashboard');
    } else if (dept === 'emergency') {
      navigate('/admin/emergency');
    } else if (dept === 'super-admin') {
      navigate('/super-admin/dashboard');
    } else if (dept === 'waste') {
      toast.error("Waste Management module is currently under construction. Please check back later!");
    } else if (dept === 'general') {
      navigate('/general/dashboard');
    }
  };

  const hasWaterAccess = isRootAdmin || permissions.includes('dept:water') || permissions.includes('water:read') || permissions.includes('water:write');
  const hasTrafficAccess = isRootAdmin || permissions.includes('dept:traffic') || permissions.includes('traffic:read') || permissions.includes('traffic:write');
  const hasEmergencyAccess = isRootAdmin || permissions.includes('dept:emergency') || permissions.includes('emergency:read') || permissions.includes('emergency:write') || permissions.includes('emergency:dispatch');
  const hasWasteAccess = isRootAdmin || permissions.includes('dept:waste') || permissions.includes('waste:read') || permissions.includes('waste:write');

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col">
      {/* Premium Header */}
      <header className="bg-slate-900 text-white shadow-md z-10 shrink-0">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-blue-500 text-3xl font-bold">
              admin_panel_settings
            </span>
            <span className="text-xl font-bold tracking-tight">Fix My City Selection Hub</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-red-600 hover:text-white transition-all text-sm font-medium shadow-sm"
          >
            <span className="material-symbols-outlined text-base">logout</span>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Section */}
      <main className="flex-grow max-w-6xl mx-auto px-6 py-12 flex flex-col justify-center items-center w-full">
        <div className="text-center mb-10 max-w-xl">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            Welcome back, {user?.first_name || user?.username || 'System Admin'}
          </h1>
          <p className="text-slate-500 text-base font-medium">
            You hold administrative keys to municipal service modules. Select the console you wish to access below.
          </p>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-5xl mt-4">
          
          {/* Emergency Command Center Card */}
          {hasEmergencyAccess && (
            <div
              onClick={() => handleCardClick('emergency')}
              className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm flex flex-col gap-5 hover:shadow-xl hover:border-rose-400 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none" />
              <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl w-fit group-hover:bg-rose-600 group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">e911_emergency</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-rose-600 transition-colors duration-300 mb-2 flex items-center gap-2">
                  Emergency Command
                  <span className="text-[10px] font-extrabold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full uppercase">Priority</span>
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Monitor live 1-Click SOS beacons, dispatch multi-department crisis taskforces, and issue public advisories.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-rose-600 font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform duration-300">
                Open Console
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </div>
          )}

          {/* Water Operations Card */}
          {hasWaterAccess && (
            <div
              onClick={() => handleCardClick('water')}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5 hover:shadow-xl hover:border-blue-300 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl w-fit group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">water_drop</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors duration-300 mb-2">
                  Water Operations
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Manage authority alerts, view sensor charts, resolve complaints, and delegate tasks to field workers.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-blue-600 font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform duration-300">
                Open Console
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </div>
          )}

          {/* Traffic Command Center Card */}
          {hasTrafficAccess && (
            <div
              onClick={() => handleCardClick('traffic')}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5 hover:shadow-xl hover:border-amber-300 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl w-fit group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">traffic</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-amber-600 transition-colors duration-300 mb-2">
                  Traffic Control
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Monitor live incident mapping, update delays, oversee street camera signals, and track field service crews.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-amber-600 font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform duration-300">
                Open Console
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </div>
          )}

          {/* Waste Management Portal Card */}
          {hasWasteAccess && (
            <div
              onClick={() => handleCardClick('waste')}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5 hover:shadow-xl hover:border-emerald-300 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">delete_sweep</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors duration-300 mb-2">
                  Waste Management
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Oversee trash collection routes, schedule recurring cleanups, monitor recycling rates, and track truck fleets.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-emerald-600 font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform duration-300">
                Under Development
                <span className="material-symbols-outlined text-base">construction</span>
              </div>
            </div>
          )}

          {/* General Operations Command Card */}
          {permissions.includes('dept:general') && (
            <div
              onClick={() => handleCardClick('general')}
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-5 hover:shadow-xl hover:border-indigo-300 transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl w-fit group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">domain</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors duration-300 mb-2">
                  General Operations
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Manage municipal work orders, track general complaints queue, oversee civic technicians, and verify solutions.
                </p>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-indigo-600 font-bold text-sm tracking-wide uppercase group-hover:translate-x-2 transition-transform duration-300">
                Open Console
                <span className="material-symbols-outlined text-base">arrow_forward</span>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center shrink-0">
        <p className="text-slate-400 text-xs font-semibold">
          © {new Date().getFullYear()} Fix My City Operations. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
