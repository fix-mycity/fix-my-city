import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMyProfile, updateMyProfile, getMyTasks, resolveTask, submitLeaveRequest, getMyLeaveRequests, uploadWorkerPhoto, downloadTaskPdfReport } from '../../services/workerService';
import WorkerAvailabilityBadge from '../../components/workers/WorkerAvailabilityBadge';
import WorkerStatusBadge from '../../components/workers/WorkerStatusBadge';
import ComplaintDetailsModal from '../../components/shared/ComplaintDetailsModal';

export default function WorkerDashboard() {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [resolvingTaskId, setResolvingTaskId] = useState(null);
  const [resolutionReport, setResolutionReport] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [isUploadingAfter, setIsUploadingAfter] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState(null);
  const [selectedTaskForDetails, setSelectedTaskForDetails] = useState(null);
  
  // Filter for tasks
  const [taskFilter, setTaskFilter] = useState('ALL'); // ALL, PENDING, RESOLVED

  // Form state for updating contact info
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    emergency_contact_phone: ''
  });
  const [isContactEditMode, setIsContactEditMode] = useState(false);

  // Leave Request Form state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchProfileTasksAndLeaves();
  }, []);

  const fetchProfileTasksAndLeaves = async () => {
    try {
      const response = await getMyProfile();
      setProfile(response.data);
      setContactInfo({
        phone: response.data?.phone || '',
        emergency_contact_phone: response.data?.emergency_contact_phone || ''
      });
      
      try {
        const tasksRes = await getMyTasks();
        setTasks(Array.isArray(tasksRes.data?.items) ? tasksRes.data.items : []);
      } catch (tErr) {
        console.error("Tasks fetch error:", tErr);
        setTasks([]);
      }

      try {
        const leaveRes = await getMyLeaveRequests();
        setLeaveRequests(Array.isArray(leaveRes.data?.items) ? leaveRes.data.items : []);
      } catch (lErr) {
        console.error("Leave requests fetch error:", lErr);
        setLeaveRequests([]);
      }

    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not load worker profile & data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newAvailability) => {
    setIsUpdating(true);
    try {
      await updateMyProfile({ availability: newAvailability });
      setProfile(prev => ({ ...prev, availability: newAvailability }));
      toast.success(`Duty status updated to ${newAvailability}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update duty status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAfterImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }
    setIsUploadingAfter(true);
    try {
      const res = await uploadWorkerPhoto(file);
      if (res.data.success) {
        setAfterImage(res.data.url);
        toast.success("After Fix photo uploaded successfully!");
      }
    } catch (err) {
      toast.error("Failed to upload After Fix photo");
      console.error(err);
    } finally {
      setIsUploadingAfter(false);
    }
  };

  const handleResolveTask = async (taskId) => {
    if (!resolutionReport.trim()) {
      toast.error("Please provide a brief resolution report describing work done.");
      return;
    }
    setIsUpdating(true);
    try {
      await resolveTask(taskId, resolutionReport, afterImage);
      toast.success("Task resolved and report submitted successfully!");
      setResolvingTaskId(null);
      setResolutionReport("");
      setAfterImage("");
      
      const tasksRes = await getMyTasks();
      setTasks(Array.isArray(tasksRes.data?.items) ? tasksRes.data.items : []);
      
      // Auto-update availability back to AVAILABLE if busy
      if (profile?.availability !== 'AVAILABLE') {
         await handleStatusChange('AVAILABLE');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit resolution report");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadPdf = async (taskId) => {
    setDownloadingPdfId(taskId);
    try {
      const res = await downloadTaskPdfReport(taskId);
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

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateMyProfile({
        phone: contactInfo.phone,
        emergency_contact_phone: contactInfo.emergency_contact_phone
      });
      setProfile(prev => ({ 
        ...prev, 
        phone: contactInfo.phone, 
        emergency_contact_phone: contactInfo.emergency_contact_phone 
      }));
      toast.success("Contact information updated successfully!");
      setIsContactEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update contact info");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    if (!leaveForm.start_date || !leaveForm.end_date || !leaveForm.reason.trim()) {
      toast.error("Please fill in all leave request fields.");
      return;
    }

    if (leaveForm.start_date < todayStr) {
      toast.error("Leave start date cannot be in the past. Please choose today or an upcoming date.");
      return;
    }

    if (leaveForm.end_date < leaveForm.start_date) {
      toast.error("Leave end date cannot be before the start date.");
      return;
    }

    setIsSubmittingLeave(true);
    try {
      await submitLeaveRequest({
        start_date: new Date(leaveForm.start_date).toISOString(),
        end_date: new Date(leaveForm.end_date).toISOString(),
        reason: leaveForm.reason
      });
      toast.success("Leave application submitted to department admin successfully!");
      setIsLeaveModalOpen(false);
      setLeaveForm({ start_date: '', end_date: '', reason: '' });
      
      const leaveRes = await getMyLeaveRequests();
      setLeaveRequests(Array.isArray(leaveRes.data?.items) ? leaveRes.data.items : []);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit leave request.");
    } finally {
      setIsSubmittingLeave(false);
    }
  };

  const safeFormatDate = (dateStr, options = { month: 'short', day: 'numeric', year: 'numeric' }) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', options);
    } catch (e) {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-3">
        <span className="material-symbols-outlined animate-spin text-4xl text-blue-600">sync</span>
        <p className="text-slate-500 font-medium text-sm">Loading field officer portal...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-lg mx-auto mt-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-500 text-3xl">error</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Worker Profile Not Found</h2>
        <p className="text-slate-500 mt-2 text-sm">We couldn't locate your worker account details. Please contact your department administrator.</p>
      </div>
    );
  }

  // Safe task arrays
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const pendingTasks = safeTasks.filter(t => t.status !== "RESOLVED" && t.status !== "CLOSED");
  const resolvedTasks = safeTasks.filter(t => t.status === "RESOLVED" || t.status === "CLOSED");

  const displayedTasks = safeTasks.filter(t => {
    if (taskFilter === 'PENDING') return t.status !== "RESOLVED" && t.status !== "CLOSED";
    if (taskFilter === 'RESOLVED') return t.status === "RESOLVED" || t.status === "CLOSED";
    return true;
  });

  const leaveBadgeStyles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      
      {/* Hero Profile Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-6 translate-y-6">
          <span className="material-symbols-outlined" style={{ fontSize: '180px' }}>handyman</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
              {profile.photo ? (
                <img src={profile.photo} alt={profile.first_name} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl text-white/80">person</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome, {profile.first_name || 'Worker'} {profile.last_name || ''}!
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30 uppercase tracking-wider">
                  {profile.department === 'water' ? 'Water Authority' : profile.department === 'traffic' ? 'Traffic Control' : profile.department || 'Field Ops'}
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-0.5">
                {profile.designation || 'Field Officer'} • {profile.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all border border-blue-400/30"
            >
              <span className="material-symbols-outlined text-base">event_busy</span>
              Apply for Leave
            </button>

            <div className="flex items-center gap-3 bg-white/10 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10 shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-300 font-medium">Duty Status</p>
                <p className="text-sm font-bold text-white capitalize">{profile.availability?.replace('_', ' ') || 'Available'}</p>
              </div>
              <WorkerAvailabilityBadge availability={profile.availability} />
            </div>
          </div>
        </div>
      </div>

      {/* TOP SECTION: PRIORITY FOCUS - DUTY STATUS & ASSIGNED TASKS */}
      <div className="space-y-6">
        
        {/* KPI Counter & Duty Switcher Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Duty Control Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm lg:col-span-1 flex flex-col justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">tune</span>
                Duty Availability Switcher
              </h2>
              <p className="text-xs text-slate-500 mb-4">Set your active field status for task dispatchers.</p>

              <div className="space-y-2.5">
                <button 
                  disabled={isUpdating || profile.availability === 'AVAILABLE'}
                  onClick={() => handleStatusChange('AVAILABLE')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    profile.availability === 'AVAILABLE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm font-semibold'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                    <span>Available for Tasks</span>
                  </div>
                  {profile.availability === 'AVAILABLE' && <span className="text-xs font-bold bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-800">ACTIVE</span>}
                </button>

                <button 
                  disabled={isUpdating || profile.availability === 'BUSY'}
                  onClick={() => handleStatusChange('BUSY')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    profile.availability === 'BUSY'
                      ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-sm font-semibold'
                      : 'border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-amber-600">construction</span>
                    <span>Busy on Job Site</span>
                  </div>
                  {profile.availability === 'BUSY' && <span className="text-xs font-bold bg-amber-200/60 px-2 py-0.5 rounded text-amber-800">ACTIVE</span>}
                </button>

                <button 
                  disabled={isUpdating || profile.availability === 'ON_LEAVE'}
                  onClick={() => handleStatusChange('ON_LEAVE')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    profile.availability === 'ON_LEAVE'
                      ? 'bg-slate-100 border-slate-400 text-slate-900 shadow-sm font-semibold'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-slate-500">bedtime</span>
                    <span>On Leave / Off Shift</span>
                  </div>
                  {profile.availability === 'ON_LEAVE' && <span className="text-xs font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-700">ACTIVE</span>}
                </button>
              </div>
            </div>
          </div>

          {/* Task Metrics Summary */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                <span className="material-symbols-outlined text-2xl">assignment</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Tasks</p>
                <h3 className="text-2xl font-extrabold text-slate-900">{safeTasks.length}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                <span className="material-symbols-outlined text-2xl">pending_actions</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending / Active</p>
                <h3 className="text-2xl font-extrabold text-amber-600">{pendingTasks.length}</h3>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Resolved</p>
                <h3 className="text-2xl font-extrabold text-emerald-600">{resolvedTasks.length}</h3>
              </div>
            </div>

          </div>

        </div>

        {/* PRIMARY ASSIGNED TASKS FEED */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">assignment_turned_in</span>
                My Assigned Tasks
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Tasks assigned to you for field investigation and resolution.</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl shrink-0">
              <button 
                onClick={() => setTaskFilter('ALL')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${taskFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({safeTasks.length})
              </button>
              <button 
                onClick={() => setTaskFilter('PENDING')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${taskFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Active ({pendingTasks.length})
              </button>
              <button 
                onClick={() => setTaskFilter('RESOLVED')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${taskFilter === 'RESOLVED' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Resolved ({resolvedTasks.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {displayedTasks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                  <span className="material-symbols-outlined text-3xl">task</span>
                </div>
                <h3 className="font-bold text-slate-800">No Tasks Found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {taskFilter === 'PENDING' ? 'You currently have no pending tasks assigned.' : 'No tasks match the selected filter.'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {displayedTasks.map(task => {
                  const isResolved = task.status === "RESOLVED" || task.status === "CLOSED";
                  const beforeImg = task.before_image || task.image_url;
                  const afterImg = task.after_image;

                  return (
                    <div key={task.id} className={`border rounded-2xl p-6 transition-all relative overflow-hidden bg-white ${isResolved ? 'border-emerald-200 hover:border-emerald-300' : 'border-slate-200 hover:border-blue-300 shadow-sm'}`}>
                      
                      {/* Left accent border */}
                      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${isResolved ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>

                      <div className="pl-3 space-y-4">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider">
                                {task.category || task.department || 'Field Task'}
                              </span>
                              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md border ${isResolved ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {task.status}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                          </div>

                          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {safeFormatDate(task.created_at)}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                          {task.description}
                        </p>

                        <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 pt-1">
                          {(task.location_lat || task.area) && (
                            <div className="flex items-center gap-1 text-slate-700">
                              <span className="material-symbols-outlined text-rose-500 text-base">location_on</span>
                              <span>{task.area || `${task.location_lat?.toFixed(4)}, ${task.location_lng?.toFixed(4)}`}</span>
                            </div>
                          )}
                          {task.reporter_name && (
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-slate-400 text-base">person</span>
                              <span>Reported by: {task.reporter_name}</span>
                            </div>
                          )}
                        </div>

                        {/* VISUAL BEFORE VS AFTER IMAGE SECTION */}
                        <div className="pt-2">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-blue-600 text-base">photo_library</span>
                            Incident Visual Evidence
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Before Image */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-1 text-amber-700">
                                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                  Before Fix (Citizen Photo)
                                </span>
                              </div>
                              {beforeImg ? (
                                <div 
                                  onClick={() => setPreviewImage(beforeImg)}
                                  className="w-full h-44 rounded-lg overflow-hidden border border-slate-200 cursor-pointer relative group bg-slate-900/10"
                                >
                                  <img src={beforeImg} alt="Before Fix" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                                    <span className="material-symbols-outlined text-base">zoom_in</span>
                                    Enlarge
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-44 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                                  <span className="material-symbols-outlined text-3xl mb-1">image_not_supported</span>
                                  No before photo attached
                                </div>
                              )}
                            </div>

                            {/* After Image */}
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                                <span className="flex items-center gap-1 text-emerald-700">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  After Fix (Officer Proof)
                                </span>
                              </div>
                              {afterImg ? (
                                <div 
                                  onClick={() => setPreviewImage(afterImg)}
                                  className="w-full h-44 rounded-lg overflow-hidden border border-slate-200 cursor-pointer relative group bg-slate-900/10"
                                >
                                  <img src={afterImg} alt="After Fix" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                                    <span className="material-symbols-outlined text-base">zoom_in</span>
                                    Enlarge
                                  </div>
                                </div>
                              ) : (
                                <div className="w-full h-44 rounded-lg border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 text-xs">
                                  <span className="material-symbols-outlined text-3xl mb-1">add_a_photo</span>
                                  {isResolved ? 'No after photo provided' : 'Awaiting worker completion upload'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Resolution Summary display if resolved */}
                        {isResolved && task.resolution_report && (
                          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 space-y-1">
                            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1 uppercase tracking-wider">
                              <span className="material-symbols-outlined text-sm">task_alt</span>
                              Resolution Summary
                            </span>
                            <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                              {task.resolution_report}
                            </p>
                          </div>
                        )}

                        {/* Download PDF Work Report Button & View Details */}
                        <div className="pt-2 flex flex-wrap justify-end gap-2">
                          <button
                            onClick={() => setSelectedTaskForDetails(task)}
                            className="px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            View Full Details
                          </button>

                          {isResolved && (
                            <button
                              onClick={() => handleDownloadPdf(task.id)}
                              disabled={downloadingPdfId === task.id}
                              className="px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {downloadingPdfId === task.id ? (
                                <span className="material-symbols-outlined animate-spin text-sm text-blue-600">sync</span>
                              ) : (
                                <span className="material-symbols-outlined text-sm text-rose-600">picture_as_pdf</span>
                              )}
                              Download PDF Work Report
                            </button>
                          )}
                        </div>

                        {/* Interactive Resolution Action */}
                        {!isResolved && (
                          <div className="pt-3 border-t border-slate-100 mt-2">
                            {resolvingTaskId === task.id ? (
                              <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-200 space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-blue-600">build</span>
                                  Submit Resolution & Work Report
                                </h4>

                                <div className="space-y-1.5">
                                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Resolution Work Summary *
                                  </label>
                                  <textarea
                                    value={resolutionReport}
                                    onChange={(e) => setResolutionReport(e.target.value)}
                                    placeholder="Describe work completed, components fixed, or findings on site..."
                                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white"
                                    rows="3"
                                  ></textarea>
                                </div>

                                {/* After Image Upload Field */}
                                <div className="space-y-2">
                                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    After Fix Photo Proof (Optional)
                                  </label>

                                  <div className="flex items-center gap-4">
                                    {afterImage ? (
                                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300">
                                        <img src={afterImage} alt="After Fix Preview" className="w-full h-full object-cover" />
                                        <button 
                                          onClick={() => setAfterImage("")}
                                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 shadow hover:bg-red-700"
                                        >
                                          <span className="material-symbols-outlined text-xs">close</span>
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:border-blue-400 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer shadow-sm transition-all">
                                        {isUploadingAfter ? (
                                          <span className="material-symbols-outlined animate-spin text-sm text-blue-600">sync</span>
                                        ) : (
                                          <span className="material-symbols-outlined text-sm text-blue-600">add_photo_alternate</span>
                                        )}
                                        {isUploadingAfter ? 'Uploading Photo...' : 'Upload After Fix Photo'}
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          className="hidden" 
                                          onChange={handleAfterImageUpload} 
                                          disabled={isUploadingAfter} 
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex justify-end gap-2 pt-2 border-t border-blue-200/60">
                                  <button 
                                    onClick={() => { setResolvingTaskId(null); setResolutionReport(""); setAfterImage(""); }}
                                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => handleResolveTask(task.id)}
                                    disabled={isUpdating || !resolutionReport.trim() || isUploadingAfter}
                                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                                  >
                                    {isUpdating ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">task_alt</span>}
                                    Submit Resolution Report
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setResolvingTaskId(task.id)}
                                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
                              >
                                <span className="material-symbols-outlined text-sm">build</span>
                                Resolve & Complete Task
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* LEAVE APPLICATIONS TRACKING SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">event_busy</span>
              My Leave Applications
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Track your submitted leave requests and admin approval statuses.</p>
          </div>

          <button
            onClick={() => setIsLeaveModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Leave Application
          </button>
        </div>

        <div className="p-6">
          {!Array.isArray(leaveRequests) || leaveRequests.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">date_range</span>
              <p className="text-xs font-medium text-slate-600">No leave requests submitted yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leaveRequests.map(req => (
                <div key={req.id || Math.random()} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span className="material-symbols-outlined text-blue-600 text-sm">calendar_month</span>
                      {safeFormatDate(req.start_date, { month: 'short', day: 'numeric' })} - {safeFormatDate(req.end_date, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>

                    <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${leaveBadgeStyles[req.status] || leaveBadgeStyles.PENDING}`}>
                      {req.status || 'PENDING'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60">
                    <span className="font-semibold text-slate-700 block mb-0.5">Reason:</span>
                    {req.reason || 'No reason specified'}
                  </p>

                  {req.admin_notes && (
                    <p className="text-[11px] text-blue-700 bg-blue-50/80 p-2 rounded-lg border border-blue-100">
                      <span className="font-bold block">Admin Feedback:</span>
                      {req.admin_notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECOND SECTION: DETAILED WORKER PROFILE AREA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">account_box</span>
              Worker Profile & Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Your official field officer profile, contact info, and assignment details.</p>
          </div>

          {!isContactEditMode && (
            <button 
              onClick={() => setIsContactEditMode(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Contact Details
            </button>
          )}
        </div>

        <div className="p-6 md:p-8 space-y-8">
          
          {/* Editable Contact Info */}
          {isContactEditMode ? (
            <form onSubmit={handleContactSubmit} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Update Phone & Emergency Numbers</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input 
                    type="text" 
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Contact Number</label>
                  <input 
                    type="text" 
                    value={contactInfo.emergency_contact_phone}
                    onChange={(e) => setContactInfo({...contactInfo, emergency_contact_phone: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsContactEditMode(false);
                    setContactInfo({ phone: profile.phone, emergency_contact_phone: profile.emergency_contact_phone });
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdating}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-1.5"
                >
                  {isUpdating && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                  Save Contact Info
                </button>
              </div>
            </form>
          ) : null}

          {/* Full Information Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            
            {/* Column 1: Personal & Account */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-700 border-b border-slate-200 pb-2">
                <span className="material-symbols-outlined text-base">badge</span>
                Personal Information
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Full Name</span>
                  <span className="font-semibold text-slate-900">{profile.first_name || 'Worker'} {profile.last_name || ''}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Username</span>
                  <span className="font-mono text-slate-700">{profile.username || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Email Address</span>
                  <span className="font-medium text-slate-800 break-all">{profile.email || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Phone Number</span>
                  <span className="font-medium text-slate-800">{profile.phone || 'Not configured'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Emergency Contact</span>
                  <span className="font-medium text-slate-800">{profile.emergency_contact_phone || 'Not configured'}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Job & Skill Details */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-700 border-b border-slate-200 pb-2">
                <span className="material-symbols-outlined text-base">engineering</span>
                Job & Skill Details
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Department</span>
                  <span className="font-semibold text-slate-900 uppercase tracking-wider">
                    {profile.department === 'water' ? 'Water Authority' : profile.department === 'traffic' ? 'Traffic Control' : profile.department || 'Field Ops'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Designation</span>
                  <span className="font-medium text-slate-800">{profile.designation || 'Field Officer'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Primary Skill</span>
                  <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                    {profile.skill || 'General Maintenance'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Experience</span>
                  <span className="font-medium text-slate-800">{profile.experience || 0} Years</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Employment Status</span>
                  <WorkerStatusBadge status={profile.employment_status} />
                </div>
              </div>
            </div>

            {/* Column 3: Location & Jurisdiction */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-blue-700 border-b border-slate-200 pb-2">
                <span className="material-symbols-outlined text-base">map</span>
                Location & Jurisdiction
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Assigned Place / Zone</span>
                  <span className="font-semibold text-slate-900">{profile.place || 'Unassigned Zone'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">District</span>
                  <span className="font-medium text-slate-800">{profile.district || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">State</span>
                  <span className="font-medium text-slate-800">{profile.state || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-medium block">Pincode</span>
                  <span className="font-mono text-slate-800">{profile.pincode || profile.pin_code || 'N/A'}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* APPLY FOR LEAVE MODAL */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">event_busy</span>
                  Apply for Leave
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Submit a leave request for department admin approval.</p>
              </div>
              <button 
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Start Date *</label>
                  <input 
                    type="date"
                    required
                    min={todayStr}
                    value={leaveForm.start_date}
                    onChange={(e) => setLeaveForm({...leaveForm, start_date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Today or upcoming</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">End Date *</label>
                  <input 
                    type="date"
                    required
                    min={leaveForm.start_date || todayStr}
                    value={leaveForm.end_date}
                    onChange={(e) => setLeaveForm({...leaveForm, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Must be on/after start date</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Reason for Leave *</label>
                <textarea
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})}
                  placeholder="Explain why leave is required (e.g. medical emergency, personal, family duty)..."
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  rows="3"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingLeave}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex items-center gap-1.5"
                >
                  {isSubmittingLeave ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : <span className="material-symbols-outlined text-sm">send</span>}
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE PREVIEW LIGHTBOX MODAL */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fadeIn" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black p-2 border border-slate-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-slate-900/80 hover:bg-slate-800 text-white p-2 rounded-full z-10 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
            <img src={previewImage} alt="Enlarged Preview" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}

      {/* COMPLAINT DETAILS MODAL */}
      {selectedTaskForDetails && (
        <ComplaintDetailsModal
          complaint={selectedTaskForDetails}
          onClose={() => setSelectedTaskForDetails(null)}
          workerName={profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : null}
        />
      )}

    </div>
  );
}
