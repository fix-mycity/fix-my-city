import React from 'react';

export default function WorkerAvailabilityBadge({ availability }) {
  const getAvailabilityStyles = (availability) => {
    switch (availability) {
      case 'AVAILABLE':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)', dot: '#10b981' };
      case 'BUSY':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.2)', dot: '#3b82f6' };
      case 'ON_LEAVE':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)', dot: '#f59e0b' };
      case 'OFFLINE':
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)', dot: '#64748b' };
    }
  };

  const styles = getAvailabilityStyles(availability);

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.25rem 0.65rem',
        fontSize: '0.75rem',
        fontWeight: '700',
        borderRadius: '20px',
        backgroundColor: styles.bg,
        color: styles.color,
        border: styles.border,
        whiteSpace: 'nowrap'
      }}
    >
      <span 
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: styles.dot,
          display: 'inline-block'
        }}
      />
      {availability}
    </span>
  );
}
