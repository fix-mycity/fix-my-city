import React from 'react';

export function ComplaintStatusTimeline({ currentStatus }) {
  const steps = [
    { key: 'PENDING', label: 'Submitted', desc: 'Complaint logged' },
    { key: 'ACCEPTED', label: 'Accepted', desc: 'Review completed' },
    { key: 'ASSIGNED', label: 'Assigned', desc: 'Worker dispatched' },
    { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Operations active' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Work finished' },
    { key: 'VERIFIED', label: 'Verified', desc: 'Quality checked' },
    { key: 'CLOSED', label: 'Closed', desc: 'Archive record' }
  ];

  const getStepIndex = (status) => {
    if (status === 'REJECTED') return -1;
    if (status === 'NEW') return 0;
    const idx = steps.findIndex(s => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentIdx = getStepIndex(currentStatus);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      width: '100%',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="material-symbols-outlined" style={{ color: '#059669' }}>route</span>
        Complaint Status Timeline
      </h3>

      {currentStatus === 'REJECTED' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: '#ef4444', fontSize: '2rem' }}>cancel</span>
          <div>
            <h4 style={{ fontWeight: '700', color: '#991b1b', fontSize: '0.9rem' }}>Complaint Rejected</h4>
            <p style={{ fontSize: '0.8rem', color: '#7f1d1d', marginTop: '0.15rem' }}>This complaint was marked as invalid, out of scope, or rejected by authority.</p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          position: 'relative',
          width: '100%',
          overflowX: 'auto',
          paddingBottom: '0.5rem'
        }}>
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isCurrent = idx === currentIdx;

            let color = '#94a3b8';
            let icon = 'radio_button_unchecked';

            if (isCompleted) {
              color = '#059669'; // Emerald green
              icon = 'check_circle';
            } else if (isCurrent) {
              color = '#f59e0b'; // Amber
              icon = 'pending';
            }

            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: '1',
                  minWidth: '100px',
                  position: 'relative',
                  textAlign: 'center'
                }}
              >
                {/* Connection line */}
                {idx < steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    right: '-50%',
                    height: '3px',
                    backgroundColor: idx < currentIdx ? '#059669' : '#e2e8f0',
                    zIndex: 1
                  }} />
                )}

                {/* Circle Icon */}
                <span
                  className="material-symbols-outlined"
                  style={{
                    color,
                    backgroundColor: '#ffffff',
                    zIndex: 2,
                    fontSize: '1.6rem',
                    marginBottom: '0.4rem'
                  }}
                >
                  {icon}
                </span>

                {/* Label */}
                <span style={{
                  fontSize: '0.82rem',
                  fontWeight: isCurrent || isCompleted ? '700' : '500',
                  color: isCurrent ? '#059669' : isCompleted ? '#0f172a' : '#64748b'
                }}>
                  {step.label}
                </span>

                {/* Desc */}
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.1rem' }}>
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ComplaintTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return (
      <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '1rem 0' }}>
        No audit log history entries recorded yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.5rem' }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        bottom: '10px',
        left: '7px',
        width: '2px',
        backgroundColor: '#e2e8f0'
      }} />

      {history.map((h, index) => (
        <div key={h.id || index} style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '-1.5rem',
            top: '4px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: index === history.length - 1 ? '#059669' : '#10b981',
            border: '2px solid #ffffff',
            boxShadow: '0 0 0 2px #a7f3d0'
          }} />

          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.75rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>{h.action}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {h.created_at ? new Date(h.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
              </span>
            </div>

            {h.notes && (
              <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.3rem' }}>
                {h.notes}
              </div>
            )}

            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.3rem' }}>
              By: <strong>{h.performed_by || 'System'}</strong>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
