import React from 'react';
import EmergencyStatusBadge from './EmergencyStatusBadge';
import EmergencyPriorityBadge from './EmergencyPriorityBadge';

export default function EmergencyTable({ emergencies, onView, onEdit, onAssignTeam, onNotify, onRestore, onClose }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Shutdown No.</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Title</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Type</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Priority</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Ward / Area</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Start Time</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Expected Restore</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {emergencies.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ padding: '3rem', textAlign: 'center', color: 'var(--water-text-muted)', fontWeight: '500' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', color: 'var(--water-border)' }}>
                  notifications_off
                </span>
                No emergency shutdowns logged.
              </td>
            </tr>
          ) : (
            emergencies.map((e) => (
              <tr key={e.id} style={{ borderBottom: '1px solid var(--water-border)' }} className="hover-row">
                <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                  {e.shutdown_number}
                </td>
                <td style={{ padding: '1rem', fontWeight: '600', color: 'var(--water-text)' }}>
                  {e.title}
                </td>
                <td style={{ padding: '1rem', fontWeight: '500' }}>
                  {e.emergency_type.replace(/_/g, ' ')}
                </td>
                <td style={{ padding: '1rem' }}>
                  <EmergencyPriorityBadge priority={e.priority} />
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600' }}>{e.ward}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{e.area}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <EmergencyStatusBadge status={e.status} />
                </td>
                <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                  {new Date(e.shutdown_start).toLocaleString()}
                </td>
                <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                  {e.expected_restore_time ? new Date(e.expected_restore_time).toLocaleString() : '--'}
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => onView(e.id)}
                      className="water-btn-icon" 
                      title="View Details"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary-light)', padding: '0.2rem' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>visibility</span>
                    </button>
                    {e.status !== 'CLOSED' && (
                      <>
                        <button 
                          onClick={() => onEdit(e.id)}
                          className="water-btn-icon" 
                          title="Edit Shutdown Details"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary)', padding: '0.2rem' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                        </button>
                        <button 
                          onClick={() => onAssignTeam(e.id)}
                          className="water-btn-icon" 
                          title="Assign Response Crew"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9b59b6', padding: '0.2rem' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>group_add</span>
                        </button>
                        <button 
                          onClick={() => onNotify(e.id)}
                          className="water-btn-icon" 
                          title="Notify Citizens"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#f39c12', padding: '0.2rem' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>campaign</span>
                        </button>
                        {e.status !== 'RESTORED' && (
                          <button 
                            onClick={() => onRestore(e.id)}
                            className="water-btn-icon" 
                            title="Restore Water Supply"
                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-success)', padding: '0.2rem' }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>play_circle</span>
                          </button>
                        )}
                        <button 
                          onClick={() => onClose(e.id)}
                          className="water-btn-icon" 
                          title="Close Incident"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-danger)', padding: '0.2rem' }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>cancel</span>
                        </button>
                      </>
                    )}
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
