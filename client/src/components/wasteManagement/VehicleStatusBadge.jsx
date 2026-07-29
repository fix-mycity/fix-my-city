import React from 'react';

export function VehicleStatusBadge({ status }) {
  const styles = {
    Available: { bg: '#ecfdf5', color: '#047857', label: 'Available' },
    ACTIVE: { bg: '#ecfdf5', color: '#047857', label: 'Available' },
    'On Route': { bg: '#e0f2fe', color: '#0369a1', label: 'On Route' },
    IN_SERVICE: { bg: '#e0f2fe', color: '#0369a1', label: 'On Route' },
    Maintenance: { bg: '#fffbeb', color: '#b45309', label: 'Maintenance' },
    MAINTENANCE: { bg: '#fffbeb', color: '#b45309', label: 'Maintenance' },
    Breakdown: { bg: '#fef2f2', color: '#b91c1c', label: 'Breakdown' },
    OUT_OF_SERVICE: { bg: '#fef2f2', color: '#b91c1c', label: 'Out of Service' }
  };

  const current = styles[status] || styles.Available;

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

export function VehicleTypeBadge({ type }) {
  const styles = {
    Compactor: { bg: '#f1f5f9', color: '#334155' },
    'Mini Truck': { bg: '#ecfdf5', color: '#047857' },
    Tipper: { bg: '#eff6ff', color: '#1d4ed8' },
    Loader: { bg: '#fef3c7', color: '#b45309' }
  };

  const current = styles[type] || styles.Compactor;

  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: '600',
      padding: '0.15rem 0.5rem',
      borderRadius: '6px',
      backgroundColor: current.bg,
      color: current.color,
      display: 'inline-block'
    }}>
      {type || 'Compactor'}
    </span>
  );
}
