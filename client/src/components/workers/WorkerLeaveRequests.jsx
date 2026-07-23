import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getDepartmentLeaveRequests, updateLeaveRequestStatus } from '../../services/workerService';

const extractErrorMessage = (err, fallback) => {
  if (!err) return fallback;
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map(item => item.msg || item.message || JSON.stringify(item)).join(', ');
  }
  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  return err.message || fallback;
};

export default function WorkerLeaveRequests({ department }) {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Reviewing modal / drawer state
  const [activeReviewRequest, setActiveReviewRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
  }, [department, statusFilter, page]);

  const fetchLeaveRequests = async () => {
    setIsLoading(true);
    try {
      const params = { page, page_size: 10, department };
      if (statusFilter !== 'ALL') {
        params.status = statusFilter;
      }
      const res = await getDepartmentLeaveRequests(params);
      setRequests(Array.isArray(res.data?.items) ? res.data.items : []);
      setTotalPages(res.data?.total_pages || 1);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Could not fetch department leave requests."));
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (newStatus) => {
    if (!activeReviewRequest) return;
    setIsSubmitting(true);
    try {
      await updateLeaveRequestStatus(activeReviewRequest.id, newStatus, adminNotes);
      toast.success(`Leave request ${newStatus.toLowerCase()} successfully!`);
      setActiveReviewRequest(null);
      setAdminNotes('');
      fetchLeaveRequests();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update leave request status."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 1;
    try {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return 1;
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    } catch (e) {
      return 1;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  const badgeStyles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const safeRequests = Array.isArray(requests) ? requests : [];

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">event_busy</span>
            Worker Leave Applications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Review and approve or reject leave requests submitted by field officers.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors capitalize ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'ALL' ? 'All Requests' : st.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Field Officer</th>
                <th className="px-6 py-4">Leave Duration</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Admin Notes</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <span className="material-symbols-outlined animate-spin text-3xl mb-2 text-blue-600">sync</span>
                    <p className="font-medium text-xs">Loading leave requests...</p>
                  </td>
                </tr>
              ) : safeRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-400">
                      <span className="material-symbols-outlined text-2xl">event_available</span>
                    </div>
                    <p className="font-bold text-slate-800">No Leave Requests Found</p>
                    <p className="text-xs text-slate-400 mt-1">There are no leave applications matching the selected filter.</p>
                  </td>
                </tr>
              ) : (
                safeRequests.map(req => {
                  const days = calculateDays(req.start_date, req.end_date);
                  return (
                    <tr key={req.id || Math.random()} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{req.worker_name || `Worker #${req.worker_id}`}</div>
                        <div className="text-xs text-slate-400">ID #{req.worker_id} • Applied: {formatDate(req.created_at)}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-blue-600 text-base">date_range</span>
                          {formatDate(req.start_date)} - {formatDate(req.end_date)}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          <span className="font-bold text-slate-700">{days}</span> {days === 1 ? 'Day' : 'Days'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-700 max-w-xs line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {req.reason || 'No reason specified'}
                        </p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1 ${badgeStyles[req.status] || badgeStyles.PENDING}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {req.status || 'PENDING'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-500 italic max-w-xs truncate">
                          {req.admin_notes || '—'}
                        </p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setActiveReviewRequest(req); setAdminNotes(''); }}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-sm">rate_review</span>
                              Review Request
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setActiveReviewRequest(req); setAdminNotes(req.admin_notes || ''); }}
                            className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            Update Notes
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-sm text-slate-600">
            Page <span className="font-bold text-slate-900">{page}</span> of <span className="font-bold text-slate-900">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Review Modal / Dialog */}
      {activeReviewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">event_busy</span>
                  Review Leave Request #{activeReviewRequest.id}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-bold">
                  {activeReviewRequest.worker_name || `Worker #${activeReviewRequest.worker_id}`}
                </p>
              </div>
              <button 
                onClick={() => setActiveReviewRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Leave Duration:</span>
                <span className="font-bold text-slate-800">
                  {formatDate(activeReviewRequest.start_date)} - {formatDate(activeReviewRequest.end_date)} ({calculateDays(activeReviewRequest.start_date, activeReviewRequest.end_date)} Days)
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Worker Reason:</span>
                <p className="text-slate-800 font-medium bg-white p-2.5 rounded-lg border border-slate-200">
                  {activeReviewRequest.reason || 'No reason specified'}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Admin Response Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes for worker regarding approval or rejection..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows="3"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveReviewRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleReview('REJECTED')}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                Reject Request
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleReview('APPROVED')}
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
              >
                {isSubmitting ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">check_circle</span>}
                Approve Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
