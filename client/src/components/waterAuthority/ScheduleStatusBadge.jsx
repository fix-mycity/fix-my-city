import React from 'react';

export default function ScheduleStatusBadge({ status }) {
  const getStatusStyles = (statusVal) => {
    const s = String(statusVal).toUpperCase();
    switch (s) {
      case 'SCHEDULED':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'ACTIVE':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'PAUSED':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'COMPLETED':
        return { bg: 'rgba(20, 184, 166, 0.1)', color: '#0d9488', border: '1px solid rgba(20, 184, 166, 0.2)' };
      case 'CANCELLED':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.1)', color: '#64748b', border: '1px solid rgba(148, 163, 184, 0.2)' };
    }
  };

  const styles = getStatusStyles(status);

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
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
      {status}
    </span>
  );
}
