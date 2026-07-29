import React from 'react';

export function StatusBadge({ status }) {
  const styles = {
    PENDING: { bg: '#fee2e2', color: '#b91c1c', label: 'Pending' },
    NEW: { bg: '#fee2e2', color: '#b91c1c', label: 'Pending' },
    ACCEPTED: { bg: '#e0f2fe', color: '#0369a1', label: 'Accepted' },
    ASSIGNED: { bg: '#e0f2fe', color: '#0369a1', label: 'Assigned' },
    WORKER_ASSIGNED: { bg: '#e0f2fe', color: '#0369a1', label: 'Assigned' },
    IN_PROGRESS: { bg: '#fef3c7', color: '#b45309', label: 'In Progress' },
    COMPLETED: { bg: '#d1fae5', color: '#047857', label: 'Completed' },
    RESOLVED: { bg: '#d1fae5', color: '#047857', label: 'Completed' },
    VERIFIED: { bg: '#d1fae5', color: '#047857', label: 'Verified' },
    CLOSED: { bg: '#e2e8f0', color: '#334155', label: 'Closed' },
    REJECTED: { bg: '#f1f5f9', color: '#475569', label: 'Rejected' }
  };

  const current = styles[status] || styles.PENDING;

  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: '700',
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      backgroundColor: current.bg,
      color: current.color,
      display: 'inline-block',
      whiteSpace: 'nowrap'
    }}>
      {current.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const styles = {
    LOW: { bg: '#f1f5f9', color: '#475569', label: 'Low' },
    MEDIUM: { bg: '#e0f2fe', color: '#0284c7', label: 'Medium' },
    HIGH: { bg: '#fef3c7', color: '#b45309', label: 'High' },
    CRITICAL: { bg: '#fee2e2', color: '#b91c1c', label: 'Critical' }
  };

  const current = styles[priority] || styles.MEDIUM;

  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: '700',
      padding: '0.2rem 0.6rem',
      borderRadius: '20px',
      backgroundColor: current.bg,
      color: current.color,
      display: 'inline-block',
      whiteSpace: 'nowrap'
    }}>
      {current.label}
    </span>
  );
}
