import React, { useState, useEffect } from 'react';
import { getMasterSummary } from '../../services/superAdminService';
import { toast } from 'react-hot-toast';
import { 
  Building2, 
  FileCheck2, 
  Clock, 
  Users, 
  HardHat, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SuperAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    setIsLoading(true);
    try {
      const res = await getMasterSummary();
      setSummary(res.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not load master analytics summary.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <span className="material-symbols-outlined animate-spin text-4xl text-purple-600">sync</span>
        <p className="text-sm font-medium text-slate-500">Aggregating city-wide municipal metrics...</p>
      </div>
    );
  }

  const kpis = [
    { title: 'Total Complaints Filed', value: summary?.total_complaints || 0, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { title: 'Resolved Incidents', value: summary?.resolved_complaints || 0, icon: FileCheck2, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { title: 'Closed & Approved', value: summary?.closed_complaints || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { title: 'Pending Review', value: summary?.pending_complaints || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { title: 'Total Registered Users', value: summary?.total_users || 0, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
    { title: 'Active Field Workers', value: summary?.total_workers || 0, icon: HardHat, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
    { title: 'Department Admins', value: summary?.total_admins || 0, icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' }
  ];

  const deptCounts = summary?.departments_summary || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-purple-200 text-xs font-bold mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> Real-Time City Telemetry Active
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Municipal Command Overview</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Live central operations dashboard monitoring all city infrastructure departments, citizen grievances, field crew operations, and security RBAC permissions.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.title}</span>
                <div className={`w-10 h-10 rounded-xl ${kpi.bg} border flex items-center justify-center ${kpi.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">{kpi.value.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* Department Metrics Breakdown & Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Volume Cards */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Department Incident Workload</h2>
              <p className="text-xs text-slate-500">Total complaints distributed across city service departments</p>
            </div>
            <Link to="/super-admin/complaints" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 space-y-2">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">Traffic Management</span>
              <div className="text-2xl font-extrabold text-amber-950">{deptCounts.traffic || 0} Incidents</div>
              <p className="text-[11px] text-amber-700">Road incidents, signals, marshals</p>
            </div>

            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-2">
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">Water Authority</span>
              <div className="text-2xl font-extrabold text-blue-950">{deptCounts.water || 0} Complaints</div>
              <p className="text-[11px] text-blue-700">Leaks, supply failures, pipelines</p>
            </div>

            <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100 space-y-2">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">Waste Management</span>
              <div className="text-2xl font-extrabold text-rose-950">{deptCounts.waste || 0} Complaints</div>
              <p className="text-[11px] text-rose-700">Dumping, collection, sanitation</p>
            </div>
          </div>
        </div>

        {/* Quick Management Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Master Quick Actions</h2>

          <div className="space-y-3">
            <Link
              to="/super-admin/users"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-200 text-slate-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Manage Roles & Permissions</div>
                  <div className="text-[11px] text-slate-500">Grant/revoke user permissions dynamically</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
            </Link>

            <Link
              to="/super-admin/complaints"
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 text-slate-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Reroute Complaints</div>
                  <div className="text-[11px] text-slate-500">Transfer misclassified complaints between departments</div>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
