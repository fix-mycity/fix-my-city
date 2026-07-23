import React from 'react';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['PENDING', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'VERIFIED', 'CANCELLED'];
const TYPES = ['PIPELINE_REPAIR', 'TANK_CLEANING', 'TANK_REPAIR', 'VALVE_REPLACEMENT', 'PUMP_REPAIR', 'LEAK_REPAIR', 'QUALITY_INSPECTION', 'EMERGENCY_REPAIR', 'GENERAL_MAINTENANCE'];
const SOURCES = ['COMPLAINT', 'PIPELINE', 'TANK', 'QUALITY', 'EMERGENCY', 'MANUAL'];

export default function MaintenanceFilter({ filters, onChange, onClear }) {
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
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Priority</label>
        <select 
          name="priority"
          value={filters.priority || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => (
            <option key={p} value={p}>{p}</option>
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
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Type</label>
        <select 
          name="maintenance_type"
          value={filters.maintenance_type || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Types</option>
          {TYPES.map(t => (
            <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
          ))}
        </select>
      </div>

      <div style={{ flex: '1 1 140px' }}>
        <label className="water-label" style={{ marginBottom: '0.25rem' }}>Source</label>
        <select 
          name="source_type"
          value={filters.source_type || ''}
          onChange={handleSelectChange}
          className="water-input"
          style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }}
        >
          <option value="">All Sources</option>
          {SOURCES.map(src => (
            <option key={src} value={src}>{src}</option>
          ))}
        </select>
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
