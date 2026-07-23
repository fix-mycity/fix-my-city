import React from 'react';
import MaintenanceStatusBadge from './MaintenanceStatusBadge';
import PriorityBadge from './PriorityBadge';

export default function MaintenanceTable({ maintenances, onView, onEdit, onDelete }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Maintenance No.</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Type / Title</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Source</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Ward / Area</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Priority</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Supervisor</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Scheduled</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Completion</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {maintenances.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--water-text-muted)', fontWeight: '500' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', color: 'var(--water-border)' }}>
                  construction
                </span>
                No maintenance records found.
              </td>
            </tr>
          ) : (
            maintenances.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--water-border)' }} className="hover-row">
                <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                  {m.maintenance_number}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--water-text)' }}>{m.maintenance_type.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                    {m.title}
                  </div>
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>
                  {m.source_type} {m.source_reference_id ? `#${m.source_reference_id}` : ''}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600' }}>{m.ward}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{m.area}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <PriorityBadge priority={m.priority} />
                </td>
                <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                  {m.assigned_supervisor || 'Unassigned'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <MaintenanceStatusBadge status={m.status} />
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>
                  {m.scheduled_date || '--'}
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>
                  {m.completed_date || '--'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                    <button 
                      onClick={() => onView(m.id)}
                      className="water-btn-icon" 
                      title="View Details"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary-light)', padding: '0.2rem' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>visibility</span>
                    </button>
                    <button 
                      onClick={() => onEdit(m.id)}
                      className="water-btn-icon" 
                      title="Edit Job Details"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary)', padding: '0.2rem' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(m.id)}
                      className="water-btn-icon" 
                      title="Delete Job"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-danger)', padding: '0.2rem' }}
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
    </div>
  );
}
