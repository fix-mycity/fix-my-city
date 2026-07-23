import React, { useState, useEffect } from "react";
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  getNotificationDashboard,
  getNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  getNotificationHistory
} from "../../services/notificationService";
import NotificationStatusBadge from "../../components/waterAuthority/NotificationStatusBadge";
import NotificationPriorityBadge from "../../components/waterAuthority/NotificationPriorityBadge";

const NotificationCenter = () => {
  // Tabs: broadcasts, templates, audit
  const [activeTab, setActiveTab] = useState("broadcasts");
  
  // States
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [stats, setStats] = useState({
    total_notifications: 0,
    scheduled: 0,
    sent: 0,
    failed: 0,
    unread: 0,
    emergency_notifications: 0
  });

  // Pagination & Filtering
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(8);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    priority: "",
    status: "",
    recipient: ""
  });

  // Modal / Drawer toggles
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedNotificationHistory, setSelectedNotificationHistory] = useState([]);
  
  // Form states
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    notification_type: "GENERAL",
    priority: "MEDIUM",
    recipient_type: "ALL_CITIZENS",
    delivery_channel: "IN_APP",
    status: "DRAFT",
    scheduled_time: "",
    ward: "",
    area: ""
  });
  
  const [templateFormData, setTemplateFormData] = useState({
    id: null,
    template_name: "",
    template_type: "GENERAL",
    subject: "",
    body: "",
    status: "ACTIVE"
  });

  const [formError, setFormError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  // Load dashboard, templates, notifications
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Dashboard Stats
      const statsRes = await getNotificationDashboard();
      setStats(statsRes.data);

      // 2. Templates
      const tempRes = await getNotificationTemplates();
      setTemplates(tempRes.data);

      // 3. Notifications List
      const params = {
        page,
        page_size: pageSize,
        search: search || undefined,
        type_filter: filters.type || undefined,
        priority: filters.priority || undefined,
        status: filters.status || undefined,
        recipient_type: filters.recipient || undefined
      };
      const notifRes = await getNotifications(params);
      setNotifications(notifRes.data.items);
      setTotalPages(notifRes.data.total_pages);
    } catch (err) {
      console.error("Error loading notification center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, filters, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({ type: "", priority: "", status: "", recipient: "" });
    setSearch("");
    setPage(1);
  };

  // Form handlers
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormError("");
    setFormData({
      title: "",
      message: "",
      notification_type: "GENERAL",
      priority: "MEDIUM",
      recipient_type: "ALL_CITIZENS",
      delivery_channel: "IN_APP",
      status: "DRAFT",
      scheduled_time: "",
      ward: "",
      area: ""
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (notif) => {
    setIsEditing(true);
    setFormError("");
    setFormData({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      notification_type: notif.notification_type,
      priority: notif.priority,
      recipient_type: notif.recipient_type,
      delivery_channel: notif.delivery_channel,
      status: notif.status,
      scheduled_time: notif.scheduled_time ? notif.scheduled_time.substring(0, 16) : "",
      ward: notif.ward || "",
      area: notif.area || ""
    });
    setShowFormModal(true);
  };

  const handleOpenDetails = async (notif) => {
    try {
      const detailsRes = await getNotificationById(notif.id);
      setSelectedNotification(detailsRes.data);
      const historyRes = await getNotificationHistory(notif.id);
      setSelectedNotificationHistory(historyRes.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Error fetching notification details:", err);
    }
  };

  const handleApplyTemplate = (temp) => {
    setFormData({
      title: temp.subject || temp.template_name,
      message: temp.body,
      notification_type: temp.template_type,
      priority: "MEDIUM",
      recipient_type: "ALL_CITIZENS",
      delivery_channel: "IN_APP",
      status: "DRAFT",
      scheduled_time: "",
      ward: "",
      area: ""
    });
    setIsEditing(false);
    setShowFormModal(true);
  };

  // Submit Broadcast Form
  const handleSubmitBroadcast = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.title || !formData.message) {
      setFormError("Title and Message body are required.");
      return;
    }

    if (formData.status === "SCHEDULED" && !formData.scheduled_time) {
      setFormError("Scheduled delivery date/time must be provided.");
      return;
    }

    const payload = {
      ...formData,
      scheduled_time: formData.status === "SCHEDULED" ? new Date(formData.scheduled_time).toISOString() : null
    };

    try {
      if (isEditing) {
        await updateNotification(formData.id, payload);
      } else {
        await createNotification(payload);
      }
      setShowFormModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to submit broadcast notification.");
    }
  };

  // Quick Dispatch / Resend Actions
  const handleQuickSend = async (notif) => {
    try {
      await updateNotification(notif.id, { ...notif, status: "SENT" });
      fetchData();
    } catch (err) {
      alert("Failed to send notification: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this broadcast notification?")) return;
    try {
      await deleteNotification(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete: " + (err.response?.data?.detail || err.message));
    }
  };

  // Template Form Handlers
  const handleOpenCreateTemplate = () => {
    setIsEditingTemplate(false);
    setTemplateFormData({
      id: null,
      template_name: "",
      template_type: "GENERAL",
      subject: "",
      body: "",
      status: "ACTIVE"
    });
    setShowTemplateModal(true);
  };

  const handleOpenEditTemplate = (temp) => {
    setIsEditingTemplate(true);
    setTemplateFormData({
      id: temp.id,
      template_name: temp.template_name,
      template_type: temp.template_type,
      subject: temp.subject || "",
      body: temp.body,
      status: temp.status
    });
    setShowTemplateModal(true);
  };

  const handleSubmitTemplate = async (e) => {
    e.preventDefault();
    if (!templateFormData.template_name || !templateFormData.body) {
      alert("Template name and body are required.");
      return;
    }
    try {
      if (isEditingTemplate) {
        await updateNotificationTemplate(templateFormData.id, templateFormData);
      } else {
        await createNotificationTemplate(templateFormData);
      }
      setShowTemplateModal(false);
      fetchData();
    } catch (err) {
      alert("Failed to save template: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Delete this notification template?")) return;
    try {
      await deleteNotificationTemplate(id);
      fetchData();
    } catch (err) {
      alert("Failed to delete template: " + (err.response?.data?.detail || err.message));
    }
  };

  // SVG Chart Computations
  const getTypesChartData = () => {
    const counts = { EMERGENCY: 0, QUALITY: 0, SUPPLY: 0, COMPLAINT: 0, GENERAL: 0, OTHER: 0 };
    notifications.forEach(n => {
      const type = n.notification_type;
      if (counts[type] !== undefined) counts[type]++;
      else counts.OTHER++;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      pct: (count / total) * 100
    })).filter(item => item.count > 0);
  };

  const renderTypesDonutChart = () => {
    const data = getTypesChartData();
    if (data.length === 0) {
      return <div className="text-slate-500 text-sm text-center py-8">No data available</div>;
    }

    const colors = {
      EMERGENCY: "#ef4444",
      QUALITY: "#f59e0b",
      SUPPLY: "#3b82f6",
      COMPLAINT: "#8b5cf6",
      GENERAL: "#10b981",
      OTHER: "#6b7280"
    };

    let accumulatedPercentage = 0;

    return (
      <div className="flex flex-col md:flex-row items-center justify-around gap-4">
        <svg width="150" height="150" viewBox="0 0 36 36" className="transform -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="3" />
          {data.map((item, idx) => {
            const strokeDasharray = `${item.pct} ${100 - item.pct}`;
            const strokeDashoffset = 100 - accumulatedPercentage;
            accumulatedPercentage += item.pct;
            return (
              <circle
                key={idx}
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={colors[item.name] || colors.OTHER}
                strokeWidth="3.5"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 hover:stroke-[4]"
              />
            );
          })}
        </svg>
        <div className="flex flex-col gap-1.5 text-xs text-slate-300">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[item.name] || colors.OTHER }} />
              <span className="font-semibold text-slate-200">{item.name}</span>
              <span className="text-slate-400">({item.count} - {Math.round(item.pct)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
            Notification Center Command
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Dispatch urgent municipality broadcasts, coordinate alerts, and monitor citizen notification records.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 transition duration-150 text-white font-medium text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Broadcast Alert
        </button>
      </div>

      {/* Metric Tiles Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Total Dispatches", val: stats.total_notifications, col: "text-indigo-400", bg: "bg-indigo-950/20 border-indigo-900/40" },
          { label: "Sent / Delivered", val: stats.sent, col: "text-emerald-400", bg: "bg-emerald-950/20 border-emerald-900/40" },
          { label: "Scheduled Slots", val: stats.scheduled, col: "text-amber-400", bg: "bg-amber-950/20 border-amber-900/40" },
          { label: "Delivery Failures", val: stats.failed, col: "text-rose-400", bg: "bg-rose-950/20 border-rose-900/40" },
          { label: "Unread Messages", val: stats.unread, col: "text-cyan-400", bg: "bg-cyan-950/20 border-cyan-900/40" },
          { label: "Emergency Alerts", val: stats.emergency_notifications, col: "text-red-400", bg: "bg-red-950/20 border-red-900/40" }
        ].map((tile, i) => (
          <div key={i} className={`p-4 rounded-xl border ${tile.bg} backdrop-blur-sm shadow-md transition duration-150 hover:-translate-y-0.5`}>
            <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{tile.label}</div>
            <div className={`text-2xl font-black mt-1 ${tile.col}`}>{tile.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs Layout */}
      <div className="flex border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab("broadcasts")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition duration-150 ${
            activeTab === "broadcasts"
              ? "border-indigo-500 text-indigo-400 bg-indigo-950/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Broadcasts Listing
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition duration-150 ${
            activeTab === "templates"
              ? "border-indigo-500 text-indigo-400 bg-indigo-950/10"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Templates Workspace
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "broadcasts" && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Grid Section */}
          <div className="xl:col-span-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Search by ID, title, ward..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 pl-9 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
                />
                <svg className="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex flex-wrap gap-2">
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg p-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="GENERAL">General</option>
                  <option value="COMPLAINT">Complaint</option>
                  <option value="WORK_ASSIGNMENT">Worker Task</option>
                  <option value="SUPPLY">Water Supply</option>
                  <option value="QUALITY">Water Quality</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange("priority", e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg p-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs rounded-lg p-2 text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="SENT">Sent</option>
                  <option value="FAILED">Failed</option>
                </select>
                {(search || Object.values(filters).some(x => x)) && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Broadcast Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                    <th className="p-3">Ref ID</th>
                    <th className="p-3">Title & Summary</th>
                    <th className="p-3">Recipient/Target</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-400">Loading broadcasts...</td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">No matching broadcasts found.</td>
                    </tr>
                  ) : (
                    notifications.map((n) => (
                      <tr key={n.id} className="hover:bg-slate-900/35 transition">
                        <td className="p-3 font-mono text-xs text-indigo-400 font-bold">{n.notification_number}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{n.title}</div>
                          <div className="text-xs text-slate-400 truncate max-w-xs">{n.message}</div>
                        </td>
                        <td className="p-3">
                          <div className="text-xs font-medium text-slate-300">{n.recipient_type.replace('_', ' ')}</div>
                          {n.ward && (
                            <div className="text-[10px] text-slate-500">
                              Ward: {n.ward} {n.area && `| Area: ${n.area}`}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <NotificationPriorityBadge priority={n.priority} />
                        </td>
                        <td className="p-3 font-semibold text-xs text-slate-300 font-mono">{n.delivery_channel}</td>
                        <td className="p-3">
                          <NotificationStatusBadge status={n.status} />
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="inline-flex gap-1.5">
                            <button
                              onClick={() => handleOpenDetails(n)}
                              title="View Recipients & Trail Logs"
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {n.status === "DRAFT" && (
                              <>
                                <button
                                  onClick={() => handleOpenEdit(n)}
                                  title="Edit Broadcast Parameters"
                                  className="bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-400 p-1.5 rounded border border-indigo-900/30"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleQuickSend(n)}
                                  title="Dispatach Instantly"
                                  className="bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 p-1.5 rounded border border-emerald-900/30"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                  </svg>
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteBroadcast(n.id)}
                              title="Delete Record"
                              className="bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 p-1.5 rounded border border-rose-900/30"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-800 mt-4 pt-4">
                <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
                <div className="inline-flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Analytics Sidebar Column */}
          <div className="xl:col-span-1 flex flex-col gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-2 mb-4">
                Broadcast Type Summary
              </h3>
              {renderTypesDonutChart()}
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-base font-bold text-slate-200 border-b border-slate-850 pb-2 mb-4">
                System Guide
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Events on Water Management dashboards automatically emit contextual alerts. You can also manually broadcast drafts from templates.
              </p>
              <div className="border border-slate-800 rounded-lg p-2.5 bg-slate-950/40 text-[11px] text-slate-300">
                <div className="font-semibold text-indigo-400">Recipient Channels:</div>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li><strong>All Citizens</strong>: Broad system notification.</li>
                  <li><strong>Field Workers</strong>: Dispatches tasks updates automatically.</li>
                  <li><strong>Specific Ward</strong>: Emitted during supply schedules/shutdowns.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates Workspace Tab */}
      {activeTab === "templates" && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h2 className="text-xl font-bold text-slate-200">Municipal Alert Templates Workspace</h2>
            <button
              onClick={handleOpenCreateTemplate}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg"
            >
              Add Template Layout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.length === 0 ? (
              <div className="col-span-full p-8 text-center text-slate-500">No template layouts declared.</div>
            ) : (
              templates.map((temp) => (
                <div key={temp.id} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4.5 flex flex-col justify-between hover:border-slate-700 transition">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-indigo-400 uppercase px-2 py-0.5 bg-indigo-950/20 border border-indigo-900/40 rounded">
                        {temp.template_type}
                      </span>
                      <span className={`text-[10px] uppercase font-bold ${temp.status === "ACTIVE" ? "text-emerald-400" : "text-slate-500"}`}>
                        {temp.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-200 text-base mb-1">{temp.template_name}</h3>
                    <p className="text-slate-400 text-xs line-clamp-3 mb-4 bg-slate-900/30 p-2.5 rounded border border-slate-850 font-mono">
                      {temp.body}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-850 pt-3 mt-1">
                    <button
                      onClick={() => handleApplyTemplate(temp)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-2.5 py-1.5 rounded transition"
                    >
                      Use Design
                    </button>
                    <div className="inline-flex gap-1">
                      <button
                        onClick={() => handleOpenEditTemplate(temp)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(temp.id)}
                        className="bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-900/30 text-xs px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Broadcast Create/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowFormModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-slate-100 mb-4">
              {isEditing ? "Modify Broadcast Profile" : "Dispatch Municipality Alert"}
            </h3>

            {formError && (
              <div className="bg-rose-950/30 border border-rose-900/50 text-rose-300 text-xs p-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitBroadcast} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Alert Category</label>
                  <select
                    value={formData.notification_type}
                    onChange={(e) => setFormData({ ...formData, notification_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GENERAL">General Bulletin</option>
                    <option value="COMPLAINT">Water Complaint Alert</option>
                    <option value="WORK_ASSIGNMENT">Crew Work Assignment</option>
                    <option value="SUPPLY">Water Supply Update</option>
                    <option value="PIPELINE">Pipeline Integrity</option>
                    <option value="TANK">Reservoir Tank warning</option>
                    <option value="QUALITY">Water Quality Report</option>
                    <option value="MAINTENANCE">Maintenance Schedule</option>
                    <option value="EMERGENCY">Emergency Shutdown</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Severity Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Alert Broadcast Title</label>
                <input
                  type="text"
                  placeholder="e.g. Ward 4 Supply Disruption"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Broadcast Message Body</label>
                <textarea
                  rows="3"
                  placeholder="Draft message content for residents..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Recipient Group</label>
                  <select
                    value={formData.recipient_type}
                    onChange={(e) => setFormData({ ...formData, recipient_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL_CITIZENS">All Registered Citizens</option>
                    <option value="SPECIFIC_WARD">Specific Municipality Ward</option>
                    <option value="FIELD_WORKERS">Active Field Workers</option>
                    <option value="AUTHORITY">Internal Water Authority</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Delivery Channel</label>
                  <select
                    value={formData.delivery_channel}
                    onChange={(e) => setFormData({ ...formData, delivery_channel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="IN_APP">In-App Notification</option>
                    <option value="SMS">SMS Gateway broadcast</option>
                    <option value="EMAIL">Email Dispatch</option>
                    <option value="PUSH">Mobile Push Message</option>
                  </select>
                </div>
              </div>

              {formData.recipient_type === "SPECIFIC_WARD" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Target Ward</label>
                    <input
                      type="text"
                      placeholder="e.g. Ward 4"
                      value={formData.ward}
                      onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Target Area (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Sector-C"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Dispatch Mode</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="DRAFT">Save as Draft</option>
                    <option value="SENT">Dispatch Instantly</option>
                    <option value="SCHEDULED">Schedule Timer</option>
                  </select>
                </div>
                {formData.status === "SCHEDULED" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Scheduled Time (Future)</label>
                    <input
                      type="datetime-local"
                      value={formData.scheduled_time}
                      onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-5 py-2 rounded-lg font-semibold"
                >
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Drawer / Modal */}
      {showDetailModal && selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-screen overflow-y-auto shadow-2xl p-6 relative flex flex-col justify-between">
            <div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="mb-4">
                <span className="font-mono text-xs text-indigo-400 font-bold bg-indigo-950/20 px-2 py-0.5 border border-indigo-900/30 rounded">
                  {selectedNotification.notification_number}
                </span>
                <h3 className="text-xl font-bold text-slate-100 mt-2">{selectedNotification.title}</h3>
                <div className="flex gap-2 items-center mt-1">
                  <NotificationStatusBadge status={selectedNotification.status} />
                  <NotificationPriorityBadge priority={selectedNotification.priority} />
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850">
                  <div className="text-xs text-slate-500 font-semibold mb-1">Message Content</div>
                  <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedNotification.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-xs text-slate-500">Recipient Target Group</span>
                    <span className="text-sm font-semibold text-slate-300">
                      {selectedNotification.recipient_type.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Delivery Channel</span>
                    <span className="text-sm font-semibold text-slate-300 font-mono">
                      {selectedNotification.delivery_channel}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Scheduled Time</span>
                    <span className="text-xs text-slate-300 font-mono">
                      {selectedNotification.scheduled_time
                        ? new Date(selectedNotification.scheduled_time).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500">Actual Dispatch Sent</span>
                    <span className="text-xs text-slate-300 font-mono">
                      {selectedNotification.sent_time
                        ? new Date(selectedNotification.sent_time).toLocaleString()
                        : "Not Dispatched"}
                    </span>
                  </div>
                </div>

                {/* Recipient Logs */}
                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Recipients logs ({selectedNotification.recipients?.length || 0})</span>
                    <span className="text-[10px] text-slate-500 normal-case font-normal">Mock delivered indicators</span>
                  </h4>
                  <div className="bg-slate-950/70 border border-slate-850 rounded-xl max-h-40 overflow-y-auto text-xs divide-y divide-slate-850">
                    {selectedNotification.recipients?.length === 0 ? (
                      <div className="p-3 text-center text-slate-500">No individual recipient records.</div>
                    ) : (
                      selectedNotification.recipients.map((rec) => (
                        <div key={rec.id} className="p-2.5 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-slate-300">{rec.recipient_name}</div>
                            {rec.recipient_id && <div className="text-[10px] text-slate-500">ID: #{rec.recipient_id}</div>}
                          </div>
                          <div className="flex gap-2 items-center">
                            <span className={`text-[10px] font-bold ${rec.delivery_status === "DELIVERED" ? "text-emerald-400" : "text-amber-400"}`}>
                              {rec.delivery_status}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {rec.sent_at ? new Date(rec.sent_at).toLocaleTimeString() : ""}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Action Audit Trails */}
                <div className="border-t border-slate-800 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Audit Action Trail</h4>
                  <div className="relative pl-4 border-l border-slate-800 space-y-3.5 text-xs">
                    {selectedNotificationHistory.length === 0 ? (
                      <div className="text-slate-500 pl-2">No audit timeline entries logged.</div>
                    ) : (
                      selectedNotificationHistory.map((hist) => (
                        <div key={hist.id} className="relative">
                          <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 border border-slate-900" />
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-200">{hist.action}</span>
                            <span className="text-[10px] text-slate-500">{new Date(hist.created_at).toLocaleString()}</span>
                          </div>
                          <div className="text-slate-400">{hist.remarks}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Actor: {hist.performed_by}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 py-2 rounded-lg"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Create/Edit Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setShowTemplateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold text-slate-100 mb-4">
              {isEditingTemplate ? "Modify Template Layout" : "Add Alert Layout Template"}
            </h3>

            <form onSubmit={handleSubmitTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Template Name</label>
                <input
                  type="text"
                  placeholder="e.g. Standard Water Outage Notice"
                  value={templateFormData.template_name}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, template_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Template Type</label>
                  <select
                    value={templateFormData.template_type}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, template_type: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="GENERAL">General</option>
                    <option value="COMPLAINT">Complaint</option>
                    <option value="SUPPLY">Water Supply</option>
                    <option value="QUALITY">Water Quality</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Status</label>
                  <select
                    value={templateFormData.status}
                    onChange={(e) => setTemplateFormData({ ...templateFormData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Alert Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Critical Water Quality Announcement"
                  value={templateFormData.subject}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Standard Body Message</label>
                <textarea
                  rows="4"
                  placeholder="This is a notice that..."
                  value={templateFormData.body}
                  onChange={(e) => setTemplateFormData({ ...templateFormData, body: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs leading-normal"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-5 py-2 rounded-lg font-semibold"
                >
                  Save Layout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
