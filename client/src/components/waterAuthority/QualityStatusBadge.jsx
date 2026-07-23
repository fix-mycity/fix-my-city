import React from 'react';

export default function QualityStatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'SAFE':
        return { backgroundColor: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.3)' };
      case 'WARNING':
        return { backgroundColor: 'rgba(230, 126, 34, 0.15)', color: '#e67e22', border: '1px solid rgba(230, 126, 34, 0.3)' };
      case 'UNSAFE':
        return { backgroundColor: 'rgba(231, 76, 60, 0.2)', color: '#e74c3c', border: '2px solid rgba(231, 76, 60, 0.4)' };
      case 'UNDER_REVIEW':
        return { backgroundColor: 'rgba(149, 165, 166, 0.15)', color: '#95a5a6', border: '1px solid rgba(149, 165, 166, 0.3)' };
      default:
        return { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.3)' };
    }
  };

  const getLabel = () => {
    if (!status) return 'UNDER REVIEW';
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
