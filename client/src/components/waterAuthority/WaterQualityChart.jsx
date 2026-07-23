import React from 'react';

export default function WaterQualityChart({ reports = [] }) {
  if (reports.length === 0) return null;

  // Calculate Safe, Warning, Unsafe stats
  const safeCount = reports.filter(r => r.overall_status === 'SAFE').length;
  const warnCount = reports.filter(r => r.overall_status === 'WARNING').length;
  const unsafeCount = reports.filter(r => r.overall_status === 'UNSAFE').length;
  const total = reports.length;

  const safePercent = total > 0 ? (safeCount / total) * 100 : 0;
  const warnPercent = total > 0 ? (warnCount / total) * 100 : 0;
  const unsafePercent = total > 0 ? (unsafeCount / total) * 100 : 0;

  // Take top 6 reports for pH bar comparison
  const phData = reports.slice(0, 6);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
      
      {/* Safe vs Unsafe visual distribution */}
      <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '220px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
          Overall Water Safety Ratios
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', justifyContent: 'center', flex: 1 }}>
          {/* Stacked bar representation */}
          <div style={{
            display: 'flex',
            width: '100%',
            height: '24px',
            borderRadius: '6px',
            overflow: 'hidden',
            border: '1px solid var(--water-border)'
          }}>
            {safePercent > 0 && (
              <div 
                style={{ width: `${safePercent}%`, backgroundColor: '#2ecc71', transition: 'width 1s' }} 
                title={`Safe: ${safeCount}`} 
              />
            )}
            {warnPercent > 0 && (
              <div 
                style={{ width: `${warnPercent}%`, backgroundColor: '#e67e22', transition: 'width 1s' }} 
                title={`Warning: ${warnCount}`} 
              />
            )}
            {unsafePercent > 0 && (
              <div 
                style={{ width: `${unsafePercent}%`, backgroundColor: '#e74c3c', transition: 'width 1s' }} 
                title={`Unsafe: ${unsafeCount}`} 
              />
            )}
          </div>

          {/* Legend detailing values */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50px', backgroundColor: '#2ecc71' }} />
              <span style={{ color: 'var(--water-text)' }}>Safe: {safeCount} ({safePercent.toFixed(0)}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50px', backgroundColor: '#e67e22' }} />
              <span style={{ color: 'var(--water-text)' }}>Warning: {warnCount} ({warnPercent.toFixed(0)}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50px', backgroundColor: '#e74c3c' }} />
              <span style={{ color: 'var(--water-text)' }}>Unsafe: {unsafeCount} ({unsafePercent.toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* pH distribution comparison chart */}
      <div className="water-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '220px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--water-primary)', borderBottom: '1px solid var(--water-border)', paddingBottom: '0.5rem', margin: 0 }}>
          Recent pH Level Distribution
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.25rem' }}>
          {phData.map(r => {
            const widthPercent = (r.ph_level / 14) * 100;
            const isOutRange = r.ph_level < 6.5 || r.ph_level > 8.5;

            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ width: '75px', fontWeight: '700', color: 'var(--water-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.report_number}
                </span>

                {/* pH bar indicator */}
                <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--water-bg-light)', borderRadius: '4px', position: 'relative' }}>
                  {/* Ideal safe pH boundaries guide highlights */}
                  <div style={{
                    position: 'absolute',
                    left: `${(6.5 / 14) * 100}%`,
                    width: `${((8.5 - 6.5) / 14) * 100}%`,
                    height: '100%',
                    backgroundColor: 'rgba(46, 204, 113, 0.12)',
                    zIndex: 1
                  }} />

                  {/* Level marker */}
                  <div style={{
                    width: `${widthPercent}%`,
                    height: '100%',
                    backgroundColor: isOutRange ? '#e67e22' : 'var(--water-primary-light)',
                    borderRadius: '4px',
                    zIndex: 2,
                    position: 'relative'
                  }} />
                </div>

                <span style={{ width: '32px', fontWeight: '800', textAlign: 'right', color: isOutRange ? '#e67e22' : 'var(--water-text)' }}>
                  {r.ph_level.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
