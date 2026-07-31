import React from 'react';

export default function WorkerSelector({ workers = [], selectedId, onChange, label = "Assign Field Worker" }) {
  const getAvailabilityBadgeColor = (avail) => {
    switch (avail?.toUpperCase()) {
      case 'AVAILABLE':
        return '#10b981'; // green
      case 'BUSY':
        return '#ef4444'; // red
      case 'ON_LEAVE':
        return '#f59e0b'; // orange
      default:
        return '#64748b'; // gray
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--water-text)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', width: '100%' }}>
        <select
          value={selectedId || ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            border: '1px solid var(--water-border)',
            fontSize: '0.85rem',
            outline: 'none',
            backgroundColor: '#ffffff',
            color: 'var(--water-text)',
            cursor: 'pointer'
          }}
        >
          <option value="">-- Choose Field Worker --</option>
          {workers.map((w) => (
            <option key={w.id} value={w.id} disabled={w.availability === 'ON_LEAVE'}>
              {w.first_name} {w.last_name} ({w.skill || 'General'}) — {w.availability} {w.availability === 'BUSY' ? ' (Assigned Task)' : ''}
            </option>
          ))}
        </select>
        
        {/* Quick availability indicators preview */}
        {selectedId && (
          (() => {
            const selectedWorker = workers.find(w => w.id === parseInt(selectedId));
            if (!selectedWorker) return null;
            const statusColor = getAvailabilityBadgeColor(selectedWorker.availability);
            return (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.75rem',
                color: 'var(--water-text-muted)',
                marginTop: '0.4rem'
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: statusColor,
                  display: 'inline-block'
                }} />
                <span>
                  Worker availability: <strong style={{ color: statusColor }}>{selectedWorker.availability}</strong>
                </span>
                {selectedWorker.phone && (
                  <>
                    <span>•</span>
                    <span>Phone: {selectedWorker.phone}</span>
                  </>
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}
