import React from 'react';

export default function ComplaintTimeline({ currentStatus }) {
  const steps = [
    { key: 'NEW', label: 'Submitted', desc: 'Complaint logged' },
    { key: 'ACCEPTED', label: 'Accepted', desc: 'Review completed' },
    { key: 'WORKER_ASSIGNED', label: 'Assigned', desc: 'Worker dispatched' },
    { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Operations active' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Work finished' },
    { key: 'VERIFIED', label: 'Verified', desc: 'Quality checked' },
    { key: 'CLOSED', label: 'Closed', desc: 'Archive record' }
  ];

  const getStepIndex = (status) => {
    if (status === 'REJECTED') return -1;
    const idx = steps.findIndex(s => s.key === status);
    return idx !== -1 ? idx : 0;
  };

  const currentIdx = getStepIndex(currentStatus);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: 'var(--water-radius)',
      padding: '1.5rem',
      boxShadow: 'var(--water-shadow-sm)',
      width: '100%',
      marginBottom: '1.5rem'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--water-text)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="material-symbols-outlined" style={{ color: 'var(--water-primary-light)' }}>route</span>
        Complaint Status Timeline
      </h3>

      {currentStatus === 'REJECTED' ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--water-danger)', fontSize: '2rem' }}>cancel</span>
          <div>
            <h4 style={{ fontWeight: '700', color: 'var(--water-text)', fontSize: '0.9rem' }}>Complaint Rejected</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', marginTop: '0.15rem' }}>This complaint was marked as invalid, spam, or duplicates and has been rejected.</p>
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
            
            let color = '#94a3b8'; // gray
            let icon = 'radio_button_unchecked';
            
            if (isCompleted) {
              color = '#10b981'; // green
              icon = 'check_circle';
            } else if (isCurrent) {
              color = '#f59e0b'; // orange
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
                {/* Horizontal connection line */}
                {idx < steps.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '50%',
                    right: '-50%',
                    height: '3px',
                    backgroundColor: idx < currentIdx ? '#10b981' : '#e2e8f0',
                    zIndex: 1
                  }} />
                )}

                {/* Circle Icon */}
                <span 
                  className="material-symbols-outlined" 
                  style={{ 
                    color, 
                    zIndex: 2, 
                    backgroundColor: '#ffffff', 
                    fontSize: '1.6rem',
                    borderRadius: '50%',
                    cursor: 'default'
                  }}
                >
                  {icon}
                </span>

                {/* Text Description */}
                <span style={{ fontSize: '0.82rem', fontWeight: isCurrent ? '700' : '600', color: isCurrent ? 'var(--water-text)' : 'var(--water-text-muted)', marginTop: '0.5rem' }}>
                  {step.label}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', marginTop: '0.15rem' }}>
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
