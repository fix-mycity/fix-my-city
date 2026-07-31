import React from 'react';

export default function MaintenanceTimeline({ histories = [] }) {
  const getActionColor = (action) => {
    switch (action) {
      case 'CREATED':
        return 'var(--water-primary-light)';
      case 'UPDATED':
        return 'var(--water-primary)';
      case 'TASK_CREATED':
      case 'TASK_UPDATED':
        return '#9b59b6';
      case 'MATERIAL_ADDED':
        return '#f39c12';
      case 'PHOTO_UPLOADED':
        return '#16a085';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
        Maintenance History Log
      </h3>

      {histories.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)', fontSize: '0.8rem' }}>
          No action logs recorded yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '0.5rem' }}>
          {histories.map((evt, idx) => {
            const color = getActionColor(evt.action);
            return (
              <div key={evt.id || idx} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50px',
                    backgroundColor: color,
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 0 2px ' + color,
                    zIndex: 2
                  }} />
                  {idx < histories.length - 1 && (
                    <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--water-border)', margin: '4px 0' }} />
                  )}
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <strong style={{ fontSize: '0.82rem', color: 'var(--water-text)' }}>
                      {evt.action.replace(/_/g, ' ')}
                    </strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>
                      {new Date(evt.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--water-text-muted)', margin: 0 }}>
                    {evt.remarks || 'No notes added.'}
                  </p>
                  <span style={{ fontSize: '0.68rem', color: 'var(--water-text-muted)', fontStyle: 'italic' }}>
                    Performed by: {evt.performed_by}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
