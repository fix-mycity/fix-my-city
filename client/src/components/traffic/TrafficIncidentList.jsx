import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assignTrafficIncident, closeTrafficIncident, updateTrafficIncidentStatus, fetchTrafficWorkers } from '../../features/traffic/trafficThunks';
import { toast } from 'react-hot-toast';
import { MapPin, Calendar, HardHat, AlertTriangle, CheckCircle, ChevronDown, Image as ImageIcon } from 'lucide-react';
import { toastConfirm } from '../../utils/toastConfirm';
import ComplaintLocation from '../shared/ComplaintLocation';

const TrafficIncidentList = ({ incidents, status, readOnly = false }) => {
  const dispatch = useDispatch();
  const { workers } = useSelector((state) => state.traffic);
  
  const [assigningIncidentId, setAssigningIncidentId] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");

  useEffect(() => {
    // Fetch workers so we can list them in the dropdown
    dispatch(fetchTrafficWorkers({ page: 1, page_size: 100 }));
  }, [dispatch]);

  const handleConfirmAssign = async (incidentId) => {
    if (!selectedWorkerId) {
      toast.error("Please select a worker first.");
      return;
    }
    try {
      await dispatch(assignTrafficIncident({ incidentId, workerData: { worker_id: parseInt(selectedWorkerId) } })).unwrap();
      toast.success("Worker assigned successfully!");
      setAssigningIncidentId(null);
      setSelectedWorkerId("");
    } catch (err) {
      toast.error(err?.message || "Failed to assign worker.");
    }
  };

  const handleStatusChange = async (incidentId, newStatus) => {
    try {
      await dispatch(updateTrafficIncidentStatus({ incidentId, status: newStatus })).unwrap();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err?.message || "Failed to update status.");
    }
  };

  const handleClose = async (incidentId) => {
    toastConfirm("Are you sure you want to officially close this incident?", async () => {
      try {
        await dispatch(closeTrafficIncident(incidentId)).unwrap();
        toast.success("Incident closed successfully!");
      } catch (err) {
        toast.error(err?.message || "Failed to close incident.");
      }
    });
  };

  const getWorkerName = (id) => {
    const worker = workers?.items?.find(w => w.id === id);
    if (worker) return `${worker.first_name} ${worker.last_name || ''}`.trim() || worker.username;
    return `Worker #${id}`;
  };

  const getStatusColor = (currentStatus) => {
    if (currentStatus === 'PENDING' || currentStatus === 'NEW') return 'bg-red-500 shadow-red-500/40';
    if (currentStatus === 'ASSIGNED' || currentStatus === 'IN_PROGRESS') return 'bg-blue-500 shadow-blue-500/40';
    if (currentStatus === 'RESOLVED') return 'bg-purple-500 shadow-purple-500/40';
    return 'bg-emerald-500 shadow-emerald-500/40';
  };

  if (status === 'loading') {
    return <div className="p-8 text-center text-slate-500">Loading incidents...</div>;
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">All Clear!</h3>
        <p className="text-slate-500">There are no traffic incidents reported at this time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-900">Live Traffic Incidents</h2>
      </div>
      
      <div className="divide-y divide-slate-100">
        {incidents.map((report) => (
          <div key={report.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row gap-5">
            <div className="w-full sm:w-32 h-32 rounded-xl shrink-0 border border-slate-200 shadow-sm overflow-hidden bg-slate-50 flex items-center justify-center">
              {report.image_url ? (
                <img 
                  src={report.image_url} 
                  alt="Traffic Incident" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                  <span className="text-xs font-medium">No Image</span>
                </div>
              )}
            </div>
            <div className="flex-grow flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{report.category || 'TRAFFIC_INCIDENT'}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">{report.description}</p>
                </div>
                
                {/* Status Badge / Dropdown */}
                <div className="relative ml-4 shrink-0">
                  {readOnly || report.status === 'PENDING' ? (
                    <div className={`text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm inline-block ${getStatusColor(report.status)}`}>
                      {report.status}
                    </div>
                  ) : (
                    <>
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        className={`appearance-none text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-slate-300 ${getStatusColor(report.status)}`}
                      >
                        <option value="ASSIGNED" className="bg-white text-slate-800">ASSIGNED</option>
                        <option value="IN_PROGRESS" className="bg-white text-slate-800">IN PROGRESS</option>
                        <option value="RESOLVED" className="bg-white text-slate-800">RESOLVED</option>
                        <option value="CLOSED" className="bg-white text-slate-800">CLOSED</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-white absolute right-2 top-1.5 pointer-events-none" />
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> 
                    <ComplaintLocation lat={Number(report.location_lat || 0)} lng={Number(report.location_lng || 0)} />
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> 
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                  {report.assigned_worker_id && (
                    <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 font-bold">
                      <HardHat className="w-4 h-4" /> 
                      Assigned to {getWorkerName(report.assigned_worker_id)}
                    </span>
                  )}
                </div>
                {!readOnly && (
                  <div className="flex gap-2 items-center">
                    {assigningIncidentId === report.id ? (
                      <div className="flex items-center gap-2">
                        <select 
                          className="border border-slate-300 rounded-lg text-sm p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedWorkerId}
                          onChange={(e) => setSelectedWorkerId(e.target.value)}
                        >
                          <option value="">Select Worker...</option>
                          {workers?.items?.map(w => (
                            <option key={w.id} value={w.id}>
                              {w.first_name} {w.last_name} ({w.availability || 'AVAILABLE'})
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => handleConfirmAssign(report.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => { setAssigningIncidentId(null); setSelectedWorkerId(""); }}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        {report.status === 'PENDING' && !report.assigned_worker_id && (
                          <button 
                            onClick={() => setAssigningIncidentId(report.id)}
                            className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                          >
                            <HardHat className="w-4 h-4" />
                            Assign Worker
                          </button>
                        )}
                        {report.status === 'RESOLVED' && (
                          <button 
                            onClick={() => handleClose(report.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Close Incident
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrafficIncidentList;
