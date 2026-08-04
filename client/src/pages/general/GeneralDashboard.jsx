import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listGeneralComplaintsApi, listGeneralWorkersApi } from '../../api/generalApi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  ClipboardList, AlertTriangle, CheckCircle, Clock, Users, ArrowUpRight, ShieldQuestion 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function GeneralDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [complaintsRes, workersRes] = await Promise.all([
          listGeneralComplaintsApi({ page: 1, page_size: 100 }),
          listGeneralWorkersApi({ page: 1, page_size: 100 })
        ]);
        setComplaints(complaintsRes.data.items || []);
        setWorkers(workersRes.data.items || []);
      } catch (err) {
        toast.error("Failed to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculations
  const totalComplaints = complaints.length;
  const newComplaints = complaints.filter(c => c.status === 'NEW').length;
  const assignedComplaints = complaints.filter(c => c.status === 'ASSIGNED').length;
  const inProgressComplaints = complaints.filter(c => c.status === 'IN_PROGRESS').length;
  const resolvedComplaints = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  
  const totalWorkers = workers.length;
  const availableWorkers = workers.filter(w => w.availability === 'AVAILABLE').length;

  // Category statistics
  const categoriesMap = complaints.reduce((acc, curr) => {
    const cat = curr.category || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoriesMap).map(name => ({
    name,
    value: categoriesMap[name]
  }));

  // Status trend data
  const statusData = [
    { name: 'New', count: newComplaints },
    { name: 'Assigned', count: assignedComplaints },
    { name: 'In Progress', count: inProgressComplaints },
    { name: 'Resolved', count: resolvedComplaints }
  ];

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">General Operations Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time overview of general complaints, municipal field workers, and resolutions.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Complaints</span>
            <h3 className="text-2xl font-bold text-slate-800">{totalComplaints}</h3>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Assignment</span>
            <h3 className="text-2xl font-bold text-amber-600">{newComplaints}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resolved Issues</span>
            <h3 className="text-2xl font-bold text-emerald-600">{resolvedComplaints}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active General Workers</span>
            <h3 className="text-2xl font-bold text-slate-800">
              {availableWorkers} <span className="text-sm font-normal text-slate-400">/ {totalWorkers}</span>
            </h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Complaints Status Trend</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Issues by Category</h2>
          <div className="h-80 w-full flex flex-col justify-center items-center">
            {categoryData.length === 0 ? (
              <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                <ShieldQuestion className="w-8 h-8 text-slate-300" />
                No complaints logged yet.
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
          <h2 className="text-lg font-bold text-slate-800">Recent General Complaints</h2>
          <Link to="/general/complaints" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1 transition-colors">
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
              {complaints.slice(0, 5).map((complaint) => (
                <tr key={complaint.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{complaint.complaint_number}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{complaint.title}</td>
                  <td className="px-6 py-4">{complaint.category || 'General'}</td>
                  <td className="px-6 py-4">{complaint.citizen_name || 'Anonymous'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      complaint.status === 'NEW' ? 'bg-indigo-50 text-indigo-600' :
                      complaint.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {complaint.status}
                    </span>
                  </td>
                </tr>
              ))}
              {complaints.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-slate-400">No general complaints found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
