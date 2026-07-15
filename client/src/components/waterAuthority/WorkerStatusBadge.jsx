import React from 'react';

export default function WorkerStatusBadge({ status }) {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'ACTIVE':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'INACTIVE':
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)' };
      case 'SUSPENDED':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'RETIRED':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' };
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
