import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LowLevelAlert({ tanks = [] }) {
  const navigate = useNavigate();

  // Filter low-level and empty tanks
  const criticalTanks = tanks.filter(t => t.status === 'LOW_LEVEL' || t.status === 'EMPTY');

  if (criticalTanks.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      backgroundColor: 'rgba(231, 76, 60, 0.12)',
      border: '1px solid rgba(231, 76, 60, 0.35)',
      borderRadius: '8px',
      padding: '1rem',
      color: '#c0392b'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '0.9rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '1.4rem', animation: 'pulse 1.5s infinite' }}>alarm</span>
        <span>CRITICAL: {criticalTanks.length} Water Tanks Require Refilling!</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '0.75rem',
        marginTop: '0.25rem'
      }}>
        {criticalTanks.map(t => {
          const percent = ((t.current_level_liters / t.capacity_liters) * 100).toFixed(0);

          return (
            <div key={t.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(231, 76, 60, 0.2)',
              borderRadius: '6px',
              padding: '0.5rem 0.75rem',
              fontSize: '0.8rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div>
                <strong style={{ color: 'var(--water-text)' }}>{t.tank_number}</strong>
                <span style={{ margin: '0 0.5rem', color: 'var(--water-text-muted)' }}>|</span>
                <span style={{ fontWeight: '700', color: t.status === 'EMPTY' ? '#c0392b' : '#e67e22' }}>
                  {percent}% Filled ({t.current_level_liters.toLocaleString()} L)
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button
                  onClick={() => navigate(`/water/tanks/${t.id}`)}
                  style={{
                    backgroundColor: 'none',
                    border: '1px solid var(--water-border)',
                    color: 'var(--water-primary-light)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Details
                </button>
                <button
                  onClick={() => navigate(`/water/tanks/${t.id}/refill`)}
                  style={{
                    backgroundColor: '#c0392b',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Refill
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
