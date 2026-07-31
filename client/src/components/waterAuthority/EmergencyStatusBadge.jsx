import React from 'react';

export default function EmergencyStatusBadge({ status }) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'DECLARED':
        return { backgroundColor: 'rgba(231, 76, 60, 0.15)', color: '#e74c3c', border: '1px solid rgba(231, 76, 60, 0.3)' };
      case 'IN_PROGRESS':
        return { backgroundColor: 'rgba(241, 196, 15, 0.15)', color: '#f39c12', border: '1px solid rgba(241, 196, 15, 0.3)' };
      case 'SUPPLY_STOPPED':
        return { backgroundColor: 'rgba(155, 89, 182, 0.15)', color: '#9b59b6', border: '1px solid rgba(155, 89, 182, 0.3)' };
      case 'REPAIRING':
        return { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.3)' };
      case 'TESTING':
        return { backgroundColor: 'rgba(149, 165, 166, 0.15)', color: '#95a5a6', border: '1px solid rgba(149, 165, 166, 0.3)' };
      case 'RESTORED':
        return { backgroundColor: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.3)' };
      case 'CLOSED':
        return { backgroundColor: 'rgba(39, 174, 96, 0.2)', color: '#27ae60', border: '2px solid rgba(39, 174, 96, 0.4)' };
      default:
        return { backgroundColor: 'rgba(52, 152, 219, 0.15)', color: '#3498db', border: '1px solid rgba(52, 152, 219, 0.3)' };
    }
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
      {status ? status.replace(/_/g, ' ') : 'DECLARED'}
    </span>
  );
}
