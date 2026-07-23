import React from 'react';

export default function UpcomingSupplyCard({ upcomingSchedules = [] }) {
  const total = upcomingSchedules.length;
  const regular = upcomingSchedules.filter(s => s.supply_type === 'REGULAR').length;
  const special = upcomingSchedules.filter(s => s.supply_type === 'SPECIAL').length;
  const emergency = upcomingSchedules.filter(s => s.supply_type === 'EMERGENCY').length;

  return (
    <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
      <div className="water-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="water-card-title" style={{ fontWeight: '800', color: 'var(--water-text)' }}>Upcoming Water Supply</span>
        <div className="water-card-icon-container teal" style={{
          backgroundColor: 'var(--water-info-subtle)',
          color: 'var(--water-info)',
          padding: '0.4rem',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span className="water-card-icon material-symbols-outlined">schedule</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--water-text)' }}>
            {total}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--water-text-muted)', fontWeight: '600' }}>
            Future Slots Scheduled
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '0.4rem',
          backgroundColor: 'var(--water-bg)',
          padding: '0.75rem',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>REGULAR</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--water-primary-light)', fontWeight: '800' }}>{regular}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>SPECIAL</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--water-info)', fontWeight: '800' }}>{special}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)', fontWeight: '700' }}>URGENT</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--water-danger)', fontWeight: '800' }}>{emergency}</span>
          </div>
        </div>

        {total > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', maxHeight: '70px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {upcomingSchedules.slice(0, 2).map((s, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--water-text)', fontWeight: '600' }}>{s.ward} - {s.area}</span>
                <span style={{ color: 'var(--water-text-muted)' }}>{s.supply_date}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)', fontStyle: 'italic' }}>
            No upcoming schedules registered.
          </p>
        )}
      </div>

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--water-border)', paddingTop: '0.75rem' }}>
        <span style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>event</span>
          Upcoming 7-day municipal schedule
        </span>
      </div>
    </div>
  );
}
