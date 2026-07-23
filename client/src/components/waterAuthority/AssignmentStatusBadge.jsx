import React from 'react';

export default function AssignmentStatusBadge({ status }) {
  const getStatusStyles = (statusVal) => {
    const s = statusVal?.toUpperCase() || 'ASSIGNED';
    switch (s) {
      case 'ASSIGNED':
        return { bg: '#e0f2fe', color: '#0369a1', label: 'Assigned' };
      case 'ACCEPTED':
        return { bg: '#e0f2fe', color: '#0284c7', label: 'Accepted' };
      case 'REJECTED':
        return { bg: '#fee2e2', color: '#b91c1c', label: 'Rejected' };
      case 'TRAVELLING':
        return { bg: '#f3e8ff', color: '#7e22ce', label: 'Travelling' };
      case 'ARRIVED':
        return { bg: '#e0e7ff', color: '#4338ca', label: 'Arrived' };
      case 'WORK_STARTED':
        return { bg: '#fef3c7', color: '#b45309', label: 'In Progress' };
      case 'ON_HOLD':
        return { bg: '#ffedd5', color: '#c2410c', label: 'On Hold' };
      case 'COMPLETED':
        return { bg: '#dcfce7', color: '#15803d', label: 'Completed' };
      case 'VERIFIED':
        return { bg: '#d1fae5', color: '#047857', label: 'Verified & Closed' };
      case 'REOPENED':
        return { bg: '#fce7f3', color: '#be185d', label: 'Reopened' };
      default:
        return { bg: '#f1f5f9', color: '#475569', label: s };
    }
  };

  const { bg, color, label } = getStatusStyles(status);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '700',
      backgroundColor: bg,
      color: color,
      border: `1px solid ${color}20`
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: color,
        marginRight: '6px',
        display: 'inline-block'
      }} />
      {label}
    </span>
  );
}
