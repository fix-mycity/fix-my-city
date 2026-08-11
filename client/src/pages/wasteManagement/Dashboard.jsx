import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  ClipboardList, AlertTriangle, Trash2, Users, ArrowUpRight, ShieldQuestion, Plus, RefreshCw, CheckCircle 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import AddComplaintModal from '../../components/wasteManagement/AddComplaintModal';
import AddBinModal from '../../components/wasteManagement/AddBinModal';
import AddWorkerModal from '../../components/wasteManagement/AddWorkerModal';

import { getWasteDashboardSummary } from '../../services/wasteManagementService';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  // Quick Action Modal States
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isBinModalOpen, setIsBinModalOpen] = useState(false);
  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await getWasteDashboardSummary();
      setSummary(res.data);
    } catch (err) {
      console.error("Waste Dashboard fetch error:", err);
      toast.error("Failed to fetch live waste management metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    loadDashboardData();
    toast.success("Dashboard metrics synced.");
  };

  if (isLoading && !summary) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Cards stats
  const totalComplaints = summary?.cards?.total_complaints ?? 0;
  const pendingComplaints = summary?.cards?.pending_complaints ?? 0;
  const totalBins = summary?.cards?.total_waste_bins ?? 0;
  const totalWorkers = summary?.cards?.total_workers ?? 0;

  // Chart data formatting
  const rawStatusData = summary?.complaint_status || [];
  const statusData = rawStatusData.map(st => ({
    name: st.name,
    count: st.count
  }));

  const rawCategoryData = summary?.waste_categories || [];
  const categoryData = rawCategoryData.map(wc => ({
    name: wc.category,
    value: wc.count
  }));

  const COLORS = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Trash2 className="w-8 h-8 text-emerald-600" />
            Waste Management Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Real-time overview of sanitation complaints, active waste bins, and workers.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-550 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl transition-all shadow-sm"
          style={{ border: '1px solid #10b981' }}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Live Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Total Complaints */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Complaints</span>
            <h3 className="text-2xl font-bold text-slate-800">{totalComplaints}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Pending Complaints */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Issues</span>
            <h3 className="text-2xl font-bold text-amber-600">{pendingComplaints}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Total Waste Bins */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Smart Waste Bins</span>
            <h3 className="text-2xl font-bold text-emerald-700">{totalBins}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Active Workers */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sanitation Workers</span>
            <h3 className="text-2xl font-bold text-slate-800">{totalWorkers}</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-650 rounded-xl">
            <Users className="w-6 h-6 text-slate-600" />
          </div>
        </div>
      </div>

      {/* Quick Administrative Actions Panel */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          Quick Administrative Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setIsComplaintModalOpen(true)}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-all border border-emerald-200"
          >
            <Plus className="w-4 h-4" />
            Add New Complaint
          </button>
          <button
            onClick={() => setIsBinModalOpen(true)}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-all border border-emerald-200"
          >
            <Plus className="w-4 h-4" />
            Register Smart Bin
          </button>
          <button
            onClick={() => setIsWorkerModalOpen(true)}
            className="flex items-center justify-center gap-2 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl transition-all border border-emerald-200"
          >
            <Plus className="w-4 h-4" />
            Add Sanitation Worker
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Complaints Status Trend</h2>
          <div className="h-80 w-full">
            {statusData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm gap-2">
                <ShieldQuestion className="w-8 h-8 text-slate-350" />
                No complaints metrics found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Waste Categories Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Bins by Waste Category</h2>
          <div className="h-80 w-full flex flex-col justify-center items-center">
            {categoryData.length === 0 ? (
              <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                <ShieldQuestion className="w-8 h-8 text-slate-300" />
                No bin category metrics found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recent Complaints Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Recent Sanitation Complaints</h2>
          <Link to="/waste/complaints" className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-1 transition-colors">
            View Queue <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Reporter</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(summary?.recent_complaints || []).slice(0, 5).map((complaint) => (
                <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{complaint.complaint_number}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{complaint.title}</td>
                  <td className="px-6 py-4">{complaint.category || 'Waste Pickup'}</td>
                  <td className="px-6 py-4">{complaint.citizen_name || 'Anonymous'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      complaint.status === 'NEW' || complaint.status === 'PENDING' ? 'bg-emerald-50 text-emerald-600' :
                      complaint.status === 'RESOLVED' || complaint.status === 'CLOSED' || complaint.status === 'COMPLETED' ? 'bg-emerald-700 text-white' : 'bg-amber-550 text-amber-700'
                    }`} style={{
                      backgroundColor: complaint.status === 'NEW' || complaint.status === 'PENDING' ? '#ecfdf5' :
                        (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED' || complaint.status === 'COMPLETED' ? '#047857' : '#fef3c7'),
                      color: complaint.status === 'NEW' || complaint.status === 'PENDING' ? '#047857' :
                        (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED' || complaint.status === 'COMPLETED' ? '#ffffff' : '#b45309')
                    }}>
                      {complaint.status}
                    </span>
                  </td>
                </tr>
              ))}
              {(!summary?.recent_complaints || summary.recent_complaints.length === 0) && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">No waste complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modals */}
      <AddComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        onSuccess={loadDashboardData}
      />

      <AddBinModal
        isOpen={isBinModalOpen}
        onClose={() => setIsBinModalOpen(false)}
        onSuccess={loadDashboardData}
      />

      <AddWorkerModal
        isOpen={isWorkerModalOpen}
        onClose={() => setIsWorkerModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
}
