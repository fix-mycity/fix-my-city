import React from 'react';

export default function ParameterCard({ name, value, unit, minSafe, maxSafe, warningThreshold }) {
  const numValue = parseFloat(value);
  const hasValue = value !== undefined && value !== null;

  // Determine state
  const getState = () => {
    if (!hasValue) return { label: 'N/A', color: 'var(--water-text-muted)', bg: '#f8f9fa' };
    
    if (minSafe !== undefined && maxSafe !== undefined) {
      if (numValue < minSafe || numValue > maxSafe) {
        return { label: 'CRITICAL', color: '#c0392b', bg: 'rgba(231, 76, 60, 0.15)' };
      }
      if (warningThreshold) {
        const lowerWarning = minSafe + warningThreshold;
        const upperWarning = maxSafe - warningThreshold;
        if (numValue < lowerWarning || numValue > upperWarning) {
          return { label: 'WARNING', color: '#e67e22', bg: 'rgba(230, 126, 34, 0.15)' };
        }
      }
    } else if (maxSafe !== undefined) {
      if (numValue > maxSafe) {
        return { label: 'CRITICAL', color: '#c0392b', bg: 'rgba(231, 76, 60, 0.15)' };
      }
      if (warningThreshold && numValue > (maxSafe - warningThreshold)) {
        return { label: 'WARNING', color: '#e67e22', bg: 'rgba(230, 126, 34, 0.15)' };
      }
    }
    return { label: 'IDEAL', color: '#2ecc71', bg: 'rgba(46, 204, 113, 0.15)' };
  };

  const status = getState();

  // Draw simple visual progress indicator relative to maximum limit
  const getProgressWidth = () => {
    if (!hasValue) return 0;
    const maxReference = maxSafe ? maxSafe * 1.5 : 100;
    return Math.min((numValue / maxReference) * 100, 100);
  };

  return (
    <div className="water-card" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '1rem',
      flex: '1 1 140px',
      border: '1px solid var(--water-border)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--water-text-muted)', textTransform: 'uppercase' }}>
          {name}
        </span>
        <span style={{
          fontSize: '0.65rem',
          fontWeight: '900',
          padding: '0.15rem 0.4rem',
          borderRadius: '4px',
          backgroundColor: status.bg,
          color: status.color
        }}>
          {status.label}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.2rem', marginTop: '0.25rem' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--water-text)' }}>
          {hasValue ? numValue.toFixed(2) : '--'}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>
          {unit}
        </span>
      </div>

      {/* Progress track */}
      {hasValue && (
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: 'var(--water-bg-light)',
          borderRadius: '4px',
          overflow: 'hidden',
          marginTop: '0.25rem'
        }}>
          <div style={{
            width: `${getProgressWidth()}%`,
            height: '100%',
            backgroundColor: status.color,
            borderRadius: '4px',
            transition: 'width 0.8s ease-out'
          }} />
        </div>
      )}

      {/* Constraints info text */}
      <div style={{ fontSize: '0.68rem', color: 'var(--water-text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Standard:</span>
        <span>
          {minSafe !== undefined ? `${minSafe} - ` : ''}
          {maxSafe !== undefined ? `${maxSafe} ` : ''}
          {unit}
        </span>
      </div>
    </div>
  );
}
