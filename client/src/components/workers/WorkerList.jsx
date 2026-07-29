import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getWorkers, blockWorker, deleteWorker } from '../../services/workerService';
import { toastConfirm } from '../../utils/toastConfirm';
import WorkerAvailabilityBadge from './WorkerAvailabilityBadge';
import WorkerStatusBadge from './WorkerStatusBadge';
import WorkerLeaveRequests from './WorkerLeaveRequests';

export default function WorkerList({ department }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('DIRECTORY'); // 'DIRECTORY' | 'LEAVE_REQUESTS'
  const [workers, setWorkers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const [stats, setStats] = useState({ total: 0, available: 0, busy: 0, onLeave: 0 });

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const params = { page, page_size: pageSize, department };
      if (searchQuery) params.search = searchQuery;

      const response = await getWorkers(params);
      const items = response.data.items || [];
      setWorkers(items);
      setTotalItems(response.data.total_items || 0);
      setTotalPages(response.data.total_pages || 1);

      setStats({
        total: response.data.total_items || 0,
        available: items.filter(w => w.availability === 'AVAILABLE' && w.is_active !== false).length,
        busy: items.filter(w => w.availability === 'BUSY' && w.is_active !== false).length,
        onLeave: items.filter(w => w.availability === 'ON_LEAVE' || w.is_active === false).length,
      });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not retrieve field workers list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'DIRECTORY') {
      fetchWorkers();
    }
  }, [page, searchQuery, department, activeTab]);

  const handleToggleStatus = async (worker) => {
    try {
      await blockWorker(worker.id, department);
      toast.success(`Worker status updated successfully.`);
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update worker status.");
    }
  };

  const handleDelete = async (id) => {
    toastConfirm("Are you sure you want to permanently delete this field worker?", async () => {
      try {
        await deleteWorker(id, department);
        toast.success("Field worker deleted successfully.");
        fetchWorkers();
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to delete worker.");
      }
    });
  };

  const buttonClasses = {
    water: 'bg-blue-600 hover:bg-blue-700',
    traffic: 'bg-amber-600 hover:bg-amber-700',
    default: 'bg-slate-600 hover:bg-slate-700'
  };
  const primaryBtnClass = buttonClasses[department] || buttonClasses.default;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      {/* Top Header & Section Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {department === 'water' ? 'Water Authority ' : department === 'traffic' ? 'Traffic Control ' : ''}
            Worker Operations
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage field service crews, assignments, and review worker leave applications.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Main Tab Switcher */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('DIRECTORY')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'DIRECTORY'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">groups</span>
              Workers Directory
            </button>
            <button
              onClick={() => setActiveTab('LEAVE_REQUESTS')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'LEAVE_REQUESTS'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="material-symbols-outlined text-sm">event_busy</span>
              Leave Applications
            </button>
          </div>

          {activeTab === 'DIRECTORY' && (
            <button 
              onClick={() => navigate(`/${department}/workers/new`)}
              className={`flex items-center gap-2 px-4 py-2.5 ${primaryBtnClass} text-white rounded-xl font-bold text-xs transition-all shadow-sm shrink-0`}
            >
              <span className="material-symbols-outlined text-base">add</span>
              Register Worker
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'LEAVE_REQUESTS' ? (
        <WorkerLeaveRequests department={department} />
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <span className="material-symbols-outlined text-2xl">group</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Field Crew</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.total}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Available Now</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.available}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <span className="material-symbols-outlined text-2xl">construction</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">On Active Job</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.busy}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                <span className="material-symbols-outlined text-2xl">bedtime</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Off Shift / On Leave</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{stats.onLeave}</h3>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search workers by name, email, skill, or username..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                    <th className="px-6 py-4">Field Officer</th>
                    <th className="px-6 py-4">Contact Info</th>
                    <th className="px-6 py-4">Skill & Zone</th>
                    <th className="px-6 py-4">Duty Availability</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-blue-600">sync</span>
                        <p className="font-medium text-xs">Loading worker directory...</p>
                      </td>
                    </tr>
                  ) : workers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                          <span className="material-symbols-outlined text-2xl">search_off</span>
                        </div>
                        <p className="font-bold text-slate-800">No Field Workers Found</p>
                        <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or register a new worker.</p>
                      </td>
                    </tr>
                  ) : (
                    workers.map(w => (
                      <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {w.photo ? (
                                <img src={w.photo} alt={w.first_name} className="w-full h-full object-cover" />
                              ) : (
                                <span className="material-symbols-outlined text-slate-400 text-2xl">person</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{w.first_name} {w.last_name}</div>
                              <div className="text-xs text-slate-500">{w.designation || 'Field Worker'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-slate-800 font-medium text-xs">{w.email}</div>
                          <div className="text-xs text-slate-400">{w.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-50 text-blue-700 border border-blue-100 mb-0.5">
                            {w.skill || 'General'}
                          </span>
                          <div className="text-xs text-slate-500">{w.place || 'Unassigned Zone'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <WorkerAvailabilityBadge availability={w.availability} statusUpdatedAt={w.status_updated_at} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <WorkerStatusBadge status={w.is_active === false ? 'BLOCKED' : w.employment_status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => navigate(`/${department}/workers/${w.id}`)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="View Profile Details"
                            >
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button 
                              onClick={() => navigate(`/${department}/workers/${w.id}/edit`)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                              title="Edit Worker Profile"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button 
                              onClick={() => handleToggleStatus(w)}
                              className={`p-2 rounded-xl transition-colors ${w.is_active ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                              title={w.is_active ? "Block Worker Account" : "Unblock Worker Account"}
                            >
                              <span className="material-symbols-outlined text-lg">{w.is_active ? 'block' : 'check_circle'}</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(w.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Delete Worker"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-2xl shadow-sm sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-600">
                    Showing page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-3 py-2 rounded-l-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
