import React from 'react';
import ScheduleStatusBadge from './ScheduleStatusBadge';

export default function ScheduleTable({ 
  schedules = [], 
  onView, 
  onEdit, 
  onPause, 
  onResume, 
  onDelete 
}) {
  
  const formatTime = (timeStr) => {
    if (!timeStr) return 'N/A';
    // Clean string format: "08:00:00" -> "08:00" or similar
    const parts = timeStr.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return timeStr;
  };

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
            <th style={{ padding: '1rem' }}>Schedule Number</th>
            <th style={{ padding: '1rem' }}>Zone</th>
            <th style={{ padding: '1rem' }}>Ward</th>
            <th style={{ padding: '1rem' }}>Area</th>
            <th style={{ padding: '1rem' }}>Supply Type</th>
            <th style={{ padding: '1rem' }}>Morning Time</th>
            <th style={{ padding: '1rem' }}>Evening Time</th>
            <th style={{ padding: '1rem' }}>Duration</th>
            <th style={{ padding: '1rem' }}>Status</th>
            <th style={{ padding: '1rem', textAlign: 'center' }}>Action</th>
          </tr>
        </thead>
        <tbody style={{
          backgroundColor: '#ffffff',
          color: 'var(--water-text)'
        }}>
          {schedules.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)', fontStyle: 'italic' }}>
                No supply schedules found matching the criteria.
              </td>
            </tr>
          ) : (
            schedules.map((s, index) => (
              <tr 
                key={s.id} 
                style={{
                  borderBottom: '1px solid var(--water-border)',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                  transition: 'background-color 0.2s ease'
                }}
              >
                {/* Schedule Number */}
                <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                  {s.schedule_number}
                </td>

                {/* Zone */}
                <td style={{ padding: '1rem' }}>
                  {s.zone || 'N/A'}
                </td>

                {/* Ward */}
                <td style={{ padding: '1rem', fontWeight: '600' }}>
                  {s.ward}
                </td>

                {/* Area / Street */}
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '500' }}>{s.area}</div>
                  {s.street && <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{s.street}</div>}
                </td>

                {/* Supply Type */}
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.15rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    borderRadius: '4px',
                    backgroundColor: s.supply_type === 'EMERGENCY' ? 'var(--water-danger-subtle)' : s.supply_type === 'SPECIAL' ? 'var(--water-info-subtle)' : 'var(--water-bg)',
                    color: s.supply_type === 'EMERGENCY' ? 'var(--water-danger)' : s.supply_type === 'SPECIAL' ? 'var(--water-info)' : 'var(--water-text)',
                    border: '1px solid rgba(0,0,0,0.05)'
                  }}>
                    {s.supply_type}
                  </span>
                </td>

                {/* Morning Time */}
                <td style={{ padding: '1rem' }}>
                  {s.morning_start_time ? (
                    <span style={{ fontWeight: '600', color: 'var(--water-primary-light)' }}>
                      {formatTime(s.morning_start_time)} - {formatTime(s.morning_end_time)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--water-text-muted)', fontStyle: 'italic' }}>None</span>
                  )}
                </td>

                {/* Evening Time */}
                <td style={{ padding: '1rem' }}>
                  {s.evening_start_time ? (
                    <span style={{ fontWeight: '600', color: '#1e3a8a' }}>
                      {formatTime(s.evening_start_time)} - {formatTime(s.evening_end_time)}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--water-text-muted)', fontStyle: 'italic' }}>None</span>
                  )}
                </td>

                {/* Duration */}
                <td style={{ padding: '1rem', fontWeight: '500' }}>
                  {s.duration_minutes ? `${s.duration_minutes} mins` : 'N/A'}
                </td>

                {/* Status */}
                <td style={{ padding: '1rem' }}>
                  <ScheduleStatusBadge status={s.status} />
                </td>

                {/* Action Buttons */}
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                    {/* View */}
                    <button 
                      onClick={() => onView(s.id)}
                      className="water-btn"
                      style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-primary-light)', color: 'var(--water-primary-light)' }}
                      title="View Details"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>visibility</span>
                    </button>

                    {/* Edit */}
                    <button 
                      onClick={() => onEdit(s.id)}
                      className="water-btn"
                      style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-info)', color: 'var(--water-info)' }}
                      title="Edit Schedule"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>edit</span>
                    </button>

                    {/* Pause (Active status only) */}
                    {s.status === 'ACTIVE' && (
                      <button 
                        onClick={() => onPause(s)}
                        className="water-btn"
                        style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-warning)', color: 'var(--water-warning)' }}
                        title="Pause Supply"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>pause_circle</span>
                      </button>
                    )}

                    {/* Resume (Paused status only) */}
                    {s.status === 'PAUSED' && (
                      <button 
                        onClick={() => onResume(s)}
                        className="water-btn"
                        style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-success)', color: 'var(--water-success)' }}
                        title="Resume Supply"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>play_circle</span>
                      </button>
                    )}

                    {/* Delete */}
                    <button 
                      onClick={() => onDelete(s.id)}
                      className="water-btn"
                      style={{ padding: '0.35rem 0.65rem', border: '1px solid var(--water-danger)', color: 'var(--water-danger)' }}
                      title="Delete Schedule"
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
