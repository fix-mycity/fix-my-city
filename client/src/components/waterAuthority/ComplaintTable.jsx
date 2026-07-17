import React from 'react';
import ComplaintStatusBadge from './ComplaintStatusBadge';
import ComplaintPriorityBadge from './ComplaintPriorityBadge';

export default function ComplaintTable({ 
  complaints, 
  onViewDetails, 
  onAssignWorker, 
  onUpdateStatus, 
  onCloseComplaint 
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div style={{
      width: '100%',
      overflowX: 'auto',
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: 'var(--water-radius)',
      boxShadow: 'var(--water-shadow-sm)',
      marginBottom: '1.5rem'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
        fontSize: '0.85rem'
      }}>
        <thead>
          <tr style={{
            backgroundColor: 'var(--water-primary-dark)',
            color: '#ffffff',
            fontWeight: '600',
            borderBottom: '2px solid var(--water-border)'
          }}>
            <th style={{ padding: '1rem' }}>Complaint ID</th>
            <th style={{ padding: '1rem' }}>Citizen</th>
            <th style={{ padding: '1rem' }}>Phone</th>
            <th style={{ padding: '1rem' }}>Ward / Area</th>
            <th style={{ padding: '1rem' }}>Category</th>
            <th style={{ padding: '1rem' }}>Priority</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem' }}>Assigned Worker</th>
            <th style={{ padding: '1rem' }}>Created Date</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody style={{
          backgroundColor: '#ffffff',
          color: 'var(--water-text)'
        }}>
          {complaints.map((c, index) => (
            <tr 
              key={c.id} 
              style={{
                borderBottom: '1px solid var(--water-border)',
                backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                transition: 'background-color 0.2s ease'
              }}
            >
              {/* Complaint ID / Number */}
              <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                {c.complaint_number}
              </td>

              {/* Citizen Name */}
              <td style={{ padding: '1rem', fontWeight: '600' }}>
                {c.citizen_name || 'Anonymous'}
              </td>

              {/* Phone */}
              <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                {c.phone || 'N/A'}
              </td>

              {/* Ward / Area */}
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: '500' }}>{c.ward || 'N/A'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{c.area || 'N/A'}</div>
              </td>

              {/* Category */}
              <td style={{ padding: '1rem', fontWeight: '600', textTransform: 'capitalize' }}>
                {c.category?.toLowerCase().replace('_', ' ')}
              </td>

              {/* Priority */}
              <td style={{ padding: '1rem' }}>
                <ComplaintPriorityBadge priority={c.priority} />
              </td>

              {/* Status */}
              <td style={{ padding: '1rem' }}>
                <ComplaintStatusBadge status={c.status} />
              </td>

              {/* Assigned Worker */}
              <td style={{ padding: '1rem', fontWeight: '500' }}>
                {c.assigned_worker_id ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--water-primary-light)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>engineering</span>
                    ID #{c.assigned_worker_id}
                  </span>
                ) : (
                  <span style={{ color: 'var(--water-text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                )}
              </td>

              {/* Created Date */}
              <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                {formatDate(c.created_at)}
              </td>

              {/* Action Buttons */}
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  {/* View Details */}
                  <button 
                    onClick={() => onViewDetails(c.id)}
                    className="water-btn"
                    style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-primary-light)', color: 'var(--water-primary-light)' }}
                    title="View Details"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>visibility</span>
                  </button>

                  {/* Assign Worker */}
                  {c.status !== 'CLOSED' && c.status !== 'REJECTED' && !c.assigned_worker_id && (
                    <button 
                      onClick={() => onAssignWorker(c)}
                      className="water-btn"
                      style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-info)', color: 'var(--water-info)' }}
                      title="Assign Worker"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>person_add</span>
                    </button>
                  )}

                  {/* Update Status */}
                  {c.status !== 'CLOSED' && (
                    <button 
                      onClick={() => onUpdateStatus(c)}
                      className="water-btn"
                      style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-warning)', color: 'var(--water-warning)' }}
                      title="Update Status"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit_document</span>
                    </button>
                  )}

                  {/* Close Complaint */}
                  {c.status !== 'CLOSED' && (
                    <button 
                      onClick={() => onCloseComplaint(c.id)}
                      className="water-btn"
                      style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-danger)', color: 'var(--water-danger)' }}
                      title="Close Complaint"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>lock</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
