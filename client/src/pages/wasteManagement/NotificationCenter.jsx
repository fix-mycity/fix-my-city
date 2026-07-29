import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/wasteManagement/PageHeader';
import LoadingSkeleton from '../../components/wasteManagement/LoadingSkeleton';

import {
  getWasteNotifications,
  markWasteNotificationRead,
  markAllWasteNotificationsRead,
  archiveWasteNotification,
  deleteWasteNotification
} from '../../services/wasteManagementService';
import { toast } from 'react-hot-toast';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [statusTab, setStatusTab] = useState(''); // '', 'Unread', 'Read', 'Archived'
  const [typeFilter, setTypeFilter] = useState(''); // '', 'Worker Assignment', 'Collection Reminder', 'Bin Full Alert', 'Vehicle Maintenance', 'Emergency Alert'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        page_size: pageSize
      };
      if (statusTab) params.status = statusTab;
      if (typeFilter) params.notification_type = typeFilter;
      if (searchQuery) params.search = searchQuery;

      const res = await getWasteNotifications(params);
      setNotifications(res.data.items || []);
      setUnreadCount(res.data.unread_count || 0);
      setTotalItems(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      toast.error('Failed to load waste notifications feed.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, statusTab, typeFilter, searchQuery]);

  const handleMarkRead = async (id) => {
    try {
      await markWasteNotificationRead(id);
      toast.success('Notification marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllWasteNotificationsRead();
      toast.success('All notifications marked as read');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleArchive = async (id) => {
    try {
      await archiveWasteNotification(id);
      toast.success('Notification archived');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to archive notification');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteWasteNotification(id);
        toast.success('Notification deleted');
        fetchNotifications();
      } catch (err) {
        toast.error('Failed to delete notification');
      }
    }
  };

  // Helper mapping for notification icons and colors
  const getTypeMeta = (type) => {
    switch (type) {
      case 'Emergency Alert':
        return { icon: 'warning', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
      case 'Bin Full Alert':
        return { icon: 'delete_sweep', color: '#d97706', bg: '#fffbeb', border: '#fef3c7' };
      case 'Vehicle Maintenance':
        return { icon: 'build', color: '#0284c7', bg: '#e0f2fe', border: '#bae6fd' };
      case 'Worker Assignment':
        return { icon: 'group_add', color: '#6d28d9', bg: '#f5f3ff', border: '#ddd6fe' };
      case 'Collection Reminder':
        return { icon: 'alarm', color: '#047857', bg: '#f0fdf4', border: '#d1fae5' };
      default:
        return { icon: 'notifications', color: '#475569', bg: '#f1f5f9', border: '#cbd5e1' };
    }
  };

  return (
    <div className="waste-notification-center-page">
      <PageHeader
        title="Waste Authority Notification Center"
        subtitle="Real-time alerts for bin overflows, emergency complaints, vehicle servicing, and crew assignments"
        onActionClick={handleMarkAllRead}
        actionLabel="Mark All as Read"
      />

      {/* Top Stats Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">mark_email_unread</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Unread Alerts</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#dc2626' }}>{unreadCount}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#fffbeb', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">delete_sweep</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Bin Full Alerts</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#d97706' }}>
              {notifications.filter(n => n.notification_type === 'Bin Full Alert').length}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">build</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Fleet Maintenance</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0284c7' }}>
              {notifications.filter(n => n.notification_type === 'Vehicle Maintenance').length}
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f5f3ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">group_add</span>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Worker Crew Assignments</div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#6d28d9' }}>
              {notifications.filter(n => n.notification_type === 'Worker Assignment').length}
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        {[
          { key: '', label: `All Alerts (${totalItems})` },
          { key: 'Unread', label: `Unread (${unreadCount})` },
          { key: 'Read', label: 'Read' },
          { key: 'Archived', label: 'Archived' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusTab(tab.key)}
            style={{
              padding: '0.45rem 0.85rem',
              fontSize: '0.82rem',
              fontWeight: '700',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: statusTab === tab.key ? '#047857' : '#f1f5f9',
              color: statusTab === tab.key ? '#ffffff' : '#475569'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Type Filter & Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', padding: '0.85rem 1rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search notifications by title or message..."
          className="waste-form-input"
          style={{ flexGrow: 1, maxWidth: '320px', fontSize: '0.85rem' }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="waste-form-select"
          style={{ padding: '0.45rem 0.65rem', fontSize: '0.82rem' }}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Notification Types</option>
          <option value="Worker Assignment">Worker Assignment</option>
          <option value="Collection Reminder">Collection Reminder</option>
          <option value="Bin Full Alert">Bin Full Alert</option>
          <option value="Vehicle Maintenance">Vehicle Maintenance</option>
          <option value="Emergency Alert">Emergency Alert</option>
        </select>

        <button
          onClick={() => { setSearchQuery(''); setTypeFilter(''); setStatusTab(''); }}
          className="waste-btn waste-btn-secondary"
          style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
        >
          Reset Filters
        </button>
      </div>

      {/* Notification Feed List */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : notifications.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1' }}>notifications_off</span>
          <div style={{ fontWeight: '700', fontSize: '1rem', marginTop: '0.5rem' }}>No notifications found</div>
          <div style={{ fontSize: '0.82rem', marginTop: '0.2rem' }}>You are all caught up! No notifications match the selected criteria.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => {
            const meta = getTypeMeta(n.notification_type);
            const isUnread = n.status === 'Unread';

            return (
              <div
                key={n.id}
                style={{
                  backgroundColor: isUnread ? '#ffffff' : '#f8fafc',
                  border: isUnread ? '1.5px solid #047857' : '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  boxShadow: isUnread ? '0 2px 4px rgba(4,120,87,0.08)' : 'none'
                }}
              >
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
                  {/* Type Icon */}
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: meta.bg,
                    color: meta.color,
                    border: `1px solid ${meta.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span className="material-symbols-outlined">{meta.icon}</span>
                  </div>

                  {/* Body Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: meta.bg,
                        color: meta.color
                      }}>
                        {n.notification_type}
                      </span>

                      {isUnread && (
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#047857', backgroundColor: '#d1fae5', padding: '0.1rem 0.4rem', borderRadius: '10px' }}>
                          NEW UNREAD
                        </span>
                      )}

                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: 'auto' }}>
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', margin: '0 0 0.3rem 0' }}>
                      {n.title}
                    </h4>

                    <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                      {n.message}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      title="Mark as Read"
                      style={{ background: '#f0fdf4', border: '1px solid #d1fae5', color: '#047857', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>done</span>
                    </button>
                  )}

                  {n.status !== 'Archived' && (
                    <button
                      onClick={() => handleArchive(n.id)}
                      title="Archive Notification"
                      style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>archive</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(n.id)}
                    title="Delete Notification"
                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.35rem 0.5rem', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
