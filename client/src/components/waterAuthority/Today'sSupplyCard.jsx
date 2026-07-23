import React from 'react';

export default function TodaysSupplyCard({ todaySchedules = [] }) {
  const total = todaySchedules.length;
  const active = todaySchedules.filter(s => s.status === 'ACTIVE').length;
  const paused = todaySchedules.filter(s => s.status === 'PAUSED').length;
  const completed = todaySchedules.filter(s => s.status === 'COMPLETED').length;
  const emergency = todaySchedules.filter(s => s.supply_type === 'EMERGENCY').length;

  return (
    <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div className="water-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="water-card-title" style={{ fontWeight: '800', color: 'var(--water-text)' }}>Today's Water Supply</span>
        <div className="water-card-icon-container blue" style={{
          backgroundColor: 'var(--water-primary-subtle)',
          color: 'var(--water-primary-light)',
          padding: '0.4rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span className="water-card-icon material-symbols-outlined">water_drop</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--water-text)' }}>
            {total}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>
            Schedules Logged Today
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          backgroundColor: 'var(--water-bg)',
          padding: '0.75rem',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>ACTIVE / PAUSED</span>
            <span style={{ fontSize: '0.9rem', color: '#1e3a8a', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.95rem', color: 'var(--water-success)' }}>radio_button_checked</span>
              {active} <span style={{ color: 'var(--water-text-muted)', fontWeight: '400', fontSize: '0.75rem' }}>/</span> 
              <span className="material-symbols-outlined" style={{ fontSize: '0.95rem', color: 'var(--water-warning)' }}>pause_circle</span>
              {paused}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>COMPLETED</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--water-success)', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '0.95rem' }}>check_circle</span>
              {completed}
            </span>
          </div>
        </div>

        {emergency > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            backgroundColor: 'var(--water-danger-subtle)',
            color: 'var(--water-danger)',
            padding: '0.5rem',
            borderRadius: '6px',
            fontSize: '0.75rem',
            fontWeight: '700'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>warning</span>
            {emergency} Emergency shutdown / interruption active
          </div>
        )}
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--water-border)', paddingTop: '0.75rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>update</span>
          Real-time municipal supply metrics
        </span>
      </div>
    </div>
  );
}
