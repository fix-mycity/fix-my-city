import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import {
  getNotifications,
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

const NOTIFICATION_TYPES = [
  { value: "GENERAL", label: "General Municipal Advisory" },
  { value: "EMERGENCY", label: "Emergency Alert" },
  { value: "SUPPLY", label: "Water Supply Timetable" },
  { value: "QUALITY", label: "Water Quality Notice" },
  { value: "COMPLAINT", label: "Complaint Update" }
];

const RECIPIENT_TYPES = [
  { value: "ALL_CITIZENS", label: "All Registered Citizens" },
  { value: "SPECIFIC_WARD", label: "Targeted Municipal Ward" },
  { value: "SPECIFIC_AREA", label: "Targeted Neighborhood / Area" }
];

const DELIVERY_CHANNELS = [
  { value: "IN_APP", label: "In-App Portal Notification" },
  { value: "SMS", label: "SMS Broadcast Message" },
  { value: "EMAIL", label: "Email Dispatch" }
];

const MUNICIPAL_WARDS = [
  'Ward 1 - Central Market',
  'Ward 2 - North Sector',
  'Ward 3 - South Hill',
  'Ward 4 - East Riverside',
  'Ward 5 - Industrial Park',
  'Ward 6 - West Suburb',
  'Ward 12 - Green Hills'
];

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState("broadcasts");

  // Data states
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [stats, setStats] = useState({
    total_notifications: 0,
    scheduled: 0,
    sent: 0,
    failed: 0,
    unread: 0,
    emergency_notifications: 0
  });

  // Filters & Pagination
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    priority: "",
    status: ""
  });

  // Modals & Details
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [historyLogs, setHistoryLogs] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    notification_type: "GENERAL",
    priority: "MEDIUM",
    recipient_type: "ALL_CITIZENS",
    delivery_channel: "IN_APP",
    status: "SENT",
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

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Dashboard Stats
      const statsRes = await getNotificationDashboard();
      if (statsRes.data) {
        setStats(statsRes.data);
      }

      // 2. Templates
      const tempRes = await getNotificationTemplates();
      setTemplates(tempRes.data || []);

      // 3. Notifications List
      const params = {
        page,
        page_size: pageSize
      };
      if (search && search.trim()) params.search = search.trim();
      if (filters.type && filters.type.trim()) params.type_filter = filters.type.trim();
      if (filters.priority && filters.priority.trim()) params.priority = filters.priority.trim();
      if (filters.status && filters.status.trim()) params.status = filters.status.trim();

      const notifRes = await getNotifications(params);
      const items = Array.isArray(notifRes.data?.items)
        ? notifRes.data.items
        : (Array.isArray(notifRes.data) ? notifRes.data : []);

      setNotifications(items);
      setTotalItems(notifRes.data?.total_items ?? items.length);
      setTotalPages(notifRes.data?.total_pages ?? Math.ceil(items.length / pageSize));
    } catch (err) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search, filters]);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({
      title: "",
      message: "",
      notification_type: "GENERAL",
      priority: "MEDIUM",
      recipient_type: "ALL_CITIZENS",
      delivery_channel: "IN_APP",
      status: "SENT",
      scheduled_time: "",
      ward: "",
      area: ""
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (notif) => {
    setIsEditing(true);
    setFormData({
      id: notif.id,
      title: notif.title,
      message: notif.message,
      notification_type: notif.notification_type || "GENERAL",
      priority: notif.priority || "MEDIUM",
      recipient_type: notif.recipient_type || "ALL_CITIZENS",
      delivery_channel: notif.delivery_channel || "IN_APP",
      status: notif.status || "SENT",
      scheduled_time: notif.scheduled_time ? new Date(notif.scheduled_time).toISOString().slice(0, 16) : "",
      ward: notif.ward || "",
      area: notif.area || ""
    });
    setShowFormModal(true);
  };

  const handleViewDetails = async (notif) => {
    setSelectedNotification(notif);
    setShowDetailModal(true);
    try {
      const histRes = await getNotificationHistory(notif.id);
      setHistoryLogs(Array.isArray(histRes.data) ? histRes.data : []);
    } catch (err) {
      setHistoryLogs([]);
    }
  };

  const handleSubmitBroadcast = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error("Title and Message body are required.");
      return;
    }

    const payload = {
      ...formData,
      scheduled_time: formData.status === "SCHEDULED" && formData.scheduled_time
        ? new Date(formData.scheduled_time).toISOString()
        : null
    };

    try {
      if (isEditing) {
        await updateNotification(formData.id, payload);
        toast.success("Broadcast updated successfully.");
      } else {
        await createNotification(payload);
        toast.success("Broadcast alert dispatched successfully.");
      }
      setShowFormModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to submit broadcast.");
    }
  };

  const handleQuickSend = async (notif) => {
    try {
      await updateNotification(notif.id, { ...notif, status: "SENT" });
      toast.success("Notification sent!");
      fetchData();
    } catch (err) {
      toast.error("Failed to send notification.");
    }
  };

  const handleDeleteBroadcast = async (id) => {
    if (!window.confirm("Are you sure you want to delete this broadcast notification?")) return;
    try {
      await deleteNotification(id);
      toast.success("Notification deleted.");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete notification.");
    }
  };

  // Template Handlers
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

  const handleOpenEditTemplate = (tmpl) => {
    setIsEditingTemplate(true);
    setTemplateFormData({
      id: tmpl.id,
      template_name: tmpl.template_name,
      template_type: tmpl.template_type,
      subject: tmpl.subject || "",
      body: tmpl.body,
      status: tmpl.status || "ACTIVE"
    });
    setShowTemplateModal(true);
  };

  const handleSubmitTemplate = async (e) => {
    e.preventDefault();
    if (!templateFormData.template_name || !templateFormData.body) {
      toast.error("Template Name and Body are required.");
      return;
    }

    try {
      if (isEditingTemplate) {
        await updateNotificationTemplate(templateFormData.id, templateFormData);
        toast.success("Template updated.");
      } else {
        await createNotificationTemplate(templateFormData);
        toast.success("Template created.");
      }
      setShowTemplateModal(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to save template.");
    }
  };

  const handleApplyTemplate = (tmpl) => {
    setFormData(prev => ({
      ...prev,
      title: tmpl.subject || tmpl.template_name,
      message: tmpl.body,
      notification_type: tmpl.template_type
    }));
    setActiveTab("broadcasts");
    setShowFormModal(true);
    toast.success(`Template "${tmpl.template_name}" loaded into Broadcast Form.`);
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm("Delete this notification template?")) return;
    try {
      await deleteNotificationTemplate(id);
      toast.success("Template deleted.");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete template.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Notification & Broadcast Center
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
            Dispatch urgent municipal broadcasts, manage alert templates, and monitor citizen notification records.
          </p>
        </div>

        <button 
          onClick={handleOpenCreate}
          style={{
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.6rem 1.25rem',
            fontWeight: '700',
            fontSize: '0.88rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>campaign</span>
          New Broadcast Alert
        </button>
      </div>

      {/* Clean Summary Metrics Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>send</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total Dispatches</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>{stats.total_notifications || totalItems}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Delivered Alerts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16a34a' }}>{stats.sent}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>schedule</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Scheduled Slots</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ea580c' }}>{stats.scheduled}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>warning</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Emergency Alerts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#dc2626' }}>{stats.emergency_notifications}</div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '0.5rem' }}>
        <button
          onClick={() => setActiveTab("broadcasts")}
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: '700',
            border: 'none',
            borderBottom: activeTab === "broadcasts" ? '3px solid #2563eb' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === "broadcasts" ? '#2563eb' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Broadcast Alerts Log
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          style={{
            padding: '0.75rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: '700',
            border: 'none',
            borderBottom: activeTab === "templates" ? '3px solid #2563eb' : '3px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === "templates" ? '#2563eb' : '#64748b',
            cursor: 'pointer'
          }}
        >
          Notification Templates Workspace ({templates.length})
        </button>
      </div>

      {/* Broadcasts Tab */}
      {activeTab === "broadcasts" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Search & Filter Bar */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '1rem 1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'flex-end',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}>
            <div style={{ flex: '2 1 200px' }}>
              <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Search Notifications</label>
              <input 
                type="text" 
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by title, message, or ward..."
                className="water-input"
                style={{ height: '38px', fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Category</label>
              <select 
                value={filters.type}
                onChange={(e) => { setFilters(prev => ({ ...prev, type: e.target.value })); setPage(1); }}
                className="water-select"
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="">All Categories</option>
                {NOTIFICATION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Priority</label>
              <select 
                value={filters.priority}
                onChange={(e) => { setFilters(prev => ({ ...prev, priority: e.target.value })); setPage(1); }}
                className="water-select"
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div style={{ flex: '1 1 140px' }}>
              <label className="water-label" style={{ fontSize: '0.78rem', marginBottom: '0.3rem' }}>Status</label>
              <select 
                value={filters.status}
                onChange={(e) => { setFilters(prev => ({ ...prev, status: e.target.value })); setPage(1); }}
                className="water-select"
                style={{ height: '38px', fontSize: '0.85rem' }}
              >
                <option value="">All Statuses</option>
                <option value="SENT">Sent / Delivered</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DRAFT">Draft</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {(search || filters.type || filters.priority || filters.status) && (
              <button 
                type="button" 
                onClick={() => { setSearch(""); setFilters({ type: "", priority: "", status: "" }); setPage(1); }}
                style={{
                  height: '38px',
                  padding: '0 1rem',
                  border: '1px solid #fca5a5',
                  backgroundColor: '#fff5f5',
                  color: '#dc2626',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span>
                Reset Filters
              </button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '30vh' }}>
              <span className="material-symbols-outlined" style={{ animation: 'spin 2s linear infinite', fontSize: '2.5rem', color: '#2563eb' }}>
                autorenew
              </span>
            </div>
          ) : (
            <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Ref No.</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Title & Summary</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Target Audience</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Priority</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Channel</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#1e3a8a', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontWeight: '500' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>
                          notifications_off
                        </span>
                        No broadcast notifications found.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((n) => (
                      <tr key={n.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#2563eb' }}>
                          {n.notification_number || `NOT-${n.id}`}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>{n.title}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                            {n.message}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: '500' }}>
                          <div style={{ fontWeight: '600', color: '#334155' }}>{(n.recipient_type || 'ALL_CITIZENS').replace(/_/g, ' ')}</div>
                          {n.ward && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{n.ward}</div>}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <NotificationPriorityBadge priority={n.priority} />
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: '600', color: '#475569' }}>
                          {n.delivery_channel || 'IN_APP'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <NotificationStatusBadge status={n.status} />
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem' }}>
                            <button 
                              onClick={() => handleViewDetails(n)}
                              title="View Details"
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#2563eb' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>visibility</span>
                            </button>
                            {n.status !== "SENT" && (
                              <button 
                                onClick={() => handleQuickSend(n)}
                                title="Send Now"
                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#16a34a' }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>send</span>
                              </button>
                            )}
                            <button 
                              onClick={() => handleOpenEdit(n)}
                              title="Edit Broadcast"
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteBroadcast(n.id)}
                              title="Delete Broadcast"
                              style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Page {page} of {totalPages} ({totalItems} dispatches)
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: page === 1 ? 'not-allowed' : 'pointer',
                        opacity: page === 1 ? 0.5 : 1
                      }}
                    >
                      Previous
                    </button>
                    <button 
                      disabled={page === totalPages}
                      onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#475569',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: page === totalPages ? 'not-allowed' : 'pointer',
                        opacity: page === totalPages ? 0.5 : 1
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Templates Workspace Tab */}
      {activeTab === "templates" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Pre-approved Notification Templates
            </h4>
            <button
              onClick={handleOpenCreateTemplate}
              style={{
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>add</span>
              + Create Template
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {templates.map(tmpl => (
              <div key={tmpl.id} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h5 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                    {tmpl.template_name}
                  </h5>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '50px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
                    {tmpl.template_type}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0, height: '42px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tmpl.body}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
                  <button
                    onClick={() => handleApplyTemplate(tmpl)}
                    style={{
                      border: 'none',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: '700',
                      fontSize: '0.78rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Use Template
                  </button>

                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => handleOpenEditTemplate(tmpl)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                    </button>
                    <button onClick={() => handleDeleteTemplate(tmpl.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broadcast Form Modal */}
      {showFormModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <form onSubmit={handleSubmitBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  {isEditing ? 'Edit Broadcast Alert' : 'Create New Broadcast Alert'}
                </h3>
                <button type="button" onClick={() => setShowFormModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div>
                <label className="water-label">Alert Title *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Scheduled Water Supply Interruption"
                  required
                  className="water-input"
                />
              </div>

              <div>
                <label className="water-label">Message Content *</label>
                <textarea 
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter detailed broadcast message for citizens..."
                  rows="4"
                  required
                  className="water-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="water-label">Notification Type</label>
                  <select 
                    value={formData.notification_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, notification_type: e.target.value }))}
                    className="water-select"
                  >
                    {NOTIFICATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="water-label">Priority Level</label>
                  <select 
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    className="water-select"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical / Emergency</option>
                  </select>
                </div>

                <div>
                  <label className="water-label">Target Recipient Group</label>
                  <select 
                    value={formData.recipient_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, recipient_type: e.target.value }))}
                    className="water-select"
                  >
                    {RECIPIENT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="water-label">Target Ward (If Specific)</label>
                  <input 
                    type="text" 
                    list="modal-ward-list"
                    value={formData.ward}
                    onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
                    placeholder="e.g. Ward 12 - Green Hills"
                    className="water-input"
                  />
                  <datalist id="modal-ward-list">
                    {MUNICIPAL_WARDS.map(w => <option key={w} value={w} />)}
                  </datalist>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowFormModal(false)} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  {isEditing ? 'Save Changes' : 'Dispatch Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '550px',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <form onSubmit={handleSubmitTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  {isEditingTemplate ? 'Edit Template' : 'Create Notification Template'}
                </h3>
                <button type="button" onClick={() => setShowTemplateModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div>
                <label className="water-label">Template Name *</label>
                <input 
                  type="text" 
                  value={templateFormData.template_name}
                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, template_name: e.target.value }))}
                  placeholder="e.g. Pipe Leak Maintenance Advisory"
                  required
                  className="water-input"
                />
              </div>

              <div>
                <label className="water-label">Default Subject / Title</label>
                <input 
                  type="text" 
                  value={templateFormData.subject}
                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Water Pipeline Repairs in Your Area"
                  className="water-input"
                />
              </div>

              <div>
                <label className="water-label">Template Body Content *</label>
                <textarea 
                  value={templateFormData.body}
                  onChange={(e) => setTemplateFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter template text..."
                  rows="4"
                  required
                  className="water-input"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setShowTemplateModal(false)} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {showDetailModal && selectedNotification && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb' }}>
                  {selectedNotification.notification_number || `NOT-${selectedNotification.id}`}
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a', margin: '0.2rem 0 0 0' }}>
                  {selectedNotification.title}
                </h3>
              </div>
              <button type="button" onClick={() => setShowDetailModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Message Body</div>
              <p style={{ fontSize: '0.9rem', color: '#334155', margin: 0, whitespace: 'pre-line' }}>
                {selectedNotification.message}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div><strong style={{ color: '#64748b' }}>Category:</strong> {selectedNotification.notification_type}</div>
              <div><strong style={{ color: '#64748b' }}>Priority:</strong> {selectedNotification.priority}</div>
              <div><strong style={{ color: '#64748b' }}>Target Audience:</strong> {selectedNotification.recipient_type}</div>
              <div><strong style={{ color: '#64748b' }}>Channel:</strong> {selectedNotification.delivery_channel || 'IN_APP'}</div>
              <div><strong style={{ color: '#64748b' }}>Ward:</strong> {selectedNotification.ward || 'All Wards'}</div>
              <div><strong style={{ color: '#64748b' }}>Status:</strong> {selectedNotification.status}</div>
            </div>

            {historyLogs.length > 0 && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                  Delivery Audit Logs ({historyLogs.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {historyLogs.map(log => (
                    <div key={log.id} style={{ fontSize: '0.78rem', backgroundColor: '#f1f5f9', padding: '0.4rem 0.6rem', borderRadius: '6px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{log.action} by {log.performed_by}</span>
                      <span style={{ color: '#64748b' }}>{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
              <button type="button" onClick={() => setShowDetailModal(false)} style={{ padding: '0.5rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
