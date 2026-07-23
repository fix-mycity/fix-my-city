import React from 'react';

export default function QualityAlertCard({ alert, onResolve }) {
  const getSeverityStyle = () => {
    switch (alert.severity) {
      case 'CRITICAL':
        return { color: '#c0392b', borderLeft: '5px solid #c0392b', bg: 'rgba(231, 76, 60, 0.08)' };
      case 'HIGH':
        return { color: '#e67e22', borderLeft: '5px solid #e67e22', bg: 'rgba(230, 126, 34, 0.08)' };
      case 'MEDIUM':
        return { color: '#f1c40f', borderLeft: '5px solid #f1c40f', bg: 'rgba(241, 196, 15, 0.08)' };
      default:
        return { color: '#2980b9', borderLeft: '5px solid #2980b9', bg: 'rgba(41, 128, 185, 0.08)' };
    }
  };

  const style = getSeverityStyle();

  return (
    <div className="water-card" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      backgroundColor: style.bg,
      borderLeft: style.borderLeft,
      padding: '1rem',
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '900',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: style.color,
              color: '#ffffff'
            }}>
              {alert.severity}
            </span>
            <strong style={{ fontSize: '0.9rem', color: 'var(--water-text)' }}>
              {alert.title}
            </strong>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', display: 'block', marginTop: '0.15rem' }}>
            Report: <strong style={{ color: 'var(--water-primary-light)' }}>{alert.report_number || `#${alert.quality_report_id}`}</strong>
            <span style={{ margin: '0 0.4rem' }}>•</span>
            Logged: {new Date(alert.created_at).toLocaleString()}
          </span>
        </div>

        {alert.status === 'ACTIVE' && onResolve && (
          <button
            onClick={() => onResolve(alert.id)}
            className="water-btn"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.72rem',
              fontWeight: '700',
              borderColor: style.color,
              color: style.color,
              backgroundColor: '#ffffff'
            }}
          >
            Mark Resolved
          </button>
        )}
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', margin: 0, lineHeight: '1.4' }}>
        {alert.description}
      </p>
    </div>
  );
}
