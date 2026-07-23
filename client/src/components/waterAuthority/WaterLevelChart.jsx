import React from 'react';

export default function WaterLevelChart({ tanks = [], refills = [] }) {
  // If tanks are passed, draw a bar chart comparing capacity and current levels
  if (tanks.length > 0) {
    // Take top 6 tanks for display size
    const data = tanks.slice(0, 6);
    const maxVal = Math.max(...data.map(t => t.capacity_liters), 1);

    return (
      <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', minHeight: '260px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
          Tank Volumes Comparison (Liters)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {data.map(t => {
            const fillPercent = (t.current_level_liters / t.capacity_liters) * 100;
            const barWidth = (t.capacity_liters / maxVal) * 100;

            return (
              <div key={t.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700', color: 'var(--water-text)' }}>
                  <span>{t.tank_number} ({t.tank_name || 'Unnamed'})</span>
                  <span>{t.current_level_liters.toLocaleString()} / {t.capacity_liters.toLocaleString()} L</span>
                </div>
                
                {/* Horizontal comparative progress tracks */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '14px',
                  backgroundColor: 'var(--water-bg-light)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  border: '1px solid var(--water-border)'
                }}>
                  {/* Total Capacity outline */}
                  <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    backgroundColor: 'rgba(52, 152, 219, 0.12)',
                    position: 'absolute',
                    left: 0,
                    top: 0
                  }} />

                  {/* Water Fill amount */}
                  <div style={{
                    width: `${(barWidth * fillPercent) / 100}%`,
                    height: '100%',
                    backgroundColor: t.status === 'LOW_LEVEL' || t.status === 'EMPTY' ? '#e67e22' : 'var(--water-primary-light)',
                    borderRadius: '4px 0 0 4px',
                    transition: 'width 1s ease-in-out',
                    position: 'absolute',
                    left: 0,
                    top: 0
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // If refills are passed, draw a simple area chart showing refilled amounts over dates
  if (refills.length > 0) {
    const data = refills.slice().reverse().slice(-7); // last 7 refills
    const maxAmount = Math.max(...data.map(r => r.refilled_amount), 1);

    return (
      <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', minHeight: '260px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
          Refill Volume Operations (Liters)
        </h3>

        <div style={{ display: 'flex', alignItems: 'flex-end', height: '140px', gap: '1rem', padding: '1rem 0.5rem 0 0.5rem', marginTop: '1rem', position: 'relative' }}>
          {data.map((r, index) => {
            const barHeight = (r.refilled_amount / maxAmount) * 100;

            return (
              <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '0.5rem' }}>
                {/* Numeric label */}
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--water-primary-light)' }}>
                  {r.refilled_amount.toLocaleString()} L
                </span>

                {/* Bar */}
                <div style={{
                  width: '100%',
                  height: `${barHeight}%`,
                  backgroundColor: 'rgba(52, 152, 219, 0.75)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 1.2s ease-out',
                  position: 'relative'
                }} className="hover-bar" />

                {/* Date label */}
                <span style={{ fontSize: '0.65rem', color: 'var(--water-text-muted)', whiteSpace: 'nowrap' }}>
                  {r.refill_date.substring(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return null;
}
