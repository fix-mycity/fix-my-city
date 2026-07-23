import React from 'react';

const STEPS = [
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'ACCEPTED', label: 'Accepted' },
  { key: 'TRAVELLING', label: 'Travelling' },
  { key: 'ARRIVED', label: 'Arrived' },
  { key: 'WORK_STARTED', label: 'Started' },
  { key: 'COMPLETED', label: 'Completed' }
];

export default function StatusStepper({ currentStatus }) {
  const getStatusIndex = (status) => {
    const s = status?.toUpperCase() || 'ASSIGNED';
    if (s === 'REJECTED') return -1;
    if (s === 'REOPENED') return 4; // Back to started
    if (s === 'VERIFIED') return 5;
    return STEPS.findIndex(step => step.key === s);
  };

  const currentIndex = getStatusIndex(currentStatus);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid var(--water-border)',
      borderRadius: '12px',
      padding: '1.25rem',
      boxShadow: 'var(--water-shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem'
    }}>
      <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: 'var(--water-text)' }}>
        Workflow Status Tracker
      </h4>

      {currentStatus === 'REJECTED' ? (
        <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span className="material-symbols-outlined">cancel</span>
          Task has been rejected by the field worker.
        </div>
      ) : (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          padding: '0.5rem 0',
          overflowX: 'auto'
        }}>
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            const isPending = idx > currentIndex;

            let circleBg = '#f1f5f9';
            let circleBorder = '#cbd5e1';
            let circleColor = '#64748b';
            let lineBg = '#e2e8f0';

            if (isCompleted) {
              circleBg = '#dcfce7';
              circleBorder = '#10b981';
              circleColor = '#10b981';
              lineBg = '#10b981';
            } else if (isActive) {
              circleBg = '#e0f2fe';
              circleBorder = '#0284c7';
              circleColor = '#0284c7';
            }

            return (
              <React.Fragment key={step.key}>
                {/* Connecting Line (except for the first element) */}
                {idx > 0 && (
                  <div style={{
                    flex: 1,
                    height: '3px',
                    backgroundColor: idx <= currentIndex ? '#10b981' : '#e2e8f0',
                    margin: '0 0.5rem',
                    minWidth: '20px'
                  }} />
                )}

                {/* Step Circle & Label */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.35rem',
                  position: 'relative',
                  zIndex: 1,
                  flexShrink: 0
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: circleBg,
                    border: `2px solid ${circleBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: circleColor,
                    fontWeight: '700',
                    fontSize: '0.85rem'
                  }}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined" style={{ fontSize: '1.15rem' }}>check</span>
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: isActive ? '800' : '600',
                    color: isActive ? 'var(--water-primary-light)' : 'var(--water-text-muted)',
                    whiteSpace: 'nowrap'
                  }}>
                    {step.label}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
