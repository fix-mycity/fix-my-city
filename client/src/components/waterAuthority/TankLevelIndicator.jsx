import React from 'react';

export default function TankLevelIndicator({ currentLevel, capacity, minLevel, status }) {
  const percentage = capacity > 0 ? Math.min((currentLevel / capacity) * 100, 100) : 0;
  const remaining = Math.max(capacity - currentLevel, 0);

  // Trigger conditions for low level alert
  const isLow = status === 'LOW_LEVEL' || status === 'EMPTY' || (minLevel ? currentLevel <= minLevel : percentage <= 20);

  const getLiquidColor = () => {
    if (status === 'EMPTY') return '#c0392b';
    if (isLow) return '#e67e22';
    if (status === 'FULL') return '#1b4f72';
    return 'var(--water-primary-light)';
  };

  return (
    <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
        Water Level Status
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Visual Tank Indicator */}
        <div style={{
          position: 'relative',
          width: '90px',
          height: '140px',
          border: '4px solid #2c3e50',
          borderRadius: '12px 12px 18px 18px',
          backgroundColor: '#f8f9fa',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column-reverse',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
        }}>
          {/* Liquid filling */}
          <div style={{
            height: `${percentage}%`,
            width: '100%',
            backgroundColor: getLiquidColor(),
            transition: 'height 1s ease-in-out, background-color 0.5s',
            position: 'relative',
            opacity: 0.85
          }}>
            {/* Wave animation simulation */}
            <div style={{
              position: 'absolute',
              top: '-5px',
              left: 0,
              right: 0,
              height: '10px',
              backgroundImage: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 70%)',
              backgroundSize: '20px 10px',
              animation: 'wave 2s linear infinite'
            }} />
          </div>

          {/* Percentage Overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontWeight: '900',
            fontSize: '1.1rem',
            color: percentage > 50 ? '#ffffff' : '#2c3e50',
            textShadow: percentage > 50 ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none',
            zIndex: 3
          }}>
            {percentage.toFixed(0)}%
          </div>
        </div>

        {/* Level text description details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Current Volume</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--water-text)' }}>
              {currentLevel.toLocaleString()} Liters
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Total Capacity</span>
            <span style={{ fontWeight: '700', color: 'var(--water-text)' }}>
              {capacity.toLocaleString()} Liters
            </span>
          </div>

          <div>
            <span style={{ color: 'var(--water-text-muted)', display: 'block' }}>Remaining Space</span>
            <span style={{ fontWeight: '700', color: 'var(--water-text-muted)' }}>
              {remaining.toLocaleString()} Liters
            </span>
          </div>
        </div>
      </div>

      {/* Low Water Warning Banner */}
      {isLow && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'rgba(231, 76, 60, 0.12)',
          border: '1px solid rgba(231, 76, 60, 0.3)',
          color: '#c0392b',
          padding: '0.6rem 0.8rem',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: '700'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>warning</span>
          <span>
            {status === 'EMPTY' 
              ? 'TANK CRITICALLY EMPTY: Immediate refill dispatch required!' 
              : `LOW LEVEL WARNING: Level fell below threshold of ${minLevel ? minLevel.toLocaleString() : (capacity * 0.2).toLocaleString()} Liters (20%).`}
          </span>
        </div>
      )}
    </div>
  );
}
