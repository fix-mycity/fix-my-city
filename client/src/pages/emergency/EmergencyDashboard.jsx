import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  getActiveEmergencies, 
  triggerSOS, 
  dispatchTaskforce, 
  issueBroadcast, 
  resolveEmergency,
  getNearbyWorkers
} from '../../services/emergencyService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  ShieldAlert, Radio, AlertTriangle, CheckCircle2, Users, RefreshCw, X, Plus, 
  HeartPulse, Flame, Shield, Droplets, Car, Trash2, Activity, PhoneCall, UserCheck
} from 'lucide-react';

export default function EmergencyDashboard() {
  const [emergencies, setEmergencies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState([]);

  // Forms
  const [sosForm, setSosForm] = useState({
    title: '',
    description: '',
    category: 'HEALTH_AMBULANCE',
    severity: 'CRITICAL',
    latitude: 10.0159,
    longitude: 76.3419,
    affected_radius_meters: 500
  });

  const [broadcastForm, setBroadcastForm] = useState({
    alert_title: '',
    message: '',
    target_zone: 'ALL_CITY',
    severity: 'CRITICAL'
  });

  const fetchEmergencies = async () => {
    setIsLoading(true);
    try {
      const response = await getActiveEmergencies();
      setEmergencies(response.data || []);
    } catch (err) {
      toast.error("Could not retrieve active emergency complaints.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  const handleOpenDispatchModal = async (emergency) => {
    setSelectedEmergency(emergency);
    setSelectedWorkerIds([]);
    try {
      const response = await getNearbyWorkers(emergency.latitude, emergency.longitude);
      setNearbyWorkers(response.data || []);
      setIsDispatchModalOpen(true);
    } catch (err) {
      toast.error("Failed to locate emergency response workers.");
    }
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (selectedWorkerIds.length === 0) {
      toast.error("Please select at least 1 emergency worker to dispatch.");
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
      toast.error(err.response?.data?.detail || "Failed to dispatch crew.");
    }
  };

  const handleTriggerSOSSubmit = async (e) => {
    e.preventDefault();
    try {
      await triggerSOS(sosForm);
      toast.success("Emergency Request Filed! Crisis dispatch team notified.");
      setIsSOSModalOpen(false);
      setSosForm({
        title: '',
        description: '',
        category: 'HEALTH_AMBULANCE',
        severity: 'CRITICAL',
        latitude: 10.0159,
        longitude: 76.3419,
        affected_radius_meters: 500
      });
      fetchEmergencies();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit emergency request.");
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    try {
      await issueBroadcast(broadcastForm);
      toast.success("Public Emergency Advisory Broadcasted!");
      setIsBroadcastModalOpen(false);
      setBroadcastForm({ alert_title: '', message: '', target_zone: 'ALL_CITY', severity: 'CRITICAL' });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to issue broadcast.");
    }
  };

  const handleResolve = async (emergencyId) => {
    try {
      await resolveEmergency(emergencyId);
      toast.success("Emergency request resolved! Dispatched crew released.");
      fetchEmergencies();
    } catch (err) {
      toast.error("Failed to resolve emergency complaint.");
    }
  };

  // Telemetry Metrics
  const activeCount = emergencies.filter(e => e.status === 'ACTIVE').length;
  const healthCount = emergencies.filter(e => e.category === 'HEALTH_AMBULANCE' || e.category === 'BLOOD_EMERGENCY').length;
  const firePoliceCount = emergencies.filter(e => e.category === 'FIRE_FORCE' || e.category === 'POLICE_EMERGENCY').length;
  const totalTaskforceCount = emergencies.reduce((acc, e) => acc + (e.taskforce ? e.taskforce.length : 0), 0);

  // Recharts Bar Data for Category Distribution
  const categoryCounts = {
    'Ambulance / Health': emergencies.filter(e => e.category === 'HEALTH_AMBULANCE').length,
    'Blood Request': emergencies.filter(e => e.category === 'BLOOD_EMERGENCY').length,
    'Fire Force': emergencies.filter(e => e.category === 'FIRE_FORCE').length,
    'Police Security': emergencies.filter(e => e.category === 'POLICE_EMERGENCY').length,
    'Traffic Crisis': emergencies.filter(e => e.category === 'TRAFFIC_EMERGENCY').length,
    'Water Supply Crisis': emergencies.filter(e => e.category === 'WATER_CRISIS').length,
    'Sanitation Hazard': emergencies.filter(e => e.category === 'WASTE_HAZARD').length,
  };

  const chartData = Object.keys(categoryCounts).map(cat => ({
    name: cat,
    count: categoryCounts[cat]
  }));

  const BAR_COLORS = ['#e11d48', '#be123c', '#f97316', '#3b82f6', '#eab308', '#06b6d4', '#10b981'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans pb-16">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 border border-rose-800/40 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
          <ShieldAlert className="w-96 h-96 text-rose-500" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/20 border border-rose-500/40 rounded-full text-rose-300 text-xs font-black uppercase tracking-widest animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Emergency Department Operations
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Emergency Command & Crisis Dashboard
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              Centralized emergency work management. Oversee health emergencies, blood donation requests, fire force alerts, police dispatches, and emergency crews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSOSModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-900/50 transition-all border border-rose-400/40"
            >
              <Plus className="w-4 h-4" />
              Create Emergency Request
            </button>

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all border border-slate-700"
            >
              <Radio className="w-4 h-4 text-amber-400" />
              Broadcast Advisory
            </button>

            <button
              onClick={fetchEmergencies}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors border border-slate-700"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-slate-900/90 border border-rose-900/40 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Active Emergencies</p>
            <h3 className="text-3xl font-black text-white">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-rose-800/40 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Health & Blood Alerts</p>
            <h3 className="text-3xl font-black text-white">{healthCount}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-amber-900/40 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Fire & Police Alerts</p>
            <h3 className="text-3xl font-black text-white">{firePoliceCount}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-blue-900/40 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Dispatched Taskforce</p>
            <h3 className="text-3xl font-black text-white">{totalTaskforceCount}</h3>
          </div>
        </div>

      </div>

      {/* Analytics Recharts Workload Distribution Bar Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            Emergency Category Workload Distribution
          </h2>
          <span className="text-xs text-slate-400 font-medium">Real-Time Category Breakdown</span>
        </div>

        <div className="h-[280px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '12px' }} 
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Emergency Work Requests Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            Recent Emergency Complaints & Work Requests
          </h2>
          <span className="text-xs text-rose-400 font-bold">LIVE TELEMETRY</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider font-extrabold bg-slate-950/60">
                <th className="px-5 py-3.5">Incident Title & Category</th>
                <th className="px-5 py-3.5">Severity</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Assigned Responders</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    Loading emergency complaints feed...
                  </td>
                </tr>
              ) : emergencies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                    No active emergency incidents reported.
                  </td>
                </tr>
              ) : (
                emergencies.map((em) => (
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
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{em.description}</p>
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
                          Dispatch Crew
                        </button>
                      )}
                      {em.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(em.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                        >
                          Resolve Complaint
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

      {/* Create Emergency Request Modal */}
      {isSOSModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/60 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
                Register Emergency Work Request
              </h3>
              <button onClick={() => setIsSOSModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerSOSSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Emergency Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent Ambulance Request / Severe Accident"
                  value={sosForm.title}
                  onChange={(e) => setSosForm({ ...sosForm, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Emergency Category</label>
                  <select
                    value={sosForm.category}
                    onChange={(e) => setSosForm({ ...sosForm, category: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                  >
                    <option value="HEALTH_AMBULANCE">Ambulance / Health Emergency</option>
                    <option value="BLOOD_EMERGENCY">Blood Donation Request</option>
                    <option value="FIRE_FORCE">Fire Force Alert</option>
                    <option value="POLICE_EMERGENCY">Police / Security Alert</option>
                    <option value="TRAFFIC_EMERGENCY">Traffic Crash / Obstruction</option>
                    <option value="WATER_CRISIS">Water Supply Crisis</option>
                    <option value="WASTE_HAZARD">Toxic Waste / Sanitation Hazard</option>
                    <option value="GAS_LEAK">Gas / Chemical Leak</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Severity Level</label>
                  <select
                    value={sosForm.severity}
                    onChange={(e) => setSosForm({ ...sosForm, severity: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white"
                  >
                    <option value="CRITICAL">CRITICAL (Priority Dispatch)</option>
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MODERATE">MODERATE Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Request Details & Notes</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Details on required response team and location notes..."
                  value={sosForm.description}
                  onChange={(e) => setSosForm({ ...sosForm, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSOSModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-extrabold shadow-lg"
                >
                  Register Emergency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Department Responder Dispatch Modal */}
      {isDispatchModalOpen && selectedEmergency && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-rose-500" />
                  Dispatch Emergency Responders
                </h3>
                <p className="text-xs text-rose-400 font-semibold">{selectedEmergency.title}</p>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Select Available Emergency Field Workers ({nearbyWorkers.length} Found)</label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-950/50">
                  {nearbyWorkers.length === 0 ? (
                    <p className="text-slate-500 italic">No available Emergency workers found.</p>
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

      {/* Broadcast Advisory Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" />
                Issue Public Warning Broadcast
              </h3>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Advisory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boil Water Warning in Zone 4"
                  value={broadcastForm.alert_title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, alert_title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Message Content</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Public warning instructions for citizens..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-extrabold shadow-lg"
                >
                  Broadcast Warning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
