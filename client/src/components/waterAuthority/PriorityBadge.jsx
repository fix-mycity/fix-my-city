import React from 'react';

export default function PriorityBadge({ priority }) {
  const getBadgeStyle = () => {
    switch (priority) {
      case 'LOW':
        return { backgroundColor: 'rgba(189, 195, 199, 0.15)', color: '#7f8c8d', border: '1px solid rgba(189, 195, 199, 0.3)' };
      case 'MEDIUM':
        return { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#2980b9', border: '1px solid rgba(52, 152, 219, 0.3)' };
      case 'HIGH':
        return { backgroundColor: 'rgba(230, 126, 34, 0.15)', color: '#d35400', border: '1px solid rgba(230, 126, 34, 0.3)' };
      case 'CRITICAL':
        return { backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#c0392b', border: '2px solid rgba(231, 76, 60, 0.4)' };
      default:
        return { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#2980b9', border: '1px solid rgba(52, 152, 219, 0.3)' };
    }
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      fontSize: '0.72rem',
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      ...getBadgeStyle()
    }}>
      {priority || 'MEDIUM'}
    </span>
  );
}
