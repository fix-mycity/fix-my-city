import React from 'react';

export default function MaintenanceHistoryTable({ maintenances, onDelete }) {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return { color: 'var(--water-success)', fontWeight: '700' };
      case 'IN_PROGRESS':
        return { color: 'var(--water-warning)', fontWeight: '700' };
      case 'CANCELLED':
        return { color: 'var(--water-danger)', fontWeight: '700' };
      default:
        return { color: 'var(--water-primary-light)', fontWeight: '700' };
    }
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Type</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Reason</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Dates (Start - End)</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Assigned Worker</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Remarks</th>
            {onDelete && <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'center' }}>Action</th>}
          </tr>
        </thead>
        <tbody>
          {maintenances.length === 0 ? (
            <tr>
              <td colSpan={onDelete ? "7" : "6"} style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)' }}>
                No maintenance history logs found.
              </td>
            </tr>
          ) : (
            maintenances.map((m) => (
              <tr key={m.id} style={{ borderBottom: '1px solid var(--water-border)' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>
                  {m.maintenance_type}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {m.reason || 'N/A'}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div>{m.start_date}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>
                    to {m.end_date || 'Ongoing'}
                  </div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {m.assigned_worker || 'Unassigned'}
                </td>
                <td style={{ padding: '0.75rem 1rem', ...getStatusStyle(m.status) }}>
                  {m.status}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                  {m.remarks || 'No remarks'}
                </td>
                {onDelete && (
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <button 
                      onClick={() => onDelete(m.id)}
                      className="water-btn-icon" 
                      title="Delete Record"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-danger)' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
