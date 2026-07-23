import React from 'react';

export default function TankStatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return { backgroundColor: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.3)' };
      case 'INACTIVE':
        return { backgroundColor: 'rgba(149, 165, 166, 0.15)', color: '#95a5a6', border: '1px solid rgba(149, 165, 166, 0.3)' };
      case 'UNDER_MAINTENANCE':
        return { backgroundColor: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f', border: '1px solid rgba(241, 196, 15, 0.3)' };
      case 'EMPTY':
        return { backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '2px solid rgba(231, 76, 60, 0.4)' };
      case 'FULL':
        return { backgroundColor: 'rgba(41, 128, 185, 0.25)', color: '#2980b9', border: '1px solid rgba(41, 128, 185, 0.4)' };
      case 'LOW_LEVEL':
        return { backgroundColor: 'rgba(230, 126, 34, 0.25)', color: '#e67e22', border: '1px solid rgba(230, 126, 34, 0.4)' };
      default:
        return { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.3)' };
    }
  };

  const getLabel = () => {
    if (!status) return 'UNKNOWN';
    return status.replace(/_/g, ' ');
  };

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.25rem 0.6rem',
      borderRadius: '50px',
      fontSize: '0.75rem',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      ...getBadgeStyle()
    }}>
      {getLabel()}
    </span>
  );
}
