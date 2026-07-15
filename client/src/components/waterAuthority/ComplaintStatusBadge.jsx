import React from 'react';

export default function ComplaintStatusBadge({ status }) {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'NEW':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'ACCEPTED':
        return { bg: 'rgba(245, 158, 11, 0.1)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'WORKER_ASSIGNED':
        return { bg: 'rgba(6, 182, 212, 0.1)', color: '#0891b2', border: '1px solid rgba(6, 182, 212, 0.2)' };
      case 'IN_PROGRESS':
        return { bg: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04', border: '1px solid rgba(234, 179, 8, 0.2)' };
      case 'COMPLETED':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'VERIFIED':
        return { bg: 'rgba(20, 184, 166, 0.1)', color: '#0d9488', border: '1px solid rgba(20, 184, 166, 0.2)' };
      case 'REJECTED':
        return { bg: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'CLOSED':
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)' };
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
