import React from 'react';

export default function PipelineStatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'ACTIVE':
        return { backgroundColor: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.3)' };
      case 'UNDER_MAINTENANCE':
        return { backgroundColor: 'rgba(241, 196, 15, 0.15)', color: '#f1c40f', border: '1px solid rgba(241, 196, 15, 0.3)' };
      case 'DAMAGED':
        return { backgroundColor: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.3)' };
      case 'OUT_OF_SERVICE':
        return { backgroundColor: 'rgba(149, 165, 166, 0.15)', color: '#95a5a6', border: '1px solid rgba(149, 165, 166, 0.3)' };
      case 'REPLACED':
        return { backgroundColor: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6', border: '1px solid rgba(155, 89, 182, 0.3)' };
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
