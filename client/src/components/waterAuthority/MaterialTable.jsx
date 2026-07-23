import React from 'react';

export default function MaterialTable({ materials = [] }) {
  const getSumCost = () => {
    return materials.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Material Name</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Quantity</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Unit</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Unit Cost</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Supplier</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'right' }}>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {materials.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)' }}>
                  No materials recorded for this job.
                </td>
              </tr>
            ) : (
              materials.map((m) => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--water-border)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>
                    {m.material_name}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>
                    {m.quantity}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                    {m.unit}
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    ${m.cost.toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                    {m.supplier || 'N/A'}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: '800', color: 'var(--water-primary-light)', textAlign: 'right' }}>
                    ${(m.cost * m.quantity).toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {materials.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0.5rem 1rem', fontSize: '0.9rem', fontWeight: '800', color: 'var(--water-text)' }}>
          Total Materials Expense: <span style={{ color: '#e74c3c', marginLeft: '0.5rem' }}>${getSumCost().toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
