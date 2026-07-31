import React from 'react';

export default function AssignmentTimeline({ updates = [] }) {
  const getTimelineIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'ASSIGNED':
        return 'assignment_ind';
      case 'ACCEPTED':
        return 'thumb_up';
      case 'REJECTED':
        return 'thumb_down';
      case 'TRAVELLING':
        return 'local_shipping';
      case 'ARRIVED':
        return 'location_on';
      case 'WORK_STARTED':
        return 'engineering';
      case 'ON_HOLD':
        return 'pause_circle';
      case 'COMPLETED':
        return 'task_alt';
      case 'VERIFIED':
        return 'verified';
      case 'REOPENED':
        return 'replay';
      default:
        return 'info';
    }
  };

  const getTimelineColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'ASSIGNED':
      case 'ACCEPTED':
        return '#0284c7';
      case 'REJECTED':
        return '#ef4444';
      case 'TRAVELLING':
      case 'ARRIVED':
        return '#6366f1';
      case 'WORK_STARTED':
        return '#f59e0b';
      case 'ON_HOLD':
        return '#f97316';
      case 'COMPLETED':
      case 'VERIFIED':
        return '#10b981';
      case 'REOPENED':
        return '#ec4899';
      default:
        return '#64748b';
    }
  };

  // Sort updates so the newest is at the top
  const sortedUpdates = [...updates].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  if (sortedUpdates.length === 0) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--water-text-muted)', fontSize: '0.88rem' }}>
        No progress logs recorded yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingLeft: '0.5rem', position: 'relative' }}>
      {/* Central Line */}
      <div style={{
        position: 'absolute',
        left: '21px',
        top: '12px',
        bottom: '12px',
        width: '2px',
        backgroundColor: '#e2e8f0',
        zIndex: 0
      }} />

      {sortedUpdates.map((item, index) => {
        const iconColor = getTimelineColor(item.status);
        const iconName = getTimelineIcon(item.status);

        return (
          <div key={item.id || index} style={{ display: 'flex', gap: '1rem', position: 'relative', zIndex: 1 }}>
            {/* Step Icon Indicator */}
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: `2px solid ${iconColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: iconColor,
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.15rem' }}>{iconName}</span>
            </div>

            {/* Content Card */}
            <div style={{
              flex: 1,
              backgroundColor: '#f8fafc',
              border: '1px solid #f1f5f9',
              borderRadius: '12px',
              padding: '0.85rem 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--water-text)' }}>
                  {item.status.replace('_', ' ')}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>

              {item.remarks && (
                <p style={{ fontSize: '0.82rem', color: 'var(--water-text-muted)', margin: 0, lineHeight: '1.4' }}>
                  {item.remarks}
                </p>
              )}

              {item.completion_notes && (
                <p style={{ fontSize: '0.82rem', color: 'var(--water-text-muted)', margin: 0, lineHeight: '1.4' }}>
                  <strong>Notes:</strong> {item.completion_notes}
                </p>
              )}

              {/* Show coordinates if present */}
              {(item.latitude !== null || item.longitude !== null) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#6366f1' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>location_on</span>
                  <span>Coords: {item.latitude?.toFixed(5)}, {item.longitude?.toFixed(5)}</span>
                </div>
              )}

              {/* Show materials check list */}
              {item.materials_used && (
                <div style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', backgroundColor: '#ffffff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '0.2rem' }}>
                  <strong style={{ color: 'var(--water-text)' }}>Materials Used:</strong> {item.materials_used}
                </div>
              )}

              {/* Images Row */}
              {(item.before_image || item.after_image) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {item.before_image && (
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>Before Work:</span>
                      <img 
                        src={item.before_image} 
                        alt="Before maintenance" 
                        style={{ width: '100%', maxHeight: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                      />
                    </div>
                  )}
                  {item.after_image && (
                    <div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--water-text-muted)', display: 'block', marginBottom: '0.2rem' }}>After Work:</span>
                      <img 
                        src={item.after_image} 
                        alt="After maintenance" 
                        style={{ width: '100%', maxHeight: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
