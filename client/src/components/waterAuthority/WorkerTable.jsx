import React from 'react';
import WorkerStatusBadge from './WorkerStatusBadge';
import WorkerAvailabilityBadge from './WorkerAvailabilityBadge';

export default function WorkerTable({ 
  workers, 
  onViewProfile, 
  onEditWorker, 
  onToggleStatus, 
  onDeleteWorker 
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
            <th style={{ padding: '1rem' }}>Employee ID</th>
            <th style={{ padding: '1rem' }}>Photo</th>
            <th style={{ padding: '1rem' }}>Worker Name</th>
            <th style={{ padding: '1rem' }}>Phone</th>
            <th style={{ padding: '1rem' }}>Ward / Area</th>
            <th style={{ padding: '1rem' }}>Skill</th>
            <th style={{ padding: '1rem' }}>Availability</th>
            <th style={{ padding: '1rem' }}>Employment Status</th>
            <th style={{ padding: '1rem' }}>Joining Date</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody style={{
          backgroundColor: '#ffffff',
          color: 'var(--water-text)'
        }}>
          {workers.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)', fontStyle: 'italic' }}>
                No field workers registered or matching criteria.
              </td>
            </tr>
          ) : (
            workers.map((w, index) => (
              <tr 
                key={w.id} 
                style={{
                  borderBottom: '1px solid var(--water-border)',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  transition: 'background-color 0.2s ease'
                }}
              >
                <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                  {w.employee_id}
                </td>

                <td style={{ padding: '1rem' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {w.photo ? (
                      <img src={w.photo} alt={`${w.first_name}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: '#64748b' }}>person</span>
                    )}
                  </div>
                </td>

                <td style={{ padding: '1rem', fontWeight: '600' }}>
                  {w.first_name} {w.last_name}
                </td>

                <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                  {w.phone}
                </td>

                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '500' }}>{w.ward || 'N/A'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{w.area || 'N/A'}</div>
                </td>

                <td style={{ padding: '1rem', fontWeight: '500' }}>
                  {w.skill || 'General'}
                </td>

                <td style={{ padding: '1rem' }}>
                  <WorkerAvailabilityBadge availability={w.availability} />
                </td>

                <td style={{ padding: '1rem' }}>
                  <WorkerStatusBadge status={w.employment_status} />
                </td>

                <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                  {formatDate(w.joining_date)}
                </td>

                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button 
                      onClick={() => onViewProfile(w.id)}
                      className="water-btn"
                      style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-primary-light)', color: 'var(--water-primary-light)' }}
                      title="View Profile"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>visibility</span>
                    </button>

                    <button 
                      onClick={() => onEditWorker(w.id)}
                      className="water-btn"
                      style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-warning)', color: 'var(--water-warning)' }}
                      title="Edit Worker"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                    </button>

                    <button 
                      onClick={() => onToggleStatus(w)}
                      className="water-btn"
                      style={{ 
                        padding: '0.35rem 0.65rem', 
                        border: w.employment_status === 'ACTIVE' ? '1px solid var(--water-danger)' : '1px solid var(--water-success)', 
                        color: w.employment_status === 'ACTIVE' ? 'var(--water-danger)' : 'var(--water-success)' 
                      }}
                      title={w.employment_status === 'ACTIVE' ? "Deactivate Worker" : "Activate Worker"}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
                        {w.employment_status === 'ACTIVE' ? 'person_off' : 'person_play'}
                      </span>
                    </button>

                    <button 
                      onClick={() => onDeleteWorker(w.id)}
                      className="water-btn"
                      style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-danger)', color: 'var(--water-danger)' }}
                      title="Delete Worker"
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
