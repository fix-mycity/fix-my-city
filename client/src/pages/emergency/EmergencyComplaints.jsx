import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getActiveEmergencies, resolveEmergency, dispatchTaskforce, getNearbyWorkers } from '../../services/emergencyService';
import { 
  ShieldAlert, Search, Filter, RefreshCw, HeartPulse, Flame, Shield, 
  Droplets, Car, Trash2, CheckCircle2, UserPlus, X, UserCheck, Loader2
} from 'lucide-react';

export default function EmergencyComplaints() {
  const [emergencies, setEmergencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Dispatch modal
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);
  const [modalSearch, setModalSearch] = useState('');
  const [modalDeptFilter, setModalDeptFilter] = useState('ALL');

  const fetchEmergencies = async () => {
    setIsLoading(true);
    try {
      const response = await getActiveEmergencies();
      setEmergencies(response.data || []);
    } catch (err) {
      toast.error("Could not retrieve emergency complaints.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const handleOpenDispatchModal = async (em) => {
    setSelectedEmergency(em);
    setSelectedWorkerIds([]);
    setModalSearch('');
    setModalDeptFilter('ALL');
    try {
      const response = await getNearbyWorkers(em.latitude || 10.0159, em.longitude || 76.3419);
      setNearbyWorkers(response.data || []);
      setIsDispatchModalOpen(true);
    } catch (err) {
      toast.error("Failed to locate available emergency responders.");
    }
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (selectedWorkerIds.length === 0) {
      toast.error("Please select at least 1 responder worker to dispatch.");
      return;
    }
    try {
      await dispatchTaskforce(selectedEmergency.id, {
        worker_ids: selectedWorkerIds,
        department: 'emergency'
      });
      toast.success("Emergency Response Crew Dispatched!");
      setIsDispatchModalOpen(false);
      fetchEmergencies();
    } catch (err) {
      toast.error("Failed to dispatch crew.");
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveEmergency(id);
      toast.success("Emergency complaint marked as RESOLVED!");
      fetchEmergencies();
    } catch (err) {
      toast.error("Failed to resolve emergency complaint.");
    }
  };

  const filteredEmergencies = emergencies.filter(em => {
    const matchesSearch = search === '' || 
      em.title?.toLowerCase().includes(search.toLowerCase()) || 
      em.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || em.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || em.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const filteredNearbyWorkers = nearbyWorkers.filter(w => {
    const matchesSearch = modalSearch === '' || 
      w.worker_name?.toLowerCase().includes(modalSearch.toLowerCase()) || 
      w.phone?.includes(modalSearch);
    
    const matchesDept = modalDeptFilter === 'ALL' || w.department?.toLowerCase() === modalDeptFilter.toLowerCase();
    
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600 animate-pulse" />
            Emergency Complaints & Work Management
          </h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">Review, dispatch responders, and resolve emergency requests across all crisis categories.</p>
        </div>

        <button
          onClick={fetchEmergencies}
          className="flex items-center gap-2 px-4 py-2 bg-slate-105 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          Refresh Directory
        </button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
        <div className="relative">
          <input
            type="text"
            placeholder="Search emergency complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-semibold placeholder-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-semibold cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="HEALTH_AMBULANCE">Ambulance / Health</option>
            <option value="BLOOD_EMERGENCY">Blood Donation Request</option>
            <option value="FIRE_FORCE">Fire Force Alert</option>
            <option value="POLICE_EMERGENCY">Police / Security</option>
            <option value="TRAFFIC_EMERGENCY">Traffic Emergency</option>
            <option value="WATER_CRISIS">Water Supply Crisis</option>
            <option value="WASTE_HAZARD">Sanitation Hazard</option>
            <option value="GAS_LEAK">Gas / Chemical Leak</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-semibold cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE Beacons</option>
            <option value="CONTAINED">CONTAINED Work</option>
            <option value="RESOLVED">RESOLVED Complaints</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-black bg-slate-50">
                <th className="px-5 py-4">Complaint & Category</th>
                <th className="px-5 py-4">Severity</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Assigned Workers</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
                    Loading emergency complaints directory...
                  </td>
                </tr>
              ) : filteredEmergencies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No matching emergency complaints found.
                  </td>
                </tr>
              ) : (
                filteredEmergencies.map((em) => (
                  <tr key={em.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4.5">
                      <div className="font-black text-slate-900 flex items-center gap-2">
                        {em.category === 'HEALTH_AMBULANCE' && <HeartPulse className="w-4 h-4 text-rose-500" />}
                        {em.category === 'BLOOD_EMERGENCY' && <HeartPulse className="w-4 h-4 text-rose-600" />}
                        {em.category === 'FIRE_FORCE' && <Flame className="w-4 h-4 text-amber-500" />}
                        {em.category === 'POLICE_EMERGENCY' && <Shield className="w-4 h-4 text-blue-500" />}
                        {em.title}
                      </div>
                      <div className="text-[10px] text-rose-600 font-black uppercase tracking-wider mt-1">{em.category.replace('_', ' ')}</div>
                      <p className="text-xs text-slate-505 text-slate-500 font-semibold mt-1 leading-relaxed line-clamp-2 max-w-xl">{em.description}</p>
                    </td>
                    <td className="px-5 py-4.5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-lg border uppercase ${
                        em.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {em.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4.5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-lg border uppercase ${
                        em.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : em.status === 'CONTAINED' ? 'bg-amber-50 text-amber-700 border-amber-105 border-amber-250/60' : 'bg-rose-50 text-rose-700 border-rose-105 animate-pulse'
                      }`}>
                        {em.status}
                      </span>
                    </td>
                    <td className="px-5 py-4.5">
                      {em.taskforce && em.taskforce.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {em.taskforce.map(tf => (
                            <span key={tf.id} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-650 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-rose-605 text-rose-600" /> {tf.worker_name} ({tf.department})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4.5 text-right whitespace-nowrap space-x-2">
                      {em.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleOpenDispatchModal(em)}
                          className="px-3.5 py-2 bg-blue-650 hover:bg-blue-600 text-white rounded-xl text-xs font-black shadow-sm tracking-wide transition-all uppercase"
                        >
                          Dispatch Responder
                        </button>
                      )}
                      {em.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(em.id)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm tracking-wide transition-all uppercase"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      {isDispatchModalOpen && selectedEmergency && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-rose-600" />
                  Assign Emergency Responders
                </h3>
                <p className="text-xs text-rose-600 font-extrabold uppercase mt-0.5 tracking-wider">{selectedEmergency.title}</p>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-slate-650 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-500 font-bold block mb-2.5 uppercase tracking-wider">Select Available Emergency Workers</label>
                
                {/* Search & Department Filters */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Search name or phone..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    className="flex-grow px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 focus:outline-none transition-all placeholder-slate-400"
                  />
                  <select
                    value={modalDeptFilter}
                    onChange={(e) => setModalDeptFilter(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="ALL">All Departments</option>
                    <option value="traffic">Traffic</option>
                    <option value="waste">Waste</option>
                    <option value="water">Water</option>
                    <option value="general">General</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {filteredNearbyWorkers.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-4 font-semibold">No available workers match filters.</p>
                  ) : (
                    filteredNearbyWorkers.map(w => (
                      <label key={w.id} className="flex items-center justify-between p-2.5 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-150">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedWorkerIds.includes(w.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedWorkerIds([...selectedWorkerIds, w.id]);
                              else setSelectedWorkerIds(selectedWorkerIds.filter(id => id !== w.id));
                            }}
                            className="rounded accent-rose-600 text-rose-650 w-4 h-4 focus:ring-0"
                          />
                          <div>
                            <p className="font-black text-slate-900">{w.worker_name}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5 capitalize">{w.department} • {w.phone}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                          w.availability === 'AVAILABLE' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-amber-50 border-amber-100 text-amber-700'
                        }`}>
                          {w.availability}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-650 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-wider shadow-sm transition-all"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
