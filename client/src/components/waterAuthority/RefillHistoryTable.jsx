import React from 'react';

export default function RefillHistoryTable({ refills }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Refill Date</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Operator Name</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Previous Level</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Amount Refilled</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>New Level</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Source</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {refills.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)' }}>
                No refills recorded for this tank.
              </td>
            </tr>
          ) : (
            refills.map((r) => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--water-border)' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>
                  {r.refill_date}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {r.operator_name || 'N/A'}
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {r.previous_level.toLocaleString()} L
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--water-primary-light)', fontWeight: '700' }}>
                  +{r.refilled_amount.toLocaleString()} L
                </td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-success)' }}>
                  {r.current_level.toLocaleString()} L
                </td>
                <td style={{ padding: '0.75rem 1rem' }}>
                  {r.water_source || 'N/A'}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                  {r.remarks || 'None'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
