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
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart3,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

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
        <p className="text-sm font-medium text-slate-500">Aggregating city-wide telemetry & Recharts analytics...</p>
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
  const weeklyTrendData = summary?.weekly_trend || [];

  // Recharts Data Formatters
  const departmentPieData = [
    { name: 'Traffic Management', value: deptCounts.traffic || 0, color: '#f59e0b' },
    { name: 'Water Authority', value: deptCounts.water || 0, color: '#3b82f6' },
    { name: 'Waste Management', value: deptCounts.waste || 0, color: '#10b981' }
  ];

  const statusBarData = [
    { status: 'Pending Review', count: summary?.pending_complaints || 0, fill: '#f59e0b' },
    { status: 'In Progress', count: summary?.active_complaints || 0, fill: '#3b82f6' },
    { status: 'Resolved', count: summary?.resolved_complaints || 0, fill: '#8b5cf6' },
    { status: 'Closed & Approved', count: summary?.closed_complaints || 0, fill: '#10b981' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
          <p className="font-bold border-b border-slate-700 pb-1">{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
              <span className="text-slate-300">{entry.name || entry.dataKey}:</span>
              <span className="font-bold text-white">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 md:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-purple-200 text-xs font-bold mb-3">
            <TrendingUp className="w-3.5 h-3.5" /> Real-Time City Telemetry & Recharts Active
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Municipal Command Overview</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Live central operations dashboard monitoring city infrastructure departments, complaint resolution trends, and RBAC permissions.
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

      {/* RECHARTS ANALYTICS SECTION 1: 7-Day Trend & Department Donut Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: 7-Day City Complaint Trend (AreaChart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                Weekly Complaint Inflow & Resolution Telemetry
              </h2>
              <p className="text-xs text-slate-500">7-day historical timeline comparing tickets filed vs resolved</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
              Live Trend Analytics
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="filedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area type="monotone" dataKey="filed" name="Complaints Filed" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#filedGradient)" />
                <Area type="monotone" dataKey="resolved" name="Complaints Resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#resolvedGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Department Share (Donut / Pie Chart) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-amber-500" />
              Department Workload Share
            </h2>
            <p className="text-xs text-slate-500">Distribution of complaints by city department</p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {departmentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3">
            {departmentPieData.map((dept, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></span>
                  <span className="font-semibold text-slate-700">{dept.name}</span>
                </div>
                <span className="font-extrabold text-slate-900">{dept.value} Tickets</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RECHARTS ANALYTICS SECTION 2: Status Bar Chart & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 3: Status Breakdown Comparison (BarChart) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Complaint Status Breakdown
              </h2>
              <p className="text-xs text-slate-500">Current state of tickets from Pending to Closed</p>
            </div>
            <Link to="/super-admin/complaints" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
              Master Complaints <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusBarData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Total Volume" radius={[8, 8, 0, 0]}>
                  {statusBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Management Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Master Operations Console</h2>
            <p className="text-xs text-slate-500 mb-4">Direct access to core municipal control systems</p>

            <div className="space-y-3">
              <Link
                to="/super-admin/users"
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-200 text-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Manage Access Rights & RBAC</div>
                    <div className="text-[11px] text-slate-500">Configure user roles and system rights</div>
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

          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-purple-900 text-xs space-y-1 mt-4">
            <span className="font-extrabold flex items-center gap-1.5 text-purple-950">
              <CheckCircle2 className="w-4 h-4 text-purple-600" /> Telemetry Engine Online
            </span>
            <p className="text-purple-700 text-[11px]">All microservices reporting healthy response rates.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
