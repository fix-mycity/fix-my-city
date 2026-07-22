import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { assignTrafficIncident, closeTrafficIncident, updateTrafficIncidentStatus, fetchTrafficWorkers } from '../../features/traffic/trafficThunks';
import { downloadTaskPdfReport } from '../../services/workerService';
import { toast } from 'react-hot-toast';
import { MapPin, Calendar, HardHat, AlertTriangle, CheckCircle, ChevronDown, Image as ImageIcon, FileText } from 'lucide-react';
import { toastConfirm } from '../../utils/toastConfirm';
import ComplaintLocation from '../shared/ComplaintLocation';
import ComplaintDetailsModal from '../shared/ComplaintDetailsModal';
import { Eye } from 'lucide-react';

const TrafficIncidentList = ({ incidents, status, readOnly = false }) => {
  const dispatch = useDispatch();
  const { workers } = useSelector((state) => state.traffic);
  
  const [assigningIncidentId, setAssigningIncidentId] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedIncidentForDetails, setSelectedIncidentForDetails] = useState(null);

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
    toastConfirm("Have you reviewed the complaint details and PDF report? Confirm to officially close this incident.", async () => {
      try {
        await dispatch(closeTrafficIncident(incidentId)).unwrap();
        toast.success("Incident approved and closed successfully!");
      } catch (err) {
        toast.error(err?.message || "Failed to close incident.");
      }
    });
  };

  const handleDownloadPdf = async (incidentId) => {
    setDownloadingPdfId(incidentId);
    try {
      const res = await downloadTaskPdfReport(incidentId);
      if (res.data?.pdf_url) {
        window.open(res.data.pdf_url, '_blank');
        toast.success("PDF Work Completion Report opened!");
      } else {
        toast.error(res.data?.message || "Failed to generate PDF report.");
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not generate PDF report.");
    } finally {
      setDownloadingPdfId(null);
    }
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
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">All Clear!</h3>
        <p className="text-slate-500">There are no traffic incidents reported at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header bar */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Live Traffic Incidents</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage, assign, and review department incidents with full spacing.</p>
        </div>
        <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          {incidents.length} Active Complaints
        </span>
      </div>
      
      {/* List of Cards with generous spacing */}
      <div className="space-y-6">
        {incidents.map((report) => {
          const isResolved = report.status === 'RESOLVED' || report.status === 'CLOSED';
          const citizenImg = report.image_url;

          return (
            <div 
              key={report.id} 
              className={`bg-white rounded-2xl p-6 border transition-all shadow-sm hover:shadow-md ${
                isResolved ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                
                {/* Left Citizen Photo Thumbnail */}
                <div className="w-full lg:w-48 h-40 rounded-xl shrink-0 border border-slate-200 overflow-hidden bg-slate-50 relative group">
                  {citizenImg ? (
                    <div 
                      onClick={() => setPreviewImage(citizenImg)} 
                      className="w-full h-full cursor-pointer"
                    >
                      <img 
                        src={citizenImg} 
                        alt="Citizen Upload" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        Enlarge Photo
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <ImageIcon className="w-8 h-8 mb-1 opacity-50" />
                      <span className="text-xs font-medium">No Citizen Image</span>
                    </div>
                  )}
                </div>

                {/* Right Content Details */}
                <div className="flex-grow space-y-4 w-full">
                  
                  {/* Title & Status */}
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {report.category || report.department || 'TRAFFIC_INCIDENT'}
                        </span>
                        <span className="text-xs font-mono text-slate-400">#FMC-COMP-{report.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{report.title}</h3>
                    </div>
                    
                    {/* Status Badge / Dropdown */}
                    <div className="relative shrink-0">
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
                            <option value="RESOLVED" className="bg-white text-slate-800">RESOLVED (Awaiting Admin Review)</option>
                            <option value="CLOSED" className="bg-white text-slate-800">CLOSED (Approved)</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-white absolute right-2 top-1.5 pointer-events-none" />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Complaint Description */}
                  <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                    {report.description}
                  </p>

                  {/* Worker Notes if resolved */}
                  {report.resolution_report && (
                    <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
                      <span className="text-xs font-bold text-emerald-900 block mb-0.5">Worker Resolution Summary:</span>
                      <p className="text-xs text-emerald-950">{report.resolution_report}</p>
                    </div>
                  )}

                  {/* Footer Meta & Actions */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-t border-slate-100 pt-3">
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
                        <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 font-bold">
                          <HardHat className="w-4 h-4" /> 
                          Assigned to {getWorkerName(report.assigned_worker_id)}
                        </span>
                      )}
                    </div>

                    {!readOnly && (
                      <div className="flex flex-wrap gap-2 items-center justify-end">
                        {/* View Full Details Button */}
                        <button
                          onClick={() => setSelectedIncidentForDetails(report)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                          View Details
                        </button>

                        {/* PDF Work Report Button */}
                        {isResolved && (
                          <button
                            onClick={() => handleDownloadPdf(report.id)}
                            disabled={downloadingPdfId === report.id}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                          >
                            <FileText className="w-4 h-4 text-rose-600" />
                            {downloadingPdfId === report.id ? 'Generating PDF...' : 'Download PDF Report'}
                          </button>
                        )}

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
                                Approve & Close Incident
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>
          );
        })}
      </div>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black p-2 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 text-white p-2 rounded-full z-10"
            >
              ✕
            </button>
            <img src={previewImage} alt="Enlarged Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
      {/* COMPLAINT DETAILS MODAL */}
      {selectedIncidentForDetails && (
        <ComplaintDetailsModal
          complaint={selectedIncidentForDetails}
          onClose={() => setSelectedIncidentForDetails(null)}
          workerName={selectedIncidentForDetails.assigned_worker_id ? getWorkerName(selectedIncidentForDetails.assigned_worker_id) : null}
          showImages={false}
        />
      )}
    </div>
  );
};

export default TrafficIncidentList;
