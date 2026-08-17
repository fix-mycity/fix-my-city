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
  ShieldAlert, Radio, AlertTriangle, CheckCircle2, Users, RefreshCw, X, Plus, Loader2, HeartPulse, Flame, Shield, Droplets, Car, Trash2, Activity, PhoneCall, UserCheck
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

      {/* Top Banner Header (Light cover) */}
      <div className="bg-gradient-to-br from-rose-50 via-white to-white border border-rose-100 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-[0.03] pointer-events-none transform translate-x-10 -translate-y-10 select-none">
          <ShieldAlert className="w-96 h-96 text-rose-600" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-50 border border-rose-100 rounded-full text-rose-700 text-xs font-black uppercase tracking-widest animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Emergency Department Operations
            </div>
            <h1 className="text-3xl md:text-4.5xl font-black text-slate-900 tracking-tight">
              Emergency Command & Crisis Dashboard
            </h1>
            <p className="text-slate-500 text-sm max-w-2xl font-medium leading-relaxed">
              Centralized emergency work management. Oversee health emergencies, blood donation requests, fire force alerts, police dispatches, and emergency crews.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setIsSOSModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-550 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-rose-250 transition-all border border-rose-600/10 scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 font-black" />
              Create Emergency Request
            </button>

            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all border border-slate-200 scale-[1.02] active:scale-[0.98]"
            >
              <Radio className="w-4 h-4 text-amber-505 text-amber-600" />
              Broadcast Advisory
            </button>

            <button
              onClick={fetchEmergencies}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-2xl transition-all border border-slate-200 shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md duration-350 transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Emergencies</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{activeCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md duration-350 transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health & Blood Alerts</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{healthCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md duration-350 transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fire & Police Alerts</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{firePoliceCount}</h3>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md duration-350 transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatched Taskforce</p>
            <h3 className="text-3xl font-black text-slate-900 mt-0.5">{totalTaskforceCount}</h3>
          </div>
        </div>

      </div>

      {/* Recharts Workload Distribution Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-600" />
            Emergency Category Workload Distribution
          </h2>
          <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider">Real-Time Category Breakdown</span>
        </div>

        <div className="h-[280px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fontSize: 11, fontWeight: 'bold' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '14px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontFamily: 'sans-serif' }}
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
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Recent Emergency Complaints & Work Requests
          </h2>
          <span className="text-xs text-rose-600 font-black tracking-widest">LIVE TELEMETRY</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-black bg-slate-50">
                <th className="px-5 py-4">Incident Title & Category</th>
                <th className="px-5 py-4">Severity</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Assigned Responders</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-bold">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-600" />
                    Loading emergency complaints feed...
                  </td>
                </tr>
              ) : emergencies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-semibold">
                    No active emergency incidents reported.
                  </td>
                </tr>
              ) : (
                emergencies.map((em) => (
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
                      <p className="text-xs text-slate-500 font-semibold mt-1 leading-relaxed line-clamp-2 max-w-xl">{em.description}</p>
                    </td>
                    <td className="px-5 py-4.5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase border ${em.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                        {em.severity}
                      </span>
                    </td>
                    <td className="px-5 py-4.5 whitespace-nowrap">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-lg border uppercase ${em.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : em.status === 'CONTAINED' ? 'bg-amber-50 text-amber-700 border-amber-105 border-amber-200/50' : 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
                        }`}>
                        {em.status}
                      </span>
                    </td>
                    <td className="px-5 py-4.5">
                      {em.taskforce && em.taskforce.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {em.taskforce.map(tf => (
                            <span key={tf.id} className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-650 flex items-center gap-1">
                              <UserCheck className="w-3.5 h-3.5 text-rose-600" /> {tf.worker_name} ({tf.department})
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
                          Dispatch Crew
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

      {/* Create Emergency Request Modal */}
      {isSOSModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-rose-600 animate-pulse" />
                Register Emergency Work Request
              </h3>
              <button onClick={() => setIsSOSModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerSOSSubmit} className="space-y-4.5 text-xs font-semibold">
              <div>
                <label className="text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">Emergency Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Urgent Ambulance Request / Severe Accident"
                  value={sosForm.title}
                  onChange={(e) => setSosForm({ ...sosForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    value={sosForm.category}
                    onChange={(e) => setSosForm({ ...sosForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-205 border-slate-200 rounded-xl px-3 py-3 text-slate-900 text-xs font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all focus:outline-none"
                  >
                    <option value="HEALTH_AMBULANCE">Ambulance / Health</option>
                    <option value="BLOOD_EMERGENCY">Blood Donation Request</option>
                    <option value="FIRE_FORCE">Fire Force Alert</option>
                    <option value="POLICE_EMERGENCY">Police Security Alert</option>
                    <option value="TRAFFIC_EMERGENCY">Traffic Crash</option>
                    <option value="WATER_CRISIS">Water Supply Crisis</option>
                    <option value="WASTE_HAZARD">Sanitation Hazard</option>
                    <option value="GAS_LEAK">Gas / Chemical Leak</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">Severity Level</label>
                  <select
                    value={sosForm.severity}
                    onChange={(e) => setSosForm({ ...sosForm, severity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-250 border-slate-200 rounded-xl px-3 py-3 text-slate-900 text-xs font-semibold focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (Priority)</option>
                    <option value="HIGH">HIGH Priority</option>
                    <option value="MODERATE">MODERATE Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">Request Details & Notes</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Details on required response team and location notes..."
                  value={sosForm.description}
                  onChange={(e) => setSosForm({ ...sosForm, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-205 border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSOSModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black uppercase tracking-wider shadow-md shadow-rose-250 transition-all"
                >
                  Register Emergency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responder Dispatch Modal */}
      {isDispatchModalOpen && selectedEmergency && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-rose-600" />
                  Dispatch Emergency Responders
                </h3>
                <p className="text-xs text-rose-600 font-extrabold uppercase mt-0.5 tracking-wider">{selectedEmergency.title}</p>
              </div>
              <button onClick={() => setIsDispatchModalOpen(false)} className="text-slate-400 hover:text-slate-650 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-500 font-bold block mb-2 uppercase tracking-wider">Select Available Emergency Field Workers ({nearbyWorkers.length} Found)</label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {nearbyWorkers.length === 0 ? (
                    <p className="text-slate-400 italic text-center py-4 font-medium">No available Emergency workers found.</p>
                  ) : (
                    nearbyWorkers.map(w => (
                      <label key={w.id} className="flex items-center justify-between p-2.5 hover:bg-white hover:shadow-sm rounded-lg cursor-pointer transition-all border border-transparent hover:border-slate-150">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedWorkerIds.includes(w.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedWorkerIds([...selectedWorkerIds, w.id]);
                              else setSelectedWorkerIds(selectedWorkerIds.filter(id => id !== w.id));
                            }}
                            className="rounded accent-rose-600 text-rose-600 w-4 h-4 focus:ring-0"
                          />
                          <div>
                            <p className="font-black text-slate-905 text-slate-900">{w.worker_name}</p>
                            <p className="text-[10px] text-slate-450 mt-0.5">{w.department} • {w.phone}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase">
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
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-wider shadow-sm transition-all"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-5 text-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
                Issue Public Warning Broadcast
              </h3>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-slate-400 hover:text-slate-650 p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4.5 text-xs font-semibold">
              <div>
                <label className="text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">Advisory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boil Water Warning in Zone 4"
                  value={broadcastForm.alert_title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, alert_title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-500 font-bold block mb-1.5 uppercase tracking-wider">Message Content</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Public warning instructions for citizens..."
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-medium focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-black uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-black uppercase tracking-wider shadow-sm transition-all"
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
