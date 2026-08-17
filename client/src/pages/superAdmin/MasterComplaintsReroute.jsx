import React, { useState, useEffect } from 'react';
import { rerouteComplaint, getAllComplaints } from '../../services/superAdminService';
import { downloadTaskPdfReport } from '../../services/workerService';
import { toast } from 'react-hot-toast';
import { 
  Building2, 
  Search, 
  Filter, 
  ArrowRightLeft, 
  FileText, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  X 
} from 'lucide-react';
import ComplaintLocation from '../../components/shared/ComplaintLocation';
import ComplaintDetailsModal from '../../components/shared/ComplaintDetailsModal';

const ISSUE_TO_DEPARTMENT_MAP = {
  pothole: "traffic",
  broken_traffic_signal: "traffic",
  illegal_parking: "traffic",
  garbage_accumulation: "waste",
  sewage_overflow: "waste",
  water_leak: "water",
  broken_hydrant: "water",
  street_light_issue: "general",
  accident: "traffic",
  other: "general"
};

export default function MasterComplaintsReroute() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reroute Modal State
  const [selectedComplaintForReroute, setSelectedComplaintForReroute] = useState(null);
  const [targetDept, setTargetDept] = useState('traffic');
  const [isRerouting, setIsRerouting] = useState(false);

  // Details Modal State
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [page, search, statusFilter, deptFilter]);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const params = { page, page_size: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (deptFilter) params.department = deptFilter;

      const res = await getAllComplaints(params);
      const items = Array.isArray(res.data) ? res.data : (res.data?.items || []);
      setComplaints(items);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err) {
      toast.error("Failed to load master complaints list.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerouteSubmit = async () => {
    if (!selectedComplaintForReroute) return;
    setIsRerouting(true);
    try {
      const res = await rerouteComplaint(selectedComplaintForReroute.id, targetDept);
      if (res.data.success) {
        toast.success(`Complaint #${selectedComplaintForReroute.id} transferred to ${targetDept.toUpperCase()}`);
        setSelectedComplaintForReroute(null);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to reroute complaint.");
    } finally {
      setIsRerouting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Master Complaints Oversight & Department Rerouting
          </h1>
          <p className="text-xs text-slate-500 mt-1">Cross-department complaint directory with instant ticket transfer capabilities.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input 
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={deptFilter}
            onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="traffic">Traffic</option>
            <option value="water">Water</option>
            <option value="waste">Waste</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* Complaints Master Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Complaint Title</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-blue-600">sync</span>
                    <p className="font-medium text-xs">Loading master tickets...</p>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <p className="font-bold text-slate-800">No Complaints Found</p>
                  </td>
                </tr>
              ) : (
                complaints.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{c.title}</div>
                      <div className="text-xs text-slate-400 font-mono">#FMC-COMP-{c.id}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                        {c.department}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-600">
                      <ComplaintLocation lat={Number(c.location_lat || 0)} lng={Number(c.location_lng || 0)} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200 w-max">
                          {c.status}
                        </span>
                        {c.ai_routing_status === 'PENDING_TRIAGE' && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-max animate-pulse">
                            AI Triage Required
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDetails(c)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedComplaintForReroute(c)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Reroute
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

      {/* REROUTE MODAL */}
      {selectedComplaintForReroute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                Reroute Complaint #{selectedComplaintForReroute.id}
              </h3>
              <button onClick={() => setSelectedComplaintForReroute(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Transfer this complaint to another municipal department. The assigned worker will be cleared and status set to PENDING.
            </p>

            {selectedComplaintForReroute.ai_routing_status && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-left">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>AI routing suggestion</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                    selectedComplaintForReroute.ai_image_agreement === 'SUPPORTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                  }`}>
                    Agreement: {selectedComplaintForReroute.ai_image_agreement}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700">
                  Detected issue: <span className="text-blue-600 font-bold">{selectedComplaintForReroute.ai_issue_type}</span> ({Math.round(selectedComplaintForReroute.ai_confidence * 100)}% confidence)
                </div>
                {selectedComplaintForReroute.ai_reasoning && (
                  <p className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-100 leading-normal italic">
                    "{selectedComplaintForReroute.ai_reasoning}"
                  </p>
                )}
                {ISSUE_TO_DEPARTMENT_MAP[selectedComplaintForReroute.ai_issue_type] && ISSUE_TO_DEPARTMENT_MAP[selectedComplaintForReroute.ai_issue_type] !== 'general' && (
                  <button
                    onClick={() => setTargetDept(ISSUE_TO_DEPARTMENT_MAP[selectedComplaintForReroute.ai_issue_type])}
                    type="button"
                    className="w-full mt-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Use AI Suggestion: {ISSUE_TO_DEPARTMENT_MAP[selectedComplaintForReroute.ai_issue_type].toUpperCase()}
                  </button>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Select Target Department</label>
              <select
                value={targetDept}
                onChange={(e) => setTargetDept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="traffic">Traffic Control</option>
                <option value="water">Water Authority</option>
                <option value="waste">Waste Management</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setSelectedComplaintForReroute(null)} className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl">Cancel</button>
              <button
                onClick={handleRerouteSubmit}
                disabled={isRerouting}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                {isRerouting ? 'Transferring...' : 'Confirm Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS MODAL */}
      {selectedDetails && (
        <ComplaintDetailsModal
          complaint={selectedDetails}
          onClose={() => setSelectedDetails(null)}
        />
      )}
    </div>
  );
}
