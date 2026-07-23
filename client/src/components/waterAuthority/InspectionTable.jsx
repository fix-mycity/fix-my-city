import React from 'react';

export default function InspectionTable({ inspections, onEdit, onDelete }) {
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
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Inspection Number</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Ward / Area</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Sample Point Location</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Scheduled Date</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Assigned Inspector</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inspections.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)', fontWeight: '500' }}>
                No quality inspections scheduled.
              </td>
            </tr>
          ) : (
            inspections.map((i) => (
              <tr key={i.id} style={{ borderBottom: '1px solid var(--water-border)' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                  {i.inspection_number}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: '600' }}>{i.ward}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{i.area}</div>
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {i.sample_location || 'N/A'}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '500' }}>
                  {i.inspection_date}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {i.assigned_inspector || 'Unassigned'}
                </td>
                <td style={{ padding: '0.75rem 1rem', ...getStatusStyle(i.status) }}>
                  {i.status}
                </td>
                <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                    <button 
                      onClick={() => onEdit(i)}
                      className="water-btn-icon" 
                      title="Edit Schedule"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary)', padding: '0.2rem' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(i.id)}
                      className="water-btn-icon" 
                      title="Delete Schedule"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-danger)', padding: '0.2rem' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>delete</span>
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
