import React from 'react';
import TankStatusBadge from './TankStatusBadge';

export default function TankTable({ 
  tanks, 
  onView, 
  onEdit, 
  onUpdateLevel, 
  onRefill, 
  onMaintenance, 
  onDelete 
}) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid var(--water-border)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--water-bg-light)', borderBottom: '2px solid var(--water-border)' }}>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Tank Number</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Name</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Type</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Zone / Ward</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Capacity</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Current Level</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Source</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Status</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)' }}>Last Cleaned</th>
            <th style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary)', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tanks.length === 0 ? (
            <tr>
              <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--water-text-muted)', fontWeight: '500' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem', color: 'var(--water-border)' }}>
                  propane_tank
                </span>
                No water tanks registered.
              </td>
            </tr>
          ) : (
            tanks.map((t) => {
              const fillPercent = ((t.current_level_liters / t.capacity_liters) * 100).toFixed(0);

              return (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--water-border)' }} className="hover-row">
                  <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--water-primary-light)' }}>
                    {t.tank_number}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>
                    {t.tank_name || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {t.tank_type.replace(/_/g, ' ')}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div>{t.zone || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--water-text-muted)' }}>{t.ward}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: '500' }}>
                    {t.capacity_liters.toLocaleString()} L
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '700', color: t.status === 'LOW_LEVEL' || t.status === 'EMPTY' ? 'var(--water-danger)' : 'var(--water-text)' }}>
                      {t.current_level_liters.toLocaleString()} L
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--water-text-muted)' }}>
                      {fillPercent}% Filled
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {t.water_source || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <TankStatusBadge status={t.status} />
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--water-text-muted)' }}>
                    {t.last_cleaned_date || 'Never'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                      <button 
                        onClick={() => onView(t.id)}
                        className="water-btn-icon" 
                        title="View details"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary-light)', padding: '0.2rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>visibility</span>
                      </button>
                      <button 
                        onClick={() => onEdit(t.id)}
                        className="water-btn-icon" 
                        title="Modify Tank"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary)', padding: '0.2rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                      </button>
                      <button 
                        onClick={() => onUpdateLevel(t)}
                        className="water-btn-icon" 
                        title="Quick Level Update"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-primary-light)', padding: '0.2rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>opacity</span>
                      </button>
                      <button 
                        onClick={() => onRefill(t.id)}
                        className="water-btn-icon" 
                        title="Record Refill"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-success)', padding: '0.2rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>local_shipping</span>
                      </button>
                      <button 
                        onClick={() => onMaintenance(t.id)}
                        className="water-btn-icon" 
                        title="Schedule Maintenance"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-warning)', padding: '0.2rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>build</span>
                      </button>
                      <button 
                        onClick={() => onDelete(t.id)}
                        className="water-btn-icon" 
                        title="Delete Tank"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--water-danger)', padding: '0.2rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
