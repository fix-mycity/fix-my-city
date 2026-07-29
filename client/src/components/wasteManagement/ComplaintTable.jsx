import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './StatusBadge';

export function ComplaintTable({
  complaints,
  totalItems,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onAssignWorker,
  onUpdateStatus,
  onDeleteComplaint
}) {
  const navigate = useNavigate();

  if (!complaints || complaints.length === 0) {
    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        color: '#64748b'
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#cbd5e1', marginBottom: '0.5rem' }}>
          inbox
        </span>
        <h4 style={{ margin: '0 0 0.25rem 0', color: '#0f172a' }}>No Complaints Found</h4>
        <p style={{ margin: 0, fontSize: '0.85rem' }}>No waste complaints matching your current filters or search terms.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
              <th style={{ padding: '0.85rem 1rem' }}>Complaint #</th>
              <th style={{ padding: '0.85rem 1rem' }}>Category & Title</th>
              <th style={{ padding: '0.85rem 1rem' }}>Citizen Info</th>
              <th style={{ padding: '0.85rem 1rem' }}>Location</th>
              <th style={{ padding: '0.85rem 1rem' }}>Priority</th>
              <th style={{ padding: '0.85rem 1rem' }}>Status</th>
              <th style={{ padding: '0.85rem 1rem' }}>Assigned Staff</th>
              <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}>
                <td style={{ padding: '0.85rem 1rem', fontWeight: '700', color: '#047857', whiteSpace: 'nowrap' }}>
                  #{c.complaint_number}
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: '600', color: '#0f172a' }}>{c.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.category}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: '500', color: '#334155' }}>{c.citizen_name || 'Anonymous Citizen'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phone || 'N/A'}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: '500', color: '#334155' }}>{c.area || 'Citywide'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.ward || 'General'}</div>
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <PriorityBadge priority={c.priority} />
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  <StatusBadge status={c.status} />
                </td>
                <td style={{ padding: '0.85rem 1rem' }}>
                  {c.assigned_worker_name ? (
                    <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#0f172a' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px', color: '#10b981' }}>person</span>
                      {c.assigned_worker_name}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                  )}
                </td>
                <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    {/* View Details */}
                    <button
                      onClick={() => navigate(`/waste/complaints/${c.id}`)}
                      title="View Details"
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #a7f3d0',
                        color: '#047857',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>visibility</span>
                    </button>

                    {/* Assign Worker */}
                    <button
                      onClick={() => onAssignWorker(c)}
                      title="Assign Worker"
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#2563eb',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person_add</span>
                    </button>

                    {/* Change Status */}
                    <button
                      onClick={() => onUpdateStatus(c)}
                      title="Update Status"
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#d97706',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>edit_note</span>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => onDeleteComplaint(c.id)}
                      title="Delete Complaint"
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#dc2626',
                        padding: '0.35rem 0.5rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        padding: '0.85rem 1.25rem',
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        fontSize: '0.82rem',
        color: '#64748b'
      }}>
        <div>
          Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({totalItems} total complaints)
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="waste-btn waste-btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            Previous
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="waste-btn waste-btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default ComplaintTable;
