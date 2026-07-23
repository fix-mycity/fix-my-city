import React from 'react';

export default function ResponseTeamTable({ team = [] }) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Worker Name</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Role</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Specialty</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
            <th style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Assigned Time</th>
          </tr>
        </thead>
        <tbody>
          {team.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--water-text-muted)' }}>
                No crew members assigned to this response team yet.
              </td>
            </tr>
          ) : (
            team.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--water-border)' }}>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '700', color: 'var(--water-text)' }}>
                  {t.worker_name}
                </td>
                <td style={{ padding: '0.75rem 1rem', fontWeight: '600' }}>
                  {t.role}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                  {t.worker_skill}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--water-primary-light)', fontWeight: '700' }}>
                  {t.status}
                </td>
                <td style={{ padding: '0.75rem 1rem', color: 'var(--water-text-muted)' }}>
                  {new Date(t.assigned_at).toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
