import React from 'react';

export function BinFillLevelIndicator({ level = 0 }) {
  const rounded = Math.min(100, Math.max(0, Math.round(level)));
  
  let color = '#10b981'; // Green for empty/low
  if (rounded >= 95) color = '#ef4444'; // Red for overflow
  else if (rounded >= 80) color = '#f59e0b'; // Amber for full
  else if (rounded >= 40) color = '#06b6d4'; // Cyan for half full

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: '130px' }}>
      <div style={{
        flexGrow: 1,
        height: '10px',
        backgroundColor: '#e2e8f0',
        borderRadius: '5px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${rounded}%`,
          backgroundColor: color,
          borderRadius: '5px',
          transition: 'width 0.4s ease'
        }} />
      </div>
      <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0f172a', width: '36px', textAlign: 'right' }}>
        {rounded}%
      </span>
    </div>
  );
}

export function BinStatusBadge({ status }) {
  const styles = {
    Empty: { bg: '#ecfdf5', color: '#047857', label: 'Empty' },
    'Half Full': { bg: '#ecfeff', color: '#0e7490', label: 'Half Full' },
    Full: { bg: '#fffbeb', color: '#b45309', label: 'Full' },
    Overflow: { bg: '#fef2f2', color: '#b91c1c', label: 'Overflow' },
    Damaged: { bg: '#f1f5f9', color: '#475569', label: 'Damaged' },
    Maintenance: { bg: '#f3e8ff', color: '#6b21a8', label: 'Maintenance' },
    ACTIVE: { bg: '#ecfdf5', color: '#047857', label: 'Active' }
  };

  const current = styles[status] || styles.Empty;

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

export function BinTypeBadge({ type }) {
  const styles = {
    General: { bg: '#f1f5f9', color: '#334155' },
    Organic: { bg: '#ecfdf5', color: '#047857' },
    Plastic: { bg: '#eff6ff', color: '#1d4ed8' },
    Glass: { bg: '#ecfeff', color: '#0e7490' },
    Metal: { bg: '#fef3c7', color: '#b45309' },
    Electronic: { bg: '#faf5ff', color: '#6b21a8' }
  };

  const current = styles[type] || styles.General;

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
      {type || 'General'}
    </span>
  );
}
