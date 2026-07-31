import React from 'react';

export default function MaintenanceCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="water-card" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.25rem',
      flex: '1 1 180px',
      borderLeft: `5px solid ${color || 'var(--water-primary-light)'}`,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--water-text-muted)', letterSpacing: '0.5px' }}>
          {title}
        </span>
        <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--water-text)', lineHeight: '1.1' }}>
          {value}
        </span>
        {subtitle && (
          <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)' }}>
            {subtitle}
          </span>
        )}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '45px',
        height: '45px',
        borderRadius: '50px',
        backgroundColor: `${color}1A`, // 10% opacity
        color: color
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.6rem' }}>
          {icon || 'build'}
        </span>
      </div>
    </div>
  );
}
