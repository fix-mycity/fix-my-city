import React from 'react';

const TANK_TYPES = ['OVERHEAD_TANK', 'UNDERGROUND_TANK', 'RESERVOIR', 'TANKER'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'UNDER_MAINTENANCE', 'EMPTY', 'FULL', 'LOW_LEVEL'];

export default function TankFilter({ filters, onChange, onClear }) {
  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value || null);
  };

  return (
    <div className="water-card" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end', padding: '1rem' }}>
      <div style={{ flex: '1 1 120px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Zone</label>
        <input 
          type="text" 
          name="zone"
          value={filters.zone || ''}
          onChange={(e) => onChange('zone', e.target.value || null)}
          placeholder="Filter Zone"
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        />
      </div>

      <div style={{ flex: '1 1 120px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Ward</label>
        <input 
          type="text" 
          name="ward"
          value={filters.ward || ''}
          onChange={(e) => onChange('ward', e.target.value || null)}
          placeholder="Filter Ward"
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        />
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Tank Type</label>
        <select 
          name="tank_type"
          value={filters.tank_type || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Types</option>
          {TANK_TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Status</label>
        <select 
          name="status"
          value={filters.status || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Water Source</label>
        <input 
          type="text" 
          name="water_source"
          value={filters.water_source || ''}
          onChange={(e) => onChange('water_source', e.target.value || null)}
          placeholder="Filter Source"
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        />
      </div>

      <button 
        type="button" 
        onClick={onClear}
        className="water-btn"
        style={{
          padding: '0.4rem 0.8rem',
          fontSize: '0.8rem',
          borderColor: 'var(--water-border)',
          color: 'var(--water-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          height: '34px'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>filter_alt_off</span>
        Clear
      </button>
    </div>
  );
}
