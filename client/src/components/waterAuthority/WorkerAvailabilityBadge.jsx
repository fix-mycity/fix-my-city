import React from 'react';

export function formatTimeAgo(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return null;

  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function WorkerAvailabilityBadge({ availability, statusUpdatedAt }) {
  const timeAgo = formatTimeAgo(statusUpdatedAt);

  const getAvailabilityStyles = (availability) => {
    switch (availability) {
      case 'AVAILABLE':
        return { bg: 'rgba(16, 185, 129, 0.1)', color: '#059669', border: '1px solid rgba(16, 185, 129, 0.2)', dot: '#10b981', label: 'Available' };
      case 'ON_BREAK':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.3)', dot: '#f59e0b', label: 'On Break' };
      case 'BUSY':
        return { bg: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', border: '1px solid rgba(59, 130, 246, 0.2)', dot: '#3b82f6', label: 'Busy on Job' };
      case 'ON_LEAVE':
        return { bg: 'rgba(244, 63, 94, 0.1)', color: '#e11d48', border: '1px solid rgba(244, 63, 94, 0.2)', dot: '#f43f5e', label: 'On Leave' };
      case 'OFFLINE':
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: '1px solid rgba(100, 116, 139, 0.2)', dot: '#64748b', label: availability || 'Unavailable' };
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
      {styles.label}
      {timeAgo && <span style={{ opacity: 0.8, fontSize: '0.7rem', fontWeight: '500', marginLeft: '2px' }}>({timeAgo})</span>}
    </span>
  );
}
