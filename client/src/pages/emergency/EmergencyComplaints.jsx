import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getActiveEmergencies, resolveEmergency, dispatchTaskforce, getNearbyWorkers } from '../../services/emergencyService';
import { 
  ShieldAlert, Search, Filter, RefreshCw, HeartPulse, Flame, Shield, 
  Droplets, Car, Trash2, CheckCircle2, UserPlus, X, UserCheck
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            Emergency Complaints & Work Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">Review, dispatch responders, and resolve emergency requests across all crisis categories.</p>
        </div>

        <button
          onClick={fetchEmergencies}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Directory
        </button>
      </div>

      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search emergency complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-rose-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500 font-medium"
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
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE Beacons</option>
            <option value="CONTAINED">CONTAINED Work</option>
            <option value="RESOLVED">RESOLVED Complaints</option>
          </select>
        </div>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-extrabold bg-slate-950/60">
                <th className="px-5 py-3.5">Complaint & Category</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Assigned Workers</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Loading emergency complaints directory...
                  </td>
                </tr>
              ) : filteredEmergencies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    No matching emergency complaints found.
                  </td>
                </tr>
              ) : (
                filteredEmergencies.map((em) => (
                  <tr key={em.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-white flex items-center gap-2">
                        {em.category === 'HEALTH_AMBULANCE' && <HeartPulse className="w-4 h-4 text-rose-500" />}
                        {em.category === 'BLOOD_EMERGENCY' && <HeartPulse className="w-4 h-4 text-rose-600" />}
                        {em.category === 'FIRE_FORCE' && <Flame className="w-4 h-4 text-amber-500" />}
                        {em.category === 'POLICE_EMERGENCY' && <Shield className="w-4 h-4 text-blue-500" />}
                        {em.title}
                      </div>
                      <div className="text-xs text-rose-400 font-semibold mt-0.5">{em.category.replace('_', ' ')}</div>
                      <p className="text-xs text-slate-400 mt-1">{em.description}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-black rounded-full uppercase ${
                        em.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}>
                        {em.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        em.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : em.status === 'CONTAINED' ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400 animate-pulse'
                      }`}>
                        {em.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {em.taskforce && em.taskforce.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {em.taskforce.map(tf => (
                            <span key={tf.id} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[11px] font-semibold text-slate-200 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-rose-400" /> {tf.worker_name} ({tf.department})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap space-x-2">
                      {em.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleOpenDispatchModal(em)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Dispatch Responder
                        </button>
                      )}
                      {em.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(em.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-rose-500" />
                  Assign Emergency Responders
                </h3>
                <p className="text-xs text-rose-400 font-semibold">{selectedEmergency.title}</p>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Select Available Emergency Workers</label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-950/50">
                  {nearbyWorkers.length === 0 ? (
                    <p className="text-slate-500 italic">No available Emergency workers located.</p>
                  ) : (
                    nearbyWorkers.map(w => (
                      <label key={w.id} className="flex items-center justify-between p-2 hover:bg-slate-800 rounded-lg cursor-pointer">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={selectedWorkerIds.includes(w.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedWorkerIds([...selectedWorkerIds, w.id]);
                              else setSelectedWorkerIds(selectedWorkerIds.filter(id => id !== w.id));
                            }}
                            className="rounded accent-rose-500"
                          />
                          <div>
                            <p className="font-bold text-white">{w.worker_name}</p>
                            <p className="text-[10px] text-slate-400">{w.department} • {w.phone}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                          {w.availability}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDispatchModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-extrabold shadow-lg"
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
