import React, { useEffect, useState } from 'react';
import { 
  listGeneralComplaintsApi, 
  getGeneralComplaintByIdApi, 
  updateGeneralComplaintStatusApi, 
  assignGeneralWorkerApi, 
  listGeneralWorkersApi 
} from '../../api/generalApi';
import { 
  Search, Filter, Eye, UserPlus, CheckCircle, RefreshCw, X, ShieldAlert, MapPin, Calendar, User,
  LayoutGrid, List, AlertTriangle, HardHat, FileText, XCircle, ChevronDown, Image as ImageIcon
} from 'lucide-react';
import { toastConfirm } from '../../utils/toastConfirm';
import ComplaintLocation from '../../components/shared/ComplaintLocation';
import ComplaintDetailsModal from '../../components/shared/ComplaintDetailsModal';
import { toast } from 'react-hot-toast';

export default function GeneralComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // View state and helpers
  const [viewMode, setViewMode] = useState('card');
  const [allWorkers, setAllWorkers] = useState([]);
  const [assigningComplaintId, setAssigningComplaintId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Selected complaint details
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedComplaintForDetails, setSelectedComplaintForDetails] = useState(null);
  const [assigning, setAssigning] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [authorityNotes, setAuthorityNotes] = useState('');

  // Fetch all workers on mount to resolve worker names
  useEffect(() => {
    const fetchAllWorkers = async () => {
      try {
        const res = await listGeneralWorkersApi({ page: 1, page_size: 100 });
        setAllWorkers(res.data.items || []);
      } catch (err) {
        console.error("Failed to load workers mapping:", err);
      }
    };
    fetchAllWorkers();
  }, []);

  const getWorkerName = (id) => {
    const worker = allWorkers.find(w => w.id === id);
    if (worker) return `${worker.first_name} ${worker.last_name || ''}`.trim();
    return `Worker #${id}`;
  };

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await listGeneralComplaintsApi({
        page,
        page_size: pageSize,
        search: search || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined
      });
      setComplaints(res.data.items || []);
      setTotalItems(res.data.total_items || 0);
    } catch (err) {
      toast.error("Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, statusFilter, categoryFilter]);

  // Load available workers when opening assign panel
  const loadWorkers = async () => {
    try {
      const res = await listGeneralWorkersApi({ page: 1, page_size: 100, availability: 'AVAILABLE' });
      setWorkers(res.data.items || []);
    } catch (err) {
      toast.error("Failed to load workers list.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchComplaints();
  };

  const handleOpenDetails = async (id) => {
    try {
      const res = await getGeneralComplaintByIdApi(id);
      setSelectedComplaint(res.data);
      setAuthorityNotes(res.data.authority_notes || '');
      setSelectedWorkerId(res.data.assigned_worker_id || '');
    } catch (err) {
      toast.error("Failed to fetch complaint details.");
    }
  };

  const handleOpenDetailsModal = async (id) => {
    try {
      const res = await getGeneralComplaintByIdApi(id);
      setSelectedComplaintForDetails(res.data);
    } catch (err) {
      toast.error("Failed to fetch complaint details.");
    }
  };

  const handleAssignWorker = async () => {
    if (!selectedWorkerId) {
      toast.error("Please select a worker first.");
      return;
    }
    try {
      setAssigning(true);
      const res = await assignGeneralWorkerApi(selectedComplaint.id, {
        assigned_worker_id: parseInt(selectedWorkerId),
        notes: authorityNotes
      });
      toast.success("Worker assigned successfully!");
      setSelectedComplaint(res.data);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Worker assignment failed.");
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (targetStatus) => {
    try {
      const res = await updateGeneralComplaintStatusApi(selectedComplaint.id, {
        status: targetStatus,
        notes: targetStatus === 'RESOLVED' ? "Resolved by Department Admin" : undefined
      });
      toast.success(`Status updated to ${targetStatus}`);
      setSelectedComplaint(res.data);
      fetchComplaints();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };
  
  const handleConfirmAssignInline = async (complaintId) => {
    if (!selectedWorkerId) {
      toast.error("Please select a worker first.");
      return;
    }
    try {
      const res = await assignGeneralWorkerApi(complaintId, {
        assigned_worker_id: parseInt(selectedWorkerId),
        notes: "Assigned via general complaints card view."
      });
      toast.success("Worker assigned successfully!");
      setAssigningComplaintId(null);
      setSelectedWorkerId("");
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Worker assignment failed.");
    }
  };

  const handleStatusChangeInline = async (complaintId, targetStatus) => {
    try {
      await updateGeneralComplaintStatusApi(complaintId, {
        status: targetStatus,
        notes: targetStatus === 'RESOLVED' ? "Resolved by Department Admin" : undefined
      });
      toast.success(`Status updated to ${targetStatus}`);
      fetchComplaints();
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const handleRejectInline = async (complaintId) => {
    toastConfirm("Are you sure you want to reject this complaint? This action cannot be undone.", async () => {
      try {
        await updateGeneralComplaintStatusApi(complaintId, {
          status: 'REJECTED',
          notes: 'Rejected by Department Admin'
        });
        toast.success("Complaint rejected successfully.");
        fetchComplaints();
      } catch (err) {
        toast.error("Failed to reject complaint.");
      }
    });
  };

  return (
    <div className="space-y-6 relative h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Complaints Queue</h1>
          <p className="text-slate-500 text-sm">Review, assign, and resolve general municipal complaints.</p>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 gap-1.5 shadow-inner self-end sm:self-auto">
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'card' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Card View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'table' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-4 h-4" /> Table View
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="w-full md:w-1/3 flex gap-2">
          <div className="relative flex-grow">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, title or reporter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            Search
          </button>
        </form>

        <div className="w-full md:w-auto flex flex-wrap gap-3 justify-end">
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>


          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            <option value="General">General</option>
            <option value="Stray Animals">Stray Animals</option>
            <option value="Streetlights">Streetlights</option>
            <option value="Parks">Parks & Playgrounds</option>
            <option value="Nuisance">Public Nuisance</option>
          </select>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {viewMode === 'table' ? (
          /* Table List */
          <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${selectedComplaint ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-xs font-semibold">
                  <tr>
                    <th className="px-6 py-4">Complaint ID</th>
                    <th className="px-6 py-4">Issue Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Ward / Area</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">{c.complaint_number}</td>
                      <td className="px-6 py-4 max-w-xs truncate">{c.title}</td>
                      <td className="px-6 py-4">{c.category || 'General'}</td>
                      <td className="px-6 py-4">{c.ward ? `${c.ward}, ${c.area}` : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          c.status === 'NEW' ? 'bg-indigo-50 text-indigo-600' :
                          c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenDetailsModal(c.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap"
                        >
                          <Eye className="w-4 h-4" /> Details
                        </button>
                        {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && c.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleOpenDetails(c.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-xl transition-colors inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap"
                          >
                            <UserPlus className="w-4 h-4" /> Assign
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && complaints.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400">No general complaints match filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <div>
                Showing {complaints.length} of {totalItems} items
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  Previous
                </button>
                <button
                  disabled={page * pageSize >= totalItems}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Card List View */
          <div className={`space-y-6 transition-all ${selectedComplaint ? 'xl:col-span-2' : 'xl:col-span-3'}`}>
            {/* Header bar */}
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Live General Complaints</h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage, assign, and review general complaints with full spacing.</p>
              </div>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {totalItems} Active Complaints
              </span>
            </div>

            {loading && complaints.length === 0 ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-44 bg-white rounded-2xl border border-slate-100 shadow-sm"></div>)}
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {complaints.map((report) => {
                    const isClosedOrRejected = report.status === 'CLOSED' || report.status === 'REJECTED';
                    const citizenImg = report.before_image;

                    const getStatusColor = (currentStatus) => {
                      if (currentStatus === 'NEW') return 'bg-indigo-600 shadow-indigo-600/40';
                      if (currentStatus === 'ASSIGNED' || currentStatus === 'IN_PROGRESS') return 'bg-amber-500 shadow-amber-500/40';
                      if (currentStatus === 'RESOLVED') return 'bg-emerald-600 shadow-emerald-600/40';
                      if (currentStatus === 'CLOSED') return 'bg-slate-500 shadow-slate-500/40';
                      if (currentStatus === 'REJECTED') return 'bg-rose-600 shadow-rose-600/40';
                      return 'bg-slate-500 shadow-slate-500/40';
                    };

                    return (
                      <div 
                        key={report.id} 
                        className={`bg-white rounded-2xl p-6 border transition-all shadow-sm hover:shadow-md ${
                          report.status === 'CLOSED' 
                            ? 'border-emerald-200 hover:border-emerald-300' 
                            : report.status === 'REJECTED'
                            ? 'border-rose-200 hover:border-rose-300 bg-rose-50/10'
                            : 'border-slate-200 hover:border-indigo-300'
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
                                <span className="text-xs font-medium">No Image Uploaded</span>
                              </div>
                            )}
                          </div>

                          {/* Right Content Details */}
                          <div className="flex-grow space-y-4 w-full">
                            {/* Title & Status */}
                            <div className="flex flex-wrap justify-between items-start gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <AlertTriangle className="w-4 h-4 text-indigo-600" />
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {report.category || 'General'}
                                  </span>
                                  <span className="text-xs font-mono text-slate-400">#{report.complaint_number}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">{report.title}</h3>
                              </div>
                              
                              {/* Status Badge / Dropdown */}
                              <div className="relative shrink-0">
                                {isClosedOrRejected ? (
                                  <div className={`text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm inline-block ${getStatusColor(report.status)}`}>
                                    {report.status}
                                  </div>
                                ) : (
                                  <>
                                    <select
                                      value={report.status}
                                      onChange={(e) => handleStatusChangeInline(report.id, e.target.value)}
                                      className={`appearance-none text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-slate-300 ${getStatusColor(report.status)}`}
                                    >
                                      <option value="NEW" className="bg-white text-slate-800">NEW</option>
                                      <option value="ASSIGNED" className="bg-white text-slate-800">ASSIGNED</option>
                                      <option value="IN_PROGRESS" className="bg-white text-slate-800">IN PROGRESS</option>
                                      <option value="RESOLVED" className="bg-white text-slate-800">RESOLVED</option>
                                      <option value="CLOSED" className="bg-white text-slate-800">CLOSED</option>
                                      <option value="REJECTED" className="bg-white text-slate-800">REJECTED</option>
                                    </select>
                                    <ChevronDown className="w-4 h-4 text-white absolute right-2 top-1.5 pointer-events-none" />
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Complaint Description */}
                            <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                              {report.description || 'No description supplied.'}
                            </p>

                            {/* Worker Resolution Notes */}
                            {report.resolution_notes && (
                              <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200">
                                <span className="text-xs font-bold text-emerald-900 block mb-0.5">Resolution Notes:</span>
                                <p className="text-xs text-emerald-950">{report.resolution_notes}</p>
                              </div>
                            )}

                            {/* Footer Meta & Actions */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-t border-slate-100 pt-3">
                              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" /> 
                                  <ComplaintLocation lat={Number(report.latitude || 0)} lng={Number(report.longitude || 0)} />
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" /> 
                                  {new Date(report.created_at).toLocaleDateString()}
                                </span>
                                {report.assigned_worker_id && (
                                  <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 font-bold">
                                    <HardHat className="w-4 h-4" /> 
                                    Assigned to {getWorkerName(report.assigned_worker_id)}
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-2 items-center justify-end">
                                {/* View Details */}
                                <button
                                  onClick={() => handleOpenDetailsModal(report.id)}
                                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                                >
                                  <Eye className="w-4 h-4 text-indigo-600" />
                                  View Details
                                </button>

                                {/* Inline Assign Worker flow */}
                                {!isClosedOrRejected && (
                                  <>
                                    {assigningComplaintId === report.id ? (
                                      <div className="flex items-center gap-2">
                                        <select 
                                          className="border border-slate-300 rounded-lg text-sm p-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                          value={selectedWorkerId}
                                          onClick={() => workers.length === 0 && loadWorkers()}
                                          onChange={(e) => setSelectedWorkerId(e.target.value)}
                                        >
                                          <option value="">Select Worker...</option>
                                          {workers.map(w => (
                                            <option key={w.id} value={w.id}>
                                              {w.first_name} {w.last_name} ({w.skill || 'General'})
                                            </option>
                                          ))}
                                        </select>
                                        <button 
                                          onClick={() => handleConfirmAssignInline(report.id)}
                                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                                        >
                                          Confirm
                                        </button>
                                        <button 
                                          onClick={() => { setAssigningComplaintId(null); setSelectedWorkerId(""); }}
                                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        {!report.assigned_worker_id && (
                                          <button 
                                            onClick={() => setAssigningComplaintId(report.id)}
                                            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                                          >
                                            <HardHat className="w-4 h-4" />
                                            Assign Worker
                                          </button>
                                        )}
                                        {report.status !== 'RESOLVED' && (
                                          <button 
                                            onClick={() => handleRejectInline(report.id)}
                                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold py-2 px-3 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                                          >
                                            <XCircle className="w-4 h-4 text-rose-600" />
                                            Reject
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {complaints.length === 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">All Clear!</h3>
                      <p className="text-slate-500">There are no general complaints reported at this time.</p>
                    </div>
                  )}
                </div>

                {/* Card Pagination */}
                {totalItems > pageSize && (
                  <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm mt-6">
                    <div className="text-sm font-medium text-slate-500">
                      Showing page <span className="font-bold text-slate-800">{page}</span> of <span className="font-bold text-slate-800">{Math.ceil(totalItems / pageSize)}</span> 
                      {' '}({totalItems} total complaints)
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setPage(p => p - 1)}
                        disabled={page === 1}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      <button 
                        onClick={() => setPage(p => p + 1)}
                        disabled={page >= Math.ceil(totalItems / pageSize)}
                        className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Selected Complaint Detail Drawer */}
        {selectedComplaint && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-6 self-start xl:col-span-1">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-800">{selectedComplaint.complaint_number}</h2>
              <button onClick={() => setSelectedComplaint(null)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Info */}
            <div className="space-y-4 text-sm text-slate-600">
              <h3 className="font-extrabold text-slate-800 text-base">{selectedComplaint.title}</h3>
              <p className="bg-slate-50 p-3 rounded-xl border border-slate-100">{selectedComplaint.description || 'No description supplied.'}</p>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(selectedComplaint.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{selectedComplaint.citizen_name || 'Citizen'}</span>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>{selectedComplaint.address || `Lat: ${selectedComplaint.latitude}, Lng: ${selectedComplaint.longitude}`}</span>
              </div>
            </div>

            {/* Images */}
            {selectedComplaint.before_image && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Before Fix Image</h4>
                <img
                  src={selectedComplaint.before_image}
                  alt="Before fixing"
                  className="rounded-xl object-cover w-full h-40 border border-slate-200 shadow-inner"
                />
              </div>
            )}

            {/* Worker Assignment */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                Field Assignment
              </h3>

              <div className="space-y-3">
                <label className="text-xs text-slate-400 font-bold block">Select Available General Worker</label>
                <div className="flex gap-2">
                  <select
                    value={selectedWorkerId}
                    onClick={() => workers.length === 0 && loadWorkers()}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-600 flex-grow focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Worker --</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{`${w.first_name} ${w.last_name} (${w.skill || 'General'})`}</option>
                    ))}
                  </select>
                </div>
                
                <textarea
                  placeholder="Instructions or remarks for the field worker..."
                  value={authorityNotes}
                  onChange={(e) => setAuthorityNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white min-h-[60px] resize-none"
                />
                
                <button
                  onClick={handleAssignWorker}
                  disabled={assigning}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {assigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </div>

            {/* Status transitions */}
            {selectedComplaint.status !== 'RESOLVED' && selectedComplaint.status !== 'CLOSED' && (
              <div className="border-t border-slate-100 pt-5 flex gap-2">
                <button
                  onClick={() => handleStatusChange('IN_PROGRESS')}
                  className="flex-grow bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Start Work
                </button>
                <button
                  onClick={() => handleStatusChange('RESOLVED')}
                  className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Resolve
                </button>
                <button
                  onClick={() => handleStatusChange('REJECTED')}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Lightbox Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black p-2 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 text-white w-8 h-8 rounded-full z-10 font-bold flex items-center justify-center"
            >
              ✕
            </button>
            <img src={previewImage} alt="Enlarged Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* COMPLAINT DETAILS MODAL */}
      {selectedComplaintForDetails && (
        <ComplaintDetailsModal
          complaint={{
            ...selectedComplaintForDetails,
            department: 'general',
            category: (selectedComplaintForDetails.category || 'general').toLowerCase()
          }}
          onClose={() => setSelectedComplaintForDetails(null)}
          workerName={selectedComplaintForDetails.assigned_worker_id ? getWorkerName(selectedComplaintForDetails.assigned_worker_id) : null}
          showImages={true}
        />
      )}
    </div>
  );
}
