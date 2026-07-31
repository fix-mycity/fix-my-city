import React from 'react';

export default function AffectedAreaTable({ areas = [] }) {
  const getSumPopulation = () => {
    return areas.reduce((sum, item) => sum + item.population, 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Zone</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Ward</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Area / Street</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'right' }}>Est. Population</th>
            </tr>
          </thead>
          <tbody>
            {areas.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)' }}>
                  No specific affected areas logged for this shutdown.
                </td>
              </tr>
            ) : (
              areas.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--water-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                    {a.zone || '--'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>
                    {a.ward}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    {a.area}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: 'var(--water-primary-light)', textAlign: 'right' }}>
                    {a.population.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {areas.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: '800', color: 'var(--water-text)' }}>
          Total Citizens Impacted: <span style={{ color: '#e74c3c', marginLeft: '0.5rem' }}>{getSumPopulation().toLocaleString()} citizens</span>
        </div>
      )}
    </div>
  );
}
